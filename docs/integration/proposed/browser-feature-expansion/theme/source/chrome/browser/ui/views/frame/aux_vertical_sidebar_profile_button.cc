// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/ui/views/frame/aux_vertical_sidebar_profile_button.h"
#include "chrome/browser/themes/aux_theme_editor.h"

#include <algorithm>
#include <memory>
#include <utility>

#include "cc/paint/paint_flags.h"
#include "chrome/browser/ui/views/profiles/profile_monogram_avatar_view.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/color/color_provider_key.h"
#include "ui/events/event_constants.h"
#include "ui/gfx/canvas.h"
#include "ui/gfx/font.h"
#include "ui/gfx/font_list.h"
#include "ui/gfx/geometry/rect_f.h"
#include "ui/gfx/vector_icon_types.h"
#include "ui/views/accessibility/view_accessibility.h"
#include "ui/views/background.h"
#include "ui/views/border.h"
#include "ui/views/controls/highlight_path_generator.h"
#include "ui/views/controls/image_view.h"
#include "ui/views/controls/label.h"
#include "ui/views/layout/box_layout.h"
#include "ui/views/layout/fill_layout.h"
#include "ui/views/view_class_properties.h"
#include "ui/views/widget/widget.h"

namespace aux {
namespace {
#include "chrome/browser/ui/views/frame/aux_vertical_sidebar_profile_icons.inc"

void StyleLabel(views::Label& label, int size) {
  label.SetFontList(label.font_list().Derive(
      size - label.font_list().GetFontSize(), gfx::Font::NORMAL,
      gfx::Font::Weight::MEDIUM));
  label.SetAutoColorReadabilityEnabled(false);
  label.SetSubpixelRenderingEnabled(false);
}
}  // namespace

const gfx::VectorIcon& SidebarProfileVectorIcon(SidebarProfileGlyph glyph) {
  switch (glyph) {
    case SidebarProfileGlyph::kAccount:
      return kAccountIcon;
    case SidebarProfileGlyph::kGuest:
      return kGuestIcon;
    case SidebarProfileGlyph::kIncognito:
      return kIncognitoIcon;
  }
}

VerticalTabSidebarProfileButton::VerticalTabSidebarProfileButton(
    PressedCallback callback) : views::Button(std::move(callback)) {
  SetAnimateOnStateChange(false);
  SetTriggerableEventFlags(ui::EF_LEFT_MOUSE_BUTTON);
  SetNotifyEnterExitOnChild(true);
  layout_ = SetLayoutManager(std::make_unique<views::BoxLayout>(
      views::BoxLayout::Orientation::kHorizontal, gfx::Insets(), 0));
  layout_->set_cross_axis_alignment(views::BoxLayout::CrossAxisAlignment::kCenter);
  avatar_ = AddChildView(std::make_unique<views::View>());
  avatar_->SetCanProcessEventsWithinSubtree(false);
  avatar_->SetLayoutManager(std::make_unique<views::FillLayout>());
  avatar_->SetPreferredSize(gfx::Size(20, 20));
  image_ = avatar_->AddChildView(std::make_unique<views::ImageView>());
  image_->SetCanProcessEventsWithinSubtree(false);
  image_->SetImageSize(gfx::Size(20, 20));
  monogram_ = avatar_->AddChildView(
      std::make_unique<ProfileMonogramAvatarView>(std::u16string_view()));
  monogram_->SetCanProcessEventsWithinSubtree(false);
  monogram_->SetDiameter(20);
  monogram_->SetFontSize(12);
  monogram_->SetVisible(false);
  name_ = AddChildView(std::make_unique<views::Label>());
  name_->SetCanProcessEventsWithinSubtree(false);
  StyleLabel(*name_, 14);
  name_->SetElideBehavior(gfx::FADE_TAIL);
  name_->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(0, 0, 0, 5));
  name_->SetVisible(false);
  paused_ = AddChildView(std::make_unique<views::Label>(u"Paused"));
  paused_->SetCanProcessEventsWithinSubtree(false);
  StyleLabel(*paused_, 10);
  paused_->SetBorder(views::CreateEmptyBorder(gfx::Insets::VH(0, 5)));
  paused_->SetVisible(false);
  disclosure_ = AddChildView(std::make_unique<views::ImageView>());
  disclosure_->SetCanProcessEventsWithinSubtree(false);
  disclosure_->SetImageSize(gfx::Size(12, 12));
  disclosure_->SetPreferredSize(gfx::Size(12, 12));
  views::InstallRoundRectHighlightPathGenerator(this, gfx::Insets(), 8);
  UpdateMode();
}
VerticalTabSidebarProfileButton::~VerticalTabSidebarProfileButton() = default;

void VerticalTabSidebarProfileButton::SetDisplayName(
    std::u16string_view name, bool auth_paused) {
  display_name_ = name;
  auth_paused_ = auth_paused;
  name_->SetText(display_name_);
  // Original465dab8 explicitly hides this label even after setting its text.
  name_->SetVisible(false);
  monogram_->SetName(display_name_);
  std::u16string accessible = display_name_;
  if (auth_paused_ && !accessible.empty())
    accessible += u", Paused";
  GetViewAccessibility().SetName(accessible);
  SetTooltipText(accessible);
  UpdateMode();
}
VerticalTabSidebarProfileButton::MenuAvatarPresentation
VerticalTabSidebarProfileButton::CaptureMenuAvatarPresentation() const {
  MenuAvatarPresentation result;
  result.show_monogram = monogram_->GetVisible();
  if (!result.show_monogram && image_->GetVisible()) {
    result.image = image_->GetImageModel();
  }
  return result;
}

