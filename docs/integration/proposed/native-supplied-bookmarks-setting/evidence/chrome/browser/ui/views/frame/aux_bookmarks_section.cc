// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/views/frame/aux_bookmarks_section.h"

#include <algorithm>
#include <cmath>
#include <limits>
#include <utility>
#include "base/check.h"
#include "base/functional/bind.h"
#include "base/time/time.h"
#include "chrome/browser/ui/views/frame/aux_section_clip_view.h"
#include "chrome/browser/ui/views/frame/aux_vertical_tab_bookmarks_view.h"
#include "components/prefs/pref_service.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/views/view_class_properties.h"

namespace aux {
AuxBookmarksSection::AuxBookmarksSection(
    PrefService& prefs,
    std::unique_ptr<VerticalTabBookmarksView> bookmarks,
    Actions actions)
    : AuxSectionView(u"Bookmarks",
                     true,
                     base::BindRepeating(&AuxBookmarksSection::Toggle,
                                         base::Unretained(this)),
                     gfx::Insets::TLBR(4, 0, 8, 0)),
      actions_(std::move(actions)),
      prefs_(&prefs) {
  CHECK(bookmarks && actions_.enabled_changed && actions_.layout_changed);
  CHECK(prefs.FindPreference(kBookmarksSectionEnabledPref));
  CHECK(prefs.FindPreference(kBookmarksSectionExpandedPref));
  // Source37e1438: overwrite base contents' top margin with TLBR(3,0,0,0).
  contents()->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(3, 0, 0, 0));
  bookmarks_ = bookmarks.get();
  clip_ = contents()->AddChildView(
      std::make_unique<AuxSectionClipView>(std::move(bookmarks)));
  clip_->SetProperty(views::kMarginsKey, gfx::Insets());
  animation_.SetSlideDuration(gfx::Animation::ShouldRenderRichAnimation()
                                  ? base::Milliseconds(180)
                                  : base::TimeDelta());
  ApplyExpanded(prefs.GetBoolean(kBookmarksSectionExpandedPref));
  SetVisible(prefs.GetBoolean(kBookmarksSectionEnabledPref));
  pref_observer_.Init(&prefs);
  pref_observer_.Add(
      kBookmarksSectionEnabledPref,
      base::BindRepeating(&AuxBookmarksSection::EnabledPreferenceChanged,
                          base::Unretained(this)));
  pref_observer_.Add(
      kBookmarksSectionExpandedPref,
      base::BindRepeating(&AuxBookmarksSection::ExpandedPreferenceChanged,
                          base::Unretained(this)));
}
AuxBookmarksSection::~AuxBookmarksSection() {
  RetireForProfileChange();
}
void AuxBookmarksSection::Toggle() {
  if (retired_ || !prefs_)
    return;
  expanded_ = !expanded_;
  SetDisclosureOpen(expanded_);
  // Original4661e50..f50 freezes the full child height, not the current
  // animated preferred clip height. Each toggle remeasures the actual child,
  // including a reversal after genuine bookmark/folder changes.
  frozen_natural_height_ = bookmarks_->GetPreferredSize().height();
  clip_->SetHeights(preferred_height_, frozen_natural_height_);
  clip_->SetVisible(true);
  if (expanded_)
    animation_.Show();
  else
    animation_.Hide();
  const auto weak = weak_.GetWeakPtr();
  prefs_->SetBoolean(kBookmarksSectionExpandedPref, expanded_);
  if (!weak)
    return;
  ApplyHeight();
  auto changed = actions_.layout_changed;
  changed.Run();
}
void AuxBookmarksSection::EnabledPreferenceChanged() {
  if (retired_ || !prefs_)
    return;
  const bool enabled = prefs_->GetBoolean(kBookmarksSectionEnabledPref);
  SetVisible(enabled);
  // Original4659ab8 delegates disabled-state popup cleanup and real region
  // ApplyLayout/PreferredSizeChanged effects. The wrapper invents no popup.
  const auto weak = weak_.GetWeakPtr();
  auto changed = actions_.enabled_changed;
  changed.Run(enabled);
  if (!weak)
    return;
  auto layout = actions_.layout_changed;
  layout.Run();
}
void AuxBookmarksSection::ExpandedPreferenceChanged() {
  if (retired_ || !prefs_)
    return;
  const bool expanded = prefs_->GetBoolean(kBookmarksSectionExpandedPref);
  // Original4659c84 same-state guard is essential: our own pref write must
  // not cancel the genuine animated toggle already in progress.
  if (expanded == expanded_)
    return;
  ApplyExpanded(expanded);
  auto changed = actions_.layout_changed;
  changed.Run();
}
void AuxBookmarksSection::ApplyExpanded(bool expanded) {
  // Original46598b0 is the nonanimated external-pref/initial application.
  animation_.Stop();
  frozen_natural_height_.reset();
  preferred_height_.reset();
  clip_->SetHeights(std::nullopt, std::nullopt);
  expanded_ = expanded;
  SetDisclosureOpen(expanded_);
  animation_.Reset(expanded_ ? 1.0 : 0.0);
  ApplyHeight();
}
void AuxBookmarksSection::ApplyHeight() {
  if (retired_)
    return;
  // Original4664c94: completed expansion releases the preferred override so
  // subsequent genuine model/folder changes can determine their own height.
  if (expanded_ && !animation_.is_animating() &&
      animation_.GetCurrentValue() == 1.0) {
    preferred_height_.reset();
    clip_->SetHeights(preferred_height_, frozen_natural_height_);
    clip_->SetVisible(true);
    return;
  }
  const int natural = frozen_natural_height_
                          ? *frozen_natural_height_
                          : bookmarks_->GetPreferredSize().height();
  const double rounded =
      std::round(double(natural) * animation_.GetCurrentValue());
  const int height = static_cast<int>(
      std::clamp(rounded, 0.0, double(std::numeric_limits<int>::max())));
  preferred_height_ = height;
  clip_->SetHeights(preferred_height_, frozen_natural_height_);
  clip_->SetVisible(height > 0 || animation_.is_animating());
}
void AuxBookmarksSection::AnimationProgressed(const gfx::Animation*) {
  ApplyHeight();
}
void AuxBookmarksSection::AnimationEnded(const gfx::Animation*) {
  ApplyHeight();
  // Original4664c00 (Ended and Canceled slots) releases both cached natural
  // height and clip's explicit content height after applying the final frame.
  frozen_natural_height_.reset();
  clip_->SetHeights(preferred_height_, std::nullopt);
}
void AuxBookmarksSection::AnimationCanceled(const gfx::Animation* animation) {
  AnimationEnded(animation);
}
void AuxBookmarksSection::RetireForProfileChange() {
  if (retired_)
    return;
  retired_ = true;
  weak_.InvalidateWeakPtrs();
  pref_observer_.RemoveAll();
  prefs_ = nullptr;
  animation_.Stop();
  bookmarks_->RetireForProfileChange();
  SetVisible(false);
}
BEGIN_METADATA(AuxBookmarksSection)
END_METADATA
}  // namespace aux
