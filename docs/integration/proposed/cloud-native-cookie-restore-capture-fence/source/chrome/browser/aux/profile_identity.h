// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_AUX_PROFILE_IDENTITY_H_
#define CHROME_BROWSER_AUX_PROFILE_IDENTITY_H_
#include <optional>
#include <string>
#include "base/files/file_path.h"
#include "base/callback_list.h"
#include "base/functional/callback.h"
class Profile;
namespace aux {
// UI sequence. Original supplied persisted profile identity, never a path hash.
// Existing nonempty IDs are retained; only the actual loaded profile is mutated.
std::string GetProfileId(Profile* profile);
// UI sequence, never loads a profile or reads its Preferences from disk.
std::string GetLoadedProfileIdForPath(const base::FilePath& path);
// Opaque in-memory epoch; changes on native account/session binding changes.
// Regular profiles only; never reads another profile or grants cookie access.
std::string GetProfileCookieBindingEpoch(Profile* profile);
// Changes whenever a native cookie restore begins, even if it finishes between
// two context reads. Used to reject capture interleaved with restoration.
std::string GetProfileCookieRestoreEpoch(Profile* profile);
// Serializes native cloud-cookie writes with account-profile projection.
// A failed operation with unacknowledged writes deliberately remains pending
// until shutdown, rather than allowing profile rebinding against queued writes.
bool BeginProfileCookieRestore(Profile* profile, const std::string& epoch);
void FinishProfileCookieRestore(Profile* profile);
bool IsProfileCookieRestorePending(Profile* profile);
base::CallbackListSubscription ObserveProfileCookieRestoreFinished(
    Profile* profile, base::RepeatingClosure callback);
std::optional<int> GetProfileIndex(Profile* profile);
}  // namespace aux
#endif
