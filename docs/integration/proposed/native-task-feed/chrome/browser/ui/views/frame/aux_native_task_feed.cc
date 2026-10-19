// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// Implements docs/spec/native/surfaces.md V2 and daemon/core.md authentication.

#include "chrome/browser/ui/views/frame/aux_native_task_feed.h"

#include <algorithm>
#include <array>
#include <utility>

#include "base/check.h"
#include "base/environment.h"
#include "base/files/file_util.h"
#include "base/functional/bind.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_util.h"
#include "base/strings/utf_string_conversions.h"
#include "chrome/browser/aux/installation_auth.h"
#include "chrome/browser/aux/browser_platform.h"
#include "chrome/browser/aux/profile_security_client.h"
#include "chrome/browser/aux/profile_state.h"
#include "chrome/browser/profiles/profile.h"
#include "content/public/browser/storage_partition.h"
#include "net/http/http_response_headers.h"
#include "net/base/url_util.h"
#include "net/traffic_annotation/network_traffic_annotation.h"
#include "services/network/public/cpp/resource_request.h"
#include "services/network/public/cpp/shared_url_loader_factory.h"
#include "services/network/public/cpp/simple_url_loader.h"
#include "services/network/public/mojom/url_response_head.mojom.h"

namespace {
constexpr size_t kMaximumResponseBytes = 2 * 1024 * 1024;
constexpr size_t kMaximumTasks = 200;
constexpr base::TimeDelta kRefreshInterval = base::Seconds(2);
constexpr net::NetworkTrafficAnnotationTag kTrafficAnnotation =
    net::DefineNetworkTrafficAnnotation("aux_native_task_projection", R"(
      semantics {
        sender: "Aux native task surfaces"
        description: "Retrieves account-scoped local tasks and dispatches explicit task actions."
        trigger: "A browser sidebar is visible or the user selects a task action."
        data: "Signed local installation challenge, account and task identifiers, and explicit user action."
        destination: LOCAL
      }
      policy {
        cookies_allowed: NO
        setting: "The native task sidebar is local to this browser profile."
        policy_exception_justification: "Authenticated loopback transport only."
      })");

uint16_t DaemonPort() {
  if (auto value = base::Environment::Create()->GetVar("AUX_PORT")) {
    unsigned parsed = 0;
    return base::StringToUint(*value, &parsed) && parsed > 0 && parsed <= 65535
               ? static_cast<uint16_t>(parsed)
               : 0;
  }
  return 21520;
}

GURL DaemonUrl(const std::string& path) {
  const auto port = DaemonPort();
  return port ? GURL("http://127.0.0.1:" + base::NumberToString(port) + path)
              : GURL();
}

bool ValidIdentity(const std::string& id) {
  return !id.empty() && id.size() <= 128 &&
         std::ranges::all_of(id, [](char character) {
           return base::IsAsciiAlphaNumeric(character) || character == '-' ||
                  character == '_';
         });
}

std::optional<AuxNativeTask> ParseTask(const base::Value& value) {
  const auto* row = value.GetIfDict();
  if (!row)
    return std::nullopt;
  const auto* id = row->FindString("id");
  const auto* title = row->FindString("title");
  const auto* status = row->FindString("status");
  if (!id || !ValidIdentity(*id) || !title || title->size() > 8192 || !status)
    return std::nullopt;
  AuxNativeTask task;
  task.id = *id;
  task.title = base::UTF8ToUTF16(*title);
  task.status = *status;
  task.unread = row->FindBool("unread").value_or(false);
  task.pinned = row->FindBool("pinned").value_or(false);
  task.can_pin = row->FindBool("canPin").value_or(false);
  if (const auto* pending = row->FindDict("popover")) {
    const auto* pending_id = pending->FindString("id");
    const auto* kind = pending->FindString("kind");
    const auto* title = pending->FindString("title");
    const auto* detail = pending->FindString("body");
    const auto* actions = pending->FindList("actions");
    if (!pending_id || !ValidIdentity(*pending_id) || !kind || !title ||
        !detail || title->size() > 8192 || detail->size() > 32768 || !actions ||
        actions->empty() || actions->size() > 2 ||
        (*kind != "permission-approval" && *kind != "draft-approval" &&
         *kind != "ask-user-question"))
      return std::nullopt;
    std::vector<std::string> action_ids;
    for (const auto& value : *actions) {
      const auto* row = value.GetIfDict();
      const auto* id = row ? row->FindString("id") : nullptr;
      if (!id || std::ranges::contains(action_ids, *id))
        return std::nullopt;
      action_ids.push_back(*id);
    }
    if ((*kind == "permission-approval" &&
         (action_ids.size() != 2 ||
          !std::ranges::contains(action_ids, "approve") ||
          !std::ranges::contains(action_ids, "deny"))) ||
        (*kind == "draft-approval" &&
         action_ids != std::vector<std::string>{"review"}) ||
        (*kind == "ask-user-question" &&
         action_ids != std::vector<std::string>{"answer"}))
      return std::nullopt;
    AuxNativeTask::PendingAction action;
    action.id = *pending_id;
    action.kind = *kind;
    action.title = base::UTF8ToUTF16(*title);
    action.detail = base::UTF8ToUTF16(*detail);
    task.pending_action = std::move(action);
  }
  return task;
}
}  // namespace

