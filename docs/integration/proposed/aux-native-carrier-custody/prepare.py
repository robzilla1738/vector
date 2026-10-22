#!/usr/bin/env python3
"""Prepare only reviewed source copies; never edits a Chromium checkout."""
import argparse, hashlib, json
from pathlib import Path
HERE = Path(__file__).resolve().parent

def digest(data): return hashlib.sha256(data).hexdigest()
def once(text, old, new):
    if text.count(old) != 1: raise ValueError('source anchor count differs: ' + old[:80])
    return text.replace(old, new)

def prepare(source, output):
    manifest = json.loads((HERE / 'source-pins.json').read_text())
    if output.exists(): raise ValueError('output must not exist')
    texts = {}
    for name, expected in manifest['inputs'].items():
        data = (source / name).read_bytes()
        if digest(data) != expected: raise ValueError('source pin differs: ' + name)
        texts[name] = data.decode()
    p = 'chrome/browser/aux/'
    name = p + 'installation_auth.cc'
    text = texts[name]
    text = once(text, '#include "base/path_service.h"', '#include "base/path_service.h"\n#include "base/no_destructor.h"\n#include "base/functional/bind.h"\n#include "base/task/thread_pool.h"')
    text = once(text, 'constexpr size_t kMaxCarrierOutput = 32768;', '''InstallationCarrierCustody& CarrierCustody() {
  static base::NoDestructor<InstallationCarrierCustody> custody;
  return *custody;
}
constexpr size_t kMaxCarrierOutput = 32768;''')
    text = once(text, '  auto env = base::Environment::Create();\n  // This switch', '  auto custody = CarrierCustody().BeginCall();\n  if (!custody) return std::nullopt;\n  auto env = base::Environment::Create();\n  // This switch')
    text = once(text, '  auto process = base::LaunchProcess(line, options);', '''  base::Process process;
  const bool launched = custody->LaunchIfAdmitted([&] {
    process = base::LaunchProcess(line, options);
    return process.IsValid();
  });''')
    text = once(text, '  if (!process.IsValid())\n    return std::nullopt;', '  if (!launched)\n    return std::nullopt;')
    text = once(text, '''    // The process is still our unreaped child, so this PID cannot have been
    // reused. Kill only this carrier; asynchronous cleanup avoids unbounded
    // wait.
    process.Terminate(1, false);
    base::EnsureProcessTerminated(std::move(process));''', '''    // Only our unreaped child is terminated. Cancellation is not completion:
    // retain the call until an actual wait observes exit. A failed task/wait
    // leaves an unresolved-child blocker; it never manufactures a drain.
    process.Terminate(1, false);
    base::ThreadPool::PostTask(
        FROM_HERE,
        {base::MayBlock(), base::TaskShutdownBehavior::CONTINUE_ON_SHUTDOWN},
        base::BindOnce(
            &internal::WaitForInstallationCarrierExit,
            std::move(process), custody));''')
    text = once(text, '  if (exit_code != 0)\n    return std::nullopt;', '  custody->ObservedChildExit();\n  if (exit_code != 0)\n    return std::nullopt;')
    text = once(text, '} // namespace\nbase::FilePath StateHome()', '''} // namespace
void internal::WaitForInstallationCarrierExit(
    base::Process child,
    std::shared_ptr<InstallationCarrierCustody::Call> retained) {
  int code = 0;
  if (child.WaitForExit(&code)) retained->ObservedChildExit();
}
InstallationCarrierCustody::Snapshot CloseInstallationCarrierAdmission() {
  return CarrierCustody().CloseAdmission();
}
InstallationCarrierCustody::Snapshot InspectInstallationCarrierCustody() {
  return CarrierCustody().Inspect();
}
base::FilePath StateHome()''')
    texts[name] = text
    name = p + 'installation_auth.h'
    text = once(texts[name], '#include "base/files/file_path.h"', '#include "base/files/file_path.h"\n#include "chrome/browser/aux/installation_carrier_custody.h"\n#include "base/process/process.h"')
    text = once(text, '// Blocking functions:', '''namespace internal {
// Blocking production timeout reaper, shared with the synthetic-child fixture.
// The caller transfers its owned unreaped child and retained call; never a PID.
void WaitForInstallationCarrierExit(
    base::Process child,
    std::shared_ptr<InstallationCarrierCustody::Call> retained);
}
// Direct carrier scope only; callable while worker cleanup remains active.
// Admission is terminal for this browser process. Never authorizes migration.
InstallationCarrierCustody::Snapshot CloseInstallationCarrierAdmission();
InstallationCarrierCustody::Snapshot InspectInstallationCarrierCustody();
// Blocking functions:''')
    texts[name] = text
    name = p + 'browser_platform.cc'
    text = texts[name]
    text = once(text, '''    DirectDaemonQuiesceCallback done) {
  direct_daemon_admission_closed_ = true;''', '''    DirectDaemonQuiesceCallback done) {
  // Close separate carrier launches before waiting on the daemon. The daemon
  // result remains direct-daemon-only; callers must inspect carrier custody.
  CloseInstallationCarrierAdmission();
  direct_daemon_admission_closed_ = true;''')
    text = once(text, 'void BrowserPlatform::Shutdown() {\n  direct_daemon_admission_closed_', 'void BrowserPlatform::Shutdown() {\n  CloseInstallationCarrierAdmission();\n  direct_daemon_admission_closed_')
    texts[name] = text
    texts[p + 'installation_carrier_custody.h'] = (HERE / 'source/installation_carrier_custody.h').read_text()
    output.mkdir(parents=True)
    for name, text in texts.items():
        target = output / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text)
    return {name: digest(text.encode()) for name, text in texts.items()}

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-root', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    print(json.dumps(prepare(args.source_root, args.output), indent=2))
