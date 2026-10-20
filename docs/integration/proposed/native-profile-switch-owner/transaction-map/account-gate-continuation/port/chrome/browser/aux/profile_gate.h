// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_AUX_PROFILE_GATE_H_
#define CHROME_BROWSER_AUX_PROFILE_GATE_H_
#include <memory>

#include "base/functional/callback.h"
class BrowserWindowInterface;
class Profile;
class GURL;
class PrefRegistrySimple;
namespace user_prefs { class PrefRegistrySyncable; }
namespace content {
class WebContents;
}
namespace aux {
// Supplied native bootstrap visibility guard; reads actual accounts/prefs,
// independently of daemon authorization and current Vault lock status.
bool CanShowBrowser(
    BrowserWindowInterface* browser,
    base::RepeatingCallback<void(content::WebContents*)> initialize_tab = {});
// Native post-profile-setup continuation corresponding to original417a144;
// not a generic new-window action, authentication bypass or extension API.
void RequestProfileBootstrap(Profile* profile);
void ShutdownProfileGates();
void RegisterProfileGateLocalStatePrefs(PrefRegistrySimple* registry);
void RegisterProfileGateProfilePrefs(user_prefs::PrefRegistrySyncable* registry);
}  // namespace aux
#endif
