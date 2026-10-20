// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/views/frame/aux_vertical_tab_bookmarks_view.h"

#include <algorithm>
#include <array>
#include <cmath>
#include <limits>
#include <map>
#include <set>
#include <utility>
#include <vector>

#include "base/functional/bind.h"
#include "base/functional/callback_helpers.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/raw_ref.h"
#include "base/memory/weak_ptr.h"
#include "base/scoped_observation.h"
#include "base/strings/string_util.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/single_thread_task_runner.h"
#include "chrome/browser/bookmarks/bookmark_model_factory.h"
#include "chrome/browser/prefs/incognito_mode_prefs.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/bookmarks/bookmark_utils_desktop.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/navigator/browser_navigator.h"
#include "chrome/browser/ui/navigator/browser_navigator_params.h"
#include "chrome/browser/ui/tabs/tab_menu_model.h"
#include "chrome/browser/ui/tabs/tab_menu_model_delegate.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/tabs/tab_strip_model_observer.h"
#include "chrome/browser/ui/views/frame/aux_bookmark_confirmation.h"
#include "chrome/browser/ui/views/frame/aux_bookmark_tab_exclusion.h"
#include "chrome/browser/ui/views/frame/aux_vertical_bookmark_row_view.h"
#include "chrome/browser/ui/views/frame/aux_vertical_tab_bookmark_expansion.h"
#include "chrome/browser/ui/views/tabs/hovercard/tab_hover_card_controller.h"
#include "chrome/browser/ui/views/tabs/tab/tab_context_menu_controller.h"
#include "chrome/browser/ui/views/tabs/vertical/vertical_tab_strip_scroll_bar.h"
#include "components/bookmarks/browser/bookmark_client.h"
#include "components/bookmarks/browser/bookmark_model.h"
#include "components/bookmarks/browser/bookmark_model_observer.h"
#include "components/bookmarks/browser/bookmark_node.h"
#include "components/bookmarks/common/bookmark_pref_names.h"
#include "components/constrained_window/constrained_window_views.h"
#include "components/policy/core/common/policy_pref_names.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/web_contents.h"
#include "ui/base/interaction/element_identifier.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/base/models/dialog_model.h"
#include "ui/base/models/dialog_model_field.h"
#include "ui/base/window_open_disposition.h"
#include "ui/color/color_provider_key.h"
#include "ui/gfx/animation/animation.h"
#include "ui/gfx/animation/slide_animation.h"
#include "ui/gfx/geometry/insets.h"
#include "ui/menus/simple_menu_model.h"
#include "ui/views/animation/animation_delegate_views.h"
#include "ui/views/animation/bounds_animator.h"
#include "ui/views/animation/bounds_animator_observer.h"
#include "ui/views/controls/label.h"
#include "ui/views/controls/menu/menu_runner.h"
#include "ui/views/controls/menu/menu_types.h"
#include "ui/views/layout/box_layout.h"
#include "ui/views/layout/fill_layout.h"
#include "ui/views/view_class_properties.h"
#include "ui/views/widget/widget.h"

namespace aux {
namespace {
using Node = bookmarks::BookmarkNode;

DEFINE_LOCAL_ELEMENT_IDENTIFIER_VALUE(kBookmarkName);
DEFINE_LOCAL_ELEMENT_IDENTIFIER_VALUE(kBookmarkUrl);
class BookmarkEditDelegate final : public ui::DialogModelDelegate {
 public:
  explicit BookmarkEditDelegate(
      base::OnceCallback<void(ui::DialogModel*)> accept)
      : accept_(std::move(accept)) {}
  void Accept() { std::move(accept_).Run(dialog_model()); }

