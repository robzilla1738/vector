// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/ui/views/profiles/profile_monogram_avatar_view.h"

#include <algorithm>
#include <utility>

#include "base/check.h"
#include "base/i18n/break_iterator.h"
#include "base/strings/string_util.h"
#include "cc/paint/paint_flags.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/color/color_provider_key.h"
#include "ui/gfx/canvas.h"
#include "ui/gfx/font_list.h"
#include "ui/gfx/geometry/point_f.h"
#include "ui/views/widget/widget.h"

namespace {
std::u16string FirstGrapheme(std::u16string_view name) {
  // Original4587780 uses the first ICU character boundary, not a code unit,
  // code point, trimmed name, or invented fallback glyph.
  base::i18n::BreakIterator iterator(
      name, base::i18n::BreakIterator::BREAK_CHARACTER);
  if (!iterator.Init() || !iterator.Advance()) {
    return {};
  }
  std::u16string grapheme(iterator.GetString());
  // Original45878b0..45878ec uppercases only a one-unit ASCII letter.
  // Non-ASCII graphemes (including surrogate pairs/combining sequences) stay
  // intact; this is deliberately not a locale-wide Unicode uppercase.
  if (grapheme.size() == 1 && base::IsAsciiAlpha(grapheme.front())) {
    grapheme.front() = base::ToUpperASCII(grapheme.front());
  }
  return grapheme;
}

SkColor DefaultColor(const views::View& view, bool foreground) {
  CHECK(view.GetWidget());
  const bool dark = view.GetWidget()->GetColorMode() ==
                    ui::ColorProviderKey::ColorMode::kDark;
  // Actual supplied mixer035e6d40 and native fixed name-map pairs. The glyph
  // uses ControlProminentForeground262; its circle uses SecondaryForeground222.
  if (foreground) {
    return dark ? 0xd90a0a0a : 0xd9fafafa;
  }
  return dark ? 0x8cfafafa : 0x8c0a0a0a;
}
}  // namespace

ProfileMonogramAvatarView::ProfileMonogramAvatarView(std::u16string_view name)
    : monogram_(FirstGrapheme(name)) {}
ProfileMonogramAvatarView::~ProfileMonogramAvatarView() = default;

void ProfileMonogramAvatarView::SetName(std::u16string_view name) {
  std::u16string monogram = FirstGrapheme(name);
  if (monogram_ != monogram) {
    monogram_ = std::move(monogram);
    SchedulePaint();
  }
}

void ProfileMonogramAvatarView::SetDiameter(int diameter) {
  if (diameter_ != diameter) {
    diameter_ = diameter;
    PreferredSizeChanged();
    SchedulePaint();
  }
}

void ProfileMonogramAvatarView::SetFontSize(int font_size) {
  if (font_size_ != font_size) {
    font_size_ = font_size;
    SchedulePaint();
  }
}

void ProfileMonogramAvatarView::SetForegroundColor(ui::ColorVariant color) {
  foreground_ = std::move(color);
  SchedulePaint();
}
void ProfileMonogramAvatarView::SetBackgroundColor(ui::ColorVariant color) {
  background_ = std::move(color);
  SchedulePaint();
}

gfx::Size ProfileMonogramAvatarView::CalculatePreferredSize(
    const views::SizeBounds& available_size) const {
  // Original45882c0 clamps the preferred diameter; actual paint uses the real
  // allocated bounds and does not force the View to this size.
  const int diameter = std::max(diameter_, 0);
  return gfx::Size(diameter, diameter);
}

void ProfileMonogramAvatarView::OnPaint(gfx::Canvas* canvas) {
  const SkColor background = background_
      ? background_->ResolveToSkColor(GetColorProvider())
      : DefaultColor(*this, false);
  cc::PaintFlags flags;
  flags.setAntiAlias(true);
  flags.setColor(background);
  const float radius = std::min(width(), height()) * 0.5f;
  canvas->DrawCircle(gfx::PointF(width() * 0.5f, height() * 0.5f), radius, flags);
  if (monogram_.empty()) {
    return;
  }
  const gfx::FontList base_font;
  const gfx::FontList font = base_font.Derive(
      font_size_ - base_font.GetFontSize(), gfx::Font::NORMAL,
      gfx::Font::Weight::SEMIBOLD);
  const SkColor foreground = foreground_
      ? foreground_->ResolveToSkColor(GetColorProvider())
      : DefaultColor(*this, true);
  canvas->DrawStringRectWithFlags(
      monogram_, font, foreground, GetLocalBounds(),
      gfx::Canvas::TEXT_ALIGN_CENTER | gfx::Canvas::NO_SUBPIXEL_RENDERING);
}

void ProfileMonogramAvatarView::OnThemeChanged() {
  views::View::OnThemeChanged();
  SchedulePaint();
}

BEGIN_METADATA(ProfileMonogramAvatarView)
END_METADATA
