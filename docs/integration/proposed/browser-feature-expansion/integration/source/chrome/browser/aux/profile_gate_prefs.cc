// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/aux/profile_gate_prefs.h"
#include "components/prefs/pref_registry_simple.h"
#include "components/pref_registry/pref_registry_syncable.h"
namespace aux {
void RegisterProfileGateLocalStatePrefs(PrefRegistrySimple* registry) {
  registry->RegisterBooleanPref("aux.onboarding_completed", false);
}
void RegisterProfileGateProfilePrefs(user_prefs::PrefRegistrySyncable* registry) {
  registry->RegisterStringPref("aux.profile_id", "");
  registry->RegisterBooleanPref("aux.sidebar_navigation_enabled", false);
  registry->RegisterBooleanPref("aux.minimal_ui_enabled", false);
  registry->RegisterBooleanPref("aux.peek_links_enabled", false);
  registry->RegisterBooleanPref("aux.vertical_tabs.recent_files_expanded", true);
  registry->RegisterDictionaryPref("aux.theme.tokens");
  registry->RegisterListPref("aux.theme.presets");
  registry->RegisterDictionaryPref("aux.cloud_cookie_restore");
  registry->RegisterStringPref("aux.account_user_id", "");
  registry->RegisterIntegerPref("aux.account_id", -1);
  registry->RegisterStringPref("aux.account_email", "");
  registry->RegisterStringPref("aux.account_display_name", "");
  registry->RegisterStringPref("aux.account_profile_url", "");
  registry->RegisterBooleanPref("aux.account_has_persisted_session", false);
  registry->RegisterBooleanPref("aux.account_auth_paused", false);
  registry->RegisterStringPref("aux.sync_auth_diagnostic_message", "");
  registry->RegisterStringPref("aux.sync_encryption_diagnostic_message", "");
  registry->RegisterBooleanPref("aux.bootstrap_complete", false);
  registry->RegisterBooleanPref("aux.automatic_password_gate_suppressed", false);
  registry->RegisterBooleanPref("aux.account_password_extension_available", false);
  registry->RegisterDictionaryPref(
      "persistent_notifications.ai_delivery_mode_by_origin");
}
}  // namespace aux
