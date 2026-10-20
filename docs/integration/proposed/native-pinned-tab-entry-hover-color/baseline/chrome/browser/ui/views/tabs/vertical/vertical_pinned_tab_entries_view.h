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
#include "base/functional/callback.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "chrome/browser/ui/tabs/aux_pinned_tab_entries.h"
#include "chrome/browser/ui/tabs/tab_strip_model_observer.h"
#include "components/prefs/pref_change_registrar.h"
#include "components/tabs/public/tab_interface.h"
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
class Widget;
}

// The supplied saved-entry leaf, distinct from stock live pinned-tab views.
class VerticalPinnedTabEntriesView : public views::View,
                                     public TabStripModelObserver,
                                     public ui::SimpleMenuModel::Delegate {
  METADATA_HEADER(VerticalPinnedTabEntriesView, views::View)
 public:
  explicit VerticalPinnedTabEntriesView(BrowserWindowInterface* browser);
  ~VerticalPinnedTabEntriesView() override;

  struct EntryDragData {
    aux::PinnedTabEntry saved;
    std::u16string title;
    ui::ImageModel image;
    std::optional<tabs::TabHandle> live_tab;
  };
  using EntryDragUpdate = base::RepeatingCallback<std::optional<gfx::Rect>(
      const EntryDragData&, const gfx::Rect&, const gfx::Point&)>;
  using EntryDragFinish = base::RepeatingCallback<bool(const EntryDragData&)>;
  // Update consumes actual SCREEN tile bounds/pointer. An engaged rectangle
  // routes to the region; even an empty rectangle is a genuine routed result.
  void SetEntryDragCallbacks(EntryDragUpdate update, EntryDragFinish finish,
                             base::RepeatingClosure cleanup);
  void CancelEntryDrag();
  bool IsEntryDragInProgress() const { return dragging_view_ != nullptr; }

  // Original screen-space bookmark/tab drop projection. The region owns the
  // real drag payload and deletes a bookmark only after a successful commit.
  std::optional<gfx::Rect> UpdateDropInsertion(const gfx::Point& screen_point);
  void SetDropInsertion(std::optional<size_t> index);
  std::optional<size_t> drop_insertion() const { return drop_insertion_; }
  bool CommitDroppedEntry(const GURL& url, const std::u16string& title);

  void SetCompactPresentation(bool compact);
  void SetLayoutWidthOverride(std::optional<int> width);
  // Retire real old profile observers before same-window owner rebind.
  void PauseForProfileSwitch();
  void RebindAfterProfileSwitch();

  gfx::Size CalculatePreferredSize(
      const views::SizeBounds& available) const override;
  void Layout(PassKey) override;
  void OnPaint(gfx::Canvas* canvas) override;

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
  void PrepareEntryDrag(size_t index);
  void DragEntry(EntryView* view, const gfx::Point& pointer,
                 const gfx::Point& grab_offset);
  void UpdateDragGhost(EntryView* view, const gfx::Rect& local_bounds);
  void ReleaseEntryDrag();
  void ResetEntryDrag();
  void ReorderEntry(EntryView* view, size_t destination);
  void ScheduleRefresh();
  void Refresh();
  void Activate(size_t index);
  void Close(size_t index);
  void ShowEntryContextMenu(size_t index, const gfx::Point& point);
  void CancelContextMenu();
  bool IsCommandIdEnabled(int command_id) const override;
  void ExecuteCommand(int command_id, int event_flags) override;
  void MenuClosed(ui::SimpleMenuModel* source) override;
  int Columns(const views::SizeBound& width, size_t slot_count) const;
  gfx::Rect SlotBounds(size_t index, size_t slot_count) const;
  size_t SlotCount() const;

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
  EntryDragUpdate drag_update_;
  EntryDragFinish drag_finish_;
  base::RepeatingClosure drag_cleanup_;
  raw_ptr<EntryView> dragging_view_ = nullptr;
  std::optional<EntryDragData> drag_data_;
  std::optional<gfx::Rect> drag_region_bounds_;
  std::unique_ptr<views::Widget> drag_ghost_;
  raw_ptr<EntryView> drag_ghost_entry_ = nullptr;
  bool reorder_dirty_ = false;
  std::optional<size_t> drop_insertion_;
  bool compact_ = false;
  std::optional<int> width_override_;
  bool paused_ = false;
  bool refresh_pending_ = false;
  base::WeakPtrFactory<VerticalPinnedTabEntriesView> weak_factory_{this};
};

#endif  // CHROME_BROWSER_UI_VIEWS_TABS_VERTICAL_VERTICAL_PINNED_TAB_ENTRIES_VIEW_H_
