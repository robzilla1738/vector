// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_AUX_ORGANIZATION_ORGANIZATION_PROFILE_SERVICE_H_
#define CHROME_BROWSER_AUX_ORGANIZATION_ORGANIZATION_PROFILE_SERVICE_H_

#include <memory>
#include <string>

#include "base/callback_list.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "base/no_destructor.h"
#include "base/task/sequenced_task_runner.h"
#include "chrome/browser/aux/organization/organization_service.h"
#include "chrome/browser/profiles/profile_keyed_service_factory.h"

class Profile;
namespace aux::organization {
class OrganizationFileStorage;
// The coordinator is the only model owner for a regular loaded profile. There
// is no incognito-to-original redirection and no renderer-selected storage path.
class OrganizationProfileService final : public KeyedService {
 public:
  explicit OrganizationProfileService(Profile* profile);
  ~OrganizationProfileService() override;
  OrganizationService* model() const;
  bool loading() const { return loading_; }
  const std::string& error() const { return error_; }
  const std::string& owner_generation() const { return generation_; }
  base::CallbackListSubscription ObserveReady(base::RepeatingClosure callback);
  bool HasPendingWrite() const;
  bool EnsureCurrentBinding();
  base::CallbackListSubscription ObserveSettled(base::RepeatingClosure callback);
  void Shutdown() override;
 private:
  void Loaded(std::optional<base::DictValue> value, bool missing,
              std::string read_error);
  void Migrated(WriteReceipt receipt);
  void Ready(Snapshot snapshot);
  void Fail(std::string error);
  void ModelSettled();
  raw_ptr<Profile> profile_;
  const std::string profile_id_;
  std::string generation_;
  std::unique_ptr<OrganizationService> model_;
  raw_ptr<OrganizationFileStorage> active_storage_ = nullptr;
  std::unique_ptr<OrganizationFileStorage> initial_storage_;
  std::optional<Snapshot> initial_snapshot_;
  base::RepeatingClosureList ready_;
  base::RepeatingClosureList settled_;
  base::CallbackListSubscription model_settled_subscription_;
  bool loading_ = true;
  bool shutdown_ = false;
  std::string error_;
  base::WeakPtrFactory<OrganizationProfileService> weak_{this};
};
class OrganizationProfileServiceFactory final : public ProfileKeyedServiceFactory {
 public:
  static OrganizationProfileServiceFactory* GetInstance();
  static OrganizationProfileService* GetForProfile(Profile* profile);
  static OrganizationProfileService* GetForProfileIfExists(Profile* profile);
 private:
  friend base::NoDestructor<OrganizationProfileServiceFactory>;
  OrganizationProfileServiceFactory();
  ~OrganizationProfileServiceFactory() override;
  std::unique_ptr<KeyedService> BuildServiceInstanceForBrowserContext(
      content::BrowserContext* context) const override;
};
// A real pending operation is an exclusion for profile switch/account rebinding.
// False is not a whole-browser drain certificate.
bool IsProfileOrganizationWritePending(Profile* profile);
}  // namespace aux::organization
#endif
