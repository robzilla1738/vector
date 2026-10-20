// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_bookmark_pin_conversion.h"

#include <array>
#include <cstdint>
#include <string>
#include "base/location.h"
#include "chrome/browser/bookmarks/bookmark_model_factory.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/tabs/vertical/vertical_pinned_tab_entries_view.h"
#include "components/bookmarks/browser/bookmark_model.h"
#include "components/bookmarks/browser/bookmark_node.h"
#include "components/bookmarks/common/bookmark_metrics.h"
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

bool ConvertBookmarkToPinnedEntry(
    BrowserWindowInterface& browser,
    VerticalPinnedTabEntriesView& pinned_entries,
    const bookmarks::BookmarkNode& node,
    std::optional<tabs::TabHandle> associated_tab) {
  if (!node.is_url()) return false;
  auto* model = browser.GetTabStripModel();
  if (!model) return false;
  const auto browser_alive = browser.GetWeakPtr();
  auto* const profile = browser.GetProfile();
  views::ViewTracker pinned_alive(&pinned_entries);
  // Preference/model notifications can reenter the real region. Snapshot the
  // dragged identity/content and reacquire its actual model node afterwards.
  const int64_t node_id = node.id();
  const auto node_uuid = node.uuid();
  const GURL url = node.url();
  const std::u16string title = node.GetTitle();
  const auto still_current = [&] {
    return browser_alive && pinned_alive.view() &&
        browser_alive->GetProfile() == profile &&
        browser_alive->GetTabStripModel() == model;
  };

  // Original462d740..77c pins only the exact live associated tab when needed.
  const int index = FindAssociatedTab(*model, associated_tab);
  const bool newly_pinned = index >= 0 && !model->IsTabPinned(index);
  if (newly_pinned) {
    model->SetTabPinned(index, true);
    if (!still_current()) return false;
  }
  if (!pinned_entries.CommitDroppedEntry(url, title)) {
    if (!still_current()) return false;
    // SetTabPinned can change indices: original failure path searches again.
    if (newly_pinned) {
      const int current_index = FindAssociatedTab(*model, associated_tab);
      if (current_index >= 0) model->SetTabPinned(current_index, false);
    }
    return false;
  }
  if (!still_current()) return false;

  // Original462d6f4..838: saved-entry success comes first. A missing/unloaded
  // bookmark model skips removal; it must not undo the saved pin.
  auto* bookmark_model = BookmarkModelFactory::GetForBrowserContext(profile);
  if (bookmark_model && bookmark_model->loaded()) {
    const auto* current = FindRepresentedNode(*bookmark_model, node_id);
    if (current && current->uuid() == node_uuid && current->parent()) {
      bookmark_model->Remove(current, bookmarks::metrics::BookmarkEditSource::kUser,
                        FROM_HERE);
    }
  }
  return true;
}
}  // namespace aux
