// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_spaces_switcher.h"
#include <algorithm>
#include <cmath>
#include <limits>
#include <utility>
#include "base/functional/bind.h"
#include "base/strings/utf_string_conversions.h"
#include "base/uuid.h"
#include "chrome/browser/aux/organization/organization_profile_service.h"
#include "chrome/browser/aux/organization/organization_service.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/views/frame/aux_organization_ui_commands.h"
#include "chrome/browser/ui/views/frame/aux_organization_window_delegate.h"
#include "ui/base/metadata/metadata_impl_macros.h"
#include "ui/base/mojom/menu_source_type.mojom.h"
#include "ui/views/controls/label.h"
#include "ui/color/color_provider_key.h"
#include "ui/gfx/font_list.h"
#include "ui/events/event.h"
#include "ui/events/keycodes/keyboard_codes.h"
#include "ui/views/accessibility/view_accessibility.h"
#include "ui/views/controls/button/label_button.h"
#include "ui/views/controls/menu/menu_runner.h"
#include "ui/views/controls/menu/menu_types.h"
#include "ui/views/layout/box_layout.h"
#include "ui/views/widget/widget.h"
namespace aux {
namespace {
class SpaceSelectorButton final : public views::LabelButton {
 public:
  explicit SpaceSelectorButton(PressedCallback callback)
      : LabelButton(std::move(callback), u"Space") {
    const gfx::FontList font;
    label()->SetFontList(font.Derive(12 - font.GetFontSize(), gfx::Font::NORMAL,
                                    gfx::Font::Weight::MEDIUM));
  }
};
std::vector<organization::Space> Spaces(BrowserWindowInterface& browser) {
  auto* owner = organization::OrganizationProfileServiceFactory::GetForProfileIfExists(browser.GetProfile());
  std::vector<organization::Space> result;
  if (owner && owner->model()) {
    for (const auto& [id, space] : owner->model()->snapshot().spaces) result.push_back(space);
    std::ranges::sort(result, {}, &organization::Space::order);
  }
  return result;
}
}  // namespace
AuxSpacesSwitcher::AuxSpacesSwitcher(BrowserWindowInterface& browser,
                                     OrganizationWindowDelegate& window)
    : browser_(browser.GetWeakPtr()), window_(window) {
  SetLayoutManager(std::make_unique<views::BoxLayout>(views::BoxLayout::Orientation::kHorizontal));
  select_ = AddChildView(std::make_unique<SpaceSelectorButton>(
      base::BindRepeating(&AuxSpacesSwitcher::ShowMenu, weak_.GetWeakPtr())));
  select_->SetTooltipText(u"Switch Space");
  select_->SetAnimateOnStateChange(false);
  select_->SetHasInkDropActionOnClick(false);
  select_->SetMaxSize(gfx::Size(112, 24));
  add_ = AddChildView(std::make_unique<views::LabelButton>(
      base::BindRepeating(&AuxSpacesSwitcher::Edit, weak_.GetWeakPtr(), true), u"+"));
  add_->SetTooltipText(u"Create a Space");
  add_->GetViewAccessibility().SetName(u"Create a Space");
  add_->SetPreferredSize(gfx::Size(24, 24));
  SetFocusBehavior(FocusBehavior::ALWAYS);
  auto* owner = organization::OrganizationProfileServiceFactory::GetForProfile(browser.GetProfile());
  if (owner) ready_ = owner->ObserveReady(base::BindRepeating(&AuxSpacesSwitcher::Bind, weak_.GetWeakPtr()));
  window_changes_ = window_->ObserveWindowState(base::BindRepeating(&AuxSpacesSwitcher::Refresh, weak_.GetWeakPtr()));
  Bind();
}
AuxSpacesSwitcher::~AuxSpacesSwitcher() = default;
void AuxSpacesSwitcher::Bind() {
  changes_ = {};
  if (!browser_) return;
  auto* owner = organization::OrganizationProfileServiceFactory::GetForProfileIfExists(browser_->GetProfile());
  if (owner && owner->model()) changes_ = owner->model()->Observe(base::BindRepeating(
      [](base::WeakPtr<AuxSpacesSwitcher> view, const organization::Delta&) { if (view) view->Refresh(); }, weak_.GetWeakPtr()));
  Refresh();
}
void AuxSpacesSwitcher::Refresh() {
  if (!browser_) { SetEnabled(false); return; }
  auto spaces = Spaces(*browser_);
  SetEnabled(!spaces.empty());
  for (const auto& space : spaces) {
    if (space.id == window_->ActiveSpaceId()) {
      select_->SetText(base::UTF8ToUTF16(space.icon + " " + space.name));
      select_->GetViewAccessibility().SetName(u"Space: " + base::UTF8ToUTF16(space.name));
      return;
    }
  }
  select_->SetText(u"Choose Space");
}
void AuxSpacesSwitcher::ShowMenu() {
  if (!browser_ || !GetWidget()) return;
  runner_.reset();
  menu_ = std::make_unique<ui::SimpleMenuModel>(this);
  menu_spaces_.clear();
  for (const auto& space : Spaces(*browser_)) {
    menu_->AddItem(100 + static_cast<int>(menu_spaces_.size()), base::UTF8ToUTF16(space.icon + " " + space.name));
    menu_spaces_.push_back(space.id);
  }
  menu_->AddSeparator(ui::NORMAL_SEPARATOR);
  menu_->AddItem(1, u"New Space…");
  menu_->AddItem(2, u"Edit Space…");
  menu_->AddItem(3, u"Remove empty Space");
  menu_->AddSeparator(ui::NORMAL_SEPARATOR);
  menu_->AddItem(4, u"New folder in this Space…");
  menu_->AddItem(5, u"New pinned folder…");
  runner_ = std::make_unique<views::MenuRunner>(menu_.get(), views::MenuRunner::COMBOBOX);
  runner_->RunMenuAt(GetWidget(), nullptr, select_->GetBoundsInScreen(),
      views::MenuAnchorPosition::kTopLeft, ui::mojom::MenuSourceType::kMouse);
}
void AuxSpacesSwitcher::ExecuteCommand(int command, int) {
  if (!browser_) return;
  if (command >= 100 && static_cast<size_t>(command - 100) < menu_spaces_.size()) {
    window_->SelectSpace(menu_spaces_[command - 100]); return;
  }
  if (command == 1 || command == 2) { Edit(command == 1); return; }
  if (command == 4 || command == 5) { NewFolder(command == 5); return; }
  if (command != 3) return;
  auto context = CaptureOrganizationContext(*browser_);
  if (!context) return;
  organization::Command operation;
  operation.action = organization::Action::kRemoveEmptySpace;
  operation.id = window_->ActiveSpaceId();
  ExecuteOrganizationCommand(browser_, std::move(*context), std::move(operation),
      base::BindOnce([](base::WeakPtr<AuxSpacesSwitcher> view, organization::CommitResult result) {
        if (!view) return;
        view->select_->SetTooltipText(OrganizationErrorMessage(result.error));
        view->Refresh();
      }, weak_.GetWeakPtr()));
}
void AuxSpacesSwitcher::Edit(bool create) {
  if (!browser_) return;
  auto context = CaptureOrganizationContext(*browser_);
  if (!context) return;
  std::u16string name, icon = u"◉";
  const auto id = create ? base::Uuid::GenerateRandomV4().AsLowercaseString() : window_->ActiveSpaceId();
  if (!create) for (const auto& space : Spaces(*browser_)) if (space.id == id) {
    name = base::UTF8ToUTF16(space.name); icon = base::UTF8ToUTF16(space.icon);
  }
  ShowOrganizationNameDialog(*this, create ? u"New Space" : u"Edit Space", name, icon,
      base::BindOnce([](base::WeakPtr<AuxSpacesSwitcher> view, organization::Context context,
          std::string id, bool create, std::u16string name, std::u16string icon) {
        if (!view || name.empty()) return;
        organization::Command command;
        command.action = create ? organization::Action::kCreateSpace : organization::Action::kRenameSpace;
        command.id = id; command.title = base::UTF16ToUTF8(name); command.icon = base::UTF16ToUTF8(icon);
        command.index = std::numeric_limits<uint64_t>::max();
        ExecuteOrganizationCommand(view->browser_, std::move(context), std::move(command),
          base::BindOnce([](base::WeakPtr<AuxSpacesSwitcher> view, std::string id, bool create,
              organization::CommitResult result) {
            if (!view) return;
            if (result.error == organization::Error::kNone && create) view->window_->SelectSpace(id);
            view->select_->SetTooltipText(OrganizationErrorMessage(result.error));
            view->Refresh();
          }, view, std::move(id), create));
      }, weak_.GetWeakPtr(), std::move(*context), id, create));
}
void AuxSpacesSwitcher::NewFolder(bool global) {
  if (!browser_) return;
  auto context = CaptureOrganizationContext(*browser_); if (!context) return;
  const std::string space = global ? "" : window_->ActiveSpaceId();
  ShowOrganizationNameDialog(*this, global ? u"New pinned folder" : u"New folder", {}, std::nullopt,
      base::BindOnce([](base::WeakPtr<AuxSpacesSwitcher> view, organization::Context context,
          std::string space, std::u16string name, std::u16string) {
        if (!view || name.empty()) return;
        organization::Command command; command.action = organization::Action::kCreateFolder;
        command.id = base::Uuid::GenerateRandomV4().AsLowercaseString();
        command.space_id = space; command.title = base::UTF16ToUTF8(name);
        command.index = std::numeric_limits<uint64_t>::max();
        ExecuteOrganizationCommand(view->browser_, std::move(context), std::move(command),
            base::BindOnce([](base::WeakPtr<AuxSpacesSwitcher> view, organization::CommitResult result) {
              if (view) view->select_->SetTooltipText(OrganizationErrorMessage(result.error));
            }, view));
      }, weak_.GetWeakPtr(), std::move(*context), space));
}
void AuxSpacesSwitcher::OnThemeChanged() {
  views::View::OnThemeChanged(); if (!GetWidget()) return;
  const bool dark = GetWidget()->GetColorMode() == ui::ColorProviderKey::ColorMode::kDark;
  select_->SetEnabledTextColors(dark ? 0x73fafafa : 0x730a0a0a);
  add_->SetEnabledTextColors(dark ? 0x73fafafa : 0x730a0a0a);
}
bool AuxSpacesSwitcher::Step(int direction) {
  if (!browser_) return false;
  const auto spaces = Spaces(*browser_);
  const auto current = std::ranges::find(spaces, window_->ActiveSpaceId(), &organization::Space::id);
  if (current == spaces.end()) return false;
  const int index = static_cast<int>(current - spaces.begin()) + direction;
  if (index < 0 || static_cast<size_t>(index) >= spaces.size()) {
    if (direction > 0) add_->RequestFocus();  // Explicit +; never create on scroll.
    return false;
  }
  return window_->SelectSpace(spaces[index].id);
}
void AuxSpacesSwitcher::Scroll(float amount, bool new_gesture) {
  const auto now = base::TimeTicks::Now();
  if (new_gesture || now - last_scroll_ > base::Milliseconds(250)) {
    stepped_ = false; scroll_amount_ = 0;
  }
  last_scroll_ = now;
  if (stepped_) return;
  scroll_amount_ += amount;
  if (std::abs(scroll_amount_) >= 40) { stepped_ = true; Step(scroll_amount_ < 0 ? 1 : -1); }
}
bool AuxSpacesSwitcher::OnMouseWheel(const ui::MouseWheelEvent& event) {
  Scroll(event.x_offset() ? event.x_offset() : event.y_offset(), false);
  return true;
}
void AuxSpacesSwitcher::OnScrollEvent(ui::ScrollEvent* event) {
  if (event->type() != ui::EventType::kScroll || std::abs(event->x_offset()) <= std::abs(event->y_offset())) return;
  if (event->momentum_phase() != ui::EventMomentumPhase::NONE) return;
  Scroll(event->x_offset(), event->scroll_event_phase() == ui::ScrollEventPhase::kBegan);
  event->SetHandled();
}
bool AuxSpacesSwitcher::OnKeyPressed(const ui::KeyEvent& event) {
  if (event.key_code() == ui::VKEY_LEFT) { Step(-1); return true; }
  if (event.key_code() == ui::VKEY_RIGHT) { Step(1); return true; }
  return views::View::OnKeyPressed(event);
}
BEGIN_METADATA(AuxSpacesSwitcher)
END_METADATA
}  // namespace aux
