// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_BOOKMARKS_SECTION_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_BOOKMARKS_SECTION_H_

#include <memory>
#include <optional>
#include "base/functional/callback.h"
#include "base/callback_list.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "chrome/browser/ui/views/frame/aux_section_view.h"
#include "components/prefs/pref_change_registrar.h"
#include "ui/gfx/animation/animation_delegate.h"
#include "ui/gfx/animation/slide_animation.h"

class PrefService;
class BrowserWindowInterface;
namespace aux {
class AuxSectionClipView;
class VerticalTabBookmarksView;
inline constexpr char kBookmarksSectionEnabledPref[] =
    "aux.vertical_tabs.bookmarks_section_enabled";
inline constexpr char kBookmarksSectionExpandedPref[] =
    "aux.vertical_tabs.bookmarks_section_expanded";

// Original region668 wrapper around the genuine inner BookmarksView6a0.
// The region supplies its actual enabled-state cleanup and layout effects.
// There is no source header secondary/context action or placeholder menu.
class AuxBookmarksSection final : public AuxSectionView,
                                  public gfx::AnimationDelegate {
  METADATA_HEADER(AuxBookmarksSection, AuxSectionView)
 public:
  struct Actions {
    base::RepeatingCallback<void(bool)> enabled_changed;
    base::RepeatingClosure layout_changed;
  };
  // Both boolean prefs must already be registered true/flags0 by the real
  // profile registration path. The inner owner has its separate list pref.
  AuxBookmarksSection(PrefService& prefs,
                      std::unique_ptr<VerticalTabBookmarksView> bookmarks,
                      Actions actions);
  ~AuxBookmarksSection() override;
  VerticalTabBookmarksView* bookmarks_view() const { return bookmarks_; }
  bool expanded() const { return expanded_; }
  void RetireForProfileChange();
  void BindOrganization(BrowserWindowInterface&);

 private:
  void Toggle();
  void OrganizationReady();
  void OrganizationChanged();
  void AnimateExpanded(bool expanded);
  void EnabledPreferenceChanged();
  void ExpandedPreferenceChanged();
  void ApplyExpanded(bool expanded);
  void ApplyHeight();
  void AnimationProgressed(const gfx::Animation*) override;
  void AnimationEnded(const gfx::Animation*) override;
  void AnimationCanceled(const gfx::Animation*) override;
  Actions actions_;
  raw_ptr<PrefService> prefs_;
  PrefChangeRegistrar pref_observer_;
  raw_ptr<VerticalTabBookmarksView> bookmarks_ = nullptr;
  raw_ptr<AuxSectionClipView> clip_ = nullptr;
  base::WeakPtr<BrowserWindowInterface> browser_;
  base::CallbackListSubscription organization_ready_, organization_changes_;
  bool organization_bound_ = false;
  bool expanded_ = true;
  bool retired_ = false;
  std::optional<int> frozen_natural_height_;
  std::optional<int> preferred_height_;
  gfx::SlideAnimation animation_{this};
  base::WeakPtrFactory<AuxBookmarksSection> weak_{this};
};
}  // namespace aux
#endif
