// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/aux_feature_lifecycle.h"
#include <utility>
#include "base/functional/bind.h"
#include "base/memory/weak_ptr.h"
#include "base/supports_user_data.h"
#include "base/task/sequenced_task_runner.h"
#include "chrome/browser/aux/feature_store/feature_profile_store.h"
#include "chrome/browser/aux/organization/organization_profile_service.h"
#include "chrome/browser/aux/profile_identity.h"
#include "chrome/browser/aux/AuxSelectedStateHome.h"
#include "chrome/browser/aux/AuxBrowserPrivateRoots.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux_recent_files_service.h"
#include "chrome/browser/ui/aux_chosen_files_service.h"
#include "components/prefs/pref_change_registrar.h"
namespace {
constexpr char kOwnerData[] = "aux.local-feature-owners.v1";
class FeatureOwners final : public base::SupportsUserData::Data {
 public:
  explicit FeatureOwners(Profile* profile) : profile_(profile->GetWeakPtr()) {
    ready_ = aux::features::ObserveReady(profile, base::BindRepeating(
        &FeatureOwners::Attach, weak_.GetWeakPtr()));
    store_settled_ = aux::features::ObserveSettled(profile, base::BindRepeating(
        &FeatureOwners::StoreSettled, weak_.GetWeakPtr()));
    files_settled_ = aux::files::ObserveSettled(profile, base::BindRepeating(
        &FeatureOwners::Notify, weak_.GetWeakPtr()));
    if (auto* organization = aux::organization::OrganizationProfileServiceFactory::GetForProfileIfExists(profile))
      organization_settled_ = organization->ObserveSettled(base::BindRepeating(
          &FeatureOwners::Notify, weak_.GetWeakPtr()));
    prefs_.Init(profile->GetPrefs());
    for (const char* pref : {"aux.profile_id", "aux.account_id", "aux.account_user_id",
                             "aux.account_has_persisted_session", "aux.account_auth_paused"})
      if (profile->GetPrefs()->FindPreference(pref))
        prefs_.Add(pref, base::BindRepeating(&FeatureOwners::QueueRefresh, weak_.GetWeakPtr()));
  }
  void Refresh() {
    if (!profile_) return;
    if (aux::files::HasPendingWrite(profile_.get())) return;
    aux::features::InitializeForProfile(profile_.get());
    Attach();
  }
  base::CallbackListSubscription Observe(base::RepeatingClosure callback) {
    return settled_.Add(std::move(callback));
  }
 private:
  void QueueRefresh() {
    if (queued_) return;
    queued_ = true;
    base::SequencedTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
        base::BindOnce([](base::WeakPtr<FeatureOwners> owner) {
          if (!owner) return;
          owner->queued_ = false;
          owner->Refresh();
        }, weak_.GetWeakPtr()));
  }
  void Attach() {
    if (!profile_ || aux::files::HasPendingWrite(profile_.get())) return;
    const auto epoch = aux::GetProfileCookieBindingEpoch(profile_.get());
    if (epoch.empty() || installed_epoch_ == epoch) return;
    auto restored = aux::features::GetNamespace(profile_.get(), "downloads");
    if (!restored) return;
    auto chosen = aux::features::GetNamespace(profile_.get(), "chosenFiles");
    if (!chosen) return;
    installed_epoch_ = epoch;
    const auto self = weak_.GetWeakPtr();
    const auto profile = profile_;
    aux::files::SetWriteOwner(profile.get(),
        base::BindRepeating([](base::WeakPtr<Profile> profile, std::string epoch) {
          return profile && !aux::IsProfileCookieRestorePending(profile.get()) &&
              aux::GetProfileCookieBindingEpoch(profile.get()) == epoch &&
              aux::features::GetNamespace(profile.get(), "downloads").has_value();
        }, profile_, epoch),
        base::BindRepeating([](base::WeakPtr<Profile> profile, std::string epoch,
                              base::DictValue receipts, base::OnceCallback<void(bool)> done) {
          if (!profile || aux::GetProfileCookieBindingEpoch(profile.get()) != epoch) {
            std::move(done).Run(false); return;
          }
          aux::features::CommitNamespace(profile.get(), "downloads", std::move(receipts), std::move(done));
        }, profile_, epoch), std::move(*restored));
    if (!self || !profile) return;
    aux::files::SetChosenFilesWriteOwner(profile.get(),
        base::BindRepeating([](base::WeakPtr<Profile> profile, std::string epoch) {
          return profile && !aux::IsProfileCookieRestorePending(profile.get()) &&
              aux::GetProfileCookieBindingEpoch(profile.get()) == epoch &&
              aux::features::GetNamespace(profile.get(), "chosenFiles").has_value();
        }, profile_, epoch),
        base::BindRepeating([](base::WeakPtr<Profile> profile, std::string epoch,
                              base::DictValue receipts, base::OnceCallback<void(bool)> done) {
          if (!profile || aux::GetProfileCookieBindingEpoch(profile.get()) != epoch) {
            std::move(done).Run(false); return;
          }
          aux::features::CommitNamespace(profile.get(), "chosenFiles", std::move(receipts), std::move(done));
        }, profile_, epoch), std::move(*chosen));
  }
  void StoreSettled() {
    auto self = weak_.GetWeakPtr();
    Notify();
    if (self && self->profile_ && self->installed_epoch_ != aux::GetProfileCookieBindingEpoch(self->profile_.get())) self->QueueRefresh();
  }
  void Notify() { settled_.Notify(); }
  base::WeakPtr<Profile> profile_;
  std::string installed_epoch_;
  bool queued_ = false;
  PrefChangeRegistrar prefs_;
  base::CallbackListSubscription ready_, store_settled_, files_settled_, organization_settled_;
  base::RepeatingClosureList settled_;
  base::WeakPtrFactory<FeatureOwners> weak_{this};
};
FeatureOwners* Find(Profile* profile) {
  return profile ? static_cast<FeatureOwners*>(profile->GetUserData(&kOwnerData)) : nullptr;
}
}  // namespace
void InitializeAuxLocalFeatureOwners(Profile* profile) {
  if (!profile || !profile->IsRegularProfile() || profile->IsOffTheRecord()) return;
  if (!Find(profile)) profile->SetUserData(&kOwnerData, std::make_unique<FeatureOwners>(profile));
  Find(profile)->Refresh();
}
bool IsAuxLocalFeatureWritePending(Profile* profile) {
  if (!profile || !profile->IsRegularProfile() || profile->IsOffTheRecord()) return false;
  return aux::organization::IsProfileOrganizationWritePending(profile) ||
      aux::features::IsWritePending(profile) || aux::files::HasPendingWrite(profile);
}
base::CallbackListSubscription ObserveAuxLocalFeatureSettled(Profile* profile,
    base::RepeatingClosure callback) {
  auto* owner = Find(profile);
  return owner ? owner->Observe(std::move(callback)) : base::CallbackListSubscription();
}

bool IsAuxLocalProfileAdmitted(Profile* profile) {
  if (!profile || !profile->IsRegularProfile() || profile->IsOffTheRecord() ||
      aux::IsProfileCookieRestorePending(profile)) return false;
  const auto state = aux::peer::InspectNativeBrowserShutdown();
  auto roots = aux::peer::CaptureActualChromiumBrowserRoots();
  return !state.wrong_process && !state.admission_closed &&
      !state.sequence_uncertain && state.admitted_generation != 0 &&
      roots && roots->Revalidate();
}