 private:
  base::OnceCallback<void(ui::DialogModel*)> accept_;
};
class EmptyBookmarkLabel final : public views::Label {
  METADATA_HEADER(EmptyBookmarkLabel, views::Label)
 public:
  EmptyBookmarkLabel() : views::Label(u"Drag tabs here to add bookmarks") {
    SetHorizontalAlignment(gfx::ALIGN_CENTER);
    SetMultiLine(true);
    SetAutoColorReadabilityEnabled(false);
    SetSubpixelRenderingEnabled(false);
    SetBackgroundColor(SK_ColorTRANSPARENT);
  }
  void OnThemeChanged() override {
    views::Label::OnThemeChanged();
    if (GetWidget())
      SetEnabledColor(GetWidget()->GetColorMode() ==
                              ui::ColorProviderKey::ColorMode::kDark
                          ? 0x8cfafafa
                          : 0x8c0a0a0a);
  }
};

BEGIN_METADATA(EmptyBookmarkLabel)
END_METADATA

std::array<const Node*, 6> Roots(const bookmarks::BookmarkModel& model) {
  return {model.bookmark_bar_node(),  model.other_node(),
          model.mobile_node(),        model.account_bookmark_bar_node(),
          model.account_other_node(), model.account_mobile_node()};
}
const Node* FindIn(const Node* node, int64_t id) {
  if (!node || node->id() == id)
    return node;
  for (const auto& child : node->children())
    if (const auto* found = FindIn(child.get(), id))
      return found;
  return nullptr;
}
bool IsDescendant(const Node* node, const Node* ancestor) {
  for (; node; node = node->parent())
    if (node == ancestor)
      return true;
  return false;
}
std::u16string Title(const Node& node) {
  if (!node.GetTitle().empty() || node.is_folder())
    return node.GetTitle();
  return base::UTF8ToUTF16(node.url().has_host() ? node.url().host()
                                                 : node.url().spec());
}
gfx::Point PointIn(const views::View& row,
                   const views::View& target,
                   const ui::MouseEvent& event) {
  gfx::Point point = event.location();
  views::View::ConvertPointToTarget(&row, &target, &point);
  return point;
}
gfx::Point ScreenPoint(const views::View& row, const ui::MouseEvent& event) {
  gfx::Point point = event.location();
  views::View::ConvertPointToScreen(&row, &point);
  return point;
}
gfx::Rect BoundsInContents(const views::View& row,
                           const views::View& contents) {
  gfx::Rect bounds = row.GetBoundsInScreen();
  gfx::Point origin = bounds.origin();
  views::View::ConvertPointFromScreen(&contents, &origin);
  return gfx::Rect(origin, bounds.size());
}

}  // namespace

class VerticalTabBookmarksView::Impl final
    : public VerticalBookmarkRowOwner,
      public ui::SimpleMenuModel::Delegate,
      public TabContextMenuController::Delegate,
      public bookmarks::BookmarkModelObserver,
      public TabStripModelObserver,
      public views::AnimationDelegateViews,
      public views::BoundsAnimatorObserver {
 public:
  Impl(VerticalTabBookmarksView& view,
       BrowserWindowInterface& browser,
       TabStripModel& model,
       TabHoverCardController* hover,
       tabs::VerticalTabStripStateController* state)
      : views::AnimationDelegateViews(&view),
        view_(view),
        browser_(browser),
        profile_(browser.GetProfile()),
        tabs_(&model),
        hover_(hover),
        expansion_(
            *browser.GetProfile()->GetPrefs(),
            base::BindRepeating(&Impl::RequestRebuild, base::Unretained(this))),
        height_animation_(this) {
    view_->SetUseContentsPreferredSize(true);
    view_->SetHorizontalScrollBarMode(
        views::ScrollView::ScrollBarMode::kDisabled);
    view_->SetBackgroundColor(std::nullopt);
    view_->SetVerticalScrollBar(
        std::make_unique<VerticalTabStripScrollBar>(state));
    auto contents = std::make_unique<views::View>();
    auto* layout =
        contents->SetLayoutManager(std::make_unique<views::BoxLayout>(
            views::BoxLayout::Orientation::kVertical,
            gfx::Insets::TLBR(1, 8, 0, 8)));
    layout->set_cross_axis_alignment(
        views::BoxLayout::CrossAxisAlignment::kStretch);
    layout->SetCollapseMarginsSpacing(true);
    contents_ = view_->SetContents(std::move(contents));
    bounds_ = std::make_unique<views::BoundsAnimator>(contents_, true);
    bounds_->set_tween_type(
        gfx::Tween::Type::EASE_IN_OUT);  // Original quadratic source branch7.
    bounds_->AddObserver(this);
    height_animation_.SetSlideDuration(bounds_->GetAnimationDuration());
    bookmark_model_ =
        BookmarkModelFactory::GetForBrowserContext(browser.GetProfile());
    if (bookmark_model_)
      bookmark_observation_.Observe(bookmark_model_);
    model.AddObserver(this);
    RequestRebuild(false);
  }
  ~Impl() override {
    weak_.InvalidateWeakPtrs();
    HideBookmarkHoverCard();
    ++folder_menu_.generation;
    ++url_menu_.generation;
    folder_menu_.runner.reset();
    url_menu_.runner.reset();
    tab_menu_.reset();
    bookmark_observation_.Reset();
    if (tabs_)
      tabs_->RemoveObserver(this);
    bounds_->RemoveObserver(this);
    bounds_->Cancel();
    height_animation_.Stop();
  }
  const Node* Find(int64_t id) const {
    if (!ScopeCurrent() || !bookmark_model_ || !bookmark_model_->loaded())
      return nullptr;
    std::set<const Node*> visited;
    for (const Node* root : Roots(*bookmark_model_))
      if (root && visited.insert(root).second)
        if (const Node* node = FindIn(root, id))
          return node;
    return nullptr;
  }
  bool ScopeCurrent() const {
    return !retired_ && browser_->GetProfile() == profile_;
  }
  bool retired_ = false;
  std::optional<int> LiveIndex(const Node& node) const;
  void RequestRebuild(bool animate) {
    if (rebuilding_) {
      pending_animate_ = pending_ ? pending_animate_ && animate : animate;
      pending_ = true;
      return;
    }
    rebuilding_ = true;
    const auto weak = weak_.GetWeakPtr();
    do {
      pending_ = false;
      Rebuild(animate);
      if (!weak)
        return;
      animate = pending_animate_;
    } while (pending_);
    rebuilding_ = false;
  }
  void Rebuild(bool animate);
  void BuildChildren(
      const Node*,
      int,
      std::set<const Node*>&,
      std::map<const Node*, std::unique_ptr<VerticalBookmarkRowView>>&);
  void UpdateRow(VerticalBookmarkRowView&, const Node&, int);
  void UpdateFavicon(VerticalBookmarkRowView&, const Node&);
  void UpdateHeight();
  void RestoreDragRows(bool animate);
  void QueueNavigation(const Node& node) {
    if (!node.is_url() || !node.url().is_valid())
      return;
    pending_navigation_.push_back(
        {node.id(), node.url(), std::string(node.url().host())});
  }
  bool SetProjection(bool active,
                     gfx::Point point,
                     std::u16string title,
                     bool detached) {
    if (projection_active_ == active && projection_detached_ == detached &&
        projection_point_ == point && projection_title_ == title)
      return true;
    projection_active_ = active;
    projection_detached_ = detached;
    projection_point_ = point;
    projection_title_ = std::move(title);
    const auto weak = weak_.GetWeakPtr();
    if (projection_changed_)
      projection_changed_.Run();
    return !!weak;
  }
  void ClearIndicators() {
    for (auto [node, row] : rows_)
      row->SetDropIndicator(0);
  }
  void ClearDrag(bool animate, bool finish);
  void SetDrop(const Node*, size_t, size_t visible_insertion);
  void ApplyDragGap(size_t);
  void ResetNonDraggedBounds();
  void UpdateDrop(const gfx::Point&);

  struct MenuState {
    std::unique_ptr<ui::SimpleMenuModel> model;
    std::unique_ptr<views::MenuRunner> runner;
    std::optional<int64_t> node;
    uint64_t generation = 0;
    int selected = 0;
  };
  void CloseMenu(bool folder, uint64_t generation);
  void RunMenuAction(bool folder, uint64_t generation);
  void Edit(int64_t id, bool folder);
  void AcceptEdit(int64_t id, bool folder, ui::DialogModel* dialog);
  void Delete(int64_t id, bool folder);
  void AcceptDelete(int64_t id, bool folder, bool accepted);
  bool ValidNode(const Node* node, bool folder) const {
    return ScopeCurrent() && bookmark_model_ && bookmark_model_->loaded() &&
           node && node->parent() && node->is_folder() == folder &&
           !node->is_permanent_node();
  }
  bool Editable(const Node* node, bool folder) const;
  bool OpenEnabled(const Node* node, int command) const;
  bool IsCommandIdChecked(int) const override { return false; }
  bool IsCommandIdEnabled(int command) const override;
  void ExecuteCommand(int command, int flags) override;
  bool IsContextMenuCommandChecked(TabStripModel::ContextMenuCommand) override {
    return false;
  }
  bool IsContextMenuCommandAlerted(TabStripModel::ContextMenuCommand) override {
    return false;
  }
  bool IsContextMenuCommandEnabled(
      tabs::TabInterface* tab,
      TabStripModel::ContextMenuCommand command) override {
    if (!ScopeCurrent() || !tabs_ || !tab)
      return false;
    int index = tabs_->GetIndexOfTab(tab);
    return index >= 0 && tabs_->IsContextMenuCommandEnabled(index, command);
  }
  void ExecuteContextMenuCommand(tabs::TabInterface* tab,
                                 TabStripModel::ContextMenuCommand command,
                                 int) override {
    if (!ScopeCurrent() || !tabs_ || !tab)
      return;
    int index = tabs_->GetIndexOfTab(tab);
    if (index >= 0)
      tabs_->ExecuteContextMenuCommand(index, command);
  }
  bool GetContextMenuAccelerator(int command,
                                 ui::Accelerator* accelerator) override {
    int browser_command;
    return view_->GetWidget() &&
           TabStripModel::ContextMenuCommandToBrowserCommand(
               command, &browser_.get() command) &&
           view_->GetWidget()->GetAccelerator(browser_command, accelerator);
  }
  MenuState folder_menu_, url_menu_;
  std::unique_ptr<TabContextMenuController> tab_menu_;

  void BookmarkModelLoaded(bool) override { RequestRebuild(false); }
  void BookmarkModelBeingDeleted() override {
    bookmark_observation_.Reset();
    bookmark_model_ = nullptr;
    RequestRebuild(false);
  }
  void BookmarkNodeMoved(const Node*, size_t, const Node*, size_t) override {
    if (!extensive_)
      RequestRebuild(false);
  }
  void BookmarkNodeAdded(const Node*, size_t, bool) override {
    if (!extensive_)
      RequestRebuild(false);
  }
  void BookmarkNodeRemoved(const Node*,
                           size_t,
                           const Node*,
                           const std::set<GURL>&,
                           const base::Location&) override {
    if (!extensive_)
      RequestRebuild(false);
  }
  void BookmarkNodeChanged(const Node*) override {
    if (!extensive_)
      RequestRebuild(false);
  }
  void BookmarkNodeChildrenReordered(const Node*) override {
    if (!extensive_)
      RequestRebuild(false);
  }
  void BookmarkPermanentNodeVisibilityChanged(
      const bookmarks::BookmarkPermanentNode*) override {
    if (!extensive_)
      RequestRebuild(false);
  }
  void BookmarkAllUserNodesRemoved(const std::set<GURL>&,
                                   const base::Location&) override {
    if (!extensive_)
      RequestRebuild(false);
  }
  void BookmarkNodeFaviconChanged(const Node* node) override {
    auto found = rows_.find(node);
    if (found != rows_.end())
      UpdateFavicon(*found->second, *node);
  }
  void ExtensiveBookmarkChangesBeginning() override { extensive_ = true; }
  void ExtensiveBookmarkChangesEnded() override {
    extensive_ = false;
    RequestRebuild(false);
  }
  void OnTabStripModelChanged(TabStripModel*,
                              const TabStripModelChange&,
                              const TabStripSelectionChange&) override {
    RefreshTabState();
  }
  void OnTabStripModelDestroyed(TabStripModel*) override { tabs_ = nullptr; }
  void RefreshTabState();
  void AnimationProgressed(const gfx::Animation*) override { UpdateHeight(); }
  void AnimationEnded(const gfx::Animation*) override {
    height_animating_ = false;
    UpdateHeight();
    MaybeClearPreferredHeight();
  }
  void AnimationCanceled(const gfx::Animation* animation) override {
    AnimationEnded(animation);
  }
  void OnBoundsAnimatorProgressed(views::BoundsAnimator*) override {
    contents_->SchedulePaint();
  }
  void OnBoundsAnimatorDone(views::BoundsAnimator* animator) override {
    if (animator != bounds_.get())
      return;
    for (const auto& row : outgoing_)
      if (row->parent() == contents_)
        contents_->RemoveChildViewT(row.get());
    outgoing_.clear();
    bounds_animating_ = false;
    MaybeClearPreferredHeight();
  }
  void MaybeClearPreferredHeight() {
    if (!bounds_animating_ && !height_animating_ && !dragging_) {
      contents_->SetPreferredSize(std::nullopt);
      contents_->InvalidateLayout();
      view_->PreferredSizeChanged();
    }
  }
  void BookmarkRowPressed(VerticalBookmarkRowView&,
                          const ui::MouseEvent&) override;
  bool BookmarkRowDragged(VerticalBookmarkRowView&,
                          const ui::MouseEvent&) override;
  bool BookmarkRowReleased(VerticalBookmarkRowView&,
                           const ui::MouseEvent&) override;
  bool BookmarkRowContext(VerticalBookmarkRowView&,
                          const ui::MouseEvent&) override;
  void ActivateBookmark(const Node&, const ui::Event&) override;
  void CloseBookmarkTab(const Node&, const ui::Event&) override;
  void BookmarkRowCaptureLost(VerticalBookmarkRowView&) override;
  void HideBookmarkHoverCard() override {
    if (hover_)
      hover_->UpdateHoverCard(nullptr,
                              TabSlotController::HoverCardUpdateType::kEvent);
  }
  void ShowBookmarkHoverCard(HoverCardAnchorTarget* target) override {
    if (hover_)
      hover_->UpdateHoverCard(target,
                              TabSlotController::HoverCardUpdateType::kHover);
  }
  bool BookmarkHasLiveTab(const Node& node) const override {
    return LiveIndex(node).has_value();
  }
  bool BookmarkIsDragging(const Node& node) const override {
    return dragging_ && drag_node_ == &node;
  }
  std::optional<tabs::TabData> BookmarkHoverCardData(
      const Node& node) const override {
    auto index = LiveIndex(node);
    return index ? std::make_optional(tabs::TabData::FromTabInterface(
                       tabs_->GetTabAtIndex(*index)))
                 : std::nullopt;
  }

  const raw_ref<VerticalTabBookmarksView> view_;
  const raw_ref<BrowserWindowInterface> browser_;
  const raw_ptr<Profile> profile_;
  raw_ptr<TabStripModel> tabs_;
  raw_ptr<TabHoverCardController> hover_;
  raw_ptr<views::View> contents_;
  raw_ptr<bookmarks::BookmarkModel> bookmark_model_ = nullptr;
  std::unique_ptr<views::BoundsAnimator> bounds_;
  VerticalTabBookmarkExpansion expansion_;
  gfx::SlideAnimation height_animation_;
  std::map<const Node*, raw_ptr<VerticalBookmarkRowView>> rows_;
  std::vector<raw_ptr<VerticalBookmarkRowView>> outgoing_;
  std::vector<const Node*> visible_;
  std::map<const Node*, int> depths_;
  std::map<tabs::TabHandle, BookmarkTabRepresentation> associations_;
  struct PendingNavigation {
    int64_t node_id;
    GURL url;
    std::string host;
  };
  std::vector<PendingNavigation> pending_navigation_;
  std::vector<GURL> excluded_urls_;
  base::RepeatingClosure activated_;
  std::optional<int64_t> selected_node_;
  bool show_selection_ = false, has_contents_ = false;
  base::RepeatingCallback<void(bool)> contents_changed_;

  bool compact_ = false, folders_only_ = false, extensive_ = false,
       rebuilding_ = false;
  bool pending_ = false, pending_animate_ = false;
  bool bounds_animating_ = false, height_animating_ = false;
  int start_height_ = 0, target_height_ = 0, height_width_ = 0;
  raw_ptr<const Node> drag_node_ = nullptr, drop_parent_ = nullptr,
                      external_node_ = nullptr;
  raw_ptr<VerticalBookmarkRowView> drag_row_ = nullptr;
  std::vector<const Node*> dragged_nodes_;
  gfx::Point press_point_;
  std::map<const Node*, gfx::Rect> drag_start_bounds_;
  bool dragging_ = false, reordered_drag_views_ = false, valid_drop_ = false;
  size_t drop_index_ = 0;
  raw_ptr<const Node> feedback_parent_ = nullptr;
  std::optional<size_t> feedback_index_;
  bool projection_active_ = false, projection_detached_ = false;
  gfx::Point projection_point_;
  std::u16string projection_title_;
  BookmarkDragProjectionChangedCallback projection_changed_;
  BookmarkDragBeginCallback begin_drag_;
  BookmarkDragDetachedCallback detached_;
  BookmarkDragFinishedCallback finished_;
  base::ScopedObservation<bookmarks::BookmarkModel,
                          bookmarks::BookmarkModelObserver>
      bookmark_observation_{this};
  base::WeakPtrFactory<Impl> weak_{this};
};

void VerticalTabBookmarksView::Impl::UpdateFavicon(VerticalBookmarkRowView& row,
                                                   const Node& node) {
  if (node.is_folder() || !bookmark_model_) {
    row.SetFavicon({}, false);
    return;
  }
  const gfx::Image& favicon = bookmark_model_->GetFavicon(&node);
  row.SetFavicon(
      favicon.IsEmpty() ? ui::ImageModel() : ui::ImageModel::FromImage(favicon),
      !favicon.IsEmpty());
}
void VerticalTabBookmarksView::Impl::UpdateRow(VerticalBookmarkRowView& row,
                                               const Node& node,
                                               int depth) {
  row.SetNode(node);
  row.SetDepth(depth);
  row.SetCompact(compact_);
  row.SetExpanded(node.is_folder() && expansion_.IsExpanded(node.id()));
  row.SetHasAssociatedTab(node.is_url() && LiveIndex(node).has_value());
  row.SetActive(show_selection_ && selected_node_ &&
                node.id() == *selected_node_);
  UpdateFavicon(row, node);
}
void VerticalTabBookmarksView::Impl::BuildChildren(
    const Node* parent,
    int depth,
    std::set<const Node*>& visited,
    std::map<const Node*, std::unique_ptr<VerticalBookmarkRowView>>& reuse) {
  for (const auto& child : parent->children()) {
    const Node* node = child.get();
    if (!node->IsVisible() || !visited.insert(node).second ||
        (folders_only_ && node->is_url()))
      continue;
    std::unique_ptr<VerticalBookmarkRowView> row;
    if (auto found = reuse.find(node); found != reuse.end()) {
      row = std::move(found->second);
      reuse.erase(found);
    } else
      row = std::make_unique<VerticalBookmarkRowView>(
          *this, *node, depth,
          node->is_folder() && expansion_.IsExpanded(node->id()));
    UpdateRow(*row, *node, depth);
    row->SetProperty(views::kMarginsKey,
                     gfx::Insets::TLBR(visible_.empty() ? 0 : 4, 0, 0, 0));
    rows_[node] = contents_->AddChildView(std::move(row));
    visible_.push_back(node);
    depths_[node] = depth;
    if (!folders_only_ && node->is_folder() &&
        expansion_.IsExpanded(node->id()))
      BuildChildren(node, depth + 1, visited, reuse);
  }
}
void VerticalTabBookmarksView::Impl::Rebuild(bool animate) {
  HideBookmarkHoverCard();
  if (!dragging_) {
    drag_node_ = nullptr;
    drag_row_ = nullptr;
    dragged_nodes_.clear();
    drag_start_bounds_.clear();
  }
  bounds_->Complete();
  const int old_height = contents_->height();
  std::map<const Node*, gfx::Rect> old_bounds;
  std::map<const Node*, std::unique_ptr<VerticalBookmarkRowView>> reuse;
  if (animate)
    for (auto [node, row] : rows_) {
      old_bounds[node] = row->bounds();
      reuse[node] = contents_->RemoveChildViewT(row.get());
    }
  rows_.clear();
  visible_.clear();
  depths_.clear();
  contents_->RemoveAllChildViews();
  if (bookmark_model_ && bookmark_model_->loaded()) {
    std::set<const Node*> visited;
    for (const Node* root : Roots(*bookmark_model_))
      if (root && visited.insert(root).second)
        BuildChildren(root, 0, visited, reuse);
    if (rows_.empty() && !folders_only_) {
      auto holder = std::make_unique<views::View>();
      holder->SetLayoutManager(std::make_unique<views::FillLayout>());
      holder->AddChildView(std::make_unique<EmptyBookmarkLabel>());
      holder->SetPreferredSize(gfx::Size(1, 58));
      contents_->AddChildView(std::move(holder));
    }
  }
  const bool present = bookmark_model_ && bookmark_model_->loaded() &&
                       (!rows_.empty() || !folders_only_);
  view_->SetVisible(present);
  if (present != has_contents_) {
    has_contents_ = present;
    const auto weak = weak_.GetWeakPtr();
    if (contents_changed_)
      contents_changed_.Run(present);
    if (!weak)
      return;
  }
  contents_->SetPreferredSize(std::nullopt);
  contents_->InvalidateLayout();
  const gfx::Size natural = contents_->GetPreferredSize();
  const int width = std::max(contents_->width(), natural.width());
  contents_->SetBounds(0, 0, width, natural.height());
  contents_->DeprecatedLayoutImmediately();
  if (!animate || old_bounds.empty()) {
    contents_->InvalidateLayout();
    view_->PreferredSizeChanged();
    return;
  }
  bounds_animating_ = false;
  for (auto [node, row] : rows_) {
    const gfx::Rect target = row->bounds();
    gfx::Rect start = target;
    auto old = old_bounds.find(node);
    if (old != old_bounds.end())
      start = old->second;
    else {
      const Node* ancestor = node->parent();
      while (ancestor && !old_bounds.contains(ancestor))
        ancestor = ancestor->parent();
      start = gfx::Rect(
          target.x(), ancestor ? old_bounds.at(ancestor).bottom() : target.y(),
          target.width(), 0);
    }
    bounds_->StopAnimatingView(row);
    row->SetBoundsRect(start);
    if (start != target) {
      bounds_animating_ = true;
      bounds_->AnimateViewTo(row, target);
    }
  }
  for (auto& [node, row] : reuse) {
    const gfx::Rect start = old_bounds.at(node);
    const Node* ancestor = node->parent();
    while (ancestor && !rows_.contains(ancestor))
      ancestor = ancestor->parent();
    const int bottom =
        ancestor ? bounds_->GetTargetBounds(rows_.at(ancestor)).bottom()
                 : start.y();
    row->SetBoundsRect(start);
    auto* outgoing = contents_->AddChildView(std::move(row));
    outgoing_.push_back(outgoing);
    bounds_animating_ = true;
    bounds_->AnimateViewTo(outgoing,
                           gfx::Rect(start.x(), bottom, start.width(), 0));
  }
  if (old_height != natural.height()) {
    start_height_ = old_height;
    target_height_ = natural.height();
    height_width_ = width;
    height_animation_.Reset(0);
    height_animating_ = true;
    UpdateHeight();
    height_animation_.Show();
  }
  MaybeClearPreferredHeight();
  view_->PreferredSizeChanged();
  contents_->SchedulePaint();
}
void VerticalTabBookmarksView::Impl::UpdateHeight() {
  if (!height_animating_)
    return;
  const double value = height_animation_.GetCurrentValue();
  const double interpolated = std::floor(
      double(start_height_) +
      (double(target_height_) - double(start_height_)) * value + 0.5);
  const int height = static_cast<int>(
      std::clamp(interpolated, 0.0, double(std::numeric_limits<int>::max())));
  contents_->SetPreferredSize(gfx::Size(height_width_, height));
  contents_->InvalidateLayout();
  view_->PreferredSizeChanged();
}
std::optional<int> VerticalTabBookmarksView::Impl::LiveIndex(
    const Node& node) const {
  if (!tabs_ || !ScopeCurrent())
    return std::nullopt;
  std::optional<int> result;
  for (int i = 0; i < tabs_->count(); ++i) {
    auto* tab = tabs_->GetTabAtIndex(i);
    const auto found = associations_.find(tab->GetHandle());
    if (found == associations_.end() || found->second.node_id != node.id() ||
        aux::IsBookmarkTabExcluded(tab, tabs_))
      continue;
    if (i == tabs_->active_index())
      return i;
    if (!result)
      result = i;
  }
  return result;
}
void VerticalTabBookmarksView::Impl::RefreshTabState() {
  for (auto [node, row] : rows_) {
    row->SetHasAssociatedTab(node->is_url() && LiveIndex(*node).has_value());
    row->SetActive(show_selection_ && selected_node_ &&
                   node->id() == *selected_node_);
  }
}

void VerticalTabBookmarksView::Impl::ActivateBookmark(const Node& node,
                                                      const ui::Event& event) {
  if (!ScopeCurrent())
    return;
  if (node.is_folder()) {
    expansion_.ToggleFolder(&node);
    return;
  }
  const int flags = event.flags();
  WindowOpenDisposition disposition;
  if ((flags & (ui::EF_COMMAND_DOWN | ui::EF_ALT_DOWN | ui::EF_SHIFT_DOWN)) ==
      (ui::EF_COMMAND_DOWN | ui::EF_ALT_DOWN)) {
    disposition = WindowOpenDisposition::NEW_SPLIT_VIEW;
  } else if (flags & (ui::EF_COMMAND_DOWN | ui::EF_MIDDLE_MOUSE_BUTTON)) {
    disposition = (flags & ui::EF_SHIFT_DOWN)
                      ? WindowOpenDisposition::NEW_FOREGROUND_TAB
                      : WindowOpenDisposition::NEW_BACKGROUND_TAB;
  } else if (flags & (ui::EF_SHIFT_DOWN | ui::EF_ALT_DOWN)) {
    disposition = (flags & ui::EF_SHIFT_DOWN)
                      ? WindowOpenDisposition::NEW_WINDOW
                      : WindowOpenDisposition::SAVE_TO_DISK;
  } else {
    if (auto index = LiveIndex(node)) {
      tabs_->ActivateTabAt(
          *index, TabStripUserGestureDetails(
                      TabStripUserGestureDetails::GestureType::kOther));
      return;
    }
    // Supplied activation fallback is URL matching, distinct from association:
    // it never adds an f98 entry or turns a URL match into bookmark ownership.
    std::optional<int> matching;
    if (tabs_ && node.url().is_valid())
      for (int i = 0; i < tabs_->count(); ++i) {
        auto* tab = tabs_->GetTabAtIndex(i);
        auto* contents = tab->GetContents();
        if (!contents || aux::IsBookmarkTabExcluded(tab, tabs_))
          continue;
        const GURL& url = contents->GetVisibleURL();
        if (url != node.url() ||
            (std::ranges::find(excluded_urls_, url) != excluded_urls_.end()))
          continue;
        if (i == tabs_->active_index())
          return;
        if (!matching)
          matching = i;
      }
    if (matching) {
      tabs_->ActivateTabAt(
          *matching, TabStripUserGestureDetails(
                         TabStripUserGestureDetails::GestureType::kOther));
      return;
    }
    disposition = WindowOpenDisposition::NEW_FOREGROUND_TAB;
  }
  NavigateParams params(&browser_.get(), node.url(),
                        ui::PAGE_TRANSITION_AUTO_BOOKMARK);
  params.disposition = disposition;
  params.window_action = NavigateParams::WindowAction::kShowWindow;
  if (disposition == WindowOpenDisposition::NEW_FOREGROUND_TAB ||
      disposition == WindowOpenDisposition::NEW_BACKGROUND_TAB)
    QueueNavigation(node);
  const auto weak = weak_.GetWeakPtr();
  Navigate(&params);
  if (weak && activated_ &&
      (disposition == WindowOpenDisposition::NEW_FOREGROUND_TAB ||
       disposition == WindowOpenDisposition::NEW_BACKGROUND_TAB))
    activated_.Run();
}
void VerticalTabBookmarksView::Impl::CloseBookmarkTab(const Node& node,
                                                      const ui::Event&) {
  if (!node.is_url())
    return;
  if (auto index = LiveIndex(node))
    tabs_->CloseWebContentsAt(*index, TabCloseTypes::CLOSE_USER_GESTURE);
}
void VerticalTabBookmarksView::Impl::BookmarkRowPressed(
    VerticalBookmarkRowView& row,
    const ui::MouseEvent& event) {
  if (!ScopeCurrent() ||
      (event.flags() & ui::EF_MOUSE_BUTTON) != ui::EF_LEFT_MOUSE_BUTTON)
    return;
  for (auto [node, view] : rows_) {
    view->SetDropIndicator(0);
    view->SetDragPresentation(false, gfx::Vector2d(), true);
  }
  drag_node_ = &row.node();
  drag_row_ = &row;
  dragging_ = false;
  drop_parent_ = nullptr;
  drop_index_ = 0;
  valid_drop_ = false;
  external_node_ = nullptr;
  feedback_parent_ = nullptr;
  feedback_index_.reset();
  if (!SetProjection(false, {}, {}, false))
    return;
  press_point_ = PointIn(row, *contents_, event);
  dragged_nodes_.clear();
  drag_start_bounds_.clear();
  for (const Node* node : visible_) {
    if (IsDescendant(node, drag_node_))
      dragged_nodes_.push_back(node);
    drag_start_bounds_[node] = rows_.at(node)->bounds();
  }
  HideBookmarkHoverCard();
}
void VerticalTabBookmarksView::Impl::RestoreDragRows(bool animate) {
  if (animate)
    ResetNonDraggedBounds();
  for (size_t i = 0; i < visible_.size(); ++i) {
    auto found = rows_.find(visible_[i]);
    if (found == rows_.end())
      continue;
    auto* row = found->second.get();
    row->SetDragPresentation(false, {}, true);
    row->SetDragHidden(false);
    if (reordered_drag_views_)
      contents_->ReorderChildView(row, i);
  }
  dragged_nodes_.clear();
  drag_start_bounds_.clear();
  feedback_parent_ = nullptr;
  feedback_index_.reset();
  reordered_drag_views_ = false;
  valid_drop_ = false;
  MaybeClearPreferredHeight();
  contents_->InvalidateLayout();
  view_->PreferredSizeChanged();
  contents_->SchedulePaint();
}
void VerticalTabBookmarksView::Impl::ClearDrag(bool animate, bool finish) {
  drag_node_ = nullptr;
  drag_row_ = nullptr;
  dragging_ = false;
  drop_parent_ = nullptr;
  valid_drop_ = false;
  drop_index_ = 0;
  external_node_ = nullptr;
  ClearIndicators();
  if (!SetProjection(false, {}, {}, false))
    return;
  RestoreDragRows(animate);
  if (finish && finished_)
    finished_.Run();
}
void VerticalTabBookmarksView::Impl::BookmarkRowCaptureLost(
    VerticalBookmarkRowView& row) {
  if (drag_row_ != &row || !drag_node_)
    return;
  const Node* node = drag_node_;
  const bool detached =
      dragging_ && node->is_url() && external_node_ == node && detached_;
  const auto weak = weak_.GetWeakPtr();
  ClearDrag(true, false);
  if (!weak)
    return;
  if (detached)
    detached_.Run(node);
  if (weak && finished_)
    finished_.Run();
}
void VerticalTabBookmarksView::Impl::ResetNonDraggedBounds() {
  for (const auto& [node, bounds] : drag_start_bounds_) {
    if ((std::ranges::find(dragged_nodes_, node) != dragged_nodes_.end()))
      continue;
    auto found = rows_.find(node);
    if (found == rows_.end())
      continue;
    if (bounds_->GetTargetBounds(found->second) != bounds)
      bounds_->SetTargetBounds(found->second, bounds);
  }
  bounds_animating_ = bounds_->IsAnimating();
  contents_->SchedulePaint();
}
void VerticalTabBookmarksView::Impl::ApplyDragGap(size_t insertion) {
  if (drag_start_bounds_.size() != visible_.size() || dragged_nodes_.empty())
    return;
  std::vector<const Node*> remaining;
  size_t before = 0;
  for (size_t i = 0; i < visible_.size(); ++i) {
    if ((std::ranges::find(dragged_nodes_, visible_[i]) !=
         dragged_nodes_.end()))
      continue;
    if (i < std::min(insertion, visible_.size()))
      ++before;
    remaining.push_back(visible_[i]);
  }
  before = std::min(before, remaining.size());
  size_t next = 0;
  for (size_t slot = 0; slot < visible_.size(); ++slot) {
    if (slot >= before && slot < before + dragged_nodes_.size())
      continue;
    if (next >= remaining.size())
      break;
    auto row = rows_.find(remaining[next++]);
    auto target = drag_start_bounds_.find(visible_[slot]);
    if (row != rows_.end() && target != drag_start_bounds_.end() &&
        bounds_->GetTargetBounds(row->second) != target->second)
      bounds_->SetTargetBounds(row->second, target->second);
  }
  bounds_animating_ = bounds_->IsAnimating();
  contents_->SchedulePaint();
}
void VerticalTabBookmarksView::Impl::SetDrop(const Node* parent,
                                             size_t index,
                                             size_t visible_insertion) {
  if (!parent || !parent->is_folder() || IsDescendant(parent, drag_node_))
    return;
  drop_parent_ = parent;
  drop_index_ = index;
  valid_drop_ = true;
  // Original461b6f4 retains a destination in the post-removal coordinate
  // space solely to detect changes; the actual Move still uses drop_index_.
  size_t normalized = index;
  if (drag_node_ && drag_node_->parent() == parent) {
    auto old = parent->GetIndexOf(drag_node_);
    if (old && normalized > *old)
      --normalized;
  }
  const bool changed = feedback_index_ && (feedback_parent_ != parent ||
                                           *feedback_index_ != normalized);
  feedback_parent_ = parent;
  feedback_index_ = normalized;
  if (changed)
    PerformBookmarkDragDestinationFeedback();
  ApplyDragGap(visible_insertion);
}
void VerticalTabBookmarksView::Impl::UpdateDrop(const gfx::Point& point) {
  const Node* hit = nullptr;
  VerticalBookmarkRowView* hit_row = nullptr;
  for (const Node* node : visible_) {
    if ((std::ranges::find(dragged_nodes_, node) != dragged_nodes_.end()))
      continue;
    auto* row = rows_.at(node).get();
    if (BoundsInContents(*row, *contents_).Contains(point)) {
      hit = node;
      hit_row = row;
      break;
    }
  }
  if (!hit)
    for (const Node* node : visible_) {
      if ((std::ranges::find(dragged_nodes_, node) != dragged_nodes_.end()))
        continue;
      hit = node;
      hit_row = rows_.at(node);
      if (point.y() < BoundsInContents(*hit_row, *contents_).CenterPoint().y())
        break;
    }
  if (!hit || !hit_row)
    return;
  const int desired_depth = std::max(0, (point.x() - 16) / 14);
  const int depth = depths_.at(hit);
  const bool after =
      point.y() >= BoundsInContents(*hit_row, *contents_).CenterPoint().y();
  const auto position = std::ranges::find(visible_, hit);
  size_t visible_index = static_cast<size_t>(position - visible_.begin());
  if (hit->is_folder() && after && desired_depth > depth &&
      !IsDescendant(hit, drag_node_)) {
    size_t end = visible_index + 1;
    while (end < visible_.size() && IsDescendant(visible_[end], hit))
      ++end;
    SetDrop(hit, hit->children().size(), end);
    hit_row->SetDropIndicator(1);
    return;
  }
  const Node* edge = hit;
  const int wanted = std::min(depth, desired_depth);
  while (edge->parent() && depths_.contains(edge) && depths_.at(edge) > wanted)
    edge = edge->parent();
  const Node* parent = edge->parent();
  if (!parent)
    return;
  const auto index = parent->GetIndexOf(edge);
  if (!index)
    return;
  const auto edge_position = std::ranges::find(visible_, edge);
  if (edge_position == visible_.end())
    return;
  visible_index = edge_position - visible_.begin();
  if (after) {
    ++visible_index;
    while (visible_index < visible_.size() &&
           IsDescendant(visible_[visible_index], edge))
      ++visible_index;
  }
  SetDrop(parent, *index + (after ? 1 : 0), visible_index);
}
bool VerticalTabBookmarksView::Impl::BookmarkRowDragged(
    VerticalBookmarkRowView& row,
    const ui::MouseEvent& event) {
  if (!ScopeCurrent() || drag_row_ != &row || !drag_node_ ||
      (event.flags() & ui::EF_MOUSE_BUTTON) != ui::EF_LEFT_MOUSE_BUTTON)
    return false;
  const gfx::Point point = PointIn(row, *contents_, event);
  const gfx::Vector2d delta = point - press_point_;
  if (!dragging_) {
    if (std::abs(delta.x()) <= 8 && std::abs(delta.y()) <= 8)
      return false;
    if (drag_node_->is_permanent_node())
      return false;
    dragging_ = true;
    if (!reordered_drag_views_) {
      reordered_drag_views_ = true;
      for (const Node* node : dragged_nodes_)
        if (rows_.contains(node))
          contents_->ReorderChildView(rows_.at(node),
                                      contents_->children().size() - 1);
    }
  }
  for (const Node* node : dragged_nodes_)
    if (rows_.contains(node))
      rows_.at(node)->SetDragPresentation(
          true, gfx::Vector2d(std::clamp(delta.x(), -10, 18), delta.y()),
          node == drag_node_);
  ClearIndicators();
  drop_parent_ = nullptr;
  drop_index_ = 0;
  valid_drop_ = false;
  const auto weak = weak_.GetWeakPtr();
  if (drag_node_->is_url() && begin_drag_) {
    const bool accepted =
        begin_drag_.Run(drag_node_, row.GetDragImageModel(),
                        row.GetBoundsInScreen(), ScreenPoint(row, event));
    if (!weak)
      return true;
    if (accepted) {
      external_node_ = drag_node_;
      row.SetDragHidden(true);
      ResetNonDraggedBounds();
      SetProjection(false, {}, {}, false);
      return true;
    }
  }
  row.SetDragHidden(false);
  external_node_ = nullptr;
  if (finished_)
    finished_.Run();
  if (!weak)
    return true;
  const gfx::Point in_view = PointIn(row, view_.get(), event);
  if (delta.x() > 18 && drag_node_->is_url() && in_view.x() >= view_->width()) {
    ResetNonDraggedBounds();
    SetProjection(true, ScreenPoint(row, event), Title(*drag_node_), true);
    return true;
  }
  if (!SetProjection(false, {}, {}, false))
    return true;
  UpdateDrop(point);
  if (!valid_drop_)
    ResetNonDraggedBounds();
  return true;
}
bool VerticalTabBookmarksView::Impl::BookmarkRowReleased(
    VerticalBookmarkRowView& row,
    const ui::MouseEvent& event) {
  if (!ScopeCurrent() || drag_row_ != &row || !drag_node_)
    return false;
  const Node* node = drag_node_;
  const bool was_dragging = dragging_;
  const Node* drop = drop_parent_;
  const size_t index = drop_index_;
  const bool valid = valid_drop_,
             projection_detached = projection_active_ && projection_detached_;
  const Node* external = external_node_;
  drag_node_ = nullptr;
  drag_row_ = nullptr;
  dragging_ = false;
  drop_parent_ = nullptr;
  drop_index_ = 0;
  valid_drop_ = false;
  external_node_ = nullptr;
  ClearIndicators();
  const auto weak = weak_.GetWeakPtr();
  if (!SetProjection(false, {}, {}, false))
    return true;
  if (!was_dragging || !bookmark_model_ || !node->parent()) {
    RestoreDragRows(true);
    if (finished_)
      finished_.Run();
    return false;
  }
  const gfx::Point point = PointIn(row, *contents_, event);
  const gfx::Point in_view = PointIn(row, view_.get(), event);
  bool accepted = false;
  if (node->is_url() && begin_drag_) {
    accepted =
        begin_drag_.Run(node, row.GetDragImageModel(), row.GetBoundsInScreen(),
                        ScreenPoint(row, event));
    if (!weak)
      return true;
  }
  if (node->is_url() && (external == node || accepted) && detached_) {
    RestoreDragRows(true);
    if (!weak)
      return true;
    detached_.Run(node);
    if (weak && finished_)
      finished_.Run();
    return true;
  }
  if (finished_)
    finished_.Run();
  if (!weak)
    return true;
  if ((projection_detached || (point.x() > press_point_.x() + 18 &&
                               in_view.x() > view_->width() + 18)) &&
      node->is_url() && !node->is_permanent_node()) {
    RestoreDragRows(false);
    bookmark_model_->Remove(node, bookmarks::metrics::BookmarkEditSource::kUser,
                            FROM_HERE);
    return true;
  }
  if (valid && drop && drop != node && !IsDescendant(drop, node)) {
    const auto old = node->parent()->GetIndexOf(node);
    const size_t target = std::min(index, drop->children().size());
    if (old &&
        (node->parent() != drop || (target != *old && target != *old + 1))) {
      RestoreDragRows(false);
      bookmark_model_->Move(node, drop, target);
      return true;
    }
  }
  RestoreDragRows(true);
  return true;
}

bool VerticalTabBookmarksView::Impl::BookmarkRowContext(
    VerticalBookmarkRowView& row,
    const ui::MouseEvent& event) {
  if (!view_->GetWidget() || !ScopeCurrent())
    return false;
  HideBookmarkHoverCard();
  const Node& node = row.node();
  if (node.is_permanent_node())
    return true;
  const gfx::Point point = ScreenPoint(row, event);
  if (node.is_url())
    if (auto index = LiveIndex(node)) {
      tab_menu_ = std::make_unique<TabContextMenuController>(
          tabs_->GetTabAtIndex(*index)->GetHandle(), this);
      auto menu = std::make_unique<TabMenuModel>(
          tab_menu_.get(), TabMenuModelDelegate::From(&browser_.get()), tabs_,
          *index);
      auto* raw = menu.get();
      tab_menu_->LoadModel(std::move(menu), raw);
      tab_menu_->RunMenuAt(point, ui::mojom::MenuSourceType::kMouse,
                           view_->GetWidget());
      return true;
    }
  const bool folder = node.is_folder();
  MenuState& state = folder ? folder_menu_ : url_menu_;
  ++state.generation;
  state.runner.reset();
  state.model.reset();
  state.node = node.id();
  state.selected = 0;
  state.model = std::make_unique<ui::SimpleMenuModel>(this);
  if (folder) {
    state.model->AddItem(1, u"Rename");
    state.model->AddItem(2, u"Delete");
    state.model->AddSeparator(ui::NORMAL_SEPARATOR);
    state.model->AddItem(3, u"Manage Bookmarks");
  } else {
    state.model->AddItem(100, u"Edit");
    state.model->AddItem(101, u"Delete");
    state.model->AddSeparator(ui::NORMAL_SEPARATOR);
    state.model->AddItem(102, u"Open in Incognito window");
    state.model->AddItem(103, u"Open in new tab group");
    state.model->AddItem(104, u"Open in new tab");
    state.model->AddItem(105, u"Open in new window");
    state.model->AddItem(106, u"Open in split view");
  }
  state.runner = std::make_unique<views::MenuRunner>(
      state.model.get(),
      views::MenuRunner::HAS_MNEMONICS | views::MenuRunner::CONTEXT_MENU,
      base::BindRepeating(&Impl::CloseMenu, weak_.GetWeakPtr(), folder,
                          state.generation));
  state.runner->RunMenuAt(
      view_->GetWidget(), nullptr, gfx::Rect(point, gfx::Size()),
      views::MenuAnchorPosition::kTopLeft, ui::mojom::MenuSourceType::kMouse);
  return true;
}
void VerticalTabBookmarksView::Impl::CloseMenu(bool folder,
                                               uint64_t generation) {
  const MenuState& state = folder ? folder_menu_ : url_menu_;
  if (generation != state.generation)
    return;
  // Original461c0b8/461c1c4 posts after the native menu loop returns. Never
  // destroy its model or mutate BookmarkModel from ExecuteCommand itself.
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
      FROM_HERE, base::BindOnce(&Impl::RunMenuAction, weak_.GetWeakPtr(),
                                folder, generation));
}
void VerticalTabBookmarksView::Impl::ExecuteCommand(int command, int) {
  if (command >= 1 && command <= 3)
    folder_menu_.selected = command;
  else if (command >= 100 && command <= 106)
    url_menu_.selected = command - 99;
  else {
    folder_menu_.selected = 0;
    url_menu_.selected = 0;
  }
}
bool VerticalTabBookmarksView::Impl::Editable(const Node* node,
                                              bool folder) const {
  return ValidNode(node, folder) &&
         browser_->GetProfile()->GetPrefs()->GetBoolean(
             bookmarks::prefs::kEditBookmarksEnabled) &&
         !bookmark_model_->client()->IsNodeManaged(node);
}
bool VerticalTabBookmarksView::Impl::OpenEnabled(const Node* node,
                                                 int command) const {
  if (!ScopeCurrent() || !bookmark_model_ || !bookmark_model_->loaded() ||
      !node || !node->is_url())
    return false;
  std::vector<raw_ptr<const Node, VectorExperimental>> selection{node};
  if (command == 102)
    return bookmarks::IsOpenInIncognitoAllowed(selection,
                                               browser_->GetProfile());
  if (command == 105 &&
      IncognitoModePrefs::GetAvailability(browser_->GetProfile()->GetPrefs()) ==
          policy::IncognitoModeAvailability::kForced)
    return false;
  if (command == 106 && tabs_ && tabs_->GetActiveTab() &&
      tabs_->GetActiveTab()->GetSplit())
    return false;
  return bookmarks::HasBookmarkURLs(selection);
}
bool VerticalTabBookmarksView::Impl::IsCommandIdEnabled(int command) const {
  if (command >= 1 && command <= 3) {
    const Node* node = folder_menu_.node ? Find(*folder_menu_.node) : nullptr;
    return command == 3 ? true : Editable(node, true);
  }
  const Node* node = url_menu_.node ? Find(*url_menu_.node) : nullptr;
  if (command == 100 || command == 101)
    return Editable(node, false);
  return command >= 102 && command <= 106 && OpenEnabled(node, command);
}
void VerticalTabBookmarksView::Impl::RunMenuAction(bool folder,
                                                   uint64_t generation) {
  MenuState& state = folder ? folder_menu_ : url_menu_;
  if (generation != state.generation)
    return;
  const auto id = state.node;
  const int command = state.selected;
  ++state.generation;
  state.runner.reset();
  state.model.reset();
  state.node.reset();
  state.selected = 0;
  if (!ScopeCurrent() || !id || !command)
    return;
  if (folder && command == 3) {
    // Original461c2d0 -> BrowserImpl c6e16d8 constructs browser-initiated
    // OpenURLParams with disposition1(CURRENT_TAB), transition0(LINK).
    // It does not require the selected folder to still exist.
    NavigateParams params(&browser_.get(), GURL("chrome://bookmarks/"),
                          ui::PAGE_TRANSITION_LINK);
    params.disposition = WindowOpenDisposition::CURRENT_TAB;
    Navigate(&params);
    return;
  }
  if (!bookmark_model_ || !bookmark_model_->loaded())
    return;
  const Node* node = Find(*id);
  if (!node)
    return;
  if (folder) {
    if (!ValidNode(node, true))
      return;
    if (command == 1)
      Edit(*id, true);
    else if (command == 2)
      Delete(*id, true);
    return;
  }
  if (command == 1 || command == 2) {
    if (!ValidNode(node, false))
      return;
    if (command == 1)
      Edit(*id, false);
    else
      Delete(*id, false);
    return;
  }
  if (command < 3 || command > 7 || !OpenEnabled(node, command + 99))
    return;
  constexpr std::array dispositions = {
      WindowOpenDisposition::OFF_THE_RECORD,
      WindowOpenDisposition::NEW_BACKGROUND_TAB,
      WindowOpenDisposition::NEW_BACKGROUND_TAB,
      WindowOpenDisposition::NEW_WINDOW,
      WindowOpenDisposition::NEW_BACKGROUND_TAB};
  constexpr std::array contexts = {bookmarks::kNone, bookmarks::kInGroup,
                                   bookmarks::kNone, bookmarks::kNone,
                                   bookmarks::kInSplit};
  bookmarks::OpenAllIfAllowed(&browser_.get(), {node},
                              dispositions[command - 3], contexts[command - 3]);
}
void VerticalTabBookmarksView::Impl::Edit(int64_t id, bool folder) {
  const Node* node = Find(id);
  if (!ValidNode(node, folder) || !view_->GetWidget())
    return;
  auto delegate = std::make_unique<BookmarkEditDelegate>(
      base::BindOnce(&Impl::AcceptEdit, weak_.GetWeakPtr(), id, folder));
  auto* accept = delegate.get();
  auto builder = ui::DialogModel::Builder(std::move(delegate));
  builder.SetTitle(folder ? u"Rename Folder" : u"Edit Bookmark")
      .AddOkButton(base::BindOnce(&BookmarkEditDelegate::Accept,
                                  base::Unretained(accept)),
                   ui::DialogModel::Button::Params().SetLabel(folder ? u"Rename"
                                                                     : u"Save"))
      .AddCancelButton(base::DoNothing(),
                       ui::DialogModel::Button::Params().SetLabel(u"Cancel"))
      .AddTextfield(kBookmarkName, u"", node->GetTitle(),
                    ui::DialogModelTextfield::Params().SetAccessibleName(
                        folder ? u"Folder name" : u"Name"));
  if (!folder)
    builder.AddTextfield(
        kBookmarkUrl, u"", base::UTF8ToUTF16(node->url().spec()),
        ui::DialogModelTextfield::Params().SetAccessibleName(u"URL"));
  builder.SetInitiallyFocusedField(kBookmarkName);
  constrained_window::ShowBrowserModal(builder.Build(),
                                       view_->GetWidget()->GetNativeWindow());
}
void VerticalTabBookmarksView::Impl::AcceptEdit(int64_t id,
                                                bool folder,
                                                ui::DialogModel* dialog) {
  const Node* node = Find(id);
  if (!ValidNode(node, folder))
    return;
  std::u16string name;
  base::TrimWhitespace(dialog->GetTextfieldByUniqueId(kBookmarkName)->text(),
                       base::TRIM_ALL, &name);
  if (folder) {
    if (!name.empty() && name != node->GetTitle())
      bookmark_model_->SetTitle(node, name,
                                bookmarks::metrics::BookmarkEditSource::kUser);
    return;
  }
  std::u16string text;
  base::TrimWhitespace(dialog->GetTextfieldByUniqueId(kBookmarkUrl)->text(),
                       base::TRIM_ALL, &text);
  const GURL url(base::UTF16ToUTF8(text));
  if (!url.is_valid())
    return;
  // Original accepts an empty bookmark name; it rejects an empty folder name.
  const auto weak = weak_.GetWeakPtr();
  if (name != node->GetTitle())
    bookmark_model_->SetTitle(node, name,
                              bookmarks::metrics::BookmarkEditSource::kUser);
  if (!weak)
    return;
  node = Find(id);
  if (ValidNode(node, false) && node->url() != url)
    bookmark_model_->SetURL(node, url,
                            bookmarks::metrics::BookmarkEditSource::kUser);
}
void VerticalTabBookmarksView::Impl::Delete(int64_t id, bool folder) {
  const Node* node = Find(id);
  if (!ValidNode(node, folder) || !view_->GetWidget())
    return;
  std::u16string body;
  if (folder)
    body =
        node->GetTitle().empty()
            ? u"Delete this folder and everything inside it?"
            : u"Delete \"" + node->GetTitle() + u"\" and everything inside it?";
  else
    body = node->GetTitle().empty() ? u"Delete this bookmark?"
                                    : u"Delete \"" + node->GetTitle() + u"\"?";
  ShowBookmarkDeleteConfirmation(
      view_->GetWidget()->GetNativeWindow(),
      folder ? u"Delete Folder" : u"Delete Bookmark", body,
      base::BindOnce(&Impl::AcceptDelete, weak_.GetWeakPtr(), id, folder));
}
void VerticalTabBookmarksView::Impl::AcceptDelete(int64_t id,
                                                  bool folder,
                                                  bool accepted) {
  if (!accepted)
    return;
  const Node* node = Find(id);
  if (!ValidNode(node, folder))
    return;
  bookmark_model_->Remove(node, bookmarks::metrics::BookmarkEditSource::kUser,
                          FROM_HERE);
}

