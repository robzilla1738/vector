// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SAVED_ENTRY_DROP_TARGET_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_SAVED_ENTRY_DROP_TARGET_H_
#include <memory>
#include <optional>
#include <string>
#include "base/callback_list.h"
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/memory/raw_ptr.h"
#include "chrome/browser/ui/views/tabs/dragging/tab_drag_target.h"
#include "ui/views/view_tracker.h"
#include "url/gurl.h"
class BrowserWindowInterface;
class BaseTabStripRegionView;
class Profile;
class ExpandOnHoverLock;
class PinnedTabContainerView;
class TabDragHandler;
class VerticalPinnedTabEntriesView;
namespace views { class ScrollView; }
namespace aux {
class CrossSectionDragPreview;
class ProfilePreviewAdmission;
enum class SavedEntryDropRoute { kNone, kSavedEntries, kUnpinnedTopBand };
// Source465a498..465ab38, after the real publication guard. The top-band
// result MUST return the actual unpinned target before the native52px path.
SavedEntryDropRoute GetSavedEntryDropRoute(TabDragContext*,
    const VerticalPinnedTabEntriesView&, BaseTabStripRegionView&,
    const views::ScrollView*, const gfx::Point& point_in_screen);

// Original region6b0/e508f60: separate from the saved-entry View6a8.
// Own in AuxSidebarBody and retire BEFORE any native collection/leaf teardown.
class SavedEntryDropTarget final : public TabDragTarget {
 public:
  using AcquireLock = base::RepeatingCallback<std::unique_ptr<ExpandOnHoverLock>()>;
  SavedEntryDropTarget(BrowserWindowInterface&, views::View& region,
      VerticalPinnedTabEntriesView&, PinnedTabContainerView&,
      views::ScrollView&, TabDragHandler&, CrossSectionDragPreview&,
      ProfilePreviewAdmission&, AcquireLock,
      base::RepeatingClosure clear_empty_drop,
      base::RepeatingClosure saved_commit_completed);
  ~SavedEntryDropTarget() override;
  void Retire();
  void OnTabDragEntered() override;
  TabDragContext* OnTabDragUpdated(DragController&, const gfx::Point&) override;
  void OnTabDragExited(const gfx::Point&) override;
  void OnTabDragEnded() override;
  bool CanDropTab() override;
  void HandleTabDrop(DragController&) override;
  base::CallbackListSubscription RegisterWillDestroyCallback(base::OnceClosure) override;
 private:
  bool Current() const;
  void Cleanup(bool retain_insertion);
  void RestoreDraggedView();
  base::WeakPtr<BrowserWindowInterface> browser_;
  raw_ptr<Profile> profile_;
  raw_ptr<TabDragHandler> drag_;
  raw_ptr<ProfilePreviewAdmission> admission_;
  views::ViewTracker region_, pins_, physical_pins_, outer_, preview_, hidden_;
  AcquireLock acquire_lock_;
  base::RepeatingClosure clear_empty_drop_, completed_;
  std::unique_ptr<ExpandOnHoverLock> lock_;
  std::optional<float> previous_opacity_;
  GURL url_;
  std::u16string title_;
  bool retired_ = false;
  base::OnceClosureList destroying_;
  base::WeakPtrFactory<SavedEntryDropTarget> weak_{this};
};
}
#endif
