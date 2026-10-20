// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_CHATS_HEADER_ACTIONS_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_CHATS_HEADER_ACTIONS_H_
#include <memory>
#include "base/memory/weak_ptr.h"
#include "ui/menus/simple_menu_model.h"
class BrowserWindowInterface;
class Profile;
namespace views { class View; class MenuRunner; }
namespace ui { class MouseEvent; }
namespace aux {
class AuxChatsTransport;
class AuxChatsHeaderActions final : public ui::SimpleMenuModel::Delegate {
 public:
  AuxChatsHeaderActions(BrowserWindowInterface&, AuxChatsTransport&);
  ~AuxChatsHeaderActions() override;
  void ShowContext(views::View*, const ui::MouseEvent&);
  void Retire();
  bool IsCommandIdEnabled(int command) const override;
  void ExecuteCommand(int command, int event_flags) override;
 private:
  bool ScopeCurrent() const;
  void MenuClosed(uint64_t generation);
  void RunCommand(int command);
  base::WeakPtr<BrowserWindowInterface> browser_;
  base::WeakPtr<Profile> profile_;
  raw_ptr<AuxChatsTransport> transport_;
  bool retired_ = false;
  uint64_t generation_ = 0;
  int command_ = 0;
  std::unique_ptr<ui::SimpleMenuModel> model_;
  std::unique_ptr<views::MenuRunner> runner_;
  base::WeakPtrFactory<AuxChatsHeaderActions> weak_{this};
};
}  // namespace aux
#endif
