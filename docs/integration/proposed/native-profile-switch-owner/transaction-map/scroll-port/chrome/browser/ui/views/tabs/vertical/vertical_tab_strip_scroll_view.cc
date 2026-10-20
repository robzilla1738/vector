// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/views/tabs/vertical/vertical_tab_strip_scroll_view.h"

#include <algorithm>
#include <cmath>

#include "base/check.h"
#include "base/command_line.h"
#include "base/functional/bind.h"
#include "ui/compositor/compositor.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/events/event.h"
#include "ui/gfx/animation/animation.h"
#include "ui/gfx/geometry/point_f.h"
#include "ui/gfx/transform.h"
#include "ui/views/widget/widget.h"

namespace {
constexpr float kAxisThreshold = 6.f;
constexpr float kDominance = 1.5f;
constexpr float kElasticScale = 18.f;
constexpr float kSpringRate = 11.25f;

bool IsMomentum(const ui::ScrollEvent& event) {
  return event.momentum_phase() == ui::EventMomentumPhase::BEGAN ||
         event.momentum_phase() == ui::EventMomentumPhase::INERTIAL_UPDATE;
}

bool IsEnd(const ui::ScrollEvent& event) {
  return event.scroll_event_phase() == ui::ScrollEventPhase::kEnd ||
         event.momentum_phase() == ui::EventMomentumPhase::END;
}

void Consume(ui::ScrollEvent* event) {
  event->SetHandled();
  event->StopPropagation();
}
}  // namespace

VerticalTabStripScrollView::VerticalTabStripScrollView()
    : views::ScrollView(ScrollWithLayers::kEnabled) {
  // Supplied inherited +3a9 preferred-layout fast path needs the separate
  // base ScrollView adaptation; it is not SetUseContentsPreferredSize(true).
  AddPreTargetHandler(&input_handler_);
  contents_scrolled_subscription_ = AddContentsScrolledCallback(
      base::BindRepeating(&VerticalTabStripScrollView::OnContentsScrolled,
                          weak_factory_.GetWeakPtr()));
}

VerticalTabStripScrollView::~VerticalTabStripScrollView() {
  contents_scrolled_subscription_ = {};
  RemovePreTargetHandler(&input_handler_);
  StopSpring();
}

bool VerticalTabStripScrollView::ElasticEffectsDisabled() {
  const auto* command_line = base::CommandLine::ForCurrentProcess();
  // Both explicit switches bypass this supplied elastic effect, independently
  // of the general animation preference's normal override ordering.
  return command_line->HasSwitch("force-prefers-reduced-motion") ||
         command_line->HasSwitch("force-prefers-no-reduced-motion") ||
         gfx::Animation::PrefersReducedMotion();
}

float VerticalTabStripScrollView::ElasticRadius() const {
  return std::max(1.f, GetVisibleRect().height() * .1f) * 1.5f;
}

float VerticalTabStripScrollView::ElasticOffset(float amount) const {
  const float radius = ElasticRadius();
  const float scaled = (amount / kElasticScale) * 1.5f;
  return scaled * radius / (std::abs(scaled) + radius);
}

float VerticalTabStripScrollView::Unstretch(float offset) const {
  const float radius = ElasticRadius();
  const float bounded = std::clamp(
      offset, -std::nextafter(radius, 0.f), std::nextafter(radius, 0.f));
  return bounded * radius * kElasticScale /
         ((radius - std::abs(bounded)) * 1.5f);
}

bool VerticalTabStripScrollView::ApplyElasticOffset() {
  auto weak = weak_factory_.GetWeakPtr();
  if (contents()) {
    gfx::Transform transform;
    transform.Translate(0, elastic_offset_);
    contents()->SetTransform(transform);
  }
  return !!weak;
}

void VerticalTabStripScrollView::StopSpring() {
  auto* compositor = spring_compositor_.get();
  spring_compositor_ = nullptr;
  if (compositor && compositor->HasAnimationObserver(this)) {
    compositor->RemoveAnimationObserver(this);
  }
}

void VerticalTabStripScrollView::ResetScrollSequence() {
  auto weak = weak_factory_.GetWeakPtr();
  StopSpring();
  if (!weak) {
    return;
  }
  axis_ = Axis::kUndecided;
  accumulated_x_ = accumulated_y_ = 0;
  sequence_active_ = false;
  ignore_momentum_ = true;
  elastic_amount_ = elastic_offset_ = velocity_ = 0;
  last_scroll_ = {};
  expected_offset_.reset();
  ApplyElasticOffset();
}

