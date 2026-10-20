// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/ui/views/frame/aux_profile_switch_request.h"

#include <utility>

#include "base/check.h"
#include "base/functional/bind.h"
#include "base/time/time.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_window.h"
#include "chrome/browser/ui/browser.h"
#include "chrome/browser/ui/browser_init_state.h"
#include "chrome/browser/ui/browser_window.h"
#include "chrome/browser/ui/browser_window/public/browser_window_features.h"
#include "chrome/browser/ui/views/frame/aux_profile_switch_owner.h"

namespace aux {
ProfileSwitchRequest::ProfileSwitchRequest(Browser& sender,
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
  auto* sender = sender_ ? static_cast<Browser*>(sender_.get()) : nullptr;
  auto* profile = sender ? sender->GetProfile() : nullptr;
  if (target.empty() || !profile || !profile->IsRegularProfile() ||
      sender->GetType() != BrowserWindowInterface::TYPE_NORMAL) {
    std::move(completion).Run(nullptr);
    return;
  }
  auto* state = BrowserInitState::From(sender);
  if (!state || state->is_aux_profile_switch_cache()) {
    std::move(completion).Run(nullptr);
    return;
  }
  auto sender_weak = sender_;
  if (target == profile->GetOriginalProfile()->GetPath()) {
    if (auto* window = BrowserWindow::FromBrowser(sender)) {
      window->Activate();
    }
    std::move(completion).Run(sender_weak ? sender : nullptr);
    return;
  }
  state->KeepAuxProfileSwitchProfileAlive(profile);
  if (!alive) {
    return;
  }
  // This is the actual supplied load-only algorithm, including immediate
  // completion for initialized profiles and null-load callback destruction.
  // It does not find/open another Browser or cancel an underlying load.
  profiles::LoadProfileAsync(
      target, base::BindOnce(&ProfileSwitchRequest::OnProfileLoaded,
                            sender_weak, std::move(completion)));
}

void ProfileSwitchRequest::Complete(Completion completion, Browser* result) {
  loading_ = false;
  std::move(completion).Run(result);
}

void ProfileSwitchRequest::OnProfileLoaded(
    base::WeakPtr<BrowserWindowInterface> sender_weak,
    Completion completion, Profile* target) {
  auto* sender = sender_weak ? static_cast<Browser*>(sender_weak.get()) : nullptr;
  if (!sender || !target) {
    std::move(completion).Run(nullptr);
    return;
  }
  const bool switched = sender->GetFeatures().RunAuxProfileSwitch(target);
  if (!sender_weak || !switched) {
    // Rejection and awaiting the genuine profile security gate both preserve
    // the original null Browser completion; a loaded Profile is not success.
    std::move(completion).Run(nullptr);
    return;
  }
  if (auto* window = BrowserWindow::FromBrowser(sender)) {
    window->Activate();
  }
  std::move(completion).Run(sender_weak ? sender : nullptr);
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
