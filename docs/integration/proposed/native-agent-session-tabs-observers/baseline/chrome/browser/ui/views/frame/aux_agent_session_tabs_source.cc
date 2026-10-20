// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_agent_session_tabs_source.h"
#include <algorithm>
#include <set>
#include <utility>
#include "base/check.h"
#include "base/environment.h"
#include "base/functional/bind.h"
#include "base/json/json_writer.h"
#include "base/strings/string_number_conversions.h"
#include "chrome/browser/aux/browser_platform.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser.h"
#include "chrome/browser/ui/browser_init_state.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/frame/aux_bookmark_tab_exclusion.h"
#include "chrome/browser/ui/views/frame/aux_chat_navigation.h"
#include "content/public/browser/devtools_agent_host.h"
#include "content/public/browser/storage_partition.h"
#include "net/base/url_util.h"
#include "net/http/http_response_headers.h"
#include "net/traffic_annotation/network_traffic_annotation.h"
#include "services/network/public/cpp/resource_request.h"
#include "services/network/public/cpp/simple_url_loader.h"
#include "services/network/public/mojom/url_response_head.mojom.h"

namespace aux {
namespace {
constexpr auto kTraffic = net::DefineNetworkTrafficAnnotation(
    "aux_native_session_tabs", R"(
  semantics {
    sender: "Aux native session tabs"
    description: "Resolves actual marked browser targets against the supplied account session ancestry."
    trigger: "The genuine session-tabs owner polls its real tab model."
    data: "Local installation authorization, account and actual DevTools target IDs."
    destination: LOCAL
  }
  policy {
    cookies_allowed: NO
    setting: "Follows the actual profile and account of its owning browser window."
    policy_exception_justification: "Supplied authenticated loopback daemon only."
  })");
std::string TargetId(const tabs::TabInterface& tab) {
  auto* contents = tab.GetContents();
  return contents ? content::DevToolsAgentHost::GetOrCreateFor(contents)->GetId()
                  : std::string();
}
}  // namespace
AgentSessionTabsSource::AgentSessionTabsSource(
    BrowserWindowInterface& browser, TabStripModel& tabs,
    base::RepeatingClosure changed)
    : browser_(browser.GetWeakPtr()), tabs_(&tabs), changed_(std::move(changed)) {
  CHECK(changed_);
  CHECK(browser.GetTabStripModel() == &tabs);
  tabs_->AddObserver(this);
}
AgentSessionTabsSource::~AgentSessionTabsSource() {
  Retire();
  if (tabs_) tabs_->RemoveObserver(this);
}
void AgentSessionTabsSource::Start() {
  if (running_ || !browser_ || !tabs_) return;
  running_ = true;
  timer_.Start(FROM_HERE, base::Milliseconds(250), this,
               &AgentSessionTabsSource::Poll);
}
void AgentSessionTabsSource::Retire() {
  running_ = false;
  polling_ = false;
  timer_.Stop();
  weak_.InvalidateWeakPtrs();
  loader_.reset();
  authorization_.clear();
}
bool AgentSessionTabsSource::ScopeCurrent() const {
  return running_ && browser_ && tabs_ && profile_ &&
      browser_->GetTabStripModel() == tabs_ && browser_->GetProfile() == profile_.get() &&
      profile_->GetOriginalProfile()->GetPath() == original_profile_path_ &&
      ChatAccountForProfile(*profile_) == account_;
}
bool AgentSessionTabsSource::PollAllowed() const {
  if (!running_ || !browser_ || !tabs_) return false;
  // This owner is constructed by the actual desktop Chromium BrowserView.
  const auto* browser = static_cast<const Browser*>(browser_.get());
  const auto* state = BrowserInitState::From(browser_.get());
  return state && !state->is_aux_profile_switch_cache() &&
      !browser->IsAuxProfileSwitchInProgress() &&
      !browser->IsAuxProfileSwitchEmptySuppressed();
}
bool AgentSessionTabsSource::RepresentsTab(const tabs::TabInterface& tab) const {
  if (!ScopeCurrent() || tabs_->GetIndexOfTab(&tab) == TabStripModel::kNoTab ||
      !IsBookmarkTabExcluded(const_cast<tabs::TabInterface*>(&tab), tabs_))
    return false;
  return graph_.RootForTarget(TargetId(tab)).has_value();
}
void AgentSessionTabsSource::Poll() {
  if (!running_ || polling_) return;
  polling_ = true;
  if (!PollAllowed()) { Finished(); return; }
  auto* profile = browser_->GetProfile();
  const auto path = profile->GetOriginalProfile()->GetPath();
  const int account = ChatAccountForProfile(*profile);
  if (profile_.get() != profile || path != original_profile_path_ || account != account_) {
    profile_ = profile->GetWeakPtr();
    original_profile_path_ = path;
    account_ = account;
    sessions_.clear();
    graph_.Clear();
    auto alive = weak_.GetWeakPtr();
    Reconcile();
    if (!alive) return;
  }
  targets_.clear();
  for (int i = 0; i < tabs_->count(); ++i) {
    auto* tab = tabs_->GetTabAtIndex(i);
    if (!IsBookmarkTabExcluded(tab, tabs_)) continue;
    auto id = TargetId(*tab);
    if (!id.empty()) targets_.push_back(std::move(id));
  }
  if (targets_.empty()) {
    graph_.Replace(sessions_, {});
    auto alive = weak_.GetWeakPtr();
    Reconcile();
    if (alive) Finished();
    return;
  }
  BrowserPlatform::Get().RequestDaemonAuthorization(
      std::exchange(force_authorization_, false),
      base::BindOnce(&AgentSessionTabsSource::Authorized, weak_.GetWeakPtr()));
}
void AgentSessionTabsSource::Authorized(std::optional<std::string> authorization) {
  if (!ScopeCurrent() || !PollAllowed() || !authorization || authorization->empty()) {
    Finished(); return;
  }
  authorization_ = std::move(*authorization);
  Request("sessions.list", AgentSessionTabsModel::ListInput(account_), false,
          base::BindOnce(&AgentSessionTabsSource::Listed, weak_.GetWeakPtr()));
}
void AgentSessionTabsSource::Listed(int status, std::optional<std::string> body) {
  if (!ScopeCurrent() || !PollAllowed()) { Finished(); return; }
  if (status == 401) force_authorization_ = true;
  auto sessions = status == 200 && body
      ? AgentSessionTabsModel::ParseSessions(*body) : std::nullopt;
  if (!sessions) { Finished(); return; }
  pending_sessions_ = std::move(*sessions);
  pending_targets_.clear();
  cursor_ = 0;
  ResolveNext();
}
void AgentSessionTabsSource::ResolveNext() {
  if (!ScopeCurrent() || !PollAllowed()) { Finished(); return; }
  if (cursor_ == targets_.size()) {
    sessions_ = std::move(pending_sessions_);
    graph_.Replace(sessions_, std::move(pending_targets_));
    auto alive = weak_.GetWeakPtr();
    Reconcile();
    if (alive) Finished();
    return;
  }
  const size_t count = std::min(size_t{32}, targets_.size() - cursor_);
  std::string methods;
  base::DictValue input;
  for (size_t i = 0; i < count; ++i) {
    if (i) methods += ',';
    methods += "sessions.tabs.resolveByTarget";
    input.Set(base::NumberToString(i), base::DictValue()
        .Set("accountId", account_).Set("targetId", targets_[cursor_ + i]));
  }
  Request(std::move(methods), std::move(input), true,
          base::BindOnce(&AgentSessionTabsSource::Resolved, weak_.GetWeakPtr(), count));
}
void AgentSessionTabsSource::Resolved(size_t count, int status,
                                     std::optional<std::string> body) {
  if (!ScopeCurrent() || !PollAllowed()) { Finished(); return; }
  if (status == 401) force_authorization_ = true;
  auto result = status == 200 && body ? AgentSessionTabsModel::ParseTargets(
      *body, std::span<const std::string>(targets_).subspan(cursor_, count)) : std::nullopt;
  if (!result) { Finished(); return; }
  for (auto& [target, session] : *result)
    pending_targets_.insert_or_assign(target, std::move(session));
  cursor_ += count;
  ResolveNext();
}
void AgentSessionTabsSource::Request(std::string method, base::DictValue input,
                                    bool batch, Loaded loaded) {
  if (!ScopeCurrent()) { std::move(loaded).Run(0, std::nullopt); return; }
  const auto json = base::WriteJson(input);
  unsigned port = 21520;
  if (auto text = base::Environment::Create()->GetVar("AUX_PORT")) {
    if (!base::StringToUint(*text, &port) || port == 0 || port > 65535) {
      std::move(loaded).Run(0, std::nullopt); return;
    }
  }
  if (!json) { std::move(loaded).Run(0, std::nullopt); return; }
  GURL url("http://127.0.0.1:" + base::NumberToString(port) + "/trpc/" + method);
  url = net::AppendQueryParameter(url, "input", *json);
  if (batch) url = net::AppendQueryParameter(url, "batch", "1");
  auto request = std::make_unique<network::ResourceRequest>();
  request->url = url;
  request->credentials_mode = network::mojom::CredentialsMode::kOmit;
  request->redirect_mode = network::mojom::RedirectMode::kError;
  request->headers.SetHeader("Authorization", authorization_);
  loader_ = network::SimpleURLLoader::Create(std::move(request), kTraffic);
  loader_->SetTimeoutDuration(base::Seconds(5));
  loader_->SetAllowHttpErrorResults(true);
  loader_->DownloadToString(profile_->GetDefaultStoragePartition()
      ->GetURLLoaderFactoryForBrowserProcess().get(),
      base::BindOnce([](base::WeakPtr<AgentSessionTabsSource> self, Loaded loaded,
                        std::optional<std::string> body) {
        if (!self) return;
        const auto* response = self->loader_->ResponseInfo();
        const int status = response && response->headers ? response->headers->response_code() : 0;
        self->loader_.reset();
        std::move(loaded).Run(status, std::move(body));
      }, weak_.GetWeakPtr(), std::move(loaded)), 0x400000);
}
void AgentSessionTabsSource::Finished() {
  authorization_.clear();
  pending_sessions_.clear();
  pending_targets_.clear();
  targets_.clear();
  polling_ = false;
  if (running_ && tabs_)
    timer_.Start(FROM_HERE, base::Seconds(2), this, &AgentSessionTabsSource::Poll);
}
void AgentSessionTabsSource::Reconcile() {
  std::vector<tabs::TabHandle> current;
  if (ScopeCurrent()) {
    for (int i = 0; i < tabs_->count(); ++i) {
      const auto* tab = tabs_->GetTabAtIndex(i);
      if (RepresentsTab(*tab)) current.push_back(tab->GetHandle());
    }
  }
  std::set<tabs::TabHandle> remaining(current.begin(), current.end());
  std::vector<tabs::TabHandle> order;
  for (auto handle : order_) {
    if (remaining.erase(handle)) order.push_back(handle);
  }
  for (auto handle : current) {
    if (remaining.erase(handle)) order.push_back(handle);
  }
  order_ = std::move(order);
  changed_.Run();
}
void AgentSessionTabsSource::OnTabStripModelChanged(
    TabStripModel*, const TabStripModelChange&, const TabStripSelectionChange&) {
  Reconcile();
}
void AgentSessionTabsSource::OnTabChangedAt(tabs::TabInterface*, TabChangeType) {
  Reconcile();
}
void AgentSessionTabsSource::OnTabStripModelDestroyed(TabStripModel*) {
  tabs_ = nullptr;
  Retire();
}
}  // namespace aux
