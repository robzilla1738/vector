// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_new_chat_view.h"
#include <utility>
#include "base/check.h"
#include "base/functional/bind.h"
#include "cc/paint/paint_flags.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/base/models/image_model.h"
#include "ui/color/color_provider_key.h"
#include "ui/gfx/canvas.h"
#include "ui/gfx/font_list.h"
#include "ui/gfx/vector_icon_types.h"
#include "ui/views/accessibility/view_accessibility.h"
#include "ui/views/controls/button/button.h"
#include "ui/views/controls/button/button_controller.h"
#include "ui/views/controls/button/label_button.h"
#include "ui/views/border.h"
#include "ui/views/controls/highlight_path_generator.h"
#include "ui/views/controls/image_view.h"
#include "ui/views/controls/label.h"
#include "ui/views/layout/box_layout.h"
#include "ui/views/view_class_properties.h"
#include "ui/views/widget/widget.h"
namespace aux {
namespace {
#include "chrome/browser/ui/views/frame/aux_new_chat_icon.inc"
bool Dark(const views::View& view) {
  return view.GetWidget() && view.GetWidget()->GetColorMode() ==
      ui::ColorProviderKey::ColorMode::kDark;
}
}  // namespace
// Original VerticalNewTabButton base4242e5c keeps its LabelButton graph.
class AuxNewChatNormalButton final : public views::LabelButton {
  METADATA_HEADER(AuxNewChatNormalButton, views::LabelButton)
 public:
  AuxNewChatNormalButton(base::RepeatingClosure callback,
                        const std::u16string& shortcut_help)
      : views::LabelButton(std::move(callback), u"New Chat") {
    SetMinSize(gfx::Size(0, 32));
    SetBorder(views::CreateEmptyBorder(gfx::Insets::VH(6, 8)));
    SetImageLabelSpacing(8);
    SetHorizontalAlignment(gfx::ALIGN_LEFT);
    label()->SetHorizontalAlignment(gfx::ALIGN_TO_HEAD);
    label()->SetElideBehavior(gfx::FADE_TAIL);
    label()->SetAutoColorReadabilityEnabled(false);
    label()->SetSubpixelRenderingEnabled(false);
    const gfx::FontList font;
    label()->SetFontList(font.Derive(14 - font.GetFontSize(), gfx::Font::NORMAL,
                           gfx::Font::Weight::NORMAL));
    SetTooltipText(u"New Chat");
    if (!shortcut_help.empty()) GetViewAccessibility().SetDescription(shortcut_help);
    views::InstallRoundRectHighlightPathGenerator(this, gfx::Insets(), 8);
  }
 protected:
  void OnThemeChanged() override {
    views::LabelButton::OnThemeChanged();
    const SkColor color = Dark(*this) ? 0x8cfafafa : 0x8c0a0a0a;
    SetEnabledTextColors(color);
    SetTextColor(STATE_DISABLED, color);
    SetImageModel(STATE_NORMAL, ui::ImageModel::FromVectorIcon(kNewChatIcon, color, 16));
  }
  void OnPaintBackground(gfx::Canvas* canvas) override {
    if (GetState() != STATE_HOVERED && GetState() != STATE_PRESSED) return;
    cc::PaintFlags flags;
    flags.setAntiAlias(true);
    flags.setColor(Dark(*this) ? 0x14fafafa : 0x140a0a0a);
    canvas->DrawRoundRect(gfx::RectF(GetLocalBounds()), 8, flags);
  }
};
BEGIN_METADATA(AuxNewChatNormalButton)
END_METADATA
class AuxNewChatButton final : public views::Button {
  METADATA_HEADER(AuxNewChatButton, views::Button)
 public:
  AuxNewChatButton(base::RepeatingClosure callback,
                   const std::u16string& shortcut_help)
      : views::Button(std::move(callback)) {
    SetFocusBehavior(FocusBehavior::ALWAYS);
    button_controller()->set_notify_action(views::ButtonController::NotifyAction::kOnRelease);
    SetNotifyEnterExitOnChild(true);
    SetTooltipText(u"New Chat");
    GetViewAccessibility().SetName(u"New Chat");
    if (!shortcut_help.empty()) GetViewAccessibility().SetDescription(shortcut_help);
    auto* layout = SetLayoutManager(std::make_unique<views::BoxLayout>(
        views::BoxLayout::Orientation::kHorizontal, gfx::Insets::VH(6, 8)));
    layout->set_cross_axis_alignment(views::BoxLayout::CrossAxisAlignment::kCenter);
    image_ = AddChildView(std::make_unique<views::ImageView>());
    image_->SetCanProcessEventsWithinSubtree(false);
    image_->SetPreferredSize(gfx::Size(16, 16));
    image_->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(0, 0, 0, 8));
    label_ = AddChildView(std::make_unique<views::Label>(u"New Chat"));
    label_->SetCanProcessEventsWithinSubtree(false);
    label_->SetAutoColorReadabilityEnabled(false);
    label_->SetSubpixelRenderingEnabled(false);
    label_->SetHorizontalAlignment(gfx::ALIGN_TO_HEAD);
    label_->SetElideBehavior(gfx::FADE_TAIL);
    const gfx::FontList font;
    label_->SetFontList(font.Derive(14 - font.GetFontSize(), gfx::Font::NORMAL,
                                   gfx::Font::Weight::NORMAL));
    layout->SetFlexForView(label_, 1);
    views::InstallRoundRectHighlightPathGenerator(this, gfx::Insets(), 10);
  }
  gfx::Size CalculatePreferredSize(const views::SizeBounds&) const override {
    // Original selected46698f4 returns0x2000000000; normal base has min32.
    return gfx::Size(0, 32);
  }
 protected:
  void OnThemeChanged() override {
    views::Button::OnThemeChanged();
    const SkColor foreground = Dark(*this) ? 0xa6fafafa : 0xb80a0a0a;
    label_->SetEnabledColor(foreground);
    image_->SetImage(ui::ImageModel::FromVectorIcon(kNewChatIcon, foreground, 16));
  }
  void OnPaintBackground(gfx::Canvas* canvas) override {
    cc::PaintFlags flags;
    flags.setAntiAlias(true);
    flags.setColor(Dark(*this) ? 0x14fafafa : 0xffffffff);
    canvas->DrawRoundRect(gfx::RectF(GetLocalBounds()), 10, flags);
  }
 private:
  raw_ptr<views::ImageView> image_ = nullptr;
  raw_ptr<views::Label> label_ = nullptr;
};
BEGIN_METADATA(AuxNewChatButton)
END_METADATA
AuxNewChatView::AuxNewChatView(base::RepeatingClosure new_chat,
                               std::u16string shortcut_help) {
  CHECK(new_chat);
  auto* layout = SetLayoutManager(std::make_unique<views::BoxLayout>(
      views::BoxLayout::Orientation::kVertical, gfx::Insets::TLBR(1, 1, 0, 1)));
  layout->set_cross_axis_alignment(views::BoxLayout::CrossAxisAlignment::kStretch);
  normal_ = AddChildView(std::make_unique<AuxNewChatNormalButton>(new_chat, shortcut_help));
  selected_ = AddChildView(std::make_unique<AuxNewChatButton>(new_chat, shortcut_help));
  selected_->SetVisible(false);
}
AuxNewChatView::~AuxNewChatView() = default;
void AuxNewChatView::SetRepresentedTab(std::optional<tabs::TabHandle> tab, bool active) {
  tab_ = tab;
  const bool selected = tab.has_value() && active;
  selected_->SetVisible(selected);
  normal_->SetVisible(!selected);
}
BEGIN_METADATA(AuxNewChatView)
END_METADATA
}  // namespace aux
