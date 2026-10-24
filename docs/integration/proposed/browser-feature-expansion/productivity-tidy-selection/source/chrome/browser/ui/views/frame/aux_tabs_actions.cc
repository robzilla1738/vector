// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_tabs_actions.h"
#include "chrome/browser/ui/aux_tidy_scope.h"
#include "ui/display/screen.h"
#include "ui/base/mojom/menu_source_type.mojom.h"
#include "ui/views/controls/menu/menu_types.h"
#include "ui/views/controls/menu/menu_runner.h"
#include "ui/views/widget/widget.h"

#include <algorithm>
#include <memory>
#include <string>
#include <utility>
#include "base/check.h"
#include "base/functional/bind.h"
#include "base/functional/callback_helpers.h"
#include "base/json/json_writer.h"
#include "base/strings/utf_string_conversions.h"
#include "base/time/time.h"
#include "base/timer/timer.h"
#include "base/unguessable_token.h"
#include "base/values.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_enums.h"
#include "chrome/browser/ui/tabs/tab_group_features.h"
#include "chrome/browser/ui/tabs/tab_group_model.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/frame/aux_bookmark_confirmation.h"
#include "components/tabs/public/tab_group.h"
#include "components/tabs/public/tab_interface.h"
#include "content/public/browser/web_contents.h"
#include "extensions/browser/api/messaging/channel_endpoint.h"
#include "extensions/browser/api/messaging/message_port.h"
#include "extensions/browser/api/messaging/message_service.h"
#include "extensions/browser/extension_registry.h"
#include "extensions/common/api/messaging/message.h"
#include "extensions/common/api/messaging/messaging_endpoint.h"
#include "extensions/common/api/messaging/port_context.h"
#include "extensions/common/api/messaging/port_id.h"
#include "extensions/common/mojom/message_port.mojom.h"
#include "ui/base/base_window.h"
#include "url/gurl.h"

namespace aux {
namespace {
constexpr char kTidyMessage[] = "aux.verticalTabsTidy";

// Original e509180/467938c: completion means the one-shot port has finished,
// not that the Agent reported success. Response content is deliberately ignored.
class BrowserGeneratedExtensionMessagePort final : public extensions::MessagePort {
 public:
  BrowserGeneratedExtensionMessagePort(
      base::WeakPtr<ChannelDelegate> delegate, const extensions::PortId& id,
      base::OnceClosure finished);
  ~BrowserGeneratedExtensionMessagePort() override;
  bool IsValidPort() override { return true; }
  void DispatchOnMessage(extensions::Message message) override { Finish(); }

