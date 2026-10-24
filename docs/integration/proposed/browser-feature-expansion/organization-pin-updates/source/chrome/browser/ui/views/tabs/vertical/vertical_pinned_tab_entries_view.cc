#include "chrome/browser/ui/views/frame/aux_organization_window_controller.h"
// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/views/tabs/vertical/vertical_pinned_tab_entries_view.h"

#include <algorithm>
#include <limits>
#include <cstdlib>
#include <memory>
#include <utility>

#include "base/check.h"
#include "base/functional/bind.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/single_thread_task_runner.h"
#include "base/time/time.h"
#include "cc/paint/paint_flags.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/aux/organization/organization_profile_service.h"
#include "chrome/browser/aux/organization/organization_service.h"
#include "chrome/browser/ui/tabs/aux_organization_pin_adapter.h"
#include "chrome/browser/ui/color/chrome_color_id.h"
#include "ui/gfx/vector_icon_types.h"
#include "chrome/browser/favicon/favicon_service_factory.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tab_ui_helper.h"
#include "chrome/browser/ui/tabs/tab_enums.h"
#include "chrome/browser/ui/tabs/tab_menu_model.h"
#include "chrome/browser/ui/tabs/tab_menu_model_delegate.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/ui/views/frame/vertical_tab_strip_region_view.h"
#include "chrome/browser/ui/views/tabs/common/tab_strip_collection_controller.h"
#include "chrome/browser/ui/views/tabs/tab/tab_context_menu_controller.h"
#include "chrome/browser/ui/views/tabs/vertical/aux_pinned_tab_entry_actions.h"
#include "chrome/grit/generated_resources.h"
#include "components/tabs/public/tab_interface.h"
#include "components/favicon/core/favicon_service.h"
#include "components/favicon_base/favicon_types.h"
#include "components/keyed_service/core/service_access_type.h"
#include "content/public/browser/web_contents.h"
#include "ui/base/l10n/l10n_util.h"
#include "ui/accessibility/ax_enums.mojom.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/base/mojom/menu_source_type.mojom.h"
#include "ui/color/color_provider_key.h"
#include "ui/compositor/layer.h"
#include "ui/events/event.h"
#include "ui/events/keycodes/keyboard_codes.h"
#include "ui/gfx/canvas.h"
#include "ui/gfx/image/image.h"
#include "ui/gfx/animation/animation_delegate.h"
#include "ui/gfx/animation/linear_animation.h"
#include "ui/gfx/animation/tween.h"
#include "ui/gfx/geometry/vector2d_conversions.h"
#include "ui/gfx/geometry/transform.h"
#include "ui/gfx/vector_icon_types.h"
#include "ui/views/accessibility/view_accessibility.h"
#include "ui/views/controls/image_view.h"
#include "ui/views/controls/menu/menu_runner.h"
#include "ui/views/widget/widget.h"

#include "chrome/browser/ui/tabs/tab_data.h"
#include "chrome/browser/ui/views/tabs/hovercard/hover_card_anchor_target.h"
#include "chrome/browser/ui/views/tabs/hovercard/tab_hover_card_controller.h"
#include "chrome/browser/ui/views/tabs/tab_slot_controller.h"
#include "third_party/skia/include/core/SkPath.h"
#include "ui/gfx/color_analysis.h"
#include "ui/gfx/color_utils.h"
#include "ui/gfx/shadow_value.h"
#include "ui/gfx/skia_paint_util.h"
#include "ui/gfx/skia_util.h"

namespace {
#include "chrome/browser/ui/tabs/aux_new_tab_mark.inc"
constexpr int kEntryHeight = 40;
constexpr int kPreferredWidth = 32;
constexpr int kGap = 6;
// Exact supplied kGlobeIcon (24-unit path rendered at16), not the Agent row
// glyph.
// clang-format off
constexpr gfx::PathElement kGlobePath[] = {
    gfx::CANVAS_DIMENSIONS, 24.0f,
    gfx::FILL_RULE_NONZERO,
    gfx::MOVE_TO, 12.0f, 22.0f,
    gfx::R_ARC_TO, 9.68999958f, 9.68999958f, 0.0f, 0.0f, 1.0f, -3.9000001f, -0.790000021f,
    gfx::R_ARC_TO, 9.98999977f, 9.98999977f, 0.0f, 0.0f, 1.0f, -3.18000007f, -2.1400001f,
    gfx::R_ARC_TO, 9.98999977f, 9.98999977f, 0.0f, 0.0f, 1.0f, -2.1400001f, -3.18000007f,
    gfx::ARC_TO, 9.68999958f, 9.68999958f, 0.0f, 0.0f, 1.0f, 2.0f, 12.0f,
    gfx::R_CUBIC_TO, 0.0f, -1.38f, 0.25999999f, -2.68000007f, 0.790000021f, -3.9000001f,
    gfx::R_ARC_TO, 9.98999977f, 9.98999977f, 0.0f, 0.0f, 1.0f, 2.1400001f, -3.18000007f,
    gfx::R_ARC_TO, 9.98999977f, 9.98999977f, 0.0f, 0.0f, 1.0f, 3.18000007f, -2.1400001f,
    gfx::ARC_TO, 9.68999958f, 9.68999958f, 0.0f, 0.0f, 1.0f, 12.0f, 2.0f,
    gfx::R_CUBIC_TO, 1.38f, 0.0f, 2.68000007f, 0.25999999f, 3.9000001f, 0.790000021f,
    gfx::R_ARC_TO, 9.98999977f, 9.98999977f, 0.0f, 0.0f, 1.0f, 3.18000007f, 2.1400001f,
    gfx::R_ARC_TO, 9.98999977f, 9.98999977f, 0.0f, 0.0f, 1.0f, 2.1400001f, 3.18000007f,
    gfx::ARC_TO, 9.68999958f, 9.68999958f, 0.0f, 0.0f, 1.0f, 22.0f, 12.0f,
    gfx::R_ARC_TO, 9.68999958f, 9.68999958f, 0.0f, 0.0f, 1.0f, -0.790000021f, 3.9000001f,
    gfx::R_ARC_TO, 9.98999977f, 9.98999977f, 0.0f, 0.0f, 1.0f, -2.1400001f, 3.18000007f,
    gfx::R_ARC_TO, 9.98999977f, 9.98999977f, 0.0f, 0.0f, 1.0f, -3.18000007f, 2.1400001f,
    gfx::ARC_TO, 9.68999958f, 9.68999958f, 0.0f, 0.0f, 1.0f, 12.0f, 22.0f,
    gfx::CLOSE,
    gfx::R_MOVE_TO, 0.0f, -2.0f,
    gfx::R_CUBIC_TO, 2.23000002f, 0.0f, 4.13000011f, -0.769999981f, 5.67999983f, -2.31999993f,
    gfx::CUBIC_TO, 19.2299995f, 16.1299992f, 20.0f, 14.2299995f, 20.0f, 12.0f,
    gfx::R_CUBIC_TO, 0.0f, -0.119999997f, 0.0f, -0.239999995f, -0.00999999978f, -0.360000014f,
    gfx::R_ARC_TO, 5.0999999f, 5.0999999f, 0.0f, 0.0f, 1.0f, -0.00999999978f, -0.310000002f,
    gfx::R_ARC_TO, 1.99000001f, 1.99000001f, 0.0f, 0.0f, 1.0f, -0.680000007f, 1.20000005f,
    gfx::ARC_TO, 1.92999995f, 1.92999995f, 0.0f, 0.0f, 1.0f, 18.0f, 13.0f,
    gfx::R_H_LINE_TO, -2.0f,
    gfx::R_CUBIC_TO, -0.550000012f, 0.0f, -1.01999998f, -0.189999998f, -1.40999997f, -0.589999974f,
    gfx::ARC_TO, 1.94000006f, 1.94000006f, 0.0f, 0.0f, 1.0f, 14.0f, 11.0f,
    gfx::R_V_LINE_TO, -1.0f,
    gfx::R_H_LINE_TO, -4.0f,
    gfx::V_LINE_TO, 8.0f,
    gfx::R_CUBIC_TO, 0.0f, -0.550000012f, 0.200000003f, -1.01999998f, 0.589999974f, -1.40999997f,
    gfx::CUBIC_TO, 10.9799995f, 6.19999981f, 11.4499998f, 6.0f, 12.0f, 6.0f,
    gfx::R_H_LINE_TO, 1.0f,
    gfx::R_ARC_TO, 1.70000005f, 1.70000005f, 0.0f, 0.0f, 1.0f, 0.310000002f, -1.00999999f,
    gfx::R_CUBIC_TO, 0.209999993f, -0.289999992f, 0.460000008f, -0.529999971f, 0.75999999f, -0.709999979f,
    gfx::R_ARC_TO, 11.0200005f, 11.0200005f, 0.0f, 0.0f, 0.0f, -1.00999999f, -0.200000003f,
    gfx::ARC_TO, 7.19999981f, 7.19999981f, 0.0f, 0.0f, 0.0f, 12.0f, 4.0f,
    gfx::R_CUBIC_TO, -2.23000002f, 0.0f, -4.11999989f, 0.769999981f, -5.67999983f, 2.31999993f,
    gfx::CUBIC_TO, 4.76999998f, 7.88000011f, 4.0f, 9.77000046f, 4.0f, 12.0f,
    gfx::R_H_LINE_TO, 5.0f,
    gfx::R_CUBIC_TO, 1.10000002f, 0.0f, 2.03999996f, 0.389999986f, 2.81999993f, 1.17999995f,
    gfx::CUBIC_TO, 12.6099997f, 13.96f, 13.0f, 14.8999996f, 13.0f, 16.0f,
    gfx::R_V_LINE_TO, 1.0f,
    gfx::R_H_LINE_TO, -3.0f,
    gfx::R_V_LINE_TO, 2.75f,
    gfx::R_CUBIC_TO, 0.330000013f, 0.0799999982f, 0.660000026f, 0.140000001f, 0.99000001f, 0.189999998f,
    gfx::R_CUBIC_TO, 0.330000013f, 0.0399999991f, 0.660000026f, 0.0599999987f, 1.00999999f, 0.0599999987f,
    gfx::CLOSE,
};
const gfx::VectorIconRep kGlobeReps[] = {{kGlobePath}};
const gfx::VectorIcon kGlobeIcon(kGlobeReps, 1, "kAuxPinnedGlobeIcon");
// clang-format on

bool IsDark(const views::View& view) {
  return view.GetWidget()->GetColorMode() ==
         ui::ColorProviderKey::ColorMode::kDark;
}
std::optional<SkColor> FaviconAccent(const ui::ImageModel& image) {
  if (!image.IsImage())
    return std::nullopt;
  const gfx::Image source = image.GetImage();
  const SkBitmap* bitmap = source.ToSkBitmap();
  if (!bitmap || bitmap->width() < 1 || bitmap->height() < 1)
    return std::nullopt;
  auto swatches = color_utils::CalculateColorSwatches(
      *bitmap, 8, gfx::Rect(bitmap->width(), bitmap->height()),
      base::BindRepeating([](const SkColor& color) {
        if (SkColorGetA(color) < 128)
          return false;
        color_utils::HSL hsl;
        color_utils::SkColorToHSL(color, &hsl);
        return hsl.s >= 0.18 && hsl.l >= 0.12 && hsl.l <= 0.88;
      }));
  return swatches.empty() ? std::nullopt
                          : std::make_optional(swatches.front().color);
}
}  // namespace

