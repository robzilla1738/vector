// Copyright 2026 Aux Authors. All rights reserved.
// Native first-window bootstrap: native/platform.md P3/P5.
#include "chrome/browser/aux/profile_gate.h"

#include <map>

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
#include "chrome/browser/lifetime/application_lifetime.h"
#include "chrome/browser/net/system_network_context_manager.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/profiles/profile_observer.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface_iterator.h"
#include "components/prefs/pref_change_registrar.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/navigation_entry.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_observer.h"
#include "extensions/browser/extension_registry.h"
#include "extensions/browser/extension_registry_observer.h"
#include "extensions/common/extension.h"
#include "net/traffic_annotation/network_traffic_annotation.h"
#include "services/network/public/cpp/resource_request.h"
#include "services/network/public/cpp/simple_url_loader.h"
#include "ui/base/base_window.h"
#include "ui/display/display.h"
#include "ui/display/screen.h"
#include "ui/views/controls/webview/webview.h"
#include "ui/views/widget/widget.h"
#include "ui/views/widget/widget_delegate.h"
#include "ui/views/widget/widget_observer.h"
namespace aux {
namespace {
constexpr auto kBindingAnnotation = net::DefineNetworkTrafficAnnotation(
    "aux_profile_binding",
    R"(semantics {sender:"Aux browser profile gate" description:"Bind the actual local Chromium profile to its independently managed local Aux account before allowing browser windows." trigger:"First window for a local profile." data:"Local profile identity/path/index and ephemeral installation authorization." destination:LOCAL} policy {cookies_allowed:NO setting:"Required local Aux profile setup." policy_exception_justification:"Local browser-owned daemon only."})");
class ProfileGate final : public ProfileObserver,
                          public extensions::ExtensionRegistryObserver,
                          public views::WidgetObserver,
                          public content::WebContentsObserver {
 public:
  explicit ProfileGate(
      Profile* profile,
      base::RepeatingCallback<void(content::WebContents*)> initialize_tab)
      : initialize_tab_(std::move(initialize_tab)),
        profile_(profile->GetWeakPtr()) {
    pref_observer_.Init(profile->GetPrefs());
    pref_observer_.Add(
        "aux.browser.preload_new_tab",
        base::BindRepeating(&ProfileGate::PreloadPreferenceChanged,
                            weak_.GetWeakPtr()));
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
  std::unique_ptr<content::WebContents> Take(const GURL& url) {
    if (!allowed() || !preloaded_ || !preload_ready_ ||
        (url != GURL("chrome://newtab/") && url != NewTabURL())) {
      return nullptr;
    }
    Observe(nullptr);
    preload_ready_ = false;
    if (auto* entry = preloaded_->GetController().GetLastCommittedEntry()) {
      entry->SetVirtualURL(GURL("chrome://newtab/"));
    }
    auto result = std::move(preloaded_);
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE,
        base::BindOnce(&ProfileGate::WarmNewTab, weak_.GetWeakPtr()));
    return result;
  }
  bool has_profile() const { return profile_ != nullptr; }
  bool allowed() const {
    return allowed_ && profile_ &&
           extensions::ExtensionRegistry::Get(profile_.get())
               ->enabled_extensions()
               .Contains(kAgentExtensionId);
  }

 private:
  GURL NewTabURL() const {
    return GURL("chrome-extension://" + std::string(kAgentExtensionId) +
                "/newtab.html");
  }
  void ClearPreload() {
    Observe(nullptr);
    preloaded_.reset();
    preload_ready_ = false;
  }
  void WarmNewTab() {
    if (!allowed() || preloaded_ || !initialize_tab_ ||
        !profile_->GetPrefs()->GetBoolean("aux.browser.preload_new_tab")) {
      return;
    }
    content::WebContents::CreateParams params(profile_.get());
    params.initially_hidden = true;
    preloaded_ = content::WebContents::Create(params);
    initialize_tab_.Run(preloaded_.get());
    Observe(preloaded_.get());
    preloaded_->GetController().LoadURL(NewTabURL(), content::Referrer(),
                                        ui::PAGE_TRANSITION_AUTO_TOPLEVEL,
                                        std::string());
  }
  void PreloadPreferenceChanged() {
    ClearPreload();
    WarmNewTab();
  }
  void DidStopLoading() override {
    auto* entry = preloaded_
                      ? preloaded_->GetController().GetLastCommittedEntry()
                      : nullptr;
    preload_ready_ = entry &&
                     entry->GetPageType() == content::PAGE_TYPE_NORMAL &&
                     preloaded_->GetLastCommittedURL() == NewTabURL();
  }
  void PrimaryMainFrameRenderProcessGone(base::TerminationStatus) override {
    preload_ready_ = false;
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(
        FROM_HERE,
        base::BindOnce(&ProfileGate::ClearPreload, weak_.GetWeakPtr()));
  }

  void Bind() {
    if (!profile_ || profile_->IsOffTheRecord()) {
      Refresh();
      return;
    }
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
            .Contains(kAgentExtensionId);
    allowed_ = state.allows_browsing() && extension_ready;
    if (!allowed_) {
      ClearPreload();
      for (auto* browser : GetAllBrowserWindowInterfaces()) {
        if (browser->GetProfile()->GetOriginalProfile() ==
            profile_->GetOriginalProfile()) {
          browser->GetWindow()->Hide();
        }
      }
      if (extension_ready) {
        ShowBootstrap(state.configured && state.onboarding_complete
                          ? "/unlock"
                          : "/onboarding");
      }
    } else {
      CloseBootstrap();
      WarmNewTab();
      if (!was_allowed) {
        for (auto* browser : GetAllBrowserWindowInterfaces()) {
          if (browser->GetProfile() == profile_.get()) {
            browser->GetWindow()->Show();
          }
        }
      }
    }
    timer_.Start(FROM_HERE, base::Milliseconds(500),
                 base::BindOnce(&ProfileGate::Refresh, weak_.GetWeakPtr()));
  }
  void ShowBootstrap(std::string route) {
    if (widget_ && !widget_->IsClosed() && route_ == route) {
      return;
    }
    CloseBootstrap();
    route_ = std::move(route);
    delegate_ = std::make_unique<views::WidgetDelegate>();
    delegate_->SetTitle(u"Aux setup");
    auto webview = std::make_unique<views::WebView>(profile_.get());
    auto* contents = webview.get();
    delegate_->SetContentsView(std::move(webview));
    widget_ = std::make_unique<views::Widget>();
    views::Widget::InitParams params(
        views::Widget::InitParams::CLIENT_OWNS_WIDGET,
        views::Widget::InitParams::TYPE_WINDOW);
    params.delegate = delegate_.get();
    widget_->Init(std::move(params));
    widget_->AddObserver(this);
    auto area = display::Screen::Get()->GetPrimaryDisplay().work_area();
    gfx::Size size(std::min(1040, area.width()), std::min(760, area.height()));
    gfx::Rect bounds(size);
    bounds.set_origin(gfx::Point(area.CenterPoint().x() - size.width() / 2,
                                 area.CenterPoint().y() - size.height() / 2));
    widget_->SetBounds(bounds);
    if (initialize_tab_) {
      initialize_tab_.Run(contents->GetWebContents());
    }
    contents->LoadInitialURL(GURL("chrome-extension://" +
                                  std::string(kAgentExtensionId) +
                                  "/main.html#/"));
    widget_->Show();
    contents->RequestFocus();
  }
  void CloseBootstrap() {
    if (widget_) {
      widget_->RemoveObserver(this);
      widget_.reset();
    }
    delegate_.reset();
    route_.clear();
  }
  void OnWidgetClosing(views::Widget*) override {
    if (!allowed_) {
      chrome::AttemptUserExit();
    }
  }
  void OnProfileWillBeDestroyed(Profile*) override {
    weak_.InvalidateWeakPtrs();
    pref_observer_.RemoveAll();
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
    if (extension->id() == kAgentExtensionId) {
      CloseBootstrap();
      ClearPreload();
      Refresh();
    }
  }
  void OnExtensionUnloaded(content::BrowserContext*,
                           const extensions::Extension* extension,
                           extensions::UnloadedExtensionReason) override {
    if (extension->id() == kAgentExtensionId) {
      CloseBootstrap();
      ClearPreload();
      allowed_ = false;
      Refresh();
    }
  }
  base::RepeatingCallback<void(content::WebContents*)> initialize_tab_;
  PrefChangeRegistrar pref_observer_;
  std::unique_ptr<content::WebContents> preloaded_;
  bool preload_ready_ = false;
  base::WeakPtr<Profile> profile_;
  bool allowed_ = false, reading_ = false;
  std::string route_;
  std::unique_ptr<network::SimpleURLLoader> loader_;
  base::OneShotTimer timer_;
  std::unique_ptr<views::WidgetDelegate> delegate_;
  std::unique_ptr<views::Widget> widget_;
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
    Profile* profile,
    base::RepeatingCallback<void(content::WebContents*)> initialize_tab) {
  auto& registry = Registry();
  if (registry.stopping || !profile) {
    return false;
  }
  auto* original = profile->GetOriginalProfile();
  auto& gate = registry.gates[original];
  if (!gate || !gate->has_profile()) {
    gate = std::make_unique<ProfileGate>(original, std::move(initialize_tab));
  }
  gate->SetInitializer(std::move(initialize_tab));
  return gate->allowed();
}
std::unique_ptr<content::WebContents> TakePreloadedNewTab(Profile* profile,
                                                          const GURL& url) {
  if (!profile || profile->IsOffTheRecord()) {
    return nullptr;
  }
  const auto found = Registry().gates.find(profile);
  return found == Registry().gates.end() ? nullptr : found->second->Take(url);
}
void ShutdownProfileGates() {
  auto& registry = Registry();
  registry.stopping = true;
  registry.gates.clear();
}
}  // namespace aux
