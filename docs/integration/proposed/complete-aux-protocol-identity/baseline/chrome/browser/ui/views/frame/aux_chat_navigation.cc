// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/views/frame/aux_chat_navigation.h"
#include <string>
#include "base/environment.h"
#include "base/functional/bind.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/memory/ref_counted.h"
#include "base/strings/string_number_conversions.h"
#include "base/time/time.h"
#include "base/supports_user_data.h"
#include "chrome/browser/aux/browser_platform.h"
#include "chrome/browser/aux/profile_identity.h"
#include "chrome/browser/ui/simple_message_box.h"
#include "content/public/browser/storage_partition.h"
#include "net/http/http_status_code.h"
#include "net/http/http_response_headers.h"
#include "net/traffic_annotation/network_traffic_annotation.h"
#include "services/network/public/cpp/resource_request.h"
#include "services/network/public/cpp/simple_url_loader.h"
#include "services/network/public/mojom/url_response_head.mojom.h"
#include "ui/base/base_window.h"

#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/navigator/browser_navigator.h"
#include "chrome/browser/ui/navigator/browser_navigator_params.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/tabs/tab_strip_user_gesture_details.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/navigation_entry.h"
#include "content/public/browser/web_contents.h"
#include "extensions/browser/extension_registry.h"
#include "ui/base/page_transition_types.h"
#include "ui/base/window_open_disposition.h"
#include "url/gurl.h"

