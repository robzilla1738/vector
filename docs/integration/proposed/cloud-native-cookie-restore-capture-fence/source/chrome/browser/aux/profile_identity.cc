// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/aux/profile_identity.h"
#include "base/uuid.h"
#include "base/functional/bind.h"
#include "base/scoped_observation.h"
#include "base/supports_user_data.h"
#include "chrome/browser/profiles/profile_observer.h"
#include "components/prefs/pref_change_registrar.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/browser_thread.h"
namespace aux {
namespace {
const char kCookieBindingEpochKey[] = "aux.cookie-binding-epoch";
class CookieBindingEpoch final : public base::SupportsUserData::Data,
                                 public ProfileObserver {
 public:
  explicit CookieBindingEpoch(Profile* profile)
      : value_(base::Uuid::GenerateRandomV4().AsLowercaseString()) {
    observation_.Observe(profile);
    auto* prefs = profile->GetPrefs();
    registrar_.Init(prefs);
    for (const char* name : {"aside.profile_id", "aside.account_id",
                            "aside.account_user_id",
                            "aside.account_has_persisted_session",
                            "aside.account_auth_paused"}) {
      if (prefs->FindPreference(name))
        registrar_.Add(name, base::BindRepeating(&CookieBindingEpoch::Rotate,
                                                base::Unretained(this)));
    }
  }
  ~CookieBindingEpoch() override = default;
  const std::string& value() const { return value_; }
  bool BeginRestore(const std::string& expected) {
    if (value_.empty() || value_ != expected || restoring_) return false;
    restoring_ = true;
    restore_epoch_ = base::Uuid::GenerateRandomV4().AsLowercaseString();
    return true;
  }
  bool restoring() const { return restoring_; }
  const std::string& restore_epoch() const { return restore_epoch_; }
  void FinishRestore() {
    if (!restoring_ || value_.empty()) return;
    restoring_ = false;
    restored_.Notify();
  }
  base::CallbackListSubscription ObserveRestore(base::RepeatingClosure callback) {
    return restored_.Add(std::move(callback));
  }
  void OnProfileWillBeDestroyed(Profile* profile) override {
    registrar_.RemoveAll();
    observation_.Reset();
    value_.clear();
    restore_epoch_.clear();
  }
 private:
  void Rotate() { value_ = base::Uuid::GenerateRandomV4().AsLowercaseString(); }
  bool restoring_ = false;
  std::string restore_epoch_ = base::Uuid::GenerateRandomV4().AsLowercaseString();
  base::RepeatingClosureList restored_;
  std::string value_;
  PrefChangeRegistrar registrar_;
  base::ScopedObservation<Profile, ProfileObserver> observation_{this};
};
}  // namespace
std::string GetProfileCookieBindingEpoch(Profile* profile) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!profile || !profile->IsRegularProfile() || profile->IsOffTheRecord())
    return {};
  auto* epoch = static_cast<CookieBindingEpoch*>(
      profile->GetUserData(&kCookieBindingEpochKey));
  if (!epoch) {
    auto owned = std::make_unique<CookieBindingEpoch>(profile);
    epoch = owned.get();
    profile->SetUserData(&kCookieBindingEpochKey, std::move(owned));
  }
  return epoch->value();
}
std::string GetProfileCookieRestoreEpoch(Profile* profile) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (GetProfileCookieBindingEpoch(profile).empty()) return {};
  return static_cast<CookieBindingEpoch*>(profile->GetUserData(&kCookieBindingEpochKey))->restore_epoch();
}
bool BeginProfileCookieRestore(Profile* profile, const std::string& epoch) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (GetProfileCookieBindingEpoch(profile).empty()) return false;
  return static_cast<CookieBindingEpoch*>(profile->GetUserData(&kCookieBindingEpochKey))->BeginRestore(epoch);
}
void FinishProfileCookieRestore(Profile* profile) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!profile) return;
  auto* epoch = static_cast<CookieBindingEpoch*>(profile->GetUserData(&kCookieBindingEpochKey));
  if (epoch) epoch->FinishRestore();
}
bool IsProfileCookieRestorePending(Profile* profile) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!profile) return false;
  auto* epoch = static_cast<CookieBindingEpoch*>(profile->GetUserData(&kCookieBindingEpochKey));
  return epoch && epoch->restoring();
}
base::CallbackListSubscription ObserveProfileCookieRestoreFinished(
    Profile* profile, base::RepeatingClosure callback) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (GetProfileCookieBindingEpoch(profile).empty()) return {};
  return static_cast<CookieBindingEpoch*>(profile->GetUserData(&kCookieBindingEpochKey))->ObserveRestore(std::move(callback));
}
std::string GetProfileId(Profile* profile) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!profile) return {};
  auto* prefs = profile->GetOriginalProfile()->GetPrefs();
  if (!prefs) return {};
  const bool registered = prefs->FindPreference("aside.profile_id") != nullptr;
  auto id = registered ? prefs->GetString("aside.profile_id") : std::string();
  if (id.empty()) {
    id = base::Uuid::GenerateRandomV4().AsLowercaseString();
    if (registered) prefs->SetString("aside.profile_id", id);
  }
  return id;
}
std::string GetLoadedProfileIdForPath(const base::FilePath& path) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto* manager = g_browser_process ? g_browser_process->profile_manager() : nullptr;
  return manager ? GetProfileId(manager->GetProfileByPath(path)) : std::string();
}
std::optional<int> GetProfileIndex(Profile* profile) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto* manager = g_browser_process ? g_browser_process->profile_manager() : nullptr;
  if (!profile || profile->IsOffTheRecord() || !manager) return std::nullopt;
  int index = 0;
  for (auto* entry : manager->GetProfileAttributesStorage()
                          .GetAllProfilesAttributesSortedForDisplay()) {
    if (entry->GetPath() == profile->GetPath()) return index;
    ++index;
  }
  return std::nullopt;
}
}  // namespace aux
