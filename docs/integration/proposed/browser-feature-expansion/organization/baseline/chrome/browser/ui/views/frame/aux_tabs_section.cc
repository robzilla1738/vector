// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_tabs_section.h"

#include <memory>
#include <optional>
#include <utility>

#include "base/check.h"
#include "base/functional/bind.h"
#include "base/memory/raw_ref.h"
#include "base/time/time.h"
#include "cc/paint/paint_flags.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/base/models/image_model.h"
#include "ui/color/color_provider_key.h"
#include "ui/events/event_constants.h"
#include "ui/gfx/canvas.h"
#include "ui/gfx/font_list.h"
#include "ui/gfx/geometry/rect_f.h"
#include "ui/gfx/paint_throbber.h"
#include "ui/gfx/text_constants.h"
#include "ui/gfx/vector_icon_types.h"
#include "ui/views/accessibility/view_accessibility.h"
#include "ui/views/animation/ink_drop.h"
#include "ui/views/animation/ink_drop_host.h"
#include "ui/views/controls/button/button.h"
#include "ui/views/controls/button/button_controller.h"
#include "ui/views/controls/highlight_path_generator.h"
#include "ui/views/controls/image_view.h"
#include "ui/views/controls/label.h"
#include "ui/views/controls/throbber.h"
#include "ui/views/layout/flex_layout.h"
#include "ui/views/style/typography.h"
#include "ui/views/view_class_properties.h"
#include "ui/views/widget/widget.h"

namespace aux {
namespace {
#include "chrome/browser/ui/views/frame/aux_tabs_action_icons.inc"

SkColor MutedForeground(const views::View& view) {
  return view.GetWidget()->GetColorMode() ==
                 ui::ColorProviderKey::ColorMode::kDark
             ? 0x73fafafa
             : 0x730a0a0a;
}
SkColor ActionBackground(const views::View& view, bool pressed) {
  const bool dark = view.GetWidget()->GetColorMode() ==
                    ui::ColorProviderKey::ColorMode::kDark;
  // Original247 aliases220;269 uses the saved215 recipe. Actual window key,
  // not original numeric IDs interpreted as155's unrelated public palette.
  return pressed ? (dark ? 0x26fafafa : 0x1a0a0a0a)
                 : (dark ? 0x14fafafa : 0x140a0a0a);
}

// Source uses the ordinary12px views::Throbber with private role226.155 exposes
// only ColorId and keeps its paint epoch private. Keep the real base timer and
// Start/Stop state; a mirrored start epoch lets the same public spinner painter
// use the exact recovered RGB/alpha without inventing a public ColorId.
class MutedActionThrobber final : public views::Throbber {
  METADATA_HEADER(MutedActionThrobber, views::Throbber)
 public:
  MutedActionThrobber() : views::Throbber(12) {}
  void Start() override {
    if (!IsRunning())
      paint_start_ = base::TimeTicks::Now();
    views::Throbber::Start();
  }
  void OnPaint(gfx::Canvas* canvas) override {
    if (IsRunning() && GetWidget())
      gfx::PaintThrobberSpinning(canvas, GetContentsBounds(),
                                 MutedForeground(*this),
                                 base::TimeTicks::Now() - paint_start_);
  }

 private:
  base::TimeTicks paint_start_;
};
BEGIN_METADATA(MutedActionThrobber)
END_METADATA
}  // namespace

class AuxTabsHeaderActionButton final : public views::Button {
  METADATA_HEADER(AuxTabsHeaderActionButton, views::Button)
 public:
  AuxTabsHeaderActionButton(const gfx::VectorIcon& icon,
                            std::u16string title,
                            base::RepeatingClosure action)
      : views::Button(base::BindRepeating(&AuxTabsHeaderActionButton::Run,
                                          base::Unretained(this))),
        icon_(icon),
        action_(std::move(action)) {
    CHECK(action_);
    SetAnimateOnStateChange(false);
    SetHasInkDropActionOnClick(false);
    SetFocusBehavior(FocusBehavior::ALWAYS);
    SetTriggerableEventFlags(ui::EF_LEFT_MOUSE_BUTTON);
    button_controller()->set_notify_action(
        views::ButtonController::NotifyAction::kOnRelease);
    SetNotifyEnterExitOnChild(true);
    SetTooltipText(title);
    GetViewAccessibility().SetName(title);
    auto* layout = SetLayoutManager(std::make_unique<views::FlexLayout>());
    layout->SetOrientation(views::LayoutOrientation::kHorizontal)
        .SetCrossAxisAlignment(views::LayoutAlignment::kCenter)
        .SetInteriorMargin(gfx::Insets::VH(2, 6))
        .SetCollapseMargins(true)
        .SetDefault(views::kMarginsKey, gfx::Insets::TLBR(0, 0, 0, 4));
    image_ = AddChildView(std::make_unique<views::ImageView>());
    image_->SetCanProcessEventsWithinSubtree(false);
    image_->SetPreferredSize(gfx::Size(12, 12));
    image_->SetImageSize(gfx::Size(12, 12));
    spinner_ = AddChildView(std::make_unique<MutedActionThrobber>());
    spinner_->SetCanProcessEventsWithinSubtree(false);
    spinner_->SetVisible(false);
    label_ = AddChildView(std::make_unique<views::Label>(
        title, views::style::CONTEXT_LABEL, views::style::STYLE_PRIMARY));
    label_->SetCanProcessEventsWithinSubtree(false);
    label_->SetHorizontalAlignment(gfx::ALIGN_TO_HEAD);
    label_->SetElideBehavior(gfx::ELIDE_TAIL);
    label_->SetSubpixelRenderingEnabled(false);
    label_->SetAutoColorReadabilityEnabled(false);
    label_->SetBackgroundColor(SK_ColorTRANSPARENT);
    const auto font = label_->font_list();
    label_->SetFontList(font.Derive(12 - font.GetFontSize(), gfx::Font::NORMAL,
                                    gfx::Font::Weight::MEDIUM));
    views::InkDrop::Get(this)->SetMode(views::InkDropHost::InkDropMode::OFF);
    views::InstallRoundRectHighlightPathGenerator(this, gfx::Insets(), 8);
  }
  gfx::Size CalculatePreferredSize(const views::SizeBounds&) const override {
    // Source466bd88 caches the base unconstrained width and literal height24.
    if (!cached_size_) {
      cached_size_ = views::Button::CalculatePreferredSize(views::SizeBounds());
      cached_size_->set_height(24);
    }
    return *cached_size_;
  }
  void ChildPreferredSizeChanged(views::View*) override {
    cached_size_.reset();
    PreferredSizeChanged();
  }
  void SetBusy(bool busy) {
    spinner_->SetVisible(busy);
    if (busy)
      spinner_->Start();
    else
      spinner_->Stop();
    image_->SetVisible(!busy);
    SetEnabled(!busy);
    // Original464d520 targets ViewAccessibility (+2c8), not TooltipText.
    GetViewAccessibility().SetName(busy ? u"Organizing tabs"
                                        : GetTooltipText());
    cached_size_.reset();
    PreferredSizeChanged();
  }