class VerticalPinnedTabEntriesView::EntryView : public views::View,
                                                public gfx::AnimationDelegate,
                                                public HoverCardAnchorTarget {
  METADATA_HEADER(EntryView, views::View)
 public:
  EntryView(VerticalPinnedTabEntriesView* owner, size_t index)
      : HoverCardAnchorTarget(this), owner_(owner), index_(index), slide_(base::Milliseconds(140), 60, this) {
    SetUseDefaultFillLayout(true);
    SetPreferredSize(gfx::Size(kEntryHeight, kEntryHeight));
    SetPaintToLayer(ui::LAYER_TEXTURED);
    layer()->SetFillsBoundsOpaquely(false);
    icon_ = AddChildView(std::make_unique<views::ImageView>());
    icon_->SetImageSize(gfx::Size(16, 16));
    icon_->SetCanProcessEventsWithinSubtree(false);
    SetFocusBehavior(FocusBehavior::ALWAYS);
    SetNotifyEnterExitOnChild(true);
  }
  void Update() {
    if (index_ >= owner_->entries_.size())
      return;
    const auto& entry = owner_->entries_[index_];
    const auto description = entry.title + (entry.shared_update
        ? u"\nUpdated in another window. Right-click to use the shared URL or keep an independent copy."
        : std::u16string());
    SetTooltipText(owner_->IsEntryDragInProgress() ? std::u16string() : description);
    GetViewAccessibility().SetRole(ax::mojom::Role::kButton);
    GetViewAccessibility().SetName(description);
    if (!entry.image.IsEmpty()) {
      icon_->SetImage(entry.image);
    } else if (GetWidget()) {
      const SkColor color = entry.active
                                ? (IsDark(*this) ? 0xd9fafafa : 0xd90a0a0a)
                                : (IsDark(*this) ? 0x8cfafafa : 0x8c0a0a0a);
      icon_->SetImage(ui::ImageModel::FromVectorIcon(kGlobeIcon, color, 16));
    }
    SchedulePaint();
  }
  void OnThemeChanged() override {
    views::View::OnThemeChanged();
    if (GetWidget())
      Update();
  }
  void AddedToWidget() override {
    views::View::AddedToWidget();
    Update();
  }
  bool NeedsToShowThumbnail() const override {
    return index_ < owner_->entries_.size() &&
           !owner_->entries_[index_].active;
  }
  bool IsValidHoverCardTarget() const override {
    return !owner_->paused_ && !owner_->IsEntryDragInProgress() &&
           owner_->model_ && index_ < owner_->entries_.size() &&
           aux::FindPinnedTabEntry(*owner_->model_,
                                  owner_->entries_[index_].saved).has_value();
  }
  views::BubbleAnchor GetAnchor() override { return views::BubbleAnchor(this); }
  views::BubbleBorder::Arrow GetAnchorPosition() const override {
    return views::BubbleBorder::LEFT_TOP;
  }
  bool OnMousePressed(const ui::MouseEvent& event) override {
    auto alive = weak_factory_.GetWeakPtr();
    owner_->hover_card_controller_->UpdateHoverCard(
        nullptr, TabSlotController::HoverCardUpdateType::kEvent);
    if (!alive)
      return true;
    if (event.IsOnlyRightMouseButton()) {
      gfx::Point point = event.location();
      views::View::ConvertPointToScreen(this, &point);
      owner_->ShowEntryContextMenu(index_, point);
      return true;
    }
    if (!event.IsOnlyLeftMouseButton() && !event.IsOnlyMiddleMouseButton())
      return false;
    pressed_ = true;
    auto weak = weak_factory_.GetWeakPtr();
    RequestFocus();
    if (!weak || owner_->paused_ || !owner_->model_)
      return true;
    if (event.IsOnlyLeftMouseButton()) {
      grab_offset_ = event.location();
      press_in_leaf_ = event.location();
      views::View::ConvertPointToTarget(this, owner_, &press_in_leaf_);
      owner_->PrepareEntryDrag(index_);
      if (!weak)
        return true;
      SetMouseAndGestureHandler(this);
      if (!weak)
        return true;
      if (GetWidget()) {
        captured_ = true;
        GetWidget()->SetCapture(this);
      }
    }
    return true;
  }
  void OnMouseReleased(const ui::MouseEvent& event) override {
    const bool pressed = std::exchange(pressed_, false);
    const bool dragged = std::exchange(drag_started_, false);
    auto weak = weak_factory_.GetWeakPtr();
    captured_ = false;
    if (GetWidget() && GetWidget()->HasCapture())
      GetWidget()->ReleaseCapture();
    if (!weak)
      return;
    if (dragged) {
      owner_->ReleaseEntryDrag();
      return;
    }
    if (!pressed || !HitTestPoint(event.location()))
      return;
    if (event.IsOnlyLeftMouseButton())
      owner_->Activate(index_);
    else if (event.IsOnlyMiddleMouseButton())
      owner_->Close(index_);
  }
  void MoveForDrop(const gfx::Rect& target) {
    const gfx::Point previous = bounds().origin() +
        gfx::ToRoundedVector2d(GetTransform().To2dTranslation());
    auto weak = weak_factory_.GetWeakPtr();
    slide_.Stop();
    if (!weak)
      return;
    SetTransform(gfx::Transform());
    if (!weak)
      return;
    SetBoundsRect(target);
    if (!weak)
      return;
    slide_offset_ = previous - target.origin();
    if (!slide_offset_.IsZero() && gfx::Animation::ShouldRenderRichAnimation()) {
      gfx::Transform transform;
      transform.Translate(slide_offset_.x(), slide_offset_.y());
      SetTransform(transform);
      if (weak)
        slide_.Start();
    }
  }
  void StopDropAnimation() {
    auto weak = weak_factory_.GetWeakPtr();
    slide_.Stop();
    if (weak)
      SetTransform(gfx::Transform());
  }
  void AnimationProgressed(const gfx::Animation* animation) override {
    const double remaining = 1.0 - gfx::Tween::CalculateValue(
        gfx::Tween::FAST_OUT_SLOW_IN, animation->GetCurrentValue());
    gfx::Transform transform;
    transform.Translate(slide_offset_.x() * remaining,
                        slide_offset_.y() * remaining);
    SetTransform(transform);
  }
  void AnimationEnded(const gfx::Animation*) override {
    SetTransform(gfx::Transform());
  }
  void SetIndex(size_t index) { index_ = index; }
  void SetDraggedBounds(const gfx::Rect& bounds) {
    auto weak = weak_factory_.GetWeakPtr();
    slide_.Stop();
    if (!weak)
      return;
    gfx::Transform transform;
    transform.Translate(bounds.x() - x(), bounds.y() - y());
    SetTransform(transform);
  }
  bool OnMouseDragged(const ui::MouseEvent& event) override {
    if (!pressed_ || !event.IsOnlyLeftMouseButton())
      return false;
    gfx::Point pointer = event.location();
    views::View::ConvertPointToTarget(this, owner_, &pointer);
    const gfx::Vector2d movement = pointer - press_in_leaf_;
    if (!drag_started_ && std::abs(movement.x()) <= 8 &&
        std::abs(movement.y()) <= 8)
      return false;
    drag_started_ = true;
    owner_->DragEntry(this, pointer, grab_offset_);
    return true;
  }
  void CancelPress() {
    pressed_ = false;
    drag_started_ = false;
    const bool captured = std::exchange(captured_, false);
    if (captured && GetWidget() && GetWidget()->HasCapture())
      GetWidget()->ReleaseCapture();
  }
  void OnMouseCaptureLost() override {
    const bool dragged = drag_started_;
    captured_ = false;
    CancelPress();
    if (dragged) {
      base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
          FROM_HERE,
          base::BindOnce(&VerticalPinnedTabEntriesView::CancelEntryDrag,
                         owner_->weak_factory_.GetWeakPtr()));
    }
  }
  void OnMouseEntered(const ui::MouseEvent&) override {
    hovered_ = true;
    SchedulePaint();
    HoverCardAnchorTarget* target = nullptr;
    if (IsValidHoverCardTarget()) {
      const int live = *aux::FindPinnedTabEntry(
          *owner_->model_, owner_->entries_[index_].saved);
      SetHoverCardDataFrom(
          tabs::TabData::FromTabInterface(owner_->model_->GetTabAtIndex(live)));
      target = this;
    }
    owner_->hover_card_controller_->UpdateHoverCard(
        target, TabSlotController::HoverCardUpdateType::kHover);
  }
  void OnMouseExited(const ui::MouseEvent&) override {
    hovered_ = false;
    SchedulePaint();
    owner_->hover_card_controller_->UpdateHoverCard(
        nullptr, TabSlotController::HoverCardUpdateType::kHover);
  }
  bool OnKeyPressed(const ui::KeyEvent& event) override {
    if (event.key_code() != ui::VKEY_SPACE &&
        event.key_code() != ui::VKEY_RETURN)
      return false;
    owner_->Activate(index_);
    return true;
  }
  void OnPaintBackground(gfx::Canvas* canvas) override {
    if (!GetWidget() || !GetColorProvider() ||
        index_ >= owner_->entries_.size())
      return;
    const bool dark = IsDark(*this);
    const bool active = owner_->entries_[index_].active;
    cc::PaintFlags flags;
    flags.setAntiAlias(true);
    canvas->DrawColor(SK_ColorTRANSPARENT, SkBlendMode::kSrc);
    flags.setColor(active ? (dark ? 0x14fafafa : 0xffffffff)
                          : (dark ? 0x14fafafa : 0x140a0a0a));
    // Original0460d780 uses two filled paths, not an invented inset border.
    canvas->DrawRoundRect(gfx::RectF(GetLocalBounds()), 10, flags);
    if (active) {
      flags.setColor((owner_->entries_[index_].accent.value_or(
                          dark ? 0x33fafafa : 0x260a0a0a) & 0x00ffffff) |
                     0x33000000);
      canvas->DrawRoundRect(gfx::RectF(GetLocalBounds()), 10, flags);
    } else if (hovered_) {
      flags.setColor(dark ? 0x33ffffff : 0x59ffffff);
      canvas->DrawRoundRect(gfx::RectF(GetLocalBounds()), 10, flags);
    }
  }

  void OnPaint(gfx::Canvas* canvas) override {
    views::View::OnPaint(canvas);
    if (!GetWidget() || index_ >= owner_->entries_.size())
      return;
    const auto& entry = owner_->entries_[index_];
    const bool dark = IsDark(*this);
    const gfx::RectF bounds(GetLocalBounds());
    const SkPath path = SkPath::RRect(gfx::RectFToSkRect(bounds), 10, 10);
    canvas->Save();
    gfx::RectF shadow_bounds(bounds);
    shadow_bounds.Outset(8);
    canvas->ClipRect(shadow_bounds);
    canvas->ClipPath(path, true, SkClipOp::kDifference);
    cc::PaintFlags shadow;
    shadow.setAntiAlias(true);
    shadow.setLooper(gfx::CreateShadowDrawLooper(
        {gfx::ShadowValue(gfx::Vector2d(0, 3), 5, 0x0d000000)}));
    canvas->DrawPath(path, shadow);
    canvas->Restore();
    const float width = entry.active ? 2.f : 0.5f;
    cc::PaintFlags border;
    border.setAntiAlias(true);
    border.setStyle(cc::PaintFlags::kStroke_Style);
    border.setStrokeWidth(width);
    border.setColor(entry.active
        ? ((entry.accent.value_or(dark ? 0x33fafafa : 0x260a0a0a) &
            0x00ffffff) | 0x66000000)
        : (dark ? 0x26fafafa : 0x260a0a0a));
    gfx::RectF stroke(bounds);
    stroke.Inset(width / 2);
    canvas->DrawRoundRect(stroke, 10 - width / 2, border);
    if (entry.shared_update) {
      // Same cyan pending-update cue as organization rows, without reserving
      // layout space or replacing the supplied favicon/tile treatment.
      cc::PaintFlags marker; marker.setAntiAlias(true); marker.setColor(0xff30b4dc);
      canvas->DrawCircle(gfx::PointF(bounds.right() - 8, bounds.y() + 8), 2.5f, marker);
    }
  }

 private:
  const raw_ptr<VerticalPinnedTabEntriesView> owner_;
  size_t index_;
  raw_ptr<views::ImageView> icon_ = nullptr;
  gfx::Vector2d slide_offset_;
  gfx::LinearAnimation slide_;
  gfx::Point press_in_leaf_;
  gfx::Point grab_offset_;
  bool captured_ = false;
  bool drag_started_ = false;
  bool pressed_ = false;
  bool hovered_ = false;
  base::WeakPtrFactory<EntryView> weak_factory_{this};
};
BEGIN_METADATA(VerticalPinnedTabEntriesView, EntryView)
END_METADATA

