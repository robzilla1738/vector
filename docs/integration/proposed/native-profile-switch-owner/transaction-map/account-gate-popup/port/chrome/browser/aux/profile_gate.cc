// Copyright 2026 Aux Authors. All rights reserved.
// Native first-window bootstrap: native/platform.md P3/P5.
#include "chrome/browser/aux/profile_gate.h"
#include "chrome/browser/aux/ntp_prerender_service.h"

#include <map>
#include <optional>

#include "base/environment.h"
#include "base/functional/bind.h"
#include "base/json/json_writer.h"
#include "base/memory/weak_ptr.h"
#include "base/no_destructor.h"
#include "base/scoped_observation.h"
#include "base/strings/string_number_conversions.h"
#include "base/task/single_thread_task_runner.h"
#include "base/task/thread_pool.h"
#include "base/timer/timer.h"
#include "chrome/browser/aux/browser_platform.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/aux/installation_auth.h"
#include "chrome/browser/aux/profile_state.h"
#include "chrome/browser/aux/profile_security_client.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/net/system_network_context_manager.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/profiles/profile_observer.h"
#include "chrome/browser/ui/browser_init_state.h"
#include "chrome/browser/ui/browser_tabstrip.h"
#include "chrome/browser/ui/browser_window/public/create_browser_window.h"
#include "chrome/browser/ui/unload_controller.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface_iterator.h"
#include "chrome/common/pref_names.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/navigation_entry.h"
#include "content/public/browser/web_contents.h"
#include "extensions/browser/extension_registry.h"
#include "extensions/browser/extension_registry_observer.h"
#include "extensions/common/extension.h"
#include "net/traffic_annotation/network_traffic_annotation.h"
#include "services/network/public/cpp/resource_request.h"
#include "services/network/public/cpp/simple_url_loader.h"
#include "ui/base/base_window.h"
#include "ui/display/display.h"
#include "ui/display/screen.h"
namespace aux {
namespace {
constexpr auto kBindingAnnotation = net::DefineNetworkTrafficAnnotation(
    "aux_profile_binding",
    R"(semantics {sender:"Aux browser profile gate" description:"Bind the actual local Chromium profile to its independently managed local Aux account before allowing browser windows." trigger:"First window for a local profile." data:"Local profile identity/path/index and ephemeral installation authorization." destination:LOCAL} policy {cookies_allowed:NO setting:"Required local Aux profile setup." policy_exception_justification:"Local browser-owned daemon only."})");
class ProfileGate final : public ProfileObserver,
                          public extensions::ExtensionRegistryObserver {
 public:
  explicit ProfileGate(
      Profile* profile,
      base::RepeatingCallback<void(content::WebContents*)> initialize_tab)
      : initialize_tab_(std::move(initialize_tab)),
        profile_(profile->GetWeakPtr()) {
    profile_observer_.Observe(profile);
    extension_observer_.Observe(extensions::ExtensionRegistry::Get(profile));
    Bind();
  }
  ~ProfileGate() override {
    ClearPreload();
    CloseBootstrap();
  }
  void SetInitializer(
      base::RepeatingCallback<void(content::WebContents*)> callback) {
    if (callback) {
      initialize_tab_ = std::move(callback);
    }
  }
  bool has_profile() const { return profile_ != nullptr; }
  bool owns_bootstrap(BrowserWindowInterface* browser) const {
    return browser && bootstrap_browser_.get() == browser && profile_ &&
           browser->GetProfile() == profile_.get() &&
           browser->GetType() == BrowserWindowInterface::TYPE_APP_POPUP &&
           !UnloadController::From(browser)->is_attempting_to_close_browser();
  }
  bool allowed() const {
    return allowed_ && profile_ &&
           extensions::ExtensionRegistry::Get(profile_.get())
               ->enabled_extensions()
               .Contains(kAgentExtensionId) &&
           extensions::ExtensionRegistry::Get(profile_.get())
               ->enabled_extensions()
               .Contains(kVaultExtensionId);
  }

 private:
  void ClearPreload() {
    SetNtpPrerenderEnabled(profile_.get(), false);
  }
  void WarmNewTab() {
    SetNtpPrerenderEnabled(profile_.get(), allowed());
  }

  void Bind() {
    if (!profile_ || profile_->IsOffTheRecord()) {
      Refresh();
      return;
    }
    base::ThreadPool::PostTaskAndReplyWithResult(
        FROM_HERE, {base::MayBlock()},
        base::BindOnce(&ReadProfileSecurity, StateHome(), profile_->GetPath()),
        base::BindOnce(&ProfileGate::DidReadBinding, weak_.GetWeakPtr()));
  }
  void DidReadBinding(ProfileSecurityState state) {
    if (!profile_ || state.bound || !state.local_only.value_or(false) ||
        !state.binding_error.empty()) {
      Refresh();
      return;
    }
    // Existing local/cloud bindings are never rewritten on startup. Only a
    // verified fresh profile requests the daemon's genuine local resolution.
    const auto& path = profile_->GetPath();
    base::DictValue identity;
    identity.Set("profileId", ProfileIdForPath(path));
    identity.Set("chromiumProfileId", ProfileIdForPath(path));
    identity.Set("bindingVersion", 1);
    identity.Set("localOnly", true);
    identity.Set("profilePath", path.value());
    int index = 0;
    for (auto* entry : g_browser_process->profile_manager()
                           ->GetProfileAttributesStorage()
                           .GetAllProfilesAttributesSortedForDisplay()) {
      if (entry->GetPath() == path) {
        identity.Set("profileIndex", index);
        break;
      }
      ++index;
    }
    uint16_t port = 21520;
    if (auto text = base::Environment::Create()->GetVar("AUX_PORT")) {
      unsigned number = 0;
      if (!base::StringToUint(*text, &number) || number == 0 ||
          number > 65535) {
        Refresh();
        return;
      }
      port = number;
    }
    auto request = std::make_unique<network::ResourceRequest>();
    request->url = GURL("http://127.0.0.1:" + base::NumberToString(port) +
                        "/trpc/accounts.ensureProfileAccount");
    request->method = "POST";
    request->credentials_mode = network::mojom::CredentialsMode::kOmit;
    request->redirect_mode = network::mojom::RedirectMode::kError;
    request->headers.SetHeader("Authorization",
                               BrowserPlatform::Get().authorization());
    loader_ = network::SimpleURLLoader::Create(std::move(request),
                                               kBindingAnnotation);
    loader_->SetTimeoutDuration(base::Seconds(5));
    loader_->AttachStringForUpload(base::WriteJson(identity).value_or("{}"),
                                   "application/json");
    loader_->DownloadToString(
        g_browser_process->system_network_context_manager()
            ->GetSharedURLLoaderFactory()
            .get(),
        base::BindOnce(&ProfileGate::DidBind, weak_.GetWeakPtr()), 65536);
  }
  void DidBind(std::optional<std::string>) {
    loader_.reset();
    Refresh();
  }
  void Refresh() {
    if (!profile_ || reading_) {
      return;
    }
    reading_ = true;
    uint16_t port = 21520;
    if (auto text = base::Environment::Create()->GetVar("AUX_PORT")) {
      unsigned number = 0;
      if (!base::StringToUint(*text, &number) || !number || number > 65535) {
        DidRead(ProfileSecurityState());
        return;
      }
      port = number;
    }
    const auto authorization = BrowserPlatform::Get().authorization();
    FetchProfileSecurity(StateHome(), profile_->GetOriginalProfile()->GetPath(),
        g_browser_process->system_network_context_manager()
            ->GetSharedURLLoaderFactory(), port, authorization,
        base::BindOnce(&ProfileGate::DidVerify, weak_.GetWeakPtr(), authorization));
  }
  void DidVerify(std::string authorization, ProfileSecurityState state) {
    if (authorization != BrowserPlatform::Get().authorization()) {
      state.configured = false;
      state.locked = true;
      state.error = "Daemon authorization changed during Vault verification";
    }
    DidRead(std::move(state));
  }
  void DidRead(ProfileSecurityState state) {
    reading_ = false;
    if (!profile_) {
      return;
    }
    const bool was_allowed = allowed_;
    const bool extension_ready =
        extensions::ExtensionRegistry::Get(profile_.get())
            ->enabled_extensions()
            .Contains(kAgentExtensionId) &&
        extensions::ExtensionRegistry::Get(profile_.get())
            ->enabled_extensions()
            .Contains(kVaultExtensionId);
    allowed_ = state.allows_browsing() && extension_ready;
    if (!allowed_) {
      ClearPreload();
      for (auto* browser : GetAllBrowserWindowInterfaces()) {
        if (browser->GetProfile()->GetOriginalProfile() ==
                profile_->GetOriginalProfile() &&
            browser->GetType() == BrowserWindowInterface::TYPE_NORMAL) {
          browser->GetWindow()->Hide();
        }
      }
      if (extension_ready) {
        // Supplied native bootstrap delegates the real onboarding journey to
        // the Agent; native does not choose a Vault setup/unlock route.
        ShowBootstrap(GURL("chrome-extension://" +
                           std::string(kAgentExtensionId) +
                           "/main.html#/onboarding/splash"), state.account_id);
      }
    } else {
      CloseBootstrap();
      WarmNewTab();
      if (!was_allowed) {
        for (auto* browser : GetAllBrowserWindowInterfaces()) {
          const auto* init = BrowserInitState::From(browser);
          if (browser->GetProfile() == profile_.get() &&
              (!init || !init->is_aux_profile_switch_cache())) {
            browser->GetWindow()->Show();
          }
        }
      }
    }
    timer_.Start(FROM_HERE, base::Milliseconds(500),
                 base::BindOnce(state.bound ? &ProfileGate::Refresh : &ProfileGate::Bind,
                                weak_.GetWeakPtr()));
  }
  void ShowBootstrap(const GURL& url, std::optional<int> account_id) {
    if (!profile_ || profile_->IsOffTheRecord()) {
      return;
    }
    if (owns_bootstrap(bootstrap_browser_.get()) && route_ == url.spec() &&
        bootstrap_account_id_ == account_id) {
      return;
    }
    auto weak = weak_.GetWeakPtr();
    CloseBootstrap();
    if (!weak || !profile_) return;
    // Original chooses the active same-profile window, otherwise the first
    // nonclosing same-profile window, and centers in that display's work area.
    BrowserWindowInterface* first = nullptr;
    BrowserWindowInterface* active = nullptr;
    for (auto* browser : GetAllBrowserWindowInterfaces()) {
      if (browser->GetProfile() != profile_.get() ||
          UnloadController::From(browser)->is_attempting_to_close_browser() ||
          BrowserInitState::From(browser)->is_aux_profile_switch_cache()) {
        continue;
      }
      if (!first) first = browser;
      if (browser->GetWindow()->IsActive()) {
        active = browser;
        break;
      }
    }
    auto* anchor = active ? active : first;
    auto* screen = display::Screen::Get();
    const auto area = (anchor
        ? screen->GetDisplayNearestWindow(anchor->GetWindow()->GetNativeWindow())
        : screen->GetPrimaryDisplay()).work_area();
    gfx::Rect bounds(area.CenterPoint().x() - 450,
                     area.CenterPoint().y() - 280, 900, 560);
    bounds.AdjustToFit(area);
    auto params = BrowserWindowCreateParams::CreateForAppPopup(
        "aux-account-password-popup", true, bounds, profile_.get(), true);
    params.omit_from_session_restore = true;
    auto* browser = CreateBrowserWindow(std::move(params));
    if (!weak || !browser) return;
    bootstrap_browser_ = browser->GetWeakPtr();
    route_ = url.spec();
    bootstrap_account_id_ = account_id;
    auto* contents = chrome::AddAndReturnTabAt(
        browser, url, -1, true, std::nullopt, false,
        NavigateParams::WindowAction::kNoAction);
    if (!weak || !bootstrap_browser_) return;
    if (!contents) {
      CloseBootstrap();
      return;
    }
    bootstrap_contents_ = contents->GetWeakPtr();
    // Stock browser tab creation installs the actual extension observers.
    browser->GetWindow()->Show();
  }
  void CloseBootstrap() {
    auto browser = std::move(bootstrap_browser_);
    bootstrap_contents_.reset();
    bootstrap_account_id_.reset();
    route_.clear();
    if (browser &&
        !UnloadController::From(browser.get())->is_attempting_to_close_browser()) {
      browser->GetWindow()->Close();
    }
  }
  void OnProfileWillBeDestroyed(Profile*) override {
    weak_.InvalidateWeakPtrs();
    ClearPreload();
    timer_.Stop();
    loader_.reset();
    CloseBootstrap();
    extension_observer_.Reset();
    profile_observer_.Reset();
    profile_.reset();
    allowed_ = false;
  }
  void OnExtensionLoaded(content::BrowserContext*,
                         const extensions::Extension* extension) override {
    if (extension->id() == kAgentExtensionId ||
        extension->id() == kVaultExtensionId) {
      CloseBootstrap();
      ClearPreload();
      Refresh();
    }
  }
  void OnExtensionUnloaded(content::BrowserContext*,
                           const extensions::Extension* extension,
                           extensions::UnloadedExtensionReason) override {
    if (extension->id() == kAgentExtensionId ||
        extension->id() == kVaultExtensionId) {
      CloseBootstrap();
      ClearPreload();
      allowed_ = false;
      Refresh();
    }
  }
  base::RepeatingCallback<void(content::WebContents*)> initialize_tab_;
  base::WeakPtr<Profile> profile_;
  bool allowed_ = false, reading_ = false;
  std::string route_;
  std::optional<int> bootstrap_account_id_;
  base::WeakPtr<content::WebContents> bootstrap_contents_;
  std::unique_ptr<network::SimpleURLLoader> loader_;
  base::OneShotTimer timer_;
  base::WeakPtr<BrowserWindowInterface> bootstrap_browser_;
  base::ScopedObservation<Profile, ProfileObserver> profile_observer_{this};
  base::ScopedObservation<extensions::ExtensionRegistry,
                          extensions::ExtensionRegistryObserver>
      extension_observer_{this};
  base::WeakPtrFactory<ProfileGate> weak_{this};
};
struct GateRegistry {
  bool stopping = false;
  std::map<Profile*, std::unique_ptr<ProfileGate>> gates;
};
GateRegistry& Registry() {
  static base::NoDestructor<GateRegistry> registry;
  return *registry;
}
}  // namespace
bool CanShowBrowser(
    BrowserWindowInterface* browser,
    base::RepeatingCallback<void(content::WebContents*)> initialize_tab) {
  auto& registry = Registry();
  Profile* profile = browser ? browser->GetProfile() : nullptr;
  if (registry.stopping || !profile) {
    return false;
  }
  auto* original = profile->GetOriginalProfile();
  auto& gate = registry.gates[original];
  if (!gate || !gate->has_profile()) {
    gate = std::make_unique<ProfileGate>(original, std::move(initialize_tab));
  }
  gate->SetInitializer(std::move(initialize_tab));
  return gate->owns_bootstrap(browser) || gate->allowed();
}
void ShutdownProfileGates() {
  auto& registry = Registry();
  registry.stopping = true;
  registry.gates.clear();
}
}  // namespace aux
