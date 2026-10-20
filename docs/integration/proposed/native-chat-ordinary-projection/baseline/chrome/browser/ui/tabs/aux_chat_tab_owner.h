// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_TABS_AUX_CHAT_TAB_OWNER_H_
#define CHROME_BROWSER_UI_TABS_AUX_CHAT_TAB_OWNER_H_
#include <map>
#include <optional>
#include <set>
#include <string>
#include <vector>
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/time/time.h"
#include "base/timer/timer.h"
#include "chrome/browser/ui/tabs/tab_strip_model_observer.h"
#include "components/tabs/public/tab_interface.h"
class BrowserWindowInterface;
class Profile;
namespace aux {
class BookmarkTabAssociations;
// Real task association is separate from agent-created-tab ownership. These
// sets retain the original region identities until their producers are bound.
class AuxChatTabOwner final : public TabStripModelObserver {
 public:
  struct Classification {
    bool agent_installed = false;
    bool suppress_auto_expansion = false;  // Original source +11e9.
    std::set<tabs::TabHandle> handles_1090;
  };
  using CurrentAccount = base::RepeatingCallback<std::optional<int>()>;
  using Classify = base::RepeatingCallback<std::optional<Classification>()>;
  struct SourceEffects {
    base::RepeatingCallback<void(tabs::TabHandle)> clear_1090;
    base::RepeatingClosure expand_chats;
  };
  AuxChatTabOwner(BrowserWindowInterface&, TabStripModel&, BookmarkTabAssociations&,
                 CurrentAccount, Classify, SourceEffects,
                 base::RepeatingClosure changed);
  ~AuxChatTabOwner() override;
  void SetChats(const std::vector<std::string>& ids);
  bool Select(const std::string& id);
  void SelectNewChat();
  std::optional<tabs::TabHandle> represented_new_chat() const {
    return ScopeCurrent() ? represented_new_chat_ : std::nullopt;
  }
  std::optional<tabs::TabHandle> clicked_new_chat() const {
    return ScopeCurrent() ? clicked_new_chat_ : std::nullopt;
  }
  bool represented_new_chat_active() const;
  bool OpenInNewTab(const std::string& id);
  // Called before opening the original rename dialog, including double click.
  void SettleForRename(const std::string& id);
  std::optional<std::string> SelectedChat();
  std::optional<std::string> Association(tabs::TabHandle) const;
  void Reconcile();
  void Retire();
  const std::set<tabs::TabHandle>& split_handles() const { return split_handles_; }
 private:
  struct PendingSelection {
    std::string id;
    std::optional<tabs::TabHandle> previous;
    tabs::TabHandle selected;
    bool created;
  };
  bool ScopeCurrent() const;
  int Index(tabs::TabHandle) const;
  int Find(const std::string&, int account, const Classification&,
           std::optional<tabs::TabHandle> excluded = std::nullopt) const;
  void Bind(tabs::TabInterface&, const std::string&, int account,
            const Classification&);
  bool IsNewChat(tabs::TabInterface&);
  bool Trackable(const tabs::TabInterface&, const Classification&) const;
  void Clear(tabs::TabHandle);
  bool RepresentsNewChat(tabs::TabHandle, int account);
  void RefreshRepresentedNewChat(int account);
  void SchedulePendingNewChat(tabs::TabHandle);
  void ClearPendingNewChat(tabs::TabHandle);
  void PendingNewChatExpired();
  void ReconcileTab(tabs::TabInterface&, int account);
  void OnTabStripModelChanged(TabStripModel*, const TabStripModelChange&,
                             const TabStripSelectionChange&) override;
  void OnTabChangedAt(tabs::TabInterface*, TabChangeType) override;
  void OnTabStripModelDestroyed(TabStripModel*) override;
  void OnSplitTabChanged(const SplitTabChange&) override;
  base::WeakPtr<BrowserWindowInterface> browser_;
  base::WeakPtr<Profile> profile_;
  raw_ptr<TabStripModel> model_;
  raw_ptr<BookmarkTabAssociations> bookmarks_;
  SourceEffects effects_;
  CurrentAccount account_;
  Classify classify_;
  base::RepeatingClosure changed_;
  std::set<std::string> chats_;
  std::set<tabs::TabHandle> split_handles_;  // Original +10d8.
  std::map<tabs::TabHandle, std::string> associations_;  // Original +fc8.
  std::map<tabs::TabHandle, std::string> pending_navigation_;  // +1000.
  std::map<tabs::TabHandle, base::TimeTicks> associated_at_;  // +10a8.
  std::optional<PendingSelection> pending_selection_;  // +13d0.
  std::optional<tabs::TabHandle> clicked_new_chat_;  // Original +1018.
  std::optional<tabs::TabHandle> represented_new_chat_;  // Original +1020.
  std::optional<tabs::TabHandle> pending_new_chat_;  // Original +1028.
  base::OneShotTimer new_chat_timer_;  // Original +1030, 1250ms.
  bool processing_snapshot_ = false;  // Original region +11e9.
  bool retired_ = false;
  base::WeakPtrFactory<AuxChatTabOwner> weak_{this};
};
}  // namespace aux
#endif
