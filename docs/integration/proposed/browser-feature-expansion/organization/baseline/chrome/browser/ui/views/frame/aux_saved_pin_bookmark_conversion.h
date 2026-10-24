// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SAVED_PIN_BOOKMARK_CONVERSION_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SAVED_PIN_BOOKMARK_CONVERSION_H_

#include <optional>
#include "chrome/browser/ui/tabs/aux_pinned_tab_entries.h"
#include "components/tabs/public/tab_interface.h"

class BrowserWindowInterface;
class VerticalPinnedTabEntriesView;
namespace aux {
class VerticalTabBookmarksView;
// Actual original saved-entry finish462ba98. The real region supplies its6c0
// remove-without-insertion state; this helper does not infer a destination.
// Never adds a bookmark in that branch. Normal insertion must create a genuine
// BookmarkNode before unpin/removal. Neither branch closes any browser tab.
bool ConvertSavedPinToBookmark(BrowserWindowInterface&,
                               VerticalPinnedTabEntriesView&,
                               VerticalTabBookmarksView&,
                               const PinnedTabEntry&,
                               std::optional<tabs::TabHandle> associated_tab,
                               bool remove_without_insertion);
}  // namespace aux
#endif
