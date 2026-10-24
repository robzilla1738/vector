// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/aux_developer_commands.h"
#include "chrome/browser/devtools/devtools_availability_checker.h"
#include "chrome/browser/devtools/devtools_window.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux_page_capture.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/chrome_pages.h"
#include "chrome/common/pref_names.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/navigation_controller.h"
#include "content/public/browser/web_contents.h"
namespace {
base::DictValue Error(const char* reason) { return base::DictValue().Set("success", false).Set("error", reason); }
}
base::DictValue GetAuxDeveloperSettings(Profile* profile) {
  if (!profile) return Error("This profile is unavailable.");
  auto* pref = profile->GetPrefs()->FindPreference(prefs::kExtensionsUIDeveloperMode);
  if (!pref) return Error("Extension developer mode is unavailable.");
  return base::DictValue().Set("success", true)
      .Set("developerMode", profile->GetPrefs()->GetBoolean(prefs::kExtensionsUIDeveloperMode))
      .Set("managed", pref->IsManaged()).Set("canChange", pref->IsUserModifiable() && !profile->IsOffTheRecord());
}
base::DictValue SetAuxDeveloperMode(Profile* profile, bool enabled) {
  auto state = GetAuxDeveloperSettings(profile);
  if (!state.FindBool("canChange").value_or(false)) return Error("Developer mode is controlled by this profile or its administrator.");
  profile->GetPrefs()->SetBoolean(prefs::kExtensionsUIDeveloperMode, enabled);
  return GetAuxDeveloperSettings(profile);
}
base::DictValue OpenAuxExtensionManager(BrowserWindowInterface& browser) {
  if (!browser.GetProfile() || browser.GetProfile()->IsOffTheRecord()) return Error("Open Extensions in a normal profile window.");
  chrome::ShowExtensions(&browser);
  return base::DictValue().Set("success", true);
}
base::DictValue GetAuxDeveloperCommandState(Profile* profile, content::WebContents* pane) {
  auto state = GetAuxDeveloperSettings(profile);
  const bool actual = profile && pane && pane->GetBrowserContext() == profile;
  state.Set("devToolsAvailable", actual && !pane->GetController().GetPendingEntry() && IsInspectionAllowed(profile, pane));
  state.Set("captureAvailable", actual && CanAuxCapturePage(pane));
  return state;
}
base::DictValue OpenAuxDeveloperTools(Profile* profile, content::WebContents* pane) {
  if (!profile || !pane || pane->GetBrowserContext() != profile ||
      pane->GetController().GetPendingEntry() || !IsInspectionAllowed(profile, pane))
    return Error("Developer tools are unavailable for this page.");
  DevToolsWindow::OpenDevToolsWindow(pane, DevToolsOpenedByAction::kMainMenuOrMainShortcut);
  return base::DictValue().Set("success", true).Set("dispatched", true);
}