VerticalPinnedTabEntriesView::VerticalPinnedTabEntriesView(
    BrowserWindowInterface* browser,
    TabHoverCardController* hover_card_controller)
    : browser_(browser), hover_card_controller_(hover_card_controller) {
  CHECK(browser_);
  CHECK(hover_card_controller_);
  SetVisible(false);
  BindProfile();
}
VerticalPinnedTabEntriesView::~VerticalPinnedTabEntriesView() {
  drag_ghost_entry_ = nullptr;
  drag_ghost_.reset();
  CancelContextMenu();
  TabStripModelObserver::StopObservingAll(this);
}
void VerticalPinnedTabEntriesView::BindProfile() {
  CHECK(!paused_);
  model_ = browser_->GetTabStripModel();
  CHECK(model_);
  model_->AddObserver(this);
  pref_changes_.Init(browser_->GetProfile()->GetPrefs());
  pref_changes_.Add(
      aux::kPinnedTabEntriesPref,
      base::BindRepeating(&VerticalPinnedTabEntriesView::ScheduleRefresh,
                          weak_factory_.GetWeakPtr()));
  auto* organization = aux::organization::OrganizationProfileServiceFactory::GetForProfile(browser_->GetProfile());
  if (organization) {
    organization_ready_ = organization->ObserveReady(base::BindRepeating(
        &VerticalPinnedTabEntriesView::BindOrganization, weak_factory_.GetWeakPtr()));
  }
  BindOrganization();
}
void VerticalPinnedTabEntriesView::BindOrganization() {
  organization_changes_ = {}; organization_window_ = {};
  if (paused_) return;
  if (auto* window = aux::AuxOrganizationWindowController::FromBrowser(browser_))
    organization_window_ = window->ObserveWindowState(base::BindRepeating(
        &VerticalPinnedTabEntriesView::ScheduleRefresh, weak_factory_.GetWeakPtr()));
  auto* owner = aux::organization::OrganizationProfileServiceFactory::GetForProfileIfExists(browser_->GetProfile());
  if (owner && owner->model()) {
    organization_changes_ = owner->model()->Observe(base::BindRepeating(
        [](base::WeakPtr<VerticalPinnedTabEntriesView> view,
           const aux::organization::Delta&) { if (view) view->ScheduleRefresh(); },
        weak_factory_.GetWeakPtr()));
  }
  Refresh();
}
void VerticalPinnedTabEntriesView::PauseForProfileSwitch() {
  auto weak = weak_factory_.GetWeakPtr();
  hover_card_controller_->UpdateHoverCard(
      nullptr, TabSlotController::HoverCardUpdateType::kEvent);
  if (!weak)
    return;
  CancelEntryDrag();
  if (!weak)
    return;
  drag_ghost_entry_ = nullptr;
  drag_ghost_.reset();
  if (!weak)
    return;
  paused_ = true;
  drop_insertion_.reset();
  CancelContextMenu();
  if (!weak)
    return;
  for (views::View* child : children()) {
    static_cast<EntryView*>(child)->CancelPress();
    if (!weak)
      return;
    static_cast<EntryView*>(child)->StopDropAnimation();
    if (!weak)
      return;
  }
  icon_tasks_.TryCancelAll();
  pending_icons_.clear();
  weak_factory_.InvalidateWeakPtrs();
  refresh_pending_ = false;
  ui_changes_.clear();
  pref_changes_.Reset();
  organization_ready_ = {};
  organization_changes_ = {}; organization_window_ = {};
  TabStripModelObserver::StopObservingAll(this);
  model_ = nullptr;
}
void VerticalPinnedTabEntriesView::RebindAfterProfileSwitch() {
  CHECK(paused_);
  icon_cache_.clear();
  entries_.clear();
  RemoveAllChildViews();
  paused_ = false;
  BindProfile();
}
void VerticalPinnedTabEntriesView::ScheduleRefresh() {
  if (paused_ || refresh_pending_)
    return;
  refresh_pending_ = true;
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
      FROM_HERE, base::BindOnce(
                     [](base::WeakPtr<VerticalPinnedTabEntriesView> view) {
                       if (view) {
                         view->refresh_pending_ = false;
                         view->Refresh();
                       }
                     },
                     weak_factory_.GetWeakPtr()));
}
void VerticalPinnedTabEntriesView::RefreshAfterSavedEntryChange() {
  Refresh();
}

