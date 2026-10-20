// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/views/frame/aux_vertical_bookmark_row_view.h"

#include <algorithm>
#include <utility>

#include "base/functional/bind.h"
#include "base/functional/callback_helpers.h"
#include "base/notreached.h"
#include "base/strings/utf_string_conversions.h"
#include "cc/paint/paint_flags.h"
#include "chrome/browser/ui/layout_constants.h"
#include "chrome/browser/ui/tabs/tab_style.h"
#include "chrome/browser/ui/views/frame/aux_tab_expand_chevron_view.h"
#include "chrome/browser/ui/views/tabs/tab/tab_close_button.h"
#include "components/bookmarks/browser/bookmark_node.h"
#include "third_party/skia/include/core/SkPath.h"
#include "ui/accessibility/ax_enums.mojom.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/color/color_provider_key.h"
#include "ui/compositor/layer.h"
#include "ui/events/keycodes/keyboard_codes.h"
#include "ui/gfx/canvas.h"
#include "ui/gfx/geometry/rect_f.h"
#include "ui/gfx/geometry/rounded_corners_f.h"
#include "ui/gfx/geometry/skia_conversions.h"
#include "ui/gfx/text_constants.h"
#include "ui/gfx/vector_icon_types.h"
#include "ui/views/accessibility/view_accessibility.h"
#include "ui/views/controls/image_view.h"
#include "ui/views/controls/label.h"
#include "ui/views/layout/box_layout.h"
#include "ui/views/style/typography.h"
#include "ui/views/view_class_properties.h"
#include "ui/views/widget/widget.h"

