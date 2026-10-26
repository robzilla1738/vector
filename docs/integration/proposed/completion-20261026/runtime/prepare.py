#!/usr/bin/env python3
"""Prepare counted native-host ownership/cleanup overlays without changing Chromium."""
import difflib
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
changes = []

def edit(path, replacements):
    original = (SOURCE / path).read_text()
    result = original
    anchors = []
    for old, new in replacements:
        count = result.count(old)
        if count != 1:
            raise RuntimeError(f'{path}: expected one anchor, got {count}: {old[:90]}')
        result = result.replace(old, new, 1)
        anchors.append({'old': old, 'new': new, 'count': count})
    for kind, content in [('baseline', original), ('source', result)]:
        target = ROOT / kind / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content)
    changes.append({'path': path, 'before': hashlib.sha256(original.encode()).hexdigest(),
                    'after': hashlib.sha256(result.encode()).hexdigest(), 'anchors': anchors})

edit('chrome/browser/extensions/api/messaging/aux_native_messaging_lifetime.h', [
('#include "base/process/kill.h"', '#include "base/process/kill.h"\n#include "base/files/file_path.h"\n#include "base/task/sequenced_task_runner.h"\n#include "chrome/browser/profiles/keep_alive/scoped_profile_keep_alive.h"'),
('namespace extensions {\n', '''class Profile;

namespace extensions {
// Captured on UI from the actual calling Profile, never from renderer input or
// the optional native-initiated reconnect directory. No Profile is dereferenced
// on IO/background/reaper threads; its keepalive is released on UI.
class AuxNativeMessagingProfileOwner final {
 public:
  static std::shared_ptr<const AuxNativeMessagingProfileOwner> Capture(Profile* profile);
  ~AuxNativeMessagingProfileOwner();
  const base::FilePath& profile_path() const { return profile_path_; }

 private:
  AuxNativeMessagingProfileOwner(Profile* profile,
                                std::unique_ptr<ScopedProfileKeepAlive> keep_alive);
  const base::FilePath profile_path_;
  const std::unique_ptr<ScopedProfileKeepAlive, base::OnTaskRunnerDeleter> keep_alive_;
};

'''),
('  static std::shared_ptr<AuxNativeMessagingLifetime> Reserve() {\n    auto entry = std::shared_ptr<AuxNativeMessagingLifetime>(new AuxNativeMessagingLifetime);', '''  static std::shared_ptr<AuxNativeMessagingLifetime> Reserve(
      std::shared_ptr<const AuxNativeMessagingProfileOwner> profile_owner,
      std::string extension_origin, std::string native_host_name) {
    if (!profile_owner || extension_origin.empty() || native_host_name.empty())
      return nullptr;
    auto entry = std::shared_ptr<AuxNativeMessagingLifetime>(
        new AuxNativeMessagingLifetime(std::move(profile_owner),
                                      std::move(extension_origin),
                                      std::move(native_host_name)));'''),
('struct AuxNativeMessagingLifetime final {', 'struct AuxNativeMessagingLifetime final {\n  ~AuxNativeMessagingLifetime();'),
('  AuxNativeMessagingLifetime();', '''  AuxNativeMessagingLifetime(
      std::shared_ptr<const AuxNativeMessagingProfileOwner> profile_owner,
      std::string extension_origin, std::string native_host_name);
  const std::shared_ptr<const AuxNativeMessagingProfileOwner> profile_owner_;
  const std::string extension_origin_;
  const std::string native_host_name_;'''),
('#include <mutex>', '#include <mutex>\n#include <string>'),
])
edit('chrome/browser/extensions/api/messaging/native_message_process_host.cc', [
('#include "chrome/browser/profiles/profile.h"', '#include "chrome/browser/profiles/profile.h"\n#include "chrome/browser/profiles/keep_alive/profile_keep_alive_types.h"'),
('AuxNativeMessagingLifetime::AuxNativeMessagingLifetime() = default;', '''std::shared_ptr<const AuxNativeMessagingProfileOwner>
AuxNativeMessagingProfileOwner::Capture(Profile* profile) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!profile || !profile->IsRegularProfile()) return nullptr;
  auto keep_alive = ScopedProfileKeepAlive::TryAcquire(
      profile, ProfileKeepAliveOrigin::kBackgroundMode);
  if (!keep_alive) return nullptr;
  return std::shared_ptr<const AuxNativeMessagingProfileOwner>(
      new AuxNativeMessagingProfileOwner(profile, std::move(keep_alive)));
}

AuxNativeMessagingProfileOwner::AuxNativeMessagingProfileOwner(
    Profile* profile, std::unique_ptr<ScopedProfileKeepAlive> keep_alive)
    : profile_path_(profile->GetPath()),
      keep_alive_(keep_alive.release(),
                  base::OnTaskRunnerDeleter(content::GetUIThreadTaskRunner({}))) {}

AuxNativeMessagingProfileOwner::~AuxNativeMessagingProfileOwner() = default;
AuxNativeMessagingLifetime::~AuxNativeMessagingLifetime() = default;

AuxNativeMessagingLifetime::AuxNativeMessagingLifetime(
    std::shared_ptr<const AuxNativeMessagingProfileOwner> profile_owner,
    std::string extension_origin, std::string native_host_name)
    : profile_owner_(std::move(profile_owner)),
      extension_origin_(std::move(extension_origin)),
      native_host_name_(std::move(native_host_name)) {}'''),
])
edit('chrome/browser/extensions/api/messaging/native_process_launcher.cc', [
('#include "url/gurl.h"', '#include "url/gurl.h"\n#if BUILDFLAG(IS_MAC)\n#include "chrome/browser/extensions/api/messaging/aux_native_messaging_lifetime.h"\n#endif'),
('                            const std::string& error_arg);', '''                            const std::string& error_arg
#if BUILDFLAG(IS_MAC)
                            , std::shared_ptr<const AuxNativeMessagingProfileOwner> profile_owner
#endif
                            );'''),
('  mutable std::shared_ptr<AuxNativeMessagingLifetime> aux_child_lifetime_;', '''  const std::shared_ptr<const AuxNativeMessagingProfileOwner> aux_profile_owner_;
  mutable std::shared_ptr<AuxNativeMessagingLifetime> aux_child_lifetime_;'''),
('    const std::string& error_arg)\n    : allow_user_level_hosts_', '''    const std::string& error_arg
#if BUILDFLAG(IS_MAC)
    , std::shared_ptr<const AuxNativeMessagingProfileOwner> profile_owner
#endif
    )
    : allow_user_level_hosts_'''),
('      error_arg_(error_arg) {}', '''      error_arg_(error_arg)
#if BUILDFLAG(IS_MAC)
      , aux_profile_owner_(std::move(profile_owner))
#endif
      {}'''),
('                     base::Unretained(this), std::move(callback)));', '''                     base::Unretained(this), std::move(callback))
#if BUILDFLAG(IS_MAC)
      , aux_profile_owner_
#endif
      );'''),
('base::TaskShutdownBehavior::CONTINUE_ON_SHUTDOWN, base::MayBlock()', '''
#if BUILDFLAG(IS_MAC)
           base::TaskShutdownBehavior::BLOCK_SHUTDOWN,
#else
           base::TaskShutdownBehavior::CONTINUE_ON_SHUTDOWN,
#endif
           base::MayBlock()'''),
('      profile_directory, connect_id, error_arg);', '''      profile_directory, connect_id, error_arg
#if BUILDFLAG(IS_MAC)
      , AuxNativeMessagingProfileOwner::Capture(profile)
#endif
      );'''),
])
edit('chrome/browser/extensions/api/messaging/launch_context.h', [
('namespace extensions {\n', 'namespace extensions {\n#if BUILDFLAG(IS_MAC)\nclass AuxNativeMessagingProfileOwner;\n#endif\n'),
('      scoped_refptr<base::TaskRunner> background_task_runner,\n      NativeProcessLauncher::LaunchedCallback callback);', '''      scoped_refptr<base::TaskRunner> background_task_runner,
      NativeProcessLauncher::LaunchedCallback callback
#if BUILDFLAG(IS_MAC)
      , std::shared_ptr<const AuxNativeMessagingProfileOwner> profile_owner = nullptr
#endif
      );'''),
('      bool native_hosts_executables_launch_directly);', '''      bool native_hosts_executables_launch_directly
#if BUILDFLAG(IS_MAC)
      , std::shared_ptr<const AuxNativeMessagingProfileOwner> profile_owner,
      const GURL& origin, const std::string& native_host_name
#endif
      );'''),
('      const std::string& native_host_name);', '''      const std::string& native_host_name
#if BUILDFLAG(IS_MAC)
      , std::shared_ptr<const AuxNativeMessagingProfileOwner> profile_owner
#endif
      );'''),
])
edit('chrome/browser/extensions/api/messaging/launch_context.cc', [
('                            , std::shared_ptr<AuxNativeMessagingLifetime> custody', '''                            , std::shared_ptr<AuxNativeMessagingLifetime> custody,
                            base::ScopedPlatformFile read_file = {},
                            base::ScopedPlatformFile write_file = {}'''),
('base::TaskShutdownBehavior::CONTINUE_ON_SHUTDOWN},\n                             base::BindOnce(&ReapAuxNativeMessagingProcess,\n                                            std::move(native_process), std::move(custody)));', '''base::TaskShutdownBehavior::BLOCK_SHUTDOWN},
                             base::BindOnce(
                                 [](base::Process process,
                                    std::shared_ptr<AuxNativeMessagingLifetime> lifetime,
                                    base::ScopedPlatformFile read_file,
                                    base::ScopedPlatformFile write_file) {
                                   // Closing framing pipes precedes the sole original
                                   // reaper, including cancellation and dropped replies.
                                   read_file.reset();
                                   write_file.reset();
                                   ReapAuxNativeMessagingProcess(std::move(process),
                                                                std::move(lifetime));
                                 },
                                 std::move(native_process), std::move(custody),
                                 std::move(read_file), std::move(write_file)));'''),
('    NativeProcessLauncher::LaunchedCallback callback) {', '''    NativeProcessLauncher::LaunchedCallback callback
#if BUILDFLAG(IS_MAC)
    , std::shared_ptr<const AuxNativeMessagingProfileOwner> profile_owner
#endif
    ) {'''),
('                     std::move(native_host_name)),', '''                     std::move(native_host_name)
#if BUILDFLAG(IS_MAC)
                     , std::move(profile_owner)
#endif
                     ),'''),
('LaunchContext::ProcessState& LaunchContext::ProcessState::operator=(\n    ProcessState&& other) noexcept = default;\nLaunchContext::ProcessState::~ProcessState() = default;', '''#if BUILDFLAG(IS_MAC)
LaunchContext::ProcessState& LaunchContext::ProcessState::operator=(
    ProcessState&& other) noexcept {
  if (this == &other) return *this;
  if (process.IsValid())
    TerminateNativeProcess(std::move(process), std::move(aux_child_lifetime),
                           std::move(read_file), std::move(write_file));
  process = std::move(other.process);
  aux_child_lifetime = std::move(other.aux_child_lifetime);
  read_file = std::move(other.read_file);
  write_file = std::move(other.write_file);
  return *this;
}
LaunchContext::ProcessState::~ProcessState() {
  // Background launch can finish after its reply receiver has gone away.
  // A process handle destructor is not child termination or original reap.
  if (process.IsValid())
    TerminateNativeProcess(std::move(process), std::move(aux_child_lifetime),
                           std::move(read_file), std::move(write_file));
}
#else
LaunchContext::ProcessState& LaunchContext::ProcessState::operator=(
    ProcessState&& other) noexcept = default;
LaunchContext::ProcessState::~ProcessState() = default;
#endif'''),
('    const std::string& native_host_name) {', '''    const std::string& native_host_name
#if BUILDFLAG(IS_MAC)
    , std::shared_ptr<const AuxNativeMessagingProfileOwner> profile_owner
#endif
    ) {'''),
('          command_line, native_hosts_executables_launch_directly)) {', '''          command_line, native_hosts_executables_launch_directly
#if BUILDFLAG(IS_MAC)
          , std::move(profile_owner), origin, native_host_name
#endif
          )) {'''),
('    if (result.process_state.has_value()) {\n      auto& process_state', '''#if !BUILDFLAG(IS_MAC)
    if (result.process_state.has_value()) {
      auto& process_state'''),
('    }\n    return;\n  }\n  DCHECK_CALLED_ON_VALID_SEQUENCE(weak_this->sequence_checker_);', '''    }
#endif  // On Mac ProcessState owns pipe closure and original reap.
    return;
  }
  DCHECK_CALLED_ON_VALID_SEQUENCE(weak_this->sequence_checker_);'''),
])
edit('chrome/browser/extensions/api/messaging/launch_context_posix.cc', [
('    bool native_hosts_executables_launch_directly) {', '''    bool native_hosts_executables_launch_directly
#if BUILDFLAG(IS_MAC)
    , std::shared_ptr<const AuxNativeMessagingProfileOwner> profile_owner,
    const GURL& origin, const std::string& native_host_name
#endif
    ) {'''),
('  auto custody = AuxNativeMessagingLifetime::Reserve();', '''  auto custody = AuxNativeMessagingLifetime::Reserve(
      std::move(profile_owner), origin.spec(), native_host_name);'''),
])
(ROOT / 'changes.json').write_text(json.dumps({'format': 'aux.native-host-ownership-cleanup.v1', 'sourceRoot': str(SOURCE), 'files': changes}, indent=2) + '\n')
patch = []
for change in changes:
    path = change['path']
    patch.extend(difflib.unified_diff((ROOT / 'baseline' / path).read_text().splitlines(True),
                                    (ROOT / 'source' / path).read_text().splitlines(True),
                                    fromfile='a/' + path, tofile='b/' + path))
(ROOT / 'native-host.patch').write_text(''.join(patch))
print(json.dumps({'files': len(changes), 'anchors': sum(len(x['anchors']) for x in changes)}))
