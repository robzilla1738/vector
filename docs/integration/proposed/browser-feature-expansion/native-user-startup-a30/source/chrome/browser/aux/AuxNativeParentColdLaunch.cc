#include "AuxNativeParentColdLaunch.h"
#include "AuxOwnedNativePeerChild.h"
#include "base/apple/scoped_cftyperef.h"
#include "base/command_line.h"
#include "base/files/file_path.h"
#include "base/environment.h"
#include "base/process/process_handle.h"
#include "base/strings/string_number_conversions.h"
#include "base/time/time.h"
#include <CommonCrypto/CommonDigest.h>
#include <Security/Security.h>
#include <array>
#include <algorithm>
#include <cerrno>
#include <dirent.h>
#include <fcntl.h>
#include <pwd.h>
#include <set>
#include <sys/acl.h>
#include <sys/stat.h>
#include "base/containers/span.h"
#include "base/files/scoped_file.h"
#include "base/logging.h"
#include <climits>
#include <cstdlib>
#include <cstring>
#include <optional>
#include <mutex>
#include <unistd.h>
#include <string>
#include <vector>

extern "C" int32_t AuxValidateEmbeddedNativeDaemonLaunchPolicy(
    const void*, const void*, const uint8_t*, uintptr_t);
extern "C" int32_t AuxGetValidatedEmbeddedNativeDaemonLaunchLocationMode(
    const void*, const void*, const uint8_t*, uintptr_t);

