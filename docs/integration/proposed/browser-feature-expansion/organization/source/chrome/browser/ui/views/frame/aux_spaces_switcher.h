// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SPACES_SWITCHER_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SPACES_SWITCHER_H_
#include <memory>
#include <string>
#include <vector>
#include "base/callback_list.h"
#include "base/memory/raw_ref.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "base/time/time.h"
#include "ui/menus/simple_menu_model.h"
#include "ui/views/view.h"
class BrowserWindowInterface;
namespace views { class LabelButton; class MenuRunner; }
namespace aux {
class OrganizationWindowDelegate;
// Mounted inside the existing Tabs header accessory, never over webpage scroll.
class AuxSpacesSwitcher final : public views::View,
                                public ui::SimpleMenuModel::Delegate {
  METADATA_HEADER(AuxSpacesSwitcher, views::View)
 public:
  AuxSpacesSwitcher(BrowserWindowInterface&, OrganizationWindowDelegate&);
  ~AuxSpacesSwitcher() override;
  bool OnMouseWheel(const ui::MouseWheelEvent&) override;
  void OnScrollEvent(ui::ScrollEvent*) override;
  bool OnKeyPressed(const ui::KeyEvent&) override;
  void ExecuteCommand(int command_id, int event_flags) override;
  void Refresh();
 private:
  void Bind();
  void ShowMenu();
  void Edit(bool create);
  void NewFolder(bool global);
  void OnThemeChanged() override;
  bool Step(int direction);
  void Scroll(float amount, bool new_gesture);
  base::WeakPtr<BrowserWindowInterface> browser_;
  raw_ref<OrganizationWindowDelegate> window_;
  raw_ptr<views::LabelButton> select_ = nullptr;
  raw_ptr<views::LabelButton> add_ = nullptr;
  std::vector<std::string> menu_spaces_;
  std::unique_ptr<ui::SimpleMenuModel> menu_;
  std::unique_ptr<views::MenuRunner> runner_;
  base::CallbackListSubscription ready_, changes_, window_changes_;
  base::TimeTicks last_scroll_;
  float scroll_amount_ = 0;
  bool stepped_ = false;
  base::WeakPtrFactory<AuxSpacesSwitcher> weak_{this};
};
}  // namespace aux
#endif
