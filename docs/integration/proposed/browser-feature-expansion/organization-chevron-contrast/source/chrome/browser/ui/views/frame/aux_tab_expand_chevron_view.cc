// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_tab_expand_chevron_view.h"

#include "base/time/time.h"
#include "chrome/browser/themes/aux_theme_editor.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/base/models/image_model.h"
#include "ui/color/color_provider_key.h"
#include "ui/gfx/animation/animation.h"
#include "ui/gfx/canvas.h"
#include "ui/gfx/geometry/transform.h"
#include "ui/gfx/vector_icon_types.h"
#include "ui/views/view_class_properties.h"
#include "ui/views/widget/widget.h"

namespace aux {
namespace {
#include "chrome/browser/ui/views/frame/aux_section_icons.inc"
}  // namespace
AuxTabExpandChevronView::AuxTabExpandChevronView(bool expanded,
    Foreground foreground) : expanded_(expanded), foreground_(foreground) {
  SetCanProcessEventsWithinSubtree(false);
  SetPreferredSize(gfx::Size(16, 16));
  SetProperty(views::kMarginsKey, gfx::Insets::TLBR(0, 4, 0, 0));
  animation_.SetSlideDuration(gfx::Animation::ShouldRenderRichAnimation()
      ? base::Milliseconds(180) : base::TimeDelta());
  animation_.Reset(expanded ? 1.0 : 0.0);
}
AuxTabExpandChevronView::~AuxTabExpandChevronView() = default;
void AuxTabExpandChevronView::SetExpanded(bool expanded) {
  if (expanded_ == expanded) return;
  expanded_ = expanded;
  if (expanded) animation_.Show();
  else animation_.Hide();
}
void AuxTabExpandChevronView::SetForeground(Foreground foreground) {
  if (foreground_ == foreground) return;
  foreground_ = foreground;
  UpdateImage();
}
void AuxTabExpandChevronView::OnPaint(gfx::Canvas* canvas) {
  canvas->Save();
  gfx::Transform rotation;
  rotation.Translate(width() / 2.0f, height() / 2.0f);
  rotation.Rotate(180.0 * animation_.GetCurrentValue());
  rotation.Translate(-width() / 2.0f, -height() / 2.0f);
  canvas->Transform(rotation);
  views::ImageView::OnPaint(canvas);
  canvas->Restore();
}
void AuxTabExpandChevronView::OnThemeChanged() {
  views::ImageView::OnThemeChanged();
  UpdateImage();
}
void AuxTabExpandChevronView::UpdateImage() {
  if (!GetWidget()) return;
  const bool dark = GetWidget()->GetColorMode() ==
      ui::ColorProviderKey::ColorMode::kDark;
  const SkColor fallback = foreground_ == Foreground::kPrimary
      ? (dark ? 0xd9fafafa : 0xd90a0a0a)
      : foreground_ == Foreground::kMuted
          ? (dark ? 0x73fafafa : 0x730a0a0a)
          : (dark ? 0x8cfafafa : 0x8c0a0a0a);
  const SkColor color = aux_theme::SidebarForeground(
      GetWidget()->GetCurrentColorProviderKey(), GetColorProvider(), fallback);
  SetImage(ui::ImageModel::FromVectorIcon(kDisclosureIcon, color, 16));
}
void AuxTabExpandChevronView::AnimationProgressed(const gfx::Animation*) {
  SchedulePaint();
}
BEGIN_METADATA(AuxTabExpandChevronView)
END_METADATA
}  // namespace aux
