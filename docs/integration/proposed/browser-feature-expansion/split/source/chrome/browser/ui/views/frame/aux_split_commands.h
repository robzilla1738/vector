// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SPLIT_COMMANDS_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SPLIT_COMMANDS_H_
#include "components/split_tabs/split_pane_tree.h"
class BrowserWindowInterface;
namespace tabs { class TabInterface; }
namespace aux {
bool CanJoinNativeSplit(BrowserWindowInterface& browser,
                        tabs::TabInterface* target, tabs::TabInterface* source);
bool JoinNativeSplit(BrowserWindowInterface& browser,
                     tabs::TabInterface* target, tabs::TabInterface* source,
                     split_tabs::SplitPaneTree::Axis axis, bool before);
bool CycleNativeSplitPane(BrowserWindowInterface& browser, int direction);
bool SetNativeSplitOrientation(BrowserWindowInterface& browser,
                               split_tabs::SplitPaneTree::Axis axis);
}  // namespace aux
#endif
