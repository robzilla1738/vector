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
#include "base/memory/ref_counted.h"
#include "base/task/single_thread_task_runner.h"
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
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/profile_browser_collection.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "content/public/browser/devtools_agent_host.h"
#include "content/public/browser/web_contents.h"
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

class AuxNativeTaskFeed::AgentTabsRequest
    : public base::RefCounted<AuxNativeTaskFeed::AgentTabsRequest> {
 public:
  AgentTabsRequest(base::WeakPtr<AuxNativeTaskFeed> feed,
                   int account_id,
                   AgentTabsOperation operation,
                   base::DictValue input,
                   AgentTabsCallback callback)
      : feed_(feed),
        profile_(feed->profile_->GetWeakPtr()),
        account_id_(account_id),
        operation_(operation),
        input_(std::move(input)),
        callback_(std::move(callback)),
        profile_id_(aux::ProfileIdForPath(
            feed->profile_->GetOriginalProfile()->GetPath())),
        mode_(feed->profile_->IsOffTheRecord() ? "incognito" : "default") {}
  void Start() {
    if (operation_ == AgentTabsOperation::kPolicy) {
      FinishError(
          u"Per-task tab cleanup policy is not exposed by the supplied "
          u"runtime.");
      return;
    }
    if (operation_ != AgentTabsOperation::kList) {
      const auto* id = input_.FindString("sessionId");
      if (!id || !ValidIdentity(*id)) {
        FinishError(u"The selected task identity is invalid.");
        return;
      }
      base::DictValue row;
      row.Set("id", *id);
      sessions_.Append(std::move(row));
      NextSession();
      return;
    }
    base::DictValue input;
    input.Set("parent", "all");
    input.Set("ephemeral", "include");
    input.Set("routines", "include");
    input.Set("limit", 200);
    Rpc("sessions.list", std::move(input),
        base::BindOnce(&AgentTabsRequest::OnSessions,
                       base::WrapRefCounted(this)));
  }

 private:
  friend class base::RefCounted<AgentTabsRequest>;
  ~AgentTabsRequest() = default;
  using RpcCallback = base::OnceCallback<void(std::optional<base::Value>)>;
  struct OwnedTarget {
    std::string session_tab_id;
    std::string target_id;
  };
  struct LiveTab {
    raw_ptr<BrowserWindowInterface> browser;
    raw_ptr<content::WebContents> contents;
    int index;
  };
  std::optional<LiveTab> FindLiveTab(const std::string& target_id) const {
    if (!profile_)
      return std::nullopt;
    auto host = content::DevToolsAgentHost::GetForId(target_id);
    auto* contents = host ? host->GetWebContents() : nullptr;
    if (!contents || contents->GetBrowserContext() != profile_.get())
      return std::nullopt;
    auto* browser = ProfileBrowserCollection::GetForProfile(profile_.get())
                        ->FindBrowserWithTab(contents);
    if (!browser)
      return std::nullopt;
    const int index =
        browser->GetTabStripModel()->GetIndexOfWebContents(contents);
    if (index == TabStripModel::kNoTab)
      return std::nullopt;
    return LiveTab{browser, contents, index};
  }
  void Rpc(const std::string& method, base::DictValue input, RpcCallback done) {
    if (!feed_)
      return;
    input.Set("accountId", account_id_);
    const auto url =
        net::AppendQueryParameter(DaemonUrl("/trpc/" + method), "input",
                                  base::WriteJson(input).value_or("{}"));
    feed_->Load(
        url, std::nullopt,
        base::BindOnce(
            [](RpcCallback done, std::optional<std::string> body, int status) {
              auto reply =
                  body && status == 200
                      ? base::JSONReader::ReadDict(*body, base::JSON_PARSE_RFC)
                      : std::nullopt;
              const auto* result = reply ? reply->FindDict("result") : nullptr;
              const auto* data = result ? result->Find("data") : nullptr;
              std::move(done).Run(data ? std::make_optional(data->Clone())
                                       : std::nullopt);
            },
            std::move(done)));
  }
  void OnSessions(std::optional<base::Value> value) {
    const auto* rows = value ? value->GetIfList() : nullptr;
    if (!rows || rows->size() > 200) {
      FinishError(u"The supplied task inventory is unavailable.");
      return;
    }
    truncated_ = rows->size() == 200;
    sessions_ = rows->Clone();
    NextSession();
  }
  void NextSession() {
    if (!feed_)
      return;
    if (index_ == sessions_.size()) {
      feed_->VerifySecurity(base::BindOnce(&AgentTabsRequest::OnSecurity,
                                           base::WrapRefCounted(this)));
      return;
    }
    const auto* row = sessions_[index_].GetIfDict();
    const auto* id = row ? row->FindString("id") : nullptr;
    if (!id || !ValidIdentity(*id)) {
      FinishError(u"The supplied task inventory has an invalid identity.");
      return;
    }
    session_id_ = *id;
    base::DictValue input;
    input.Set("sessionId", session_id_);
    Rpc("sessions.get", std::move(input),
        base::BindOnce(&AgentTabsRequest::OnSession,
                       base::WrapRefCounted(this)));
  }
  void SkipSession(bool unavailable) {
    if (unavailable)
      unavailable_.Append(session_id_);
    ++index_;
    NextSession();
  }
  void OnSession(std::optional<base::Value> value) {
    const auto* session = value ? value->GetIfDict() : nullptr;
    const auto* id = session ? session->FindString("id") : nullptr;
    const auto* binding =
        session ? session->FindDict("browserBinding") : nullptr;
    const auto* profile_id =
        binding ? binding->FindString("profileId") : nullptr;
    const auto* mode = binding ? binding->FindString("browserMode") : nullptr;
    if (!id || *id != session_id_ || !profile_id || !mode) {
      SkipSession(true);
      return;
    }
    if (*profile_id != profile_id_ || *mode != mode_) {
      if (operation_ != AgentTabsOperation::kList) {
        FinishError(
            u"The selected task belongs to another browser profile or mode.");
        return;
      }
      SkipSession(false);
      return;
    }
    const auto* title = session->FindString("title");
    if (!title || title->size() > 8192) {
      SkipSession(true);
      return;
    }
    session_title_ = *title;
    base::DictValue input;
    input.Set("sessionId", session_id_);
    Rpc("sessions.tabs.list", std::move(input),
        base::BindOnce(&AgentTabsRequest::OnTabs, base::WrapRefCounted(this)));
  }
  void OnTabs(std::optional<base::Value> value) {
    const auto* tabs = value ? value->GetIfList() : nullptr;
    if (!tabs || tabs->size() > 2000) {
      SkipSession(true);
      return;
    }
    base::ListValue verified;
    for (const auto& item : *tabs) {
      const auto* tab = item.GetIfDict();
      if (!tab) {
        SkipSession(true);
        return;
      }
      const auto* owner = tab->FindString("sessionId");
      const auto* ownership = tab->FindString("ownership");
      // list includes child sessions. Each child requires its own verified
      // binding.
      if (!owner || *owner != session_id_ || !ownership ||
          *ownership != "owned")
        continue;
      const auto* id = tab->FindString("id");
      const auto* target = tab->FindString("targetId");
      const auto* url = tab->FindString("url");
      const auto* data = tab->FindDict("data");
      const auto* title = data ? data->FindString("title") : nullptr;
      if (!id || !ValidIdentity(*id) || !target || !ValidIdentity(*target) ||
          !url || url->size() > 65536 || !title || title->size() > 8192) {
        SkipSession(true);
        return;
      }
      if (!FindLiveTab(*target))
        continue;
      if (owned_.size() >= 2000) {
        truncated_ = true;
        continue;
      }
      base::DictValue row;
      row.Set("id", *id);
      row.Set("targetId", *target);
      row.Set("title", *title);
      row.Set("url", *url);
      row.Set("createdByAgent", true);
      verified.Append(std::move(row));
      owned_.push_back({*id, *target});
    }
    if (!verified.empty()) {
      base::DictValue group;
      group.Set("sessionId", session_id_);
      group.Set("title", session_title_);
      group.Set("tabs", std::move(verified));
      groups_.Append(std::move(group));
    }
    ++index_;
    NextSession();
  }
  void OnSecurity(aux::ProfileSecurityState state) {
    if (!feed_ || !profile_)
      return;
    if (!state.allows_browsing() || state.account_id != account_id_ ||
        feed_->account_id_ != account_id_) {
      FinishError(
          u"This profile locked or its account changed. Reopen agent tabs.");
      return;
    }
    if (operation_ == AgentTabsOperation::kList) {
      base::DictValue response;
      response.Set("groups", std::move(groups_));
      response.Set("available", unavailable_.empty() ||
                                    !response.FindList("groups")->empty());
      response.Set("unavailableSessionIds", std::move(unavailable_));
      response.Set("truncated", truncated_);
      Finish(std::move(response));
      return;
    }
    if (!unavailable_.empty() || truncated_) {
      FinishError(u"The task's current tab ownership could not be verified.");
      return;
    }
    if (operation_ == AgentTabsOperation::kClose) {
      const auto* id = input_.FindString("sessionTabId");
      const auto* target = input_.FindString("targetId");
      auto chosen = std::ranges::find_if(owned_, [&](const auto& row) {
        return id && target && row.session_tab_id == *id &&
               row.target_id == *target;
      });
      if (chosen == owned_.end()) {
        FinishError(u"This target is no longer owned by the selected task.");
        return;
      }
      const OwnedTarget selected = *chosen;
      owned_ = {selected};
    }
    for (const auto& row : owned_) {
      auto live = FindLiveTab(row.target_id);
      if (!live)
        continue;
      auto* model = live->browser->GetTabStripModel();
      if (operation_ == AgentTabsOperation::kCleanup &&
          model->active_index() == live->index) {
        ++skipped_active_;
        continue;
      }
      closing_.push_back(row.target_id);
      model->CloseWebContents(live->contents,
                              TabStripModel::CLOSE_CREATE_HISTORICAL_TAB);
    }
    ObserveClosures();
  }
  void ObserveClosures() {
    if (!feed_ || !profile_)
      return;
    const bool pending = std::ranges::any_of(
        closing_, [&](const auto& id) { return FindLiveTab(id).has_value(); });
    if (!pending) {
      base::DictValue response;
      response.Set("closed", static_cast<int>(closing_.size()));
      response.Set("skippedActive", skipped_active_);
      Finish(std::move(response));
    } else if (++close_observations_ >= 30) {
      FinishError(
          u"Some tabs remain open. Refresh to review them; a page may be "
          u"waiting for confirmation.");
    } else {
      base::SingleThreadTaskRunner::GetCurrentDefault()->PostDelayedTask(
          FROM_HERE,
          base::BindOnce(&AgentTabsRequest::ObserveClosures,
                         base::WrapRefCounted(this)),
          base::Milliseconds(100));
    }
  }
  void Finish(base::DictValue response) {
    if (callback_)
      std::move(callback_).Run(base::WriteJson(response), std::nullopt);
  }
  void FinishError(const std::u16string& error) {
    if (callback_)
      std::move(callback_).Run(std::nullopt, error);
  }
  base::WeakPtr<AuxNativeTaskFeed> feed_;
  base::WeakPtr<Profile> profile_;
  const int account_id_;
  const AgentTabsOperation operation_;
  base::DictValue input_;
  AgentTabsCallback callback_;
  const std::string profile_id_, mode_;
  base::ListValue sessions_, groups_, unavailable_;
  std::vector<OwnedTarget> owned_;
  std::vector<std::string> closing_;
  size_t index_ = 0;
  std::string session_id_, session_title_;
  bool truncated_ = false;
  int skipped_active_ = 0, close_observations_ = 0;
};

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
  VerifySecurity(base::BindOnce(
      [](base::WeakPtr<AuxNativeTaskFeed> self, AgentTabsOperation operation,
         base::DictValue input, AgentTabsCallback callback,
         aux::ProfileSecurityState security) {
        if (!self)
          return;
        if (!security.allows_browsing() || !security.account_id) {
          std::move(callback).Run(
              std::nullopt,
              u"Unlock this browser profile before opening agent tabs.");
          return;
        }
        self->account_id_ = security.account_id;
        self->authorization_ = aux::BrowserPlatform::Get().authorization();
        base::MakeRefCounted<AgentTabsRequest>(self, *security.account_id,
                                               operation, std::move(input),
                                               std::move(callback))
            ->Start();
      },
      weak_factory_.GetWeakPtr(), operation, std::move(input),
      std::move(callback)));
}
