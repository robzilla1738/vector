// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/ui/views/profiles/aux_profile_display_label.h"

#include "base/strings/string_util.h"
#include "base/strings/utf_string_conversions.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "components/prefs/pref_service.h"

namespace aux {
std::u16string ProfileDisplayLabel(const ProfileAttributesEntry* entry,
                                   const Profile* loaded_profile,
                                   size_t visible_profile_count) {
  if (!entry) {
    return u"Profile";
  }
  if (visible_profile_count <= 1) {
    const std::u16string name = entry->GetName();
    return name.empty() ? u"Profile" : name;
  }

  std::u16string primary;
  if (loaded_profile && !loaded_profile->IsOffTheRecord()) {
    const PrefService* prefs = loaded_profile->GetPrefs();
    if (prefs && prefs->FindPreference(kAccountDisplayName)) {
      primary = base::UTF8ToUTF16(prefs->GetString(kAccountDisplayName));
    }
  }
  if (primary.empty()) {
    // Actual155 getter retains supplied given-name -> GAIA -> OIDC fallback.
    primary = entry->GetGAIANameToDisplay();
    if (primary.empty()) {
      primary = entry->GetUserName();
    }
    if (primary.empty()) {
      primary = entry->GetLocalProfileName();
    }
  }
  std::u16string local = entry->GetLocalProfileName();
  if (local.empty()) {
    local = entry->GetName();
  }
  if (primary.empty()) {
    return local.empty() ? u"Profile" : local;
  }
  if (local.empty() || base::EqualsCaseInsensitiveASCII(primary, local)) {
    return primary;
  }
  return primary + u" (" + local + u")";
}
}  // namespace aux
