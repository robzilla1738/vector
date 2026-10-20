// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_CHAT_ACTIONS_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_CHAT_ACTIONS_H_
#include <memory>
#include <optional>
#include <set>
#include <string>
#include <vector>
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "chrome/browser/ui/views/frame/aux_chats_model.h"
#include "ui/menus/simple_menu_model.h"
class BrowserWindowInterface;
class Profile;
namespace views { class View; class MenuRunner; }
namespace ui { class MouseEvent; }
namespace aux {
class AuxChatsTransport;
class AuxChatActions : public ui::SimpleMenuModel::Delegate {
 public:
  using CurrentAccount = base::RepeatingCallback<std::optional<int>()>;
  using OpenNewTab = base::RepeatingCallback<void(const std::string&)>;
  AuxChatActions(BrowserWindowInterface&, AuxChatsTransport&,
                 CurrentAccount, OpenNewTab, base::RepeatingClosure copied_toast);
  ~AuxChatActions() override;
  void SetChats(const std::vector<Chat>&);
  void ShowContext(views::View*, Chat, const ui::MouseEvent&);
  void Rename(const std::string&);
  void Archive(const std::string&);
  void Retire();
  bool IsCommandIdEnabled(int command) const override;
  void ExecuteCommand(int command, int event_flags) override;
 private:
  bool ScopeCurrent() const;
  const Chat* Find(const std::string&) const;
  bool IsBookmarked(const std::string&) const;
  void Bookmark(const std::string&);
  void ConfirmDelete(std::string);
  void MenuClosed(uint64_t);
  void RunCommand(std::string, int);
  void SetPinned(std::string, bool);
  base::WeakPtr<BrowserWindowInterface> browser_;
  base::WeakPtr<Profile> profile_;
  raw_ptr<AuxChatsTransport> transport_;
  CurrentAccount account_;
  OpenNewTab open_new_tab_;
  base::RepeatingClosure copied_toast_;
  std::vector<Chat> chats_;
  std::set<std::string> pin_requests_;
  std::optional<Chat> menu_chat_;
  int menu_command_ = 0;
  uint64_t menu_generation_ = 0;
  bool retired_ = false;
  std::unique_ptr<ui::SimpleMenuModel> model_;
  std::unique_ptr<views::MenuRunner> runner_;
  base::WeakPtrFactory<AuxChatActions> weak_{this};
};
}  // namespace aux
#endif
