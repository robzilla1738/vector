// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PREVIEW_RETENTION_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PREVIEW_RETENTION_H_

#include <memory>

#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/scoped_observation.h"
#include "chrome/browser/ui/tabs/tab_strip_model_observer.h"
#include "ui/events/event_observer.h"
#include "ui/gfx/geometry/point.h"
#include "ui/views/view_tracker.h"

class BrowserWindowInterface;
class TabStripModel;
namespace views { class EventMonitor; class View; }
namespace aux {
class ProfilePreviewAdmission;
// Original region+a00 window monitor and465020c/465034c native predicates.
class ProfilePreviewRetention : public ui::EventObserver,
                                public TabStripModelObserver {
 public:
  ProfilePreviewRetention(BrowserWindowInterface& browser, views::View& region,
      ProfilePreviewAdmission& admission,
      base::RepeatingCallback<bool()> force_collapse_locked);
  ~ProfilePreviewRetention() override;
  bool AttachToWidget();
  void DetachFromWidget();
  void Retire();
  void ToolbarPointerChanged(bool inside);
  bool RetainedPointerInside() const;
  bool EdgeContains(const gfx::Point& screen_point) const;
  void OnEvent(const ui::Event& event) override;
  void OnTabStripModelDestroyed(TabStripModel* model) override;
 private:
  base::WeakPtr<BrowserWindowInterface> browser_;
  views::ViewTracker region_;
  base::WeakPtr<ProfilePreviewAdmission> admission_;
  base::RepeatingCallback<bool()> force_collapse_locked_;
  bool retired_ = false;
  std::unique_ptr<views::EventMonitor> monitor_;
  base::ScopedObservation<TabStripModel, TabStripModelObserver> model_observation_{
      this};
};
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_PREVIEW_RETENTION_H_
