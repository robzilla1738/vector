#include "AuxBrowserPrivateRoots.h"
#include "base/files/file_path.h"
#include "base/files/file_util.h"
#include "base/path_service.h"
#include "chrome/common/chrome_paths.h"
#include "chrome/common/chrome_paths_internal.h"
#include <array>
#include <cstdlib>
#include <fcntl.h>
#include <limits.h>
#include <mutex>
#include <unistd.h>
namespace aux::peer {
namespace {
const pid_t kProducerProcess = getpid();
struct Captured {
  std::mutex mutex;
  bool attempted = false;
  std::shared_ptr<const BrowserPrivateRoots> roots;
};
Captured& ActualCapture() { static auto* value = new Captured; return *value; }
std::array<base::FilePath, 2> CurrentNativePaths() {
  base::FilePath user_data, cache;
  if (!base::PathService::Get(chrome::DIR_USER_DATA, &user_data) ||
      !user_data.IsAbsolute() || user_data.ReferencesParent()) return {};
  chrome::GetUserCacheDirectory(user_data, &cache);
  if (!cache.IsAbsolute() || cache.ReferencesParent()) return {};
  return {user_data, cache};
}
std::string CanonicalNativePath(const base::FilePath& path) {
  std::array<char, PATH_MAX> resolved{};
  if (path.empty() || !realpath(path.value().c_str(), resolved.data()) ||
      resolved[0] != '/' || std::string(resolved.data()) == "/") return {};
  return resolved.data();
}
bool SameNativeSelection(const std::array<std::string, 2>& paths) {
  if (getpid() != kProducerProcess) return false;
  const auto actual = CurrentNativePaths();
  return CanonicalNativePath(actual[0]) == paths[0] && CanonicalNativePath(actual[1]) == paths[1];
}
}
std::shared_ptr<const BrowserPrivateRoots> CaptureActualChromiumBrowserRoots() {
  if (getpid() != kProducerProcess) return {};
  auto& registry = ActualCapture();
  std::shared_ptr<const BrowserPrivateRoots> roots;
  { std::lock_guard<std::mutex> lock(registry.mutex); roots = registry.roots; }
  return roots && roots->Revalidate() ? roots : nullptr;
}
bool PrepareBrowserPrivateRootsBeforeProfileIO() {
  if (getpid() != kProducerProcess) return false;
  auto& registry = ActualCapture();
  { std::lock_guard<std::mutex> lock(registry.mutex);
    if (registry.attempted) return false;
    registry.attempted = true;
  }
  const auto paths = CurrentNativePaths();
  if (paths[0].empty() || paths[1].empty()) return false;
  // Chromium already selects/creates user-data before BrowserMainParts. Cache
  // can be absent on first start; use its actual native-derived directory only.
  // No directory identity is published until both held FDs and native selection
  // have been revalidated. Existing files/permissions are never reset.
  if (!base::DirectoryExists(paths[0]) || !base::CreateDirectory(paths[1])) return false;
  std::array<int, 2> fds{-1, -1};
  for (size_t i = 0; i < fds.size(); ++i) {
    const auto physical = CanonicalNativePath(paths[i]);
    if (!physical.empty()) fds[i] = open(physical.c_str(), O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK);
  }
  // Constructor is private; this actual native PathService producer and the
  // audited child receiver are the only callers capable of minting this type.
  auto captured = std::shared_ptr<const BrowserPrivateRoots>(new BrowserPrivateRoots(fds, SameNativeSelection));
  if (!captured->Revalidate()) return false;
  { std::lock_guard<std::mutex> lock(registry.mutex); registry.roots = std::move(captured); }
  return true;
}
}
