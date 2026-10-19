// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_SWITCH_TRANSACTION_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_SWITCH_TRANSACTION_H_

#include <optional>

#include "base/functional/callback.h"
#include "base/memory/raw_ref.h"
#include "base/types/pass_key.h"
#include "chrome/browser/ui/aux_profile_switch_session_rebuild.h"

class Browser;
class BrowserWindowFeatures;
class Profile;
namespace aux {
// Window-owned, synchronous core of the supplied in-place transaction. No
// renderer/private extension API can invoke it. UI activation stays disabled
// until BrowserWindowFeatures supplies every real profile/view binding plan.
class ProfileSwitchTransaction {
 public:
  enum class Result { kRejected, kNoChange, kAwaitingSecurity, kSwitched };
  using Phase = base::OnceCallback<void(Browser&, Browser&, Browser&)>;

  class PreparedBindings {
   public:
    PreparedBindings(const PreparedBindings&) = delete;
    PreparedBindings& operator=(const PreparedBindings&) = delete;
    PreparedBindings(PreparedBindings&&);
    PreparedBindings& operator=(PreparedBindings&&);
    ~PreparedBindings();

   private:
    friend class ::BrowserWindowFeatures;
    friend class ProfileSwitchTransaction;
    // All phases are mandatory actual implementations. No default/no-op plan
    // exists. Construct only after cold validation of every remaining source,
    // including the native Agent/sidebar's actual profile-bound WebContents.
    PreparedBindings(Phase begin, Phase commit, Phase finish, Phase abort);
    Phase begin_;
    Phase commit_;
    Phase finish_;
    Phase abort_;
  };
  using PrepareBindings = base::OnceCallback<std::optional<PreparedBindings>(
      Browser&, Profile&)>;

  explicit ProfileSwitchTransaction(Browser& owner);
  ~ProfileSwitchTransaction();
  ProfileSwitchTransaction(const ProfileSwitchTransaction&) = delete;
  ProfileSwitchTransaction& operator=(const ProfileSwitchTransaction&) = delete;

  // prepare must be cold/non-yielding and return nullopt before any effects
  // when a real service/view migration is unsupported or not ready.
  Result Run(Profile* target, PrepareBindings prepare,
             base::PassKey<BrowserWindowFeatures>);

 private:
  struct Scope;
  static void Complete(Scope* scope);
  base::raw_ref<Browser> owner_;
  ProfileSwitchSessionRebuild rebuild_;
};
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_SWITCH_TRANSACTION_H_
