from pathlib import Path
import json,hashlib,difflib
root=Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
out=Path(__file__).resolve().parent;out.mkdir(parents=True,exist_ok=True)
files={};edits=[]
def edit(p,a,b):
 if p not in files:files[p]=[(root/p).read_text(),(root/p).read_text()]
 s=files[p][1];assert s.count(a)==1,(p,a[:80],s.count(a));files[p][1]=s.replace(a,b);edits.append({'path':p,'anchorSha256':hashlib.sha256(a.encode()).hexdigest(),'count':1})
p='chrome/browser/actor/ui/actor_ui_tab_controller.h'
edit(p,'  bool IsColdForAuxProfileSwitch() const;', '''  bool IsColdForAuxProfileSwitch() const;
  bool HasPendingAuxScrimUpdate() const;
  void RunAfterAuxScrimUpdate(base::OnceCallback<void(bool)> callback);''')
edit(p,'  void LeaveAuxCallback();','  void LeaveAuxCallback();\n  void NotifyAuxScrimWaiters(bool completed);')
edit(p,'  int aux_callback_depth_ = 0;','  std::vector<base::OnceCallback<void(bool)>> aux_scrim_waiters_;\n  int aux_callback_depth_ = 0;')
p='chrome/browser/actor/ui/actor_ui_tab_controller.cc'
edit(p,'#include "base/task/single_thread_task_runner.h"','#include "base/task/single_thread_task_runner.h"\n#include "base/task/sequenced_task_runner.h"')
edit(p,'ActorUiTabController::~ActorUiTabController() = default;', '''ActorUiTabController::~ActorUiTabController() {
  // Destruction is not successful timer completion. Deliver failure off-stack.
  NotifyAuxScrimWaiters(false);
}

bool ActorUiTabController::HasPendingAuxScrimUpdate() const {
  return update_scrim_background_debounce_timer_.IsRunning();
}

void ActorUiTabController::RunAfterAuxScrimUpdate(
    base::OnceCallback<void(bool)> callback) {
  CHECK(callback);
  if (update_scrim_background_debounce_timer_.IsRunning()) {
    aux_scrim_waiters_.push_back(std::move(callback));
    return;
  }
  base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
      FROM_HERE, base::BindOnce(std::move(callback), true));
}

void ActorUiTabController::NotifyAuxScrimWaiters(bool completed) {
  auto waiters = std::move(aux_scrim_waiters_);
  aux_scrim_waiters_.clear();
  for (auto& callback : waiters) {
    base::SequencedTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, base::BindOnce(std::move(callback), completed));
  }
}''')
edit(p,'void ActorUiTabController::UpdateScrimBackground() {\n  ++aux_callback_depth_;','''void ActorUiTabController::UpdateScrimBackground() {
  // Declared before callback_scope so original work and LeaveAuxCallback finish
  // before observers are posted, including the original early-return path.
  base::ScopedClosureRunner aux_scrim_completion(base::BindOnce(
      &ActorUiTabController::NotifyAuxScrimWaiters,
      aux_lifetime_factory_.GetWeakPtr(), true));
  ++aux_callback_depth_;''')
p='chrome/browser/ui/views/frame/aux_profile_switch_request.h'
edit(p,'''      uint64_t generation, Completion completion);

  base::WeakPtr<BrowserWindowInterface> sender_;''','''      uint64_t generation, Completion completion);
  static void OnCacheScrimUpdatesComplete(
      base::WeakPtr<BrowserWindowInterface> sender,
      base::WeakPtr<Profile> source, base::WeakPtr<Profile> target,
      uint64_t generation, Completion completion, std::vector<bool> completed);

  base::WeakPtr<BrowserWindowInterface> sender_;''')
