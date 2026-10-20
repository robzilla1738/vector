#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_CHROMIUM_PROFILE_CLONE_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_IMPORT_CHROMIUM_PROFILE_CLONE_H_

#include <string>
#include "base/files/file_path.h"
#include "base/values.h"

namespace aux_import {

struct ChromiumCloneFilesResult {
  // Only the copy/preferences phase; not initialized Profile/import success.
  bool success = false;
  base::ListValue extensions;
};

// MayBlock worker. source_profile is the selected source; target_profile MUST
// be the genuine reserved, unloaded new ProfileManager path. The original
// worker deletes that target before copying and on copy/preferences failure.
// The caller retains the original source-key admission before this phase.
ChromiumCloneFilesResult PrepareChromiumCloneFiles(
    const base::FilePath& source_profile,
    const base::FilePath& target_profile,
    const std::string& source_id,
    const std::u16string& profile_name);

// MayBlock worker, after the actual Arc bookmark augmentation (when Arc) and
// before CreateProfileAsync. Reuses the real tracked-preference initializer.
// Caller deletes its reserved target on false, as original4255868 does.
// Secret restoration/model completion remains a separate required owner phase.
bool InitializeChromiumCloneTrackedPreferences(
    const base::FilePath& target_profile);

}  // namespace aux_import
#endif