void VerticalTabStripScrollView::OnContentsScrolled() {
  if (changing_offset_) {
    return;
  }
  if (expected_offset_ &&
      std::abs(CurrentOffset().y() - *expected_offset_) <= .01f) {
    return;
  }
  ResetScrollSequence();
}

bool VerticalTabStripScrollView::BeginSequence() {
  auto weak = weak_factory_.GetWeakPtr();
  StopSpring();
  if (!weak) {
    return false;
  }
  axis_ = Axis::kUndecided;
  accumulated_x_ = accumulated_y_ = 0;
  sequence_active_ = true;
  ignore_momentum_ = false;
  elastic_amount_ = Unstretch(elastic_offset_);
  velocity_ = 0;
  last_scroll_ = {};
  expected_offset_ = CurrentOffset().y();
  return true;
}

bool VerticalTabStripScrollView::ScrollVertically(
    float delta, base::TimeTicks timestamp) {
  auto weak = weak_factory_.GetWeakPtr();
  const float previous_offset = elastic_offset_;
  const bool no_elastic = ElasticEffectsDisabled();
  if (no_elastic) {
    StopSpring();
    if (!weak) {
      return false;
    }
    elastic_amount_ = elastic_offset_ = 0;
    if (!ApplyElasticOffset()) {
      return false;
    }
  }

  if (elastic_amount_ != 0 && delta * elastic_amount_ < 0) {
    const float remaining = delta + elastic_offset_;
    elastic_amount_ = 0;
    if (elastic_offset_ * remaining > 0) {
      elastic_amount_ = Unstretch(remaining);
      delta = 0;
    } else {
      delta = remaining;
    }
  }

  if (delta != 0) {
    const gfx::PointF old = CurrentOffset();
    const float requested = old.y() - delta;
    const float maximum = std::max(
        0, contents()->height() - GetVisibleRect().height());
    const float bounded = std::clamp(requested, 0.f, maximum);
    if (bounded != old.y()) {
      changing_offset_ = true;
      expected_offset_ = bounded;
      ScrollToOffset(gfx::PointF(old.x(), bounded));
      if (!weak) {
        return false;
      }
      changing_offset_ = false;
    }
    if (!no_elastic && bounded != requested) {
      elastic_amount_ += bounded - requested;
    }
  }

  elastic_offset_ = ElasticOffset(elastic_amount_);
  if (!ApplyElasticOffset()) {
    return false;
  }
  if (!last_scroll_.is_null() && timestamp > last_scroll_) {
    velocity_ = (elastic_offset_ - previous_offset) /
                (timestamp - last_scroll_).InSecondsF();
  }
  last_scroll_ = timestamp;
  return true;
}

void VerticalTabStripScrollView::StartSpring(base::TimeTicks timestamp) {
  if (spring_compositor_ || elastic_offset_ == 0) {
    return;
  }
  auto* widget = GetWidget();
  auto* compositor = widget && IsDrawn() ? widget->GetCompositor() : nullptr;
  if (ElasticEffectsDisabled() || !compositor) {
    elastic_amount_ = 0;
    elastic_offset_ = 0;
    ApplyElasticOffset();
    return;
  }
  spring_start_ = timestamp;
  spring_offset_ = elastic_offset_;
  if (timestamp - last_scroll_ > base::Milliseconds(80)) {
    velocity_ = 0;
  }
  const float direction = std::signbit(elastic_offset_) ? -1.f : 1.f;
  const float minimum = -std::abs(elastic_offset_) * kSpringRate;
  const float maximum =
      (ElasticRadius() - std::abs(elastic_offset_)) * kSpringRate * .5f;
  CHECK_LE(minimum, maximum);
  spring_velocity_ =
      direction * std::clamp(direction * velocity_, minimum, maximum) * .31f;
  spring_compositor_ = compositor;
  compositor->AddAnimationObserver(this);
}

void VerticalTabStripScrollView::EndSequence(
    const ui::ScrollEvent& event) {
  if (IsEnd(event)) {
    sequence_active_ = false;
    if (elastic_offset_ != 0) {
      ignore_momentum_ = true;
      StartSpring(event.time_stamp());
    }
  } else if (IsMomentum(event)) {
    sequence_active_ = false;
  }
}

