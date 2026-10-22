// Copyright 2026 Aux Authors. All rights reserved.
// Supplied415ea30/415f2f4/415f828/415fab4/415fb9c/415fcfc using current155
// actual profile attributes and ImageFetcherService, never a UI substitute.
#include "chrome/browser/aux/account_profile_avatar.h"
#include "chrome/browser/aux/account_profile_prefs.h"
#include "base/functional/bind.h"
#include "base/strings/utf_string_conversions.h"
#include "chrome/browser/image_fetcher/image_fetcher_service_factory.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_key.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "components/image_fetcher/core/image_fetcher.h"
#include "components/image_fetcher/core/image_fetcher_service.h"
#include "components/image_fetcher/core/request_metadata.h"
#include "components/prefs/pref_service.h"
#include "google_apis/gaia/gaia_id.h"
#include "net/traffic_annotation/network_traffic_annotation.h"
#include "ui/gfx/image/image.h"
#include "url/gurl.h"
#include <utility>
namespace aux {
namespace {
constexpr auto kAvatarAnnotation = net::DefineNetworkTrafficAnnotation(
    "aux_account_profile_avatar",
    R"(semantics {sender:"Aux browser profile" description:"Fetch the actual signed-in account's provided profile image for native profile attributes." trigger:"The real native account-state updater observes a changed account image URL." data:"Image URL from the actual account metadata; no daemon session/Vault credentials." destination:WEBSITE} policy {cookies_allowed:NO setting:"Native account profile image follows the user's actual account metadata." policy_exception_justification:"Preserved account profile presentation."})");
}  // namespace
AccountProfileAvatar::AccountProfileAvatar(Profile* profile,
                                           ProfileAttributesStorage* storage)
    : profile_(profile), storage_(storage) {}
AccountProfileAvatar::~AccountProfileAvatar() = default;
void AccountProfileAvatar::Shutdown() {
  weak_.InvalidateWeakPtrs();
  requested_url_.clear();
  profile_ = nullptr;
  storage_ = nullptr;
}
ProfileAttributesEntry* AccountProfileAvatar::Entry() const {
  return profile_ && storage_
      ? storage_->GetProfileAttributesWithPath(profile_->GetPath()) : nullptr;
}
void AccountProfileAvatar::SetAccountAttributes(const std::string& name,
                                                const std::string& email) {
  auto weak = weak_.GetWeakPtr();
  if (auto* entry = Entry())
    entry->SetLocalProfileName(entry->GetLocalProfileName(), true);
  if (!weak) return;
  if (auto* entry = Entry()) entry->SetGAIAName(base::UTF8ToUTF16(name));
  if (!weak) return;
  if (auto* entry = Entry()) entry->SetGAIAGivenName(std::u16string());
  if (!weak) return;
  // Original does not fabricate a Google identity or Sync consent.
  if (auto* entry = Entry())
    entry->SetAuthInfo(GaiaId(), base::UTF8ToUTF16(email), false);
}
void AccountProfileAvatar::ClearAccountAttributes() {
  auto weak = weak_.GetWeakPtr();
  if (auto* entry = Entry()) entry->SetGAIAName(std::u16string());
  if (!weak) return;
  if (auto* entry = Entry()) entry->SetGAIAGivenName(std::u16string());
  if (!weak) return;
  if (auto* entry = Entry()) entry->SetAuthInfo(GaiaId(), std::u16string(), false);
}
void AccountProfileAvatar::RestoreFromPrefs() {
  if (!profile_) return;
  auto* prefs = profile_->GetPrefs();
  const auto email = prefs->FindPreference("aside.account_email")
      ? prefs->GetString("aside.account_email") : std::string();
  if (!HasAccountProfileSession(prefs) || email.empty()) {
    auto weak = weak_.GetWeakPtr();
    ClearOwnedPicture();
    if (!weak) return;
    ClearAccountAttributes();
    return;
  }
  auto weak = weak_.GetWeakPtr();
  SetAccountAttributes(GetAccountProfileDisplayName(prefs).value_or(email), email);
  if (!weak) return;
  Refresh(GetAccountProfilePictureUrl(prefs).value_or(std::string()));
}
void AccountProfileAvatar::ClearOwnedPicture() {
  auto* entry = profile_ && storage_
      ? storage_->GetProfileAttributesWithPath(profile_->GetPath()) : nullptr;
  if (!entry) { requested_url_.clear(); return; }
  const auto last = entry->GetLastDownloadedGAIAPictureUrlWithSize();
  const auto saved = GetAccountProfilePictureUrl(profile_->GetPrefs());
  const bool owned = (saved && !saved->empty() && last == *saved) ||
      (!requested_url_.empty() && (last.empty() || last == requested_url_));
  requested_url_.clear();
  if (!owned) return;
  auto weak = weak_.GetWeakPtr();
  entry->SetIsUsingGAIAPicture(false);
  if (!weak || !requested_url_.empty()) return;
  if (auto* current = Entry()) current->SetGAIAPicture(std::string(), gfx::Image());
}
void AccountProfileAvatar::RetryPending() {
  if (requested_url_.empty()) return;
  const auto url = requested_url_;
  Refresh(url);
}
void AccountProfileAvatar::Refresh(const std::string& picture_url) {
  requested_url_ = picture_url;
  auto* entry = profile_ && storage_
      ? storage_->GetProfileAttributesWithPath(profile_->GetPath()) : nullptr;
  if (!entry) return;
  const GURL url(picture_url);
  if (picture_url.empty() || !url.is_valid()) { ClearOwnedPicture(); return; }
  auto weak = weak_.GetWeakPtr();
  entry->SetIsUsingGAIAPicture(true);
  if (!weak || requested_url_ != picture_url) return;
  entry = Entry();
  if (!entry) return;
  if (entry->GetLastDownloadedGAIAPictureUrlWithSize() == picture_url &&
      (entry->GetGAIAPicture() || storage_->IsGAIAPictureLoaded(
          storage_->StorageKeyFromProfilePath(profile_->GetPath())))) return;
  auto* key = profile_->GetProfileKey();
  auto* service = key && key->HasPrefs()
      ? ImageFetcherServiceFactory::GetForKey(key) : nullptr;
  auto* fetcher = service ? service->GetImageFetcher(
      image_fetcher::ImageFetcherConfig::kNetworkOnly) : nullptr;
  if (!fetcher) return;
  image_fetcher::ImageFetcherParams params(kAvatarAnnotation, "AuxProfileAvatar");
  fetcher->FetchImage(url, base::BindOnce(&AccountProfileAvatar::DidFetch,
      weak_.GetWeakPtr(), picture_url), std::move(params));
}
void AccountProfileAvatar::DidFetch(
    std::string url, const gfx::Image& image,
    const image_fetcher::RequestMetadata&) {
  if (!profile_ || !storage_ || requested_url_ != url) return;
  auto* entry = storage_->GetProfileAttributesWithPath(profile_->GetPath());
  if (!entry) return;
  auto weak = weak_.GetWeakPtr();
  entry->SetGAIAPicture(image.IsEmpty() ? std::string() : url, image);
  if (!weak || requested_url_ != url) return;
  if (auto* current = Entry()) current->SetIsUsingGAIAPicture(!image.IsEmpty());
}
}  // namespace aux