edit(p,'#include <optional>','#include <optional>\n#include <vector>')
p='chrome/browser/ui/views/frame/aux_profile_switch_request.cc'
edit(p,'#include <utility>','#include <utility>\n#include <algorithm>\n#include <vector>')
edit(p,'#include "base/check.h"','#include "base/check.h"\n#include "base/barrier_callback.h"\n#include "chrome/browser/actor/ui/actor_ui_tab_controller.h"\n#include "chrome/browser/ui/tabs/tab_strip_model.h"\n#include "chrome/browser/ui/views/frame/aux_profile_switch_workspaces.h"')
a='''  // No raw browser/profile survives the asynchronous boundary. Changed source,
  // newer selection, teardown or active work rejects through the original path.
  // Exactly one continuation; a recreated cache or genuine busy owner cannot
  // turn this into an automatic retry loop.
  OnProfileLoaded(sender, source, generation,
                  /*allow_cache_continuation=*/false,
                  std::move(completion), target.get());'''
b='''  // Wait only on the original scrim updates already pending in this request's
  // fixed caches. No cache creation, timer reset, polling or readiness override.
  const auto* state = sender ? BrowserInitState::From(sender.get()) : nullptr;
  if (!sender || !source || !target || !state ||
      sender->GetProfile() != source.get() ||
      !state->IsCurrentAuxProfileSwitchRequest(generation)) {
    if (completion) {
      std::move(completion).Run(nullptr);
    }
    return;
  }
  std::vector<actor::ui::ActorUiTabController*> pending;
  for (auto* profile : {source.get(), target.get()}) {
    auto* cache = FindProfileSwitchWorkspace(sender.get(), profile->GetPath());
    if (!cache) {
      if (completion) {
        std::move(completion).Run(nullptr);
      }
      return;
    }
    auto* model = cache->GetTabStripModel();
    for (int i = 0; model && i < model->count(); ++i) {
      auto* controller = actor::ui::ActorUiTabController::Get(
          model->GetTabAtIndex(i)->GetUnownedUserDataHost());
      if (controller && controller->HasPendingAuxScrimUpdate()) {
        pending.push_back(controller);
      }
    }
  }
  if (pending.empty()) {
    OnCacheScrimUpdatesComplete(sender, source, target, generation,
                               std::move(completion), {});
    return;
  }
  auto settled = base::BarrierCallback<bool>(
      pending.size(), base::BindOnce(
          &ProfileSwitchRequest::OnCacheScrimUpdatesComplete,
          sender, source, target, generation, std::move(completion)));
  for (auto* actor : pending) {
    // Registration never invokes callbacks synchronously. Raw owners are used
    // only on this stack; timer/destruction notifications retain only the callbacks.
    actor->RunAfterAuxScrimUpdate(base::BindOnce(settled));
  }
}

void ProfileSwitchRequest::OnCacheScrimUpdatesComplete(
    base::WeakPtr<BrowserWindowInterface> sender,
    base::WeakPtr<Profile> source, base::WeakPtr<Profile> target,
    uint64_t generation, Completion completion, std::vector<bool> completed) {
  if (!std::ranges::all_of(completed, [](bool value) { return value; })) {
    if (completion) {
      std::move(completion).Run(nullptr);
    }
    return;
  }
  // One fresh full transaction, never another wait/retry. It rechecks source
  // identity/generation, cache registration and every original active guard.
  OnProfileLoaded(sender, source, generation,
                  /*allow_cache_continuation=*/false,
                  std::move(completion), target.get());'''
edit(p,a,b)
patch='';meta=[]
for p,(old,new) in files.items():
 dest=out/'sources'/p;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(new)
 patch+=''.join(difflib.unified_diff(old.splitlines(True),new.splitlines(True),fromfile='a/'+p,tofile='b/'+p))
 meta.append({'path':p,'baselineSha256':hashlib.sha256(old.encode()).hexdigest(),'outputSha256':hashlib.sha256(new.encode()).hexdigest()})
(out/'native.patch').write_text(patch);(out/'files.json').write_text(json.dumps({'baseComposition':'v597','files':meta,'edits':edits},indent=2)+'\n');print(len(files),len(edits))
