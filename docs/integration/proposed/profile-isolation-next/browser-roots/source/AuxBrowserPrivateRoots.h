#pragma once
#include <array>
#include <cstdint>
#include <memory>
#include <string>
#include <sys/types.h>
namespace aux::peer {
class AuthenticatedNativeParentConnection;
// A pair of actual held directory identities. No public path/FD constructor.
class BrowserPrivateRoots final {
 public:
  ~BrowserPrivateRoots();
  BrowserPrivateRoots(const BrowserPrivateRoots&) = delete;
  BrowserPrivateRoots& operator=(const BrowserPrivateRoots&) = delete;
  // Finite roles: 1 whole user-data tree, 2 actual Chromium cache tree.
  int DuplicateRevalidatedRoot(uint32_t role) const;
  bool Revalidate() const;
  std::array<uint8_t, 32> PathDigest(uint32_t role) const;
 private:
  using SourceCheck = bool (*)(const std::array<std::string, 2>&);
  BrowserPrivateRoots(std::array<int, 2> roots, SourceCheck check);
  const pid_t process_;
  const std::array<int, 2> roots_;
  const std::array<std::string, 2> paths_;
  const SourceCheck source_check_;
  friend bool PrepareBrowserPrivateRootsBeforeProfileIO();
  friend std::shared_ptr<const BrowserPrivateRoots> CaptureActualChromiumBrowserRoots();
  friend class AuthenticatedNativeParentConnection;
};
// Actual Chromium lifecycle only; no args, ENV or JS-selected path source.
bool PrepareBrowserPrivateRootsBeforeProfileIO();
std::shared_ptr<const BrowserPrivateRoots> CaptureActualChromiumBrowserRoots();
}
