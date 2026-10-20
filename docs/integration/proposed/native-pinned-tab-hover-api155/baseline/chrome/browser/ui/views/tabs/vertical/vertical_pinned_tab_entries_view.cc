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
#include "content/public/browser/web_contents.h"
#include "ui/base/l10n/l10n_util.h"
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
    SetTooltipText(owner_->IsEntryDragInProgress() ? std::u16string()
                                                  : entry.title);
    GetViewAccessibility().SetName(entry.title);
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
                                  owner_->entries_[index_].saved.url).has_value();
  }
  views::BubbleAnchor GetAnchor() override { return this; }
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
          *owner_->model_, owner_->entries_[index_].saved.url);
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
  weak_factory_.InvalidateWeakPtrs();
  refresh_pending_ = false;
  ui_changes_.clear();
  pref_changes_.Reset();
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
void VerticalPinnedTabEntriesView::Refresh() {
  if (paused_ || !model_ || dragging_view_)
    return;
  ui_changes_.clear();
  auto saved = aux::ReadPinnedTabEntries(*browser_->GetProfile()->GetPrefs());
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
    entry.live_index = aux::FindPinnedTabEntry(*model_, entry.saved.url);
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
    entry.accent = FaviconAccent(entry.image);
    entries.push_back(std::move(entry));
  }
  if (children().size() != entries.size()) {
    RemoveAllChildViews();
    entries_ = std::move(entries);
    for (size_t i = 0; i < entries_.size(); ++i)
      AddChildView(std::make_unique<EntryView>(this, i));
  } else
    entries_ = std::move(entries);
  for (views::View* child : children())
    static_cast<EntryView*>(child)->Update();
  if (drop_insertion_)
    drop_insertion_ = std::min(*drop_insertion_, entries_.size());
  SetVisible(SlotCount() != 0);
  PreferredSizeChanged();
  InvalidateLayout();
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
  if (paused_ || !model_ || !GetWidget())
    return;
  const auto child = std::ranges::find(children(), view);
  if (child == children().end())
    return;
  size_t index = child - children().begin();
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
  if (auto live = aux::FindPinnedTabEntry(*model_, entry.saved.url))
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
  const auto child = std::ranges::find(children(), view);
  if (child == children().end())
    return;
  drag_ghost_->SetColorModeOverride(GetWidget()->GetColorMode());
  if (!weak)
    return;
  drag_ghost_entry_->SetIndex(child - children().begin());
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
  const bool had_drag = dragging_view_ != nullptr;
  const auto cleanup = drag_cleanup_;
  auto weak = weak_factory_.GetWeakPtr();
  ResetEntryDrag();
  if (weak && had_drag && cleanup)
    cleanup.Run();
}
void VerticalPinnedTabEntriesView::ReleaseEntryDrag() {
  if (!dragging_view_)
    return;
  const auto data = drag_data_;
  const bool routed = drag_region_bounds_.has_value();
  const bool dirty = reorder_dirty_;
  std::vector<aux::PinnedTabEntry> saved;
  if (!routed && dirty) {
    for (const auto& entry : entries_)
      saved.push_back(entry.saved);
  }
  Profile* const profile = browser_->GetProfile();
  const auto finish = drag_finish_;
  const auto cleanup = drag_cleanup_;
  auto weak = weak_factory_.GetWeakPtr();
  ResetEntryDrag();
  if (!weak)
    return;
  if (routed && data) {
    const bool completed = finish && finish.Run(*data);
    if (!weak)
      return;
    if (cleanup)
      cleanup.Run();
    if (weak && !completed)
      Refresh();
    return;
  }
  if (dirty) {
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE, base::BindOnce(
            [](base::WeakPtr<VerticalPinnedTabEntriesView> owner,
               Profile* expected, std::vector<aux::PinnedTabEntry> entries) {
              if (owner && !owner->paused_ &&
                  owner->browser_->GetProfile() == expected) {
                aux::WritePinnedTabEntries(*expected->GetPrefs(), entries);
              }
            }, weak, profile, std::move(saved)));
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
bool VerticalPinnedTabEntriesView::CommitDroppedEntry(
    const GURL& dropped_url,
    const std::u16string& dropped_title) {
  if (paused_ || !model_ || !dropped_url.is_valid())
    return false;
  // The caller may supply a reference to an existing entry rebuilt below.
  const GURL url = dropped_url;
  const std::u16string title = dropped_title;
  Profile* const profile = browser_->GetProfile();
  PrefService& prefs = *profile->GetPrefs();
  auto entries = aux::ReadPinnedTabEntries(prefs);
  size_t insertion = std::min(drop_insertion_.value_or(entries.size()),
                              entries.size());
  const auto existing = std::ranges::find_if(
      entries, [&url](const auto& entry) { return entry.url == url; });
  aux::PinnedTabEntry entry{url, title};
  if (existing != entries.end()) {
    const size_t previous = existing - entries.begin();
    entry = std::move(*existing);
    entries.erase(existing);
    if (previous < insertion)
      --insertion;
    if (!title.empty())
      entry.title = title;
  }
  insertion = std::min(insertion, entries.size());
  entries.insert(entries.begin() + insertion, std::move(entry));
  auto weak = weak_factory_.GetWeakPtr();
  aux::WritePinnedTabEntries(prefs, entries);
  if (!weak || paused_ || browser_->GetProfile() != profile)
    return false;
  SetDropInsertion(std::nullopt);
  if (!weak || paused_ || browser_->GetProfile() != profile)
    return false;
  Refresh();
  if (!weak || paused_ || browser_->GetProfile() != profile)
    return false;
  const auto stored = aux::ReadPinnedTabEntries(prefs);
  return std::ranges::any_of(
      stored, [&url](const auto& entry) { return entry.url == url; });
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
  const GURL url = entries_[index].saved.url;
  aux::OpenPinnedTabEntry(*browser_, url);
}
void VerticalPinnedTabEntriesView::Close(size_t index) {
  if (paused_ || !model_ || index >= entries_.size())
    return;
  if (auto live = aux::FindPinnedTabEntry(*model_, entries_[index].saved.url))
    model_->CloseWebContentsAt(*live, CLOSE_USER_GESTURE);
}
void VerticalPinnedTabEntriesView::ShowEntryContextMenu(size_t index,
                                                   const gfx::Point& point) {
  if (paused_ || !model_ || !GetWidget() || index >= entries_.size())
    return;
  CancelContextMenu();
  const GURL url = entries_[index].saved.url;
  if (auto live = aux::FindPinnedTabEntry(*model_, url)) {
    auto* browser_view = BrowserView::GetBrowserViewForBrowser(browser_);
    auto* region =
        browser_view ? browser_view->vertical_tab_strip_region_view() : nullptr;
    if (region && region->GetTabStripCollectionController()) {
      auto* tab = model_->GetTabAtIndex(*live);
      live_menu_ = std::make_unique<TabContextMenuController>(
          tab->GetHandle(), region->GetTabStripCollectionController());
      auto menu = std::make_unique<TabMenuModel>(
          live_menu_.get(), TabMenuModelDelegate::From(browser_), model_,
          *live);
      auto* tab_menu = menu.get();
      menu_hover_lock_ = region->GetExpandOnHoverLock(
          ExpandOnHoverLockType::kKeepCurrentState);
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
  menu_model_ = std::make_unique<ui::SimpleMenuModel>(this);
  menu_model_->AddItem(1, l10n_util::GetStringUTF16(IDS_TAB_CXMENU_UNPIN_TAB));
  menu_runner_ = std::make_unique<views::MenuRunner>(
      menu_model_.get(),
      views::MenuRunner::HAS_MNEMONICS | views::MenuRunner::CONTEXT_MENU);
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
    aux::RemoveFirstPinnedTabEntry(*browser_->GetProfile()->GetPrefs(),
                                   menu_url_);
    menu_url_ = GURL();
  }
}
void VerticalPinnedTabEntriesView::MenuClosed(ui::SimpleMenuModel* source) {
  if (source == menu_model_.get()) {
    menu_runner_.reset();
    menu_model_.reset();
    menu_url_ = GURL();
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
