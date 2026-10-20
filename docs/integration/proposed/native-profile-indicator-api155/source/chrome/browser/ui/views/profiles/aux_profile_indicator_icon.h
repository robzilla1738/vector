// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_VIEWS_PROFILES_AUX_PROFILE_INDICATOR_ICON_H_
#define CHROME_BROWSER_UI_VIEWS_PROFILES_AUX_PROFILE_INDICATOR_ICON_H_

#include <string_view>
#include "base/containers/span.h"
#include "base/memory/raw_ptr_exclusion.h"

class ProfileAttributesEntry;
namespace gfx {
struct VectorIcon;
}
namespace aux {
struct ProfileIndicatorIconDescriptor {
  std::string_view name;
  std::u16string_view label;
  // Points only to the immutable process-lifetime supplied vector catalog.
  RAW_PTR_EXCLUSION const gfx::VectorIcon* icon;
};
base::span<const ProfileIndicatorIconDescriptor> ProfileIndicatorIcons();
// The actual stored profile indicator icon, or null for absent/unknown names.
const gfx::VectorIcon* ProfileIndicatorIcon(
    const ProfileAttributesEntry* entry);
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_PROFILES_AUX_PROFILE_INDICATOR_ICON_H_
