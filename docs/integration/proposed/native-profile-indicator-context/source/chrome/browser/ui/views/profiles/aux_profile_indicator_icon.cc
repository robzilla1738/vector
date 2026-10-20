// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/views/profiles/aux_profile_indicator_icon.h"

#include <string_view>

#include "base/memory/raw_ptr_exclusion.h"

#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "ui/gfx/vector_icon_types.h"

namespace aux {
namespace {
#include "chrome/browser/ui/views/profiles/aux_profile_indicator_icons.inc"
const ProfileIndicatorIconDescriptor kIcons[] = {
    {"sun", u"Sun", &kSunIcon},
    {"moon", u"Moon", &kMoonIcon},
    {"cloud", u"Cloud", &kCloudIcon},
    {"zap", u"Zap", &kZapIcon},
    {"heart", u"Heart", &kHeartIcon},
    {"flame", u"Flame", &kFlameIcon},
    {"star", u"Star", &kStarIcon},
    {"magic_wand", u"Magic wand", &kMagicWandIcon},
    {"thumbs_up", u"Thumbs up", &kThumbsUpIcon},
    {"diamond", u"Diamond", &kDiamondIcon},
    {"book", u"Book", &kBookIcon},
    {"magic_book", u"Magic book", &kMagicBookIcon},
    {"hourglass", u"Hourglass", &kHourglassIcon},
    {"clock", u"Clock", &kClockIcon},
    {"smile", u"Smile", &kSmileIcon},
    {"slime", u"Slime", &kSlimeIcon},
    {"lock", u"Lock", &kLockIcon},
    {"map_pin", u"Map pin", &kMapPinIcon},
    {"pin", u"Pin", &kPinIcon},
    {"tag", u"Tag", &kTagIcon},
    {"flag", u"Flag", &kFlagIcon},
    {"shopping_bag", u"Shopping bag", &kShoppingBagIcon},
    {"suitcase", u"Suitcase", &kSuitcaseIcon},
    {"banknote", u"Banknote", &kBanknoteIcon},
    {"telescope", u"Telescope", &kTelescopeIcon},
    {"trophy", u"Trophy", &kTrophyIcon},
    {"rocket", u"Rocket", &kRocketIcon},
    {"ticket", u"Ticket", &kTicketIcon},
    {"camera", u"Camera", &kCameraIcon},
    {"folder", u"Folder", &kFolderIcon},
    {"bookmark", u"Bookmark", &kBookmarkIcon},
    {"pencil", u"Pencil", &kPencilIcon},
    {"write", u"Write", &kWriteIcon},
    {"brush", u"Brush", &kBrushIcon},
    {"palette", u"Palette", &kPaletteIcon},
    {"half_circle", u"Half circle", &kHalfCircleIcon},
    {"atom", u"Atom", &kAtomIcon},
    {"headphones", u"Headphones", &kHeadphonesIcon},
    {"bell", u"Bell", &kBellIcon},
    {"email", u"Email", &kEmailIcon},
    {"chart", u"Chart", &kChartIcon},
    {"form_circle", u"Circle", &kFormCircleIcon},
    {"form_square", u"Square", &kFormSquareIcon},
    {"form_diamond", u"Diamond", &kFormDiamondIcon},
    {"form_flower", u"Flower", &kFormFlowerIcon},
    {"cursor", u"Cursor", &kCursorIcon},
    {"console", u"Console", &kConsoleIcon},
    {"bubble", u"Bubble", &kBubbleIcon},
};
}  // namespace

base::span<const ProfileIndicatorIconDescriptor> ProfileIndicatorIcons() {
  return kIcons;
}

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
