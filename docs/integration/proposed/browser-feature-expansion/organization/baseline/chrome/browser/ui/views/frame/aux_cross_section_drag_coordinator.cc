// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_cross_section_drag_coordinator.h"

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <optional>
#include <utility>
#include "base/check.h"
#include "base/functional/bind.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/raw_ref.h"
#include "base/memory/weak_ptr.h"
#include "base/numerics/clamped_math.h"
#include "base/uuid.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/views/frame/aux_bookmark_drag_hint.h"
#include "chrome/browser/ui/views/frame/aux_bookmark_pin_conversion.h"
#include "chrome/browser/ui/views/frame/aux_bookmarks_section.h"
#include "chrome/browser/ui/views/frame/aux_cross_section_drag_preview.h"
#include "chrome/browser/ui/views/frame/aux_profile_preview_admission.h"
#include "chrome/browser/ui/views/frame/aux_saved_pin_bookmark_conversion.h"
#include "chrome/browser/ui/views/frame/aux_vertical_tab_bookmarks_view.h"
#include "chrome/browser/ui/views/frame/tab_strip_region_view.h"
#include "chrome/browser/ui/views/tabs/common/pinned_tab_container_view.h"
#include "chrome/browser/ui/views/tabs/vertical/vertical_pinned_tab_entries_view.h"
#include "components/bookmarks/browser/bookmark_node.h"
#include "ui/views/view_tracker.h"

namespace aux {
class CrossSectionDragCoordinator::Impl {
 public:
  Impl(BrowserWindowInterface& browser,
       views::View& region,
       AuxBookmarksSection& section,
       VerticalPinnedTabEntriesView& pins,
       views::View& outer_scroll,
       PinnedTabContainerView* live_pins,
       ProfilePreviewAdmission& admission,
       CrossSectionDragPreview& preview,
       Delegate& delegate)
      : browser_(browser.GetWeakPtr()),
        profile_(browser.GetProfile()),
        tab_model_(browser.GetTabStripModel()),
        delegate_(delegate),
        region_(&region),
        section_(&section),
        bookmarks_(section.bookmarks_view()),
        pins_(&pins),
        outer_scroll_(&outer_scroll),
        live_pins_(live_pins),
        preview_(&preview),
        admission_(admission.GetWeakPtr()),
        hint_(region) {
    CHECK(profile_ && tab_model_ && Bookmarks());
    CHECK(preview.parent() == &region);
    Pins()->SetEntryDragCallbacks(
        base::BindRepeating(
            [](base::WeakPtr<Impl> owner,
               const VerticalPinnedTabEntriesView::EntryDragData& data,
               const gfx::Rect& source,
               const gfx::Point& pointer) -> std::optional<gfx::Rect> {
              return owner ? owner->SavedUpdate(data, source, pointer)
                           : std::nullopt;
            },
            weak_.GetWeakPtr()),
        base::BindRepeating(
            [](base::WeakPtr<Impl> owner,
               const VerticalPinnedTabEntriesView::EntryDragData& data) {
              return owner && owner->SavedFinish(data);
            },
            weak_.GetWeakPtr()),
        base::BindRepeating(&Impl::SavedCleanup, weak_.GetWeakPtr()));
    Bookmarks()->SetDragCallbacks(
        base::BindRepeating(
            [](base::WeakPtr<Impl> owner, const bookmarks::BookmarkNode* node,
               const ui::ImageModel& image, const gfx::Rect& source,
               const gfx::Point& pointer) {
              return owner &&
                     owner->BookmarkUpdate(node, image, source, pointer);
            },
            weak_.GetWeakPtr()),
        base::BindRepeating(&Impl::BookmarkFinish, weak_.GetWeakPtr()),
        base::BindRepeating(&Impl::BookmarkCleanup, weak_.GetWeakPtr()));
    Bookmarks()->SetProjectionChangedCallback(
        base::BindRepeating(&Impl::ProjectionChanged, weak_.GetWeakPtr()));
  }
  ~Impl() { Retire(); }
  void Retire() {
    if (retired_)
      return;
    retired_ = true;
    weak_.InvalidateWeakPtrs();
    // Remove only the callback slots this actual owner installed before capture
    // cancellation can synchronously call back into a retired profile.
    if (Bookmarks()) {
      Bookmarks()->SetDragCallbacks({}, {}, {});
      Bookmarks()->SetProjectionChangedCallback({});
      Bookmarks()->CancelDrag();
      Bookmarks()->ClearExternalBookmarkInsertion(false);
    }
    if (Pins()) {
      Pins()->SetEntryDragCallbacks({}, {}, {});
      Pins()->CancelEntryDrag();
      Pins()->SetDropInsertion(std::nullopt);
    }
    remove_only_ = false;
    candidate_id_.reset();
    HidePreview();
    hint_.Hide();
  }
  void Cancel() {
    if (retired_)
      return;
    const auto alive = weak_.GetWeakPtr();
    if (Bookmarks())
      Bookmarks()->CancelDrag();
    if (!alive)
      return;
    if (Pins())
      Pins()->CancelEntryDrag();
    if (!alive)
      return;
    SavedCleanup();
    if (!alive)
      return;
    BookmarkCleanup();
    if (alive)
      hint_.Hide();
  }
  bool remove_only() const { return remove_only_; }
  const bookmarks::BookmarkNode* candidate() const {
    if (!Current() || !candidate_id_)
      return nullptr;
    const auto* node =
        static_cast<const VerticalTabBookmarksView*>(bookmarks_.view())
            ->FindNode(*candidate_id_);
    return node && node->uuid() == candidate_uuid_ ? node : nullptr;
  }

