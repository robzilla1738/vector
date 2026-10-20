// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_TABS_ACTIONS_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_TABS_ACTIONS_H_

#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"

class BrowserWindowInterface;
class Profile;

namespace aux {
// Original region4630098/4630b48. The real section owns the enabled/spinner
// state; the real Agent extension performs Tidy. Retire before profile/body
// replacement, and recreate against the actual current browser identity.
class AuxTabsActions {
 public:
  AuxTabsActions(BrowserWindowInterface& browser,
                 base::RepeatingCallback<bool()> tidy_enabled,
                 base::RepeatingCallback<void(bool)> tidy_busy);
  ~AuxTabsActions();
  AuxTabsActions(const AuxTabsActions&) = delete;
  AuxTabsActions& operator=(const AuxTabsActions&) = delete;
  void Tidy();
  void Clear();
  void Retire();

 private:
  bool ScopeCurrent() const;
  void SetTidyBusy(bool busy);
  void ClearAccepted(bool accepted);
  base::WeakPtr<BrowserWindowInterface> browser_;
  base::WeakPtr<Profile> profile_;
  base::RepeatingCallback<bool()> tidy_enabled_;
  base::RepeatingCallback<void(bool)> tidy_busy_;
  bool retired_ = false;
  base::WeakPtrFactory<AuxTabsActions> weak_{this};
};
}  // namespace aux
#endif
