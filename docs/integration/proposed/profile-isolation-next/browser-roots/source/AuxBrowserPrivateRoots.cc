#include "AuxBrowserPrivateRoots.h"
#include <CommonCrypto/CommonDigest.h>
#include <algorithm>
#include <cerrno>
#include <array>
#include <cstdlib>
#include <fcntl.h>
#include <limits.h>
#include <sys/acl.h>
#include <sys/stat.h>
#include <unistd.h>
namespace aux::peer {
namespace {
std::string PhysicalRoot(int descriptor) {
  std::array<char, PATH_MAX> named{}, physical{};
  if (fcntl(descriptor, F_GETPATH, named.data()) != 0 ||
      std::find(named.begin(), named.end(), '\0') == named.end() ||
      !realpath(named.data(), physical.data()) || named[0] != '/' ||
      std::string(named.data()) != physical.data() || std::string(named.data()) == "/") return {};
  return named.data();
}
bool ValidDirectory(int descriptor) {
  struct stat value{};
  const int flags = fcntl(descriptor, F_GETFD);
  if (flags < 0 || fstat(descriptor, &value) != 0 || !S_ISDIR(value.st_mode) ||
      value.st_uid != geteuid() || (value.st_mode & 0022) != 0 ||
      (flags & FD_CLOEXEC) == 0) return false;
  errno = 0;
  acl_t acl = acl_get_fd_np(descriptor, ACL_TYPE_EXTENDED);
  if (!acl) return errno == ENOENT;
  acl_entry_t entry{}; errno = 0;
  const bool empty = acl_valid(acl) == 0 && acl_get_entry(acl, 0, &entry) == -1 &&
      errno == EINVAL && entry == nullptr;
  acl_free(acl);
  return empty;
}
bool SameNamedRoot(int retained, const std::string& path) {
  if (path.empty() || !ValidDirectory(retained) || PhysicalRoot(retained) != path) return false;
  const int current = open(path.c_str(), O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK);
  if (current < 0) return false;
  struct stat a{}, b{};
  const bool same = ValidDirectory(current) && fstat(retained, &a) == 0 && fstat(current, &b) == 0 &&
      a.st_dev == b.st_dev && a.st_ino == b.st_ino;
  close(current);
  return same;
}
}
BrowserPrivateRoots::BrowserPrivateRoots(std::array<int, 2> roots, SourceCheck check)
    : process_(getpid()), roots_(roots), paths_{PhysicalRoot(roots[0]), PhysicalRoot(roots[1])}, source_check_(check) {}
BrowserPrivateRoots::~BrowserPrivateRoots() {
  if (getpid() == process_) for (int fd : roots_) if (fd >= 0) close(fd);
}
bool BrowserPrivateRoots::Revalidate() const {
  if (getpid() != process_) return false;
  return SameNamedRoot(roots_[0], paths_[0]) && SameNamedRoot(roots_[1], paths_[1]) &&
      (!source_check_ || source_check_(paths_)) &&
      SameNamedRoot(roots_[0], paths_[0]) && SameNamedRoot(roots_[1], paths_[1]);
}
std::array<uint8_t, 32> BrowserPrivateRoots::PathDigest(uint32_t role) const {
  std::array<uint8_t, 32> digest{};
  if (getpid() != process_ || role < 1 || role > 2 || paths_[role - 1].empty()) return digest;
  const auto& path = paths_[role - 1];
  CC_SHA256(path.data(), static_cast<CC_LONG>(path.size()), digest.data());
  return digest;
}
int BrowserPrivateRoots::DuplicateRevalidatedRoot(uint32_t role) const {
  if (role < 1 || role > 2 || !Revalidate()) return -1;
  const int copied = fcntl(roots_[role - 1], F_DUPFD_CLOEXEC, 0);
  if (copied < 0) return -1;
  if (!Revalidate()) { close(copied); return -1; }
  return copied;
}
}
