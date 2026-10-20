// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_UI_VIEWS_TOOLBAR_AUX_PROFILE_RETAINED_COLLAPSE_BUTTON_H_
#define CHROME_BROWSER_UI_VIEWS_TOOLBAR_AUX_PROFILE_RETAINED_COLLAPSE_BUTTON_H_

#include <memory>

class BrowserWindowInterface;
class ToolbarChipButton;
namespace actions { class ActionItem; }
namespace aux {
// Original ToolbarView+568 chip, bound to actual collapse/expand action302.
std::unique_ptr<ToolbarChipButton> CreateProfileRetainedCollapseButton(
    BrowserWindowInterface& browser, actions::ActionItem& collapse_action);
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_TOOLBAR_AUX_PROFILE_RETAINED_COLLAPSE_BUTTON_H_
