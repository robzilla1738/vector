// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_VIEWS_TABS_VERTICAL_VERTICAL_PINNED_TAB_ENTRIES_VIEW_H_
#define CHROME_BROWSER_UI_VIEWS_TABS_VERTICAL_VERTICAL_PINNED_TAB_ENTRIES_VIEW_H_

#include <map>
#include <memory>
#include <optional>
#include <string>
#include <vector>

#include "base/callback_list.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "chrome/browser/ui/tabs/aux_pinned_tab_entries.h"
#include "chrome/browser/ui/tabs/tab_strip_model_observer.h"
#include "components/prefs/pref_change_registrar.h"
#include "ui/base/metadata/metadata_header_macros.h"
#include "ui/base/models/image_model.h"
#include "ui/menus/simple_menu_model.h"
#include "ui/views/view.h"

class BrowserWindowInterface;
class TabStripModel;
class TabContextMenuController;
class ExpandOnHoverLock;
namespace views {
class MenuRunner;
}

// The supplied saved-entry leaf, distinct from stock live pinned-tab views.
class VerticalPinnedTabEntriesView : public views::View,
                                     public TabStripModelObserver,
                                     public ui::SimpleMenuModel::Delegate {
  METADATA_HEADER(VerticalPinnedTabEntriesView, views::View)
 public:
  explicit VerticalPinnedTabEntriesView(BrowserWindowInterface* browser);
  ~VerticalPinnedTabEntriesView() override;

  void SetCompactPresentation(bool compact);
  void SetLayoutWidthOverride(std::optional<int> width);
  // Retire real old profile observers before same-window owner rebind.
  void PauseForProfileSwitch();
  void RebindAfterProfileSwitch();

  gfx::Size CalculatePreferredSize(
      const views::SizeBounds& available) const override;
  void Layout(PassKey) override;

  void OnTabStripModelChanged(TabStripModel*,
                              const TabStripModelChange&,
                              const TabStripSelectionChange&) override;
  void OnTabChangedAt(tabs::TabInterface*, TabChangeType) override;
  void OnTabPinnedStateChanged(tabs::TabInterface*, int) override;
  void OnTabStripModelDestroyed(TabStripModel*) override;

 private:
  class EntryView;
  struct Entry {
    aux::PinnedTabEntry saved;
    std::optional<int> live_index;
    std::u16string title;
    ui::ImageModel image;
    bool active = false;
  };
  void BindProfile();
  void ScheduleRefresh();
  void Refresh();
  void Activate(size_t index);
  void Close(size_t index);
  void ShowContextMenu(size_t index, const gfx::Point& point);
  void CancelContextMenu();
  bool IsCommandIdEnabled(int command_id) const override;
  void ExecuteCommand(int command_id, int event_flags) override;
  void MenuClosed(ui::SimpleMenuModel* source) override;
  int Columns(const views::SizeBound& width) const;
  gfx::Rect EntryBounds(size_t index) const;

  const raw_ptr<BrowserWindowInterface> browser_;
  raw_ptr<TabStripModel> model_ = nullptr;
  PrefChangeRegistrar pref_changes_;
  std::vector<base::CallbackListSubscription> ui_changes_;
  std::vector<Entry> entries_;
  std::map<std::string, ui::ImageModel> icon_cache_;
  std::unique_ptr<TabContextMenuController> live_menu_;
  std::unique_ptr<ExpandOnHoverLock> menu_hover_lock_;
  GURL menu_url_;
  std::unique_ptr<ui::SimpleMenuModel> menu_model_;
  std::unique_ptr<views::MenuRunner> menu_runner_;
  bool compact_ = false;
  std::optional<int> width_override_;
  bool paused_ = false;
  bool refresh_pending_ = false;
  base::WeakPtrFactory<VerticalPinnedTabEntriesView> weak_factory_{this};
};

#endif  // CHROME_BROWSER_UI_VIEWS_TABS_VERTICAL_VERTICAL_PINNED_TAB_ENTRIES_VIEW_H_
