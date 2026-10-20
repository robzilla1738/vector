// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_AUX_ACCOUNT_PROFILE_PREFS_H_
#define CHROME_BROWSER_AUX_ACCOUNT_PROFILE_PREFS_H_
#include <optional>
#include <string>
class PrefService;
namespace aux {
// Exact original native preference operations. Call only with an actual profile's
// PrefService and selected account metadata; these do not select or authenticate
// an account, create a registry binding, contact a service or unlock a Vault.
void SetAccountProfileBinding(PrefService* prefs, const std::string& user_id,
                             std::optional<int> account_id);
void ClearAccountProfileBinding(PrefService* prefs);
void SetAccountProfileEmail(PrefService* prefs, const std::string& email,
                           bool has_persisted_session);
void SetAccountProfileAuthPaused(PrefService* prefs, bool paused);
void SetAccountProfileDisplay(PrefService* prefs, const std::string& display_name,
                             const std::string& profile_url);
bool HasAccountProfileSession(const PrefService* prefs);
std::optional<std::string> GetAccountProfileDisplayName(const PrefService* prefs);
std::optional<std::string> GetAccountProfilePictureUrl(const PrefService* prefs);
}  // namespace aux
#endif
