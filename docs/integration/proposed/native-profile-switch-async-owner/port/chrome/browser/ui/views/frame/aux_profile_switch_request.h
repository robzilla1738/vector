// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_SWITCH_REQUEST_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_SWITCH_REQUEST_H_

#include <cstdint>
#include <optional>

#include "base/files/file_path.h"
#include "base/functional/callback.h"
#include "base/memory/raw_ref.h"
#include "base/memory/weak_ptr.h"
#include "base/timer/timer.h"

class Browser;
class BrowserWindowInterface;
class Profile;

namespace aux {
class ProfilePreviewViews;

// Native chooser/preview-owner state from supplied465841c/4658888. This owns
// no UI, creates no preview, and registers no gesture or extension API.
class ProfileSwitchRequest {
 public:
  using Completion = base::OnceCallback<void(Browser*)>;
  ProfileSwitchRequest(Browser& sender, ProfilePreviewViews& preview);
  ~ProfileSwitchRequest();
  ProfileSwitchRequest(const ProfileSwitchRequest&) = delete;
  ProfileSwitchRequest& operator=(const ProfileSwitchRequest&) = delete;

  // Completion receives the same actual sender only after real core success
  // and activation. LoadProfileAsync can drop completion on null load failure.
  void Start(const base::FilePath& target, Completion completion);

  // The genuine live preview must already own borrowed Views. Its existing
  // animation/frame owner calls OnPreviewFrame; no visual is manufactured here.
  void QueuePreviewCommit(base::FilePath target, Completion completion);
  void OnPreviewFrame();
  void CancelPendingPreviewCommit();

 private:
  struct Pending {
    base::FilePath target;
    Completion completion;
  };
  void CommitSettledPreview(uint64_t generation);
  void Complete(Completion completion, Browser* result);
  static void OnProfileLoaded(
      base::WeakPtr<BrowserWindowInterface> sender,
      Completion completion, Profile* target);

  base::WeakPtr<BrowserWindowInterface> sender_;
  base::raw_ref<ProfilePreviewViews> preview_;
  std::optional<Pending> pending_;
  uint64_t generation_ = 0;
  bool loading_ = false;
  base::OneShotTimer settle_timer_;
  base::WeakPtrFactory<ProfileSwitchRequest> weak_factory_{this};
};
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_SWITCH_REQUEST_H_
