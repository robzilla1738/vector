// Copyright 2026 Aux Authors. All rights reserved.
// Original AsideProfileAttributesUpdater415e7e8/4160ce0, current155 ownership.
#include "chrome/browser/aux/account_profile_updater.h"
#include <cstdint>
#include <optional>
#include <utility>
#include "base/environment.h"
#include "base/callback_list.h"
#include "base/files/file_path_watcher.h"
#include "base/functional/bind.h"
#include "base/json/json_writer.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/ref_counted.h"
#include "base/memory/weak_ptr.h"
#include "base/scoped_observation.h"
#include "base/strings/string_number_conversions.h"
#include "base/task/bind_post_task.h"
#include "base/task/single_thread_task_runner.h"
#include "base/task/thread_pool.h"
#include "base/threading/sequence_bound.h"
#include "base/time/time.h"
#include "chrome/browser/aux/account_profile_avatar.h"
#include "chrome/browser/aux/account_profile_prefs.h"
#include "chrome/browser/aux/account_profile_source.h"
#include "chrome/browser/aux/browser_platform.h"
#include "chrome/browser/aux/installation_auth.h"
#include "chrome/browser/aux/profile_identity.h"
#include "chrome/browser/aux/profile_state.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/net/system_network_context_manager.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_attributes_storage_observer.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/profiles/profile_observer.h"
#include "chrome/browser/sync/sync_service_factory.h"
#include "components/keyed_service/core/keyed_service.h"
#include "components/prefs/pref_service.h"
#include "components/sync/base/pref_names.h"
#include "components/sync/service/sync_prefs.h"
#include "components/sync/service/sync_service.h"
#include "components/sync/service/sync_user_settings.h"
#include "google_apis/gaia/gaia_id.h"
#include "net/traffic_annotation/network_traffic_annotation.h"
#include "services/network/public/cpp/resource_request.h"
#include "services/network/public/cpp/shared_url_loader_factory.h"
#include "services/network/public/cpp/simple_url_loader.h"
#include "url/gurl.h"
namespace aux {
namespace {
constexpr char kUser[] = "aux.account_user_id";
constexpr char kAccount[] = "aux.account_id";
constexpr char kBootstrap[] = "aux.bootstrap_complete";
constexpr char kOnboarding[] = "aux.onboarding_completed";
constexpr auto kBindingAnnotation = net::DefineNetworkTrafficAnnotation(
    "aux_native_account_profile_binding",
    R"(semantics {sender:"Aux account profile updater" description:"Preserve the real native profile-to-account metadata binding in the local supplied daemon." trigger:"Actual account metadata changes or actual profile removal." data:"Canonical profile ID/path, optional native display-order index and actual selected user/account ID. Installation authorization authenticates the local request. No Vault values." destination:LOCAL} policy {cookies_allowed:NO setting:"Follows actual local browser profile/account binding." policy_exception_justification:"Browser-owned authenticated loopback daemon only."})");
// Self-owned requests may finish after actual profile removal. They never
// capture a Profile, mutate a deleted profile or fabricate a successful result.
class BindingRequest : public base::RefCounted<BindingRequest> {
 public:
  static void Start(const char* path, base::DictValue input) {
    const std::string authorization = BrowserPlatform::Get().authorization();
    if ((!authorization.starts_with("AuxDaemonSessionToken ") ||
         authorization.size() <= sizeof("AuxDaemonSessionToken ") - 1) ||
        !g_browser_process->system_network_context_manager()) return;
    unsigned port = 21520;
    if (auto text = base::Environment::Create()->GetVar("AUX_PORT"); text) {
      if (!base::StringToUint(*text, &port) || !port || port > 65535) return;
    }
    auto body = base::WriteJson(input);
    if (!body) return;
    auto factory = g_browser_process->system_network_context_manager()
                       ->GetSharedURLLoaderFactory();
    if (!factory) return;
    auto request = base::MakeRefCounted<BindingRequest>();
    auto resource = std::make_unique<network::ResourceRequest>();
    resource->url = GURL("http://127.0.0.1:" + base::NumberToString(port) + path);
    resource->method = "POST";
    resource->credentials_mode = network::mojom::CredentialsMode::kOmit;
    resource->redirect_mode = network::mojom::RedirectMode::kError;
    resource->headers.SetHeader("Authorization", authorization);
    request->loader_ = network::SimpleURLLoader::Create(
        std::move(resource), kBindingAnnotation);
    request->loader_->AttachStringForUpload(*body, "application/json");
    request->loader_->SetTimeoutDuration(base::Seconds(10));
    request->loader_->DownloadToString(factory.get(), base::BindOnce(
        &BindingRequest::Complete, request), 65536);
  }
  BindingRequest() = default;
 private:
  friend class base::RefCounted<BindingRequest>;
  ~BindingRequest() = default;
  void Complete(std::optional<std::string>) { loader_.reset(); }
  std::unique_ptr<network::SimpleURLLoader> loader_;
};
class AccountRegistryWatcher {
 public:
  AccountRegistryWatcher(base::FilePath path,
                         base::RepeatingCallback<void(bool)> changed)
      : changed_(std::move(changed)) {
    // Failed installation does not recursively retry/spin. The actual next
    // refresh can install a replacement watch, matching415fec0/41602e8.
    installed_ = watcher_.Watch(path, base::FilePathWatcher::Type::kNonRecursive,
        base::BindRepeating(&AccountRegistryWatcher::Changed,
                            base::Unretained(this)));
  }
  bool installed() const { return installed_; }
 private:
  void Changed(const base::FilePath&, bool error) { changed_.Run(error); }
  base::FilePathWatcher watcher_;
  base::RepeatingCallback<void(bool)> changed_;
  bool installed_ = false;
};
}  // namespace
class AccountProfileUpdater final : public KeyedService,
                                    public ProfileObserver,
                                    public ProfileAttributesStorageObserver {
 public:
  AccountProfileUpdater(Profile* profile, ProfileAttributesStorage* storage)
      : profile_(profile), path_(profile->GetPath()), avatar_(profile, storage) {
    profile_observation_.Observe(profile);
    storage_observation_.Observe(storage);
    cookie_restore_subscription_ = ObserveProfileCookieRestoreFinished(profile,
        base::BindRepeating(&AccountProfileUpdater::CookieRestoreFinished, weak_.GetWeakPtr()));
    authorization_subscription_ = BrowserPlatform::Get().ObserveDaemonAuthorization(
        base::BindRepeating(&AccountProfileUpdater::Refresh, weak_.GetWeakPtr(), true));
    // Add() never invokes during construction. The initial real read also
    // covers a late subscription when authorization already exists.
    auto weak = weak_.GetWeakPtr();
    avatar_.RestoreFromPrefs();
    if (weak) Refresh(true);
  }
  ~AccountProfileUpdater() override = default;
  void Shutdown() override {
    weak_.InvalidateWeakPtrs();
    authorization_subscription_ = {};
    cookie_restore_subscription_ = {};
    profile_observation_.Reset();
    storage_observation_.Reset();
    ++watch_generation_;
    watcher_.Reset();
    avatar_.Shutdown();
    profile_ = nullptr;
  }
  void Refresh(bool allow_binding) {
    if (!profile_) return;
    if (IsProfileCookieRestorePending(profile_)) {
      cookie_restore_queued_ = true;
      cookie_restore_allow_binding_ |= allow_binding;
      return;
    }
    if (reading_) {
      queued_ = true;
      queued_allow_binding_ |= allow_binding;
      return;
    }
    reading_ = true;
    const auto home = StateHome();
    if (home.empty()) {
      DidRead(allow_binding, std::nullopt);
      return;
    }
    if (watcher_.is_null()) StartWatch(home);
    base::ThreadPool::PostTaskAndReplyWithResult(FROM_HERE, {base::MayBlock()},
        base::BindOnce(&ReadPrivateAccountRegistry, home),
        base::BindOnce(&AccountProfileUpdater::DidRead, weak_.GetWeakPtr(),
                       allow_binding));
  }
 private:
  void CookieRestoreFinished() {
    if (!profile_) return;
    // A registry read started before the restore may return after its gate
    // opens. Discard it too, rather than briefly replaying stale ownership.
    if (reading_) discard_cookie_read_ = true;
    if (!cookie_restore_queued_) return;
    cookie_restore_queued_ = false;
    const bool allow = std::exchange(cookie_restore_allow_binding_, false);
    Refresh(allow);
  }
  std::optional<AccountProfileSourceInput> CaptureSourceInput(bool allow_binding) {
    auto weak = weak_.GetWeakPtr();
    AccountProfileSourceInput input;
    input.profile_path = path_;
    input.profile_id = GetProfileId(profile_);
    if (!weak) return std::nullopt;
    auto* prefs = profile_->GetPrefs();
    input.stored_user_id = prefs->GetString(kUser);
    const int id = prefs->GetInteger(kAccount);
    if (id >= 0) input.stored_account_id = id;
    input.allow_binding = allow_binding;
    input.is_last_used_loaded_profile =
        ProfileManager::GetLastUsedProfileIfLoaded() == profile_;
    auto* manager = g_browser_process->profile_manager();
    if (manager) for (auto* loaded : manager->GetLoadedProfiles()) {
      if (loaded->IsOffTheRecord()) continue;
      auto* other = loaded->GetPrefs();
      AccountProfileClaim claim;
      claim.profile_path = loaded->GetPath();
      claim.user_id = other->GetString(kUser);
      const int account = other->GetInteger(kAccount);
      if (account >= 0) claim.account_id = account;
      input.loaded_claims.push_back(std::move(claim));
    }
    return input;
  }
  void StartWatch(const base::FilePath& home) {
    const uint64_t generation = ++watch_generation_;
    watcher_ = base::SequenceBound<AccountRegistryWatcher>(
        base::ThreadPool::CreateSequencedTaskRunner({base::MayBlock()}),
        home.AppendASCII("accounts.json"),
        base::BindPostTask(base::SingleThreadTaskRunner::GetCurrentDefault(),
            base::BindRepeating(&AccountProfileUpdater::RegistryChanged,
                                weak_.GetWeakPtr())));
    watcher_.AsyncCall(&AccountRegistryWatcher::installed).Then(base::BindOnce(
        &AccountProfileUpdater::WatchInstalled, weak_.GetWeakPtr(), generation));
  }
  void WatchInstalled(uint64_t generation, bool installed) {
    if (generation == watch_generation_ && !installed) watcher_.Reset();
  }
  void RegistryChanged(bool error) {
    if (error) {
      ++watch_generation_;
      watcher_.Reset();
    }
    Refresh(true);
  }
  void OnProfileInitializationComplete(Profile* profile) override {
    if (profile == profile_) avatar_.RetryPending();
  }
  void OnProfileWillBeDestroyed(Profile* profile) override {
    if (profile == profile_) Shutdown();
  }
  void OnProfileWillBeRemoved(const base::FilePath& path) override {
    if (path != path_ || !profile_) return;
    base::DictValue input;
    const auto& id = profile_->GetPrefs()->GetString("aux.profile_id");
    if (!id.empty()) input.Set("profileId", id);
    if (!path_.empty()) input.Set("profilePath", path_.value());
    BindingRequest::Start("/accounts/profile-binding/delete", std::move(input));
  }
  void ResetSyncForAccount() {
    auto weak = weak_.GetWeakPtr();
    auto* prefs = profile_->GetPrefs();
    syncer::SyncPrefs sync(prefs);
    const auto user = prefs->GetString(kUser);
    if (!user.empty()) sync.ClearEncryptionBootstrapTokenForAccount(GaiaId(user));
    else prefs->ClearPref(syncer::prefs::internal::kSyncEncryptionBootstrapToken);
    if (!weak) return;
    if (sync.IsInitialSyncFeatureSetupComplete())
      prefs->SetDict(syncer::prefs::internal::kSyncEncryptionBootstrapTokenPerAccount,
                     base::DictValue());
    if (!weak) return;
    sync.ClearCachedPassphraseType();
  }
  void CompleteSyncSetup() {
    auto* service = SyncServiceFactory::GetForProfile(profile_);
    if (service) {
      auto* settings = service->GetUserSettings();
      if (!settings->IsInitialSyncFeatureSetupComplete())
        settings->SetInitialSyncFeatureSetupComplete();
    } else {
      syncer::SyncPrefs sync(profile_->GetPrefs());
      if (!sync.IsInitialSyncFeatureSetupComplete())
        sync.SetInitialSyncFeatureSetupComplete();
    }
  }
  void DidRead(bool allow_binding, std::optional<base::DictValue> state) {
    if (!profile_) return;
    reading_ = false;
    const bool stale_cookie_read = std::exchange(discard_cookie_read_, false);
    if (IsProfileCookieRestorePending(profile_)) {
      cookie_restore_queued_ = true;
      cookie_restore_allow_binding_ |= allow_binding || queued_allow_binding_;
      queued_ = false;
      queued_allow_binding_ = false;
      return;
    }
    if (stale_cookie_read) {
      const bool allow = allow_binding || queued_allow_binding_ ||
                         cookie_restore_allow_binding_;
      queued_ = false;
      queued_allow_binding_ = false;
      cookie_restore_queued_ = false;
      cookie_restore_allow_binding_ = false;
      Refresh(allow);
      return;
    }
    auto weak = weak_.GetWeakPtr();
    if (state) {
      auto input = CaptureSourceInput(allow_binding);
      if (!weak || !input) return;
      auto projection = ProjectAccountProfileSource(
          base::Value(std::move(*state)), *input);
      if (projection) Apply(std::move(*projection));
      else avatar_.RestoreFromPrefs();
    } else avatar_.RestoreFromPrefs();
    if (!weak || !queued_) return;
    queued_ = false;
    const bool allow = std::exchange(queued_allow_binding_, false);
    Refresh(allow);
  }
  bool ApplyAccountPreferences(const AccountProfileRecord& account, bool present) {
    auto weak = weak_.GetWeakPtr();
    auto* prefs = profile_->GetPrefs();
    SetAccountProfileBinding(prefs, account.user_id,
        account.id >= 0 ? std::optional<int>(account.id) : std::nullopt);
    if (!weak) return false;
    if (present && account.auth_paused) SetAccountProfileAuthPaused(prefs, true);
    if (!weak) return false;
    SetAccountProfileEmail(prefs, present ? account.email : std::string(),
                           present && account.has_persisted_session);
    if (!weak) return false;
    if (!present || !account.auth_paused) SetAccountProfileAuthPaused(prefs, false);
    if (!weak) return false;
    SetAccountProfileDisplay(prefs, present ? account.name : std::string(),
                            present ? account.picture_url : std::string());
    return !!weak;
  }
  void Apply(AccountProfileProjection source) {
    auto weak = weak_.GetWeakPtr();
    auto* prefs = profile_->GetPrefs();
    if (source.global_onboarding_complete)
      g_browser_process->local_state()->SetBoolean(kOnboarding, true);
    if (!weak) return;
    // Original auto-binding writes actual account preference presentation and
    // setup state before the common per-profile bootstrap branch; the common
    // authenticated branch below may visit the same unchanged prefs again.
    if (source.auto_bound) {
      if (!ApplyAccountPreferences(*source.account, true)) return;
      CompleteSyncSetup();
      if (!weak) return;
    }
    const bool was_complete = prefs->GetBoolean(kBootstrap);
    prefs->SetBoolean(kBootstrap, source.bootstrap_complete);
    if (!weak) return;
    if (was_complete && !source.bootstrap_complete) ResetSyncForAccount();
    if (!weak) return;
    if (source.clear_binding) {
      avatar_.ClearOwnedPicture();
      if (!weak) return;
      // Original clear branch also resets source SyncPrefs independently of
      // whether bootstrap had just transitioned true->false (4160ce0+82c).
      ResetSyncForAccount();
      if (!weak) return;
      ClearAccountProfileBinding(prefs);
      if (!weak) return;
      avatar_.ClearAccountAttributes();
      return;
    }
    const auto& account = *source.account;
    if (source.binding_to_persist) {
      if (auto index = GetProfileIndex(profile_))
        source.binding_to_persist->Set("profileIndex", *index);
      BindingRequest::Start("/accounts/profile-binding",
                            std::move(*source.binding_to_persist));
    }
    if (!weak) return;
    const bool present = (account.has_persisted_session || account.auth_paused) &&
                          !account.email.empty();
    if (!present) {
      // Original clears only its old owned image before clearing the saved
      // account image URL; reversing this loses the ownership proof.
      avatar_.ClearOwnedPicture();
      if (!weak || !ApplyAccountPreferences(account, false)) return;
      avatar_.ClearAccountAttributes();
      return;
    }
    if (!ApplyAccountPreferences(account, true)) return;
    avatar_.SetAccountAttributes(account.name.empty() ? account.email : account.name,
                                  account.email);
    if (!weak) return;
    avatar_.Refresh(account.picture_url);
    if (!weak) return;
    CompleteSyncSetup();
  }
  raw_ptr<Profile> profile_;
  const base::FilePath path_;
  AccountProfileAvatar avatar_;
  base::CallbackListSubscription authorization_subscription_;
  base::CallbackListSubscription cookie_restore_subscription_;
  bool cookie_restore_queued_ = false;
  bool discard_cookie_read_ = false;
  bool cookie_restore_allow_binding_ = false;
  base::ScopedObservation<Profile, ProfileObserver> profile_observation_{this};
  base::ScopedObservation<ProfileAttributesStorage,
      ProfileAttributesStorageObserver> storage_observation_{this};
  base::SequenceBound<AccountRegistryWatcher> watcher_;
  uint64_t watch_generation_ = 0;
  bool reading_ = false;
  bool queued_ = false;
  bool queued_allow_binding_ = false;
  base::WeakPtrFactory<AccountProfileUpdater> weak_{this};
};
AccountProfileUpdaterFactory::AccountProfileUpdaterFactory()
    : ProfileKeyedServiceFactory("AuxProfileAttributesUpdater",
        ProfileSelections::Builder()
            .WithRegular(ProfileSelection::kOriginalOnly).Build()) {
  DependsOn(SyncServiceFactory::GetInstance());
}
AccountProfileUpdaterFactory::~AccountProfileUpdaterFactory() = default;
AccountProfileUpdaterFactory* AccountProfileUpdaterFactory::GetInstance() {
  static base::NoDestructor<AccountProfileUpdaterFactory> instance;
  return instance.get();
}
AccountProfileUpdater* AccountProfileUpdaterFactory::GetForProfile(Profile* profile) {
  return static_cast<AccountProfileUpdater*>(
      GetInstance()->GetServiceForBrowserContext(profile, true));
}
std::unique_ptr<KeyedService>
AccountProfileUpdaterFactory::BuildServiceInstanceForBrowserContext(
    content::BrowserContext* context) const {
  auto* manager = g_browser_process->profile_manager();
  if (!manager) return nullptr;
  return std::make_unique<AccountProfileUpdater>(
      Profile::FromBrowserContext(context), &manager->GetProfileAttributesStorage());
}
bool AccountProfileUpdaterFactory::ServiceIsCreatedWithBrowserContext() const {
  return true;
}
}  // namespace aux
