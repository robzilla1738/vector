// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_CROSS_SECTION_DRAG_COORDINATOR_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_CROSS_SECTION_DRAG_COORDINATOR_H_
#include <memory>
class BrowserWindowInterface;
class ExpandOnHoverLock;
class PinnedTabContainerView;
class VerticalPinnedTabEntriesView;
namespace bookmarks {
class BookmarkNode;
}
namespace views {
class View;
}
namespace aux {
class AuxBookmarksSection;
class CrossSectionDragPreview;
class ProfilePreviewAdmission;
// Source region callbacks462b5c0/462ba98/462beac,462d1c0/462d5e0/462d8a4
// and462ce28. Own inside the real region, after constructing genuine leaves.
class CrossSectionDragCoordinator final {
 public:
  class Delegate {
   public:
    virtual ~Delegate() = default;
    // MUST return the actual region's source type2/kKeepExpanded lock.
    virtual std::unique_ptr<ExpandOnHoverLock> AcquireDragExpansionLock() = 0;
    // Actual462c188 +4645400 +region layout effect, not model substitutions.
    virtual void SavedPinConversionCompleted() = 0;
    // Actual4645400 +region layout effect; conversion itself is concrete here.
    virtual void BookmarkConversionCompleted() = 0;
  };
  CrossSectionDragCoordinator(BrowserWindowInterface& browser,
                              views::View& region,
                              AuxBookmarksSection& bookmarks,
                              VerticalPinnedTabEntriesView& saved_pins,
                              views::View& actual_outer_scroll_body,
                              PinnedTabContainerView* actual_live_pinned_tabs,
                              ProfilePreviewAdmission& admission,
                              CrossSectionDragPreview& preview,
                              Delegate& delegate);
  ~CrossSectionDragCoordinator();
  CrossSectionDragCoordinator(const CrossSectionDragCoordinator&) = delete;
  CrossSectionDragCoordinator& operator=(const CrossSectionDragCoordinator&) =
      delete;
  // Call BEFORE genuine same-window profile/context retirement or child
  // teardown. Normal Hide is not profile retirement and must not manufacture a
  // new owner.
  void Retire();
  // Actual source cancellation/disabled-owner boundary; keeps callback binding.
  void Cancel();
  bool remove_without_insertion() const;
  const bookmarks::BookmarkNode* candidate_bookmark() const;

 private:
  class Impl;
  std::unique_ptr<Impl> impl_;
};
}  // namespace aux
#endif
