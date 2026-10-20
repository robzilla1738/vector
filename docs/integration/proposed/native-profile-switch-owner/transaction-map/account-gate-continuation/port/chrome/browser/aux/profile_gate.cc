// Copyright 2026 Aux Authors. All rights reserved.
// Supplied AsideAccountPasswordGate policy adapted to current155 ownership.
#include "chrome/browser/aux/profile_gate.h"
#include "chrome/browser/aux/ntp_prerender_service.h"

#include <map>
#include <optional>

#include "base/auto_reset.h"
#include "base/files/file_path_watcher.h"
#include "base/functional/bind.h"
#include "base/memory/weak_ptr.h"
#include "base/no_destructor.h"
#include "base/scoped_observation.h"
#include "base/task/bind_post_task.h"
#include "base/threading/sequence_bound.h"
#include "base/task/single_thread_task_runner.h"
#include "base/task/thread_pool.h"
#include "base/timer/timer.h"
#include "base/uuid.h"
#include "chrome/browser/aux/account_bootstrap_state.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/aux/installation_auth.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/profiles/profile_observer.h"
#include "chrome/browser/ui/browser_init_state.h"
#include "chrome/browser/ui/browser_tabstrip.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface_iterator.h"
#include "chrome/browser/ui/browser_window/public/create_browser_window.h"
#include "chrome/browser/ui/unload_controller.h"
#include "components/prefs/pref_change_registrar.h"
#include "components/prefs/pref_registry_simple.h"
#include "components/prefs/pref_service.h"
#include "components/user_prefs/pref_registry_syncable.h"
#include "content/public/browser/web_contents.h"
#include "extensions/browser/extension_registry.h"
#include "extensions/browser/extension_registry_observer.h"
#include "extensions/common/extension.h"
#include "ui/base/base_window.h"
#include "ui/display/display.h"
#include "ui/display/screen.h"
namespace aux {
namespace {
constexpr char kProfileId[] = "aside.profile_id";
constexpr char kAccountUserId[] = "aside.account_user_id";
constexpr char kBootstrapComplete[] = "aside.bootstrap_complete";
constexpr char kSuppressAutomaticGate[] = "aside.automatic_password_gate_suppressed";
constexpr char kExtensionAvailable[] = "aside.account_password_extension_available";
constexpr char kOnboardingComplete[] = "aside.onboarding_completed";

bool IsOmitted(Profile* profile) {
  auto* entry = g_browser_process->profile_manager()
                    ->GetProfileAttributesStorage()
                    .GetProfileAttributesWithPath(profile->GetPath());
  return entry && entry->IsOmitted();
}
// The supplied attributes updater watches the actual accounts path, then
// refreshes parsed state off the UI sequence. This155 adaptation keeps the
// watcher on its own sequence and posts only an invalidation to its weak owner.
class AccountsStateWatcher {
 public:
  AccountsStateWatcher(base::FilePath path, base::RepeatingClosure changed)
      : changed_(std::move(changed)) {
    if (!watcher_.Watch(path, base::FilePathWatcher::Type::kNonRecursive,
            base::BindRepeating(&AccountsStateWatcher::OnChanged,
                                base::Unretained(this)))) {
      changed_.Run();
    }
  }
 private:
  void OnChanged(const base::FilePath&, bool) { changed_.Run(); }
  base::RepeatingClosure changed_;
  base::FilePathWatcher watcher_;
};
struct BootstrapCreationState {
  bool creating = false;
  base::WeakPtr<BrowserWindowInterface> browser;
};
BootstrapCreationState& BootstrapCreation() {
  static base::NoDestructor<BootstrapCreationState> state;
  return *state;
}
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
    auto* prefs = profile->GetPrefs();
    prefs->SetBoolean(kExtensionAvailable,
        extensions::ExtensionRegistry::Get(profile)->enabled_extensions()
            .Contains(kAgentExtensionId));
    if (prefs->GetString(kProfileId).empty()) {
      prefs->SetString(kProfileId, base::Uuid::GenerateRandomV4().AsLowercaseString());
    }
    // Original constructor clears automatic suppression for a genuinely new
    // profile only when another nonomitted profile already exists.
    if (profile->IsNewProfile()) {
      for (auto* entry : g_browser_process->profile_manager()
                            ->GetProfileAttributesStorage()
                            .GetAllProfilesAttributes()) {
        if (entry->GetPath() != profile->GetPath() && !entry->IsOmitted()) {
          prefs->SetBoolean(kSuppressAutomaticGate, false);
          break;
        }
      }
    }
    pref_observer_.Init(prefs);
    pref_observer_.AddMultiple({kProfileId, kAccountUserId, kBootstrapComplete,
                               kSuppressAutomaticGate},
        base::BindRepeating(&ProfileGate::Refresh, weak_.GetWeakPtr()));
    local_observer_.Init(g_browser_process->local_state());
    local_observer_.Add(kOnboardingComplete,
        base::BindRepeating(&ProfileGate::Refresh, weak_.GetWeakPtr()));
    auto runner = base::ThreadPool::CreateSequencedTaskRunner({base::MayBlock()});
    accounts_watcher_ = base::SequenceBound<AccountsStateWatcher>(
        runner, StateHome().AppendASCII("accounts.json"),
        base::BindPostTask(base::SingleThreadTaskRunner::GetCurrentDefault(),
            base::BindRepeating(&ProfileGate::Refresh, weak_.GetWeakPtr())));
    Refresh();
  }
  ~ProfileGate() override {
    weak_.InvalidateWeakPtrs();
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
  base::WeakPtr<ProfileGate> GetWeakPtr() { return weak_.GetWeakPtr(); }
  void NotifyBrowserRequested() { Refresh(); }
  void RequestBootstrap() {
    dismissed_ = false;
    Refresh();
  }
  bool owns_bootstrap(BrowserWindowInterface* browser) const {
    return browser && bootstrap_browser_.get() == browser && profile_ &&
           browser->GetProfile() == profile_.get() &&
           browser->GetType() == BrowserWindowInterface::TYPE_APP_POPUP &&
           !UnloadController::From(browser)->is_attempting_to_close_browser();
  }
  bool allowed() const { return allowed_ && profile_; }

 private:
  void ClearPreload() {
    SetNtpPrerenderEnabled(profile_.get(), false);
  }
  void WarmNewTab() {
    SetNtpPrerenderEnabled(profile_.get(), allowed());
  }

  void Refresh() {
    if (!profile_) return;
    if (reading_) {
      refresh_again_ = true;
      return;
    }
    auto* prefs = profile_->GetPrefs();
    if (g_browser_process->local_state()->GetBoolean(kOnboardingComplete) ||
        prefs->GetBoolean(kSuppressAutomaticGate) || IsOmitted(profile_.get())) {
      DidRead(true);
      return;
    }
    reading_ = true;
    const auto id = prefs->GetString(kProfileId);
    const auto user = prefs->GetString(kAccountUserId);
    base::ThreadPool::PostTaskAndReplyWithResult(
        FROM_HERE, {base::MayBlock()},
        base::BindOnce(&ReadAccountBootstrapState, StateHome(), id,
                       profile_->GetPath(), user),
        base::BindOnce(&ProfileGate::DidReadState, weak_.GetWeakPtr(), id, user));
  }
  void DidReadState(std::string id, std::string user,
                    std::optional<bool> complete) {
    reading_ = false;
    if (!profile_) return;
    auto* prefs = profile_->GetPrefs();
    if (id != prefs->GetString(kProfileId) ||
        user != prefs->GetString(kAccountUserId)) {
      Refresh();
      return;
    }
    if (complete.value_or(false) &&
        !g_browser_process->local_state()->GetBoolean(kOnboardingComplete)) {
      // Source04103b7c writes completion only after a real true reader result.
      auto weak = weak_.GetWeakPtr();
      g_browser_process->local_state()->SetBoolean(kOnboardingComplete, true);
      if (!weak) return;
      g_browser_process->local_state()->CommitPendingWrite();
    }
    auto weak = weak_.GetWeakPtr();
    DidRead(complete.value_or(prefs->GetBoolean(kBootstrapComplete)));
    if (!weak || !profile_) return;
    if (refresh_again_) {
      refresh_again_ = false;
      Refresh();
    } else if (!complete.has_value()) {
      timer_.Start(FROM_HERE, base::Seconds(1),
          base::BindOnce(&ProfileGate::Refresh, weak_.GetWeakPtr()));
    }
  }
  void DidRead(bool complete) {
    if (!profile_) return;
    const bool was_allowed = allowed_;
    const bool extension_ready =
        extensions::ExtensionRegistry::Get(profile_.get())
            ->enabled_extensions().Contains(kAgentExtensionId);
    allowed_ = complete;
    if (complete) timer_.Stop();
    if (!allowed_) {
      ClearPreload();
      auto weak = weak_.GetWeakPtr();
      ForEachCurrentBrowserWindowInterfaceOrderedByActivation(
          [&](BrowserWindowInterface* browser) {
            if (!weak || !profile_) return false;
            if (browser->GetProfile()->GetOriginalProfile() ==
                    profile_->GetOriginalProfile() &&
                browser->GetType() == BrowserWindowInterface::TYPE_NORMAL) {
              browser->GetWindow()->Hide();
            }
            return !!weak;
          });
      if (!weak) return;
      if (extension_ready) {
        // Supplied native bootstrap delegates the real onboarding journey to
        // the Agent; native does not choose a Vault setup/unlock route.
        ShowBootstrap(GURL("chrome-extension://" +
                           std::string(kAgentExtensionId) +
                           "/main.html#/onboarding/splash"), std::nullopt);
      }
    } else {
      auto weak = weak_.GetWeakPtr();
      CloseBootstrap();
      if (!weak) return;
      WarmNewTab();
      if (!was_allowed) {
        ForEachCurrentBrowserWindowInterfaceOrderedByActivation(
            [&](BrowserWindowInterface* browser) {
              if (!weak || !profile_) return false;
              const auto* init = BrowserInitState::From(browser);
              if (browser->GetProfile() == profile_.get() &&
                  (!init || !init->is_aux_profile_switch_cache())) {
                browser->GetWindow()->Show();
              }
              return !!weak;
            });
      }
    }
  }
  void ShowBootstrap(const GURL& url, std::optional<int> account_id) {
    if (!profile_ || profile_->IsOffTheRecord()) {
      return;
    }
    if (!bootstrap_browser_ && !route_.empty()) {
      // Source OnBrowserRemoved suppresses automatic re-opening after a real
      // user close, until its explicit force-bootstrap entrypoint is requested.
      dismissed_ = true;
      route_.clear();
    }
    if (dismissed_) return;
    if (owns_bootstrap(bootstrap_browser_.get()) && route_ == url.spec() &&
        bootstrap_account_id_ == account_id) {
      return;
    }
    auto& creation = BootstrapCreation();
    if (creation.creating ||
        (creation.browser && !UnloadController::From(creation.browser.get())
                                  ->is_attempting_to_close_browser())) {
      return;
    }
    // This guard references process-lifetime state, not a deletable UI owner.
    base::AutoReset<bool> creating(&creation.creating, true);
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
    // Original417c5c4/f590 waits until at least one real same-profile Browser
    // exists. A completed profile-creation callback may precede that window.
    bool has_profile_browser = false;
    for (auto* browser : GetAllBrowserWindowInterfaces()) {
      has_profile_browser |= browser->GetProfile() == profile_.get();
    }
    if (!has_profile_browser) return;
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
    if (!browser) return;
    creation.browser = browser->GetWeakPtr();
    if (!weak) {
      browser->GetWindow()->Close();
      return;
    }
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
    CloseBootstrap();
    extension_observer_.Reset();
    profile_observer_.Reset();
    pref_observer_.Reset();
    local_observer_.Reset();
    accounts_watcher_.Reset();
    profile_.reset();
    allowed_ = false;
  }
  void OnExtensionLoaded(content::BrowserContext*,
                         const extensions::Extension* extension) override {
    if (extension->id() == kAgentExtensionId) {
      auto weak = weak_.GetWeakPtr();
      profile_->GetPrefs()->SetBoolean(kExtensionAvailable, true);
      if (!weak) return;
      CloseBootstrap();
      if (!weak) return;
      ClearPreload();
      Refresh();
    }
  }
  void OnExtensionUnloaded(content::BrowserContext*,
                           const extensions::Extension* extension,
                           extensions::UnloadedExtensionReason) override {
    if (extension->id() == kAgentExtensionId) {
      auto weak = weak_.GetWeakPtr();
      profile_->GetPrefs()->SetBoolean(kExtensionAvailable, false);
      if (!weak) return;
      CloseBootstrap();
      if (!weak) return;
      ClearPreload();
      allowed_ = false;
      Refresh();
    }
  }
  base::RepeatingCallback<void(content::WebContents*)> initialize_tab_;
  base::WeakPtr<Profile> profile_;
  bool allowed_ = false, reading_ = false, refresh_again_ = false;
  bool dismissed_ = false;
  std::string route_;
  std::optional<int> bootstrap_account_id_;
  base::WeakPtr<content::WebContents> bootstrap_contents_;
  PrefChangeRegistrar pref_observer_;
  PrefChangeRegistrar local_observer_;
  base::SequenceBound<AccountsStateWatcher> accounts_watcher_;
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
  if (profile->IsOffTheRecord() || IsOmitted(profile)) return true;
  auto* original = profile->GetOriginalProfile();
  auto& gate = registry.gates[original];
  if (!gate || !gate->has_profile()) {
    gate = std::make_unique<ProfileGate>(original, std::move(initialize_tab));
  }
  gate->SetInitializer(std::move(initialize_tab));
  auto weak_gate = gate->GetWeakPtr();
  if (!weak_gate->owns_bootstrap(browser) && !weak_gate->allowed()) {
    weak_gate->NotifyBrowserRequested();
  }
  return weak_gate &&
         (weak_gate->owns_bootstrap(browser) || weak_gate->allowed());
}
void RequestProfileBootstrap(Profile* profile) {
  if (!profile || profile->IsOffTheRecord()) return;
  auto& registry = Registry();
  if (registry.stopping) return;
  auto& gate = registry.gates[profile];
  if (!gate || !gate->has_profile()) {
    gate = std::make_unique<ProfileGate>(profile,
        base::RepeatingCallback<void(content::WebContents*)>());
  }
  if (!profile->GetPrefs()->GetBoolean(kSuppressAutomaticGate)) {
    gate->RequestBootstrap();
  }
}
void ShutdownProfileGates() {
  auto& registry = Registry();
  registry.stopping = true;
  registry.gates.clear();
}
void RegisterProfileGateLocalStatePrefs(PrefRegistrySimple* registry) {
  registry->RegisterBooleanPref(kOnboardingComplete, false);
}
void RegisterProfileGateProfilePrefs(user_prefs::PrefRegistrySyncable* registry) {
  registry->RegisterStringPref(kProfileId, "");
  registry->RegisterStringPref(kAccountUserId, "");
  registry->RegisterBooleanPref(kBootstrapComplete, false);
  registry->RegisterBooleanPref(kSuppressAutomaticGate, false);
  registry->RegisterBooleanPref(kExtensionAvailable, false);
}
}  // namespace aux
