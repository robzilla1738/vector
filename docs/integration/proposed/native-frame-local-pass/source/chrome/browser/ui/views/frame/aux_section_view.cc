// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_section_view.h"
#include "chrome/browser/ui/views/frame/aux_tab_expand_chevron_view.h"

#include <utility>

#include "base/functional/bind.h"
#include "cc/paint/paint_flags.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/color/color_provider_key.h"
#include "ui/events/event.h"
#include "ui/gfx/canvas.h"
#include "ui/gfx/font_list.h"
#include "ui/gfx/geometry/rect_f.h"
#include "ui/gfx/text_constants.h"
#include "ui/views/accessibility/view_accessibility.h"
#include "ui/views/controls/button/button.h"
#include "ui/views/controls/highlight_path_generator.h"
#include "ui/views/controls/label.h"
#include "ui/views/layout/box_layout.h"
#include "ui/views/view_class_properties.h"
#include "ui/views/widget/widget.h"

namespace aux {
namespace {

SkColor SectionColor(const views::View& view, bool hover) {
  // Original private mixer035e6d40 roles226/247. No CSS/theme substitute.
  const bool dark = view.GetWidget()->GetColorMode() ==
      ui::ColorProviderKey::ColorMode::kDark;
  return hover ? (dark ? 0x14fafafa : 0x140a0a0a)
               : (dark ? 0x73fafafa : 0x730a0a0a);
}

}  // namespace

class AuxSectionHeaderButton final : public views::Button {
  METADATA_HEADER(AuxSectionHeaderButton, views::Button)
 public:
  AuxSectionHeaderButton(std::u16string title, bool disclosure,
                        base::RepeatingClosure primary,
                        base::RepeatingClosure secondary,
                        std::unique_ptr<views::View> accessory)
      : views::Button(base::BindRepeating(
            &AuxSectionHeaderButton::RunPrimary, base::Unretained(this))),
        primary_(std::move(primary)), secondary_(std::move(secondary)) {
    // Chromium 155 propagates a disabled View to every descendant. Tabs has
    // no primary action but owns the real Tidy/Clear accessory buttons.
    SetEnabled(!primary_.is_null() || accessory != nullptr);
    if (primary_.is_null())
      SetFocusBehavior(FocusBehavior::NEVER);
    SetNotifyEnterExitOnChild(true);
    auto* layout = SetLayoutManager(std::make_unique<views::BoxLayout>(
        views::BoxLayout::Orientation::kHorizontal, gfx::Insets::VH(4, 8)));
    layout->set_cross_axis_alignment(views::BoxLayout::CrossAxisAlignment::kCenter);
    label_ = AddChildView(std::make_unique<views::Label>(title));
    label_->SetCanProcessEventsWithinSubtree(false);
    label_->SetHorizontalAlignment(gfx::ALIGN_TO_HEAD);
    label_->SetElideBehavior(gfx::FADE_TAIL);
    label_->SetSubpixelRenderingEnabled(false);
    label_->SetAutoColorReadabilityEnabled(false);
    label_->SetBackgroundColor(SK_ColorTRANSPARENT);
    const gfx::FontList font;
    label_->SetFontList(font.Derive(13 - font.GetFontSize(), gfx::Font::NORMAL,
                                 gfx::Font::Weight::MEDIUM));
    auto* spacer = AddChildView(std::make_unique<views::View>());
    layout->SetFlexForView(spacer, 1);
    controls_ = AddChildView(std::make_unique<views::View>());
    auto* controls_layout = controls_->SetLayoutManager(
        std::make_unique<views::BoxLayout>(views::BoxLayout::Orientation::kHorizontal));
    controls_layout->set_cross_axis_alignment(views::BoxLayout::CrossAxisAlignment::kCenter);
    if (accessory) {
      accessory->SetVisible(false);
      accessory_ = controls_->AddChildView(std::move(accessory));
    }
    if (disclosure) {
      chevron_ = controls_->AddChildView(std::make_unique<AuxTabExpandChevronView>(
          true, AuxTabExpandChevronView::Foreground::kMuted));
      chevron_->SetVisible(false);
    }
    GetViewAccessibility().SetName(title);
    // Original5038c0 jump-table slot56 ->503924 ->8, for focus and hover.
    views::InstallRoundRectHighlightPathGenerator(this, gfx::Insets(), 8);
  }
  gfx::Size CalculatePreferredSize(const views::SizeBounds& available) const override {
    auto result = views::Button::CalculatePreferredSize(available);
    result.set_height(28);
    return result;
  }
  bool OnMousePressed(const ui::MouseEvent& event) override {
    if ((event.flags() & ui::EF_MOUSE_BUTTON) == ui::EF_RIGHT_MOUSE_BUTTON) {
      if (context_) {
        auto callback = context_;
        callback.Run(this, event);
        return true;
      }
      if (secondary_) {
        auto callback = secondary_;
        callback.Run();
        return true;
      }
    }
    return views::Button::OnMousePressed(event);
  }
  void SetContext(AuxSectionView::Context callback) { context_ = std::move(callback); }
  void SetDisclosureOpen(bool open) { if (chevron_) chevron_->SetExpanded(open); }
  void SetAlwaysShowAccessory(bool always_show) {
    always_show_accessory_ = always_show;
    UpdateControls();
  }
 protected:
  void OnThemeChanged() override {
    views::Button::OnThemeChanged();
    if (GetWidget()) label_->SetEnabledColor(SectionColor(*this, false));
  }
  void OnPaintBackground(gfx::Canvas* canvas) override {
    if (primary_.is_null() || GetState() == STATE_NORMAL) return;
    cc::PaintFlags flags;
    flags.setAntiAlias(true);
    flags.setColor(SectionColor(*this, true));
    canvas->DrawRoundRect(gfx::RectF(GetLocalBounds()), 8, flags);
  }
  void StateChanged(ButtonState old_state) override {
    views::Button::StateChanged(old_state);
    UpdateControls();
  }
 private:
  void RunPrimary() { if (!primary_.is_null()) primary_.Run(); }
  void UpdateControls() {
    if (accessory_)
      accessory_->SetVisible(always_show_accessory_ || GetState() != STATE_NORMAL);
    if (chevron_)
      chevron_->SetVisible(GetState() == STATE_HOVERED || GetState() == STATE_PRESSED);
  }
  base::RepeatingClosure primary_;
  base::RepeatingClosure secondary_;
  AuxSectionView::Context context_;
  raw_ptr<views::Label> label_ = nullptr;
  raw_ptr<views::View> controls_ = nullptr;
  raw_ptr<views::View> accessory_ = nullptr;
  raw_ptr<AuxTabExpandChevronView> chevron_ = nullptr;
  bool always_show_accessory_ = false;
};
BEGIN_METADATA(AuxSectionHeaderButton)
END_METADATA

AuxSectionView::AuxSectionView(std::u16string title, bool disclosure,
    base::RepeatingClosure primary, gfx::Insets section_insets,
    base::RepeatingClosure secondary, std::unique_ptr<views::View> accessory,
    int content_top_margin) {
  auto* layout = SetLayoutManager(std::make_unique<views::BoxLayout>(
      views::BoxLayout::Orientation::kVertical, section_insets));
  layout->set_cross_axis_alignment(views::BoxLayout::CrossAxisAlignment::kStretch);
  layout->SetCollapseMarginsSpacing(true);
  header_ = AddChildView(std::make_unique<AuxSectionHeaderButton>(
      std::move(title), disclosure, std::move(primary), std::move(secondary),
      std::move(accessory)));
  header_->SetProperty(views::kMarginsKey, gfx::Insets::VH(0, 8));
  contents_ = AddChildView(std::make_unique<views::View>());
  contents_->SetProperty(views::kMarginsKey,
                         gfx::Insets::TLBR(content_top_margin, 0, 0, 0));
  auto* contents_layout = contents_->SetLayoutManager(std::make_unique<views::BoxLayout>(
      views::BoxLayout::Orientation::kVertical));
  contents_layout->set_cross_axis_alignment(views::BoxLayout::CrossAxisAlignment::kStretch);
  contents_layout->SetCollapseMarginsSpacing(true);
}
AuxSectionView::~AuxSectionView() = default;
void AuxSectionView::SetSectionContext(Context callback) {
  header_->SetContext(std::move(callback));
}
views::Button* AuxSectionView::header_button() const { return header_; }
void AuxSectionView::SetDisclosureOpen(bool open) { header_->SetDisclosureOpen(open); }
void AuxSectionView::SetHeaderAlwaysShowAccessory(bool always_show) {
  header_->SetAlwaysShowAccessory(always_show);
}
BEGIN_METADATA(AuxSectionView)
END_METADATA
}  // namespace aux