void VerticalPinnedTabEntriesView::Refresh() {
  if (paused_ || !model_)
    return;
  ui_changes_.clear();
  auto projected = aux::ReadOrganizationPinnedEntries(*browser_->GetProfile());
  auto saved = projected ? std::move(*projected)
                         : aux::ReadPinnedTabEntries(*browser_->GetProfile()->GetPrefs());
  std::vector<Entry> entries;
  for (auto& value : saved) {
    Entry entry;
    entry.saved = std::move(value);
    entry.title = entry.saved.title.empty()
                      ? base::UTF8ToUTF16(entry.saved.url.has_host()
                                              ? entry.saved.url.host()
                                              : entry.saved.url.spec())
                      : entry.saved.title;
    if (auto cached = icon_cache_.find(entry.saved.url.spec());
        cached != icon_cache_.end())
      entry.image = cached->second;
    if (auto* window = aux::AuxOrganizationWindowController::FromBrowser(browser_))
      entry.shared_update = !entry.saved.logical_id.empty() && window->HasPendingSharedUpdate(entry.saved.logical_id);
    entry.live_index = aux::FindPinnedTabEntry(*model_, entry.saved);
    if (entry.live_index) {
      auto* tab = model_->GetTabAtIndex(*entry.live_index);
      if (auto* helper = TabUIHelper::From(tab)) {
        const auto title = helper->GetTitle();
        if (!title.empty())
          entry.title = title;
        const auto icon = helper->GetFavicon();
        if (!icon.IsEmpty()) {
          entry.image = icon;
          icon_cache_.insert_or_assign(entry.saved.url.spec(), entry.image);
        }
        ui_changes_.push_back(helper->AddTabUIChangeCallback(
            base::BindRepeating(&VerticalPinnedTabEntriesView::ScheduleRefresh,
                                weak_factory_.GetWeakPtr())));
      }
      entry.active = *entry.live_index == model_->active_index();
    }
    // Stored application PNGs must not replace the canonical product glyph,
    // including a saved Agent tile whose live tab is currently closed.
    if ((entry.saved.url.SchemeIs("chrome-extension") &&
         entry.saved.url.host() == aux::kAgentExtensionId) ||
        (entry.saved.url.SchemeIs("chrome") &&
         entry.saved.url.host() == "newtab")) {
      entry.image = ui::ImageModel::FromVectorIcon(
          kAuxNewTabMarkIcon, kColorToolbarButtonIcon, 16);
    }
    if (entry.image.IsEmpty())
      RequestIcon(entry.saved.url);
    entry.accent = FaviconAccent(entry.image);
    entries.push_back(std::move(entry));
  }
  const bool reuse_rows = children().size() == entries_.size() &&
      entries.size() == entries_.size() &&
      std::ranges::equal(entries_, entries, {},
                         [](const Entry& entry) { return entry.saved.url; },
                         [](const Entry& entry) { return entry.saved.url; });
  auto weak = weak_factory_.GetWeakPtr();
  if (!reuse_rows) {
    // A changed ordered URL roster replaces the actual rows. The original
    // capture-loss cleanup is posted; detach our raw row alias before removal.
    if (dragging_view_) {
      EntryView* captured = std::exchange(dragging_view_, nullptr);
      rebuild_drag_cleanup_pending_ = true;
      base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
          FROM_HERE,
          base::BindOnce(&VerticalPinnedTabEntriesView::CancelEntryDrag,
                         weak));
      captured->CancelPress();
      if (!weak)
        return;
    }
    for (views::View* child : children()) {
      static_cast<EntryView*>(child)->CancelPress();
      if (!weak)
        return;
      static_cast<EntryView*>(child)->StopDropAnimation();
      if (!weak)
        return;
    }
    entries_ = std::move(entries);
    RemoveAllChildViews();
    if (!weak)
      return;
    for (size_t i = 0; i < entries_.size(); ++i) {
      AddChildView(std::make_unique<EntryView>(this, i));
      if (!weak)
        return;
    }
    if (drag_ghost_entry_ && !entries_.empty())
      drag_ghost_entry_->SetIndex(0);
  } else {
    entries_ = std::move(entries);
  }
  for (views::View* child : children()) {
    static_cast<EntryView*>(child)->Update();
    if (!weak)
      return;
  }
  if (drag_ghost_entry_ && !entries_.empty()) {
    drag_ghost_entry_->Update();
    if (!weak)
      return;
  }
  if (drop_insertion_)
    drop_insertion_ = std::min(*drop_insertion_, entries_.size());
  SetVisible(SlotCount() != 0);
  PreferredSizeChanged();
  InvalidateLayout();
}
bool VerticalPinnedTabEntriesView::RepresentsTab(
    const tabs::TabInterface& tab) const {
  if (paused_ || !model_ || !tab.IsPinned() || !tab.GetContents())
    return false;
  if (const auto logical_id = aux::GetRememberedPinnedTabEntryId(*tab.GetContents())) {
    return std::ranges::any_of(entries_, [&logical_id](const auto& entry) {
      return entry.saved.logical_id == *logical_id;
    });
  }
  if (aux::ReadOrganizationPinnedEntries(*browser_->GetProfile())) return false;
  const auto remembered = aux::GetRememberedPinnedTabEntryUrl(*tab.GetContents());
  const GURL& candidate = remembered && remembered->is_valid()
      ? *remembered : tab.GetContents()->GetVisibleURL();
  if (!candidate.is_valid()) return false;
  for (const auto& entry : entries_)
    if (entry.saved.url.is_valid() && candidate == entry.saved.url) return true;
  return false;
}
void VerticalPinnedTabEntriesView::RequestIcon(const GURL& url) {
  if (paused_ || !url.is_valid() || pending_icons_.contains(url.spec()))
    return;
  Profile* const profile = browser_->GetProfile();
  auto* service = FaviconServiceFactory::GetForProfile(
      profile, ServiceAccessType::EXPLICIT_ACCESS);
  if (!service)
    return;
  pending_icons_.insert(url.spec());
  service->GetFaviconImageForPageURL(
      url,
      base::BindOnce(
          [](base::WeakPtr<VerticalPinnedTabEntriesView> owner,
             Profile* expected, std::string key,
             const favicon_base::FaviconImageResult& result) {
            if (!owner || owner->paused_ ||
                owner->browser_->GetProfile() != expected)
              return;
            owner->pending_icons_.erase(key);
            if (result.image.IsEmpty())
              return;
            owner->icon_cache_.insert_or_assign(
                key, ui::ImageModel::FromImage(result.image));
            owner->Refresh();
          },
          weak_factory_.GetWeakPtr(), profile, url.spec()),
      &icon_tasks_);
}
void VerticalPinnedTabEntriesView::SetEntryDragCallbacks(
    EntryDragUpdate update, EntryDragFinish finish,
    base::RepeatingClosure cleanup) {
  drag_update_ = std::move(update);
  drag_finish_ = std::move(finish);
  drag_cleanup_ = std::move(cleanup);
}
void VerticalPinnedTabEntriesView::PrepareEntryDrag(size_t index) {
  if (paused_ || !model_ || index >= entries_.size() || !GetWidget())
    return;
  // The supplied leaf allocates this hidden TYPE_DRAG clone on left press.
  if (drag_ghost_)
    return;
  auto weak = weak_factory_.GetWeakPtr();
  auto ghost = std::make_unique<views::Widget>();
  views::Widget::InitParams params(views::Widget::InitParams::CLIENT_OWNS_WIDGET,
                                  views::Widget::InitParams::TYPE_DRAG);
  params.opacity = views::Widget::InitParams::WindowOpacity::kTranslucent;
  params.accept_events = false;
  params.activatable = views::Widget::InitParams::Activatable::kNo;
  params.context = GetWidget()->GetNativeWindow();
  ghost->Init(std::move(params));
  if (!weak || !GetWidget())
    return;
  ghost->SetColorModeOverride(GetWidget()->GetColorMode());
  if (!weak)
    return;
  auto entry = std::make_unique<EntryView>(this, index);
  entry->SetCanProcessEventsWithinSubtree(false);
  entry->SetFocusBehavior(FocusBehavior::NEVER);
  EntryView* ghost_entry = ghost->SetContentsView(std::move(entry));
  if (!weak)
    return;
  drag_ghost_entry_ = ghost_entry;
  drag_ghost_ = std::move(ghost);
}
void VerticalPinnedTabEntriesView::DragEntry(
    EntryView* view, const gfx::Point& pointer, const gfx::Point& grab_offset) {
  if (paused_ || !model_ || !GetWidget() ||
      rebuild_drag_cleanup_pending_)
    return;
  const auto child_position = std::ranges::find(children(), view);
  if (child_position == children().end())
    return;
  size_t index = child_position - children().begin();
  if (index >= entries_.size())
    return;
  auto weak = weak_factory_.GetWeakPtr();
  if (!dragging_view_) {
    hover_card_controller_->UpdateHoverCard(
        nullptr, TabSlotController::HoverCardUpdateType::kEvent);
    if (!weak)
      return;
    dragging_view_ = view;
    for (views::View* child : children()) {
      child->SetTooltipText(std::u16string());
      if (!weak)
        return;
    }
    reorder_dirty_ = false;
  }
  if (dragging_view_ != view)
    return;
  const Entry& entry = entries_[index];
  EntryDragData data{entry.saved, entry.title, entry.image, std::nullopt,
                     entry.accent};
  if (auto live = aux::FindPinnedTabEntry(*model_, entry.saved))
    data.live_tab = model_->GetTabAtIndex(*live)->GetHandle();
  const gfx::Rect local_bounds(pointer - grab_offset.OffsetFromOrigin(),
                                view->size());
  gfx::Rect screen_bounds = local_bounds;
  gfx::Point screen_point = pointer;
  views::View::ConvertRectToScreen(this, &screen_bounds);
  views::View::ConvertPointToScreen(this, &screen_point);
  const auto update = drag_update_;
  std::optional<gfx::Rect> routed;
  if (update)
    routed = update.Run(data, screen_bounds, screen_point);
  if (!weak || paused_ || dragging_view_ != view)
    return;
  const bool was_routed = drag_region_bounds_.has_value();
  drag_region_bounds_ = routed;
  drag_data_ = data;
  if (routed) {
    if (!routed->IsEmpty()) {
      view->layer()->SetOpacity(0);
      if (weak && drag_ghost_)
        drag_ghost_->Hide();
    } else {
      UpdateDragGhost(view, local_bounds);
    }
    return;
  }
  if (was_routed) {
    const auto cleanup = drag_cleanup_;
    if (cleanup)
      cleanup.Run();
    if (!weak || paused_ || dragging_view_ != view)
      return;
  }
  size_t nearest = 0;
  int64_t distance = std::numeric_limits<int64_t>::max();
  for (size_t i = 0; i < entries_.size(); ++i) {
    const auto center = SlotBounds(i, entries_.size()).CenterPoint();
    const auto dragged_center = local_bounds.CenterPoint();
    const int64_t next = std::abs(int64_t{dragged_center.x()} - center.x()) +
                         std::abs(int64_t{dragged_center.y()} - center.y());
    if (next < distance) {
      nearest = i;
      distance = next;
    }
  }
  if (nearest != index)
    ReorderEntry(view, nearest);
  if (weak && dragging_view_ == view)
    UpdateDragGhost(view, local_bounds);
}
void VerticalPinnedTabEntriesView::UpdateDragGhost(
    EntryView* view, const gfx::Rect& local_bounds) {
  if (!GetWidget())
    return;
  auto weak = weak_factory_.GetWeakPtr();
  if (!drag_ghost_) {
    view->SetDraggedBounds(local_bounds);
    return;
  }
  const auto child_position = std::ranges::find(children(), view);
  if (child_position == children().end())
    return;
  drag_ghost_->SetColorModeOverride(GetWidget()->GetColorMode());
  if (!weak)
    return;
  drag_ghost_entry_->SetIndex(child_position - children().begin());
  drag_ghost_entry_->Update();
  if (!weak)
    return;
  gfx::Rect screen_bounds = local_bounds;
  views::View::ConvertRectToScreen(this, &screen_bounds);
  drag_ghost_->SetBounds(screen_bounds);
  if (!weak)
    return;
  drag_ghost_->ShowInactive();
  if (weak)
    view->layer()->SetOpacity(0);
}
void VerticalPinnedTabEntriesView::ReorderEntry(EntryView* view,
                                               size_t destination) {
  const auto found = std::ranges::find(children(), view);
  if (found == children().end() || destination >= entries_.size())
    return;
  const size_t source = found - children().begin();
  if (source < destination)
    std::rotate(entries_.begin() + source, entries_.begin() + source + 1,
                entries_.begin() + destination + 1);
  else
    std::rotate(entries_.begin() + destination, entries_.begin() + source,
                entries_.begin() + source + 1);
  auto weak = weak_factory_.GetWeakPtr();
  ReorderChildView(view, destination);
  if (!weak)
    return;
  reorder_dirty_ = true;
  for (size_t i = 0; i < children().size(); ++i) {
    auto* entry = static_cast<EntryView*>(children()[i]);
    entry->SetIndex(i);
    if (entry == view)
      entry->SetBoundsRect(SlotBounds(i, entries_.size()));
    else
      entry->MoveForDrop(SlotBounds(i, entries_.size()));
    if (!weak)
      return;
  }
}
void VerticalPinnedTabEntriesView::ResetEntryDrag() {
  dragging_view_ = nullptr;
  rebuild_drag_cleanup_pending_ = false;
  drag_data_.reset();
  drag_region_bounds_.reset();
  reorder_dirty_ = false;
  auto weak = weak_factory_.GetWeakPtr();
  if (drag_ghost_)
    drag_ghost_->Hide();
  if (!weak)
    return;
  for (views::View* child : children()) {
    auto* entry = static_cast<EntryView*>(child);
    entry->CancelPress();
    if (!weak)
      return;
    entry->StopDropAnimation();
    if (!weak)
      return;
    entry->Update();
    if (!weak)
      return;
    entry->layer()->SetOpacity(1);
    if (!weak)
      return;
  }
  SchedulePaint();
}
void VerticalPinnedTabEntriesView::CancelEntryDrag() {
  const bool had_drag = IsEntryDragInProgress();
  const auto cleanup = drag_cleanup_;
  auto weak = weak_factory_.GetWeakPtr();
  ResetEntryDrag();
  if (weak && had_drag && cleanup)
    cleanup.Run();
}
void VerticalPinnedTabEntriesView::ReleaseEntryDrag() {
  if (!dragging_view_) return;
  const auto data = drag_data_;
  const bool routed = drag_region_bounds_.has_value();
  const bool dirty = reorder_dirty_;
  size_t destination = 0;
  if (data) {
    const auto found = std::ranges::find_if(entries_, [&data](const auto& entry) {
      return entry.saved.logical_id == data->saved.logical_id;
    });
    if (found != entries_.end()) destination = found - entries_.begin();
  }
  const auto finish = drag_finish_;
  const auto cleanup = drag_cleanup_;
  auto weak = weak_factory_.GetWeakPtr();
  ResetEntryDrag();
  if (!weak) return;
  if (routed && data && finish) {
    finish.Run(*data, base::BindOnce(
        [](base::WeakPtr<VerticalPinnedTabEntriesView> owner,
           base::RepeatingClosure cleanup, bool) {
          if (!owner || owner->paused_) return;
          if (cleanup) cleanup.Run();
          if (owner) owner->ScheduleRefresh();
        }, weak, cleanup));
    return;
  }
  if (dirty && data && !data->saved.logical_id.empty()) {
    aux::ReorderOrganizationPin(*browser_->GetProfile(), data->saved.logical_id,
        destination, base::BindOnce([](base::WeakPtr<VerticalPinnedTabEntriesView> view, bool) {
          if (view) view->ScheduleRefresh();
        }, weak));
  } else if (dirty) {
    ScheduleRefresh();
  }
}
std::optional<gfx::Rect> VerticalPinnedTabEntriesView::UpdateDropInsertion(
    const gfx::Point& screen_point) {
  if (paused_ || !model_ || !GetWidget())
    return std::nullopt;
  gfx::Point point = screen_point;
  views::View::ConvertPointFromScreen(this, &point);
  size_t nearest = 0;
  int64_t distance = std::numeric_limits<int64_t>::max();
  for (size_t i = 0; i <= entries_.size(); ++i) {
    const gfx::Point center = SlotBounds(i, entries_.size() + 1).CenterPoint();
    const int64_t next = std::abs(int64_t{point.x()} - center.x()) +
                         std::abs(int64_t{point.y()} - center.y());
    if (next < distance) {
      distance = next;
      nearest = i;
    }
  }
  auto weak = weak_factory_.GetWeakPtr();
  SetDropInsertion(nearest);
  if (!weak || !drop_insertion_)
    return std::nullopt;
  gfx::Rect bounds = SlotBounds(*drop_insertion_, SlotCount());
  views::View::ConvertRectToScreen(this, &bounds);
  return bounds;
}
void VerticalPinnedTabEntriesView::SetDropInsertion(
    std::optional<size_t> index) {
  if (paused_)
    return;
  if (index)
    index = std::min(*index, entries_.size());
  if (drop_insertion_ == index)
    return;
  drop_insertion_ = index;
  auto weak = weak_factory_.GetWeakPtr();
  SetVisible(SlotCount() != 0);
  if (!weak)
    return;
  for (size_t i = 0; i < children().size(); ++i) {
    const size_t slot = i + (index && i >= *index ? 1 : 0);
    static_cast<EntryView*>(children()[i])->MoveForDrop(
        SlotBounds(slot, SlotCount()));
    if (!weak)
      return;
  }
  SchedulePaint();
  PreferredSizeChanged();
}
void VerticalPinnedTabEntriesView::CommitDroppedEntryAsync(
    const GURL& url, const std::u16string& title, std::string existing_id,
    base::OnceCallback<void(bool, std::string)> done) {
  if (paused_ || !model_ || !url.is_valid()) {
    std::move(done).Run(false, {}); return;
  }
  aux::CommitOrganizationPin(*browser_->GetProfile(), url, title,
      drop_insertion_.value_or(entries_.size()), std::move(existing_id),
      base::BindOnce([](base::WeakPtr<VerticalPinnedTabEntriesView> owner,
                       base::OnceCallback<void(bool, std::string)> done,
                       bool success, std::string id) {
        if (!owner || owner->paused_) { std::move(done).Run(false, {}); return; }
        owner->SetDropInsertion(std::nullopt);
        if (!owner || owner->paused_) { std::move(done).Run(false, {}); return; }
        owner->ScheduleRefresh();
        std::move(done).Run(success, std::move(id));
      }, weak_factory_.GetWeakPtr(), std::move(done)));
}
void VerticalPinnedTabEntriesView::UnpinEntryAsync(
    const aux::PinnedTabEntry& entry, base::OnceCallback<void(bool)> done) {
  if (paused_ || entry.logical_id.empty()) { std::move(done).Run(false); return; }
  auto* window = aux::AuxOrganizationWindowController::FromBrowser(browser_.get());
  if (!window) { std::move(done).Run(false); return; }
  aux::UnpinOrganizationEntry(*browser_->GetProfile(), entry.logical_id, window->ActiveSpaceId(), std::move(done));
}
void VerticalPinnedTabEntriesView::OnPaint(gfx::Canvas* canvas) {
  views::View::OnPaint(canvas);
  if (!drop_insertion_ || !GetWidget())
    return;
  gfx::RectF bounds(SlotBounds(*drop_insertion_, SlotCount()));
  bounds.Inset(0.5f);
  cc::PaintFlags flags;
  flags.setAntiAlias(true);
  flags.setStyle(cc::PaintFlags::kStroke_Style);
  flags.setStrokeWidth(1);
  flags.setColor(IsDark(*this) ? 0x33fafafa : 0x260a0a0a);
  canvas->DrawRoundRect(bounds, 10, flags);
}
void VerticalPinnedTabEntriesView::Activate(size_t index) {
  if (paused_ || !model_ || index >= entries_.size())
    return;
  aux::OpenPinnedTabEntry(*browser_, entries_[index].saved);
}
void VerticalPinnedTabEntriesView::Close(size_t index) {
  if (paused_ || !model_ || index >= entries_.size())
    return;
  if (auto live = aux::FindPinnedTabEntry(*model_, entries_[index].saved))
    model_->CloseWebContentsAt(*live, CLOSE_USER_GESTURE);
}
// Extend the real native menu instead of substituting a reduced pin menu.
// The added commands are dispatched by model index before the native delegate;
// they never enter TabStripModel's command enum or extension ID ranges.
class VerticalPinnedTabEntriesView::EntryMenuModel final : public TabMenuModel {
 public:
  EntryMenuModel(VerticalPinnedTabEntriesView*, ui::SimpleMenuModel::Delegate*,
                 int native_index, std::string logical_id);
  ~EntryMenuModel() override;
  bool IsItemCheckedAt(size_t index) const override;
  bool IsAlertedAt(size_t index) const override;
  bool GetAcceleratorAt(size_t index, ui::Accelerator* accelerator) const override;
  bool IsEnabledAt(size_t index) const override;
  bool IsVisibleAt(size_t index) const override;
  void ActivatedAt(size_t index) override;
  void ActivatedAt(size_t index, int event_flags) override;
 private:
  bool IsSharedAction(size_t index) const;
  base::WeakPtr<VerticalPinnedTabEntriesView> owner_;
  std::string logical_id_;
  size_t shared_index_ = std::numeric_limits<size_t>::max();
};
VerticalPinnedTabEntriesView::EntryMenuModel::EntryMenuModel(
    VerticalPinnedTabEntriesView* owner, ui::SimpleMenuModel::Delegate* delegate,
    int native_index, std::string logical_id)
    : TabMenuModel(delegate, TabMenuModelDelegate::From(owner->browser_), owner->model_, native_index),
      owner_(owner->weak_factory_.GetWeakPtr()), logical_id_(std::move(logical_id)) {
  if (!owner->SharedUpdateAvailable(logical_id_)) return;
  AddSeparator(ui::NORMAL_SEPARATOR);
  shared_index_ = GetItemCount();
  AddItem(0x41555801, u"Use shared URL from another window");
  AddItem(0x41555802, u"Keep independent copy");
}
VerticalPinnedTabEntriesView::EntryMenuModel::~EntryMenuModel() = default;
bool VerticalPinnedTabEntriesView::EntryMenuModel::IsSharedAction(size_t index) const {
  return shared_index_ != std::numeric_limits<size_t>::max() &&
         (index == shared_index_ || index == shared_index_ + 1);
}
bool VerticalPinnedTabEntriesView::EntryMenuModel::IsItemCheckedAt(size_t index) const {
  return IsSharedAction(index) ? false : TabMenuModel::IsItemCheckedAt(index);
}
bool VerticalPinnedTabEntriesView::EntryMenuModel::IsAlertedAt(size_t index) const {
  return IsSharedAction(index) ? false : TabMenuModel::IsAlertedAt(index);
}
bool VerticalPinnedTabEntriesView::EntryMenuModel::GetAcceleratorAt(
    size_t index, ui::Accelerator* accelerator) const {
  return IsSharedAction(index) ? false : TabMenuModel::GetAcceleratorAt(index, accelerator);
}
bool VerticalPinnedTabEntriesView::EntryMenuModel::IsEnabledAt(size_t index) const {
  return IsSharedAction(index) ? owner_ && owner_->SharedUpdateAvailable(logical_id_)
                               : TabMenuModel::IsEnabledAt(index);
}
bool VerticalPinnedTabEntriesView::EntryMenuModel::IsVisibleAt(size_t index) const {
  return IsSharedAction(index) ? static_cast<bool>(owner_) : TabMenuModel::IsVisibleAt(index);
}
void VerticalPinnedTabEntriesView::EntryMenuModel::ActivatedAt(size_t index) { ActivatedAt(index, 0); }
void VerticalPinnedTabEntriesView::EntryMenuModel::ActivatedAt(size_t index, int event_flags) {
  if (!IsSharedAction(index)) { TabMenuModel::ActivatedAt(index, event_flags); return; }
  if (owner_ && owner_->SharedUpdateAvailable(logical_id_))
    owner_->ResolveSharedUpdate(logical_id_, index == shared_index_ + 1);
}
bool VerticalPinnedTabEntriesView::SharedUpdateAvailable(const std::string& logical_id) const {
  if (paused_ || !model_ || logical_id.empty() || browser_->GetTabStripModel() != model_) return false;
  const auto* service = aux::organization::OrganizationProfileServiceFactory::GetForProfileIfExists(browser_->GetProfile());
  auto* window = aux::AuxOrganizationWindowController::FromBrowser(browser_);
  return service && service->model() && !service->model()->blocked() && !service->model()->pending() &&
         window && window->HasPendingSharedUpdate(logical_id);
}
void VerticalPinnedTabEntriesView::ResolveSharedUpdate(const std::string& logical_id, bool independent) {
  if (!SharedUpdateAvailable(logical_id)) return;
  auto* window = aux::AuxOrganizationWindowController::FromBrowser(browser_);
  auto done = base::BindOnce([](base::WeakPtr<VerticalPinnedTabEntriesView> owner, bool) {
    if (owner) owner->ScheduleRefresh();
  }, weak_factory_.GetWeakPtr());
  if (independent) window->KeepIndependentCopy(logical_id, std::move(done));
  else window->ApplyPendingSharedUpdate(logical_id, std::move(done));
}
void VerticalPinnedTabEntriesView::ShowEntryContextMenu(size_t index,
                                                   const gfx::Point& point) {
  if (paused_ || !model_ || !GetWidget() || index >= entries_.size())
    return;
  CancelContextMenu();
  const GURL url = entries_[index].saved.url;
  if (auto live = aux::FindPinnedTabEntry(*model_, entries_[index].saved)) {
    auto* browser_view = BrowserView::GetBrowserViewForBrowser(browser_);
    auto* region =
        browser_view ? browser_view->vertical_tab_strip_region_view() : nullptr;
    if (region && region->GetTabStripCollectionController()) {
      auto* tab = model_->GetTabAtIndex(*live);
      live_menu_ = std::make_unique<TabContextMenuController>(
          tab->GetHandle(), region->GetTabStripCollectionController());
      auto menu = std::make_unique<EntryMenuModel>(this, live_menu_.get(), *live,
                                                   entries_[index].saved.logical_id);
      auto* tab_menu = menu.get();
      menu_hover_lock_ = region->GetExpandOnHoverLock(
          ExpandOnHoverLockType::kKeepExpanded);
      live_menu_->LoadModel(
          std::move(menu), tab_menu,
          base::BindRepeating(
              [](base::WeakPtr<VerticalPinnedTabEntriesView> owner) {
                if (owner)
                  owner->menu_hover_lock_.reset();
              },
              weak_factory_.GetWeakPtr()));
      live_menu_->RunMenuAt(point, ui::mojom::MenuSourceType::kMouse,
                            GetWidget());
    }
    return;
  }
  menu_url_ = url;
  menu_entry_ = entries_[index].saved;
  menu_model_ = std::make_unique<ui::SimpleMenuModel>(this);
  menu_model_->AddItem(1, l10n_util::GetStringUTF16(IDS_TAB_CXMENU_UNPIN_TAB));
  menu_runner_ = std::make_unique<views::MenuRunner>(
      menu_model_.get(),
      views::MenuRunner::HAS_MNEMONICS | views::MenuRunner::CONTEXT_MENU);
  auto* browser_view = BrowserView::GetBrowserViewForBrowser(browser_);
  if (auto* region = browser_view
                         ? browser_view->vertical_tab_strip_region_view()
                         : nullptr) {
    // Retained hover release honors the expanded lock while the pointer moves
    // from the sidebar into this native menu, just like a live pinned tab.
    menu_hover_lock_ = region->GetExpandOnHoverLock(
        ExpandOnHoverLockType::kKeepExpanded);
  }
  menu_runner_->RunMenuAt(GetWidget(), nullptr, gfx::Rect(point, gfx::Size()),
                          views::MenuAnchorPosition::kTopLeft,
                          ui::mojom::MenuSourceType::kMouse);
}
void VerticalPinnedTabEntriesView::CancelContextMenu() {
  menu_runner_.reset();
  menu_model_.reset();
  menu_url_ = GURL();
  live_menu_.reset();
  menu_hover_lock_.reset();
}
bool VerticalPinnedTabEntriesView::IsCommandIdEnabled(int command_id) const {
  return command_id == 1 && !paused_ && menu_url_.is_valid();
}
void VerticalPinnedTabEntriesView::ExecuteCommand(int command_id, int) {
  if (IsCommandIdEnabled(command_id)) {
    menu_url_ = GURL();
    UnpinEntryAsync(menu_entry_, base::BindOnce(
        [](base::WeakPtr<VerticalPinnedTabEntriesView> view, bool) {
          if (view) view->ScheduleRefresh();
        }, weak_factory_.GetWeakPtr()));
  }
}
void VerticalPinnedTabEntriesView::MenuClosed(ui::SimpleMenuModel* source) {
  if (source == menu_model_.get()) {
    menu_runner_.reset();
    menu_model_.reset();
    menu_url_ = GURL();
    menu_hover_lock_.reset();
  }
}
void VerticalPinnedTabEntriesView::SetCompactPresentation(bool compact) {
  if (compact_ == compact)
    return;
  compact_ = compact;
  PreferredSizeChanged();
  InvalidateLayout();
}
void VerticalPinnedTabEntriesView::SetLayoutWidthOverride(
    std::optional<int> width) {
  if (width)
    *width = std::max(*width, kPreferredWidth);
  if (width_override_ == width)
    return;
  width_override_ = width;
  PreferredSizeChanged();
  InvalidateLayout();
}
size_t VerticalPinnedTabEntriesView::SlotCount() const {
  return entries_.size() + (drop_insertion_ ? 1 : 0);
}
int VerticalPinnedTabEntriesView::Columns(const views::SizeBound& width,
                                          size_t slot_count) const {
  const int count = std::max(static_cast<int>(slot_count), 1);
  if (compact_ && !width_override_)
    return 1;
  int cap = std::min(count, 4);
  if (width_override_ || width.is_bounded()) {
    const int available =
        width_override_.value_or(width.is_bounded() ? width.value() : 0);
    cap = std::min(
        {count,
         std::max((std::max(available, 0) + kGap) / (kEntryHeight + kGap), 1),
         available < 151 ? 2 : 4});
  }
  if (count <= cap)
    return count;
  if (cap < 3)
    return cap;
  if (count % cap == 1 ||
      ((count + cap - 2) / (cap - 1) == (count + cap - 1) / cap &&
       count % (cap - 1) == 0))
    --cap;
  return cap;
}
gfx::Size VerticalPinnedTabEntriesView::CalculatePreferredSize(
    const views::SizeBounds& available) const {
  if (SlotCount() == 0)
    return gfx::Size();
  const int columns = Columns(available.width(), SlotCount());
  const int rows = (static_cast<int>(SlotCount()) + columns - 1) / columns;
  return gfx::Size(
      std::max(available.width().is_bounded() ? available.width().value()
                                              : kPreferredWidth,
               0),
      rows * kEntryHeight + (rows - 1) * kGap);
}
gfx::Rect VerticalPinnedTabEntriesView::SlotBounds(size_t index,
                                                    size_t slot_count) const {
  const int available = width_override_.value_or(width());
  const int columns = Columns(views::SizeBound(available), slot_count);
  const int tile_width =
      std::max((available - (columns - 1) * kGap) / columns, 0);
  return gfx::Rect(static_cast<int>(index % columns) * (tile_width + kGap),
                   static_cast<int>(index / columns) * (kEntryHeight + kGap),
                   tile_width, kEntryHeight);
}
void VerticalPinnedTabEntriesView::Layout(PassKey) {
  for (size_t i = 0; i < children().size(); ++i) {
    const size_t slot = i + (drop_insertion_ && i >= *drop_insertion_ ? 1 : 0);
    children()[i]->SetBoundsRect(SlotBounds(slot, SlotCount()));
  }
}
void VerticalPinnedTabEntriesView::OnTabStripModelChanged(
    TabStripModel*,
    const TabStripModelChange&,
    const TabStripSelectionChange&) {
  ScheduleRefresh();
}
void VerticalPinnedTabEntriesView::OnTabChangedAt(tabs::TabInterface*,
                                                  TabChangeType) {
  ScheduleRefresh();
}
void VerticalPinnedTabEntriesView::OnTabPinnedStateChanged(tabs::TabInterface*,
                                                           int) {
  ScheduleRefresh();
}
void VerticalPinnedTabEntriesView::OnTabStripModelDestroyed(TabStripModel*) {
  auto weak = weak_factory_.GetWeakPtr();
  CancelEntryDrag();
  if (!weak)
    return;
  drag_ghost_entry_ = nullptr;
  drag_ghost_.reset();
  if (!weak)
    return;
  model_ = nullptr;
  ui_changes_.clear();
  pref_changes_.Reset();
  weak_factory_.InvalidateWeakPtrs();
  refresh_pending_ = false;
}
BEGIN_METADATA(VerticalPinnedTabEntriesView)
END_METADATA
