#!/usr/bin/env python3
"""Count-checked proposal only; never edits the actual native inputs or builds."""
from pathlib import Path
import hashlib,json,difflib
HERE=Path(__file__).resolve().parent
ROOT=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha=lambda b:hashlib.sha256(b).hexdigest()
files=[]
def project(name,changes):
 original=(ROOT/name).read_bytes();text=original.decode()
 for item in changes:
  assert text.count(item['find'])==item['count']==1,(name,item['name'])
  text=text.replace(item['find'],item['replace'])
 target=HERE/'source'/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(text)
 assert (ROOT/name).read_bytes()==original
 files.append({'path':name,'inputSha256':sha(original),'outputSha256':sha(text.encode()),'source':str(target),'anchors':changes})
def edit(name,find,replace):return {'name':name,'find':find,'replace':replace,'count':1}
project('base/process/launch.h',[edit('Optional borrowed macOS directory capability',
 '  base::FilePath current_directory;\n',
 '  base::FilePath current_directory;\n#if BUILDFLAG(IS_MAC)\n  // Native caller retains this actual directory through LaunchProcess. Never\n  // combine with current_directory. Default preserves every existing launch.\n  int current_directory_fd = -1;\n#endif\n')])
project('base/process/launch_mac.cc',[
 edit('Explicit directory metadata dependency','#include "base/process/environment_internal.h"','#include "base/process/environment_internal.h"\n#include <sys/stat.h>'),
 edit('Native descriptor fchdir file action','  void Chdir(const char* path) {','  void Fchdir(int descriptor) {\n    if (__builtin_available(macOS 26, *)) {\n      DPSXCHECK(posix_spawn_file_actions_addfchdir(&file_actions_, descriptor));\n    } else {\n      DPSXCHECK(posix_spawn_file_actions_addfchdir_np(&file_actions_, descriptor));\n    }\n  }\n  void Chdir(const char* path) {'),
 edit('Refuse conflicting or non-directory capability before spawn','  TRACE_EVENT0("base", "LaunchProcess");',
 '  TRACE_EVENT0("base", "LaunchProcess");\n#if BUILDFLAG(IS_MAC)\n  if (options.current_directory_fd != -1) {\n    struct stat directory;\n    if (!options.current_directory.empty() || options.current_directory_fd < 0 ||\n        fstat(options.current_directory_fd, &directory) != 0 ||\n        !S_ISDIR(directory.st_mode)) {\n      return Process();\n    }\n  }\n#endif'),
 edit('Set child cwd from retained FD before descriptor actions','  PosixSpawnFileActions file_actions;','  PosixSpawnFileActions file_actions;\n#if BUILDFLAG(IS_MAC)\n  if (options.current_directory_fd >= 0) {\n    file_actions.Fchdir(options.current_directory_fd);\n  }\n#endif'),
])
project('chrome/browser/aux/AuxOwnedNativePeerChild.h',[edit('Finite signal producer on the actual waitable owned group','  bool LaunchOnce();','  bool LaunchOnce();\n  bool SignalOwnedProcessGroup(int signal);')])
project('chrome/browser/aux/AuxOwnedNativePeerChild.cc',[
 edit('Explicit finite signal dependency','#include <sys/wait.h>','#include <sys/wait.h>\n#include <signal.h>'),
 edit('Signal only exact still-waitable native child group',
 'ExchangeStatus OwnedNativePeerChild::ServicePeerOnce(uint32_t timeout_ms) {',
 '''bool OwnedNativePeerChild::SignalOwnedProcessGroup(int signal) {
  auto state = state_;
  if (getpid() != state->process ||
      (signal != SIGINT && signal != SIGTERM && signal != SIGHUP && signal != SIGWINCH)) return false;
  std::lock_guard<std::mutex> lock(state->mutex);
  if (!state->options.new_process_group || !state->child.IsValid() ||
      state->observation.exit_observed_and_reaped ||
      state->observation.exit_ownership_unknown) return false;
  const pid_t pid = state->child.Pid();
  siginfo_t observed{};
  if (pid <= 1 || waitid(P_PID, static_cast<id_t>(pid), &observed,
                         WEXITED | WNOHANG | WNOWAIT) != 0 || observed.si_pid != 0)
    return false;
  // This mutex also serializes the sole actual reaper. An exited child stays
  // waitable until that reaper, so this cannot signal a reused unrelated PID.
  return kill(-pid, signal) == 0;
}
ExchangeStatus OwnedNativePeerChild::ServicePeerOnce(uint32_t timeout_ms) {''')])
project('base/process/mac/aux_browser_descendant_engine.h',[
 edit('Native audited CLI custody query header dependency','#include <memory>','#include <memory>\n#include <bsm/audit.h>'),
 edit('Factual membership has no absence-as-manual result','enum class Result { pending, settled, unknown, refused };',
 'enum class Result { pending, settled, unknown, refused };\n// Only a kernel trailer supplies this token. A missing local observation is\n// unknown: it never proves that the client is a manual terminal or permits\n// selecting another profile. Managed includes reparented retained descendants.\nenum class CliClientMembership { managed, unknown };\nCliClientMembership InspectActualCliClient(audit_token_t kernel_peer) noexcept;')])
project('base/process/mac/aux_browser_descendant_engine.cc',[
 edit('Inspect retained identity under the existing custody lock',
 'Result InspectStream() noexcept {',
 '''CliClientMembership InspectActualCliClient(audit_token_t token) noexcept {
  if (!SameProcess()) return CliClientMembership::unknown;
  const Identity client = Id(token);
  if (client.pid <= 0 || !client.version) return CliClientMembership::unknown;
  auto& s = State(); std::lock_guard<std::mutex> lock(s.mutex);
  // Positive retained custody remains managed even if the stream later loses
  // certainty. Live stores the genuine original root through exec/reparenting.
  if (client == s.self || s.live.contains(client))
    return CliClientMembership::managed;
  for (const auto& birth : s.roots)
    if (birth.id == client) return CliClientMembership::managed;
  // This observer proves its own browser subtree, never the absence of a task
  // owner in another Aux instance or an earlier/reparented native lineage.
  return CliClientMembership::unknown;
}
Result InspectStream() noexcept {''')])
plan={'format':'aux.cli-native-embedding.proposal.v1','root':str(ROOT),'files':files,'nativeCheckoutChanged':False,'nativeBuildRun':False,'productExecuted':False,'runtimeAcceptance':False}
(HERE/'source-plan.json').write_text(json.dumps(plan,indent=2)+'\n')
patch=''.join(''.join(difflib.unified_diff((ROOT/r['path']).read_text().splitlines(True),Path(r['source']).read_text().splitlines(True),fromfile='a/'+r['path'],tofile='b/'+r['path']))for r in files)
(HERE/'native.patch').write_text(patch)
print(json.dumps({'proposal':True,'files':len(files),'anchors':sum(len(r['anchors'])for r in files),'nativeCheckoutChanged':False,'nativeBuildRun':False}))
