// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_CHATS_CONTROLLER_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_CHATS_CONTROLLER_H_
#include <memory>
#include <optional>
#include <string>
#include <vector>
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/memory/raw_ptr.h"
#include "chrome/browser/ui/tabs/tab_strip_model_observer.h"
#include "base/scoped_observation.h"
#include "extensions/browser/extension_registry.h"
#include "extensions/browser/extension_registry_observer.h"
#include "chrome/browser/ui/views/frame/aux_chats_model.h"
#include "ui/views/view_tracker.h"
class BrowserWindowInterface;
class Profile;
class TabStripModel;
namespace ui { class MouseEvent; }
namespace aux {
class AuxChatActions;
class AuxChatTabOwner;
class AuxChatsHeaderActions;
class AuxChatsSection;
class AuxChatsTransport;
class BookmarkTabAssociations;
// Same-window owner for the original region's Chats section, request lifetime,
// menu actions and task/NewChat projection. The section itself is mounted as a
// genuine direct body child; this controller adds no view or replacement UI.
class AuxChatsController final : public extensions::ExtensionRegistryObserver,
                                 public TabStripModelObserver {
 public:
  using Changed = base::RepeatingClosure;
  AuxChatsController(BrowserWindowInterface&, BookmarkTabAssociations&,
                     std::u16string shortcut_help, Changed projection_changed);
  ~AuxChatsController();
  AuxChatsController(const AuxChatsController&) = delete;
  AuxChatsController& operator=(const AuxChatsController&) = delete;
  std::unique_ptr<AuxChatsSection> TakeSection();
  AuxChatsSection* section();
  AuxChatTabOwner& tabs();
  const std::vector<Chat>& chats() const { return chats_; }
  bool agent_installed() const { return agent_installed_; }
  // Mount first; start only once the real section is in the actual region.
  void Start();
  void Refresh();
  // Call before profile identity changes or body removal. Recreate against the
  // actual current profile for commit/abort; old request/menu callbacks retire.
  void Retire();
 private:
  bool ScopeCurrent() const;
  std::optional<int> CurrentAccount() const;
  void ChatsUpdated(const std::vector<Chat>&);
  void ProjectionChanged();
  void ExpandChats();
  void Select(const std::string&);
  void SelectNewChat();
  void Rename(const std::string&);
  void Archive(const std::string&);
  void OpenInNewTab(const std::string&);
  void ShowContext(views::View*, Chat, const ui::MouseEvent&);
  void ShowHeaderContext(views::View*, const ui::MouseEvent&);
  void ShowAll();
  void UpdateAgentState();
  void OnTabStripModelDestroyed(TabStripModel*) override;
  void OnExtensionLoaded(content::BrowserContext*, const extensions::Extension*) override;
  void OnExtensionUnloaded(content::BrowserContext*, const extensions::Extension*,
                           extensions::UnloadedExtensionReason) override;
  void OnShutdown(extensions::ExtensionRegistry*) override;
  base::ScopedObservation<extensions::ExtensionRegistry,
                          extensions::ExtensionRegistryObserver> registry_{this};
  base::WeakPtr<BrowserWindowInterface> browser_;
  base::WeakPtr<Profile> profile_;
  raw_ptr<TabStripModel> model_;
  Changed changed_;
  std::vector<Chat> chats_;
  std::unique_ptr<AuxChatsSection> unmounted_section_;
  views::ViewTracker section_tracker_;
  std::unique_ptr<AuxChatsTransport> transport_;
  std::unique_ptr<AuxChatTabOwner> tabs_;
  std::unique_ptr<AuxChatActions> actions_;
  std::unique_ptr<AuxChatsHeaderActions> header_actions_;
  bool retired_ = false;
  bool started_ = false;
  bool agent_installed_ = false;
  bool applying_snapshot_ = false;
  base::WeakPtrFactory<AuxChatsController> weak_{this};
};
}  // namespace aux
#endif