AuxNativeTaskFeed::AuxNativeTaskFeed(Profile* profile, UpdatedCallback updated)
    : profile_(profile), updated_(std::move(updated)) {}
AuxNativeTaskFeed::~AuxNativeTaskFeed() = default;

void AuxNativeTaskFeed::Start() {
  if (timer_.IsRunning())
    return;
  Refresh();
  timer_.Start(FROM_HERE, kRefreshInterval, this, &AuxNativeTaskFeed::Refresh);
}

void AuxNativeTaskFeed::Stop() {
  timer_.Stop();
  weak_factory_.InvalidateWeakPtrs();
  loaders_.clear();
  refresh_pending_ = false;
}

void AuxNativeTaskFeed::Refresh() {
  if (refresh_pending_)
    return;
  if (profile_->IsOffTheRecord()) {
    snapshot_ = Snapshot{.state = State::kPrivate};
    updated_.Run(snapshot_);
    return;
  }
  refresh_pending_ = true;
  VerifySecurity(base::BindOnce(&AuxNativeTaskFeed::OnAccountResolved,
                                weak_factory_.GetWeakPtr()));
}

void AuxNativeTaskFeed::OnAccountResolved(aux::ProfileSecurityState security) {
  const auto account_id = security.account_id;
  if (!security.allows_browsing()) {
    account_id_.reset();
    authorization_.clear();
    refresh_pending_ = false;
    snapshot_ = Snapshot{.state = State::kUnbound,
                         .error = security.error.empty()
                             ? u"Unlock Aux and finish setup for this browser profile."
                             : base::UTF8ToUTF16(security.error)};
    updated_.Run(snapshot_);
    return;
  }
  if (account_id_ != account_id)
    snapshot_.tasks.clear();
  account_id_ = account_id;
  EnsureAuthorization(base::BindOnce(&AuxNativeTaskFeed::FetchTasks,
                                     weak_factory_.GetWeakPtr()));
}

void AuxNativeTaskFeed::VerifySecurity(
    base::OnceCallback<void(aux::ProfileSecurityState)> callback) {
  const auto authorization = aux::BrowserPlatform::Get().authorization();
  aux::FetchProfileSecurity(
      aux::StateHome(), profile_->GetOriginalProfile()->GetPath(),
      profile_->GetDefaultStoragePartition()
          ->GetURLLoaderFactoryForBrowserProcess(),
      DaemonPort(), authorization,
      base::BindOnce(
          [](base::WeakPtr<AuxNativeTaskFeed> self, std::string authorization,
             base::OnceCallback<void(aux::ProfileSecurityState)> callback,
             aux::ProfileSecurityState state) {
            if (!self)
              return;
            if (authorization != aux::BrowserPlatform::Get().authorization()) {
              state.configured = false;
              state.locked = true;
              state.error = "Local daemon authorization changed. Reopen Aux.";
            }
            std::move(callback).Run(std::move(state));
          },
          weak_factory_.GetWeakPtr(), authorization, std::move(callback)));
}

void AuxNativeTaskFeed::EnsureAuthorization(AuthCallback callback) {
  // The browser supervisor owns the original supplied challenge/token contract.
  // Reuse its live authorization rather than maintain a second protocol client.
  authorization_ = aux::BrowserPlatform::Get().authorization();
  std::move(callback).Run(!authorization_.empty());
}

GURL AuxNativeTaskFeed::AccountUrl(const std::string& path) const {
  CHECK(account_id_);
  return DaemonUrl(path + "?accountId=" + base::NumberToString(*account_id_));
}

void AuxNativeTaskFeed::FetchTasks(bool authorized) {
  if (!authorized) {
    Fail(u"Aux could not verify this installation. Reconnect the local browser.");
    return;
  }
  Load(AccountUrl("/session/for-chrome/chats"), std::nullopt,
       base::BindOnce(&AuxNativeTaskFeed::OnTasks, weak_factory_.GetWeakPtr()));
}

