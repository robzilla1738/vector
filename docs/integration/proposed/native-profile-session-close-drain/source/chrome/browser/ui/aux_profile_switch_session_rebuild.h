// Copyright 2026 The Aux Authors
// Local platform adaptation of the supplied profile-switch lifecycle.

#ifndef CHROME_BROWSER_UI_AUX_PROFILE_SWITCH_SESSION_REBUILD_H_
#define CHROME_BROWSER_UI_AUX_PROFILE_SWITCH_SESSION_REBUILD_H_

#include <cstdint>
#include <set>

#include "base/files/file_path.h"
#include "base/memory/weak_ptr.h"
#include "base/sequence_checker.h"

class Profile;

namespace aux {

// Owned by the SAME window/profile-switch transaction. It rebuilds sessions
// only after the real cached Browser workspaces and manager registrations have
// settled; it cannot replace that transaction or persist detached tab caches.
class ProfileSwitchSessionRebuild {
 public:
  ProfileSwitchSessionRebuild();
  ~ProfileSwitchSessionRebuild();

  ProfileSwitchSessionRebuild(const ProfileSwitchSessionRebuild&) = delete;
  ProfileSwitchSessionRebuild& operator=(const ProfileSwitchSessionRebuild&) =
      delete;

  // Call only after the completed source/target migration. Rapid switches
  // retain all touched original-profile paths until the latest delayed task.
  void Schedule(Profile& previous_profile, Profile& target_profile);

  // Drain completed transfers while their real windows still own their tabs.
  // Does not create profiles/services or run a nested event loop.
  static void FlushPendingBeforeClose();

 private:
  void Rebuild(uint64_t generation);

  SEQUENCE_CHECKER(sequence_checker_);
  std::set<base::FilePath> pending_paths_;
  uint64_t generation_ = 0;
  base::WeakPtrFactory<ProfileSwitchSessionRebuild> weak_ptr_factory_{this};
};

}  // namespace aux

#endif  // CHROME_BROWSER_UI_AUX_PROFILE_SWITCH_SESSION_REBUILD_H_
