// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_bookmark_pin_conversion.h"

#include <array>
#include <cstdint>
#include <string>
#include <utility>
#include "base/location.h"
#include "base/uuid.h"
#include "base/functional/bind.h"
#include "chrome/browser/ui/tabs/aux_pinned_tab_entry_identity.h"
#include "chrome/browser/bookmarks/bookmark_model_factory.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/tabs/vertical/vertical_pinned_tab_entries_view.h"
#include "components/bookmarks/browser/bookmark_model.h"
#include "components/bookmarks/browser/bookmark_node.h"
#include "components/bookmarks/common/bookmark_metrics.h"
#include "content/public/browser/web_contents.h"
#include "ui/views/view_tracker.h"
#include "url/gurl.h"

namespace aux {
namespace {
int FindAssociatedTab(TabStripModel& model,
                      std::optional<tabs::TabHandle> handle) {
  return handle && handle->Get() ? model.GetIndexOfTab(handle->Get()) : -1;
}
const bookmarks::BookmarkNode* FindNode(
    const bookmarks::BookmarkNode* root, int64_t id) {
  if (!root || root->id() == id) return root;
  for (const auto& child : root->children()) {
    if (const auto* found = FindNode(child.get(), id)) return found;
  }
  return nullptr;
}
const bookmarks::BookmarkNode* FindRepresentedNode(
    const bookmarks::BookmarkModel& model, int64_t id) {
  const std::array<const bookmarks::BookmarkNode*, 6> roots = {
      model.bookmark_bar_node(), model.other_node(), model.mobile_node(),
      model.account_bookmark_bar_node(), model.account_other_node(),
      model.account_mobile_node()};
  for (const auto* root : roots) {
    if (const auto* found = FindNode(root, id)) return found;
  }
  return nullptr;
}
}  // namespace

void ConvertBookmarkToPinnedEntry(
    BrowserWindowInterface& browser,
    VerticalPinnedTabEntriesView& pinned_entries,
    const bookmarks::BookmarkNode& node,
    std::optional<tabs::TabHandle> associated_tab,
    base::OnceCallback<void(bool)> done) {
  auto* model = browser.GetTabStripModel();
  if (!node.is_url() || !model) { std::move(done).Run(false); return; }
  const auto browser_alive = browser.GetWeakPtr();
  auto* const profile = browser.GetProfile();
  const int64_t node_id = node.id();
  const auto node_uuid = node.uuid();
  const GURL url = node.url();
  const std::u16string title = node.GetTitle();
  std::string existing_id;
  if (associated_tab && associated_tab->Get() &&
      associated_tab->Get()->GetContents() &&
      associated_tab->Get()->GetContents()->GetBrowserContext() == profile) {
    existing_id = GetRememberedPinnedTabEntryId(
        *associated_tab->Get()->GetContents()).value_or("");
  }
  pinned_entries.CommitDroppedEntryAsync(url, title, std::move(existing_id),
      base::BindOnce([](base::WeakPtr<BrowserWindowInterface> browser,
                        Profile* expected_profile, TabStripModel* expected_model,
                        int64_t node_id, base::Uuid node_uuid, GURL url,
                        std::u16string title, std::optional<tabs::TabHandle> associated,
                        base::OnceCallback<void(bool)> done, bool success,
                        std::string logical_id) {
        if (!success || !browser || browser->GetProfile() != expected_profile ||
            browser->GetTabStripModel() != expected_model) {
          std::move(done).Run(false); return;
        }
        const int index = FindAssociatedTab(*expected_model, associated);
        if (index >= 0) {
          auto* contents = expected_model->GetWebContentsAt(index);
          if (contents && contents->GetBrowserContext() == expected_profile) {
            RememberPinnedTabEntryId(*contents, logical_id);
            RememberPinnedTabEntryUrl(*contents, url);
            expected_model->SetTabPinned(index, true);
          }
        }
        if (!browser || browser->GetProfile() != expected_profile ||
            browser->GetTabStripModel() != expected_model) {
          std::move(done).Run(false); return;
        }
        auto* bookmarks = BookmarkModelFactory::GetForBrowserContext(expected_profile);
        if (bookmarks && bookmarks->loaded()) {
          const auto* current = FindRepresentedNode(*bookmarks, node_id);
          // A changed bookmark belongs to the user; retain it even though the
          // original pin proposal committed. Never delete by stale ID alone.
          if (current && current->uuid() == node_uuid && current->parent() &&
              current->url() == url && current->GetTitle() == title)
            bookmarks->Remove(current, bookmarks::metrics::BookmarkEditSource::kUser, FROM_HERE);
        }
        std::move(done).Run(true);
      }, browser_alive, profile, model, node_id, node_uuid, url, title,
         associated_tab, std::move(done)));
}
}  // namespace aux
