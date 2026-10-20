// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_sidebar_projection.h"
#include <map>
#include <utility>
#include "base/check.h"
#include "base/functional/bind.h"
#include "base/task/single_thread_task_runner.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/aux_chat_tab_owner.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/frame/aux_agent_session_tabs_view.h"
#include "chrome/browser/ui/views/frame/aux_bookmark_tab_associations.h"
#include "chrome/browser/ui/views/frame/aux_bookmarks_section.h"
#include "chrome/browser/ui/views/frame/aux_chats_controller.h"
#include "chrome/browser/ui/views/frame/aux_chats_section.h"
#include "chrome/browser/ui/views/frame/aux_ordinary_tab_projection.h"
#include "chrome/browser/ui/views/frame/aux_vertical_tab_bookmarks_view.h"
#include "chrome/browser/ui/views/tabs/common/tab_collection_node.h"
#include "chrome/browser/ui/views/tabs/vertical/vertical_pinned_tab_entries_view.h"
#include "components/bookmarks/browser/bookmark_model.h"
#include "components/prefs/pref_service.h"
namespace aux {
AuxSidebarProjection::AuxSidebarProjection(BrowserWindowInterface& browser,
    BookmarkTabAssociations& associations, VerticalTabBookmarksView& bookmarks,
    AuxChatsController& chats, VerticalPinnedTabEntriesView& pins,
    TabHoverCardController& hover, AgentSessionTabsView& agent,
    TabCollectionNode& root, base::RepeatingClosure changed)
    : browser_(browser.GetWeakPtr()), profile_(browser.GetProfile()->GetWeakPtr()),
      model_(browser.GetTabStripModel()), root_(&root), associations_(associations),
      bookmarks_(bookmarks), chats_(chats), agent_(agent),
      ordinary_(std::make_unique<AuxOrdinaryTabProjection>(browser, chats,
          associations, pins, hover, base::BindRepeating(
              &AgentSessionTabsView::RepresentsTab, base::Unretained(&agent)))),
      changed_(std::move(changed)) {
  CHECK(model_ && changed_);
  bookmark_tracker_.SetView(&bookmarks);
  agent_tracker_.SetView(&agent);
  pin_tracker_.SetView(&pins);
  root_destroyed_ = root.RegisterWillDestroyCallback(base::BindOnce(
      &AuxSidebarProjection::Retire, weak_.GetWeakPtr()));
}
AuxSidebarProjection::~AuxSidebarProjection() { Retire(); }
bool AuxSidebarProjection::ScopeCurrent() const {
  return !retired_ && browser_ && profile_ && model_ && root_ &&
      browser_->GetProfile() == profile_.get() &&
      browser_->GetTabStripModel() == model_ && bookmark_tracker_.view() &&
      agent_tracker_.view() && pin_tracker_.view();
}
void AuxSidebarProjection::Start() {
  if (!ScopeCurrent() || started_) return;
  CHECK(bookmarks_->parent() && agent_->parent());
  started_ = true;
  chats_->SetProjectionChangedCallback(base::BindRepeating(
      &AuxSidebarProjection::QueueRefresh, weak_.GetWeakPtr()));
  model_->AddObserver(this);
  if (auto* model = bookmarks_->bookmark_model()) bookmark_model_.Observe(model);
  prefs_.Init(profile_->GetPrefs());
  prefs_.Add(kBookmarksSectionEnabledPref, base::BindRepeating(
      &AuxSidebarProjection::QueueRefresh, weak_.GetWeakPtr()));
  Refresh();
}
void AuxSidebarProjection::QueueRefresh() {
  if (!ScopeCurrent() || !started_ || metadata_capture_ || refreshing_ || queued_) return;
  queued_ = true;
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce(&AuxSidebarProjection::Refresh, weak_.GetWeakPtr()));
}
void AuxSidebarProjection::Retire() {
  if (retired_) return;
  retired_ = true;
  weak_.InvalidateWeakPtrs();
  StopObservingAll(this);
  bookmark_model_.Reset();
  prefs_.Reset();
  ordinary_->Retire();
  root_destroyed_ = {};
  model_ = nullptr;
  root_ = nullptr;
}
void AuxSidebarProjection::BeginMetadataCapture() {
  if (!ScopeCurrent()) return;
  metadata_capture_ = true;
  model_changed_during_capture_ = false;
  restored_metadata_ = false;
}
void AuxSidebarProjection::DidRestoreMetadata() {
  if (ScopeCurrent()) restored_metadata_ = metadata_capture_;
}
void AuxSidebarProjection::FinishMetadataTransfer() {
  if (!ScopeCurrent() || !metadata_capture_) return;
  metadata_capture_ = false;
  auto weak = weak_.GetWeakPtr();
  Refresh();
  if (weak) {
    restored_metadata_ = false;
    model_changed_during_capture_ = false;
  }
}
bool AuxSidebarProjection::BookmarkRepresents(const tabs::TabInterface& tab) const {
  if (!profile_->GetPrefs()->GetBoolean(kBookmarksSectionEnabledPref)) return false;
  const auto handle = tab.GetHandle();
  auto& tasks = chats_->tabs();
  if (tab.IsPinned() || tab.GetSplit() || tasks.split_handles().contains(handle))
    return false;
  const auto task = tasks.Association(handle);
  if (!task && (tasks.represented_new_chat() == handle ||
                tasks.pending_new_chat() == handle)) return false;
  return !task && associations_->entries().contains(handle);
}
void AuxSidebarProjection::PublishBookmarks() {
  // Source462c2c0 creates a nodeID->handle projection in real model order;
  // first matching tab wins unless the actual active tab replaces it.
  std::map<int64_t, tabs::TabHandle> selected;
  const auto* active = model_->GetActiveTab();
  std::optional<int64_t> active_bookmark;
  for (int i = 0; i < model_->count(); ++i) {
    auto* tab = model_->GetTabAtIndex(i);
    if (!BookmarkRepresents(*tab)) continue;
    const auto found = associations_->entries().find(tab->GetHandle());
    CHECK(found != associations_->entries().end());
    const auto id = found->second.node_id;
    if (!selected.contains(id) || tab == active) selected.insert_or_assign(id, tab->GetHandle());
    if (tab == active) active_bookmark = id;
  }
  std::map<tabs::TabHandle, BookmarkTabRepresentation> published;
  for (const auto& [id, handle] : selected)
    published.emplace(handle, associations_->entries().at(handle));
  auto weak = weak_.GetWeakPtr();
  // The normal source publication explicitly clears its temporary URL list.
  // URLs are activation reuse exclusions, never bookmark ownership evidence.
  bookmarks_->SetExcludedUrls({});
  if (!weak || !ScopeCurrent()) return;
  bookmarks_->SetBookmarkTabAssociations(std::move(published));
  if (!weak || !ScopeCurrent()) return;
  bookmarks_->SetActiveBookmark(active_bookmark, active_bookmark.has_value());
  if (!weak || !ScopeCurrent()) return;
  std::optional<std::string> selected_chat;
  const auto* current_active = model_->GetActiveTab();
  if (current_active && !current_active->IsPinned() && !current_active->GetSplit() &&
      chats_->agent_installed() &&
      !chats_->tabs().split_handles().contains(current_active->GetHandle()) &&
      !chats_->tabs().ordinary_chat_tab_handles().contains(current_active->GetHandle()))
    selected_chat = chats_->tabs().Association(current_active->GetHandle());
  if (auto* section = chats_->section()) section->SetSelectedChat(selected_chat);
}
void AuxSidebarProjection::Refresh() {
  queued_ = false;
  if (!ScopeCurrent() || !started_ || metadata_capture_ || refreshing_) return;
  refreshing_ = true; // Source f90 rejects recursive publication.
  auto weak = weak_.GetWeakPtr();
  // Original active-first queue matching, then every remaining real tab until
  // the genuine inner queue empties. No fb0 insertion is inferred.
  if (bookmarks_->HasPendingNavigation()) {
    associations_->BindPendingNavigation(model_->GetActiveTab(), *bookmarks_, handles_fb0_);
    if (!weak || !ScopeCurrent()) return;
    for (int i = 0; i < model_->count() && bookmarks_->HasPendingNavigation(); ++i) {
      associations_->BindPendingNavigation(model_->GetTabAtIndex(i), *bookmarks_, handles_fb0_);
      if (!weak || !ScopeCurrent()) return;
    }
  }
  if (!bookmarks_->HasPendingNavigation()) handles_fb0_.clear();
  for (int i = 0; i < model_->count(); ++i) {
    auto* tab = model_->GetTabAtIndex(i);
    associations_->Import(tab);
    if (!weak || !ScopeCurrent()) return;
    associations_->Reconcile(tab, bookmarks_->bookmark_model(), restored_metadata_);
    if (!weak || !ScopeCurrent()) return;
  }
  chats_->tabs().Reconcile();
  if (!weak || !ScopeCurrent()) return;
  PublishBookmarks();
  if (!weak || !ScopeCurrent()) return;
  ordinary_->Update(*root_);
  if (!weak || !ScopeCurrent()) return;
  agent_->ActiveTabChanged(model_->GetActiveTab());
  if (!weak || !ScopeCurrent()) return;
  refreshing_ = false;
  changed_.Run();
}
void AuxSidebarProjection::BindOrRetainPending(tabs::TabInterface* tab) {
  if (!ScopeCurrent() || !tab || !bookmarks_->HasPendingNavigation()) return;
  auto weak = weak_.GetWeakPtr();
  const auto handle = tab->GetHandle();
  const bool bound = associations_->BindPendingNavigation(tab, *bookmarks_, handles_fb0_);
  if (!weak || !ScopeCurrent()) return;
  if (!bound && bookmarks_->HasPendingNavigation()) handles_fb0_.insert(handle);
}
void AuxSidebarProjection::OnTabStripModelChanged(TabStripModel*,
    const TabStripModelChange& change, const TabStripSelectionChange&) {
  if (!ScopeCurrent()) return;
  if (metadata_capture_) {
    model_changed_during_capture_ = true;
    return;
  }
  auto weak = weak_.GetWeakPtr();
  if (change.type() == TabStripModelChange::kInserted) {
    for (const auto& entry : change.GetInsert()->contents) {
      BindOrRetainPending(entry.tab);
      if (!weak || !ScopeCurrent()) return;
    }
  } else if (change.type() == TabStripModelChange::kReplaced) {
    BindOrRetainPending(change.GetReplace()->tab);
    if (!weak || !ScopeCurrent()) return;
  } else if (change.type() == TabStripModelChange::kRemoved) {
    for (const auto& entry : change.GetRemove()->contents)
      if (entry.tab) handles_fb0_.erase(entry.tab->GetHandle());
  }
  QueueRefresh();
}
void AuxSidebarProjection::OnTabChangedAt(tabs::TabInterface*, TabChangeType) { QueueRefresh(); }
void AuxSidebarProjection::OnTabStripModelDestroyed(TabStripModel*) { Retire(); }
void AuxSidebarProjection::TabGroupedStateChanged(TabStripModel*, std::optional<tab_groups::TabGroupId>,
    std::optional<tab_groups::TabGroupId>, tabs::TabInterface*, int) { QueueRefresh(); }
