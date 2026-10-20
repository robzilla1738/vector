// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_WEBUI_AUX_IMPORTER_IMPORT_PROFILE_METADATA_H_
#define CHROME_BROWSER_UI_WEBUI_AUX_IMPORTER_IMPORT_PROFILE_METADATA_H_
#include <string>
class Profile;
class ProfileManager;
namespace aux_importer {
// Call only after the real ProfileManager initialized callback returns Profile.
void SetInitializedImportProfileName(Profile& profile,
                                     ProfileManager& manager,
                                     const std::u16string& name);
void RemoveImportedExtensionResetRecords(Profile& profile);
// Kept separate so the real optional-avatar application retains its source
// slot.
void ResetInitializedImportProfileTheme(Profile* profile);
}  // namespace aux_importer
#endif  // CHROME_BROWSER_UI_WEBUI_AUX_IMPORTER_IMPORT_PROFILE_METADATA_H_