 private:
  bool Current() const {
    return !retired_ && browser_ && region_.view() && section_.view() &&
           bookmarks_.view() && pins_.view() && outer_scroll_.view() &&
           preview_.view() && admission_ &&
           browser_->GetProfile() == profile_ &&
           browser_->GetTabStripModel() == tab_model_;
  }
  VerticalTabBookmarksView* Bookmarks() {
    return static_cast<VerticalTabBookmarksView*>(bookmarks_.view());
  }
  VerticalPinnedTabEntriesView* Pins() {
    return static_cast<VerticalPinnedTabEntriesView*>(pins_.view());
  }
  AuxBookmarksSection* Section() {
    return static_cast<AuxBookmarksSection*>(section_.view());
  }
  CrossSectionDragPreview* Preview() {
    return static_cast<CrossSectionDragPreview*>(preview_.view());
  }
  void HidePreview() {
    // Move the lock first: Hide/layout can retire the coordinator. Its local
    // destructor still releases the genuine registered lock without touching
    // us.
    auto release = std::move(drag_lock_);
    if (Preview())
      Preview()->Hide();
  }
  bool ShowPreview(const std::u16string& title,
                   const ui::ImageModel& image,
                   const gfx::Rect& source,
                   const gfx::Rect& target,
                   bool pinned_target) {
    if (!Current())
      return false;
    if (admission_->hover_expanded() && !drag_lock_) {
      const auto alive = weak_.GetWeakPtr();
      auto lock = delegate_->AcquireDragExpansionLock();
      if (!alive || !Current())
        return false;
      CHECK(lock);
      drag_lock_ = std::move(lock);
    }
    // Original4651140 subtracts the actual region's SCREEN origin, not the
    // scroll body's parent coordinate or a guessed sidebar width.
    const gfx::Rect source_local =
        views::View::ConvertRectFromScreen(region_.view(), source);
    const gfx::Rect target_local =
        views::View::ConvertRectFromScreen(region_.view(), target);
    Preview()->Update(title, image, source_local, target_local, pinned_target);
    return true;
  }
  std::optional<gfx::Rect> SavedUpdate(
      const VerticalPinnedTabEntriesView::EntryDragData& data,
      const gfx::Rect& source,
      const gfx::Point& pointer) {
    if (!Current())
      return std::nullopt;
    if (Section()->GetVisible() && Section()->expanded() &&
        Bookmarks()->GetVisible() &&
        admission_->AdmitsProfilePreview(region_.view()->width()) &&
        Section()->GetBoundsInScreen().Contains(pointer)) {
      const auto alive = weak_.GetWeakPtr();
      const auto insertion = Bookmarks()->UpdateExternalBookmarkInsertion(
          data.saved.url, data.title, pointer);
      if (!alive || !Current())
        return std::nullopt;
      if (insertion) {
        if (remove_only_) {
          remove_only_ = false;
          hint_.Hide();
        }
        const double fraction =
            source.height() < 1
                ? .5
                : std::clamp(
                      static_cast<double>(
                          base::ClampSub(pointer.y(), source.y()).RawValue()) /
                          source.height(),
                      0., 1.);
        gfx::Rect following = *insertion;
        following.set_y(base::ClampSub(
            pointer.y(), static_cast<int>(fraction * insertion->height())));
        if (!ShowPreview(data.title, data.image, source, following, false))
          return std::nullopt;
        return insertion;
      }
    }
    const auto alive = weak_.GetWeakPtr();
    Bookmarks()->ClearExternalBookmarkInsertion(true);
    if (!alive || !Current())
      return std::nullopt;
    HidePreview();
    if (!alive || !Current())
      return std::nullopt;
    // Original6c0 is only this exact >bottom+12 branch, not merely outside.
    if (pointer.y() >
        base::ClampAdd(Pins()->GetBoundsInScreen().bottom(), 12)) {
      remove_only_ = true;
      hint_.Update(true, true, data.title, pointer);
      return gfx::Rect();  // engaged-empty routes release to real remove-only.
    }
    if (remove_only_) {
      remove_only_ = false;
      hint_.Hide();
    }
    return std::nullopt;  // intra-saved-pin reorder remains leaf-owned.
  }
  bool SavedFinish(const VerticalPinnedTabEntriesView::EntryDragData& data) {
    if (!Current())
      return false;
    const bool remove_only = remove_only_;
    if (remove_only)
      remove_only_ = false;
    const auto alive = weak_.GetWeakPtr();
    const bool changed = ConvertSavedPinToBookmark(
        *browser_, *Pins(), *Bookmarks(), {data.saved.url, data.title},
        data.live_tab, remove_only);
    if (!alive || !Current())
      return changed;
    // Remove-only can mutate the first duplicate yet return false if another
    // remains. Its genuine layout/association effects still run in that case.
    if (remove_only)
      hint_.Hide();
    if (!alive || !Current())
      return changed;
    if (!remove_only)
      HidePreview();
    if (!alive || !Current())
      return changed;
    if (remove_only || changed)
      delegate_->SavedPinConversionCompleted();
    return changed;
  }
  void SavedCleanup() {
    const auto alive = weak_.GetWeakPtr();
    if (Bookmarks())
      Bookmarks()->ClearExternalBookmarkInsertion(true);
    if (!alive)
      return;
    HidePreview();
    if (!alive)
      return;
    if (remove_only_) {
      remove_only_ = false;
      hint_.Hide();
    }
  }
  bool BookmarkUpdate(const bookmarks::BookmarkNode* node,
                      const ui::ImageModel& image,
                      const gfx::Rect& source,
                      const gfx::Point& pointer) {
    if (!Current())
      return false;
    candidate_id_.reset();
    if (!node || !node->is_url())
      return false;
    if (!admission_->AdmitsProfilePreview(region_.view()->width())) {
      Pins()->SetDropInsertion(std::nullopt);
      // Source early rejection leaves Hide/release to the genuine finished
      // callback, which the Bookmark owner immediately dispatches on rejection.
      return false;
    }
    const int64_t id = node->id();
    const auto uuid = node->uuid();
    const auto title = node->GetTitle();
    const auto alive = weak_.GetWeakPtr();
    const auto projection = UpdateBookmarkPinnedDropProjection(
        node, *admission_, region_.view()->width(), *Pins(), pointer,
        BookmarkPinnedDropFallbackBounds(
            *region_.view(), outer_scroll_.view(),
            static_cast<PinnedTabContainerView*>(live_pins_.view())));
    if (!alive || !Current())
      return false;
    if (projection.candidate) {
      const auto* current = Bookmarks()->FindNode(id);
      if (!current || current->uuid() != uuid) {
        Pins()->SetDropInsertion(std::nullopt);
        if (alive)
          HidePreview();
        return false;
      }
      candidate_id_ = id;
      candidate_uuid_ = uuid;
    }
    if (projection.admitted && projection.target_bounds) {
      return ShowPreview(title, image, source, *projection.target_bounds, true);
    }
    HidePreview();
    return false;
  }
  void BookmarkFinish(const bookmarks::BookmarkNode* node) {
    if (!Current() || !node || !node->is_url())
      return;
    const auto associated = Bookmarks()->GetAssociatedTabHandle(*node);
    const auto alive = weak_.GetWeakPtr();
    ConvertBookmarkToPinnedEntry(*browser_, *Pins(), *node, associated);
    if (!alive || !Current())
      return;
    candidate_id_.reset();
    HidePreview();
    if (!alive || !Current())
      return;
    delegate_->BookmarkConversionCompleted();
  }
  void BookmarkCleanup() {
    candidate_id_.reset();
    const auto alive = weak_.GetWeakPtr();
    if (Pins())
      Pins()->SetDropInsertion(std::nullopt);
    if (!alive)
      return;
    HidePreview();
  }
  void ProjectionChanged() {
    if (!Current())
      return;
    hint_.Update(Bookmarks()->drag_projection_active(),
                 Bookmarks()->drag_projection_detached(),
                 Bookmarks()->drag_title(), Bookmarks()->drag_screen_point());
  }

