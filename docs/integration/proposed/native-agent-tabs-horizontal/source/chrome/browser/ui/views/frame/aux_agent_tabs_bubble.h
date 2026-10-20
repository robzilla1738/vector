// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_AGENT_TABS_BUBBLE_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_AGENT_TABS_BUBBLE_H_
#include <memory>
class BrowserWindowInterface;
class TabStrip;
namespace views { class ImageButton; }
// Cold ownership check only: the actual per-window bubble must finish closing
// before its old profile can leave this physical window.
bool CanSwitchAuxAgentTabsProfile(BrowserWindowInterface* browser);

// Native toolbar control backed exclusively by verified owned-target records.
std::unique_ptr<views::ImageButton> CreateAuxAgentTabsButton(
    BrowserWindowInterface* browser,
    TabStrip* tab_strip = nullptr);
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_AGENT_TABS_BUBBLE_H_