namespace aux {
namespace {
constexpr char kResolvedAccountKey[] = "aux-resolved-chat-account";
class ResolvedAccount final : public base::SupportsUserData::Data {
 public:
  ResolvedAccount(Profile& profile, int value)
      : id(value), profile_id(GetProfileId(&profile)),
        user(profile.GetPrefs()->GetString("aside.account_user_id")),
        bound_id(profile.GetPrefs()->GetInteger("aside.account_id")) {}
  const int id;
  const std::string profile_id, user;
  const int bound_id;
};
bool MatchesEntry(content::NavigationEntry* entry, const GURL& target) {
  return entry && (entry->GetURL() == target || entry->GetVirtualURL() == target);
}
bool MatchesTarget(content::WebContents* contents, const GURL& target) {
  if (!contents) return false;
  auto& controller = contents->GetController();
  // Original4564b14 compares complete serialized URLs; no task-ID, query or
  // trailing-slash normalization is appropriate for reusing this exact page.
  return contents->GetVisibleURL() == target ||
      contents->GetLastCommittedURL() == target ||
      MatchesEntry(controller.GetVisibleEntry(), target) ||
      MatchesEntry(controller.GetPendingEntry(), target) ||
      MatchesEntry(controller.GetLastCommittedEntry(), target);
}
constexpr auto kAccountRouteAnnotation = net::DefineNetworkTrafficAnnotation(
    "aux_native_account_route",
    R"(semantics {sender:"Aux native navigation" description:"Resolve the actual local account for the selected Chromium profile before opening Agent settings or chats." trigger:"User opens Chat or Settings." data:"Native profile ID/path, optional bound account/user, and installation authorization." destination:LOCAL} policy {cookies_allowed:NO setting:"Required for local Agent navigation." policy_exception_justification:"Authenticated loopback daemon only."})");

void NavigateAccountRoute(BrowserWindowInterface& browser, int account,
                          const std::string& suffix) {
  const GURL target(std::string("chrome-extension://") + kAgentExtensionId +
      "/main.html#/u/" + std::to_string(account) + suffix);
  auto* model = browser.GetTabStripModel();
  if (!target.is_valid() || !model) return;
  const int active = model->active_index();
  if (suffix == "/tasks/new" && active != TabStripModel::kNoTab &&
      MatchesTarget(model->GetWebContentsAt(active), target)) return;
  for (int index = 0; index < model->count(); ++index) {
    if (MatchesTarget(model->GetWebContentsAt(index), target)) {
      model->ActivateTabAt(index, TabStripUserGestureDetails(
          TabStripUserGestureDetails::GestureType::kNone));
      return;
    }
  }
  NavigateParams params(&browser, target, ui::PAGE_TRANSITION_LINK);
  params.disposition = WindowOpenDisposition::NEW_FOREGROUND_TAB;
  params.source_contents = model->GetActiveWebContents();
  params.window_action = NavigateParams::WindowAction::kShowWindow;
  Navigate(&params);
}

class AccountRouteRequest : public base::RefCounted<AccountRouteRequest> {
 public:
  AccountRouteRequest(BrowserWindowInterface& browser, std::string suffix)
      : browser_(browser.GetWeakPtr()),
        profile_(browser.GetProfile()->GetWeakPtr()),
        profile_id_(GetProfileId(browser.GetProfile())),
        suffix_(std::move(suffix)),
        authorization_(BrowserPlatform::Get().authorization()) {}
  void Start() {
    if (!profile_ || profile_->IsOffTheRecord() || profile_id_.empty() ||
        !authorization_.starts_with("AsideDaemonSessionToken ")) {
      Fail();
      return;
    }
    unsigned port = 21520;
    if (auto value = base::Environment::Create()->GetVar("AUX_PORT"); value &&
        (!base::StringToUint(*value, &port) || !port || port > 65535)) {
      Fail();
      return;
    }
    // Exact context used by the supplied getProfileContext / ensureProfileAccount
    // flow. The daemon validates/reuses/creates the real binding; no account ID,
    // onboarding completion or Vault unlock state is fabricated here.
    base::DictValue context;
    context.Set("profileId", profile_id_);
    context.Set("profilePath", profile_->GetPath().value());
    if (auto index = GetProfileIndex(profile_.get()))
      context.Set("profileIndex", *index);
    auto* prefs = profile_->GetPrefs();
    if (prefs->FindPreference("aside.account_user_id")) {
      const auto& user = prefs->GetString("aside.account_user_id");
      if (!user.empty()) context.Set("boundUserId", user);
    }
    if (prefs->FindPreference("aside.account_id")) {
      const int id = prefs->GetInteger("aside.account_id");
      if (id >= 0) context.Set("boundAccountId", id);
    }
    auto request = std::make_unique<network::ResourceRequest>();
    request->url = GURL("http://127.0.0.1:" + base::NumberToString(port) +
                       "/trpc/accounts.ensureProfileAccount");
    request->method = "POST";
    request->credentials_mode = network::mojom::CredentialsMode::kOmit;
    request->redirect_mode = network::mojom::RedirectMode::kError;
    request->headers.SetHeader("Authorization", authorization_);
    loader_ = network::SimpleURLLoader::Create(std::move(request),
                                               kAccountRouteAnnotation);
    loader_->AttachStringForUpload(base::WriteJson(context).value_or("{}"),
                                  "application/json");
    loader_->SetTimeoutDuration(base::Seconds(10));
    loader_->DownloadToString(
        profile_->GetDefaultStoragePartition()
            ->GetURLLoaderFactoryForBrowserProcess().get(),
        base::BindOnce(&AccountRouteRequest::Complete, base::WrapRefCounted(this)),
        65536);
  }
 private:
  friend class base::RefCounted<AccountRouteRequest>;
  ~AccountRouteRequest() = default;
  void Complete(std::optional<std::string> body) {
    if (!browser_ || !profile_ || browser_->GetProfile() != profile_.get() ||
        GetProfileId(profile_.get()) != profile_id_ ||
        BrowserPlatform::Get().authorization() != authorization_) return;
    const bool ok = loader_->ResponseInfo() && loader_->ResponseInfo()->headers &&
        loader_->ResponseInfo()->headers->response_code() == net::HTTP_OK;
    loader_.reset();
    auto reply = ok && body ? base::JSONReader::ReadDict(*body,
        base::JSON_PARSE_RFC) : std::nullopt;
    const auto* result = reply ? reply->FindDict("result") : nullptr;
    const auto* data = result ? result->FindDict("data") : nullptr;
    const auto id = data ? data->FindInt("id") : std::nullopt;
    if (!id || *id < 0) {
      Fail();
      return;
    }
    RememberResolvedChatAccount(*profile_, *id);
    NavigateAccountRoute(*browser_, *id, suffix_);
  }
  void Fail() {
    if (browser_) chrome::ShowWarningMessageBoxAsync(
        browser_->GetWindow()->GetNativeWindow(), u"Aux navigation unavailable",
        u"Aux could not resolve this profile with its local service. Please retry after the browser finishes starting.");
  }
  base::WeakPtr<BrowserWindowInterface> browser_;
  base::WeakPtr<Profile> profile_;
  const std::string profile_id_, suffix_, authorization_;
  std::unique_ptr<network::SimpleURLLoader> loader_;
};
}  // namespace
void RememberResolvedChatAccount(Profile& profile, int account_id) {
  if (!profile.IsOffTheRecord() && account_id >= 0)
    profile.SetUserData(kResolvedAccountKey,
                       std::make_unique<ResolvedAccount>(profile, account_id));
}
int ChatAccountForProfile(Profile& profile) {
  const auto* resolved = static_cast<ResolvedAccount*>(
      profile.GetUserData(kResolvedAccountKey));
  if (resolved && resolved->profile_id == GetProfileId(&profile) &&
      resolved->user == profile.GetPrefs()->GetString("aside.account_user_id") &&
      resolved->bound_id == profile.GetPrefs()->GetInteger("aside.account_id"))
    return resolved->id;
  if (!profile.IsOffTheRecord()) {
    if (auto* prefs = profile.GetPrefs();
        prefs && prefs->FindPreference("aside.account_id")) {
      const int id = prefs->GetInteger("aside.account_id");
      if (id >= 0) return id;
    }
    if (auto* manager = g_browser_process->profile_manager()) {
      const auto entries = manager->GetProfileAttributesStorage()
          .GetAllProfilesAttributesSortedForDisplay();
      for (size_t i = 0; i < entries.size(); ++i)
        if (entries[i]->GetPath() == profile.GetPath()) return static_cast<int>(i);
    }
  }
  return 0;
}
bool IsNewChatDocument(content::WebContents& contents, Profile& profile) {
  const GURL target(std::string("chrome-extension://") + kAgentExtensionId +
      "/main.html#/u/" + std::to_string(ChatAccountForProfile(profile)) +
      "/tasks/new");
  return target.is_valid() && MatchesTarget(&contents, target);
}
bool CanOpenNewChat(BrowserWindowInterface& browser) {
  auto* registry = extensions::ExtensionRegistry::Get(browser.GetProfile());
  return browser.GetType() == BrowserWindowInterface::Type::TYPE_NORMAL &&
      registry && registry->GetExtensionById(kAgentExtensionId,
          extensions::ExtensionRegistry::EVERYTHING);
}
void OpenAccountRoute(BrowserWindowInterface& browser, std::string suffix) {
  if (!CanOpenNewChat(browser)) return;
  base::MakeRefCounted<AccountRouteRequest>(browser, std::move(suffix))->Start();
}
void ShowAllChats(BrowserWindowInterface& browser) {
  OpenAccountRoute(browser, "/tasks?view=list&filter=all&order=desc");
}
void OpenNewChat(BrowserWindowInterface& browser) {
  OpenAccountRoute(browser, "/tasks/new");
}
}  // namespace aux
