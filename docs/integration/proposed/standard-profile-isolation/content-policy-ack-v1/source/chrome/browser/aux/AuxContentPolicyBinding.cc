#include "chrome/browser/aux/AuxContentPolicyBinding.h"
#include "chrome/browser/aux/AuxBrowserPrivateRoots.h"
#include "chrome/browser/aux/AuxSelectedStateHome.h"
#include "content/public/browser/child_process_host.h"
#include "content/public/common/content_switches.h"
#include "base/files/file_util.h"
#include "base/process/process.h"
#include <Security/Security.h>
#include <crt_externs.h>
#include <fcntl.h>
#include <libproc.h>
#include <sys/stat.h>
#include <unistd.h>
#include <array>
#include <vector>
#include <string_view>
#include "base/compiler_specific.h"

namespace aux::peer {
namespace {
std::vector<uint8_t> SigningHash(CFDictionaryRef info) {
  if (!info) return {};
  CFTypeRef value = CFDictionaryGetValue(info, kSecCodeInfoUnique);
  if (!value || CFGetTypeID(value) != CFDataGetTypeID()) return {};
  auto data = static_cast<CFDataRef>(value);
  const auto size = CFDataGetLength(data);
  if (size != 20 && size != 32) return {};
  std::vector<uint8_t> result(static_cast<size_t>(size));
  CFDataGetBytes(data, CFRangeMake(0, size), result.data());
  return result;
}
bool Current(uint64_t generation,
             const std::shared_ptr<const BrowserPrivateRoots>& roots) {
  const auto state = InspectNativeBrowserShutdown();
  return generation && !state.wrong_process && !state.admission_closed &&
      !state.sequence_uncertain && state.admitted_generation == generation &&
      roots && roots->Revalidate();
}
class Binding final : public content::AuxSandboxLaunchBinding {
 public:
  Binding(uint64_t generation, std::shared_ptr<const BrowserPrivateRoots> roots,
          base::FilePath executable, std::vector<uint8_t> hash, int descriptor,
          struct stat identity)
      : generation_(generation), roots_(std::move(roots)),
        executable_(std::move(executable)), hash_(std::move(hash)),
        descriptor_(descriptor), identity_(identity) {}
  ~Binding() override { close(descriptor_); }
  uint64_t generation() const override { return generation_; }
  bool Validate(base::ProcessId pid, base::Time birth) const override {
    if (getpid() != owner_ || pid <= 0 || birth.is_null() ||
        !Current(generation_, roots_)) return false;
    struct stat held{}, named{};
    if (fstat(descriptor_, &held) || lstat(executable_.value().c_str(), &named) ||
        !S_ISREG(named.st_mode) || held.st_dev != identity_.st_dev ||
        held.st_ino != identity_.st_ino || named.st_dev != held.st_dev ||
        named.st_ino != held.st_ino) return false;
    auto process = base::Process::Open(pid);
    if (!process.IsValid() || process.CreationTime() != birth) return false;
    std::array<char, PROC_PIDPATHINFO_MAXSIZE> observed{};
    if (proc_pidpath(pid, observed.data(), observed.size()) <= 0 ||
        base::MakeAbsoluteFilePath(base::FilePath(observed.data())) != executable_)
      return false;
    int numeric_pid = pid;
    CFNumberRef number = CFNumberCreate(nullptr, kCFNumberIntType, &numeric_pid);
    if (!number) return false;
    const void* key = kSecGuestAttributePid;
    const void* value = number;
    CFDictionaryRef attrs = CFDictionaryCreate(nullptr, &key, &value, 1,
        &kCFTypeDictionaryKeyCallBacks, &kCFTypeDictionaryValueCallBacks);
    CFRelease(number);
    if (!attrs) return false;
    SecCodeRef guest = nullptr;
    OSStatus status = SecCodeCopyGuestWithAttributes(
        nullptr, attrs, kSecCSDefaultFlags, &guest);
    CFRelease(attrs);
    if (status != errSecSuccess || !guest) return false;
    status = SecCodeCheckValidity(guest, kSecCSDefaultFlags, nullptr);
    CFDictionaryRef info = nullptr;
    if (status == errSecSuccess)
      status = SecCodeCopySigningInformation(guest, kSecCSSigningInformation, &info);
    const bool code_matches = status == errSecSuccess && SigningHash(info) == hash_;
    if (info) CFRelease(info);
    CFRelease(guest);
    return code_matches && process.CreationTime() == birth &&
        Current(generation_, roots_);
  }
 private:
  const pid_t owner_ = getpid();
  const uint64_t generation_;
  const std::shared_ptr<const BrowserPrivateRoots> roots_;
  const base::FilePath executable_;
  const std::vector<uint8_t> hash_;
  const int descriptor_;
  const struct stat identity_;
};
}  // namespace

std::shared_ptr<const content::AuxSandboxLaunchBinding>
CaptureContentPolicyBinding(const base::CommandLine& command) {
  const auto* current = base::CommandLine::ForCurrentProcess();
  if (!current || current->HasSwitch(switches::kBrowserSubprocessPath) ||
      command.HasSwitch("aux-seatbelt-receipt") ||
      command.HasSwitch("seatbelt-client")) return nullptr;
  // Inherited loader injection would execute before the fixed helper's main.
  // _NSGetEnviron supplies a native null-terminated array, read-only here.
  UNSAFE_BUFFERS({
    for (char** env = *_NSGetEnviron(); env && *env; ++env)
      if (std::string_view(*env).starts_with("DYLD_")) return nullptr;
  });
  const auto state = InspectNativeBrowserShutdown();
  auto roots = CaptureActualChromiumBrowserRoots();
  if (!Current(state.admitted_generation, roots)) return nullptr;
  const auto executable = base::MakeAbsoluteFilePath(command.GetProgram());
  bool fixed_helper = false;
  for (int flags : {content::ChildProcessHost::CHILD_NORMAL,
                    content::ChildProcessHost::CHILD_RENDERER,
                    content::ChildProcessHost::CHILD_GPU}) {
    const auto selected = base::MakeAbsoluteFilePath(
        content::ChildProcessHost::GetChildPath(flags));
    if (!selected.empty() && selected == executable) fixed_helper = true;
  }
  if (!fixed_helper || executable.empty()) return nullptr;
  int fd = open(executable.value().c_str(), O_RDONLY | O_NOFOLLOW | O_CLOEXEC);
  struct stat identity{};
  if (fd < 0) return nullptr;
  if (fstat(fd, &identity) || !S_ISREG(identity.st_mode)) {
    close(fd); return nullptr;
  }
  CFURLRef url = CFURLCreateFromFileSystemRepresentation(nullptr,
      reinterpret_cast<const UInt8*>(executable.value().data()),
      executable.value().size(), false);
  SecStaticCodeRef code = nullptr;
  OSStatus status = url ? SecStaticCodeCreateWithPath(url, kSecCSDefaultFlags, &code)
                       : errSecParam;
  if (url) CFRelease(url);
  if (status == errSecSuccess && code)
    status = SecStaticCodeCheckValidity(code,
        kSecCSCheckAllArchitectures | kSecCSStrictValidate, nullptr);
  CFDictionaryRef info = nullptr;
  if (status == errSecSuccess && code)
    status = SecCodeCopySigningInformation(code, kSecCSSigningInformation, &info);
  auto hash = status == errSecSuccess ? SigningHash(info) : std::vector<uint8_t>();
  if (info) CFRelease(info);
  if (code) CFRelease(code);
  if (hash.empty() || !Current(state.admitted_generation, roots)) {
    close(fd); return nullptr;
  }
  return std::make_shared<Binding>(state.admitted_generation, std::move(roots),
      executable, std::move(hash), fd, identity);
}
}  // namespace aux::peer
