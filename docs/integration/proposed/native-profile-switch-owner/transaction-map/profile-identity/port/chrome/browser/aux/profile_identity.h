// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_AUX_PROFILE_IDENTITY_H_
#define CHROME_BROWSER_AUX_PROFILE_IDENTITY_H_
#include <optional>
#include <string>
#include "base/files/file_path.h"
class Profile;
namespace aux {
// UI sequence. Original supplied persisted profile identity, never a path hash.
// Existing nonempty IDs are retained; only the actual loaded profile is mutated.
std::string GetProfileId(Profile* profile);
// UI sequence, never loads a profile or reads its Preferences from disk.
std::string GetLoadedProfileIdForPath(const base::FilePath& path);
std::optional<int> GetProfileIndex(Profile* profile);
}  // namespace aux
#endif