void VerticalTabSidebarProfileButton::SetAvatarImage(
    ui::ImageModel image, int diameter, bool show_monogram, bool profile_image) {
  avatar_diameter_ = std::max(0, diameter);
  profile_image_ = profile_image;
  avatar_->SetPreferredSize(gfx::Size(avatar_diameter_, avatar_diameter_));
  image_->SetImage(std::move(image));
  image_->SetImageSize(gfx::Size(avatar_diameter_, avatar_diameter_));
  image_->SetVisible(!show_monogram);
  monogram_->SetVisible(show_monogram);
  UpdateInsets();
}
void VerticalTabSidebarProfileButton::SetCompact(bool compact) {
  if (compact_ != compact) {
    compact_ = compact;
    UpdateMode();
  }
}
void VerticalTabSidebarProfileButton::SetLabelSuppressed(bool suppressed) {
  if (label_suppressed_ != suppressed) {
    label_suppressed_ = suppressed;
    UpdateMode();
  }
}
void VerticalTabSidebarProfileButton::SetWidthLimit(std::optional<int> width) {
  if (width_limit_ != width) {
    width_limit_ = width;
    PreferredSizeChanged();
  }
}
void VerticalTabSidebarProfileButton::UpdateMode() {
  name_->SetVisible(false);
  disclosure_->SetVisible(!compact_);
  paused_->SetVisible(!compact_ && !label_suppressed_ && auth_paused_);
  avatar_->SetProperty(views::kMarginsKey,
                       gfx::Insets::TLBR(0, 0, 0, compact_ ? 0 : 4));
  layout_->set_main_axis_alignment(
      compact_ ? views::BoxLayout::MainAxisAlignment::kCenter
               : views::BoxLayout::MainAxisAlignment::kStart);
  UpdateInsets();
}
void VerticalTabSidebarProfileButton::UpdateInsets() {
  if (compact_) {
    SetBorder(views::CreateEmptyBorder((32 - avatar_diameter_) / 2));
  } else {
    SetBorder(views::CreateEmptyBorder(
        gfx::Insets::TLBR(6, profile_image_ ? 8 : 5, 6,
                          profile_image_ ? 7 : 6)));
  }
  PreferredSizeChanged();
}
gfx::Size VerticalTabSidebarProfileButton::CalculatePreferredSize(
    const views::SizeBounds& available_size) const {
  auto size = views::Button::CalculatePreferredSize(available_size);
  if (width_limit_)
    size.set_width(std::max(0, std::min(size.width(), *width_limit_)));
  size.set_height(32);
  return size;
}
void VerticalTabSidebarProfileButton::UpdateColors() {
  if (!GetWidget())
    return;
  const bool dark = GetWidget()->GetColorMode() ==
                    ui::ColorProviderKey::ColorMode::kDark;
  const auto resolve = [this](SkColor original) {
    return aux_theme::SidebarForeground(GetWidget()->GetColorProviderKey(),
                                         GetColorProvider(), original);
  };
  const SkColor foreground = resolve(dark ? 0xd9fafafa : 0xd90a0a0a);
  name_->SetEnabledColor(foreground);
  paused_->SetEnabledColor(foreground);
  paused_->SetBackground(views::CreateRoundedRectBackground(
      resolve(dark ? 0x26fafafa : 0x1a0a0a0a), 6));
  disclosure_->SetImage(ui::ImageModel::FromVectorIcon(
      kDisclosureIcon, resolve(dark ? 0x8cfafafa : 0x8c0a0a0a), 7));
  SchedulePaint();
}
void VerticalTabSidebarProfileButton::AddedToWidget() {
  views::Button::AddedToWidget();
  UpdateColors();
}
void VerticalTabSidebarProfileButton::OnThemeChanged() {
  views::Button::OnThemeChanged();
  UpdateColors();
}
void VerticalTabSidebarProfileButton::StateChanged(ButtonState old_state) {
  views::Button::StateChanged(old_state);
  SchedulePaint();
}
void VerticalTabSidebarProfileButton::PaintButtonContents(gfx::Canvas* canvas) {
  if (GetWidget() && (GetState() == STATE_HOVERED || GetState() == STATE_PRESSED)) {
    cc::PaintFlags flags;
    flags.setAntiAlias(true);
    flags.setColor(aux_theme::SidebarForeground(
        GetWidget()->GetColorProviderKey(), GetColorProvider(),
        GetWidget()->GetColorMode() == ui::ColorProviderKey::ColorMode::kDark
            ? 0x14fafafa : 0x140a0a0a));
    canvas->DrawRoundRect(gfx::RectF(GetLocalBounds()), 8, flags);
  }
}
BEGIN_METADATA(VerticalTabSidebarProfileButton)
END_METADATA
}  // namespace aux
