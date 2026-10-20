// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_chat_actions.h"
#include "chrome/browser/ui/toasts/api/toast_id.h"
#include "chrome/browser/ui/toasts/toast_controller.h"
#include "chrome/browser/ui/toasts/toast_service.h"
#include <utility>
#include "base/check.h"
#include "base/functional/bind.h"
#include "base/functional/callback_helpers.h"
#include "base/strings/utf_string_conversions.h"
#include "base/strings/string_util.h"
#include "base/task/single_thread_task_runner.h"
#include "chrome/browser/bookmarks/bookmark_model_factory.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "ui/base/base_window.h"
#include "chrome/browser/ui/tabs/aux_chat_tab_association.h"
#include "chrome/browser/ui/views/frame/aux_chats_transport.h"
#include "chrome/browser/ui/views/frame/aux_bookmark_confirmation.h"
#include "components/bookmarks/browser/bookmark_model.h"
#include "components/bookmarks/browser/bookmark_node.h"
#include "components/constrained_window/constrained_window_views.h"
#include "ui/base/interaction/element_identifier.h"
#include "ui/base/models/dialog_model.h"
#include "ui/base/mojom/menu_source_type.mojom.h"
#include "ui/base/clipboard/scoped_clipboard_writer.h"
#include "ui/events/event.h"
#include "ui/views/controls/menu/menu_runner.h"
#include "ui/views/view.h"
#include "ui/views/widget/widget.h"
namespace aux {
namespace {
DEFINE_LOCAL_ELEMENT_IDENTIFIER_VALUE(kChatName);
enum Command { kPin = 1998, kUnpin = 1999, kRename = 2000,
  kArchive = 2001, kBookmark = 2002, kRead = 2003, kFolder = 2004,
  kCopy = 2005, kNewTab = 2006, kDelete = 2007 };
}  // namespace
AuxChatActions::AuxChatActions(BrowserWindowInterface& browser,
    AuxChatsTransport& transport, CurrentAccount account, OpenNewTab open_new_tab)
    : browser_(browser.GetWeakPtr()), profile_(browser.GetProfile()->GetWeakPtr()),
      transport_(&transport), account_(std::move(account)),
      open_new_tab_(std::move(open_new_tab)) {
  CHECK(account_ && open_new_tab_);
}
AuxChatActions::~AuxChatActions() { Retire(); }
bool AuxChatActions::ScopeCurrent() const {
  return !retired_ && browser_ && profile_ && browser_->GetProfile() == profile_.get();
}
void AuxChatActions::Retire() {
  retired_ = true;
  ++menu_generation_;
  weak_.InvalidateWeakPtrs();
  runner_.reset();
  model_.reset();
  menu_chat_.reset();
  pin_requests_.clear();
}
void AuxChatActions::SetChats(const std::vector<Chat>& chats) { chats_ = chats; }
const Chat* AuxChatActions::Find(const std::string& id) const {
  for (const auto& chat : chats_) if (chat.id == id) return &chat;
  return nullptr;
}
bool AuxChatActions::IsBookmarked(const std::string& id) const {
  if (!ScopeCurrent()) return false;
  auto account = account_.Run();
  auto* model = BookmarkModelFactory::GetForBrowserContext(profile_.get());
  return account && model && model->loaded() && model->IsBookmarked(ChatURL(*account, id));
}
bool AuxChatActions::IsCommandIdEnabled(int command) const {
  if (!ScopeCurrent() || !menu_chat_ || menu_chat_->id.empty()) return false;
  const auto* chat = Find(menu_chat_->id);
  switch (command) {
    case kPin: return chat && chat->can_pin && !chat->pinned && !pin_requests_.contains(chat->id);
    case kUnpin: return chat && chat->pinned && !pin_requests_.contains(chat->id);
    case kBookmark: return !IsBookmarked(menu_chat_->id);
    case kRename: case kArchive: case kRead: case kFolder: case kCopy:
    case kNewTab: case kDelete: return true;
    default: return false;
  }
}
void AuxChatActions::ShowContext(views::View* anchor, Chat chat,
                                const ui::MouseEvent& event) {
  if (!ScopeCurrent() || !anchor || !anchor->GetWidget() || chat.id.empty()) return;
  ++menu_generation_;
  runner_.reset();
  model_.reset();
  menu_chat_ = std::move(chat);
  menu_command_ = 0;
  model_ = std::make_unique<ui::SimpleMenuModel>(this);
  model_->AddItem(menu_chat_->pinned ? kUnpin : kPin,
                   menu_chat_->pinned ? u"Unpin chat" : u"Pin chat");
  model_->AddSeparator(ui::NORMAL_SEPARATOR);
  model_->AddItem(kRename, u"Rename chat");
  model_->AddItem(kArchive, u"Archive Chat");
  model_->AddItem(kDelete, u"Delete chat");
  model_->AddItem(kBookmark, u"Bookmark chat");
  model_->AddItem(kRead, u"Mark as read");
  model_->AddSeparator(ui::NORMAL_SEPARATOR);
  model_->AddItem(kFolder, u"Open folder in Finder");
  model_->AddItem(kCopy, u"Copy session ID");
  model_->AddSeparator(ui::NORMAL_SEPARATOR);
  model_->AddItem(kNewTab, u"Open in a new tab");
  // Original462ea30 creates the actual SimpleMenuModel runner with flags9.
  runner_ = std::make_unique<views::MenuRunner>(model_.get(),
      views::MenuRunner::CONTEXT_MENU | views::MenuRunner::HAS_MNEMONICS,
      base::BindRepeating(&AuxChatActions::OnMenuClosedForGeneration, weak_.GetWeakPtr(), menu_generation_));
  gfx::Point point = event.location();
  views::View::ConvertPointToScreen(anchor, &point);
  runner_->RunMenuAt(anchor->GetWidget(), nullptr, gfx::Rect(point, gfx::Size()),
      views::MenuAnchorPosition::kTopLeft, ui::mojom::MenuSourceType::kMouse);
}
void AuxChatActions::ExecuteCommand(int command, int) {
  if (IsCommandIdEnabled(command)) menu_command_ = command;
}
void AuxChatActions::OnMenuClosedForGeneration(uint64_t generation) {
  if (generation != menu_generation_ || !menu_chat_) return;
  std::string id = menu_chat_->id;
  const int command = menu_command_;
  menu_chat_.reset();
  menu_command_ = 0;
  // Genuine native menu teardown must precede dialogs/navigation/clipboard.
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce([](base::WeakPtr<AuxChatActions> self, uint64_t generation,
                       std::string id, int command) {
        if (!self || self->menu_generation_ != generation || !self->ScopeCurrent()) return;
        self->runner_.reset();
        self->model_.reset();
        if (command) self->RunCommand(std::move(id), command);
      }, weak_.GetWeakPtr(), generation, std::move(id), command));
}
void AuxChatActions::RunCommand(std::string id, int command) {
  if (!ScopeCurrent()) return;
  switch (command) {
    case kPin: SetPinned(std::move(id), true); break;
    case kUnpin: SetPinned(std::move(id), false); break;
    case kRename: Rename(id); break;
    case kArchive: Archive(id); break;
    case kDelete: ConfirmDelete(std::move(id)); break;
    case kBookmark: Bookmark(id); break;
    case kRead: transport_->PerformAction(id, "mark-read", {}, base::DoNothing()); break;
    case kFolder: transport_->PerformAction(id, "open-folder", {}, base::DoNothing()); break;
    case kCopy: {
      // Clipboard notification can retire this profile-bound owner. Retain the
      // real weak window/profile before writing; do not access this afterward.
      const auto browser = browser_;
      const auto profile = profile_;
      { ui::ScopedClipboardWriter writer(ui::ClipboardBuffer::kCopyPaste);
        writer.WriteText(base::UTF8ToUTF16(id)); }
      if (!browser || !profile || browser->GetProfile() != profile.get()) break;
      auto* service = ToastService::From(browser.get());
      auto* controller = service ? service->toast_controller() : nullptr;
      if (controller) {
        ToastParams params(ToastId::kCopiedToClipboard);
        params.body_string_override = u"Session ID Copied!";
        controller->MaybeShowToast(std::move(params));
      }
      break;
    }
    case kNewTab: { auto open = open_new_tab_; open.Run(id); break; }
  }
}
void AuxChatActions::SetPinned(std::string id, bool pinned) {
  if (!ScopeCurrent() || pin_requests_.contains(id)) return;
  const auto* chat = Find(id);
  if (!chat || (pinned && (!chat->can_pin || chat->pinned)) || (!pinned && !chat->pinned)) return;
  pin_requests_.insert(id);
  transport_->PerformAction(id, pinned ? "pin" : "unpin", {},
      base::BindOnce([](base::WeakPtr<AuxChatActions> self, std::string id,
                       AuxChatsTransport::ActionResult) {
        if (self) self->pin_requests_.erase(id);
      }, weak_.GetWeakPtr(), id));
}
void AuxChatActions::Archive(const std::string& id) {
  if (ScopeCurrent() && !id.empty())
    transport_->PerformAction(id, "archive", {}, base::DoNothing());
}
void AuxChatActions::Rename(const std::string& id) {
  if (!ScopeCurrent() || id.empty()) return;
  const auto* chat = Find(id);
  ui::DialogModel::Builder builder;
  auto* dialog = builder.model();
  builder.SetInternalName("AuxRenameChat")
      .SetTitle(u"Rename chat")
      .SetSubtitle(u"Choose a short, recognizable name.")
      .AddOkButton(base::BindOnce([](base::WeakPtr<AuxChatActions> self,
          std::string id, ui::DialogModel* dialog) {
        if (!self || !self->ScopeCurrent()) return;
        std::u16string title;
        base::TrimWhitespace(dialog->GetTextfieldByUniqueId(kChatName)->text(),
                             base::TRIM_ALL, &title);
        if (title.empty()) return;
        base::DictValue input;
        input.Set("title", base::UTF16ToUTF8(title));
        self->transport_->PerformAction(id, "rename", std::move(input), base::DoNothing());
      }, weak_.GetWeakPtr(), id, dialog),
          ui::DialogModel::Button::Params().SetLabel(u"Save"))
      .AddCancelButton(base::DoNothing(), ui::DialogModel::Button::Params().SetLabel(u"Cancel"))
      .AddTextfield(kChatName, u"", chat ? chat->title : std::u16string(),
          ui::DialogModelTextfield::Params().SetAccessibleName(u"New chat name"))
      .SetInitiallyFocusedField(kChatName);
  constrained_window::ShowBrowserModal(builder.Build(), browser_->GetWindow()->GetNativeWindow());
}
void AuxChatActions::ConfirmDelete(std::string id) {
  if (!ScopeCurrent()) return;
  ShowAuxNativeConfirmation(
      browser_->GetWindow()->GetNativeWindow(), u"Delete chat?",
      u"This will permanently delete this chat and its messages.",
      u"Delete", u"Cancel",
      base::BindOnce(
          [](base::WeakPtr<AuxChatActions> self, std::string id,
             bool accepted) {
            // Original466f8d0 accepts only the native confirmation result1.
            // Retiring the actual profile owner invalidates this action.
            if (accepted && self && self->ScopeCurrent() && !id.empty())
              self->transport_->PerformAction(id, "delete", {},
                                              base::DoNothing());
          },
          weak_.GetWeakPtr(), std::move(id)));
}
void AuxChatActions::Bookmark(const std::string& id) {
  if (!ScopeCurrent()) return;
  auto weak = weak_.GetWeakPtr();
  const auto account = account_.Run();
  if (!weak || !ScopeCurrent()) return;
  const auto* chat = Find(id);
  auto* model = BookmarkModelFactory::GetForBrowserContext(profile_.get());
  if (!account || !chat || !model || !model->loaded()) return;
  const GURL url = ChatURL(*account, id);
  if (!url.is_valid() || model->IsBookmarked(url)) return;
  const std::u16string title = chat->title;
  // Original4670990 is depth-first over folder children, checking each child
  // before recursion. The roots themselves are not candidate task folders.
  auto find_folder = [](auto&& recurse, const bookmarks::BookmarkNode* root)
      -> const bookmarks::BookmarkNode* {
    if (!root || !root->is_folder()) return nullptr;
    for (const auto& child : root->children()) {
      if (!child->is_folder()) continue;
      if (child->GetTitle() == u"Aux Tasks") return child.get();
      if (auto* match = recurse(recurse, child.get())) return match;
    }
    return nullptr;
  };
  const bookmarks::BookmarkNode* folder = find_folder(find_folder, model->bookmark_bar_node());
  if (!folder) folder = find_folder(find_folder, model->other_node());
  if (!folder) {
    auto* bar = model->bookmark_bar_node();
    if (!bar) return;
    folder = model->AddFolder(bar, bar->children().size(), u"Aux Tasks");
    // Bookmark observers may synchronously retire this window/owner.
    if (!weak || !ScopeCurrent()) return;
  }
  if (folder) model->AddURL(folder, folder->children().size(), title, url);
}
}  // namespace aux
