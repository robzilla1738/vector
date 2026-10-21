// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/ui/views/frame/aux_profile_switch_request.h"

#include <utility>
#include <algorithm>
#include <vector>

#include "base/check.h"
#include "base/barrier_callback.h"
#include "chrome/browser/actor/ui/actor_ui_tab_controller.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/frame/aux_profile_switch_workspaces.h"
#include "base/functional/bind.h"
#include "base/time/time.h"
#include "base/task/sequenced_task_runner.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/lifetime/browser_shutdown.h"
#include "chrome/browser/ui/simple_message_box.h"
#include "chrome/browser/ui/unload_controller.h"
#include "mojo/public/cpp/bindings/callback_helpers.h"
#include "chrome/browser/profiles/profile_window.h"
#include "chrome/browser/ui/browser.h"
#include "chrome/browser/ui/browser_init_state.h"
#include "chrome/browser/ui/browser_window.h"
#include "chrome/browser/ui/browser_window/public/browser_window_features.h"
#include "chrome/browser/ui/views/frame/aux_profile_switch_owner.h"

namespace aux {
namespace {
void ReportCurrentSwitchFailure(
    base::WeakPtr<BrowserWindowInterface> sender,
    base::WeakPtr<Profile> source, uint64_t generation,
    const std::u16string& message) {
  const auto* state = sender ? BrowserInitState::From(sender.get()) : nullptr;
  const auto* unload = sender ? UnloadController::From(sender.get()) : nullptr;
  if (!sender || !source || !state || !unload || !sender->GetWindow() ||
      sender->GetProfile() != source.get() ||
      !state->IsCurrentAuxProfileSwitchRequest(generation) ||
      unload->is_attempting_to_close_browser() || unload->is_delete_scheduled() ||
      browser_shutdown::HasShutdownStarted() || browser_shutdown::IsTryingToQuit()) {
    return;
  }
  chrome::ShowWarningMessageBoxAsync(sender->GetWindow()->GetNativeWindow(),
                                    u"Couldn't switch profiles", message);
}
}  // namespace
ProfileSwitchRequest::ProfileSwitchRequest(BrowserWindowInterface& sender,
                                         ProfilePreviewViews& preview)
    : sender_(sender.GetWeakPtr()), preview_(preview) {}

ProfileSwitchRequest::~ProfileSwitchRequest() = default;

void ProfileSwitchRequest::Start(const base::FilePath& target,
                                 Completion completion) {
  CHECK(completion);
  // Supplied4655ec8..cc ignores a new selection while one is committing.
  if (pending_ || loading_) {
    return;
  }
  loading_ = true;
  completion = base::BindOnce(&ProfileSwitchRequest::Complete,
                              weak_factory_.GetWeakPtr(), std::move(completion));
  auto alive = weak_factory_.GetWeakPtr();
  // Supplied465841c restores the actual ProfilePagePreviewPageView before
  // resolving the sender and dispatching the asynchronous profile load.
  preview_->Restore(false);
  if (!alive) {
    return;
  }
  Dispatch(sender_, target, std::move(completion));
}

void ProfileSwitchRequest::Dispatch(
    base::WeakPtr<BrowserWindowInterface> sender_weak,
    base::FilePath target, Completion completion) {
  auto* sender = sender_weak ? static_cast<Browser*>(sender_weak.get()) : nullptr;
  auto* profile = sender ? sender->GetProfile() : nullptr;
  if (target.empty() || !profile || !profile->IsRegularProfile() ||
      sender->GetType() != BrowserWindowInterface::TYPE_NORMAL) {
    if (completion) {
      std::move(completion).Run(nullptr);
    }
    return;
  }
  auto* state = BrowserInitState::From(sender);
  if (!state || state->is_aux_profile_switch_cache()) {
    if (completion) {
      std::move(completion).Run(nullptr);
    }
    return;
  }
  const uint64_t generation = state->BeginAuxProfileSwitchRequest();
  if (target == profile->GetOriginalProfile()->GetPath()) {
    if (auto* window = BrowserWindow::FromBrowser(sender)) {
      window->Activate();
    }
    if (completion) {
      std::move(completion).Run(sender_weak ? sender : nullptr);
    }
    return;
  }
  state->KeepAuxProfileSwitchProfileAlive(profile);
  // This is the actual supplied load-only algorithm, including immediate
  // completion for initialized profiles and null-load callback destruction.
  // It does not find/open another Browser or cancel an underlying load.
  profiles::LoadProfileAsync(
      target, mojo::WrapCallbackWithDefaultInvokeIfNotRun(
          base::BindOnce(&ProfileSwitchRequest::OnProfileLoaded,
                         sender_weak, profile->GetWeakPtr(), generation,
                         /*allow_cache_continuation=*/true,
                         std::move(completion)),
          static_cast<Profile*>(nullptr)));
}

void ProfileSwitchRequest::Complete(Completion completion, Browser* result) {
  loading_ = false;
  if (completion) {
    std::move(completion).Run(result);
  }
}

void ProfileSwitchRequest::OnProfileLoaded(
    base::WeakPtr<BrowserWindowInterface> sender_weak,
    base::WeakPtr<Profile> source, uint64_t generation,
    bool allow_cache_continuation, Completion completion, Profile* target) {
  auto* sender = sender_weak ? static_cast<Browser*>(sender_weak.get()) : nullptr;
  const auto* state = sender ? BrowserInitState::From(sender) : nullptr;
  if (!sender || !source || !target || !state ||
      sender->GetProfile() != source.get() ||
      !state->IsCurrentAuxProfileSwitchRequest(generation)) {
    if (!target) {
      ReportCurrentSwitchFailure(sender_weak, source, generation,
          u"The selected profile could not be loaded. Try selecting it again.");
    }
    if (completion) {
      std::move(completion).Run(nullptr);
    }
    return;
  }
  PrepareProfileSwitchWorkspace(sender, target,
      base::BindOnce(&ProfileSwitchRequest::OnWorkspaceReady, sender_weak, source,
                     target->GetWeakPtr(), generation, allow_cache_continuation,
                     std::move(completion)));
}

void ProfileSwitchRequest::OnWorkspaceReady(
    base::WeakPtr<BrowserWindowInterface> sender_weak,
    base::WeakPtr<Profile> source, base::WeakPtr<Profile> target_weak,
    uint64_t generation, bool allow_cache_continuation,
    Completion completion, bool ready) {
  auto* sender = sender_weak ? static_cast<Browser*>(sender_weak.get()) : nullptr;
  const auto* state = sender ? BrowserInitState::From(sender) : nullptr;
  if (!ready || !sender || !state || !source || !target_weak ||
      sender->GetProfile() != source.get() ||
      !state->IsCurrentAuxProfileSwitchRequest(generation)) {
    if (!ready) {
      auto* cache = sender && target_weak
          ? FindProfileSwitchWorkspace(sender, target_weak->GetPath()) : nullptr;
      const auto* cache_state = cache ? BrowserInitState::From(cache) : nullptr;
      const bool ambiguous = cache_state && cache_state->aux_workspace_restore_state() ==
          BrowserInitState::AuxWorkspaceRestoreState::kAmbiguous;
      ReportCurrentSwitchFailure(sender_weak, source, generation, ambiguous
          ? u"This profile has multiple saved windows or a popup. Aux has left "
            u"that session untouched. Open the profile in its own window to "
            u"restore and organize those windows before switching it here."
          : u"The profile's saved workspace could not be prepared. Finish any "
            u"pending profile activity, then try again or reopen Aux.");
    }
    if (completion) std::move(completion).Run(nullptr);
    return;
  }
  auto* target = target_weak.get();
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
  }
  if (!sender_weak || !switched) {
    ReportCurrentSwitchFailure(sender_weak, source, generation,
        u"Aux could not safely switch this window yet. Finish open dialogs "
        u"or pending browser activity, then select the profile again.");
    // Rejection and awaiting the genuine profile security gate both preserve
    // the original null Browser completion; a loaded Profile is not success.
    if (completion) {
      std::move(completion).Run(nullptr);
    }
    return;
  }
  if (auto* window = BrowserWindow::FromBrowser(sender)) {
    window->Activate();
  }
  if (completion) {
    std::move(completion).Run(sender_weak ? sender : nullptr);
  }
}

