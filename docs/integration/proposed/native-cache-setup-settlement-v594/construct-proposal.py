from pathlib import Path
import json,hashlib,difflib
root=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
out=Path(__file__).resolve().parent;out.mkdir(parents=True,exist_ok=True)
files={};edits=[]
def edit(p,a,b):
 if p not in files: files[p]=[(root/p).read_text(),(root/p).read_text()]
 s=files[p][1];assert s.count(a)==1,(p,a[:80],s.count(a));files[p][1]=s.replace(a,b);edits.append({'path':p,'anchorSha256':hashlib.sha256(a.encode()).hexdigest(),'count':1})
p='chrome/browser/ui/views/frame/aux_profile_switch_transaction.h'
edit(p,'enum class Result { kRejected, kNoChange, kAwaitingSecurity, kSwitched };','enum class Result {\n    kRejected, kNoChange, kAwaitingSecurity, kAwaitingCacheSetup, kSwitched\n  };')
p='chrome/browser/ui/views/frame/aux_profile_switch_transaction.cc'
edit(p,'  // These fixed-identity caches are real Browsers, never arbitrary user windows.\n  auto* old_window', '''  // Initial native cache construction/attachment posts real Actor UI work.
  // Do not reinterpret those outstanding callbacks as idle or cancel them.
  bool cache_setup_changed =
      !FindProfileSwitchWorkspace(&browser, previous->GetPath()) ||
      !FindProfileSwitchWorkspace(&browser, target->GetPath());
  // These fixed-identity caches are real Browsers, never arbitrary user windows.
  auto* old_window''')
edit(p,'  if (next_cache.GetTabStripModel()->empty()) {\n    chrome::AddAndReturnTabAt', '  if (next_cache.GetTabStripModel()->empty()) {\n    cache_setup_changed = true;\n    chrome::AddAndReturnTabAt')
edit(p,'  // Cache creation can synchronously invoke real observers. New clients or','''  if (cache_setup_changed) {
    // No source binding phase, tab transfer or identity mutation has begun.
    // The caller may resume once after original posted setup work. It must
    // create a fresh binding plan and pass every existing admission check.
    return Result::kAwaitingCacheSetup;
  }
  // Cache creation can synchronously invoke real observers. New clients or''')
p='chrome/browser/ui/browser_window/public/browser_window_features.h'
edit(p,'  bool RunAuxProfileSwitch(Profile* target);','  bool RunAuxProfileSwitch(Profile* target,\n                           bool* awaiting_cache_setup = nullptr);')
p='chrome/browser/ui/browser_window/internal/browser_window_features_aux_profile_switch.cc'
edit(p,'bool BrowserWindowFeatures::RunAuxProfileSwitch(Profile* target) {','''bool BrowserWindowFeatures::RunAuxProfileSwitch(Profile* target,
                                               bool* awaiting_cache_setup) {
  if (awaiting_cache_setup) {
    *awaiting_cache_setup = false;
  }''')
edit(p,'  return result == aux::ProfileSwitchTransaction::Result::kSwitched ||','''  if (awaiting_cache_setup) {
    *awaiting_cache_setup =
        result == aux::ProfileSwitchTransaction::Result::kAwaitingCacheSetup;
  }
  return result == aux::ProfileSwitchTransaction::Result::kSwitched ||''')
p='chrome/browser/ui/browser_init_state.h'
edit(p,'  uint64_t aux_profile_switch_workspace_id() const {','''  // Cancels stale asynchronous selections without cancelling profile loading.
  uint64_t BeginAuxProfileSwitchRequest() {
    return ++aux_profile_switch_request_generation_;
  }
  bool IsCurrentAuxProfileSwitchRequest(uint64_t generation) const {
    return generation == aux_profile_switch_request_generation_;
  }
  uint64_t aux_profile_switch_workspace_id() const {''')
edit(p,'  const uint64_t aux_profile_switch_workspace_id_;','  const uint64_t aux_profile_switch_workspace_id_;\n  uint64_t aux_profile_switch_request_generation_ = 0;')
p='chrome/browser/ui/views/frame/aux_profile_switch_request.h'
edit(p,'''  static void OnProfileLoaded(
      base::WeakPtr<BrowserWindowInterface> sender,
      Completion completion, Profile* target);''','''  static void OnProfileLoaded(
      base::WeakPtr<BrowserWindowInterface> sender,
      base::WeakPtr<Profile> source, uint64_t generation,
      bool allow_cache_continuation, Completion completion, Profile* target);
  static void ContinueAfterCacheSetup(
      base::WeakPtr<BrowserWindowInterface> sender,
      base::WeakPtr<Profile> source, base::WeakPtr<Profile> target,
      uint64_t generation, Completion completion);''')
