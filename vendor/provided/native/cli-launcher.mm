// Native exec boundary only. The sibling SEA remains the supplied CLI.
#include <CommonCrypto/CommonDigest.h>
#include "packaged-identity-admission.h"
#include <mach-o/dyld.h>
#include <sys/stat.h>
#include <unistd.h>
#include <cerrno>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <limits.h>
#include <string>
#include <vector>
extern char **environ;
namespace {
int Fail(const char *message) { std::fprintf(stderr, "%s\n", message); return 1; }
bool Regular(const std::string &path) {
  struct stat s;
  return !lstat(path.c_str(), &s) && S_ISREG(s.st_mode) && !(s.st_mode & 0022);
}
bool Canonical(const std::string &path) {
  char result[PATH_MAX];
  return realpath(path.c_str(), result) && path == result;
}
}
int main(int argc, char *argv[]) {
  char executable[PATH_MAX]; uint32_t length = sizeof(executable);
  if (_NSGetExecutablePath(executable, &length)) return Fail("Cannot locate Aux CLI launcher");
  char resolved[PATH_MAX];
  if (!realpath(executable, resolved)) return Fail("Cannot resolve Aux CLI launcher");
  const std::string self(resolved);
  const std::string suffix = "/apps/cli/Aux CLI.app/Contents/MacOS/aux-cli";
  if (self.size() <= suffix.size() || self.compare(self.size() - suffix.size(), suffix.size(), suffix))
    return Fail("Unexpected Aux CLI bundle layout");
  const std::string root = self.substr(0, self.size() - suffix.size());
  // Match browser admission before reading or creating any mutable home.
  if (!aux::packaged_identity::MarkerAllowedAt(root + "/bundle.json"))
    return Fail("Aux packaged state identity is unsupported or unaccepted");
  const std::string sea = root + "/apps/cli/Aux CLI.app/Contents/MacOS/aux-cli-sea";
  const std::string boundary = root + "/native/libaux-native-boundary.dylib";
  if (!Regular(sea) || !Canonical(sea) || access(sea.c_str(), X_OK) || !Regular(boundary) || !Canonical(boundary))
    return Fail("Fixed Aux CLI runtime boundary is unavailable");
  const char *configured = std::getenv("AUX_HOME");
  const char *userHome = std::getenv("HOME");
  std::string home;
  if (configured && configured[0]) home = configured;
  else if (userHome && userHome[0] == '/') home = std::string(userHome) + "/.aux";
  else return Fail("Absolute Aux CLI home required");
  if (home.empty() || home[0] != '/') return Fail("Absolute Aux CLI home required");
  if ((home + "/").find("/.aside/") != std::string::npos) return Fail("Original product home is not an Aux CLI scope");
  if (mkdir(home.c_str(), 0700) && errno != EEXIST) return Fail("Cannot create private Aux CLI home");
  struct stat metadata;
  if (lstat(home.c_str(), &metadata) || !S_ISDIR(metadata.st_mode) || metadata.st_uid != geteuid() ||
      (metadata.st_mode & 07777) != 0700 || !realpath(home.c_str(), resolved))
    return Fail("Aux CLI home must be an owned private directory");
  home = resolved;
  if ((home + "/").find("/.aside/") != std::string::npos)
    return Fail("Original product home is not an Aux CLI scope");
  unsigned char digest[CC_SHA256_DIGEST_LENGTH];
  CC_SHA256(home.data(), static_cast<CC_LONG>(home.size()), digest);
  const char hex[] = "0123456789abcdef"; std::string scope;
  for (unsigned char byte : digest) { scope += hex[byte >> 4]; scope += hex[byte & 15]; }
  // Drop every inherited loader override, then install exactly the bundle's
  // boundary. Never set the external runtime-acceptance flag here.
  std::vector<std::string> remove;
  for (char **entry = environ; *entry; ++entry) {
    const std::string value(*entry); const auto end = value.find('=');
    if (value.rfind("DYLD_", 0) == 0) remove.push_back(value.substr(0, end));
  }
  for (const auto &name : remove) if (unsetenv(name.c_str())) return Fail("Cannot clear inherited loader overrides");
  if (setenv("AUX_HOME", home.c_str(), 1) || setenv("AUX_NATIVE_KEYCHAIN_SCOPE", scope.c_str(), 1) ||
      setenv("DYLD_INSERT_LIBRARIES", boundary.c_str(), 1)) return Fail("Cannot establish Aux CLI native boundary");
  std::vector<char *> arguments;
  arguments.reserve(argc + 1);
  for (int i = 0; i < argc; ++i) arguments.push_back(argv[i]);
  arguments.push_back(nullptr);
  execv(sea.c_str(), arguments.data());
  return Fail("Cannot execute supplied Aux CLI");
}
