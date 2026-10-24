// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_BOOKMARK_PIN_CONVERSION_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_BOOKMARK_PIN_CONVERSION_H_

#include <optional>
#include "components/tabs/public/tab_interface.h"

class BrowserWindowInterface;
class VerticalPinnedTabEntriesView;
namespace bookmarks { class BookmarkNode; }
namespace aux {

// Original region462d5e0: commit the genuine dragged URL bookmark to saved
// pins. The optional handle comes from the actual bookmark association owner.
// Conversion success precedes removal from the real loaded BookmarkModel.
bool ConvertBookmarkToPinnedEntry(
    BrowserWindowInterface& browser,
    VerticalPinnedTabEntriesView& pinned_entries,
    const bookmarks::BookmarkNode& node,
    std::optional<tabs::TabHandle> associated_tab);

}  // namespace aux
#endif
