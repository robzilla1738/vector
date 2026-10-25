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
struct StartupAttempt {
  const pid_t process = getpid();
  std::mutex mutex;
  bool attempted = false;
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
std::unique_ptr<OwnedNativePeerChild> PrepareCurrentSealedChild() {
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
  if (!selected || selected->bundle != child_path ||
      AuxValidateEmbeddedNativeDaemonLaunchPolicy(child.get(), child_requirement.get(),
          selected->cd_hash.data(), selected->cd_hash.size()) != 0) return {};
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
