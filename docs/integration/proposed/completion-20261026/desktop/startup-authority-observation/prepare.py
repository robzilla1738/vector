"""Prepare counted source only; never projects, builds, signs or launches."""
from pathlib import Path
import difflib, hashlib, json
HERE = Path(__file__).resolve().parent
NATIVE = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
CHANGES = {
'chrome/browser/aux/AuxNativeParentColdLaunch.h': [
('#include "base/files/file_path.h"', '#include "base/files/file_path.h"\n#include "base/time/time.h"'),
('SelectedStateHomeResolution StartSealedNativeDaemonBeforeProfiles();', '''SelectedStateHomeResolution StartSealedNativeDaemonBeforeProfiles();
// Observation of the existing one-shot startup budget, never a new allowance.
base::TimeTicks NativeBrowserStartupDeadline();''')],
'chrome/browser/aux/AuxNativeParentColdLaunch.cc': [
('  bool attempted = false;\n  std::optional<LocationPreflight> location;', '  bool attempted = false;\n  base::TimeTicks deadline;\n  std::optional<LocationPreflight> location;'),
('SelectedStateHomeResolution StartSealedNativeDaemonBeforeProfiles() {', '''base::TimeTicks NativeBrowserStartupDeadline() {
  auto& attempt = CurrentAttempt();
  if (getpid() != attempt.process) return {};
  std::lock_guard<std::mutex> lock(attempt.mutex);
  return attempt.deadline;
}
SelectedStateHomeResolution StartSealedNativeDaemonBeforeProfiles() {'''),
('  const auto deadline = base::TimeTicks::Now() + kStartupLimit;\n  while (base::TimeTicks::Now() < deadline) {', '''  const auto deadline = base::TimeTicks::Now() + kStartupLimit;
  {
    std::lock_guard<std::mutex> lock(attempt.mutex);
    attempt.deadline = deadline;
  }
  while (base::TimeTicks::Now() < deadline) {''')],
'chrome/browser/aux/AuxSelectedStateHome.cc': [
('#include "AuxSelectedStateHome.h"', '#include "AuxSelectedStateHome.h"\n#include "AuxNativeParentColdLaunch.h"'),
('''  if (!admitted_generation) {
    auto reply = owner->GetBrowserStartupLease(2'000);''', '''  if (!admitted_generation) {
    const auto deadline = NativeBrowserStartupDeadline();
    auto current_startup = [&] {
      if (deadline.is_null() || base::TimeTicks::Now() >= deadline) return false;
      const auto current = owner->InspectReadyPulse();
      const auto child = owner->InspectOwnedChild();
      if (!current || !Fresh(*current) || current->generation != pulse->generation ||
          current->exports < pulse->exports || !roots->Revalidate() ||
          child.closed || child.wrong_process || child.exit_observed_and_reaped ||
          child.exit_ownership_unknown || child.child_pid <= 1) return false;
      std::lock_guard<std::mutex> lock(state.mutex);
      return !state.closed && !state.browser_shutdown_phase && !state.initializing &&
          state.selected == owner && !state.browser_generation &&
          base::TimeTicks::Now() < deadline;
    };
    auto next_slice = [&]() -> uint32_t {
      // RequestAuthority may send/receive twice when retiring a failed reply.
      // Bound all four transport waits by the remaining original budget.
      const int64_t remaining = (deadline - base::TimeTicks::Now()).InMilliseconds();
      return remaining < 4 ? 0 : static_cast<uint32_t>(std::min<int64_t>(2'000, remaining / 4));
    };
    auto transient = [](DaemonAuthorityStatus status) {
      return status == DaemonAuthorityStatus::timedOut || status == DaemonAuthorityStatus::pending;
    };
    auto pause_observation = [&] {
      const auto remaining = deadline - base::TimeTicks::Now();
      if (remaining.is_positive())
        base::PlatformThread::Sleep(std::min(base::Milliseconds(25), remaining));
    };
    DaemonAuthorityReply reply;
    for (;;) {
      if (!current_startup()) return refused(6);
      const auto slice = next_slice();
      if (!slice) return refused(6);
      // Same operation/body retains the original native nonce. After any send
      // attempt this observes that request; it never repeats the root grant.
      reply = owner->GetBrowserStartupLease(slice);
      if (!current_startup()) return refused(6);
      if (!transient(reply.status)) break;
      pause_observation();
    }'''),
('''    if (owner->AcceptAuthorityReply(reply, 2'000) != DaemonAuthorityStatus::ready) return refused(11);''', '''    for (;;) {
      if (!current_startup()) return refused(11);
      const auto slice = next_slice();
      if (!slice) return refused(11);
      // Retain this exact ready publication across ACK uncertainty. Repeating
      // its nonce-bound ACK is idempotent; a timeout is never acceptance.
      const auto accepted = owner->AcceptAuthorityReply(reply, slice);
      if (!current_startup()) return refused(11);
      if (accepted == DaemonAuthorityStatus::ready) break;
      if (!transient(accepted)) return refused(11);
      pause_observation();
    }''')]
}

def main():
    rows=[];patch=[]
    for name, changes in CHANGES.items():
        baseline = HERE/'baseline'/name
        source = HERE/'source'/name
        if not baseline.exists():
            baseline.parent.mkdir(parents=True,exist_ok=True)
            baseline.write_bytes((NATIVE/name).read_bytes())
        before=baseline.read_text();after=before
        for old,new in changes:
            if after.count(old)!=1:raise ValueError(f'Expected exactly one anchor: {name}: {old[:70]}')
            after=after.replace(old,new)
        source.parent.mkdir(parents=True,exist_ok=True);source.write_text(after)
        rows.append({'path':name,'beforeSha256':hashlib.sha256(before.encode()).hexdigest(),'afterSha256':hashlib.sha256(after.encode()).hexdigest(),'anchors':len(changes)})
        patch.extend(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='a/'+name,tofile='b/'+name))
    (HERE/'native.patch').write_text(''.join(patch))
    (HERE/'source-plan.json').write_text(json.dumps({'scope':'proposal only; conditional on observed transient startup authorization failure','projected':False,'compiled':False,'files':rows,'totalAnchors':sum(x['anchors'] for x in rows)},indent=2)+'\n')
    print(json.dumps({'files':len(rows),'anchors':sum(x['anchors'] for x in rows),'projected':False}))
if __name__=='__main__':main()
