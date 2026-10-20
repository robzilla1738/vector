// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_chats_header_actions.h"
#include <string>
#include <utility>
#include "base/functional/bind.h"
#include "base/functional/callback_helpers.h"
#include "base/task/single_thread_task_runner.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/views/frame/aux_bookmark_confirmation.h"
#include "chrome/browser/ui/views/frame/aux_chat_navigation.h"
#include "chrome/browser/ui/views/frame/aux_chats_transport.h"
#include "extensions/browser/extension_registry.h"
#include "ui/base/base_window.h"
#include "ui/base/window_open_disposition.h"
#include "url/gurl.h"
#include "ui/base/mojom/menu_source_type.mojom.h"
#include "ui/events/event.h"
#include "ui/views/controls/menu/menu_runner.h"
#include "ui/views/view.h"
#include "ui/views/widget/widget.h"
namespace aux {
namespace {
enum Command { kMarkAllRead = 2100, kArchiveAll = 2101, kShowAll = 2102 };
}
AuxChatsHeaderActions::AuxChatsHeaderActions(BrowserWindowInterface& browser,
                                            AuxChatsTransport& transport)
    : browser_(browser.GetWeakPtr()), profile_(browser.GetProfile()->GetWeakPtr()),
      transport_(&transport) {}
AuxChatsHeaderActions::~AuxChatsHeaderActions() { Retire(); }
bool AuxChatsHeaderActions::ScopeCurrent() const {
  return !retired_ && browser_ && profile_ && browser_->GetProfile() == profile_.get();
}
void AuxChatsHeaderActions::Retire() {
  retired_ = true;
  ++generation_;
  weak_.InvalidateWeakPtrs();
  runner_.reset();
  model_.reset();
}
bool AuxChatsHeaderActions::IsCommandIdEnabled(int command) const {
  // Source463981c explicitly enables the three section-level commands,
  // independently of the absent per-chat menu selection.
  return ScopeCurrent() && command >= kMarkAllRead && command <= kShowAll;
}
void AuxChatsHeaderActions::ExecuteCommand(int command, int) {
  if (IsCommandIdEnabled(command)) command_ = command;
}
void AuxChatsHeaderActions::ShowContext(views::View* anchor,
                                       const ui::MouseEvent& event) {
  if (!ScopeCurrent() || !anchor || !anchor->GetWidget()) return;
  ++generation_;
  runner_.reset();
  model_.reset();
  command_ = 0;
  model_ = std::make_unique<ui::SimpleMenuModel>(this);
  model_->AddItem(kMarkAllRead, u"Mark all as read");
  model_->AddItem(kArchiveAll, u"Archive all chats");
  model_->AddSeparator(ui::NORMAL_SEPARATOR);
  model_->AddItem(kShowAll, u"Show all chats");
  runner_ = std::make_unique<views::MenuRunner>(model_.get(),
      views::MenuRunner::CONTEXT_MENU | views::MenuRunner::HAS_MNEMONICS,
      base::BindRepeating(&AuxChatsHeaderActions::MenuClosed,
                          weak_.GetWeakPtr(), generation_));
  auto point = event.location();
  views::View::ConvertPointToScreen(anchor, &point);
  runner_->RunMenuAt(anchor->GetWidget(), nullptr, gfx::Rect(point, gfx::Size()),
      views::MenuAnchorPosition::kTopLeft, ui::mojom::MenuSourceType::kMouse);
}
void AuxChatsHeaderActions::MenuClosed(uint64_t generation) {
  if (generation != generation_) return;
  const int command = std::exchange(command_, 0);
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce([](base::WeakPtr<AuxChatsHeaderActions> self,
                       uint64_t generation, int command) {
        if (!self || !self->ScopeCurrent() || self->generation_ != generation) return;
        self->runner_.reset();
        self->model_.reset();
        if (command) self->RunCommand(command);
      }, weak_.GetWeakPtr(), generation, command));
}
void AuxChatsHeaderActions::RunCommand(int command) {
  if (!ScopeCurrent()) return;
  if (command == kMarkAllRead) {
    transport_->PerformBulkAction(AuxChatsTransport::BulkAction::kMarkAllRead,
                                  base::DoNothing());
  } else if (command == kArchiveAll) {
    ShowAuxNativeConfirmation(browser_->GetWindow()->GetNativeWindow(),
        u"Archive all chats?", u"This will archive all chats.", u"Archive", u"Cancel",
        base::BindOnce([](base::WeakPtr<AuxChatsHeaderActions> self, bool accepted) {
          if (self && self->ScopeCurrent() && accepted)
            self->transport_->PerformBulkAction(
                AuxChatsTransport::BulkAction::kArchiveAllChats, base::DoNothing());
        }, weak_.GetWeakPtr()));
  } else if (command == kShowAll) {
    auto* registry = extensions::ExtensionRegistry::Get(profile_.get());
    if (registry && registry->GetExtensionById(kAgentExtensionId,
            extensions::ExtensionRegistry::EVERYTHING)) {
      // Header menu source4639930 uses /tasks. The separate row's Show all
      // action has its own view=list/filter=all/order=desc route.
      const GURL url(std::string("chrome-extension://") + kAgentExtensionId +
          "/main.html#/u/" + std::to_string(ChatAccountForProfile(*profile_)) + "/tasks");
      browser_->OpenGURL(url, WindowOpenDisposition::NEW_FOREGROUND_TAB);
    }
  }
}
}  // namespace aux