namespace aux::peer {
namespace {
constexpr char kTeam[] = "9F2JXY8TCK";
constexpr std::array<uint8_t, 32> kCertificate = {
    0xff,0x02,0x93,0xa0,0x6f,0x20,0x70,0x4a,0x1f,0x3b,0x3f,0x25,0x71,0xb3,0x36,0x2e,
    0xf4,0x39,0xa2,0xdf,0xb3,0xb0,0xbc,0x90,0xbc,0xf3,0xd5,0xde,0xbf,0xc7,0x3a,0x1c};
constexpr char kChildSuffix[] = "/Contents/Resources/aux/apps/daemon/Aux Daemon.app";
constexpr SecCSFlags kStrict = kSecCSStrictValidate | kSecCSCheckAllArchitectures |
    kSecCSCheckNestedCode | kSecCSRestrictSymlinks | (1U << 29);
constexpr auto kStartupLimit = base::Seconds(90);
struct LocationPreflight {
  int mode = -1;
  std::string browser_bundle;
  std::vector<uint8_t> browser_hash, child_hash;
};
struct StartupAttempt {
  const pid_t process = getpid();
  std::mutex mutex;
  bool attempted = false;
  std::optional<LocationPreflight> location;
};
StartupAttempt& CurrentAttempt() {
  static auto* attempt = new StartupAttempt;
  return *attempt;
}

CFTypeRef Value(CFDictionaryRef dictionary, CFStringRef key, CFTypeID type) {
  auto* const value = CFDictionaryGetValue(dictionary, key);
  return value && CFGetTypeID(value) == type ? value : nullptr;
}
std::optional<std::string> Text(CFTypeRef value) {
  if (!value || CFGetTypeID(value) != CFStringGetTypeID()) return std::nullopt;
  std::array<char, PATH_MAX> text{};
  if (!CFStringGetCString(static_cast<CFStringRef>(value), text.data(), text.size(), kCFStringEncodingUTF8))
    return std::nullopt;
  return std::string(text.data());
}
std::optional<std::string> Path(CFURLRef url) {
  std::array<UInt8, PATH_MAX> bytes{};
  if (!CFURLGetFileSystemRepresentation(url, true, bytes.data(), bytes.size())) return std::nullopt;
  const auto path = std::string(reinterpret_cast<char*>(bytes.data()));
  std::array<char, PATH_MAX> physical{};
  if (!realpath(path.c_str(), physical.data()) || path != physical.data()) return std::nullopt;
  return path;
}
base::apple::ScopedCFTypeRef<SecRequirementRef> Requirement(const char* identifier) {
  const auto text = std::string("anchor apple generic and identifier \"") + identifier +
      "\" and certificate leaf[subject.OU] = \"" + kTeam + "\"";
  base::apple::ScopedCFTypeRef<CFStringRef> string(CFStringCreateWithCString(
      kCFAllocatorDefault, text.c_str(), kCFStringEncodingUTF8));
  base::apple::ScopedCFTypeRef<SecRequirementRef> requirement;
  if (!string || SecRequirementCreateWithString(string.get(), kSecCSDefaultFlags,
                                                requirement.InitializeInto()) != errSecSuccess)
    return base::apple::ScopedCFTypeRef<SecRequirementRef>();
  return requirement;
}
struct Image {
  std::string bundle;
  base::FilePath executable;
  std::vector<uint8_t> cd_hash;
};
std::optional<Image> InspectImage(SecStaticCodeRef code, SecRequirementRef requirement,
                                  const char* identifier, const char* executable) {
  if (SecStaticCodeCheckValidity(code, kStrict, requirement) != errSecSuccess) return std::nullopt;
  base::apple::ScopedCFTypeRef<CFDictionaryRef> info;
  if (SecCodeCopySigningInformation(code, kSecCSSigningInformation,
                                    info.InitializeInto()) != errSecSuccess || !info) return std::nullopt;
  if (Text(Value(info.get(), kSecCodeInfoIdentifier, CFStringGetTypeID())) != identifier ||
      Text(Value(info.get(), kSecCodeInfoTeamIdentifier, CFStringGetTypeID())) != kTeam) return std::nullopt;
  auto certificates = static_cast<CFArrayRef>(Value(info.get(), kSecCodeInfoCertificates, CFArrayGetTypeID()));
  if (!certificates || CFArrayGetCount(certificates) < 1) return std::nullopt;
  auto leaf = static_cast<SecCertificateRef>(const_cast<void*>(CFArrayGetValueAtIndex(certificates, 0)));
  if (!leaf || CFGetTypeID(leaf) != SecCertificateGetTypeID()) return std::nullopt;
  base::apple::ScopedCFTypeRef<CFDataRef> certificate(SecCertificateCopyData(leaf));
  if (!certificate || CFDataGetLength(certificate.get()) <= 0 || CFDataGetLength(certificate.get()) > 65'536)
    return std::nullopt;
  std::array<uint8_t, 32> digest{};
  CC_SHA256(CFDataGetBytePtr(certificate.get()), static_cast<CC_LONG>(CFDataGetLength(certificate.get())), digest.data());
  if (digest != kCertificate) return std::nullopt;
  auto flags = static_cast<CFNumberRef>(Value(info.get(), kSecCodeInfoFlags, CFNumberGetTypeID()));
  uint32_t flag_bits = 0;
  if (!flags || !CFNumberGetValue(flags, kCFNumberSInt32Type, &flag_bits) || (flag_bits & 0x2)) return std::nullopt;
  auto plist = static_cast<CFDictionaryRef>(Value(info.get(), kSecCodeInfoPList, CFDictionaryGetTypeID()));
  if (!plist || Text(Value(plist, CFSTR("CFBundlePackageType"), CFStringGetTypeID())) != "APPL" ||
      Text(Value(plist, CFSTR("CFBundleIdentifier"), CFStringGetTypeID())) != identifier) return std::nullopt;
  const auto leaf_name = Text(Value(plist, CFSTR("CFBundleExecutable"), CFStringGetTypeID()));
  if (!leaf_name || leaf_name->empty() || leaf_name->find('/') != std::string::npos ||
      *leaf_name == "." || *leaf_name == ".." || (executable && *leaf_name != executable)) return std::nullopt;
  base::apple::ScopedCFTypeRef<CFURLRef> location;
  if (SecCodeCopyPath(code, kSecCSDefaultFlags, location.InitializeInto()) != errSecSuccess || !location) return std::nullopt;
  auto bundle = Path(location.get());
  auto main = static_cast<CFURLRef>(Value(info.get(), kSecCodeInfoMainExecutable, CFURLGetTypeID()));
  auto main_path = main ? Path(main) : std::nullopt;
  auto hash = static_cast<CFDataRef>(Value(info.get(), kSecCodeInfoUnique, CFDataGetTypeID()));
  if (!bundle || !bundle->ends_with(".app") || !main_path ||
      *main_path != *bundle + "/Contents/MacOS/" + *leaf_name || !hash ||
      (CFDataGetLength(hash) != 20 && CFDataGetLength(hash) != 32)) return std::nullopt;
  // The preceding guard permits only20/32bytes; the copy range and owned
  // destination have exactly that verified CFData length.
  std::vector<uint8_t> captured_hash(static_cast<size_t>(CFDataGetLength(hash)));
  CFDataGetBytes(hash, CFRangeMake(0, CFDataGetLength(hash)), captured_hash.data());
  return Image{*bundle, base::FilePath(*main_path), std::move(captured_hash)};
}
// Factual retained native directory selection only. This is not startup
// admission; the daemon/root/generation receipt remains mandatory.
struct HeldUserDirectory {
  base::ScopedFD fd;
  base::FilePath path;
  std::optional<size_t> parent;
  std::string leaf;
  bool private_directory = false;
};
struct PreparedUserDirectories {
  const pid_t process = getpid();
  const uid_t uid = geteuid();
  NativeUserStartupPaths paths;
  std::vector<HeldUserDirectory> held;
};
std::unique_ptr<PreparedUserDirectories>& PreparedDirectories() {
  static auto* value = new std::unique_ptr<PreparedUserDirectories>;
  return *value;
}
bool& DirectoryPreparationAttempted() { static bool attempted = false; return attempted; }
bool ValidUserDirectory(int fd, bool private_directory) {
  struct stat value{};
  if (fd < 0 || fstat(fd, &value) != 0 || !S_ISDIR(value.st_mode) ||
      value.st_uid != geteuid() || (value.st_mode & (private_directory ? 0077 : 0022)))
    return false;
  if (!private_directory) return true;
  errno = 0;
  acl_t acl = acl_get_fd_np(fd, ACL_TYPE_EXTENDED);
  if (!acl) return errno == ENOENT;
  acl_entry_t entry{}; errno = 0;
  const bool empty = acl_valid(acl) == 0 && acl_get_entry(acl, 0, &entry) == -1 &&
      errno == EINVAL && entry == nullptr;
  acl_free(acl);
  return empty;
}
bool SameHeldUserDirectory(const PreparedUserDirectories& state, size_t index) {
  const auto& held = state.held.at(index);
  if (!ValidUserDirectory(held.fd.get(), held.private_directory)) return false;
  base::ScopedFD current(held.parent
      ? openat(state.held.at(*held.parent).fd.get(), held.leaf.c_str(),
          O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK)
      : open(held.path.value().c_str(),
          O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK));
  struct stat before{}, after{};
  return current.is_valid() && ValidUserDirectory(current.get(), held.private_directory) &&
      fstat(held.fd.get(), &before) == 0 && fstat(current.get(), &after) == 0 &&
      before.st_dev == after.st_dev && before.st_ino == after.st_ino &&
      before.st_uid == after.st_uid && before.st_mode == after.st_mode;
}
bool HoldUserDirectory(PreparedUserDirectories& state, const base::FilePath& path,
                      std::optional<size_t> parent, const char* leaf,
                      bool private_directory) {
  base::ScopedFD fd(parent
      ? openat(state.held.at(*parent).fd.get(), leaf,
          O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK)
      : open(path.value().c_str(),
          O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC | O_NONBLOCK));
  if (!fd.is_valid() || !ValidUserDirectory(fd.get(), private_directory)) return false;
  state.held.push_back({std::move(fd), path, parent, leaf, private_directory});
  return SameHeldUserDirectory(state, state.held.size() - 1);
}
bool InspectPrivateChild(int parent, const char* leaf, bool* exists) {
  struct stat value{};
  if (fstatat(parent, leaf, &value, AT_SYMLINK_NOFOLLOW) != 0) {
    if (errno != ENOENT) return false;
    *exists = false;
    return true;
  }
  *exists = true;
  return S_ISDIR(value.st_mode) && value.st_uid == geteuid() && !(value.st_mode & 0077);
}
bool SupportInventory(int support) {
  base::ScopedFD duplicate(fcntl(support, F_DUPFD_CLOEXEC, 0));
  if (!duplicate.is_valid()) return false;
  DIR* directory = fdopendir(duplicate.get());
  if (!directory) return false;
  duplicate.release();
  rewinddir(directory);
  std::set<std::string> names;
  bool valid = true;
  errno = 0;
  while (const dirent* entry = readdir(directory)) {
    const auto bytes = base::span(entry->d_name);
    const auto end = std::ranges::find(bytes, '\0');
    if (end == bytes.end()) { valid = false; break; }
    const std::string name(bytes.begin(), end);
    if (name == "." || name == "..") continue;
    if ((name != "User Data" && name != "Control" && name != "Tasks") ||
        !names.insert(name).second || names.size() > 3) { valid = false; break; }
    errno = 0;
  }
  if (errno != 0) valid = false;
  closedir(directory);
  if (!valid || !names.contains("User Data") ||
      names.contains("Control") != names.contains("Tasks")) return false;
  for (const auto& name : names) {
    bool exists = false;
    if (!InspectPrivateChild(support, name.c_str(), &exists) || !exists) return false;
  }
  return true;
}
std::optional<NativeUserStartupPaths> DeriveCurrentOsUserPaths() {
  if (getuid() == 0 || getuid() != geteuid()) return std::nullopt;
  const long configured = sysconf(_SC_GETPW_R_SIZE_MAX);
  size_t size = configured > 0 ? static_cast<size_t>(configured) : size_t{16384};
  if (size > 65536) return std::nullopt;
  std::vector<char> storage(size);
  passwd record{}; passwd* result = nullptr;
  for (;;) {
    const int status = getpwuid_r(geteuid(), &record, storage.data(), storage.size(), &result);
    if (status == ERANGE && storage.size() < 65536) {
      storage.resize(std::min(size_t{65536}, storage.size() * 2));
      continue;
    }
    if (status != 0 || result != &record || record.pw_uid != geteuid() || !record.pw_dir)
      return std::nullopt;
    break;
  }
  // getpwuid_r's strings belong to its actual bounded caller buffer. Verify
  // the returned field lies within it before constructing an owned path.
  const uintptr_t begin = reinterpret_cast<uintptr_t>(storage.data());
  const uintptr_t field = reinterpret_cast<uintptr_t>(record.pw_dir);
  if (field < begin || field - begin >= storage.size()) return std::nullopt;
  const auto tail = base::span(storage).subspan(static_cast<size_t>(field - begin));
  const auto end = std::ranges::find(tail, '\0');
  if (end == tail.end()) return std::nullopt;
  const std::string named(tail.begin(), end);
  if (named.empty() || named.size() >= PATH_MAX) return std::nullopt;
  std::array<char, PATH_MAX> canonical{};
  if (!realpath(named.c_str(), canonical.data())) return std::nullopt;
  const base::FilePath home(canonical.data());
  if (home.empty() || !home.IsAbsolute() || home.ReferencesParent() || home.value() == "/")
    return std::nullopt;
  const auto support = home.AppendASCII("Library/Application Support/Aux Browser");
  return NativeUserStartupPaths{home, support.AppendASCII("User Data"),
                                home.AppendASCII("Library/Caches/Aux Browser")};
}
bool SameUserPaths(const NativeUserStartupPaths& a, const NativeUserStartupPaths& b) {
  return a.home == b.home && a.data == b.data && a.cache == b.cache;
}
bool RevalidatePreparedDirectories(const PreparedUserDirectories& state) {
  if (state.process != getpid() || state.uid == 0 || state.uid != getuid() ||
      state.uid != geteuid() || state.held.size() != 7) return false;
  for (size_t i = 0; i < state.held.size(); ++i)
    if (!SameHeldUserDirectory(state, i)) return false;
  return SupportInventory(state.held.at(4).fd.get());
}
bool PrepareCurrentUserDirectories(const NativeUserStartupPaths& paths) {
  auto current = DeriveCurrentOsUserPaths();
  if (!current || !SameUserPaths(*current, paths)) return false;
  if (const auto& prepared = PreparedDirectories())
    return SameUserPaths(prepared->paths, paths) && RevalidatePreparedDirectories(*prepared);
  if (DirectoryPreparationAttempted()) return false;
  DirectoryPreparationAttempted() = true;
  auto state = std::make_unique<PreparedUserDirectories>();
  state->paths = paths;
  if (!HoldUserDirectory(*state, paths.home, std::nullopt, "", false) ||
      !HoldUserDirectory(*state, paths.home.AppendASCII("Library"), size_t{0}, "Library", false) ||
      !HoldUserDirectory(*state, paths.home.AppendASCII("Library/Application Support"),
                         size_t{1}, "Application Support", false) ||
      !HoldUserDirectory(*state, paths.home.AppendASCII("Library/Caches"), size_t{1}, "Caches", false)) {
    RAW_LOG(ERROR, "Aux OS-user startup refused: native OS ancestor chain unavailable");
    return false;
  }
  bool support_exists = false, cache_exists = false;
  if (!InspectPrivateChild(state->held.at(2).fd.get(), "Aux Browser", &support_exists) ||
      !InspectPrivateChild(state->held.at(3).fd.get(), "Aux Browser", &cache_exists) ||
      support_exists != cache_exists) {
    RAW_LOG(ERROR, "Aux OS-user startup refused: partial or invalid Aux namespace roots");
    return false;
  }
  // Complete preflight precedes the first mkdir. Never add User Data/cache to
  // an arbitrary pre-existing namespace or reset a partial failed install.
  if (support_exists) {
    if (!HoldUserDirectory(*state, paths.data.DirName(), size_t{2}, "Aux Browser", true) ||
        !SupportInventory(state->held.at(4).fd.get())) {
      RAW_LOG(ERROR, "Aux OS-user startup refused: unknown or partial Aux support namespace");
      return false;
    }
  } else {
    if (mkdirat(state->held.at(2).fd.get(), "Aux Browser", 0700) != 0 ||
        !HoldUserDirectory(*state, paths.data.DirName(), size_t{2}, "Aux Browser", true) ||
        mkdirat(state->held.at(4).fd.get(), "User Data", 0700) != 0 ||
        mkdirat(state->held.at(3).fd.get(), "Aux Browser", 0700) != 0) {
      RAW_LOG(ERROR, "Aux OS-user startup refused: fresh directory creation incomplete");
      return false;
    }
  }
  if (!HoldUserDirectory(*state, paths.data, size_t{4}, "User Data", true) ||
      !HoldUserDirectory(*state, paths.cache, size_t{3}, "Aux Browser", true) ||
      !RevalidatePreparedDirectories(*state)) {
    RAW_LOG(ERROR, "Aux OS-user startup refused: native directory revalidation failed");
    return false;
  }
  PreparedDirectories() = std::move(state);
  return true;
}

struct SealedStartupPair {
  base::apple::ScopedCFTypeRef<SecCodeRef> current;
  base::apple::ScopedCFTypeRef<SecStaticCodeRef> browser, child;
  base::apple::ScopedCFTypeRef<SecRequirementRef> browser_requirement, child_requirement;
  Image outer, selected;
  int mode = -1;
};
std::unique_ptr<SealedStartupPair> InspectCurrentSealedPair() {
  if (CurrentAttempt().process != getpid()) return {};
  auto browser_requirement = Requirement("dev.aux.browser");
  auto child_requirement = Requirement("dev.aux.browser.daemon");
  base::apple::ScopedCFTypeRef<SecCodeRef> current;
  base::apple::ScopedCFTypeRef<SecStaticCodeRef> browser;
  if (!browser_requirement || !child_requirement ||
      SecCodeCopySelf(kSecCSDefaultFlags, current.InitializeInto()) != errSecSuccess ||
      SecCodeCheckValidity(current.get(), kSecCSStrictValidate | (1U << 29), browser_requirement.get()) != errSecSuccess ||
      SecCodeCopyStaticCode(current.get(), kSecCSDefaultFlags, browser.InitializeInto()) != errSecSuccess) return {};
  const auto outer = InspectImage(browser.get(), browser_requirement.get(), "dev.aux.browser", nullptr);
  if (!outer) return {};
  const auto child_path = outer->bundle + kChildSuffix;
  base::apple::ScopedCFTypeRef<CFURLRef> child_url(CFURLCreateFromFileSystemRepresentation(
      kCFAllocatorDefault, reinterpret_cast<const UInt8*>(child_path.data()), child_path.size(), true));
  base::apple::ScopedCFTypeRef<SecStaticCodeRef> child;
  if (!child_url || SecStaticCodeCreateWithPath(child_url.get(), kSecCSDefaultFlags,
                                               child.InitializeInto()) != errSecSuccess) return {};
  const auto selected = InspectImage(child.get(), child_requirement.get(), "dev.aux.browser.daemon", "aux-daemon");
  if (!selected || selected->bundle != child_path) return {};
  const int mode = AuxGetValidatedEmbeddedNativeDaemonLaunchLocationMode(
      child.get(), child_requirement.get(), selected->cd_hash.data(), selected->cd_hash.size());
  if ((mode != 8 && mode != 9) || (mode == 8 &&
      AuxValidateEmbeddedNativeDaemonLaunchPolicy(child.get(), child_requirement.get(),
          selected->cd_hash.data(), selected->cd_hash.size()) != 0)) return {};
  auto result = std::make_unique<SealedStartupPair>();
  result->current = std::move(current);
  result->browser = std::move(browser);
  result->child = std::move(child);
  result->browser_requirement = std::move(browser_requirement);
  result->child_requirement = std::move(child_requirement);
  result->outer = *outer;
  result->selected = *selected;
  result->mode = mode;
  return result;
}
bool MatchesLocationPreflight(const SealedStartupPair& pair) {
  auto& attempt = CurrentAttempt();
  if (attempt.process != getpid()) return false;
  std::lock_guard<std::mutex> lock(attempt.mutex);
  if (!attempt.location) return pair.mode == 8;  // Existing fixed v8 caller.
  return attempt.location->mode == pair.mode &&
      attempt.location->browser_bundle == pair.outer.bundle &&
      attempt.location->browser_hash == pair.outer.cd_hash &&
      attempt.location->child_hash == pair.selected.cd_hash;
}
std::unique_ptr<OwnedNativePeerChild> PrepareCurrentSealedChild() {
  auto pair = InspectCurrentSealedPair();
  if (!pair || !MatchesLocationPreflight(*pair)) return {};
  if (pair->mode == 9) {
    const auto& prepared = PreparedDirectories();
    if (!prepared || !RevalidatePreparedDirectories(*prepared)) return {};
  }
  const auto* outer = &pair->outer;
  const auto* selected = &pair->selected;
  auto& current = pair->current;
  auto& browser = pair->browser;
  auto& browser_requirement = pair->browser_requirement;
  auto& child_requirement = pair->child_requirement;
  // Capture the exact reviewed child code, not a Boolean claiming admission.
  // The live audit/birth/CDHash and sealed fresh policy are checked again by
  // both peer endpoints; replacing a launch path cannot publish another owner.
  auto policy = ExactCodePolicy::CopyNativePolicy(child_requirement.get(), selected->cd_hash);
  const auto repeated = InspectImage(browser.get(), browser_requirement.get(), "dev.aux.browser", nullptr);
  if (!policy || !repeated || repeated->bundle != outer->bundle || repeated->cd_hash != outer->cd_hash ||
      SecCodeCheckValidity(current.get(), kSecCSStrictValidate | (1U << 29), browser_requirement.get()) != errSecSuccess) return {};
  base::LaunchOptions options;
  options.clear_environment = true;
  // Configuration values are fixed to the paired native browser route. None
  // of these strings establishes selected-home or installation authority.
  options.environment["AUX_PORT"] = "21520";
  options.environment["AUX_HOST"] = "127.0.0.1";
  options.environment["AUX_BROWSER_CDP_HOST"] = "127.0.0.1:45203";
  options.environment["DAEMON_BASE_URL"] = "http://127.0.0.1:21520";
  options.environment["AUX_BROWSER_PID"] = base::NumberToString(base::GetCurrentProcId());
  const auto resources = base::FilePath(outer->bundle).AppendASCII("Contents/Resources/aux");
  const auto computer_use = resources.AppendASCII("apps/computer-use/Aux Computer Use.app");
  options.environment["AUX_HELPER_PATH"] = computer_use.AppendASCII("Contents/MacOS/aux-computer-use").value();
  options.environment["AUX_COMPUTER_USE_SOURCE_APP"] = computer_use.value();
  options.current_directory = resources;
  auto environment = base::Environment::Create();
  for (const auto* name : {"PATH", "TMPDIR", "TZ", "LANG", "LC_CTYPE", "LC_MESSAGES"}) {
    if (auto value = environment->GetVar(std::string(name))) options.environment[name] = *value;
  }
  if (!options.environment.contains("PATH")) options.environment["PATH"] = "/usr/bin:/bin:/usr/sbin:/sbin";
  return OwnedNativePeerChild::PrepareBeforeSpawn(base::CommandLine(selected->executable),
                                                 std::move(options), std::move(policy));
}
}  // namespace

int InspectSealedNativeDaemonLaunchLocationMode() {
  auto pair = InspectCurrentSealedPair();
  if (!pair) return -1;
  auto& attempt = CurrentAttempt();
  if (attempt.process != getpid()) return -1;
  std::lock_guard<std::mutex> lock(attempt.mutex);
  if (attempt.location) {
    const auto& previous = *attempt.location;
    if (previous.mode != pair->mode || previous.browser_bundle != pair->outer.bundle ||
        previous.browser_hash != pair->outer.cd_hash || previous.child_hash != pair->selected.cd_hash)
      return -1;
  } else {
    attempt.location = LocationPreflight{pair->mode, pair->outer.bundle,
        pair->outer.cd_hash, pair->selected.cd_hash};
  }
  return pair->mode;
}
std::optional<NativeUserStartupPaths> DeriveOrdinaryUserStartupPaths() {
  if (InspectSealedNativeDaemonLaunchLocationMode() != 9) return std::nullopt;
  return DeriveCurrentOsUserPaths();
}
bool PrepareOrdinaryUserStartupPaths(const NativeUserStartupPaths& paths) {
  return InspectSealedNativeDaemonLaunchLocationMode() == 9 && PrepareCurrentUserDirectories(paths);
}
bool RevalidateOrdinaryUserStartupPaths(const NativeUserStartupPaths& paths) {
  const auto& prepared = PreparedDirectories();
  return prepared && SameUserPaths(prepared->paths, paths) && RevalidatePreparedDirectories(*prepared);
}

SelectedStateHomeResolution StartSealedNativeDaemonBeforeProfiles() {
  auto selected = ReadNativeSelectedStateHome();
  if (selected.route != SelectedStateHomeRoute::unselected) return selected;
  auto& attempt = CurrentAttempt();
  if (getpid() != attempt.process) return {SelectedStateHomeRoute::wrongProcess, {}};
  {
    std::lock_guard<std::mutex> lock(attempt.mutex);
    if (attempt.attempted) return {SelectedStateHomeRoute::unavailable, {}};
    attempt.attempted = true;
  }
  auto child = PrepareCurrentSealedChild();
  if (!child || ReadNativeSelectedStateHome().route != SelectedStateHomeRoute::unselected ||
      !child->LaunchOnce()) return {SelectedStateHomeRoute::unavailable, {}};
  const auto deadline = base::TimeTicks::Now() + kStartupLimit;
  while (base::TimeTicks::Now() < deadline) {
    const auto status = child->ServicePeerOnce(250);
    if (status != ExchangeStatus::authenticated && status != ExchangeStatus::timedOut) break;
    if (auto home = child->TakeSelectedHome()) {
      if (!InstallNativeSelectedStateHome(std::move(home))) return ReadNativeSelectedStateHome();
      return ReadNativeSelectedStateHome();
    }
    const auto observed = child->ObserveAndReapExitedChild();
    if (observed.closed || observed.child_binding_failed || observed.exit_observed_and_reaped ||
        observed.exit_ownership_unknown) break;
  }
  // Destruction retains the exact unresolved child; never kill/restart it or
  // fall back to compatibility startup. No empty queue proves writer custody.
  return {SelectedStateHomeRoute::unavailable, {}};
}
}  // namespace aux::peer
