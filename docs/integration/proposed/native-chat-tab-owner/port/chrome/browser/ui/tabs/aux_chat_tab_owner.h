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
    std::set<tabs::TabHandle> handles_10d8;
  };
  using CurrentAccount = base::RepeatingCallback<std::optional<int>()>;
  using Classify = base::RepeatingCallback<std::optional<Classification>()>;
  using IsNewChat = base::RepeatingCallback<bool(tabs::TabInterface&)>;
  struct SourceEffects {
    base::RepeatingCallback<void(tabs::TabHandle)> clear_1090;
    // Must clear source +1028/+1030 only when its real handle matches.
    base::RepeatingCallback<void(tabs::TabHandle)> clear_pending_1028;
    base::RepeatingClosure expand_chats;
  };
  AuxChatTabOwner(BrowserWindowInterface&, TabStripModel&, BookmarkTabAssociations&,
                 CurrentAccount, Classify, IsNewChat, SourceEffects,
                 base::RepeatingClosure changed);
  ~AuxChatTabOwner() override;
  void SetChats(const std::vector<std::string>& ids);
  bool Select(const std::string& id);
  bool OpenInNewTab(const std::string& id);
  // Called before opening the original rename dialog, including double click.
  void SettleForRename(const std::string& id);
  std::optional<std::string> SelectedChat();
  std::optional<std::string> Association(tabs::TabHandle) const;
  void Reconcile();
  void Retire();
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
  bool Trackable(const tabs::TabInterface&, const Classification&) const;
  void Clear(tabs::TabHandle);
  void ReconcileTab(tabs::TabInterface&, int account);
  void OnTabStripModelChanged(TabStripModel*, const TabStripModelChange&,
                             const TabStripSelectionChange&) override;
  void OnTabChangedAt(tabs::TabInterface*, TabChangeType) override;
  void OnTabStripModelDestroyed(TabStripModel*) override;
  base::WeakPtr<BrowserWindowInterface> browser_;
  base::WeakPtr<Profile> profile_;
  raw_ptr<TabStripModel> model_;
  raw_ptr<BookmarkTabAssociations> bookmarks_;
  SourceEffects effects_;
  CurrentAccount account_;
  Classify classify_;
  IsNewChat is_new_chat_;
  base::RepeatingClosure changed_;
  std::set<std::string> chats_;
  std::map<tabs::TabHandle, std::string> associations_;  // Original +fc8.
  std::map<tabs::TabHandle, std::string> pending_navigation_;  // +1000.
  std::map<tabs::TabHandle, base::TimeTicks> associated_at_;  // +10a8.
  std::optional<PendingSelection> pending_selection_;  // +13d0.
  bool retired_ = false;
  base::WeakPtrFactory<AuxChatTabOwner> weak_{this};
};
}  // namespace aux
#endif
