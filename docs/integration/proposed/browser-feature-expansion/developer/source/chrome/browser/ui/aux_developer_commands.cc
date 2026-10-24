// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/aux_developer_commands.h"
#include <memory>
#include "base/strings/string_util.h"
#include "base/strings/utf_string_conversions.h"
#include "chrome/browser/extensions/extension_tab_util.h"
#include "chrome/browser/infobars/simple_alert_infobar_creator.h"
#include "chrome/browser/ui/browser_window/public/global_browser_collection.h"
#include "components/infobars/content/content_infobar_manager.h"
#include "base/supports_user_data.h"
#include "base/time/time.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/aux/profile_identity.h"
#include "chrome/browser/ui/aux_feature_lifecycle.h"
#include "components/tabs/public/tab_interface.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/weak_document_ptr.h"
#include "extensions/browser/event_router.h"
#include "extensions/browser/extension_api_frame_id_map.h"
#include "extensions/browser/extension_registry.h"
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

namespace {
constexpr char kCaptureIntentKey = 0;
constexpr char kCaptureEvent[] = "auxBrowserPreferences.onPageCaptureRequested";
struct CaptureIntent : base::SupportsUserData::Data {
  base::WeakPtr<BrowserWindowInterface> browser;
  content::WeakDocumentPtr document;
  std::string epoch;
  base::TimeTicks expires;
};
content::WebContents* CapturePane(BrowserWindowInterface* browser) {
  auto* tab = browser ? browser->GetActiveTabInterface() : nullptr;
  return tab ? tab->GetContents() : nullptr;
}
}  // namespace
bool AuthorizeAuxPageCapture(BrowserWindowInterface* browser) {
  auto* pane = CapturePane(browser);
  auto* profile = browser ? browser->GetProfile() : nullptr;
  if (!profile || !IsAuxLocalProfileAdmitted(profile) || !CanAuxCapturePage(pane) ||
      pane->GetBrowserContext() != profile) return false;
  auto intent = std::make_unique<CaptureIntent>();
  intent->browser = browser->GetWeakPtr();
  intent->document = pane->GetPrimaryMainFrame()->GetWeakDocumentPtr();
  intent->epoch = aux::GetProfileCookieBindingEpoch(profile);
  intent->expires = base::TimeTicks::Now() + base::Minutes(1);
  profile->SetUserData(&kCaptureIntentKey, std::move(intent));
  return true;
}
bool ConsumeAuxPageCaptureIntent(BrowserWindowInterface* browser, std::string_view document_id) {
  auto* profile = browser ? browser->GetProfile() : nullptr;
  auto* pane = CapturePane(browser);
  auto* intent = profile ? static_cast<CaptureIntent*>(profile->GetUserData(&kCaptureIntentKey)) : nullptr;
  if (!intent) return false;
  auto* frame = pane ? pane->GetPrimaryMainFrame() : nullptr;
  // A request for another document cannot consume this document's intent.
  if (!frame || intent->browser.get() != browser ||
      intent->document.AsRenderFrameHostIfValid() != frame ||
      extensions::ExtensionApiFrameIdMap::GetDocumentId(frame).ToString() != document_id)
    return false;
  const bool current = IsAuxLocalProfileAdmitted(profile) && CanAuxCapturePage(pane) &&
      intent->expires > base::TimeTicks::Now() &&
      intent->epoch == aux::GetProfileCookieBindingEpoch(profile);
  profile->RemoveUserData(&kCaptureIntentKey);
  return current;
}
bool CanShowAuxPageCapture(BrowserWindowInterface* browser) {
  auto* profile = browser ? browser->GetProfile() : nullptr;
  auto* pane = CapturePane(browser);
  if (!profile || !IsAuxLocalProfileAdmitted(profile) || !pane ||
      pane->GetBrowserContext() != profile || !CanAuxCapturePage(pane)) return false;
  auto* registry = extensions::ExtensionRegistry::Get(profile);
  auto* router = extensions::EventRouter::Get(profile);
  return registry && registry->enabled_extensions().Contains(aux::kAgentExtensionId) && router &&
      router->ExtensionHasEventListener(aux::kAgentExtensionId, kCaptureEvent);
}
bool ShowAuxPageCapture(BrowserWindowInterface* browser) {
  if (!CanShowAuxPageCapture(browser) || !AuthorizeAuxPageCapture(browser)) return false;
  auto target = GetAuxPageCaptureTarget(browser->GetProfile(), CapturePane(browser));
  if (!target.FindBool("success").value_or(false)) return false;
  base::ListValue args;
  args.Append(std::move(target));
  extensions::EventRouter::Get(browser->GetProfile())->DispatchEventToExtension(
      aux::kAgentExtensionId, std::make_unique<extensions::Event>(
          extensions::events::AUXBROWSERPREFERENCES_ONPAGECAPTUREREQUESTED,
          kCaptureEvent, std::move(args), browser->GetProfile()));
  return true;
}

base::DictValue ReportAuxPageCaptureError(Profile* profile, int tab_id,
    std::string_view document_id, std::string_view message) {
  if (!profile || !IsAuxLocalProfileAdmitted(profile) || message.empty() || message.size() > 512 ||
      !base::IsStringUTF8(message) || document_id.empty() || document_id.size() > 64)
    return Error("A current screenshot error is required.");
  for (unsigned char value : message)
    if (value < 32 || value == 127) return Error("Screenshot errors must be plain text.");
  auto* intent = static_cast<CaptureIntent*>(profile->GetUserData(&kCaptureIntentKey));
  auto* browser = intent ? intent->browser.get() : nullptr;
  auto* pane = CapturePane(browser);
  if (!browser || browser->GetProfile() != profile ||
      GlobalBrowserCollection::GetInstance()->GetActiveBrowser() != browser || !pane ||
      extensions::ExtensionTabUtil::GetTabId(pane) != tab_id)
    return Error("The screenshot window changed.");
  auto* manager = infobars::ContentInfoBarManager::FromWebContents(pane);
  if (!manager || !ConsumeAuxPageCaptureIntent(browser, document_id))
    return Error("The screenshot document changed.");
  CreateSimpleAlertInfoBar(manager,
      infobars::InfoBarDelegate::AUX_PAGE_CAPTURE_INFOBAR_DELEGATE, nullptr,
      u"Aux screenshot: " + base::UTF8ToUTF16(message));
  return base::DictValue().Set("success", true);
}