 private:
  void Finish() {
    auto finished = std::move(finished_);
    // Closing can destroy this port. Move completion before the call and do
    // not read any member afterward (the original uses this same ordering).
    if (weak_channel_delegate_)
      weak_channel_delegate_->ClosePort(port_id_, -1,
          extensions::PortContext::ForNativeHost(), true, std::string());
    if (finished) std::move(finished).Run();
  }
  base::OnceClosure finished_;
  base::OneShotTimer timer_;
};

BrowserGeneratedExtensionMessagePort::BrowserGeneratedExtensionMessagePort(
    base::WeakPtr<ChannelDelegate> delegate, const extensions::PortId& id,
    base::OnceClosure finished)
    : MessagePort(std::move(delegate), id), finished_(std::move(finished)) {
  timer_.Start(FROM_HERE, base::Seconds(15),
      base::BindOnce(&BrowserGeneratedExtensionMessagePort::Finish,
                     base::Unretained(this)));
}
BrowserGeneratedExtensionMessagePort::~BrowserGeneratedExtensionMessagePort() {
  timer_.Stop();
  if (finished_) std::move(finished_).Run();
}

bool IsActualAgentGroup(const tabs::TabInterface& tab,
                        const TabStripModel& model) {
  const auto id = tab.GetGroup();
  const auto* groups = model.group_model();
  const auto* group = id && groups ? groups->GetTabGroup(*id) : nullptr;
  const auto* features = group ? group->GetTabGroupFeatures() : nullptr;
  return features && features->is_agent_group();
}
}  // namespace

AuxTabsActions::AuxTabsActions(BrowserWindowInterface& browser,
    base::RepeatingCallback<bool()> tidy_enabled,
    base::RepeatingCallback<void(bool)> tidy_busy)
    : browser_(browser.GetWeakPtr()), profile_(browser.GetProfile()->GetWeakPtr()),
      tidy_enabled_(std::move(tidy_enabled)), tidy_busy_(std::move(tidy_busy)) {
  CHECK(tidy_enabled_ && tidy_busy_);
}
AuxTabsActions::~AuxTabsActions() { Retire(); }
void AuxTabsActions::Retire() {
  retired_ = true;
  scope_runner_.reset();
  scope_menu_.reset();
  weak_.InvalidateWeakPtrs();
  tidy_enabled_.Reset();
  tidy_busy_.Reset();
}
bool AuxTabsActions::ScopeCurrent() const {
  return !retired_ && browser_ && profile_ &&
      browser_->GetProfile() == profile_.get();
}
void AuxTabsActions::SetTidyBusy(bool busy) {
  if (ScopeCurrent()) tidy_busy_.Run(busy);
}
void AuxTabsActions::Tidy() {
  if (!ScopeCurrent() || !browser_->GetWindow()) return;
  auto self = weak_.GetWeakPtr();
  if (!tidy_enabled_.Run() || !self || !self->ScopeCurrent()) return;
  auto* widget = views::Widget::GetWidgetForNativeWindow(browser_->GetWindow()->GetNativeWindow());
  auto* screen = display::Screen::Get();
  if (!widget || !screen) return;
  scope_runner_.reset();
  scope_menu_ = std::make_unique<ui::SimpleMenuModel>(this);
  scope_menu_->AddItem(1, u"Tidy current Space");
  scope_menu_->AddItem(2, u"Tidy selected tabs");
  scope_runner_ = std::make_unique<views::MenuRunner>(scope_menu_.get(), views::MenuRunner::CONTEXT_MENU);
  scope_runner_->RunMenuAt(widget, nullptr, gfx::Rect(screen->GetCursorScreenPoint(), gfx::Size()),
      views::MenuAnchorPosition::kTopLeft, ui::mojom::MenuSourceType::kMouse);
}
bool AuxTabsActions::IsCommandIdEnabled(int command) const {
  return ScopeCurrent() && CanCreateAuxTidyScope(browser_.get()) && (command == 1 ||
      (command == 2 && GetAuxTidySelectedCount(browser_.get()) >= 2));
}
void AuxTabsActions::ExecuteCommand(int command, int) {
  if (!IsCommandIdEnabled(command)) return;
  auto token = CreateAuxTidyScope(browser_.get(), command == 2);
  if (!token.empty()) RunTidyScope(std::move(token));
}
void AuxTabsActions::RunTidyScope(std::string token) {
  if (!ScopeCurrent()) return;
  auto self = weak_.GetWeakPtr();
  if (!tidy_enabled_.Run() || !self || !self->ScopeCurrent()) return;
  auto* model = browser_->GetTabStripModel();
  base::DictValue payload;
  payload.Set("source", "vertical_tabs_sidebar");
  payload.Set("action", "tidy");
  payload.Set("scopeToken", token);
  payload.Set("tab_count", model ? model->count() : 0);
  if (model) {
    payload.Set("active_tab_index", model->active_index());
    if (auto* contents = model->GetActiveWebContents()) {
      GURL url = contents->GetVisibleURL();
      if (!url.is_valid()) url = contents->GetLastCommittedURL();
      if (url.is_valid()) payload.Set("active_tab_url", url.spec());
      payload.Set("active_tab_title", base::UTF16ToUTF8(contents->GetTitle()));
    }
  }
  SetTidyBusy(true);
  if (!self || !self->ScopeCurrent()) return;
  base::ScopedClosureRunner reset_busy(base::BindOnce(
      &AuxTabsActions::SetTidyBusy, self, false));
  auto* registry = extensions::ExtensionRegistry::Get(profile_.get());
  if (!registry || !registry->enabled_extensions().GetByID(kAgentExtensionId)) return;
  auto* service = extensions::MessageService::Get(profile_.get());
  if (!service) return;
  payload.Set("type", kTidyMessage);
  std::string serialized;
  if (!base::JSONWriter::Write(payload, &serialized)) return;
  const extensions::PortId id(base::UnguessableToken::Create(), 1, true,
      extensions::mojom::SerializationFormat::kJson);
  auto delegate = service->GetChannelDelegate();
  auto port = std::make_unique<BrowserGeneratedExtensionMessagePort>(
      delegate, id, reset_busy.Release());
  service->OpenChannelToExtension(extensions::ChannelEndpoint(profile_.get()),
      id, extensions::MessagingEndpoint::ForNativeApp(kTidyMessage),
      std::move(port), kAgentExtensionId, GURL(),
      extensions::mojom::ChannelType::kSendMessage, std::string());
  // OpenChannel can synchronously retire the browser/profile or the port.
  // The delegate WeakPtr preserves the original queued-or-open send semantics.
  if (delegate)
    delegate->PostMessage(id, extensions::Message(std::move(serialized), false, false));
}
void AuxTabsActions::Clear() {
  if (!ScopeCurrent() || !browser_->GetWindow()) return;
  ShowAuxNativeConfirmation(browser_->GetWindow()->GetNativeWindow(),
      u"Clear tabs?", u"This will close all other tabs except AI tabs.",
      u"Clear", u"Cancel", base::BindOnce(&AuxTabsActions::ClearAccepted,
                                         weak_.GetWeakPtr()));
}
void AuxTabsActions::ClearAccepted(bool accepted) {
  if (!accepted || !ScopeCurrent()) return;
  auto* model = browser_->GetTabStripModel();
  if (!model) return;
  auto* active = model->GetActiveWebContents();
  if (!active) return;
  const int active_index = model->GetIndexOfWebContents(active);
  if (active_index == TabStripModel::kNoTab) return;
  auto self = weak_.GetWeakPtr();
  const auto active_contents = active->GetWeakPtr();
  auto* active_tab = model->GetTabAtIndex(active_index);
  if (active_tab->GetGroup() && !IsActualAgentGroup(*active_tab, *model)) {
    model->RemoveFromGroup({active_index});
    if (!self || !self->ScopeCurrent() || browser_->GetTabStripModel() != model) return;
  }
  // Original4679710 iterates the actual model backward, preserving the active
  // document chosen after confirmation, agent groups and the real close policy.
  for (int index = model->count() - 1; index >= 0; --index) {
    index = std::min(index, model->count() - 1);
    if (index < 0) break;
    auto* tab = model->GetTabAtIndex(index);
    if (!tab || !tab->GetContents() || tab->GetContents() == active_contents.get() ||
        !model->IsTabClosable(tab) || IsActualAgentGroup(*tab, *model)) continue;
    model->CloseWebContentsAt(index, TabCloseTypes::CLOSE_USER_GESTURE |
        TabCloseTypes::CLOSE_CREATE_HISTORICAL_TAB);
    if (!self || !self->ScopeCurrent() || browser_->GetTabStripModel() != model) return;
  }
}
}  // namespace aux
