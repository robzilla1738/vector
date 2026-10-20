// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/views/frame/aux_profile_pager_drag.h"

#include <algorithm>
#include <cmath>
#include <limits>
#include <utility>

#include "base/check.h"
#include "base/numerics/clamped_math.h"
#include "base/numerics/safe_conversions.h"
#include "base/time/time.h"
#include "base/values.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/ui/views/frame/aux_profile_switch_owner.h"
#include "components/prefs/pref_service.h"
#include "ui/compositor/layer.h"
#include "ui/gfx/geometry/transform.h"
#include "ui/gfx/geometry/vector2d_f.h"

namespace aux {
namespace {
gfx::Vector2d Translation(const views::View& view) {
  const auto offset = view.GetTransform().To2dTranslation();
  return gfx::Vector2d(base::ClampFloor<int>(offset.x() + 0.5f),
                       base::ClampFloor<int>(offset.y() + 0.5f));
}

void Translate(views::View& view, const gfx::Vector2d& offset) {
  gfx::Transform transform;
  transform.Translate(offset.x(), offset.y());
  view.SetTransform(transform);
}
}  // namespace

ProfilePagerDrag::ProfilePagerDrag(views::View& pager,
                                   std::vector<base::FilePath>& paths,
                                   std::vector<raw_ptr<Button>>& buttons,
                                   base::RepeatingClosure refresh)
    : pager_(pager),
      paths_(paths),
      buttons_(buttons),
      refresh_(std::move(refresh)) {
  CHECK(refresh_);
  // Original e68/ef0 constructors:100000us SlideAnimation, tween1 (EASE_OUT).
  sibling_animation_.SetSlideDuration(base::Milliseconds(100));
  settlement_animation_.SetSlideDuration(base::Milliseconds(100));
}

ProfilePagerDrag::~ProfilePagerDrag() {
  Retire();
}

bool ProfilePagerDrag::DeferUpdate() {
  if (!current_ && !settling_) {
    return false;
  }
  update_pending_ = true;
  return true;
}

gfx::Rect ProfilePagerDrag::Slot(size_t index) const {
  const int count = base::checked_cast<int>(buttons_->size());
  return gfx::Rect(
      (pager_->width() - count * 24) / 2 + base::checked_cast<int>(index) * 24,
      0, 24, 24);
}

void ProfilePagerDrag::LayoutSlots() {
  for (size_t index = 0; index < buttons_->size(); ++index) {
    (*buttons_)[index]->SetBoundsRect(Slot(index));
  }
}

void ProfilePagerDrag::ClearSiblingAnimation() {
  sibling_animation_.Reset();
  for (const auto& [button, offset] : sibling_offsets_) {
    button->SetTransform(gfx::Transform());
  }
  sibling_offsets_.clear();
}

void ProfilePagerDrag::Start(Button* button) {
  if (!button || settling_ || paths_->size() != buttons_->size()) {
    return;
  }
  const auto index = pager_->GetIndexOf(button);
  if (!index || *index >= buttons_->size()) {
    return;
  }
  ClearSiblingAnimation();
  LayoutSlots();
  origin_ = current_ = index;
  original_order_ = *paths_;
  order_changed_ = false;
}

void ProfilePagerDrag::Move(size_t from, size_t to) {
  if (from == to || from >= buttons_->size() || to >= buttons_->size() ||
      paths_->size() != buttons_->size()) {
    return;
  }
  Button* moved = (*buttons_)[from];
  std::map<Button*, gfx::Point> prior_positions;
  for (Button* button : *buttons_) {
    prior_positions.emplace(button,
                            button->bounds().origin() + Translation(*button));
  }
  auto path = std::move((*paths_)[from]);
  paths_->erase(paths_->begin() + from);
  paths_->insert(paths_->begin() + to, std::move(path));
  buttons_->erase(buttons_->begin() + from);
  buttons_->insert(buttons_->begin() + to, moved);
  pager_->ReorderChildView(moved, to);
  current_ = to;
  order_changed_ = *paths_ != original_order_;
  ClearSiblingAnimation();
  LayoutSlots();
  for (Button* button : *buttons_) {
    const auto offset = prior_positions.at(button) - button->bounds().origin();
    if (button != moved && !offset.IsZero()) {
      sibling_offsets_.emplace(button, offset);
    }
    Translate(*button, offset);
  }
  if (!sibling_offsets_.empty()) {
    sibling_animation_.Show();
  }
  pager_->SchedulePaint();
}

void ProfilePagerDrag::Update(Button* button,
                              const gfx::Point& point,
                              const gfx::Point& pressed_local) {
  if (!button || !current_ || buttons_->empty()) {
    return;
  }
  const auto index = pager_->GetIndexOf(button);
  if (!index || *index >= buttons_->size()) {
    return;
  }
  current_ = index;
  const int left = base::ClampSub(point.x(), pressed_local.x());
  const int center = base::ClampAdd(left, 12);
  size_t nearest = 0;
  int distance = std::numeric_limits<int>::max();
  for (size_t candidate = 0; candidate < buttons_->size(); ++candidate) {
    const int next =
        std::abs(base::ClampSub(center, Slot(candidate).CenterPoint().x()));
    if (next < distance) {
      distance = next;
      nearest = candidate;
    }
  }
  const int y = std::clamp(base::ClampSub(point.y(), pressed_local.y()), -6, 6);
  if (nearest != *index) {
    Move(*index, nearest);
  }
  const auto actual_index = pager_->GetIndexOf(button);
  CHECK(actual_index);
  button->SetDragHighlight(true);
  Translate(*button,
            gfx::Vector2d(base::ClampSub(left, Slot(*actual_index).x()), y));
  button->layer()->SetOpacity(0.94f);
}

void ProfilePagerDrag::End(Button* button, Button::DragEnd reason) {
  if (!button || !current_ || !origin_) {
    return;
  }
  if (reason == Button::DragEnd::kCaptureLost && *current_ != *origin_) {
    Move(*current_, *origin_);
  }
  button->SetDragHighlight(false);
  button->layer()->SetOpacity(1);
  current_.reset();
  origin_.reset();
  settling_ = button;
  settlement_offset_ = Translation(*button);
  pager_->SetCanProcessEventsWithinSubtree(false);
  settlement_animation_.Reset();
  settlement_animation_.Show();
  if (reason == Button::DragEnd::kReleased && order_changed_) {
    PersistOrder();
  }
}

void ProfilePagerDrag::PersistOrder() {
  auto* manager =
      g_browser_process ? g_browser_process->profile_manager() : nullptr;
  auto* local_state =
      g_browser_process ? g_browser_process->local_state() : nullptr;
  if (!manager || !local_state) {
    return;
  }
  auto& storage = manager->GetProfileAttributesStorage();
  auto all = HorizontalProfileOrder(storage, *local_state);
  size_t next = 0;
  for (auto& path : all) {
    auto* entry = storage.GetProfileAttributesWithPath(path);
    if (entry && !entry->IsOmitted() && next < paths_->size()) {
      path = (*paths_)[next++];
    }
  }
  base::ListValue order;
  for (const auto& path : all) {
    order.Append(path.BaseName().AsUTF8Unsafe());
  }
  local_state->SetList(kHorizontalProfileOrder, std::move(order));
}

void ProfilePagerDrag::AnimationProgressed(const gfx::Animation* animation) {
  if (animation == &sibling_animation_) {
    const double value = sibling_animation_.GetCurrentValue();
    for (const auto& [button, offset] : sibling_offsets_) {
      Translate(
          *button,
          gfx::Vector2d(gfx::Tween::IntValueBetween(value, offset.x(), 0),
                        gfx::Tween::IntValueBetween(value, offset.y(), 0)));
    }
  } else if (animation == &settlement_animation_ && settling_) {
    const double value = settlement_animation_.GetCurrentValue();
    Translate(
        *settling_,
        gfx::Vector2d(
            gfx::Tween::IntValueBetween(value, settlement_offset_.x(), 0),
            gfx::Tween::IntValueBetween(value, settlement_offset_.y(), 0)));
  }
}

void ProfilePagerDrag::AnimationEnded(const gfx::Animation* animation) {
  if (animation == &sibling_animation_) {
    ClearSiblingAnimation();
  } else if (animation == &settlement_animation_) {
    FinishSettlement();
  }
}

void ProfilePagerDrag::FinishSettlement() {
  if (settling_) {
    settling_->SetTransform(gfx::Transform());
  }
  settling_ = nullptr;
  settlement_offset_ = gfx::Vector2d();
  original_order_.clear();
  order_changed_ = false;
  pager_->SetCanProcessEventsWithinSubtree(true);
  if (std::exchange(update_pending_, false)) {
    refresh_.Run();
  }
}

void ProfilePagerDrag::Retire() {
  ClearSiblingAnimation();
  settlement_animation_.Reset();
  if (current_ && *current_ < buttons_->size()) {
    Button* button = (*buttons_)[*current_];
    button->SetTransform(gfx::Transform());
    button->SetDragHighlight(false);
    button->layer()->SetOpacity(1);
  }
  if (settling_) {
    settling_->SetTransform(gfx::Transform());
    settling_->SetDragHighlight(false);
    settling_->layer()->SetOpacity(1);
  }
  settling_ = nullptr;
  current_.reset();
  origin_.reset();
  original_order_.clear();
  order_changed_ = false;
  update_pending_ = false;
  pager_->SetCanProcessEventsWithinSubtree(true);
}

}  // namespace aux