void AuxNativeTaskFeed::OnTasks(std::optional<std::string> body, int status) {
  auto response = body && status == 200
                      ? base::JSONReader::ReadDict(*body, base::JSON_PARSE_RFC)
                      : std::nullopt;
  const auto* pinned = response ? response->FindList("pinned") : nullptr;
  const auto* recents = response ? response->FindList("recents") : nullptr;
  if (!pinned || !recents || pinned->size() + recents->size() > kMaximumTasks) {
    Fail(u"Tasks could not be loaded. Aux will try reconnecting.");
    return;
  }
  std::vector<AuxNativeTask> tasks;
  for (const auto* list : {pinned, recents}) {
    for (const auto& value : *list) {
      auto task = ParseTask(value);
      if (!task || std::ranges::any_of(tasks, [&](const auto& previous) {
            return previous.id == task->id;
          })) {
        Fail(u"Aux returned an invalid task projection.");
        return;
      }
      tasks.push_back(std::move(*task));
    }
  }
  VerifySecurity(base::BindOnce(
      [](base::WeakPtr<AuxNativeTaskFeed> self, std::optional<int> account_id,
         std::vector<AuxNativeTask> tasks, aux::ProfileSecurityState state) {
        if (!self)
          return;
        if (!state.allows_browsing() || state.account_id != account_id ||
            self->account_id_ != account_id) {
          self->account_id_.reset();
          self->snapshot_ = Snapshot{
              .state = State::kUnbound,
              .error =
                  u"Unlock this browser profile before loading its tasks."};
        } else {
          self->snapshot_ =
              Snapshot{.state = State::kReady, .tasks = std::move(tasks)};
        }
        self->refresh_pending_ = false;
        self->updated_.Run(self->snapshot_);
      },
      weak_factory_.GetWeakPtr(), account_id_, std::move(tasks)));
}

void AuxNativeTaskFeed::Fail(std::u16string error) {
  refresh_pending_ = false;
  snapshot_.state = State::kError;
  snapshot_.error = std::move(error);
  updated_.Run(snapshot_);
}

void AuxNativeTaskFeed::PerformAction(const std::string& task_id,
                                     const std::string& action,
                                     base::DictValue body,
                                     ActionCallback callback) {
  static constexpr auto kActions = std::to_array<std::string_view>(
      {"pin", "unpin", "mark-read", "archive", "delete", "rename",
       "resolve-popover", "move-to-project"});
  if (!account_id_ || profile_->IsOffTheRecord() || !ValidIdentity(task_id) ||
      !std::ranges::contains(kActions, action)) {
    std::move(callback).Run(u"This task action is unavailable for this profile.");
    return;
  }
  VerifySecurity(
      base::BindOnce(
          [](base::WeakPtr<AuxNativeTaskFeed> self, std::string task_id,
             std::string action, base::DictValue body, ActionCallback callback,
             aux::ProfileSecurityState security) {
            if (!self)
              return;
            if (!security.allows_browsing() ||
                security.account_id != self->account_id_) {
              std::move(callback).Run(u"This profile binding changed. Reopen the task.");
              self->Refresh();
              return;
            }
            self->DispatchAction(task_id, action, std::move(body),
                                 std::move(callback));
          },
          weak_factory_.GetWeakPtr(), task_id, action, std::move(body),
          std::move(callback)));
}

void AuxNativeTaskFeed::DispatchAction(const std::string& task_id,
                                       const std::string& action,
                                       base::DictValue body,
                                       ActionCallback callback) {
  const int account_id = *account_id_;
  EnsureAuthorization(base::BindOnce(
      [](base::WeakPtr<AuxNativeTaskFeed> self, std::string task_id,
         std::string action, base::DictValue body, int account_id,
         ActionCallback callback, bool authorized) {
        if (!self)
          return;
        if (!authorized || self->account_id_ != account_id) {
          std::move(callback).Run(u"Reconnect this profile before trying again.");
          return;
        }
        std::string path = "/session/for-chrome/" + task_id + "/" + action;
        if (action == "resolve-popover") {
          const auto* decision = body.FindString("action");
          const auto* popover = body.FindString("popoverId");
          if (!decision || (*decision != "approve" && *decision != "deny") ||
              !popover || !ValidIdentity(*popover)) {
            std::move(callback).Run(u"This approval action is invalid.");
            return;
          }
          body.Set("actionId", *decision);
          body.Set("sessionId", task_id);
          body.Remove("action");
          path = "/session/for-chrome/resolve-popover-action";
        }
        self->Load(
            self->AccountUrl(path), base::WriteJson(body),
            base::BindOnce(
                [](base::WeakPtr<AuxNativeTaskFeed> self,
                   ActionCallback callback, std::optional<std::string> body,
                   int status) {
                  if (!body || status != 200) {
                    std::move(callback).Run(
                        u"This task action could not be saved. Try again.");
                    return;
                  }
                  std::move(callback).Run(std::nullopt);
                  if (self)
                    self->Refresh();
                },
                self, std::move(callback)));
      },
      weak_factory_.GetWeakPtr(), task_id, action, std::move(body), account_id,
      std::move(callback)));
}

