// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_TAB_SEARCH_BUBBLE_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_TAB_SEARCH_BUBBLE_H_

#include "base/functional/callback.h"
class BrowserWindowInterface;
namespace views {
class View;
class Widget;
}

// Hosts the independent extension search route in a 620x340 native bubble.
// Data remains gated by the bound profile's current Vault/onboarding state.
views::Widget* ShowAuxTabSearchBubble(BrowserWindowInterface* browser,
                                     views::View* anchor,
                                     base::OnceClosure on_closed);
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_TAB_SEARCH_BUBBLE_H_
