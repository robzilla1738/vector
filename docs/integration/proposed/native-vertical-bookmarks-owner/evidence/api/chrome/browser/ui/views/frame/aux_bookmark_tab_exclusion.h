// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_BOOKMARK_TAB_EXCLUSION_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_BOOKMARK_TAB_EXCLUSION_H_

#include <optional>
#include "components/tab_groups/tab_group_id.h"
#include "components/tab_groups/tab_group_visual_data.h"

class TabStripModel;
namespace content { class WebContents; }
namespace tabs { class TabInterface; }
namespace aux {

// The source's original WebContents userdata retains the real group identity
// and visual data while the original group owner temporarily detaches it.
struct RetainedTabGroup {
  tab_groups::TabGroupId id;
  tab_groups::TabGroupVisualData visual_data;
};
void SetRetainedTabGroup(content::WebContents&, const RetainedTabGroup&);
std::optional<RetainedTabGroup> GetRetainedTabGroup(content::WebContents&);
void ClearRetainedTabGroup(content::WebContents&);

// Original4127744: retained group snapshot OR actual native agent-group flag.
// Ordinary grouping, pinned state, split state and URL/title are not this rule.
bool IsBookmarkTabExcluded(tabs::TabInterface*, const TabStripModel*);
}  // namespace aux
#endif
