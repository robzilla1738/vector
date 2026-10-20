// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/ui/views/frame/aux_profile_preview_retention.h"

#include <algorithm>

#include "base/check.h"
#include "base/i18n/rtl.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/tabs/vertical_tab_strip_state_controller.h"
#include "chrome/browser/ui/views/frame/aux_profile_preview_admission.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/ui/views/frame/multi_contents_view.h"
#include "chrome/browser/ui/views/toolbar/toolbar_view.h"
#include "ui/display/screen.h"
#include "ui/events/event.h"
#include "ui/views/event_monitor.h"
#include "ui/views/view.h"
#include "ui/views/widget/widget.h"

namespace aux {
ProfilePreviewRetention::ProfilePreviewRetention(
    BrowserWindowInterface& browser, views::View& region,
    ProfilePreviewAdmission& admission,
    base::RepeatingCallback<bool()> force_collapse_locked)
    : browser_(browser.GetWeakPtr()), region_(&region),
      admission_(admission.GetWeakPtr()),
      force_collapse_locked_(std::move(force_collapse_locked)) {
  CHECK(force_collapse_locked_);
  region_.SetTrackEntireViewHierarchy(true);
  model_observation_.Observe(browser.GetTabStripModel());
}
ProfilePreviewRetention::~ProfilePreviewRetention() { Retire(); }

bool ProfilePreviewRetention::AttachToWidget() {
  if (retired_ || !browser_ || !admission_ || !region_.view())
    return false;
  if (monitor_)
    return true;
  auto* widget = region_.view()->GetWidget();
  if (!widget || !widget->GetTopLevelWidget())
    return false;
  const auto window = widget->GetTopLevelWidget()->GetNativeWindow();
  if (!window)
    return false;
  // Original33f58ec reads exactly {6,4}; callback46507d8 also tolerates
  // dragged(2), but that is not a reason to broaden the registered monitor.
  monitor_ = views::EventMonitor::CreateWindowMonitor(
      this, window, {ui::EventType::kMouseMoved, ui::EventType::kMouseExited});
  return !!monitor_;
}

void ProfilePreviewRetention::DetachFromWidget() {
  monitor_.reset();
  // Original RemovedFromWidget463f960 directly clears a0b, with no new task.
  if (admission_)
    admission_->ClearEdgeRetentionWithoutLayout();
}

void ProfilePreviewRetention::Retire() {
  retired_ = true;
  DetachFromWidget();
  model_observation_.Reset();
}

void ProfilePreviewRetention::OnTabStripModelDestroyed(TabStripModel* model) {
  CHECK_EQ(model_observation_.GetSource(), model);
  // Original4647c94 checks SAME source model before setting terminal f90.
  Retire();
}

void ProfilePreviewRetention::ToolbarPointerChanged(bool inside) {
  if (retired_ || !browser_ || !admission_ || !region_.view())
    return;
  auto* view = BrowserView::GetBrowserViewForBrowser(browser_.get());
  // Original45abe40 has exactly the same native mode/window-feature checks as
  // ShouldDrawVerticalTabStrip28ad220. False always releases the real request.
  admission_->SetBrowserRetention(inside && view &&
                                  view->ShouldDrawVerticalTabStrip());
}

bool ProfilePreviewRetention::EdgeContains(const gfx::Point& point) const {
  if (retired_ || !browser_ || !admission_ || !region_.view())
    return false;
  auto* view = BrowserView::GetBrowserViewForBrowser(browser_.get());
  auto* widget = region_.view()->GetWidget();
  auto* state = tabs::VerticalTabStripStateController::From(browser_.get());
  if (!view || !widget || !view->ShouldDrawVerticalTabStrip() || !state ||
      !state->IsCollapsed() || !widget->ShouldPaintAsActive() ||
      force_collapse_locked_.Run() || !widget->GetNativeWindow())
    return false;
  gfx::Rect bounds = widget->GetWindowBoundsInScreen();
  if (auto* contents = view->multi_contents_view();
      contents && contents->GetVisible()) {
    const gfx::Rect content_bounds = contents->GetBoundsInScreen();
    if (!content_bounds.IsEmpty()) {
      // Original keeps native window x/width while taking actual contents y/h.
      bounds.set_y(content_bounds.y());
      bounds.set_height(content_bounds.height());
    }
  }
  if (!bounds.Contains(point))
    return false;
  return base::i18n::IsRTL() ? point.x() >= bounds.right() - 8
                             : point.x() < bounds.x() + 8;
}

bool ProfilePreviewRetention::RetainedPointerInside() const {
  if (retired_ || !browser_ || !admission_ || !admission_->retained() ||
      !region_.view() || !region_.view()->GetWidget())
    return false;
  auto* view = BrowserView::GetBrowserViewForBrowser(browser_.get());
  if (!view)
    return false;
  gfx::Rect bounds = region_.view()->GetBoundsInScreen();
  // BrowserView+5b0 is the actual ToolbarView: ctor36a615c→41f3b80,
  // same child attached to top-container then stored36a61a8.
  if (auto* toolbar = view->toolbar(); toolbar && toolbar->GetWidget()) {
    const int top = toolbar->GetBoundsInScreen().y();
    bounds.Union(gfx::Rect(bounds.x(), top, bounds.width(),
                          std::max(0, bounds.y() - top)));
  }
  auto* screen = display::Screen::Get();
  if (!screen)
    return false;
  const gfx::Point point = screen->GetCursorScreenPoint();
  // Original99d480 is Union (min origins/max ends), not intersection.
  return bounds.Contains(point) || EdgeContains(point);
}

void ProfilePreviewRetention::OnEvent(const ui::Event& event) {
  if (retired_ || !browser_ || !admission_ || !monitor_)
    return;
  switch (event.type()) {
    case ui::EventType::kMouseDragged:
    case ui::EventType::kMouseMoved:
    case ui::EventType::kMouseExited:
      break;
    default:
      return;
  }
  const gfx::Point point = monitor_->GetLastMouseLocation();
  admission_->SetEdgeRetention(EdgeContains(point));
}
}  // namespace aux
