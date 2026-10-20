// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_AUX_ACCOUNT_PROFILE_UPDATER_H_
#define CHROME_BROWSER_AUX_ACCOUNT_PROFILE_UPDATER_H_
#include <memory>
#include "base/no_destructor.h"
#include "chrome/browser/profiles/profile_keyed_service_factory.h"
class Profile;
namespace aux {
class AccountProfileUpdater;
class AccountProfileUpdaterFactory final : public ProfileKeyedServiceFactory {
 public:
  static AccountProfileUpdaterFactory* GetInstance();
  static AccountProfileUpdater* GetForProfile(Profile* profile);
 private:
  friend base::NoDestructor<AccountProfileUpdaterFactory>;
  AccountProfileUpdaterFactory();
  ~AccountProfileUpdaterFactory() override;
  std::unique_ptr<KeyedService> BuildServiceInstanceForBrowserContext(
      content::BrowserContext* context) const override;
  bool ServiceIsCreatedWithBrowserContext() const override;
};
}  // namespace aux
#endif
