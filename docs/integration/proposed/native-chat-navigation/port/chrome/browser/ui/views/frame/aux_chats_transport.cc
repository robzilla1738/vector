// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_chats_transport.h"
#include "chrome/browser/ui/views/frame/aux_chat_navigation.h"

#include <utility>
#include "base/environment.h"
#include "base/functional/bind.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/strings/escape.h"
#include "base/strings/string_number_conversions.h"
#include "base/task/single_thread_task_runner.h"
#include "base/task/thread_pool.h"
#include "chrome/browser/aux/browser_platform.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/aux/installation_auth.h"
#include "chrome/browser/aux/profile_state.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/storage_partition.h"
#include "extensions/browser/extension_registry.h"
#include "net/base/url_util.h"
#include "net/http/http_response_headers.h"
#include "net/traffic_annotation/network_traffic_annotation.h"
#include "services/network/public/cpp/resource_request.h"
#include "services/network/public/cpp/simple_url_loader.h"
#include "services/network/public/mojom/url_response_head.mojom.h"

namespace aux {
namespace {
constexpr auto kPollInterval = base::Seconds(1);
constexpr auto kRequestTimeout = base::Seconds(3);
constexpr size_t kChatsResponseLimit = 0x40000;  // Original463dd90.
constexpr size_t kActionResponseLimit = 0x10000;  // Original463bd4c/463c3a0.
constexpr auto kTraffic = net::DefineNetworkTrafficAnnotation("aux_native_chats", R"(
  semantics {
    sender: "Aux native Chats section"
    description: "Reads the supplied account Chats projection and executes explicit native chat actions."
    trigger: "Installed Agent native section is active or the user chooses a chat action."
    data: "Local installation authorization, account/session identity and explicit action input."
    destination: LOCAL
  }
  policy {
    cookies_allowed: NO
    setting: "The native Chats section follows the actual browser profile."
    policy_exception_justification: "Authenticated local daemon only."
  })");
bool AgentInstalled(Profile* profile) {
  const auto* registry = profile ? extensions::ExtensionRegistry::Get(profile) : nullptr;
  return registry && registry->GetExtensionById(kAgentExtensionId,
      extensions::ExtensionRegistry::EVERYTHING);
}
GURL RequestURL(std::string path, int account) {
  unsigned port = 21520;
  if (auto text = base::Environment::Create()->GetVar("AUX_PORT")) {
    if (!base::StringToUint(*text, &port) || port == 0 || port > 65535) return GURL();
  }
  return net::AppendQueryParameter(GURL("http://127.0.0.1:" +
      base::NumberToString(port) + path), "accountId", base::NumberToString(account));
}
}  // namespace
AuxChatsTransport::AuxChatsTransport(BrowserWindowInterface& browser, Updated updated)
    : browser_(browser.GetWeakPtr()), updated_(std::move(updated)) {}
AuxChatsTransport::~AuxChatsTransport() { Stop(); }
bool AuxChatsTransport::ScopeCurrent() const {
  return running_ && browser_ && profile_ &&
      browser_->GetProfile() == profile_.get() && profile_->GetPath() == profile_path_ &&
      AgentInstalled(profile_.get());
}
void AuxChatsTransport::Start() {
  if (running_) return;
  if (!browser_) return;
  auto* profile = browser_->GetProfile();
  if (!profile || !AgentInstalled(profile)) return;
  profile_ = profile->GetWeakPtr();
  profile_path_ = profile->GetPath();
  running_ = true;
  Refresh();
}
void AuxChatsTransport::Stop() {
  running_ = false;
  timer_.Stop();
  weak_.InvalidateWeakPtrs();
  requests_.clear();
  poll_pending_ = false;
  profile_.reset();
  account_id_.reset();
}
void AuxChatsTransport::ResolveAccount(AccountDone done) {
  if (!ScopeCurrent()) return;
  // Original463df94/463befc use41035c0 only after the actual account pref.
  // That helper is a display-order profile index, not currentAccountId from
  // the daemon registry. Keep completion asynchronous like the existing API.
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
      base::BindOnce(std::move(done),
          std::optional<int>(ChatAccountForProfile(*profile_))));
}
void AuxChatsTransport::Refresh() {
  if (!ScopeCurrent() || poll_pending_) return;
  timer_.Stop();
  poll_pending_ = true;
  ResolveAccount(base::BindOnce(&AuxChatsTransport::PollAccount, weak_.GetWeakPtr()));
}
void AuxChatsTransport::PollAccount(std::optional<int> account) {
  if (!ScopeCurrent()) return;
  if (!account) { PollFinished(); return; }
  account_id_ = account;
  BrowserPlatform::Get().RequestDaemonAuthorization(false,
      base::BindOnce(&AuxChatsTransport::PollAuthorized, weak_.GetWeakPtr(), *account, false));
}
void AuxChatsTransport::PollAuthorized(int account, bool retried,
                                      std::optional<std::string> token) {
  if (!ScopeCurrent()) return;
  if (!token || token->empty()) { PollFinished(); return; }
  ResolveAccount(base::BindOnce(
      [](base::WeakPtr<AuxChatsTransport> self, int account, bool retried,
         std::string token, std::optional<int> current) {
        if (!self || !self->ScopeCurrent()) return;
        if (current != account) { self->PollFinished(); return; }
        self->Load("/session/for-chrome/chats", account, std::move(token), std::nullopt,
            base::BindOnce(&AuxChatsTransport::PollLoaded, self, account, retried));
      }, weak_.GetWeakPtr(), account, retried, std::move(*token)));
}
void AuxChatsTransport::PollLoaded(int account, bool retried, int status,
                                  std::optional<std::string> body) {
  if (!ScopeCurrent()) return;
  if (status == 401 && !retried) {
    BrowserPlatform::Get().RequestDaemonAuthorization(true,
        base::BindOnce(&AuxChatsTransport::PollAuthorized, weak_.GetWeakPtr(), account, true));
    return;
  }
  auto rows = body && status == 200 ? ParseChatsResponse(*body) : std::nullopt;
  if (!rows) { PollFinished(); return; }
  ResolveAccount(base::BindOnce(
      [](base::WeakPtr<AuxChatsTransport> self, int account, std::vector<Chat> rows,
         std::optional<int> current) {
        if (!self || !self->ScopeCurrent()) return;
        if (current == account && self->account_id_ == account) {
          self->updated_.Run(rows);
          if (!self) return;
        }
        self->PollFinished();
      }, weak_.GetWeakPtr(), account, std::move(*rows)));
}
void AuxChatsTransport::PollFinished() { poll_pending_ = false; Schedule(); }
void AuxChatsTransport::Schedule() {
  if (ScopeCurrent()) timer_.Start(FROM_HERE, kPollInterval, this, &AuxChatsTransport::Refresh);
}
void AuxChatsTransport::PerformAction(std::string session, std::string action,
                                     base::DictValue input, ActionDone done) {
  if (!ScopeCurrent() || session.empty() || action.empty()) {
    std::move(done).Run({}); return;
  }
  ResolveAccount(base::BindOnce(
      [](base::WeakPtr<AuxChatsTransport> self, std::string session, std::string action,
         base::DictValue input, ActionDone done, std::optional<int> account) {
        if (!self || !self->ScopeCurrent()) return;
        if (!account) { std::move(done).Run({}); return; }
        BrowserPlatform::Get().RequestDaemonAuthorization(false,
            base::BindOnce(&AuxChatsTransport::ActionAuthorized, self, *account,
                std::move(session), std::move(action), std::move(input), std::move(done)));
      }, weak_.GetWeakPtr(), std::move(session), std::move(action),
      std::move(input), std::move(done)));
}
void AuxChatsTransport::ActionAuthorized(int account, std::string session,
    std::string action, base::DictValue input, ActionDone done,
    std::optional<std::string> token) {
  if (!ScopeCurrent()) return;
  if (!token || token->empty()) { std::move(done).Run({}); return; }
  ResolveAccount(base::BindOnce(
      [](base::WeakPtr<AuxChatsTransport> self, int account, std::string session,
         std::string action, base::DictValue input, ActionDone done, std::string token,
         std::optional<int> current) {
        if (!self || !self->ScopeCurrent()) return;
        if (current != account) { std::move(done).Run({}); return; }
        std::string path = "/session/for-chrome/" +
            base::EscapeAllExceptUnreserved(session) + "/" +
            base::EscapeAllExceptUnreserved(action);
        if (action == "resolve-popover-action") {
          path = "/session/for-chrome/resolve-popover-action";
          input.Set("sessionId", session);
        }
        auto json = base::WriteJson(input);
        if (!json) { std::move(done).Run({}); return; }
        self->Load(std::move(path), account, std::move(token), std::move(json),
            base::BindOnce(
                [](base::WeakPtr<AuxChatsTransport> self, int account, ActionDone done,
                   int status, std::optional<std::string> body) {
                  if (!self || !self->ScopeCurrent()) return;
                  auto result = ActionResult{status, body ? base::JSONReader::Read(*body, base::JSON_PARSE_RFC)
                                                         : std::nullopt};
                  self->ResolveAccount(base::BindOnce(
                      [](base::WeakPtr<AuxChatsTransport> self, int account,
                         ActionDone done, ActionResult result, std::optional<int> current) {
                        if (!self || !self->ScopeCurrent()) return;
                        if (current != account) result = {};
                        std::move(done).Run(std::move(result));
                        if (self) self->Refresh();
                      }, self, account, std::move(done), std::move(result)));
                }, self, account, std::move(done)));
      }, weak_.GetWeakPtr(), account, std::move(session), std::move(action),
      std::move(input), std::move(done), std::move(*token)));
}
void AuxChatsTransport::Load(std::string path, int account, std::string authorization,
                             std::optional<std::string> input, Loaded loaded) {
  const auto url = RequestURL(std::move(path), account);
  if (!url.is_valid()) { std::move(loaded).Run(0, std::nullopt); return; }
  const size_t response_limit = input ? kActionResponseLimit : kChatsResponseLimit;
  auto request = std::make_unique<network::ResourceRequest>();
  request->url = url;
  request->method = input ? "POST" : "GET";
  request->credentials_mode = network::mojom::CredentialsMode::kOmit;
  request->redirect_mode = network::mojom::RedirectMode::kError;
  request->headers.SetHeader("Authorization", authorization);
  auto loader = network::SimpleURLLoader::Create(std::move(request), kTraffic);
  loader->SetTimeoutDuration(kRequestTimeout);
  loader->SetAllowHttpErrorResults(true);
  if (input) loader->AttachStringForUpload(*input, "application/json");
  const auto id = ++next_request_;
  auto* raw = loader.get();
  requests_.emplace(id, std::move(loader));
  raw->DownloadToString(profile_->GetDefaultStoragePartition()
      ->GetURLLoaderFactoryForBrowserProcess().get(),
      base::BindOnce(
          [](base::WeakPtr<AuxChatsTransport> self, uint64_t id, Loaded loaded,
             std::optional<std::string> body) {
            if (!self || !self->ScopeCurrent()) return;
            auto request = self->requests_.find(id);
            if (request == self->requests_.end()) return;
            const auto* info = request->second->ResponseInfo();
            const int status = info && info->headers ? info->headers->response_code() : 0;
            self->requests_.erase(request);
            std::move(loaded).Run(status, std::move(body));
          }, weak_.GetWeakPtr(), id, std::move(loaded)), response_limit);
}
}  // namespace aux
