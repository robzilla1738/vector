#include "AuxBrowserNetworkPaths.h"
#include "AuxBrowserPrivateRoots.h"
#include <array>
#include <cerrno>
#include <cstdlib>
#include <fcntl.h>
#include <limits.h>
#include <string_view>
#include <sys/stat.h>
#include <unistd.h>

namespace aux::peer {
namespace {
// Resolve the nearest existing ancestor without creating a cache directory.
// Only ENOENT permits an absent suffix; permission/loop/non-directory errors
// refuse. Absolute components are validated before asking the filesystem.
std::string ProspectivePhysicalPath(const std::string& path) {
  if (path.empty() || path[0] != '/' || path == "/" ||
      path.find('\0') != std::string::npos) return {};
  size_t position = 1;
  while (position < path.size()) {
    const size_t end = path.find('/', position);
    const auto component = std::string_view(path).substr(
        position, end == std::string::npos ? path.size() - position : end - position);
    if (component.empty() || component == "." || component == "..") return {};
    if (end == std::string::npos) break;
    position = end + 1;
    if (position == path.size()) return {};
  }
  std::string existing = path, suffix;
  std::array<char, PATH_MAX> physical{};
  for (;;) {
    if (realpath(existing.c_str(), physical.data())) {
      struct stat value{};
      // Every admitted target denotes a directory. A file cannot become an
      // implicitly admitted directory on a later retry.
      if (stat(physical.data(), &value) != 0 || !S_ISDIR(value.st_mode)) return {};
      return std::string(physical.data()) + suffix;
    }
    if (errno != ENOENT) return {};
    // A dangling symlink is not an absent directory component.
    struct stat value{};
    if (lstat(existing.c_str(), &value) == 0 || errno != ENOENT) return {};
    const auto slash = existing.rfind('/');
    if (slash == std::string::npos || slash == 0) return {};
    suffix = existing.substr(slash) + suffix;
    existing.resize(slash);
  }
}
bool Within(const std::string& path, const std::string& parent) {
  return path == parent || (path.size() > parent.size() &&
      path.compare(0, parent.size(), parent) == 0 && path[parent.size()] == '/');
}
std::string HeldPhysicalName(int fd) {
  std::array<char, PATH_MAX> path{};
  if (fd < 0 || fcntl(fd, F_GETPATH, path.data()) != 0) return {};
  return ProspectivePhysicalPath(path.data());
}
}
bool CanCreateContainedBrowserNetworkContext(const std::vector<std::string>& paths) {
  const auto roots = CaptureActualChromiumBrowserRoots();
  if (!roots || paths.size() > 6) return false;
  const int data = roots->DuplicateRevalidatedRoot(1);
  const int cache = roots->DuplicateRevalidatedRoot(2);
  const auto data_name = HeldPhysicalName(data), cache_name = HeldPhysicalName(cache);
  if (data >= 0) close(data);
  if (cache >= 0) close(cache);
  if (data_name.empty() || cache_name.empty()) return false;
  for (const auto& path : paths) {
    const auto physical = ProspectivePhysicalPath(path);
    if (physical.empty() || (!Within(physical, data_name) && !Within(physical, cache_name)))
      return false;
  }
  return roots->Revalidate();
}
}