 protected:
  void OnThemeChanged() override {
    views::Button::OnThemeChanged();
    if (!GetWidget())
      return;
    const SkColor color = MutedForeground(*this);
    image_->SetImage(ui::ImageModel::FromVectorIcon(icon_.get(), color, 12));
    label_->SetEnabledColor(color);
  }
  void OnPaintBackground(gfx::Canvas* canvas) override {
    if (!GetWidget() ||
        (GetState() != STATE_HOVERED && GetState() != STATE_PRESSED))
      return;
    cc::PaintFlags flags;
    flags.setAntiAlias(true);
    flags.setColor(ActionBackground(*this, GetState() == STATE_PRESSED));
    canvas->DrawRoundRect(gfx::RectF(GetLocalBounds()), 8, flags);
  }
  void StateChanged(ButtonState old_state) override {
    views::Button::StateChanged(old_state);
    SchedulePaint();
  }

 private:
  void Run() { action_.Run(); }
  const raw_ref<const gfx::VectorIcon> icon_;
  base::RepeatingClosure action_;
  raw_ptr<views::ImageView> image_ = nullptr;
  raw_ptr<MutedActionThrobber> spinner_ = nullptr;
  raw_ptr<views::Label> label_ = nullptr;
  mutable std::optional<gfx::Size> cached_size_;
};
BEGIN_METADATA(AuxTabsHeaderActionButton)
END_METADATA

struct AuxTabsSection::Accessory {
  std::unique_ptr<views::View> view;
  raw_ptr<AuxTabsHeaderActionButton> tidy;
  raw_ptr<AuxTabsHeaderActionButton> clear;
};
AuxTabsSection::Accessory AuxTabsSection::MakeAccessory(Actions actions) {
  CHECK(actions.tidy);
  CHECK(actions.clear);
  Accessory accessory{std::make_unique<views::View>(), nullptr, nullptr};
  auto* layout =
      accessory.view->SetLayoutManager(std::make_unique<views::FlexLayout>());
  layout->SetOrientation(views::LayoutOrientation::kHorizontal)
      .SetCrossAxisAlignment(views::LayoutAlignment::kCenter)
      .SetCollapseMargins(true)
      .SetDefault(views::kMarginsKey, gfx::Insets::TLBR(0, 0, 0, 4));
  accessory.tidy =
      accessory.view->AddChildView(std::make_unique<AuxTabsHeaderActionButton>(
          kTidyIcon, u"Tidy", std::move(actions.tidy)));
  accessory.tidy->SetTooltipText(u"Organize tabs with AI");
  accessory.clear =
      accessory.view->AddChildView(std::make_unique<AuxTabsHeaderActionButton>(
          kClearIcon, u"Clear", std::move(actions.clear)));
  // Source37e333x overrides only the final accessory child's default margin.
  accessory.clear->SetProperty(views::kMarginsKey, gfx::Insets());
  return accessory;
}
AuxTabsSection::AuxTabsSection(Actions actions)
    : AuxTabsSection(MakeAccessory(std::move(actions))) {}
AuxTabsSection::AuxTabsSection(Accessory accessory)
    : AuxSectionView(u"Tabs",
                     false,
                     {},
                     gfx::Insets::TLBR(4, 0, 0, 0),
                     {},
                     std::move(accessory.view),
                     4),
      tidy_(accessory.tidy),
      clear_(accessory.clear) {}
AuxTabsSection::~AuxTabsSection() = default;
views::Button* AuxTabsSection::tidy_button() const {
  return tidy_;
}
views::Button* AuxTabsSection::clear_button() const {
  return clear_;
}
void AuxTabsSection::SetTidyBusy(bool busy) {
  tidy_->SetBusy(busy);
  SetHeaderAlwaysShowAccessory(busy);
}
BEGIN_METADATA(AuxTabsSection)
END_METADATA
}  // namespace aux
