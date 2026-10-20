// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/ui/views/toolbar/aux_profile_retained_collapse_button.h"

#include <string>

#include "base/memory/weak_ptr.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/vertical_tab_strip_state_controller.h"
#include "chrome/browser/ui/views/frame/aux_profile_preview_retention.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "chrome/browser/ui/views/frame/vertical_tab_strip_region_view.h"
#include "chrome/browser/ui/views/toolbar/toolbar_chip_button.h"
#include "ui/actions/actions.h"
#include "ui/gfx/geometry/insets.h"
#include "ui/gfx/geometry/size.h"
#include "ui/views/accessibility/view_accessibility.h"
#include "ui/views/actions/action_view_controller.h"
#include "ui/views/view_class_properties.h"
#include "ui/views/view_tracker.h"

namespace aux {
namespace {
class RetainedCollapseActionViewInterface final
    : public ToolbarButtonActionViewInterface {
 public:
  RetainedCollapseActionViewInterface(
      ToolbarButton* button, base::WeakPtr<BrowserWindowInterface> browser)
      : ToolbarButtonActionViewInterface(button), button_(button),
        browser_(browser) {}

  void ActionItemChangedImpl(actions::ActionItem* action) override {
    // The supplied chip updates accessibility text, not a visible label.
    views::ButtonActionViewInterface::ActionItemChangedImpl(action);
    // The expanded sidebar owns this control in its header. Retain the toolbar
    // copy only while that header is collapsed, as in the supplied frame.
    auto* state = browser_ ? tabs::VerticalTabStripStateController::From(
                                 browser_.get()) : nullptr;
    button_->SetVisible(state && state->ShouldDisplayVerticalTabs() &&
                        state->GetCollapseState() !=
                            tabs::VerticalTabStripCollapseState::kExpanded);
    button_->SetTooltipText(std::u16string(action->GetTooltipText()));
    button_->GetViewAccessibility().SetName(std::u16string(action->GetText()));
    if (action->GetImage().IsVectorIcon()) {
      button_->SetVectorIcon(*action->GetImage().GetVectorIcon().vector_icon());
    }
  }

 private:
  raw_ptr<ToolbarButton> button_;
  base::WeakPtr<BrowserWindowInterface> browser_;
};

class ProfileRetainedCollapseButton final : public ToolbarChipButton {
 public:
  ProfileRetainedCollapseButton(BrowserWindowInterface& browser,
                                actions::ActionItem& action)
      : ToolbarChipButton(PressedCallback()), browser_(browser.GetWeakPtr()) {
    // Source41f8f48..6c replaces the optional layout insets, not internal padding.
    SetLayoutInsets(gfx::Insets(8));
    SetProperty(views::kMarginsKey, gfx::Insets::TLBR(0, 2, 0, 2));
    SetMinSize(gfx::Size(32, 32));
    SetMaxSize(gfx::Size(32, 32));
    action_controller_.CreateActionViewRelationship(this,
                                                   action.GetAsWeakPtr());
  }
  std::unique_ptr<views::ActionViewInterface> GetActionViewInterface()
      override {
    return std::make_unique<RetainedCollapseActionViewInterface>(this, browser_);
  }
  void OnMouseEntered(const ui::MouseEvent& event) override {
    views::ViewTracker alive(this);
    ToolbarChipButton::OnMouseEntered(event);
    if (alive.view())
      ForwardRetention(true);
  }
  void OnMouseExited(const ui::MouseEvent& event) override {
    views::ViewTracker alive(this);
    // Source7d89b78 preserves ToolbarButton's genuine drag/pressed behavior.
    ToolbarChipButton::OnMouseExited(event);
    if (alive.view())
      ForwardRetention(false);
  }
 protected:
  int GetIconSize() const override { return 16; }
 private:
  void ForwardRetention(bool inside) {
    if (!browser_)
      return;
    auto* view = BrowserView::GetBrowserViewForBrowser(browser_.get());
    if (!view || !view->vertical_tab_strip_region_view())
      return;
    if (auto* retention = view->vertical_tab_strip_region_view()
                              ->GetAuxProfilePreviewRetention())
      retention->ToolbarPointerChanged(inside);
  }
  base::WeakPtr<BrowserWindowInterface> browser_;
  views::ActionViewController action_controller_;
};
}  // namespace

std::unique_ptr<ToolbarChipButton> CreateProfileRetainedCollapseButton(
    BrowserWindowInterface& browser, actions::ActionItem& collapse_action) {
  return std::make_unique<ProfileRetainedCollapseButton>(browser,
                                                       collapse_action);
}
}  // namespace aux