namespace aux {
namespace {
#include "chrome/browser/ui/views/frame/aux_vertical_bookmark_row_icons.inc"

bool ExactButton(const ui::MouseEvent& event, int button) {
  return (event.flags() & ui::EF_MOUSE_BUTTON) == button;
}
SkColor RowColor(const views::View& view, int original_role) {
  const bool dark = view.GetWidget()->GetColorMode() ==
                    ui::ColorProviderKey::ColorMode::kDark;
  switch (original_role) {
    case 214:
      return dark ? 0x14fafafa : 0xffffffff;
    case 216:
      return dark ? 0x33fafafa : 0x260a0a0a;
    case 219:
      return dark ? 0x0afafafa : 0x8cffffff;
    case 221:
      return dark ? 0xd9fafafa : 0xd90a0a0a;
    case 222:
      return dark ? 0x8cfafafa : 0x8c0a0a0a;
    case 225:
      return dark ? 0xa6fafafa : 0xb80a0a0a;
    case 228:
      return dark ? 0xfffafafa : 0xff0a0a0a;
    case 247:
      return dark ? 0x14fafafa : 0x140a0a0a;
  }
  NOTREACHED();
}
void PaintRounded(gfx::Canvas* canvas,
                  const gfx::RectF& bounds,
                  SkColor color,
                  bool stroke = false) {
  cc::PaintFlags flags;
  flags.setAntiAlias(true);
  flags.setColor(color);
  if (stroke) {
    flags.setStyle(cc::PaintFlags::kStroke_Style);
    flags.setStrokeWidth(1.5f);
  }
  canvas->DrawRoundRect(bounds, 10, flags);
}
}  // namespace

VerticalBookmarkRowView::VerticalBookmarkRowView(
    VerticalBookmarkRowOwner& owner,
    const bookmarks::BookmarkNode& node,
    int depth,
    bool expanded)
    : HoverCardAnchorTarget(this),
      owner_(owner),
      node_(&node),
      depth_(depth),
      expanded_(expanded) {
  layout_ = SetLayoutManager(std::make_unique<views::BoxLayout>(
      views::BoxLayout::Orientation::kHorizontal));
  layout_->set_cross_axis_alignment(
      views::BoxLayout::CrossAxisAlignment::kCenter);
  layout_->set_collapse_margins_spacing(true);
  image_ = AddChildView(std::make_unique<views::ImageView>());
  image_->SetImageSize(gfx::Size(16, 16));
  image_->SetCanProcessEventsWithinSubtree(false);
  label_ = AddChildView(std::make_unique<views::Label>(
      u"", views::style::CONTEXT_LABEL, views::style::STYLE_PRIMARY));
  label_->SetCanProcessEventsWithinSubtree(false);
  label_->SetHorizontalAlignment(gfx::ALIGN_TO_HEAD);
  label_->SetElideBehavior(gfx::FADE_TAIL);
  label_->SetAutoColorReadabilityEnabled(false);
  label_->SetSubpixelRenderingEnabled(false);
  label_->SetSkipSubpixelRenderingOpacityCheck(true);
  label_->SetBackgroundColor(SK_ColorTRANSPARENT);
  label_->SetFontList(
      label_->font_list().DeriveWithSizeDelta(2).DeriveWithWeight(
          gfx::Font::Weight::NORMAL));
  layout_->SetFlexForView(label_, 1);
  chevron_ = AddChildView(std::make_unique<AuxTabExpandChevronView>(expanded));
  close_ = AddChildView(std::make_unique<TabCloseButton>(
      base::BindRepeating(&VerticalBookmarkRowView::ClosePressed,
                          base::Unretained(this)),
      base::DoNothing()));
  close_->SetVisible(false);
  close_->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(0, 4, 0, 0));
  SetFocusBehavior(FocusBehavior::ALWAYS);
  SetNotifyEnterExitOnChild(true);
  SetPaintToLayer();
  layer()->SetFillsBoundsOpaquely(false);
  UpdateTitle();
  UpdateLayout();
  UpdateAccessories();
  UpdateLayer();
}
VerticalBookmarkRowView::~VerticalBookmarkRowView() = default;
void VerticalBookmarkRowView::SetNode(const bookmarks::BookmarkNode& node) {
  node_ = &node;
  UpdateTitle();
  UpdateAccessories();
}
void VerticalBookmarkRowView::SetFavicon(ui::ImageModel image,
                                         bool has_favicon) {
  has_favicon_ = has_favicon;
  if (has_favicon)
    image_->SetImage(std::move(image));
  UpdateGlyphs();
}
void VerticalBookmarkRowView::SetDepth(int depth) {
  if (depth_ == depth)
    return;
  depth_ = depth;
  UpdateLayout();
}
void VerticalBookmarkRowView::SetExpanded(bool expanded) {
  expanded_ = expanded;
  chevron_->SetExpanded(expanded);
}
void VerticalBookmarkRowView::SetCompact(bool compact) {
  if (compact_ == compact)
    return;
  compact_ = compact;
  UpdateLayout();
  UpdateAccessories();
}
void VerticalBookmarkRowView::SetActive(bool active) {
  if (active_ == active)
    return;
  active_ = active;
  UpdateColors();
  UpdateLayer();
  SchedulePaint();
}
void VerticalBookmarkRowView::SetHasAssociatedTab(bool associated) {
  if (associated_ == associated)
    return;
  associated_ = associated;
  UpdateAccessories();
}
void VerticalBookmarkRowView::SetHoverSuppressed(bool suppressed) {
  hover_suppressed_ = suppressed;
}
void VerticalBookmarkRowView::SetDragSelected(bool selected) {
  if (drag_selected_ == selected)
    return;
  drag_selected_ = selected;
  UpdateLayer();
  SchedulePaint();
}
void VerticalBookmarkRowView::SetDropIndicator(int indicator) {
  if (drop_indicator_ == indicator)
    return;
  drop_indicator_ = indicator;
  SchedulePaint();
}
void VerticalBookmarkRowView::UpdateTitle() {
  std::u16string title = node_->GetTitle();
  if (title.empty() && node_->is_url()) {
    title = base::UTF8ToUTF16(node_->url().has_host() ? node_->url().host()
                                                      : node_->url().spec());
  }
  label_->SetText(title);
  GetViewAccessibility().SetRole(node_->is_url() ? ax::mojom::Role::kLink
                                                 : ax::mojom::Role::kButton);
  GetViewAccessibility().SetName(title);
}
void VerticalBookmarkRowView::UpdateLayout() {
  layout_->set_main_axis_alignment(
      compact_ ? views::BoxLayout::MainAxisAlignment::kCenter
               : views::BoxLayout::MainAxisAlignment::kStart);
  layout_->set_inside_border_insets(
      gfx::Insets::TLBR(6, compact_ ? 8 : 8 + depth_ * 14, 6, 8));
  image_->SetProperty(views::kMarginsKey,
                      gfx::Insets::TLBR(0, 0, 0, compact_ ? 0 : 8));
  label_->SetVisible(!compact_);
}
void VerticalBookmarkRowView::UpdateAccessories() {
  const bool close_visible =
      !compact_ && hovered_ && associated_ && node_->is_url();
  chevron_->SetVisible(!compact_ && node_->is_folder());
  close_->SetVisible(close_visible);
  label_->SetProperty(
      views::kMarginsKey,
      gfx::Insets::TLBR(
          0, 0, 0, !compact_ && !close_visible && node_->is_url() ? 4 : 0));
}
void VerticalBookmarkRowView::UpdateColors() {
  if (!GetWidget())
    return;
  label_->SetEnabledColor(RowColor(*this, active_ ? 228 : 225));
  close_->SetColors(TabStyle::Get()->CalculateTargetColors(
      active_ ? TabStyle::TabSelectionState::kActive
              : TabStyle::TabSelectionState::kInactive,
      active_ || hovered_, hovered_, GetWidget()->ShouldPaintAsActive(),
      GetColorProvider()));
  UpdateGlyphs();
}
void VerticalBookmarkRowView::UpdateGlyphs() {
  if (!GetWidget())
    return;
  const SkColor color = RowColor(*this, active_ ? 221 : 222);
  if (node_->is_folder()) {
    image_->SetImage(ui::ImageModel::FromVectorIcon(kFolderIcon, color, 16));
    chevron_->SetForeground(
        active_ ? AuxTabExpandChevronView::Foreground::kPrimary
                : AuxTabExpandChevronView::Foreground::kSecondary);
  } else if (!has_favicon_) {
    image_->SetImage(ui::ImageModel::FromVectorIcon(kPageIcon, color, 16));
  }
}
void VerticalBookmarkRowView::UpdateLayer() {
  if (!layer())
    return;
  SetClipPath(SkPath::RRect(gfx::RectToSkRect(GetLocalBounds()), 10, 10));
  layer()->SetBackgroundBlur(0);
  layer()->SetBackdropFilterQuality(0);
  layer()->SetRoundedCornerRadius(
      gfx::RoundedCornersF(active_ || drag_selected_ ? 10 : 0));
}
void VerticalBookmarkRowView::Layout(PassKey) {
  LayoutSuperclass<views::View>(this);
  if (!close_->GetVisible())
    return;
  const auto size = close_->GetPreferredSize();
  const int padding = std::max(
      0,
      (size.width() - GetLayoutConstant(LayoutConstant::kTabCloseButtonSize)) /
          2);
  close_->SetBounds(width() - size.width() + padding - 8,
                    (height() - size.height()) / 2, size.width(),
                    size.height());
}
void VerticalBookmarkRowView::OnBoundsChanged(const gfx::Rect& previous) {
  views::View::OnBoundsChanged(previous);
  UpdateLayer();
  if (parent())
    parent()->SchedulePaint();
}
void VerticalBookmarkRowView::OnThemeChanged() {
  views::View::OnThemeChanged();
  UpdateColors();
}
bool VerticalBookmarkRowView::OnMousePressed(const ui::MouseEvent& event) {
  if (ExactButton(event, ui::EF_RIGHT_MOUSE_BUTTON) &&
      owner_->BookmarkRowContext(*this, event))
    return true;
  if (!ExactButton(event, ui::EF_LEFT_MOUSE_BUTTON) &&
      !(ExactButton(event, ui::EF_MIDDLE_MOUSE_BUTTON) && node_->is_url()))
    return false;
  owner_->HideBookmarkHoverCard();
  pressed_ = true;
  if (ExactButton(event, ui::EF_LEFT_MOUSE_BUTTON)) {
    SetMouseHandler(this);
    if (GetWidget())
      GetWidget()->SetCapture(this);
    owner_->BookmarkRowPressed(*this, event);
  }
  return true;
}
bool VerticalBookmarkRowView::OnMouseDragged(const ui::MouseEvent& event) {
  return pressed_ && ExactButton(event, ui::EF_LEFT_MOUSE_BUTTON) &&
         owner_->BookmarkRowDragged(*this, event);
}
void VerticalBookmarkRowView::OnMouseReleased(const ui::MouseEvent& event) {
  if (!pressed_)
    return;
  auto weak = weak_factory_.GetWeakPtr();
  pressed_ = false;
  if (GetWidget() && GetWidget()->HasCapture())
    GetWidget()->ReleaseCapture();
  // Releasing capture can synchronously retire the owning view.
  if (!weak)
    return;
  if (owner_->BookmarkRowReleased(*this, event) || !weak)
    return;
  if (HitTestPoint(event.location()) &&
      (ExactButton(event, ui::EF_LEFT_MOUSE_BUTTON) ||
       (ExactButton(event, ui::EF_MIDDLE_MOUSE_BUTTON) && node_->is_url()))) {
    owner_->ActivateBookmark(*node_, event);
  }
}
void VerticalBookmarkRowView::OnMouseCaptureLost() {
  if (pressed_ && drag_selected_) {
    owner_->BookmarkRowCaptureLost(*this);
  } else {
    pressed_ = false;
  }
}
void VerticalBookmarkRowView::OnMouseEntered(const ui::MouseEvent&) {
  hovered_ = true;
  UpdateAccessories();
  UpdateColors();
  SchedulePaint();
  HoverCardAnchorTarget* target = nullptr;
  if (IsValidHoverCardTarget()) {
    if (auto data = owner_->BookmarkHoverCardData(*node_)) {
      SetHoverCardDataFrom(*data);
      target = this;
    }
  }
  owner_->ShowBookmarkHoverCard(target);
}
void VerticalBookmarkRowView::OnMouseExited(const ui::MouseEvent&) {
  hovered_ = false;
  UpdateAccessories();
  UpdateColors();
  SchedulePaint();
}
bool VerticalBookmarkRowView::OnKeyPressed(const ui::KeyEvent& event) {
  if (event.key_code() != ui::VKEY_SPACE && event.key_code() != ui::VKEY_RETURN)
    return false;
  owner_->ActivateBookmark(*node_, event);
  return true;
}
void VerticalBookmarkRowView::ClosePressed(const ui::Event& event) {
  if (node_->is_url())
    owner_->CloseBookmarkTab(*node_, event);
}
bool VerticalBookmarkRowView::NeedsToShowThumbnail() const {
  return !owner_->BookmarkIsDragging(*node_);
}
bool VerticalBookmarkRowView::IsValidHoverCardTarget() const {
  return !hover_suppressed_ && node_->is_url() &&
         owner_->BookmarkHasLiveTab(*node_);
}
views::BubbleAnchor VerticalBookmarkRowView::GetAnchor() {
  return views::BubbleAnchor(this);
}
views::BubbleBorder::Arrow VerticalBookmarkRowView::GetAnchorPosition() const {
  return views::BubbleBorder::LEFT_TOP;
}
void VerticalBookmarkRowView::OnPaintBackground(gfx::Canvas* canvas) {
  canvas->DrawColor(SK_ColorTRANSPARENT, SkBlendMode::kSrc);
  const auto rect = gfx::RectF(GetLocalBounds());
  if (active_ || drag_selected_)
    PaintRounded(canvas, rect, RowColor(*this, 214));
  else if (hovered_)
    PaintRounded(canvas, rect, RowColor(*this, 247));
  if (drop_indicator_ == 1)
    PaintRounded(canvas, rect, RowColor(*this, 219));
}
void VerticalBookmarkRowView::OnPaint(gfx::Canvas* canvas) {
  views::View::OnPaint(canvas);
  if (drop_indicator_ == 1) {
    gfx::RectF rect(GetLocalBounds());
    rect.Inset(1);
    PaintRounded(canvas, rect, RowColor(*this, 216), true);
  }
}
BEGIN_METADATA(VerticalBookmarkRowView)
END_METADATA
}  // namespace aux
