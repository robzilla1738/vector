// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/views/frame/aux_bookmark_tab_associations.h"

#include <array>
#include <set>

#include "base/strings/string_number_conversions.h"
#include "chrome/browser/sessions/session_service.h"
#include "chrome/browser/sessions/session_service_factory.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_group_features.h"
#include "chrome/browser/ui/tabs/tab_group_model.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/frame/aux_vertical_tab_bookmarks_view.h"
#include "components/tabs/public/tab_group.h"
#include "components/bookmarks/browser/bookmark_model.h"
#include "components/bookmarks/browser/bookmark_node.h"
#include "components/sessions/content/session_tab_helper.h"
#include "content/public/browser/web_contents.h"

namespace aux {
namespace {

const bookmarks::BookmarkNode* FindInSubtree(
    const bookmarks::BookmarkNode* node,
    int64_t id) {
  if (!node || node->id() == id) {
    return node;
  }
  for (const auto& child : node->children()) {
    if (const auto* match = FindInSubtree(child.get(), id)) {
      return match;
    }
  }
  return nullptr;
}

bool ContainsRepresentedNode(const bookmarks::BookmarkModel& model,
                             int64_t id) {
  // Source4614538 searches these six roots, not the synthetic model root or
  // unrelated managed nodes. Aliased roots are visited once.
  const std::array<const bookmarks::BookmarkNode*, 6> roots = {
      model.bookmark_bar_node(),  model.other_node(),
      model.mobile_node(),        model.account_bookmark_bar_node(),
      model.account_other_node(), model.account_mobile_node()};
  std::set<const bookmarks::BookmarkNode*> visited;
  for (const auto* root : roots) {
    if (root && visited.insert(root).second && FindInSubtree(root, id)) {
      return true;
    }
  }
  return false;
}

}  // namespace

BookmarkTabAssociations::BookmarkTabAssociations(
    BrowserWindowInterface& browser)
    : browser_(browser) {}
BookmarkTabAssociations::~BookmarkTabAssociations() = default;

void BookmarkTabAssociations::Import(tabs::TabInterface* tab) {
  if (!tab || associations_.contains(tab->GetHandle()) || !tab->GetContents()) {
    return;
  }
  const auto representation = GetBookmarkTabRepresentation(tab->GetContents());
  if (!representation || !representation->node_id ||
      representation->host.empty()) {
    return;
  }
  associations_.insert_or_assign(tab->GetHandle(), *representation);
  Persist(*tab, *representation);
}

bool BookmarkTabAssociations::BindPendingNavigation(
    tabs::TabInterface* tab,
    VerticalTabBookmarksView& bookmarks,
    std::set<tabs::TabHandle>& handles_fb0) {
  if (!tab)
    return false;
  // This source branch checks the actual native Agent group only. It does
  // not share4127744's distinct retained-group userdata exclusion.
  auto* model = browser_->GetTabStripModel();
  const auto group_id = tab->GetGroup();
  const auto* groups = model ? model->group_model() : nullptr;
  const auto* group = groups && group_id ? groups->GetTabGroup(*group_id) : nullptr;
  const auto* features = group ? group->GetTabGroupFeatures() : nullptr;
  if (features && features->is_agent_group())
    return false;
  auto* contents = tab->GetContents();
  if (!contents)
    return false;
  GURL url = contents->GetVisibleURL();
  if (!url.is_valid())
    url = contents->GetLastCommittedURL();
  if (!url.is_valid())
    return false;
  BookmarkTabRepresentation representation{};
  if (!bookmarks.TakePendingNavigation(url, &representation))
    return false;
  if (representation.host.empty())
    representation.host = std::string(url.host());
  if (representation.host.empty())
    return false;
  const auto handle = tab->GetHandle();
  associations_.insert_or_assign(handle, representation);
  SetBookmarkTabRepresentation(contents, representation.node_id,
                               representation.host);
  Persist(*tab, representation);
  handles_fb0.erase(handle);
  return true;
}

void BookmarkTabAssociations::Reconcile(
    tabs::TabInterface* tab,
    const bookmarks::BookmarkModel* bookmark_model,
    bool suppress_missing_node_invalidation) {
  if (!tab) {
    return;
  }
  const auto found = associations_.find(tab->GetHandle());
  if (found == associations_.end()) {
    return;
  }
  if (!suppress_missing_node_invalidation && bookmark_model &&
      bookmark_model->loaded() &&
      !ContainsRepresentedNode(*bookmark_model, found->second.node_id)) {
    if (tab->GetContents()) {
      ClearBookmarkTabRepresentation(tab->GetContents());
    }
    PersistClear(*tab);
    associations_.erase(found);
    return;
  }
  if (!tab->GetContents()) {
    associations_.erase(found);
    return;
  }
  const auto current = GetBookmarkTabRepresentation(tab->GetContents());
  if (current == found->second) {
    return;
  }
  SetBookmarkTabRepresentation(tab->GetContents(), found->second.node_id,
                               found->second.host);
  Persist(*tab, found->second);
}

void BookmarkTabAssociations::RemoveForTab(tabs::TabInterface* tab) {
  if (!tab)
    return;
  const auto found = associations_.find(tab->GetHandle());
  if (found == associations_.end())
    return;
  associations_.erase(found);
  if (tab->GetContents())
    ClearBookmarkTabRepresentation(tab->GetContents());
  PersistClear(*tab);
}

void BookmarkTabAssociations::Persist(
    tabs::TabInterface& tab,
    const BookmarkTabRepresentation& representation) {
  // Source464ffb8 creates the real per-profile SessionService (factory create
  // flag1), then requires genuine positive window/tab SessionIDs. Do not use
  // TabHandle's integer value as a SessionID.
  if (!representation.node_id || representation.host.empty() ||
      !tab.GetContents()) {
    return;
  }
  SessionService* service =
      SessionServiceFactory::GetForProfile(browser_->GetProfile());
  const auto* helper =
      sessions::SessionTabHelper::FromWebContents(tab.GetContents());
  if (!service || !helper || helper->session_id().id() < 1 ||
      browser_->GetSessionID().id() < 1) {
    return;
  }
  service->AddTabExtraData(browser_->GetSessionID(), helper->session_id(),
                           kBookmarkTabRepresentationNodeId,
                           base::NumberToString(representation.node_id));
  service->AddTabExtraData(browser_->GetSessionID(), helper->session_id(),
                           kBookmarkTabRepresentationHost, representation.host);
}

void BookmarkTabAssociations::PersistClear(tabs::TabInterface& tab) {
  // Original464ef84 persists a tombstone; deleting only userdata would allow
  // the old valid representation to reappear on the next session restore.
  if (!tab.GetContents()) {
    return;
  }
  SessionService* service =
      SessionServiceFactory::GetForProfile(browser_->GetProfile());
  const auto* helper =
      sessions::SessionTabHelper::FromWebContents(tab.GetContents());
  if (!service || !helper || helper->session_id().id() < 1 ||
      browser_->GetSessionID().id() < 1) {
    return;
  }
  service->AddTabExtraData(browser_->GetSessionID(), helper->session_id(),
                           kBookmarkTabRepresentationNodeId, "0");
  service->AddTabExtraData(browser_->GetSessionID(), helper->session_id(),
                           kBookmarkTabRepresentationHost, "");
}

}  // namespace aux
