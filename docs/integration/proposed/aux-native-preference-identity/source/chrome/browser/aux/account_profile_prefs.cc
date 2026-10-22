// Copyright 2026 Aux Authors. All rights reserved.
// Supplied native preference helpers410374c/4103854/4103954/4103a68/
// 4103c38/4103d40/41040a4/41042ec/41043ac adapted to current155 APIs.
#include "chrome/browser/aux/account_profile_prefs.h"
#include "components/prefs/pref_service.h"
#include <utility>
namespace aux {
namespace {
void SetString(PrefService* prefs, const char* key, const std::string& value) {
  if (prefs && prefs->FindPreference(key)) prefs->SetString(key, value);
}
void SetBoolean(PrefService* prefs, const char* key, bool value) {
  if (prefs && prefs->FindPreference(key)) prefs->SetBoolean(key, value);
}
std::string ReadString(const PrefService* prefs, const char* key) {
  return prefs && prefs->FindPreference(key) ? prefs->GetString(key) : std::string();
}
bool ReadBoolean(const PrefService* prefs, const char* key) {
  return prefs && prefs->FindPreference(key) && prefs->GetBoolean(key);
}
std::optional<std::string> DisplayValue(const PrefService* prefs, const char* key) {
  if (!HasAccountProfileSession(prefs)) return std::nullopt;
  auto value = ReadString(prefs, key);
  return value.empty() ? std::nullopt : std::make_optional(std::move(value));
}
}  // namespace
void SetAccountProfileBinding(PrefService* prefs, const std::string& user_id,
                             std::optional<int> account_id) {
  if (!prefs) return;
  if (user_id.empty()) return ClearAccountProfileBinding(prefs);
  SetString(prefs, "aux.account_user_id", user_id);
  if (prefs->FindPreference("aux.account_id"))
    prefs->SetInteger("aux.account_id", account_id && *account_id >= 0 ? *account_id : -1);
}
void ClearAccountProfileBinding(PrefService* prefs) {
  if (!prefs) return;
  if (prefs->FindPreference("aux.account_id")) prefs->SetInteger("aux.account_id", -1);
  SetString(prefs, "aux.account_user_id", "");
  SetString(prefs, "aux.account_email", "");
  SetString(prefs, "aux.account_display_name", "");
  SetString(prefs, "aux.account_profile_url", "");
  SetBoolean(prefs, "aux.account_has_persisted_session", false);
  SetBoolean(prefs, "aux.account_auth_paused", false);
  SetString(prefs, "aux.sync_auth_diagnostic_message", "");
  SetString(prefs, "aux.sync_encryption_diagnostic_message", "");
}
void SetAccountProfileEmail(PrefService* prefs, const std::string& email,
                           bool has_persisted_session) {
  if (!prefs) return;
  if (ReadString(prefs, "aux.account_email") != email)
    SetString(prefs, "aux.account_email", email);
  const bool persisted = has_persisted_session && !email.empty();
  if (ReadBoolean(prefs, "aux.account_has_persisted_session") != persisted)
    SetBoolean(prefs, "aux.account_has_persisted_session", persisted);
}
void SetAccountProfileAuthPaused(PrefService* prefs, bool paused) {
  if (ReadBoolean(prefs, "aux.account_auth_paused") != paused)
    SetBoolean(prefs, "aux.account_auth_paused", paused);
}
void SetAccountProfileDisplay(PrefService* prefs, const std::string& display_name,
                             const std::string& profile_url) {
  SetString(prefs, "aux.account_display_name", display_name);
  SetString(prefs, "aux.account_profile_url", profile_url);
}
bool HasAccountProfileSession(const PrefService* prefs) {
  if (!prefs) return false;
  const bool bound = !ReadString(prefs, "aux.account_user_id").empty() ||
      (prefs->FindPreference("aux.account_id") && prefs->GetInteger("aux.account_id") >= 0);
  return bound && (ReadBoolean(prefs, "aux.account_has_persisted_session") ||
                   ReadBoolean(prefs, "aux.account_auth_paused"));
}
std::optional<std::string> GetAccountProfileDisplayName(const PrefService* prefs) {
  return DisplayValue(prefs, "aux.account_display_name");
}
std::optional<std::string> GetAccountProfilePictureUrl(const PrefService* prefs) {
  return DisplayValue(prefs, "aux.account_profile_url");
}
}  // namespace aux
