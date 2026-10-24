// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_organization_tree_view.h"
#include <algorithm>
#include <limits>
#include <utility>
#include "base/functional/bind.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/single_thread_task_runner.h"
#include "base/task/cancelable_task_tracker.h"
#include "chrome/browser/favicon/favicon_service_factory.h"
#include "components/favicon/core/favicon_service.h"
#include "components/favicon_base/favicon_types.h"
#include "base/uuid.h"
#include "base/time/time.h"
#include "chrome/browser/themes/aux_theme_editor.h"
#include "cc/paint/paint_flags.h"
#include "chrome/browser/aux/organization/organization_profile_service.h"
#include "chrome/browser/aux/organization/organization_service.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/views/frame/aux_organization_ui_commands.h"
#include "chrome/browser/ui/views/frame/aux_organization_window_delegate.h"
#include "chrome/browser/ui/views/frame/aux_organization_window_controller.h"
#include "chrome/browser/ui/views/frame/aux_tab_expand_chevron_view.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/base/mojom/menu_source_type.mojom.h"
#include "ui/base/models/image_model.h"
#include "ui/color/color_provider_key.h"
#include "ui/events/event.h"
#include "ui/events/keycodes/keyboard_codes.h"
#include "ui/gfx/canvas.h"
#include "ui/gfx/animation/animation_delegate.h"
#include "ui/gfx/animation/linear_animation.h"
#include "ui/gfx/animation/tween.h"
#include "ui/gfx/geometry/transform.h"
#include "ui/gfx/shadow_value.h"
#include "ui/gfx/skia_paint_util.h"
#include "ui/gfx/skia_util.h"
#include "third_party/skia/include/core/SkPath.h"
#include "ui/gfx/font_list.h"
#include "ui/gfx/geometry/rect_f.h"
#include "ui/gfx/text_constants.h"
#include "ui/gfx/vector_icon_types.h"
#include "ui/views/accessibility/view_accessibility.h"
#include "ui/views/controls/highlight_path_generator.h"
#include "ui/views/controls/image_view.h"
#include "ui/views/controls/label.h"
#include "ui/views/controls/button/label_button.h"
#include "ui/views/controls/menu/menu_runner.h"
#include "ui/views/controls/menu/menu_types.h"
#include "ui/views/layout/box_layout.h"
#include "ui/views/style/typography.h"
#include "ui/views/view_class_properties.h"
#include "ui/views/widget/widget.h"
namespace aux {
namespace {
// Reuse supplied glyph geometry; HTML/bookmark data is not used as tab state.
#include "chrome/browser/ui/views/frame/aux_vertical_bookmark_row_icons.inc"
constexpr uint64_t kEnd = std::numeric_limits<uint64_t>::max();
}  // namespace
class OrganizationTreeRow final : public views::View, public gfx::AnimationDelegate {
  METADATA_HEADER(OrganizationTreeRow, views::View)
 public:
  OrganizationTreeRow(base::WeakPtr<AuxOrganizationTreeView> owner,
      const organization::Entry& entry, int depth, bool active, bool animate_selection = false)
      : owner_(owner), id_(entry.id), folder_(entry.kind == organization::EntryKind::kFolder), active_(active),
        animate_selection_(animate_selection), selection_(base::Milliseconds(140), 60, this) {
    if (!folder_ && owner_ && owner_->browser_)
      if (auto* controller = AuxOrganizationWindowController::FromBrowser(owner_->browser_.get()))
        selected_ = controller->IsLogicalTabSelected(id_);
    auto* layout = SetLayoutManager(std::make_unique<views::BoxLayout>(
        views::BoxLayout::Orientation::kHorizontal, gfx::Insets::TLBR(6, 8 + depth * 14, 6, 8)));
    layout->set_cross_axis_alignment(views::BoxLayout::CrossAxisAlignment::kCenter);
    image_ = AddChildView(std::make_unique<views::ImageView>());
    image_->SetImageSize(gfx::Size(16, 16));
    image_->SetCanProcessEventsWithinSubtree(false);
    image_->SetProperty(views::kMarginsKey, gfx::Insets::TLBR(0, 0, 0, 8));
    label_ = AddChildView(std::make_unique<views::Label>(base::UTF8ToUTF16(entry.title.empty() ? entry.current_url : entry.title),
        views::style::CONTEXT_LABEL, views::style::STYLE_PRIMARY));
    label_->SetCanProcessEventsWithinSubtree(false);
    label_->SetHorizontalAlignment(gfx::ALIGN_TO_HEAD);
    label_->SetElideBehavior(gfx::FADE_TAIL);
    label_->SetAutoColorReadabilityEnabled(false);
    label_->SetSubpixelRenderingEnabled(false);
    label_->SetBackgroundColor(SK_ColorTRANSPARENT);
    label_->SetFontList(label_->font_list().DeriveWithSizeDelta(2).DeriveWithWeight(gfx::Font::Weight::NORMAL));
    layout->SetFlexForView(label_, 1);
    if (folder_) AddChildView(std::make_unique<AuxTabExpandChevronView>(!entry.collapsed));
    SetFocusBehavior(FocusBehavior::ALWAYS);
    SetNotifyEnterExitOnChild(true);
    GetViewAccessibility().SetName(std::u16string(label_->GetText()));
    SetTooltipText(base::UTF8ToUTF16(folder_ ? entry.title : entry.current_url));
    views::InstallRoundRectHighlightPathGenerator(this, gfx::Insets(), 10);
    if (!folder_ && owner_ && owner_->browser_) {
      auto* profile = owner_->browser_->GetProfile();
      if (auto* service = FaviconServiceFactory::GetForProfile(profile, ServiceAccessType::EXPLICIT_ACCESS)) {
        service->GetFaviconImageForPageURL(GURL(entry.current_url), base::BindOnce(
            [](base::WeakPtr<OrganizationTreeRow> row, Profile* expected,
               const favicon_base::FaviconImageResult& result) {
              if (!row || !row->owner_ || !row->owner_->browser_ ||
                  row->owner_->browser_->GetProfile() != expected || result.image.IsEmpty()) return;
              row->favicon_ = ui::ImageModel::FromImage(result.image);
              row->image_->SetImage(row->favicon_);
            }, weak_.GetWeakPtr(), profile), &icon_tasks_);
      }
      if (auto* window = AuxOrganizationWindowController::FromBrowser(owner_->browser_.get());
          window && window->HasPendingSharedUpdate(entry.id)) {
        SetTooltipText(base::UTF8ToUTF16(entry.current_url) + u"\nUpdated in another window. Right-click to use the shared URL or keep an independent copy.");
        auto* marker = AddChildView(std::make_unique<views::Label>(u"•"));
        marker->SetAutoColorReadabilityEnabled(false);
        marker->SetEnabledColor(0xff30b4dc);
        marker->SetCanProcessEventsWithinSubtree(false);
      }
    }
  }
  bool active() const { return active_; }
  void AddedToWidget() override {
    views::View::AddedToWidget();
    if (!std::exchange(animate_selection_, false) || !active_ ||
        !gfx::Animation::ShouldRenderRichAnimation() || gfx::Animation::PrefersReducedMotion()) return;
    const auto alive = weak_.GetWeakPtr();
    gfx::Transform transform; transform.Translate(-2.f, 0.f);
    SetTransform(transform);
    if (alive) selection_.Start();
  }
  void AnimationProgressed(const gfx::Animation* animation) override {
    if (!gfx::Animation::ShouldRenderRichAnimation() || gfx::Animation::PrefersReducedMotion()) {
      selection_.End(); return;
    }
    const double remaining = 1.0 - gfx::Tween::CalculateValue(
        gfx::Tween::FAST_OUT_SLOW_IN, animation->GetCurrentValue());
    gfx::Transform transform; transform.Translate(-2.0 * remaining, 0.0);
    SetTransform(transform);
  }
  void AnimationEnded(const gfx::Animation*) override { SetTransform(gfx::Transform()); }
  void AnimationCanceled(const gfx::Animation*) override { SetTransform(gfx::Transform()); }
  void MarkDrop(bool value, AuxOrganizationTreeView::DropEdge edge = AuxOrganizationTreeView::DropEdge::kNone) {
    drop_ = value; drop_edge_ = edge; SchedulePaint();
  }
  bool OnMousePressed(const ui::MouseEvent& event) override {
    if (!owner_) return false;
    gfx::Point point = event.location(); ConvertPointToScreen(this, &point);
    if (event.IsRightMouseButton()) { owner_->ContextMenu(id_, point); return true; }
    if (!event.IsOnlyLeftMouseButton()) return false;
    if (!folder_ && !id_.starts_with("recovery:") && (event.IsCommandDown() || event.IsShiftDown())) {
      RequestFocus();
      const auto owner = owner_; const auto id = id_;
      owner->CancelDrag();
      auto* controller = owner->browser_ ? AuxOrganizationWindowController::FromBrowser(owner->browser_.get()) : nullptr;
      const bool selected = controller && controller->SelectLoadedLogicalTab(
          id, event.IsCommandDown(), event.IsShiftDown(), owner->visible_);
      if (owner) owner->Status(selected ? u"" : u"Select tabs already open in this window and Space. Open an unloaded tab with a regular click first.");
      // Modifier selection is completed on press; release must not collapse it
      // through ordinary activation or start a logical organization drag.
      return true;
    }
    RequestFocus(); pressed_ = true; SchedulePaint();
    owner_->BeginDrag(id_, point);
    return true;
  }
  bool OnMouseDragged(const ui::MouseEvent& event) override {
    if (!pressed_ || !owner_) return false;
    gfx::Point point = event.location(); ConvertPointToScreen(this, &point);
    owner_->ContinueDrag(point); return true;
  }
  void OnMouseReleased(const ui::MouseEvent& event) override {
    if (!pressed_ || !owner_) return;
    pressed_ = false; SchedulePaint();
    const bool dragged = owner_->drag_ && owner_->drag_->moved;
    const auto owner = owner_; const auto id = id_;
    owner->FinishDrag();
    if (owner && !dragged && HitTestPoint(event.location())) owner->Activate(id);
  }
  void OnMouseCaptureLost() override { pressed_ = false; if (owner_) owner_->CancelDrag(); SchedulePaint(); }
  void OnMouseEntered(const ui::MouseEvent&) override { hovered_ = true; SchedulePaint(); }
  void OnMouseExited(const ui::MouseEvent&) override { hovered_ = false; SchedulePaint(); }
  bool OnKeyPressed(const ui::KeyEvent& event) override { return owner_ && owner_->Key(id_, event); }
  void OnThemeChanged() override {
    views::View::OnThemeChanged(); if (!GetWidget()) return;
    const bool dark = GetWidget()->GetColorMode() == ui::ColorProviderKey::ColorMode::kDark;
    label_->SetEnabledColor(ThemeForeground((active_ || selected_) ? (dark ? 0xfffafafa : 0xff0a0a0a) : (dark ? 0xa6fafafa : 0xb80a0a0a)));
    image_->SetImage(!favicon_.IsEmpty() ? favicon_ : ui::ImageModel::FromVectorIcon(folder_ ? kFolderIcon : kPageIcon,
        ThemeForeground(dark ? 0x8cfafafa : 0x8c0a0a0a), 16));
  }
 protected:
  void OnPaintBackground(gfx::Canvas* canvas) override {
    if (!GetWidget() || (!active_ && !selected_ && !hovered_ && !pressed_ && !drop_)) return;
    const bool dark = GetWidget()->GetColorMode() == ui::ColorProviderKey::ColorMode::kDark;
    const gfx::RectF bounds(GetLocalBounds());
    if (active_) {
      // Use the same native soft-shadow primitive as supplied pinned rows.
      // The path and layout bounds remain unchanged; no space is reserved.
      const SkPath path = SkPath::RRect(gfx::RectFToSkRect(bounds), 10, 10);
      canvas->Save();
      gfx::RectF shadow_bounds(bounds); shadow_bounds.Outset(8);
      canvas->ClipRect(shadow_bounds);
      canvas->ClipPath(path, true, SkClipOp::kDifference);
      cc::PaintFlags shadow; shadow.setAntiAlias(true);
      shadow.setLooper(gfx::CreateShadowDrawLooper(
          {gfx::ShadowValue(gfx::Vector2d(0, 2), 5, 0x18000000)}));
      canvas->DrawPath(path, shadow);
      canvas->Restore();
    }
    cc::PaintFlags flags; flags.setAntiAlias(true);
    const SkColor original_foreground = dark ? 0xfffafafa : 0xff0a0a0a;
    const SkColor foreground = ThemeForeground(original_foreground);
    if (foreground != original_foreground) {
      // A real Aux contrast override maps to black/white. Keep fills translucent
      // instead of mapping a light-mode opaque white fill to opaque black,
      // which would make its matching dark foreground unreadable.
      flags.setColor(SkColorSetA(foreground, pressed_ ? 0x26 : 0x14));
    } else {
      flags.setColor(pressed_ ? (dark ? 0x26fafafa : 0x260a0a0a) : (active_ || selected_) ? (dark ? 0x14fafafa : 0xffffffff) : 0x14fafafa);
      if (!dark && !active_ && !selected_ && !pressed_) flags.setColor(0x140a0a0a);
    }
    canvas->DrawRoundRect(bounds, 10, flags);
    if (drop_) {
      auto rect = gfx::RectF(GetLocalBounds()); rect.Inset(0.75f);
      using Edge = AuxOrganizationTreeView::DropEdge;
      if (drop_edge_ != Edge::kNone) {
        if (drop_edge_ == Edge::kLeft || drop_edge_ == Edge::kRight) {
          const float half = rect.width() / 2;
          if (drop_edge_ == Edge::kRight) rect.set_x(rect.x() + half);
          rect.set_width(half);
        } else {
          const float half = rect.height() / 2;
          if (drop_edge_ == Edge::kBottom) rect.set_y(rect.y() + half);
          rect.set_height(half);
        }
        flags.setColor(ThemeForeground(dark ? 0x26fafafa : 0x260a0a0a));
        canvas->DrawRoundRect(rect, 8, flags);
      }
      flags.setStyle(cc::PaintFlags::kStroke_Style);
      flags.setStrokeWidth(1.5f); flags.setColor(ThemeForeground(dark ? 0x66fafafa : 0x590a0a0a));
      canvas->DrawRoundRect(rect, drop_edge_ == Edge::kNone ? 10 : 8, flags);
    }
  }
 private:
  SkColor ThemeForeground(SkColor fallback) const {
    return GetWidget() ? aux_theme::SidebarForeground(
        GetWidget()->GetCurrentColorProviderKey(), GetColorProvider(), fallback) : fallback;
  }
  base::WeakPtr<AuxOrganizationTreeView> owner_;
  std::string id_;
  bool folder_, active_, hovered_ = false, pressed_ = false, drop_ = false;
  bool selected_ = false;
  bool animate_selection_ = false;
  gfx::LinearAnimation selection_;
  AuxOrganizationTreeView::DropEdge drop_edge_ = AuxOrganizationTreeView::DropEdge::kNone;
  raw_ptr<views::ImageView> image_ = nullptr;
  raw_ptr<views::Label> label_ = nullptr;
  ui::ImageModel favicon_;
  base::CancelableTaskTracker icon_tasks_;
  base::WeakPtrFactory<OrganizationTreeRow> weak_{this};
};
BEGIN_METADATA(OrganizationTreeRow)
END_METADATA
AuxOrganizationTreeView::AuxOrganizationTreeView(BrowserWindowInterface& browser,
    OrganizationWindowDelegate& window, Scope scope)
    : browser_(browser.GetWeakPtr()), window_(window), scope_(scope) {
  SetLayoutManager(std::make_unique<views::BoxLayout>(views::BoxLayout::Orientation::kVertical));
  rows_ = AddChildView(std::make_unique<views::View>());
  rows_->SetLayoutManager(std::make_unique<views::BoxLayout>(views::BoxLayout::Orientation::kVertical));
  status_ = AddChildView(std::make_unique<views::Label>());
  status_->SetMultiLine(true); status_->SetHorizontalAlignment(gfx::ALIGN_TO_HEAD); status_->SetVisible(false);
  archive_toggle_ = AddChildView(std::make_unique<views::LabelButton>(base::BindRepeating(
      [](base::WeakPtr<AuxOrganizationTreeView> view) {
        if (view) { view->archive_mode_ = !view->archive_mode_; view->QueueRefresh(); }
      }, weak_.GetWeakPtr()), u"Archived tabs and folders"));
  archive_toggle_->SetVisible(false);
  archive_toggle_->SetHasInkDropActionOnClick(false);
  auto* owner = organization::OrganizationProfileServiceFactory::GetForProfile(browser.GetProfile());
  if (owner) ready_subscription_ = owner->ObserveReady(base::BindRepeating(&AuxOrganizationTreeView::Bind, weak_.GetWeakPtr()));
  window_changes_ = window_->ObserveWindowState(base::BindRepeating(&AuxOrganizationTreeView::QueueRefresh, weak_.GetWeakPtr()));
  Bind();
}
AuxOrganizationTreeView::~AuxOrganizationTreeView() = default;
const organization::Snapshot* AuxOrganizationTreeView::Snapshot() const {
  if (!browser_) return nullptr;
  auto* owner = organization::OrganizationProfileServiceFactory::GetForProfileIfExists(browser_->GetProfile());
  return owner && owner->model() ? &owner->model()->snapshot() : nullptr;
}
void AuxOrganizationTreeView::SetReadyChangedCallback(base::RepeatingCallback<void(bool)> callback) {
  ready_changed_ = std::move(callback); if (ready_changed_) ready_changed_.Run(ready_);
}
void AuxOrganizationTreeView::Bind() {
  changes_ = {};
  if (browser_) {
    auto* owner = organization::OrganizationProfileServiceFactory::GetForProfileIfExists(browser_->GetProfile());
    if (owner && owner->model()) changes_ = owner->model()->Observe(base::BindRepeating(
        [](base::WeakPtr<AuxOrganizationTreeView> view, const organization::Delta&) { if (view) view->QueueRefresh(); }, weak_.GetWeakPtr()));
  }
  QueueRefresh();
}
void AuxOrganizationTreeView::QueueRefresh() {
  if (refresh_queued_) return;
  refresh_queued_ = true;
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce(&AuxOrganizationTreeView::Refresh, weak_.GetWeakPtr()));
}
void AuxOrganizationTreeView::Refresh() {
  refresh_queued_ = false;
  const auto* snapshot = Snapshot();
  const bool next_ready = snapshot && window_->IsProjectionReady() && (scope_ == Scope::kPinnedFolders || snapshot->spaces.contains(window_->ActiveSpaceId()));
  const bool changed = ready_ != next_ready;
  ready_ = next_ready;
  CancelDrag();
  std::string focused, previous_active;
  for (const auto& [id, row] : row_by_id_) {
    if (row->HasFocus()) focused = id;
    if (row->active()) previous_active = id;
  }
  row_by_id_.clear(); visible_.clear(); rows_->RemoveAllChildViews();
  if (ready_) {
    struct Pending { std::string id; int depth; };
    std::vector<Pending> pending;
    const auto scope = scope_ == Scope::kPinnedFolders ? std::string() : window_->ActiveSpaceId();
    std::vector<std::string> children;
    bool has_archived = false;
    for (const auto& [id, entry] : snapshot->entries) {
      if (entry.space_id != scope || !entry.archived) continue;
      has_archived = true;
      if (archive_mode_ && (entry.parent_id.empty() || !snapshot->entries.at(entry.parent_id).archived)) children.push_back(id);
    }
    archive_toggle_->SetVisible(has_archived || archive_mode_);
    archive_toggle_->SetText(archive_mode_ ? u"Back to tabs" : u"Archived tabs and folders");
    if (!archive_mode_) children = organization::OrderedChildren(*snapshot, scope, "");
    for (auto it = children.rbegin(); it != children.rend(); ++it) {
      if (scope_ != Scope::kPinnedFolders || snapshot->entries.at(*it).kind == organization::EntryKind::kFolder)
        pending.push_back({*it, 0});
    }
    while (!pending.empty()) {
      auto item = std::move(pending.back()); pending.pop_back();
      const auto& entry = snapshot->entries.at(item.id);
      if (!entry.archived && entry.kind == organization::EntryKind::kTab && !window_->ShouldDisplayLogicalEntry(item.id)) continue;
      auto* row = rows_->AddChildView(std::make_unique<OrganizationTreeRow>(weak_.GetWeakPtr(), entry,
          item.depth, window_->SelectedLogicalTabId() == item.id,
          !previous_active.empty() && previous_active != item.id));
      row_by_id_[item.id] = row; visible_.push_back(item.id);
      if (entry.kind == organization::EntryKind::kFolder && !entry.collapsed) {
        auto nested = organization::OrderedChildren(*snapshot, entry.space_id, entry.id, archive_mode_);
        for (auto it = nested.rbegin(); it != nested.rend(); ++it) pending.push_back({*it, item.depth + 1});
      }
    }
    if (!archive_mode_ && scope_ != Scope::kPinnedFolders && browser_) {
      if (auto* controller = AuxOrganizationWindowController::FromBrowser(browser_.get())) {
        for (const auto& recovery : controller->RecoveryEntries()) {
          if (recovery.space_id != scope) continue;
          auto* row = rows_->AddChildView(std::make_unique<OrganizationTreeRow>(weak_.GetWeakPtr(),
              recovery, 0, controller->IsRecoveryActive(recovery.id),
              !previous_active.empty() && previous_active != recovery.id));
          row->SetTooltipText(base::UTF8ToUTF16(recovery.current_url) +
              u"\nClosed from the shared list. This window's page and history were retained. Right-click to keep an independent copy or close this view.");
          row_by_id_[recovery.id] = row; visible_.push_back(recovery.id);
        }
      }
    }
    if (auto it = row_by_id_.find(focused); it != row_by_id_.end()) it->second->RequestFocus();
  }
  if (!ready_) archive_toggle_->SetVisible(false);
  const auto alive = weak_.GetWeakPtr();
  if (changed && ready_changed_) ready_changed_.Run(ready_);
  if (alive) PreferredSizeChanged();
}
void AuxOrganizationTreeView::Status(std::u16string message) {
  status_->SetText(message); status_->SetVisible(!message.empty()); PreferredSizeChanged();
}
void AuxOrganizationTreeView::Apply(organization::Command command,
                                    std::optional<organization::Context> captured) {
  if (!browser_) return;
  if (!captured) captured = CaptureOrganizationContext(*browser_);
  if (!captured) { Status(u"Organization is not ready to save. Please try again."); return; }
  ExecuteOrganizationCommand(browser_, std::move(*captured), std::move(command), base::BindOnce(
      [](base::WeakPtr<AuxOrganizationTreeView> view, organization::CommitResult result) {
        if (!view) return;
        if (result.error == organization::Error::kNone) view->undo_token_ = result.undo_token;
        view->Status(OrganizationErrorMessage(result.error));
      }, weak_.GetWeakPtr()));
}
void AuxOrganizationTreeView::Activate(const std::string& id) {
  if (id.starts_with("recovery:") && browser_) {
    if (auto* controller = AuxOrganizationWindowController::FromBrowser(browser_.get())) controller->ActivateRecovery(id);
    return;
  }
  const auto* snapshot = Snapshot(); if (!snapshot) return;
  auto found = snapshot->entries.find(id); if (found == snapshot->entries.end() || found->second.archived) return;
  if (found->second.archived) {
    organization::Command command; command.action = organization::Action::kRestore; command.id = id; command.index = kEnd;
    Apply(std::move(command)); return;
  }
  if (found->second.kind == organization::EntryKind::kFolder) {
    organization::Command command; command.action = organization::Action::kSetFolderCollapsed;
    command.id = id; command.value = !found->second.collapsed; Apply(std::move(command));
  } else window_->OpenLogicalTab(id, base::BindOnce([](base::WeakPtr<AuxOrganizationTreeView> view, bool success) {
    if (view && !success) view->Status(u"This tab could not be opened in the current window.");
  }, weak_.GetWeakPtr()));
}
void AuxOrganizationTreeView::NewFolder() { Rename({}, true); }
void AuxOrganizationTreeView::Rename(const std::string& id, bool create_child) {
  if (!browser_) return;
  const auto* snapshot = Snapshot(); auto context = CaptureOrganizationContext(*browser_);
  if (!snapshot || !context) return;
  auto entry = snapshot->entries.find(id);
  if (!id.empty() && entry == snapshot->entries.end()) return;
  organization::Command command;
  command.action = create_child ? organization::Action::kCreateFolder : organization::Action::kRenameEntry;
  command.id = create_child ? base::Uuid::GenerateRandomV4().AsLowercaseString() : id;
  command.space_id = scope_ == Scope::kPinnedFolders ? "" : window_->ActiveSpaceId();
  command.parent_id = create_child ? id : ""; command.index = kEnd;
  const auto name = create_child ? std::u16string() : base::UTF8ToUTF16(entry->second.title);
  ShowOrganizationNameDialog(*this, create_child ? u"New folder" : u"Rename", name, std::nullopt,
      base::BindOnce([](base::WeakPtr<AuxOrganizationTreeView> view, organization::Context context,
          organization::Command command, std::u16string name, std::u16string) {
        if (!view || name.empty()) return;
        command.title = base::UTF16ToUTF8(name); view->Apply(std::move(command), std::move(context));
      }, weak_.GetWeakPtr(), std::move(*context), std::move(command)));
}
void AuxOrganizationTreeView::Move(const std::string& id, const std::string& space,
    const std::string& parent, uint64_t index, std::optional<organization::Context> captured) {
  organization::Command command; command.action = organization::Action::kMoveEntry;
  command.id = id; command.space_id = space; command.parent_id = parent; command.index = index;
  Apply(std::move(command), std::move(captured));
}
void AuxOrganizationTreeView::ContextMenu(const std::string& id, const gfx::Point& point) {
  if (!browser_ || !GetWidget()) return;
  const auto* snapshot = Snapshot(); if (!snapshot) return;
  if (id.starts_with("recovery:")) {
    auto* controller = AuxOrganizationWindowController::FromBrowser(browser_.get());
    const auto recoveries = controller ? controller->RecoveryEntries() : std::vector<organization::Entry>();
    if (std::ranges::none_of(recoveries, [&](const auto& row) { return row.id == id; })) return;
    menu_context_ = CaptureOrganizationContext(*browser_); if (!menu_context_) return;
    menu_entry_ = id; runner_.reset(); move_targets_.clear();
    menu_ = std::make_unique<ui::SimpleMenuModel>(this);
    menu_->AddItem(13, u"Keep independent copy");
    menu_->AddItem(14, u"Close this view");
    runner_ = std::make_unique<views::MenuRunner>(menu_.get(), views::MenuRunner::CONTEXT_MENU);
    runner_->RunMenuAt(GetWidget(), nullptr, gfx::Rect(point, gfx::Size()),
        views::MenuAnchorPosition::kTopLeft, ui::mojom::MenuSourceType::kMouse);
    return;
  }
  if (!snapshot->entries.contains(id)) return;
  menu_context_ = CaptureOrganizationContext(*browser_); if (!menu_context_) return;
  auto* service = organization::OrganizationProfileServiceFactory::GetForProfileIfExists(browser_->GetProfile());
  undo_token_ = service && service->model() ? service->model()->LastUndoToken() : "";
  menu_entry_ = id; runner_.reset(); move_targets_.clear();
  menu_ = std::make_unique<ui::SimpleMenuModel>(this);
  const auto& entry = snapshot->entries.at(id);
  if (entry.archived) {
    menu_->AddItem(10, u"Restore");
    runner_ = std::make_unique<views::MenuRunner>(menu_.get(), views::MenuRunner::CONTEXT_MENU);
    runner_->RunMenuAt(GetWidget(), nullptr, gfx::Rect(point, gfx::Size()),
        views::MenuAnchorPosition::kTopLeft, ui::mojom::MenuSourceType::kMouse);
    return;
  }
  menu_->AddItem(1, u"Rename…");
  if (entry.kind == organization::EntryKind::kFolder) menu_->AddItem(2, u"New folder inside…");
  else {
    menu_->AddItem(3, u"Close this view (unload)");
    auto* window = AuxOrganizationWindowController::FromBrowser(browser_.get());
    if (window && window->HasPendingSharedUpdate(id)) {
      menu_->AddItem(8, u"Use shared URL from another window");
      menu_->AddItem(13, u"Keep independent copy");
    }
  }
  menu_->AddItem(4, entry.space_id.empty() ? u"Move to this Space" : u"Pin to all Spaces");
  move_menu_ = std::make_unique<ui::SimpleMenuModel>(this);
  move_targets_.push_back({"", ""}); move_menu_->AddItem(100, u"All Spaces (Pins)");
  for (const auto& [space_id, space] : snapshot->spaces) {
    move_menu_->AddItem(100 + static_cast<int>(move_targets_.size()), base::UTF8ToUTF16(space.name));
    move_targets_.push_back({space_id, ""});
  }
  for (const auto& [folder_id, folder] : snapshot->entries) {
    if (folder.kind != organization::EntryKind::kFolder || folder.archived || folder_id == id) continue;
    const std::string scope = folder.space_id.empty() ? "Pins" : snapshot->spaces.at(folder.space_id).name;
    move_menu_->AddItem(100 + static_cast<int>(move_targets_.size()), base::UTF8ToUTF16(scope + " / " + folder.title));
    move_targets_.push_back({folder.space_id, folder_id});
  }
  menu_->AddSubMenu(5, u"Move to", move_menu_.get());
  if (!entry.space_id.empty()) {
    menu_->AddCheckItem(9, u"Keep in this Space");
    if (entry.kind == organization::EntryKind::kTab) menu_->AddItem(6, u"Close tab everywhere (archive)");
  }
  if (entry.kind == organization::EntryKind::kFolder) {
    menu_->AddItem(11, u"Remove folder, keep contents");
    menu_->AddItem(12, u"Archive folder and contents");
  }
  menu_->AddSeparator(ui::NORMAL_SEPARATOR); menu_->AddItem(7, u"Undo organization change");
  runner_ = std::make_unique<views::MenuRunner>(menu_.get(), views::MenuRunner::CONTEXT_MENU);
  runner_->RunMenuAt(GetWidget(), nullptr, gfx::Rect(point, gfx::Size()),
      views::MenuAnchorPosition::kTopLeft, ui::mojom::MenuSourceType::kMouse);
}
bool AuxOrganizationTreeView::IsCommandIdChecked(int command) const {
  const auto* snapshot = Snapshot();
  return command == 9 && snapshot && snapshot->entries.contains(menu_entry_) &&
      snapshot->entries.at(menu_entry_).keep_in_space;
}
bool AuxOrganizationTreeView::IsCommandIdEnabled(int command) const {
  return command != 7 || !undo_token_.empty();
}
void AuxOrganizationTreeView::ExecuteCommand(int command, int) {
  const auto* snapshot = Snapshot(); if (!snapshot || !menu_context_ || !browser_) return;
  const auto current_context = CaptureOrganizationContext(*browser_);
  if (!current_context || current_context->profile_id != menu_context_->profile_id ||
      current_context->owner_generation != menu_context_->owner_generation ||
      current_context->expected_revision != menu_context_->expected_revision) {
    Status(u"The profile or tab list changed. Open the menu again."); return;
  }
  if (command == 13 || command == 14) {
    auto* controller = AuxOrganizationWindowController::FromBrowser(browser_.get());
    if (!controller) return;
    auto done = base::BindOnce([](base::WeakPtr<AuxOrganizationTreeView> view, bool keeping, bool success) {
      if (view && !success) view->Status(keeping
          ? u"The page changed or could not be rebound. Its existing view was retained; check the tab list before retrying."
          : u"This recovery view has active work and was retained.");
    }, weak_.GetWeakPtr(), command == 13);
    if (command == 13) controller->KeepIndependentCopy(menu_entry_, std::move(done));
    else controller->CloseRecovery(menu_entry_, std::move(done));
    return;
  }
  auto found = snapshot->entries.find(menu_entry_); if (found == snapshot->entries.end()) return;
  if (command == 9 || command == 10 || command == 11) {
    organization::Command change; change.id = menu_entry_; change.index = kEnd;
    change.action = command == 9 ? organization::Action::kSetKeepInSpace :
        command == 10 ? organization::Action::kRestore : organization::Action::kDissolveFolder;
    change.value = !found->second.keep_in_space; Apply(std::move(change), menu_context_); return;
  }
  if (command == 12 && browser_) {
    auto* controller = AuxOrganizationWindowController::FromBrowser(browser_.get());
    if (controller) controller->ArchiveFolderAndContents(menu_entry_, base::BindOnce(
        [](base::WeakPtr<AuxOrganizationTreeView> view, bool success) {
          if (view && !success) view->Status(u"The folder archive could not be saved. Existing views were retained.");
        }, weak_.GetWeakPtr()));
    return;
  }
  if (command == 1 || command == 2) { Rename(menu_entry_, command == 2); return; }
  if (command == 3) {
    window_->UnloadLogicalTab(menu_entry_, base::BindOnce([](base::WeakPtr<AuxOrganizationTreeView> view, bool success) {
      if (view && !success) view->Status(u"This tab has active work and could not be unloaded.");
    }, weak_.GetWeakPtr())); return;
  }
  if (command == 8 && browser_) {
    auto* window = AuxOrganizationWindowController::FromBrowser(browser_.get());
    if (window) window->ApplyPendingSharedUpdate(menu_entry_, base::BindOnce(
        [](base::WeakPtr<AuxOrganizationTreeView> view, bool success) {
          if (view && !success) view->Status(u"This page changed or has active work. Its current URL was retained.");
        }, weak_.GetWeakPtr()));
    return;
  }
  if (command == 4) { Move(menu_entry_, found->second.space_id.empty() ? window_->ActiveSpaceId() : "", "", kEnd, menu_context_); return; }
  if (command >= 100 && static_cast<size_t>(command - 100) < move_targets_.size()) {
    const auto target = move_targets_[command - 100]; Move(menu_entry_, target.first, target.second, kEnd, menu_context_); return;
  }
  if (command == 6) {
    window_->ArchiveLogicalEntry(menu_entry_, base::BindOnce([](base::WeakPtr<AuxOrganizationTreeView> view, bool success) {
      if (view && !success) view->Status(u"The shared close could not be saved. Existing views were retained.");
    }, weak_.GetWeakPtr())); return;
  }
  if (command == 7 && browser_) {
    auto* owner = organization::OrganizationProfileServiceFactory::GetForProfileIfExists(browser_->GetProfile());
    if (owner && owner->model()) owner->model()->Undo(*menu_context_, undo_token_, base::BindOnce(
        [](base::WeakPtr<AuxOrganizationTreeView> view, organization::CommitResult result) {
          if (!view) return; if (result.error == organization::Error::kNone) view->undo_token_ = result.undo_token;
          view->Status(OrganizationErrorMessage(result.error));
        }, weak_.GetWeakPtr()));
  }
}
bool AuxOrganizationTreeView::Key(const std::string& id, const ui::KeyEvent& event) {
  if (id.starts_with("recovery:")) {
    if (event.key_code() == ui::VKEY_RETURN || event.key_code() == ui::VKEY_SPACE) { Activate(id); return true; }
    if (event.key_code() == ui::VKEY_UP || event.key_code() == ui::VKEY_DOWN) {
      const auto current = std::ranges::find(visible_, id);
      if (current != visible_.end()) {
        const int next = static_cast<int>(current - visible_.begin()) + (event.key_code() == ui::VKEY_UP ? -1 : 1);
        if (next >= 0 && static_cast<size_t>(next) < visible_.size()) row_by_id_.at(visible_[next])->RequestFocus();
      }
      return true;
    }
    return false;
  }
  const auto* snapshot = Snapshot(); if (!snapshot || !snapshot->entries.contains(id)) return false;
  const auto entry = snapshot->entries.at(id);
  if (event.key_code() == ui::VKEY_RETURN || event.key_code() == ui::VKEY_SPACE) { Activate(id); return true; }
  if (event.key_code() == ui::VKEY_F2) { Rename(id, false); return true; }
  if (event.key_code() == ui::VKEY_ESCAPE) { CancelDrag(); return true; }
  if (event.key_code() == ui::VKEY_UP || event.key_code() == ui::VKEY_DOWN) {
    const int step = event.key_code() == ui::VKEY_UP ? -1 : 1;
    if (event.IsAltDown()) {
      const uint64_t index = step < 0 ? (entry.order ? entry.order - 1 : 0) : entry.order + 1;
      Move(id, entry.space_id, entry.parent_id, index); return true;
    }
    const auto current = std::ranges::find(visible_, id);
    if (current != visible_.end()) {
      const int next = static_cast<int>(current - visible_.begin()) + step;
      if (next >= 0 && static_cast<size_t>(next) < visible_.size()) row_by_id_.at(visible_[next])->RequestFocus();
    }
    return true;
  }
  if (event.key_code() == ui::VKEY_LEFT || event.key_code() == ui::VKEY_RIGHT) {
    const bool left = event.key_code() == ui::VKEY_LEFT;
    if (event.IsAltDown() && left && !entry.parent_id.empty()) {
      const auto& parent = snapshot->entries.at(entry.parent_id);
      Move(id, entry.space_id, parent.parent_id, parent.order + 1); return true;
    }
    if (entry.kind == organization::EntryKind::kFolder && entry.collapsed != left) {
      organization::Command op; op.action = organization::Action::kSetFolderCollapsed; op.id = id; op.value = left; Apply(std::move(op));
    } else if (left && row_by_id_.contains(entry.parent_id)) row_by_id_.at(entry.parent_id)->RequestFocus();
    return true;
  }
  return false;
}
void AuxOrganizationTreeView::BeginDrag(const std::string& id, const gfx::Point& point) {
  CancelDrag(); if (!browser_ || id.starts_with("recovery:")) return;
  auto context = CaptureOrganizationContext(*browser_);
  if (context) drag_ = Drag{id, {}, point, std::move(*context), false, false};
}
void AuxOrganizationTreeView::ContinueDrag(const gfx::Point& point) {
  if (!drag_ || (!drag_->moved && (point - drag_->origin).LengthSquared() < 36)) return;
  drag_->moved = true; drag_->target.clear(); drag_->edge = DropEdge::kNone;
  const auto* snapshot = Snapshot();
  for (const auto& [id, row] : row_by_id_) {
    const auto bounds = row->GetBoundsInScreen();
    const bool over = id != drag_->id && bounds.Contains(point);
    DropEdge edge = DropEdge::kNone;
    if (over) {
      drag_->target = id; drag_->after = point.y() >= bounds.CenterPoint().y();
      const bool tabs = snapshot && snapshot->entries.contains(id) && snapshot->entries.contains(drag_->id) &&
          snapshot->entries.at(id).kind == organization::EntryKind::kTab &&
          snapshot->entries.at(drag_->id).kind == organization::EntryKind::kTab;
      if (tabs) {
        // Explicit edge targets; the center retains ordinary reordering.
        const int horizontal_edge = std::min(32, bounds.width() / 5);
        if (point.x() < bounds.x() + horizontal_edge) edge = DropEdge::kLeft;
        else if (point.x() >= bounds.right() - horizontal_edge) edge = DropEdge::kRight;
        else if (point.y() < bounds.y() + bounds.height() / 4) edge = DropEdge::kTop;
        else if (point.y() >= bounds.bottom() - bounds.height() / 4) edge = DropEdge::kBottom;
      }
      drag_->edge = edge;
    }
    row->MarkDrop(over, edge);
  }
}
void AuxOrganizationTreeView::CancelDrag() {
  drag_.reset(); for (const auto& [id, row] : row_by_id_) row->MarkDrop(false);
}
void AuxOrganizationTreeView::FinishDrag() {
  auto drag = std::move(drag_); CancelDrag();
  const auto* snapshot = Snapshot();
  if (!drag || !drag->moved || !snapshot || !snapshot->entries.contains(drag->target)) return;
  if (drag->edge != DropEdge::kNone) {
    const auto current = CaptureOrganizationContext(*browser_);
    if (!current || current->profile_id != drag->context.profile_id ||
        current->owner_generation != drag->context.owner_generation ||
        snapshot->revision != drag->context.expected_revision) return;
    const bool stacked = drag->edge == DropEdge::kTop || drag->edge == DropEdge::kBottom;
    const bool leading = drag->edge == DropEdge::kTop || drag->edge == DropEdge::kLeft;
    window_->SplitLogicalTabs(drag->id, drag->target, stacked, leading,
        base::BindOnce([](base::WeakPtr<AuxOrganizationTreeView> owner, bool) {
          if (owner) owner->Refresh();
        }, weak_.GetWeakPtr()));
    return;
  }
  const auto target = snapshot->entries.at(drag->target);
  const bool folder = target.kind == organization::EntryKind::kFolder;
  Move(drag->id, target.space_id, folder ? target.id : target.parent_id,
      folder ? kEnd : target.order + (drag->after ? 1 : 0), std::move(drag->context));
}
BEGIN_METADATA(AuxOrganizationTreeView)
END_METADATA
}  // namespace aux
