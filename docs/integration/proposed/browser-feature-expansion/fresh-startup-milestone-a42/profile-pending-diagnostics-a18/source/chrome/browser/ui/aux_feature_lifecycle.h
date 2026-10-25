#ifndef CHROME_BROWSER_UI_AUX_FEATURE_LIFECYCLE_H_
#define CHROME_BROWSER_UI_AUX_FEATURE_LIFECYCLE_H_
#include "base/callback_list.h"
#include "base/functional/callback.h"
class Profile;
class BrowserWindowInterface;
void CancelAuxThemePreviewsForProfile(Profile* profile);
void CancelAuxThemePreviewsForWindow(BrowserWindowInterface* browser);
void InitializeAuxLocalFeatureOwners(Profile* profile);
// Data-only observations of the existing local feature gates. An empty snapshot
// does not certify browser-wide quiescence or grant profile admission.
struct AuxLocalFeaturePending {
  bool native_io = false;
  bool organization = false;
  bool feature_state = false;
  bool files = false;
  bool ui_migration = false;
  bool pending() const {
    return native_io || organization || feature_state || files || ui_migration;
  }
};
AuxLocalFeaturePending GetAuxLocalFeaturePending(Profile* profile);
bool IsAuxLocalFeatureWritePending(Profile* profile);
bool IsAuxLocalProfileAdmitted(Profile* profile);
base::CallbackListSubscription ObserveAuxLocalFeatureSettled(Profile* profile, base::RepeatingClosure callback);
#endif
