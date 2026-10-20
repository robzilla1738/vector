// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_saved_pin_bookmark_conversion.h"

#include <algorithm>
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/frame/aux_vertical_tab_bookmarks_view.h"
#include "chrome/browser/ui/views/tabs/vertical/vertical_pinned_tab_entries_view.h"
#include "content/public/browser/web_contents.h"
#include "ui/views/view_tracker.h"

namespace aux {
bool ConvertSavedPinToBookmark(BrowserWindowInterface& browser,
                               VerticalPinnedTabEntriesView& saved_pins,
                               VerticalTabBookmarksView& bookmarks,
                               const PinnedTabEntry& entry,
                               std::optional<tabs::TabHandle> associated_tab,
                               bool remove_without_insertion) {
  if (!entry.url.is_valid())
    return false;
  auto* const model = browser.GetTabStripModel();
  auto* const profile = browser.GetProfile();
  if (!model || !profile)
    return false;
  const auto browser_alive = browser.GetWeakPtr();
  views::ViewTracker bookmarks_alive(&bookmarks);
  views::ViewTracker pins_alive(&saved_pins);
  // Source callbacks/observers may retire this window's profile-bound owners.
  // Snapshot data before AddURL and revalidate after every notifying mutation.
  const GURL url = entry.url;
  const std::u16string title = entry.title;
  const auto current = [&] {
    return browser_alive && bookmarks_alive.view() && pins_alive.view() &&
           browser_alive->GetProfile() == profile &&
           browser_alive->GetTabStripModel() == model;
  };
  if (!remove_without_insertion) {
    const bool created =
        bookmarks.CommitExternalBookmark(url, title) != nullptr;
    if (!current() || !created)
      return false;
  }
  // Original462bac4..b68/462bd28..b90: only the exact optional live handle,
  // searched again in the actual current model. URL equality grants no
  // authority.
  if (associated_tab && associated_tab->Get()) {
    auto* tab = associated_tab->Get();
    const int index = model->GetIndexOfTab(tab);
    if (index >= 0 && tab->GetContents() &&
        tab->GetContents()->GetBrowserContext() == profile &&
        model->IsTabPinned(index)) {
      model->SetTabPinned(index, false);
      if (!current())
        return false;
    }
  }
  // Actual source41d4f20 removes only the first exact saved URL. A genuine
  // failed AddURL above leaves both the saved entry and pinned live tab intact.
  RemoveFirstPinnedTabEntry(*profile->GetPrefs(), url);
  if (!current())
    return false;
  saved_pins.RefreshAfterSavedEntryChange();
  if (!current())
    return false;
  if (!remove_without_insertion)
    return true;
  const auto entries = ReadPinnedTabEntries(*profile->GetPrefs());
  return std::ranges::none_of(entries, [&url](const PinnedTabEntry& saved) {
    return saved.url == url;
  });
}
}  // namespace aux
