// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_SWITCH_TABS_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_SWITCH_TABS_H_

#include <memory>
#include <variant>
#include <vector>

#include "base/memory/weak_ptr.h"
#include "base/types/pass_key.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/tabs/tab_strip_model_selection_state.h"

class Browser;
class Profile;
namespace aux {
class ProfileSwitchTransaction;

// Owns the actual detached tabs/collections, never URLs or surrogate tabs.
// Restricted to the synchronous prepared in-place transaction. Guards and the
// source Browser must outlive it. An unconsumed snapshot rolls back to source.
class ProfileSwitchTabCollection {
 public:
  static std::unique_ptr<ProfileSwitchTabCollection> Take(
      Browser& source,
      base::PassKey<ProfileSwitchTransaction>);
  ~ProfileSwitchTabCollection();
  ProfileSwitchTabCollection(const ProfileSwitchTabCollection&) = delete;
  ProfileSwitchTabCollection& operator=(const ProfileSwitchTabCollection&) = delete;

  // False before insertion if any invariant/BrowserContext does not match.
  // Successful insertion preserves real collection identity, pin state and
  // current155 selection/focused-group state, and consumes this snapshot.
  bool InsertInto(Browser& destination,
                  base::PassKey<ProfileSwitchTransaction>);
  bool empty() const { return owned_.empty(); }
  int tab_count() const { return tab_count_; }

 private:
  explicit ProfileSwitchTabCollection(Browser& source);
  bool Insert(Browser& destination);
  bool HasOnlyProfile(Profile* profile) const;

  base::WeakPtr<Browser> source_;
  base::WeakPtr<Profile> profile_;
  tabs::TabStripModelSelectionState selection_;
  const int tab_count_;
  std::vector<std::variant<std::unique_ptr<DetachedTab>,
                           std::unique_ptr<DetachedTabCollection>>> owned_;
};
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_SWITCH_TABS_H_
