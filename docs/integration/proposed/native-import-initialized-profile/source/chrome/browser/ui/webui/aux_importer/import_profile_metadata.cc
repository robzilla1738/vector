// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/webui/aux_importer/import_profile_metadata.h"
#include <utility>

#include "base/strings/utf_string_conversions.h"
#include "base/values.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/themes/theme_service.h"
#include "chrome/browser/themes/theme_service_factory.h"
#include "chrome/common/pref_names.h"
#include "components/prefs/pref_service.h"
#include "services/preferences/public/cpp/tracked/pref_names.h"

namespace aux_importer {
void SetInitializedImportProfileName(Profile& profile,
                                     ProfileManager& manager,
                                     const std::u16string& name) {
  profile.GetPrefs()->SetString(prefs::kProfileName, base::UTF16ToUTF8(name));
  if (auto* entry =
          manager.GetProfileAttributesStorage().GetProfileAttributesWithPath(
              profile.GetPath())) {
    entry->SetLocalProfileName(name, false);
  }
}

void RemoveImportedExtensionResetRecords(Profile& profile) {
  PrefService* prefs = profile.GetPrefs();
  const auto& current = prefs->GetList(user_prefs::kTrackedPreferencesReset);
  base::ListValue retained;
  bool removed = false;
  for (const auto& value : current) {
    if (value.is_string() &&
        (value.GetString() == "extensions.settings" ||
         value.GetString().starts_with("extensions.settings."))) {
      removed = true;
    } else {
      retained.Append(value.Clone());
    }
  }
  if (removed)
    prefs->SetList(user_prefs::kTrackedPreferencesReset, std::move(retained));
}

void ResetInitializedImportProfileTheme(Profile* profile) {
  ThemeService* service = ThemeServiceFactory::GetForProfile(profile);
  if (service && !service->UsingPolicyTheme() && service->ready_) {
    service->ClearThemeData(true);
    service->NotifyThemeChanged();
  }
}
}  // namespace aux_importer
