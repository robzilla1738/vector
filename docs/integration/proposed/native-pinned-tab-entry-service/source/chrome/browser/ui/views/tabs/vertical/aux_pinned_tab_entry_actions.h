// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_VIEWS_TABS_VERTICAL_AUX_PINNED_TAB_ENTRY_ACTIONS_H_
#define CHROME_BROWSER_UI_VIEWS_TABS_VERTICAL_AUX_PINNED_TAB_ENTRY_ACTIONS_H_

#include <optional>

#include "chrome/browser/ui/tabs/aux_pinned_tab_entry_identity.h"
#include "url/gurl.h"

class BrowserWindowInterface;
class TabStripModel;
namespace content {
class WebContents;
}

namespace aux {

std::optional<int> FindPinnedTabEntry(const TabStripModel& model,
                                      const GURL& url);
void OpenPinnedTabEntry(BrowserWindowInterface& browser, const GURL& url);

}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_TABS_VERTICAL_AUX_PINNED_TAB_ENTRY_ACTIONS_H_
