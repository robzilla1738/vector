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
#include "ui/gfx/font_list.h"
#include "ui/gfx/geometry/rect_f.h"
#include "ui/gfx/text_constants.h"
#include "ui/gfx/vector_icon_types.h"
#include "ui/views/accessibility/view_accessibility.h"
#include "ui/views/controls/highlight_path_generator.h"
#include "ui/views/controls/image_view.h"
#include "ui/views/controls/label.h"
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
class OrganizationTreeRow final : public views::View {
  METADATA_HEADER(OrganizationTreeRow, views::View)
 public:
  OrganizationTreeRow(base::WeakPtr<AuxOrganizationTreeView> owner,
      const organization::Entry& entry, int depth, bool active)
      : owner_(owner), id_(entry.id), folder_(entry.kind == organization::EntryKind::kFolder), active_(active) {
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
        SetTooltipText(base::UTF8ToUTF16(entry.current_url) + u"\nUpdated in another window. Right-click to use the shared URL.");
        auto* marker = AddChildView(std::make_unique<views::Label>(u"•"));
        marker->SetAutoColorReadabilityEnabled(false);
        marker->SetEnabledColor(0xff30b4dc);
        marker->SetCanProcessEventsWithinSubtree(false);
      }
    }
  }
  void MarkDrop(bool value) { drop_ = value; SchedulePaint(); }
  bool OnMousePressed(const ui::MouseEvent& event) override {
    if (!owner_) return false;
    gfx::Point point = event.location(); ConvertPointToScreen(this, &point);
    if (event.IsRightMouseButton()) { owner_->ContextMenu(id_, point); return true; }
    if (!event.IsOnlyLeftMouseButton()) return false;
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
    label_->SetEnabledColor(active_ ? (dark ? 0xfffafafa : 0xff0a0a0a) : (dark ? 0xa6fafafa : 0xb80a0a0a));
    image_->SetImage(!favicon_.IsEmpty() ? favicon_ : ui::ImageModel::FromVectorIcon(folder_ ? kFolderIcon : kPageIcon,
        dark ? 0x8cfafafa : 0x8c0a0a0a, 16));
  }
 protected:
  void OnPaintBackground(gfx::Canvas* canvas) override {
    if (!GetWidget() || (!active_ && !hovered_ && !pressed_ && !drop_)) return;
    const bool dark = GetWidget()->GetColorMode() == ui::ColorProviderKey::ColorMode::kDark;
    cc::PaintFlags flags; flags.setAntiAlias(true);
    flags.setColor(pressed_ ? (dark ? 0x26fafafa : 0x260a0a0a) : active_ ? (dark ? 0x14fafafa : 0xffffffff) : 0x14fafafa);
    if (!dark && !active_ && !pressed_) flags.setColor(0x140a0a0a);
    canvas->DrawRoundRect(gfx::RectF(GetLocalBounds()), 10, flags);
    if (drop_) { flags.setStyle(cc::PaintFlags::kStroke_Style); flags.setStrokeWidth(1.5f); flags.setColor(dark ? 0x33fafafa : 0x260a0a0a);
      auto rect = gfx::RectF(GetLocalBounds()); rect.Inset(0.75f); canvas->DrawRoundRect(rect, 10, flags); }
  }
 private:
  base::WeakPtr<AuxOrganizationTreeView> owner_;
  std::string id_;
  bool folder_, active_, hovered_ = false, pressed_ = false, drop_ = false;
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
  std::string focused;
  for (const auto& [id, row] : row_by_id_) if (row->HasFocus()) focused = id;
  row_by_id_.clear(); visible_.clear(); rows_->RemoveAllChildViews();
  if (ready_) {
    struct Pending { std::string id; int depth; };
    std::vector<Pending> pending;
    auto children = organization::OrderedChildren(*snapshot,
        scope_ == Scope::kPinnedFolders ? std::string() : window_->ActiveSpaceId(), "");
    for (auto it = children.rbegin(); it != children.rend(); ++it) {
      if (scope_ != Scope::kPinnedFolders || snapshot->entries.at(*it).kind == organization::EntryKind::kFolder)
        pending.push_back({*it, 0});
    }
    while (!pending.empty()) {
      auto item = std::move(pending.back()); pending.pop_back();
      const auto& entry = snapshot->entries.at(item.id);
      auto* row = rows_->AddChildView(std::make_unique<OrganizationTreeRow>(weak_.GetWeakPtr(), entry,
          item.depth, window_->SelectedLogicalTabId() == item.id));
      row_by_id_[item.id] = row; visible_.push_back(item.id);
      if (entry.kind == organization::EntryKind::kFolder && !entry.collapsed) {
        auto nested = organization::OrderedChildren(*snapshot, entry.space_id, entry.id);
        for (auto it = nested.rbegin(); it != nested.rend(); ++it) pending.push_back({*it, item.depth + 1});
      }
    }
    if (auto it = row_by_id_.find(focused); it != row_by_id_.end()) it->second->RequestFocus();
  }
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
  const auto* snapshot = Snapshot(); if (!snapshot) return;
  auto found = snapshot->entries.find(id); if (found == snapshot->entries.end() || found->second.archived) return;
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
  const auto* snapshot = Snapshot(); if (!snapshot || !snapshot->entries.contains(id)) return;
  menu_context_ = CaptureOrganizationContext(*browser_); if (!menu_context_) return;
  menu_entry_ = id; runner_.reset(); move_targets_.clear();
  menu_ = std::make_unique<ui::SimpleMenuModel>(this);
  const auto& entry = snapshot->entries.at(id);
  menu_->AddItem(1, u"Rename…");
  if (entry.kind == organization::EntryKind::kFolder) menu_->AddItem(2, u"New folder inside…");
  else {
    menu_->AddItem(3, u"Unload tab");
    auto* window = AuxOrganizationWindowController::FromBrowser(browser_.get());
    if (window && window->HasPendingSharedUpdate(id)) menu_->AddItem(8, u"Use shared URL from another window");
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
  if (!entry.space_id.empty()) menu_->AddItem(6, u"Archive");
  menu_->AddSeparator(ui::NORMAL_SEPARATOR); menu_->AddItem(7, u"Undo organization change");
  runner_ = std::make_unique<views::MenuRunner>(menu_.get(), views::MenuRunner::CONTEXT_MENU);
  runner_->RunMenuAt(GetWidget(), nullptr, gfx::Rect(point, gfx::Size()),
      views::MenuAnchorPosition::kTopLeft, ui::mojom::MenuSourceType::kMouse);
}
bool AuxOrganizationTreeView::IsCommandIdEnabled(int command) const {
  return command != 7 || !undo_token_.empty();
}
void AuxOrganizationTreeView::ExecuteCommand(int command, int) {
  const auto* snapshot = Snapshot(); if (!snapshot || !menu_context_) return;
  auto found = snapshot->entries.find(menu_entry_); if (found == snapshot->entries.end()) return;
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
      if (view && !success) view->Status(u"Active work prevented this item from being archived.");
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
  CancelDrag(); if (!browser_) return;
  auto context = CaptureOrganizationContext(*browser_);
  if (context) drag_ = Drag{id, {}, point, std::move(*context), false, false};
}
void AuxOrganizationTreeView::ContinueDrag(const gfx::Point& point) {
  if (!drag_ || (!drag_->moved && (point - drag_->origin).LengthSquared() < 36)) return;
  drag_->moved = true; drag_->target.clear();
  for (const auto& [id, row] : row_by_id_) {
    const auto bounds = row->GetBoundsInScreen(); const bool over = id != drag_->id && bounds.Contains(point);
    row->MarkDrop(over);
    if (over) { drag_->target = id; drag_->after = point.y() >= bounds.CenterPoint().y(); }
  }
}
void AuxOrganizationTreeView::CancelDrag() {
  drag_.reset(); for (const auto& [id, row] : row_by_id_) row->MarkDrop(false);
}
void AuxOrganizationTreeView::FinishDrag() {
  auto drag = std::move(drag_); CancelDrag();
  const auto* snapshot = Snapshot();
  if (!drag || !drag->moved || !snapshot || !snapshot->entries.contains(drag->target)) return;
  const auto target = snapshot->entries.at(drag->target);
  const bool folder = target.kind == organization::EntryKind::kFolder;
  Move(drag->id, target.space_id, folder ? target.id : target.parent_id,
      folder ? kEnd : target.order + (drag->after ? 1 : 0), std::move(drag->context));
}
BEGIN_METADATA(AuxOrganizationTreeView)
END_METADATA
}  // namespace aux