p='chrome/browser/ui/views/frame/aux_profile_switch_request.cc'
edit(p,'#include "base/time/time.h"','#include "base/time/time.h"\n#include "base/task/sequenced_task_runner.h"')
edit(p,'  if (target == profile->GetOriginalProfile()->GetPath()) {','  const uint64_t generation = state->BeginAuxProfileSwitchRequest();\n  if (target == profile->GetOriginalProfile()->GetPath()) {')
edit(p,'                            sender_weak, std::move(completion)));','''                            sender_weak, profile->GetWeakPtr(), generation,
                            /*allow_cache_continuation=*/true,
                            std::move(completion)));''')
edit(p,'''    base::WeakPtr<BrowserWindowInterface> sender_weak,
    Completion completion, Profile* target) {
  auto* sender = sender_weak ? static_cast<Browser*>(sender_weak.get()) : nullptr;
  if (!sender || !target) {''','''    base::WeakPtr<BrowserWindowInterface> sender_weak,
    base::WeakPtr<Profile> source, uint64_t generation,
    bool allow_cache_continuation, Completion completion, Profile* target) {
  auto* sender = sender_weak ? static_cast<Browser*>(sender_weak.get()) : nullptr;
  const auto* state = sender ? BrowserInitState::From(sender) : nullptr;
  if (!sender || !source || !target || !state ||
      sender->GetProfile() != source.get() ||
      !state->IsCurrentAuxProfileSwitchRequest(generation)) {''')
edit(p,'  const bool switched = sender->GetFeatures().RunAuxProfileSwitch(target);','''  const auto target_weak = target->GetWeakPtr();
  bool awaiting_cache_setup = false;
  const bool switched = sender->GetFeatures().RunAuxProfileSwitch(
      target, &awaiting_cache_setup);
  if (sender_weak && target_weak && awaiting_cache_setup && allow_cache_continuation) {
    // First turn runs native attachment notifications. Their original
    // ConcurrentClosures::Done posts its completion behind this first turn.
    // Second turn then re-enters all guards; queue turns are not idle proof.
    auto resume = base::BindOnce(&ProfileSwitchRequest::ContinueAfterCacheSetup,
                                sender_weak, source, target_weak,
                                generation, std::move(completion));
    base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, base::BindOnce([](base::OnceClosure continuation) {
          base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
              FROM_HERE, std::move(continuation));
        }, std::move(resume)));
    return;
  }''')
edit(p,'void ProfileSwitchRequest::QueuePreviewCommit(base::FilePath target,','''void ProfileSwitchRequest::ContinueAfterCacheSetup(
    base::WeakPtr<BrowserWindowInterface> sender,
    base::WeakPtr<Profile> source, base::WeakPtr<Profile> target,
    uint64_t generation, Completion completion) {
  // No raw browser/profile survives the asynchronous boundary. Changed source,
  // newer selection, teardown or active work rejects through the original path.
  // Exactly one continuation; a recreated cache or genuine busy owner cannot
  // turn this into an automatic retry loop.
  OnProfileLoaded(sender, source, generation,
                  /*allow_cache_continuation=*/false,
                  std::move(completion), target.get());
}

void ProfileSwitchRequest::QueuePreviewCommit(base::FilePath target,''')
patch='';metadata=[]
for p,(old,new) in files.items():
 target=out/'sources'/p;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(new)
 patch+=''.join(difflib.unified_diff(old.splitlines(True),new.splitlines(True),fromfile='a/'+p,tofile='b/'+p))
 metadata.append({'path':p,'baselineSha256':hashlib.sha256(old.encode()).hexdigest(),'outputSha256':hashlib.sha256(new.encode()).hexdigest()})
(out/'native.patch').write_text(patch);(out/'files.json').write_text(json.dumps({'baseComposition':'v594','files':metadata,'edits':edits},indent=2)+'\n');print(len(files),len(edits))
