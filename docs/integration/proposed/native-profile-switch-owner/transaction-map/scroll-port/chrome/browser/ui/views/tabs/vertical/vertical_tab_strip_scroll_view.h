// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef CHROME_BROWSER_UI_VIEWS_TABS_VERTICAL_VERTICAL_TAB_STRIP_SCROLL_VIEW_H_
#define CHROME_BROWSER_UI_VIEWS_TABS_VERTICAL_VERTICAL_TAB_STRIP_SCROLL_VIEW_H_

#include <optional>

#include "base/callback_list.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "base/time/time.h"
#include "ui/compositor/compositor_animation_observer.h"
#include "ui/base/metadata/metadata_header_macros.h"
#include "ui/events/event_handler.h"
#include "ui/gfx/geometry/size.h"
#include "ui/views/controls/scroll_view.h"

// Restores the supplied vertical strip's real axis ownership and elastic scroll
// effects. The region queries the same sequence state before a profile swipe.
class VerticalTabStripScrollView : public views::ScrollView,
                                   public ui::CompositorAnimationObserver {
  METADATA_HEADER(VerticalTabStripScrollView, views::ScrollView)
 public:
  enum class Axis { kUndecided, kVertical, kHorizontal };

  VerticalTabStripScrollView();
  ~VerticalTabStripScrollView() override;

  Axis axis_lock() const { return axis_; }
  bool scroll_sequence_active() const { return sequence_active_; }
  void ResetScrollSequence();

  void Layout(PassKey) override;
  bool OnMouseWheel(const ui::MouseWheelEvent& event) override;
  void OnScrollEvent(ui::ScrollEvent* event) override;
  void VisibilityChanged(views::View* starting_from, bool visible) override;
  void RemovedFromWidget() override;
  void OnAnimationStep(base::TimeTicks timestamp) override;
  void OnCompositingShuttingDown(ui::Compositor* compositor) override;

 private:
  class InputHandler : public ui::EventHandler {
   public:
    explicit InputHandler(VerticalTabStripScrollView* owner) : owner_(owner) {}
    void OnMouseEvent(ui::MouseEvent* event) override;
    void OnKeyEvent(ui::KeyEvent* event) override;
   private:
    const raw_ptr<VerticalTabStripScrollView> owner_;
  };

  static bool ElasticEffectsDisabled();
  float ElasticRadius() const;
  float ElasticOffset(float amount) const;
  float Unstretch(float offset) const;
  bool ApplyElasticOffset();
  void OnContentsScrolled();
  void StopSpring();
  void StartSpring(base::TimeTicks timestamp);
  bool BeginSequence();
  bool ScrollVertically(float delta, base::TimeTicks timestamp);
  void EndSequence(const ui::ScrollEvent& event);

  Axis axis_ = Axis::kUndecided;
  float accumulated_x_ = 0;
  float accumulated_y_ = 0;
  bool sequence_active_ = false;
  bool ignore_momentum_ = false;
  bool changing_offset_ = false;
  std::optional<float> expected_offset_;
  float elastic_amount_ = 0;
  float elastic_offset_ = 0;
  float velocity_ = 0;
  base::TimeTicks last_scroll_;
  base::TimeTicks spring_start_;
  float spring_offset_ = 0;
  float spring_velocity_ = 0;
  raw_ptr<ui::Compositor> spring_compositor_ = nullptr;
  gfx::Size last_viewport_size_;
  gfx::Size last_contents_size_;
  InputHandler input_handler_{this};
  base::CallbackListSubscription contents_scrolled_subscription_;
  base::WeakPtrFactory<VerticalTabStripScrollView> weak_factory_{this};
};

#endif  // CHROME_BROWSER_UI_VIEWS_TABS_VERTICAL_VERTICAL_TAB_STRIP_SCROLL_VIEW_H_
