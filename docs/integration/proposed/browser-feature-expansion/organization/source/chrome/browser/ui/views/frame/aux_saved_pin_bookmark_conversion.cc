// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_saved_pin_bookmark_conversion.h"

#include <utility>
#include "base/functional/bind.h"
#include "chrome/browser/ui/tabs/aux_pinned_tab_entry_identity.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/frame/aux_vertical_tab_bookmarks_view.h"
#include "chrome/browser/ui/views/tabs/vertical/vertical_pinned_tab_entries_view.h"
#include "content/public/browser/web_contents.h"
#include "ui/views/view_tracker.h"

namespace aux {
void ConvertSavedPinToBookmark(BrowserWindowInterface& browser,
                               VerticalPinnedTabEntriesView& saved_pins,
                               VerticalTabBookmarksView& bookmarks,
                               const PinnedTabEntry& entry,
                               std::optional<tabs::TabHandle> associated_tab,
                               bool remove_without_insertion,
                               base::OnceCallback<void(bool)> done) {
  auto* const model = browser.GetTabStripModel();
  auto* const profile = browser.GetProfile();
  if (!entry.url.is_valid() || entry.logical_id.empty() || !model || !profile) {
    std::move(done).Run(false); return;
  }
  const auto browser_alive = browser.GetWeakPtr();
  views::ViewTracker pins_alive(&saved_pins);
  // Create the bookmark before removing pin retention. Failure retains the
  // original pin. A later failed unpin may leave both references, never loss.
  if (!remove_without_insertion &&
      !bookmarks.CommitExternalBookmark(entry.url, entry.title)) {
    std::move(done).Run(false); return;
  }
  if (!browser_alive || !pins_alive.view() ||
      browser_alive->GetProfile() != profile ||
      browser_alive->GetTabStripModel() != model) {
    std::move(done).Run(false); return;
  }
  saved_pins.UnpinEntryAsync(entry, base::BindOnce(
      [](base::WeakPtr<BrowserWindowInterface> browser, Profile* profile,
         TabStripModel* expected, std::optional<tabs::TabHandle> associated,
         std::string logical_id, base::OnceCallback<void(bool)> done, bool success) {
        if (!success || !browser || browser->GetProfile() != profile ||
            browser->GetTabStripModel() != expected) {
          std::move(done).Run(false); return;
        }
        if (associated && associated->Get()) {
          auto* tab = associated->Get();
          const int index = expected->GetIndexOfTab(tab);
          if (index >= 0 && tab->GetContents() &&
              tab->GetContents()->GetBrowserContext() == profile &&
              GetRememberedPinnedTabEntryId(*tab->GetContents()) == logical_id)
            expected->SetTabPinned(index, false);
        }
        std::move(done).Run(true);
      }, browser_alive, profile, model, associated_tab, entry.logical_id, std::move(done)));
}
}  // namespace aux
