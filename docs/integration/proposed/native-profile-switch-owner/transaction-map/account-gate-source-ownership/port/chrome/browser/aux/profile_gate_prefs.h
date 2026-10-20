// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_AUX_PROFILE_GATE_PREFS_H_
#define CHROME_BROWSER_AUX_PROFILE_GATE_PREFS_H_
class PrefRegistrySimple;
namespace user_prefs { class PrefRegistrySyncable; }
namespace aux {
// Registration only: no ProfileManager, gate owner, browser window or network.
void RegisterProfileGateLocalStatePrefs(PrefRegistrySimple* registry);
void RegisterProfileGateProfilePrefs(user_prefs::PrefRegistrySyncable* registry);
}  // namespace aux
#endif
