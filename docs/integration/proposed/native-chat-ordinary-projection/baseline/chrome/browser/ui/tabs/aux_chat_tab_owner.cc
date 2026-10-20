// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/tabs/aux_chat_tab_owner.h"
#include <algorithm>
#include <utility>
#include "base/check.h"
#include "chrome/app/chrome_command_ids.h"
#include "chrome/browser/ui/browser_commands.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/navigator/browser_navigator.h"
#include "chrome/browser/ui/navigator/browser_navigator_params.h"
#include "chrome/browser/ui/tabs/aux_chat_tab_association.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/tabs/tab_enums.h"
#include "chrome/browser/ui/views/frame/aux_bookmark_tab_associations.h"
#include "chrome/browser/ui/views/frame/aux_chat_navigation.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/web_contents.h"
namespace aux {
AuxChatTabOwner::AuxChatTabOwner(BrowserWindowInterface& browser,
    TabStripModel& model, BookmarkTabAssociations& bookmarks,
    CurrentAccount account, Classify classify,
    SourceEffects effects, base::RepeatingClosure changed)
    : browser_(browser.GetWeakPtr()), profile_(browser.GetProfile()->GetWeakPtr()),
      model_(&model), bookmarks_(&bookmarks), effects_(std::move(effects)),
      account_(std::move(account)), classify_(std::move(classify)),
      changed_(std::move(changed)) {
  CHECK(account_ && classify_ && changed_ &&
        effects_.clear_1090 && effects_.expand_chats);
  CHECK(browser.GetTabStripModel() == &model);
  for (int i = 0; i < model_->count(); ++i) {
    auto* tab = model_->GetTabAtIndex(i);
    if (tab->GetSplit()) split_handles_.insert(tab->GetHandle());
  }
  model_->AddObserver(this);
}
AuxChatTabOwner::~AuxChatTabOwner() { Retire(); }
bool AuxChatTabOwner::ScopeCurrent() const {
  return !retired_ && browser_ && profile_ && model_ &&
         browser_->GetProfile() == profile_.get() && browser_->GetTabStripModel() == model_;
}
void AuxChatTabOwner::Retire() {
  retired_ = true;
  weak_.InvalidateWeakPtrs();
  StopObservingAll(this);
  model_ = nullptr;
  pending_selection_.reset();
  new_chat_timer_.Stop();
  pending_new_chat_.reset();
  represented_new_chat_.reset();
  clicked_new_chat_.reset();
}
void AuxChatTabOwner::SetChats(const std::vector<std::string>& ids) {
  if (!ScopeCurrent()) return;
  chats_ = std::set<std::string>(ids.begin(), ids.end());
  const bool previous = std::exchange(processing_snapshot_, true);
  auto weak = weak_.GetWeakPtr();
  Reconcile();
  // Reconcile notifies the genuine owner and may retire this section. Restore
  // only the surviving owner, including the original nested previous value.
  if (weak) processing_snapshot_ = previous;
}
int AuxChatTabOwner::Index(tabs::TabHandle handle) const {
  if (!ScopeCurrent()) return TabStripModel::kNoTab;
  for (int i = 0; i < model_->count(); ++i)
    if (model_->GetTabAtIndex(i)->GetHandle() == handle) return i;
  return TabStripModel::kNoTab;
}
std::optional<std::string> AuxChatTabOwner::Association(tabs::TabHandle handle) const {
  if (!ScopeCurrent() || Index(handle) == TabStripModel::kNoTab) return std::nullopt;
  auto found = associations_.find(handle);
  return found == associations_.end() ? std::nullopt : std::make_optional(found->second);
}
bool AuxChatTabOwner::Trackable(const tabs::TabInterface& tab,
                               const Classification& state) const {
  return state.agent_installed && !tab.IsPinned() && !tab.GetSplit() &&
         !state.handles_1090.contains(tab.GetHandle()) &&
         !split_handles_.contains(tab.GetHandle());
}
int AuxChatTabOwner::Find(const std::string& id, int account,
                         const Classification& state,
                         std::optional<tabs::TabHandle> excluded) const {
  // Original46385cc: active explicit association wins immediately; otherwise
  // LAST explicit match outranks active URL match, then first URL match.
  int explicit_match = TabStripModel::kNoTab;
  int active_url = TabStripModel::kNoTab;
  int first_url = TabStripModel::kNoTab;
  for (int i = 0; i < model_->count(); ++i) {
    auto* tab = model_->GetTabAtIndex(i);
    if (excluded == tab->GetHandle()) continue;
    auto found = associations_.find(tab->GetHandle());
    if (found != associations_.end() && found->second == id) {
      if (i == model_->active_index()) return i;
      explicit_match = i;
      continue;
    }
    if (state.handles_1090.contains(tab->GetHandle())) continue;
    if (ChatIdFromWebContents(*tab->GetContents(), account) == id) {
      if (i == model_->active_index()) active_url = i;
      if (first_url == TabStripModel::kNoTab) first_url = i;
    }
  }
  return explicit_match != TabStripModel::kNoTab ? explicit_match :
      active_url != TabStripModel::kNoTab ? active_url : first_url;
}
bool AuxChatTabOwner::Select(const std::string& id) {
  if (!ScopeCurrent() || id.empty()) return false;
  auto weak = weak_.GetWeakPtr();
  auto account = account_.Run();
  if (!weak || !ScopeCurrent() || !account) return false;
  auto state = classify_.Run();
  if (!weak || !ScopeCurrent() || !state) return false;
  std::optional<tabs::TabHandle> previous;
  if (auto* active = model_->GetActiveTab()) previous = active->GetHandle();
  const int existing = Find(id, *account, *state);
  if (existing != TabStripModel::kNoTab) {
    auto* tab = model_->GetTabAtIndex(existing);
    if (Trackable(*tab, *state)) {
      pending_selection_ = PendingSelection{id, previous, tab->GetHandle(), false};
      pending_navigation_.erase(tab->GetHandle());
      associations_[tab->GetHandle()] = id;
      associated_at_[tab->GetHandle()] = base::TimeTicks::Now();
    }
    model_->ActivateTabAt(existing);
    if (weak && ScopeCurrent()) changed_.Run();
    return true;
  }
  if (!state->agent_installed) return false;
  NavigateParams params(browser_.get(), ChatURL(*account, id), ui::PAGE_TRANSITION_LINK);
  params.disposition = WindowOpenDisposition::NEW_FOREGROUND_TAB;
  Navigate(&params);
  if (!weak || !ScopeCurrent()) return false;
  auto* contents = params.navigated_or_inserted_contents.get();
  const int index = contents ? model_->GetIndexOfWebContents(contents) : TabStripModel::kNoTab;
  if (index == TabStripModel::kNoTab) return false;
  auto* tab = model_->GetTabAtIndex(index);
  if (Trackable(*tab, *state)) {
    pending_selection_ = PendingSelection{id, previous, tab->GetHandle(), true};
    associations_[tab->GetHandle()] = id;
    pending_navigation_[tab->GetHandle()] = id;
    associated_at_[tab->GetHandle()] = base::TimeTicks::Now();
  }
  changed_.Run();
  return true;
}
bool AuxChatTabOwner::OpenInNewTab(const std::string& id) {
  if (!ScopeCurrent() || id.empty()) return false;
  auto weak = weak_.GetWeakPtr();
  auto account = account_.Run();
  if (!weak || !ScopeCurrent() || !account) return false;
  NavigateParams params(browser_.get(), ChatURL(*account, id), ui::PAGE_TRANSITION_LINK);
  params.disposition = WindowOpenDisposition::NEW_FOREGROUND_TAB;
  Navigate(&params);
  return weak && ScopeCurrent() && params.navigated_or_inserted_contents;
}
bool AuxChatTabOwner::IsNewChat(tabs::TabInterface& tab) {
  auto weak = weak_.GetWeakPtr();
  const auto state = classify_.Run();
  if (!weak || !ScopeCurrent() || !state || !Trackable(tab, *state)) return false;
  return IsNewChatDocument(*tab.GetContents(), *profile_);
}
void AuxChatTabOwner::SelectNewChat() {
  if (!ScopeCurrent()) return;
  const bool had_representation = represented_new_chat_.has_value();
  auto weak = weak_.GetWeakPtr();
  // Original c7859a8 deliberately ignores command success; it only records an
  // actual resulting active tab if the genuine source predicate accepts it.
  chrome::ExecuteCommand(browser_.get(), IDC_AUX_OPEN_NEW_CHAT);
  if (!weak || !ScopeCurrent()) return;
  if (!had_representation) {
    if (auto* tab = model_->GetActiveTab()) {
      const auto handle = tab->GetHandle();
      const bool eligible = IsNewChat(*tab);
      if (!weak || !ScopeCurrent()) return;
      if (eligible && Index(handle) != TabStripModel::kNoTab)
        clicked_new_chat_ = handle;
    }
  }
  Reconcile();
}
bool AuxChatTabOwner::represented_new_chat_active() const {
  if (!ScopeCurrent() || !represented_new_chat_) return false;
  auto* active = model_->GetActiveTab();
  return active && active->GetHandle() == *represented_new_chat_;
}
void AuxChatTabOwner::ClearPendingNewChat(tabs::TabHandle handle) {
  if (pending_new_chat_ != handle) return;
  new_chat_timer_.Stop();
  pending_new_chat_.reset();
}
void AuxChatTabOwner::SchedulePendingNewChat(tabs::TabHandle handle) {
  if (!ScopeCurrent() || Index(handle) == TabStripModel::kNoTab) return;
  // Original1060 is the timer's delayed-task handle delegate, not WebContents
  // loading state. Repeated reconciliation retains the existing live deadline.
  if (pending_new_chat_ == handle && new_chat_timer_.IsRunning()) return;
  pending_new_chat_ = handle;
  new_chat_timer_.Start(FROM_HERE, base::Milliseconds(1250), this,
                       &AuxChatTabOwner::PendingNewChatExpired);
}
void AuxChatTabOwner::PendingNewChatExpired() {
  if (!ScopeCurrent() || !pending_new_chat_) return;
  const auto handle = *pending_new_chat_;
  pending_new_chat_.reset();
  if (clicked_new_chat_ == handle) clicked_new_chat_.reset();
  if (represented_new_chat_ == handle) represented_new_chat_.reset();
  Reconcile();
}
bool AuxChatTabOwner::RepresentsNewChat(tabs::TabHandle handle, int account) {
  const int index = Index(handle);
  if (index == TabStripModel::kNoTab || associations_.contains(handle)) return false;
  auto weak = weak_.GetWeakPtr();
  const bool new_chat = IsNewChat(*model_->GetTabAtIndex(index));
  if (!weak || !ScopeCurrent()) return false;
  if (new_chat) {
    ClearPendingNewChat(handle);
    return true;
  }
  if (pending_new_chat_ == handle) return true;
  if (represented_new_chat_ != handle) return false;
  const int current = Index(handle);
  if (current == TabStripModel::kNoTab) return false;
  const auto id = ChatIdFromWebContents(*model_->GetWebContentsAt(current), account);
  if (!id || chats_.contains(*id)) return false;
  SchedulePendingNewChat(handle);
  return true;
}
void AuxChatTabOwner::RefreshRepresentedNewChat(int account) {
  auto weak = weak_.GetWeakPtr();
  std::optional<tabs::TabHandle> selected;
  auto consider = [&](tabs::TabHandle handle) {
    if (RepresentsNewChat(handle, account)) selected = handle;
  };
  if (auto* active = model_->GetActiveTab()) consider(active->GetHandle());
  if (!weak || !ScopeCurrent()) return;
  if (!selected && represented_new_chat_) consider(*represented_new_chat_);
  if (!weak || !ScopeCurrent()) return;
  if (!selected) {
    // Source464646c priority: active, previous representation, model order.
    std::vector<tabs::TabHandle> handles;
    for (int i = 0; i < model_->count(); ++i)
      handles.push_back(model_->GetTabAtIndex(i)->GetHandle());
    for (auto handle : handles) {
      consider(handle);
      if (!weak || !ScopeCurrent()) return;
      if (selected) break;
    }
  }
  represented_new_chat_ = selected;
  if (pending_new_chat_ && pending_new_chat_ != selected) {
    new_chat_timer_.Stop();
    pending_new_chat_.reset();
  }
}
void AuxChatTabOwner::Clear(tabs::TabHandle handle) {
  associations_.erase(handle);
  pending_navigation_.erase(handle);
  associated_at_.erase(handle);
}
void AuxChatTabOwner::SettleForRename(const std::string& id) {
  if (!ScopeCurrent() || !pending_selection_) return;
  auto selection = std::exchange(pending_selection_, std::nullopt);
  if (selection->id != id) return;
  auto weak = weak_.GetWeakPtr();
  // Close authority comes exclusively from the exact handle this owner created
  // for this first click. A route match never authorizes closing a user tab.
  if (selection->created) {
    const int index = Index(selection->selected);
    if (index != TabStripModel::kNoTab) {
      Clear(selection->selected);
      effects_.clear_1090.Run(selection->selected);
      if (!weak || !ScopeCurrent()) return;
      model_->CloseWebContentsAt(index, CLOSE_USER_GESTURE);
      if (!weak || !ScopeCurrent()) return;
    }
  }
  if (selection->previous) {
    int index = Index(*selection->previous);
    if (index != TabStripModel::kNoTab) {
      model_->ActivateTabAt(index);
      if (!weak || !ScopeCurrent()) return;
    }
  }
  changed_.Run();
}
void AuxChatTabOwner::ReconcileTab(tabs::TabInterface& tab, int account) {
  auto weak = weak_.GetWeakPtr();
  const bool new_chat = IsNewChat(tab);
  if (!weak || !ScopeCurrent()) return;
  const auto handle = tab.GetHandle();
  if (new_chat) {
    Clear(handle);
    effects_.clear_1090.Run(handle);
    return;
  }
  auto id = ChatIdFromWebContents(*tab.GetContents(), account);
  if (id) {
    pending_navigation_.erase(handle);
    if (chats_.contains(*id)) {
      auto state = classify_.Run();
      if (!weak || !ScopeCurrent() || !state) return;
      Bind(tab, *id, account, *state);
    }
    return;
  }
  if (pending_navigation_.contains(handle) && associations_.contains(handle)) return;
  if (associations_.contains(handle) &&
      !tab.GetContents()->GetController().GetLastCommittedEntry()) return;
  Clear(handle);
  effects_.clear_1090.Run(handle);
}
void AuxChatTabOwner::Reconcile() {
  if (!ScopeCurrent()) return;
  auto weak = weak_.GetWeakPtr();
  auto account = account_.Run();
  if (!weak || !ScopeCurrent() || !account) return;
  std::set<tabs::TabHandle> live;
  for (int i = 0; i < model_->count(); ++i) {
    auto* tab = model_->GetTabAtIndex(i);
    live.insert(tab->GetHandle());
    ReconcileTab(*tab, *account);
    if (!weak || !ScopeCurrent()) return;
  }
  std::erase_if(associations_, [&](const auto& entry) { return !live.contains(entry.first); });
  std::erase_if(pending_navigation_, [&](const auto& entry) { return !live.contains(entry.first); });
  std::erase_if(associated_at_, [&](const auto& entry) { return !live.contains(entry.first); });
  RefreshRepresentedNewChat(*account);
  if (!weak || !ScopeCurrent()) return;
  changed_.Run();
}
std::optional<std::string> AuxChatTabOwner::SelectedChat() {
  if (!ScopeCurrent()) return std::nullopt;
  auto* tab = model_->GetActiveTab();
  if (!tab) return std::nullopt;
  auto pending = pending_navigation_.find(tab->GetHandle());
  if (pending != pending_navigation_.end() && !pending->second.empty()) return pending->second;
  if (auto id = Association(tab->GetHandle()); id && !id->empty()) return id;
  const auto handle = tab->GetHandle();
  auto weak = weak_.GetWeakPtr();
  auto account = account_.Run();
  if (!weak || !ScopeCurrent() || !account) return std::nullopt;
  const int index = Index(handle);
  return index != TabStripModel::kNoTab
      ? ChatIdFromWebContents(*model_->GetTabAtIndex(index)->GetContents(), *account)
      : std::nullopt;
}
void AuxChatTabOwner::Bind(tabs::TabInterface& tab, const std::string& id,
                           int account, const Classification& state) {
  // Original464e4b8 first removes pending navigation, including on rejection.
  const auto handle = tab.GetHandle();
  pending_navigation_.erase(handle);
  auto prior = associations_.find(handle);
  const bool same = prior != associations_.end() && prior->second == id;
  if (!Trackable(tab, state) || !chats_.contains(id)) {
    Clear(handle);
    return;
  }
  auto weak = weak_.GetWeakPtr();
  ClearPendingNewChat(handle);
  if (!weak || !ScopeCurrent() || Index(handle) == TabStripModel::kNoTab) return;
  const bool represented_bookmark = bookmarks_->entries().contains(handle);
  if (same && !represented_bookmark) {
    associated_at_.try_emplace(handle, base::TimeTicks::Now());
    return;
  }
  if (represented_bookmark) {
    bookmarks_->RemoveForTab(&tab);
    if (!weak || !ScopeCurrent() || Index(handle) == TabStripModel::kNoTab) return;
  }
  if (same) return;
  // Original excludes this exact handle and refuses duplicate task projection.
  // It never closes the duplicate tab as a side effect of reconciliation.
  if (Find(id, account, state, handle) != TabStripModel::kNoTab) {
    Clear(handle);
  } else {
    associations_[handle] = id;
    associated_at_[handle] = base::TimeTicks::Now();
  }
  if (!processing_snapshot_ && !state.suppress_auto_expansion)
    effects_.expand_chats.Run();
}
void AuxChatTabOwner::OnTabStripModelChanged(TabStripModel*,
    const TabStripModelChange&, const TabStripSelectionChange&) { Reconcile(); }
void AuxChatTabOwner::OnTabChangedAt(tabs::TabInterface*, TabChangeType) { Reconcile(); }
void AuxChatTabOwner::OnSplitTabChanged(const SplitTabChange& change) {
  if (!ScopeCurrent() || change.model != model_) return;
  auto add = [this](const auto& tabs) {
    for (const auto& [tab, index] : tabs)
      if (tab) split_handles_.insert(tab->GetHandle());
  };
  auto remove = [this](const auto& tabs) {
    for (const auto& [tab, index] : tabs)
      if (tab) split_handles_.erase(tab->GetHandle());
  };
  // Original4647a28: actual split added/changed/removed payloads, not tab titles.
  switch (change.type) {
    case SplitTabChange::Type::kAdded:
      add(change.GetAddedChange()->tabs());
      break;
    case SplitTabChange::Type::kContentsChanged:
      remove(change.GetContentsChange()->prev_tabs());
      add(change.GetContentsChange()->new_tabs());
      break;
    case SplitTabChange::Type::kRemoved:
      remove(change.GetRemovedChange()->tabs());
      break;
    case SplitTabChange::Type::kVisualsChanged:
      break;
  }
  changed_.Run();
}
void AuxChatTabOwner::OnTabStripModelDestroyed(TabStripModel* model) {
  if (model_ == model) Retire();
}
}  // namespace aux
