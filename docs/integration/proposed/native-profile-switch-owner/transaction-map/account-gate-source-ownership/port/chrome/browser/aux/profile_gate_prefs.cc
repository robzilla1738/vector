// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/aux/profile_gate_prefs.h"
#include "components/prefs/pref_registry_simple.h"
#include "components/user_prefs/pref_registry_syncable.h"
namespace aux {
void RegisterProfileGateLocalStatePrefs(PrefRegistrySimple* registry) {
  registry->RegisterBooleanPref("aside.onboarding_completed", false);
}
void RegisterProfileGateProfilePrefs(user_prefs::PrefRegistrySyncable* registry) {
  registry->RegisterStringPref("aside.profile_id", "");
  registry->RegisterStringPref("aside.account_user_id", "");
  registry->RegisterIntegerPref("aside.account_id", -1);
  registry->RegisterBooleanPref("aside.bootstrap_complete", false);
  registry->RegisterBooleanPref("aside.automatic_password_gate_suppressed", false);
  registry->RegisterBooleanPref("aside.account_password_extension_available", false);
}
}  // namespace aux
