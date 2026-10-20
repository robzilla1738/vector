// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/views/profiles/aux_profile_indicator_icon.h"

#include <string_view>

#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "ui/gfx/vector_icon_types.h"

namespace aux {
namespace {
#include "chrome/browser/ui/views/profiles/aux_profile_indicator_icons.inc"
struct IndicatorIcon {
  std::string_view name;
  const gfx::VectorIcon* icon;
};
const IndicatorIcon kIcons[] = {
    {"sun", &kSunIcon},
    {"moon", &kMoonIcon},
    {"cloud", &kCloudIcon},
    {"zap", &kZapIcon},
    {"heart", &kHeartIcon},
    {"flame", &kFlameIcon},
    {"star", &kStarIcon},
    {"magic_wand", &kMagicWandIcon},
    {"thumbs_up", &kThumbsUpIcon},
    {"diamond", &kDiamondIcon},
    {"book", &kBookIcon},
    {"magic_book", &kMagicBookIcon},
    {"hourglass", &kHourglassIcon},
    {"clock", &kClockIcon},
    {"smile", &kSmileIcon},
    {"slime", &kSlimeIcon},
    {"lock", &kLockIcon},
    {"map_pin", &kMapPinIcon},
    {"pin", &kPinIcon},
    {"tag", &kTagIcon},
    {"flag", &kFlagIcon},
    {"shopping_bag", &kShoppingBagIcon},
    {"suitcase", &kSuitcaseIcon},
    {"banknote", &kBanknoteIcon},
    {"telescope", &kTelescopeIcon},
    {"trophy", &kTrophyIcon},
    {"rocket", &kRocketIcon},
    {"ticket", &kTicketIcon},
    {"camera", &kCameraIcon},
    {"folder", &kFolderIcon},
    {"bookmark", &kBookmarkIcon},
    {"pencil", &kPencilIcon},
    {"write", &kWriteIcon},
    {"brush", &kBrushIcon},
    {"palette", &kPaletteIcon},
    {"half_circle", &kHalfCircleIcon},
    {"atom", &kAtomIcon},
    {"headphones", &kHeadphonesIcon},
    {"bell", &kBellIcon},
    {"email", &kEmailIcon},
    {"chart", &kChartIcon},
    {"form_circle", &kFormCircleIcon},
    {"form_square", &kFormSquareIcon},
    {"form_diamond", &kFormDiamondIcon},
    {"form_flower", &kFormFlowerIcon},
    {"cursor", &kCursorIcon},
    {"console", &kConsoleIcon},
    {"bubble", &kBubbleIcon},
};
}  // namespace

const gfx::VectorIcon* ProfileIndicatorIcon(
    const ProfileAttributesEntry* entry) {
  if (!entry) {
    return nullptr;
  }
  const std::string name = entry->GetAuxProfileIndicatorIconName();
  for (const auto& candidate : kIcons) {
    if (candidate.name == name) {
      return candidate.icon;
    }
  }
  return nullptr;
}
}  // namespace aux