void AuxSidebarProjection::OnTabGroupChanged(const TabGroupChange&) { QueueRefresh(); }
void AuxSidebarProjection::OnSplitTabChanged(const SplitTabChange&) { QueueRefresh(); }
void AuxSidebarProjection::BookmarkModelLoaded(bool) { QueueRefresh(); }
void AuxSidebarProjection::BookmarkModelBeingDeleted() { bookmark_model_.Reset(); }
void AuxSidebarProjection::BookmarkNodeMoved(const bookmarks::BookmarkNode*, size_t,
    const bookmarks::BookmarkNode*, size_t) { QueueRefresh(); }
void AuxSidebarProjection::BookmarkNodeAdded(const bookmarks::BookmarkNode*, size_t, bool) { QueueRefresh(); }
void AuxSidebarProjection::BookmarkNodeRemoved(const bookmarks::BookmarkNode*, size_t,
    const bookmarks::BookmarkNode*, const std::set<GURL>&, const base::Location&) { QueueRefresh(); }
void AuxSidebarProjection::BookmarkNodeChanged(const bookmarks::BookmarkNode*) { QueueRefresh(); }
void AuxSidebarProjection::BookmarkNodeFaviconChanged(const bookmarks::BookmarkNode*) { QueueRefresh(); }
void AuxSidebarProjection::BookmarkNodeChildrenReordered(const bookmarks::BookmarkNode*) { QueueRefresh(); }
void AuxSidebarProjection::BookmarkAllUserNodesRemoved(const std::set<GURL>&, const base::Location&) { QueueRefresh(); }
}  // namespace aux
