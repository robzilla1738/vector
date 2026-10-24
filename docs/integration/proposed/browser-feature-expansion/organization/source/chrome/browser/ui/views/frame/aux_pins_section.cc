// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_pins_section.h"
#include <algorithm>
#include <cmath>
#include <limits>
#include <utility>
#include "base/functional/bind.h"
#include "base/time/time.h"
#include "chrome/browser/aux/organization/organization_profile_service.h"
#include "chrome/browser/aux/organization/organization_service.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/views/frame/aux_organization_ui_commands.h"
#include "chrome/browser/ui/views/frame/aux_section_clip_view.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/views/controls/button/button.h"
namespace aux {
AuxPinsSection::AuxPinsSection(BrowserWindowInterface& browser, std::unique_ptr<views::View> content)
    : AuxSectionView(u"Pins", true, base::BindRepeating(&AuxPinsSection::Toggle,
          base::Unretained(this)), gfx::Insets::TLBR(0, 0, 4, 0)), browser_(browser.GetWeakPtr()) {
  inner_ = content.get();
  clip_ = contents()->AddChildView(std::make_unique<AuxSectionClipView>(std::move(content)));
  animation_.SetSlideDuration(gfx::Animation::ShouldRenderRichAnimation()
      ? base::Milliseconds(180) : base::TimeDelta());
  RebindForProfileSwitch();
}
AuxPinsSection::~AuxPinsSection() = default;
void AuxPinsSection::RebindForProfileSwitch() {
  ready_ = {}; changes_ = {}; animation_.Stop();
  if (!browser_) return;
  auto* owner = organization::OrganizationProfileServiceFactory::GetForProfile(browser_->GetProfile());
  if (owner) ready_ = owner->ObserveReady(base::BindRepeating(&AuxPinsSection::Bind, weak_.GetWeakPtr()));
  Bind();
}
void AuxPinsSection::Bind() {
  changes_ = {};
  if (!browser_) return;
  auto* owner = organization::OrganizationProfileServiceFactory::GetForProfileIfExists(browser_->GetProfile());
  if (!owner || !owner->model()) return;
  changes_ = owner->model()->Observe(base::BindRepeating(
      [](base::WeakPtr<AuxPinsSection> section, const organization::Delta& delta) {
        if (section && delta.sections_changed) section->Refresh(true);
      }, weak_.GetWeakPtr()));
  Refresh(false);
}
void AuxPinsSection::Toggle() {
  if (!browser_) return;
  auto context = CaptureOrganizationContext(*browser_); if (!context) return;
  organization::Command command; command.action = organization::Action::kSetPinsCollapsed; command.value = expanded_;
  ExecuteOrganizationCommand(browser_, std::move(*context), std::move(command),
      base::BindOnce([](base::WeakPtr<AuxPinsSection> view, organization::CommitResult result) {
        if (view) view->header_button()->SetTooltipText(OrganizationErrorMessage(result.error));
      }, weak_.GetWeakPtr()));
}
void AuxPinsSection::Refresh(bool animate) {
  if (!browser_) return;
  auto* owner = organization::OrganizationProfileServiceFactory::GetForProfileIfExists(browser_->GetProfile());
  if (!owner || !owner->model()) return;
  const bool expanded = !owner->model()->snapshot().pins_collapsed;
  if (animate && expanded == expanded_) return;
  expanded_ = expanded; SetDisclosureOpen(expanded_); clip_->SetVisible(true);
  if (animate) { if (expanded_) animation_.Show(); else animation_.Hide(); }
  else { animation_.Reset(expanded_ ? 1.0 : 0.0); }
  ApplyHeight();
}
void AuxPinsSection::ApplyHeight() {
  if (expanded_ && !animation_.is_animating()) {
    clip_->SetHeights(std::nullopt, std::nullopt); clip_->SetVisible(true); return;
  }
  const int natural = inner_->GetPreferredSize().height();
  const int height = static_cast<int>(std::clamp(std::round(natural * animation_.GetCurrentValue()),
      0.0, double(std::numeric_limits<int>::max())));
  clip_->SetHeights(height, natural);
  clip_->SetVisible(height != 0 || animation_.is_animating());
}
void AuxPinsSection::AnimationProgressed(const gfx::Animation*) { ApplyHeight(); }
void AuxPinsSection::AnimationEnded(const gfx::Animation*) { ApplyHeight(); }
void AuxPinsSection::AnimationCanceled(const gfx::Animation*) { ApplyHeight(); }
BEGIN_METADATA(AuxPinsSection)
END_METADATA
}  // namespace aux