VerticalTabBookmarksView::VerticalTabBookmarksView(
    BrowserWindowInterface* browser,
    TabStripModel* model,
    TabHoverCardController* hover,
    tabs::VerticalTabStripStateController* state)
    : views::ScrollView(views::ScrollView::ScrollWithLayers::kEnabled),
      impl_(std::make_unique<Impl>(*this, *browser, *model, hover, state)) {}
VerticalTabBookmarksView::~VerticalTabBookmarksView() = default;
void VerticalTabBookmarksView::SetProjectionChangedCallback(
    BookmarkDragProjectionChangedCallback callback) {
  impl_->projection_changed_ = std::move(callback);
  if (impl_->projection_changed_)
    impl_->projection_changed_.Run();
}
void VerticalTabBookmarksView::SetDragCallbacks(
    BookmarkDragBeginCallback begin,
    BookmarkDragDetachedCallback detached,
    BookmarkDragFinishedCallback finished) {
  impl_->begin_drag_ = std::move(begin);
  impl_->detached_ = std::move(detached);
  impl_->finished_ = std::move(finished);
}
void VerticalTabBookmarksView::SetContentsChangedCallback(
    base::RepeatingCallback<void(bool)> callback) {
  impl_->contents_changed_ = std::move(callback);
  if (impl_->contents_changed_)
    impl_->contents_changed_.Run(impl_->has_contents_);
}
void VerticalTabBookmarksView::SetActivatedCallback(
    base::RepeatingClosure callback) {
  impl_->activated_ = std::move(callback);
}
void VerticalTabBookmarksView::SetActiveBookmark(std::optional<int64_t> id,
                                                 bool selection) {
  impl_->selected_node_ = id;
  impl_->show_selection_ = selection;
  impl_->RefreshTabState();
}
void VerticalTabBookmarksView::SetExcludedUrls(std::vector<GURL> urls) {
  impl_->excluded_urls_ = std::move(urls);
}
void VerticalTabBookmarksView::SetCompact(bool compact) {
  if (impl_->compact_ == compact)
    return;
  impl_->compact_ = compact;
  for (auto [node, row] : impl_->rows_)
    row->SetCompact(compact);
}
void VerticalTabBookmarksView::SetFoldersOnly(bool only) {
  if (impl_->folders_only_ == only)
    return;
  impl_->folders_only_ = only;
  impl_->RequestRebuild(false);
}
void VerticalTabBookmarksView::SetBookmarkTabAssociations(
    std::map<tabs::TabHandle, BookmarkTabRepresentation> associations) {
  impl_->associations_ = std::move(associations);
  impl_->RefreshTabState();
}
const Node* VerticalTabBookmarksView::FindNode(int64_t id) const {
  return impl_->Find(id);
}
bookmarks::BookmarkModel* VerticalTabBookmarksView::bookmark_model() const {
  return impl_->bookmark_model_;
}
std::optional<tabs::TabHandle> VerticalTabBookmarksView::GetAssociatedTabHandle(
    const Node& node) const {
  auto index = impl_->LiveIndex(node);
  return index ? std::make_optional(
                     impl_->tabs_->GetTabAtIndex(*index)->GetHandle())
               : std::nullopt;
}
bool VerticalTabBookmarksView::TakePendingNavigation(
    const GURL& url,
    BookmarkTabRepresentation* output) {
  auto& pending = impl_->pending_navigation_;
  if (!url.is_valid())
    return false;
  auto it = std::ranges::find_if(
      pending, [&url](const Impl::PendingNavigation& item) {
        return item.url.is_valid() && item.url.EqualsIgnoringRef(url);
      });
  if (it == pending.end())
    return false;
  if (output)
    *output = BookmarkTabRepresentation{it->node_id, it->host};
  pending.erase(it);
  return true;
}
bool VerticalTabBookmarksView::drag_projection_active() const {
  return impl_->projection_active_;
}
bool VerticalTabBookmarksView::drag_projection_detached() const {
  return impl_->projection_detached_;
}
const gfx::Point& VerticalTabBookmarksView::drag_screen_point() const {
  return impl_->projection_point_;
}
const std::u16string& VerticalTabBookmarksView::drag_title() const {
  return impl_->projection_title_;
}
const Node* VerticalTabBookmarksView::dragged_node() const {
  return impl_->drag_node_;
}
void VerticalTabBookmarksView::CancelDrag() {
  impl_->ClearDrag(true, true);
}
void VerticalTabBookmarksView::RetireForProfileChange() {
  if (impl_->retired_)
    return;
  impl_->retired_ = true;
  impl_->weak_.InvalidateWeakPtrs();
  impl_->projection_changed_.Reset();
  impl_->begin_drag_.Reset();
  impl_->detached_.Reset();
  impl_->finished_.Reset();
  impl_->contents_changed_.Reset();
  impl_->activated_.Reset();
  impl_->ClearDrag(false, false);
  impl_->HideBookmarkHoverCard();
  ++impl_->folder_menu_.generation;
  ++impl_->url_menu_.generation;
  impl_->folder_menu_.runner.reset();
  impl_->url_menu_.runner.reset();
  impl_->folder_menu_.model.reset();
  impl_->url_menu_.model.reset();
  impl_->tab_menu_.reset();
  impl_->bookmark_observation_.Reset();
  impl_->bookmark_model_ = nullptr;
  if (impl_->tabs_)
    impl_->tabs_->RemoveObserver(impl_.get());
  impl_->tabs_ = nullptr;
  impl_->has_contents_ = false;
  impl_->pending_navigation_.clear();
  impl_->associations_.clear();
  impl_->bounds_->Complete();
  impl_->height_animation_.Stop();
  impl_->rows_.clear();
  impl_->visible_.clear();
  impl_->depths_.clear();
  impl_->contents_->RemoveAllChildViews();
  SetVisible(false);
}
BEGIN_METADATA(VerticalTabBookmarksView)
END_METADATA
}  // namespace aux
