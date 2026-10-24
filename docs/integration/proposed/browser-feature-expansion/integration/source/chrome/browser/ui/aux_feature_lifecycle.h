#ifndef CHROME_BROWSER_UI_AUX_FEATURE_LIFECYCLE_H_
#define CHROME_BROWSER_UI_AUX_FEATURE_LIFECYCLE_H_
#include "base/callback_list.h"
#include "base/functional/callback.h"
class Profile;
class BrowserWindowInterface;
void CancelAuxThemePreviewsForProfile(Profile* profile);
void CancelAuxThemePreviewsForWindow(BrowserWindowInterface* browser);
void InitializeAuxLocalFeatureOwners(Profile* profile);
bool IsAuxLocalFeatureWritePending(Profile* profile);
bool IsAuxLocalProfileAdmitted(Profile* profile);
base::CallbackListSubscription ObserveAuxLocalFeatureSettled(Profile* profile, base::RepeatingClosure callback);
#endif
