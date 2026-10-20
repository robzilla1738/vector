// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_UI_VIEWS_PROFILES_AUX_PROFILE_DISPLAY_LABEL_H_
#define CHROME_BROWSER_UI_VIEWS_PROFILES_AUX_PROFILE_DISPLAY_LABEL_H_

#include <cstddef>
#include <string>

class Profile;
class ProfileAttributesEntry;
namespace aux {
// Preserved supplied internal preference, scoped by actual Aux profile prefs.
inline constexpr char kAccountDisplayName[] = "aside.account_display_name";
// Original040fde94, shared by the actual profile menu and preview page.
// `loaded_profile` may be null; this function never loads a profile.
std::u16string ProfileDisplayLabel(const ProfileAttributesEntry* entry,
                                   const Profile* loaded_profile,
                                   size_t visible_profile_count);
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_PROFILES_AUX_PROFILE_DISPLAY_LABEL_H_