void VerticalTabStripScrollView::OnScrollEvent(ui::ScrollEvent* event) {
  if (event->type() != ui::EventType::kScroll || !contents() || !GetWidget()) {
    return;
  }
  auto weak = weak_factory_.GetWeakPtr();
  const auto phase = event->scroll_event_phase();
  const auto momentum = event->momentum_phase();
  float dx = event->x_offset_ordinal();
  float dy = event->y_offset_ordinal();
  if (phase == ui::ScrollEventPhase::kNone &&
      momentum == ui::EventMomentumPhase::END &&
      (dx != 0 || dy != 0)) {
    ResetScrollSequence();
    if (weak) {
      views::ScrollView::OnScrollEvent(event);
    }
    return;
  }
  const bool begin = phase == ui::ScrollEventPhase::kBegan ||
      (phase == ui::ScrollEventPhase::kNone &&
       momentum == ui::EventMomentumPhase::MAY_BEGIN) ||
      (!sequence_active_ && !IsEnd(*event) && !IsMomentum(*event));
  if (begin && !BeginSequence()) {
    return;
  }
  if (IsMomentum(*event) && ignore_momentum_) {
    Consume(event);
    return;
  }
  bool vertical = axis_ == Axis::kVertical;
  if (axis_ == Axis::kUndecided) {
    accumulated_x_ += dx;
    accumulated_y_ += dy;
    const float x = std::abs(accumulated_x_);
    const float y = std::abs(accumulated_y_);
    vertical = x <= std::max(1.f, kDominance * y);
    if (std::max(x, y) >= kAxisThreshold ||
        (IsEnd(*event) && (x != 0 || y != 0))) {
      axis_ = vertical ? Axis::kVertical : Axis::kHorizontal;
      accumulated_x_ = accumulated_y_ = 0;
      if (axis_ == Axis::kHorizontal) {
        StartSpring(event->time_stamp());
        if (!weak) {
          return;
        }
      }
    }
  }
  if (vertical && dy != 0) {
    if (!ScrollVertically(dy, event->time_stamp())) {
      return;
    }
    if (IsMomentum(*event) && elastic_offset_ != 0) {
      ignore_momentum_ = true;
      StartSpring(event->time_stamp());
      if (!weak) {
        return;
      }
    }
  }
  EndSequence(*event);
  if (weak) {
    Consume(event);
  }
}

void VerticalTabStripScrollView::OnAnimationStep(base::TimeTicks timestamp) {
  const float elapsed = std::max(
      0., (timestamp - spring_start_).InSecondsF());
  const float offset =
      (spring_offset_ + (spring_velocity_ + spring_offset_ * kSpringRate) *
                            elapsed) * std::exp(-kSpringRate * elapsed);
  if (std::abs(offset) < .1f || ElasticEffectsDisabled()) {
    auto weak = weak_factory_.GetWeakPtr();
    StopSpring();
    if (!weak) {
      return;
    }
    elastic_amount_ = elastic_offset_ = 0;
  } else {
    elastic_offset_ = offset;
  }
  ApplyElasticOffset();
}

void VerticalTabStripScrollView::OnCompositingShuttingDown(
    ui::Compositor*) {
  ResetScrollSequence();
}

void VerticalTabStripScrollView::Layout(PassKey key) {
  auto weak = weak_factory_.GetWeakPtr();
  views::ScrollView::Layout(key);
  if (!weak) {
    return;
  }
  const gfx::Size viewport = GetVisibleRect().size();
  const gfx::Size content = contents() ? contents()->size() : gfx::Size();
  if (viewport != last_viewport_size_ || content != last_contents_size_) {
    ResetScrollSequence();
    if (!weak) {
      return;
    }
    last_viewport_size_ = viewport;
    last_contents_size_ = content;
  }
}

bool VerticalTabStripScrollView::OnMouseWheel(
    const ui::MouseWheelEvent& event) {
  auto weak = weak_factory_.GetWeakPtr();
  ResetScrollSequence();
  return weak ? views::ScrollView::OnMouseWheel(event) : false;
}

void VerticalTabStripScrollView::VisibilityChanged(
    views::View*, bool) {
  if (!IsDrawn()) {
    ResetScrollSequence();
  }
}

void VerticalTabStripScrollView::RemovedFromWidget() {
  ResetScrollSequence();
}

void VerticalTabStripScrollView::InputHandler::OnMouseEvent(
    ui::MouseEvent* event) {
  if (event->type() == ui::EventType::kMousePressed ||
      event->type() == ui::EventType::kMouseDragged) {
    owner_->ResetScrollSequence();
  }
}

void VerticalTabStripScrollView::InputHandler::OnKeyEvent(ui::KeyEvent* event) {
  if (event->type() == ui::EventType::kKeyPressed) {
    owner_->ResetScrollSequence();
  }
}

BEGIN_METADATA(VerticalTabStripScrollView)
END_METADATA