void ProfileSwitchRequest::ContinueAfterCacheSetup(
    base::WeakPtr<BrowserWindowInterface> sender,
    base::WeakPtr<Profile> source, base::WeakPtr<Profile> target,
    uint64_t generation, Completion completion) {
  // Wait only on the original scrim updates already pending in this request's
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
    ReportCurrentSwitchFailure(sender, source, generation,
        u"The profile workspace was closed before preparation finished. "
        u"Select the profile again to retry.");
    if (completion) {
      std::move(completion).Run(nullptr);
    }
    return;
  }
  // One fresh full transaction, never another wait/retry. It rechecks source
  // identity/generation, cache registration and every original active guard.
  OnProfileLoaded(sender, source, generation,
                  /*allow_cache_continuation=*/false,
                  std::move(completion), target.get());
}

void ProfileSwitchRequest::QueuePreviewCommit(base::FilePath target,
                                              Completion completion) {
  CHECK(completion);
  if (pending_ || loading_) {
    return;
  }
  CHECK(!preview_->empty());
  pending_.emplace(Pending{std::move(target), std::move(completion)});
}

void ProfileSwitchRequest::OnPreviewFrame() {
  if (!pending_) {
    return;
  }
  const uint64_t generation = ++generation_;
  // Supplied464b560..5f8: weak owner + captured generation, 50,000 us.
  settle_timer_.Start(
      FROM_HERE, base::Milliseconds(50),
      base::BindOnce(&ProfileSwitchRequest::CommitSettledPreview,
                     weak_factory_.GetWeakPtr(), generation));
}

void ProfileSwitchRequest::CommitSettledPreview(uint64_t generation) {
  if (generation != generation_ || !pending_) {
    return;
  }
  settle_timer_.Stop();
  auto pending = std::move(*pending_);
  pending_.reset();
  Start(pending.target, std::move(pending.completion));
}

void ProfileSwitchRequest::CancelPendingPreviewCommit() {
  pending_.reset();
  ++generation_;
  settle_timer_.Stop();
}
}  // namespace aux