  base::WeakPtr<BrowserWindowInterface> browser_;
  const raw_ptr<Profile> profile_;
  const raw_ptr<TabStripModel> tab_model_;
  const raw_ref<Delegate> delegate_;
  views::ViewTracker region_, section_, bookmarks_, pins_, outer_scroll_,
      live_pins_, preview_;
  base::WeakPtr<ProfilePreviewAdmission> admission_;
  BookmarkDragHint hint_;
  std::unique_ptr<ExpandOnHoverLock> drag_lock_;
  std::optional<int64_t> candidate_id_;
  base::Uuid candidate_uuid_;
  bool remove_only_ = false;
  bool retired_ = false;
  base::WeakPtrFactory<Impl> weak_{this};
};
CrossSectionDragCoordinator::CrossSectionDragCoordinator(
    BrowserWindowInterface& browser,
    views::View& region,
    AuxBookmarksSection& bookmarks,
    VerticalPinnedTabEntriesView& saved_pins,
    views::View& actual_outer_scroll_body,
    PinnedTabContainerView* actual_live_pinned_tabs,
    ProfilePreviewAdmission& admission,
    CrossSectionDragPreview& preview,
    Delegate& delegate)
    : impl_(std::make_unique<Impl>(browser,
                                   region,
                                   bookmarks,
                                   saved_pins,
                                   actual_outer_scroll_body,
                                   actual_live_pinned_tabs,
                                   admission,
                                   preview,
                                   delegate)) {}
CrossSectionDragCoordinator::~CrossSectionDragCoordinator() = default;
void CrossSectionDragCoordinator::Cancel() {
  impl_->Cancel();
}
void CrossSectionDragCoordinator::Retire() {
  impl_->Retire();
}
bool CrossSectionDragCoordinator::remove_without_insertion() const {
  return impl_->remove_only();
}
const bookmarks::BookmarkNode* CrossSectionDragCoordinator::candidate_bookmark()
    const {
  return impl_->candidate();
}
}  // namespace aux
