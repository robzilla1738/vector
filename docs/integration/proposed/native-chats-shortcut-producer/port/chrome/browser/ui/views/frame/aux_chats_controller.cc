// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_chats_controller.h"
#include <utility>
#include "base/check.h"
#include "base/functional/bind.h"
#include "chrome/app/chrome_command_ids.h"
#include "chrome/browser/ui/accelerator_table.h"
#include "ui/base/accelerators/accelerator.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "extensions/common/extension.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/aux_chat_tab_owner.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/frame/aux_chat_actions.h"
#include "chrome/browser/ui/views/frame/aux_chat_navigation.h"
#include "chrome/browser/ui/views/frame/aux_chats_header_actions.h"
#include "chrome/browser/ui/views/frame/aux_chats_section.h"
#include "chrome/browser/ui/views/frame/aux_chats_transport.h"
namespace aux {
namespace {
bool HasAgent(Profile* profile) {
  auto* registry = extensions::ExtensionRegistry::Get(profile);
  return registry && registry->GetExtensionById(kAgentExtensionId,
      extensions::ExtensionRegistry::EVERYTHING);
}
}  // namespace
std::u16string GetNewChatShortcutHelp() {
  ui::Accelerator accelerator;
  if (!GetAcceleratorForCommandId(IDC_AUX_OPEN_NEW_CHAT, &accelerator)) {
    return {};
  }
  return accelerator.GetShortcutText();
}
AuxChatsController::AuxChatsController(BrowserWindowInterface& browser,
    BookmarkTabAssociations& bookmarks, std::u16string shortcut_help,
    Changed changed)
    : browser_(browser.GetWeakPtr()), profile_(browser.GetProfile()->GetWeakPtr()),
      model_(browser.GetTabStripModel()), changed_(std::move(changed)) {
  CHECK(model_ && changed_ && profile_->GetPrefs());
  auto weak = weak_.GetWeakPtr();
  transport_ = std::make_unique<AuxChatsTransport>(browser,
      base::BindRepeating(&AuxChatsController::ChatsUpdated, weak));
  // Both action owners use the same actual transport and current account
  // selector as the region feed, including the source display-index fallback.
  auto account = base::BindRepeating([](base::WeakPtr<AuxChatsController> owner)
      -> std::optional<int> {
    return owner ? owner->CurrentAccount() : std::nullopt;
  }, weak);
  auto classify = base::BindRepeating([](base::WeakPtr<AuxChatsController> owner)
      -> std::optional<AuxChatTabOwner::Classification> {
    if (!owner || !owner->ScopeCurrent()) return std::nullopt;
    return AuxChatTabOwner::Classification{
        .agent_installed = owner->agent_installed_,
        .suppress_auto_expansion = owner->applying_snapshot_};
  }, weak);
  tabs_ = std::make_unique<AuxChatTabOwner>(browser, *model_, bookmarks,
      account, std::move(classify), AuxChatTabOwner::SourceEffects{
          .expand_chats = base::BindRepeating(&AuxChatsController::ExpandChats, weak)},
      base::BindRepeating(&AuxChatsController::ProjectionChanged, weak));
  actions_ = std::make_unique<AuxChatActions>(browser, *transport_, account,
      base::BindRepeating(&AuxChatsController::OpenInNewTab, weak));
  header_actions_ = std::make_unique<AuxChatsHeaderActions>(browser, *transport_);
  AuxChatsSection::Actions section_actions;
  section_actions.new_chat = base::BindRepeating(&AuxChatsController::SelectNewChat, weak);
  section_actions.selected = base::BindRepeating(&AuxChatsController::Select, weak);
  section_actions.rename = base::BindRepeating(&AuxChatsController::Rename, weak);
  section_actions.archive = base::BindRepeating(&AuxChatsController::Archive, weak);
  section_actions.context = base::BindRepeating(&AuxChatsController::ShowContext, weak);
  section_actions.all_chats = base::BindRepeating(&AuxChatsController::ShowAll, weak);
  section_actions.section_context = base::BindRepeating(
      &AuxChatsController::ShowHeaderContext, weak);
  unmounted_section_ = std::make_unique<AuxChatsSection>(*profile_->GetPrefs(),
      std::move(section_actions), std::move(shortcut_help));
  section_tracker_.SetTrackEntireViewHierarchy(true);
  section_tracker_.SetView(unmounted_section_.get());
  // A genuine region teardown can destroy the view before its controller.
  section_tracker_.SetIsDeletingCallback(
      base::BindOnce(&AuxChatsController::Retire, weak));
  if (auto* registry = extensions::ExtensionRegistry::Get(profile_.get()))
    registry_.Observe(registry);
  agent_installed_ = HasAgent(profile_.get());
  model_->AddObserver(this);
}
AuxChatsController::~AuxChatsController() { Retire(); }
bool AuxChatsController::ScopeCurrent() const {
  return !retired_ && browser_ && profile_ && model_ &&
      browser_->GetProfile() == profile_.get() &&
      browser_->GetTabStripModel() == model_;
}
std::optional<int> AuxChatsController::CurrentAccount() const {
  return ScopeCurrent() ? std::optional<int>(ChatAccountForProfile(*profile_))
                        : std::nullopt;
}
std::unique_ptr<AuxChatsSection> AuxChatsController::TakeSection() {
  CHECK(!started_ && unmounted_section_);
  return std::move(unmounted_section_);
}
AuxChatsSection* AuxChatsController::section() {
  return static_cast<AuxChatsSection*>(section_tracker_.view());
}
AuxChatTabOwner& AuxChatsController::tabs() { return *tabs_; }
void AuxChatsController::Start() {
  if (!ScopeCurrent() || started_) return;
  CHECK(!unmounted_section_ && section() && section()->parent());
  started_ = true;
  auto weak = weak_.GetWeakPtr();
  tabs_->Reconcile();
  if (!weak || !ScopeCurrent()) return;
  if (agent_installed_) transport_->Start();
}
void AuxChatsController::Refresh() {
  if (ScopeCurrent() && started_) transport_->Refresh();
}
void AuxChatsController::Retire() {
  if (retired_) return;
  retired_ = true;
  weak_.InvalidateWeakPtrs();
  registry_.Reset();
  StopObservingAll(this);
  transport_->Stop();
  header_actions_->Retire();
  actions_->Retire();
  tabs_->Retire();
  if (auto* view = section()) view->PauseProfileObservation();
  model_ = nullptr;
}
void AuxChatsController::ChatsUpdated(const std::vector<Chat>& chats) {
  if (!ScopeCurrent() || !section()) return;
  chats_ = chats;
  auto weak = weak_.GetWeakPtr();
  const bool previous = std::exchange(applying_snapshot_, true);
  actions_->SetChats(chats_);
  section()->SetChats(chats_);
  if (!weak || !ScopeCurrent() || !section()) return;
  std::vector<std::string> ids;
  ids.reserve(chats_.size());
  for (const auto& chat : chats_) ids.push_back(chat.id);
  // SetChats owns the original nested snapshot-suppression scope and calls
  // ProjectionChanged after reconciling actual task associations.
  tabs_->SetChats(ids);
  if (weak) applying_snapshot_ = previous;
}
void AuxChatsController::ProjectionChanged() {
  if (!ScopeCurrent() || !section()) return;
  auto weak = weak_.GetWeakPtr();
  const auto selected = tabs_->SelectedChat();
  if (!weak || !ScopeCurrent() || !section()) return;
  section()->SetSelectedChat(selected);
  if (!weak || !ScopeCurrent() || !section()) return;
  section()->SetNewChatRepresentedTab(tabs_->represented_new_chat(),
                                     tabs_->represented_new_chat_active());
  if (weak && ScopeCurrent()) changed_.Run();
}
void AuxChatsController::ExpandChats() {
  if (ScopeCurrent() && section()) section()->ExpandFromTaskAssociation();
}
void AuxChatsController::Select(const std::string& id) {
  if (ScopeCurrent()) tabs_->Select(id);
}
void AuxChatsController::SelectNewChat() {
  if (ScopeCurrent()) tabs_->SelectNewChat();
}
void AuxChatsController::OpenInNewTab(const std::string& id) {
  if (ScopeCurrent()) tabs_->OpenInNewTab(id);
}
void AuxChatsController::Rename(const std::string& id) {
  if (!ScopeCurrent()) return;
  auto weak = weak_.GetWeakPtr();
  tabs_->SettleForRename(id);
  if (weak && ScopeCurrent()) actions_->Rename(id);
}
void AuxChatsController::Archive(const std::string& id) {
  if (ScopeCurrent()) actions_->Archive(id);
}
void AuxChatsController::ShowContext(views::View* anchor, Chat chat,
                                    const ui::MouseEvent& event) {
  if (ScopeCurrent()) actions_->ShowContext(anchor, std::move(chat), event);
}
void AuxChatsController::ShowHeaderContext(views::View* anchor,
                                          const ui::MouseEvent& event) {
  if (ScopeCurrent()) header_actions_->ShowContext(anchor, event);
}
void AuxChatsController::ShowAll() {
  if (ScopeCurrent()) ShowAllChats(*browser_);
}
void AuxChatsController::UpdateAgentState() {
  if (!ScopeCurrent()) return;
  const bool installed = HasAgent(profile_.get());
  if (installed == agent_installed_) return;
  agent_installed_ = installed;
  auto weak = weak_.GetWeakPtr();
  if (installed && started_) transport_->Start();
  else transport_->Stop();
  if (!weak || !ScopeCurrent()) return;
  tabs_->Reconcile();
}
void AuxChatsController::OnExtensionLoaded(content::BrowserContext*,
                                          const extensions::Extension* extension) {
  if (extension->id() == kAgentExtensionId) UpdateAgentState();
}
void AuxChatsController::OnExtensionUnloaded(content::BrowserContext*,
    const extensions::Extension* extension, extensions::UnloadedExtensionReason) {
  if (extension->id() == kAgentExtensionId) UpdateAgentState();
}
void AuxChatsController::OnShutdown(extensions::ExtensionRegistry*) { Retire(); }
void AuxChatsController::OnTabStripModelDestroyed(TabStripModel* model) {
  if (model == model_) Retire();
}
}  // namespace aux
