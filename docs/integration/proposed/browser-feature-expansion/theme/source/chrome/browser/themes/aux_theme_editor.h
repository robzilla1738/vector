// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef CHROME_BROWSER_THEMES_AUX_THEME_EDITOR_H_
#define CHROME_BROWSER_THEMES_AUX_THEME_EDITOR_H_

#include <string_view>

#include "base/values.h"
#include "ui/color/color_provider_key.h"

class Profile;
namespace ui { class NativeTheme; class ColorProvider; }

namespace aux_theme {
inline constexpr char kThemeTokensPref[] = "aux.theme.tokens";
inline constexpr char kThemePresetsPref[] = "aux.theme.presets";

// All entry points are UI-sequence only. The extension wrapper derives owner
// from the actual document + window and calls Cancel before that owner closes,
// navigates or switches profile. Never accept an owner supplied by JavaScript.
// No operation resolves an original profile or grants profile/write authority.
// Callers must first pass the existing Aux profile admission/write boundary.
base::DictValue GetState(Profile* profile);
base::DictValue Preview(Profile* profile, std::string_view owner,
                        std::string_view revision, const base::DictValue& tokens);
base::DictValue Apply(Profile* profile, std::string_view owner,
                      std::string_view revision, const base::DictValue& tokens);
base::DictValue Cancel(Profile* profile, std::string_view owner);
base::DictValue Reset(Profile* profile, std::string_view owner,
                      std::string_view revision);
base::DictValue SavePreset(Profile* profile, std::string_view owner,
                           std::string_view revision, std::string_view name,
                           const base::DictValue& tokens);
base::DictValue DeletePreset(Profile* profile, std::string_view owner,
                             std::string_view revision, std::string_view id);
// Import uses Preview/SavePreset with the parsed export envelope's tokens.
// The wrapper bounds JSON to 4 KiB and validates envelope format/version first.
base::DictValue ExportPreset(Profile* profile, const base::DictValue& tokens);

// Actual native consumers. An unconfigured profile returns the original key,
// opacity and blur radius exactly. Private/policy/accessibility modes win.
ui::ColorProviderKey DecorateColorProviderKey(
    const Profile* profile, ui::ColorProviderKey key);
float MaterialOpacity(Profile* profile, const ui::NativeTheme* native_theme,
                      float original);
float MaterialBlurRadius(Profile* profile, const ui::NativeTheme* native_theme,
                         float original);
bool HasBackgroundOverride(Profile* profile);
// Opt-in companion for recovered sidebar colors. Without our immutable
// supplier the exact supplied foreground is returned, including its alpha.
SkColor SidebarForeground(const ui::ColorProviderKey& key,
                          const ui::ColorProvider* provider, SkColor original);
void NotifyProfileThemeChanged(Profile* profile);
}  // namespace aux_theme
#endif  // CHROME_BROWSER_THEMES_AUX_THEME_EDITOR_H_
