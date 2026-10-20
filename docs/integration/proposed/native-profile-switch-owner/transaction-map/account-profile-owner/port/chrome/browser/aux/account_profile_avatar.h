// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_AUX_ACCOUNT_PROFILE_AVATAR_H_
#define CHROME_BROWSER_AUX_ACCOUNT_PROFILE_AVATAR_H_
#include <string>
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
class Profile;
class ProfileAttributesStorage;
class ProfileAttributesEntry;
namespace gfx { class Image; }
namespace image_fetcher { struct RequestMetadata; }
namespace aux {
// Private real account-updater owner. No replacement profile image/view and no
// permission grant. Actual entry identity is the loaded profile's fixed path.
class AccountProfileAvatar {
 public:
  AccountProfileAvatar(Profile* profile, ProfileAttributesStorage* storage);
  ~AccountProfileAvatar();
  void Shutdown();
  void Refresh(const std::string& picture_url);
  void RetryPending();
  void ClearOwnedPicture();
  void SetAccountAttributes(const std::string& name, const std::string& email);
  void ClearAccountAttributes();
  void RestoreFromPrefs();
 private:
  ProfileAttributesEntry* Entry() const;
  void DidFetch(std::string url, const gfx::Image& image,
                const image_fetcher::RequestMetadata& metadata);
  raw_ptr<Profile> profile_;
  raw_ptr<ProfileAttributesStorage> storage_;
  std::string requested_url_;
  base::WeakPtrFactory<AccountProfileAvatar> weak_{this};
};
}  // namespace aux
#endif