void AuxNativeTaskFeed::Load(const GURL& url,
                            std::optional<std::string> post_body,
                            LoadCallback callback) {
  auto request = std::make_unique<network::ResourceRequest>();
  request->url = url;
  request->credentials_mode = network::mojom::CredentialsMode::kOmit;
  request->redirect_mode = network::mojom::RedirectMode::kError;
  request->headers.SetHeader("Cache-Control", "no-store");
  if (!authorization_.empty())
    request->headers.SetHeader("Authorization", authorization_);
  if (post_body)
    request->method = "POST";
  auto loader = network::SimpleURLLoader::Create(std::move(request),
                                                kTrafficAnnotation);
  loader->SetTimeoutDuration(base::Seconds(10));
  loader->SetAllowHttpErrorResults(true);
  if (post_body)
    loader->AttachStringForUpload(*post_body, "application/json");
  const uint64_t id = ++next_request_id_;
  auto* current = loader.get();
  loaders_.emplace(id, std::move(loader));
  current->DownloadToString(
      profile_->GetDefaultStoragePartition()
          ->GetURLLoaderFactoryForBrowserProcess()
          .get(),
      base::BindOnce(
          [](base::WeakPtr<AuxNativeTaskFeed> self, uint64_t id,
             LoadCallback callback, std::optional<std::string> body) {
            if (!self)
              return;
            auto request = self->loaders_.find(id);
            if (request == self->loaders_.end())
              return;
            const auto* information = request->second->ResponseInfo();
            const int status = information && information->headers
                                   ? information->headers->response_code()
                                   : 0;
            self->loaders_.erase(request);
            if (status == 401) {
              self->authorization_.clear();
            }
            std::move(callback).Run(std::move(body), status);
          },
          weak_factory_.GetWeakPtr(), id, std::move(callback)),
      kMaximumResponseBytes);
}

void AuxNativeTaskFeed::RequestAgentTabs(AgentTabsOperation operation,
                                        base::DictValue input,
                                        AgentTabsCallback callback) {
  VerifySecurity(
      base::BindOnce(
          [](base::WeakPtr<AuxNativeTaskFeed> self,
             AgentTabsOperation operation, base::DictValue input,
             AgentTabsCallback callback, aux::ProfileSecurityState security) {
            if (!self)
              return;
            if (!security.allows_browsing()) {
              std::move(callback).Run(std::nullopt,
                  u"Unlock Aux and finish setup for this browser profile.");
              return;
            }
            self->account_id_ = security.account_id;
            self->EnsureAuthorization(base::BindOnce(
                [](base::WeakPtr<AuxNativeTaskFeed> self,
                   AgentTabsOperation operation, base::DictValue input,
                   AgentTabsCallback callback, bool authorized) {
                  if (!self)
                    return;
                  if (!authorized) {
                    std::move(callback).Run(std::nullopt,
                        u"Aux could not authenticate this local browser.");
                    return;
                  }
                  std::string path = "/session/for-chrome/agent-tabs";
                  switch (operation) {
                    case AgentTabsOperation::kList: break;
                    case AgentTabsOperation::kClose: path += "/close"; break;
                    case AgentTabsOperation::kCleanup: path += "/cleanup"; break;
                    case AgentTabsOperation::kPolicy: path += "/policy"; break;
                  }
                  const std::string profile_id = aux::ProfileIdForPath(
                      self->profile_->GetOriginalProfile()->GetPath());
                  const std::string mode = self->profile_->IsOffTheRecord()
                                               ? "incognito" : "normal";
                  GURL url = self->AccountUrl(path);
                  std::optional<std::string> body;
                  if (operation == AgentTabsOperation::kList) {
                    url = net::AppendQueryParameter(url, "profileId", profile_id);
                    url = net::AppendQueryParameter(url, "browserMode", mode);
                  } else {
                    input.Set("accountId", *self->account_id_);
                    input.Set("profileId", profile_id);
                    input.Set("browserMode", mode);
                    body = base::WriteJson(input);
                  }
                  self->Load(url, std::move(body), base::BindOnce(
                      [](AgentTabsCallback callback,
                         std::optional<std::string> body, int status) {
                        if (!body || status != 200) {
                          std::move(callback).Run(std::nullopt,
                              u"Agent tabs could not be updated. Refresh and try again.");
                          return;
                        }
                        std::move(callback).Run(std::move(body), std::nullopt);
                      }, std::move(callback)));
                }, self, operation, std::move(input), std::move(callback)));
          },
          weak_factory_.GetWeakPtr(), operation, std::move(input),
          std::move(callback)));
}
