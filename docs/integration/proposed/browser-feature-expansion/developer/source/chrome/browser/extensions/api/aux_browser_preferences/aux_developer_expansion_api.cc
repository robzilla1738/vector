// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/extensions/api/aux_browser_preferences/aux_developer_expansion_api.h"
#include "base/functional/bind.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/aux/profile_identity.h"
#include "chrome/browser/extensions/extension_tab_util.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux_developer_commands.h"
#include "chrome/browser/ui/aux_feature_lifecycle.h"
#include "chrome/browser/ui/aux_page_capture.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/global_browser_collection.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface_iterator.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/frame/aux_tab_search_bubble.h"
#include "components/tabs/public/tab_interface.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/web_contents.h"
#include "extensions/browser/extension_registry.h"
#include "extensions/browser/extension_api_frame_id_map.h"
#include "extensions/common/constants.h"
namespace {
base::DictValue Failure(const char* reason) {
  return base::DictValue().Set("success", false).Set("error", reason);
}
content::WebContents* Pane(BrowserWindowInterface* browser) {
  auto* tab = browser ? browser->GetActiveTabInterface() : nullptr;
  return tab ? tab->GetContents() : nullptr;
}
bool SettingsDocument(content::WebContents* sender, Profile* profile) {
  if (!sender || sender->GetBrowserContext() != profile) return false;
  auto* frame = sender->GetPrimaryMainFrame();
  if (!frame) return false;
  const auto& url = frame->GetLastCommittedURL();
  return url.SchemeIs(extensions::kExtensionScheme) && url.host() == aux::kAgentExtensionId;
}
BrowserWindowInterface* SettingsWindow(content::WebContents* sender) {
  if (!sender) return nullptr;
  for (auto* browser : GetAllBrowserWindowInterfaces()) {
    auto* tabs = browser->GetTabStripModel();
    if (tabs && tabs->GetIndexOfWebContents(sender) != TabStripModel::kNoTab) return browser;
  }
  return nullptr;
}
BrowserWindowInterface* CommandWindow(content::WebContents* sender,
                                      const base::DictValue* request) {
  if (!sender || !request) return nullptr;
  auto context = GetAuxCommandContext(sender);
  const auto* wanted = request->FindString("generation");
  const auto* current = context.FindString("generation");
  return wanted && !wanted->empty() && wanted->size() <= 256 && current && *wanted == *current && context.FindBool("success").value_or(false)
      ? GetAuxProfileSearchBrowser(sender) : nullptr;
}
}  // namespace
namespace extensions {
AuxDeveloperExpansionFunction::AuxDeveloperExpansionFunction() = default;
AuxDeveloperExpansionFunction::~AuxDeveloperExpansionFunction() = default;
ExtensionFunction::ResponseAction AuxDeveloperExpansionFunction::RunAux() {
  if (shutting_down_ || extension_id() != aux::kAgentExtensionId ||
      !IsAuxLocalProfileAdmitted(profile()) ||
      !ExtensionRegistry::Get(profile())->enabled_extensions().Contains(aux::kAgentExtensionId))
    return RespondNow(Error("Aux profile authority is unavailable"));
  const std::string_view method = std::string_view(name()).substr(22);
  const auto* request = args().size() == 1 && args()[0].is_dict() ? &args()[0].GetDict() : nullptr;
  if (method == "getDeveloperSettings") {
    if (!args().empty()) return RespondNow(Error("This method takes no arguments"));
  } else if (!request) {
    return RespondNow(Error("One action object is required"));
  }
  if (request) {
    for (const auto [key, value] : *request) {
      const bool allowed = method == "beginPageSurfaceCapture" ? key == "tabId" || key == "documentId" :
          method == "setDeveloperMode" ? key == "enabled" :
          method == "getPageCaptureTarget" || method == "openDeveloperTools" || method == "openExtensionManager"
              ? key == "generation" : key == "capability";
      if (!allowed) return RespondNow(Error("Unexpected action field"));
    }
  }
  auto* sender = GetSenderWebContents();
  if (method == "getDeveloperSettings" || method == "setDeveloperMode") {
    if (!SettingsDocument(sender, profile()) ||
        render_frame_host() != sender->GetPrimaryMainFrame())
      return RespondNow(Error("The current Aux Settings document is required"));
    if (method == "getDeveloperSettings") return RespondNow(WithArguments(GetAuxDeveloperSettings(profile())));
    auto enabled = request ? request->FindBool("enabled") : std::nullopt;
    if (!enabled || !user_gesture()) return RespondNow(Error("A developer-mode selection is required"));
    return RespondNow(WithArguments(SetAuxDeveloperMode(profile(), *enabled)));
  }
  if (method == "getPageCaptureTarget" || method == "openDeveloperTools" || method == "openExtensionManager") {
    auto* browser = CommandWindow(sender, request);
    if (method == "openExtensionManager" && request && !request->contains("generation") &&
        SettingsDocument(sender, profile()) && render_frame_host() == sender->GetPrimaryMainFrame())
      browser = SettingsWindow(sender);
    if (!browser || browser->GetProfile() != profile() || !user_gesture())
      return RespondNow(Error("The current page and user action are required"));
    if (method == "openExtensionManager") return RespondNow(WithArguments(OpenAuxExtensionManager(*browser)));
    if (method == "openDeveloperTools") return RespondNow(WithArguments(OpenAuxDeveloperTools(profile(), Pane(browser))));
    if (!AuthorizeAuxPageCapture(browser)) return RespondNow(Error("Screenshot is unavailable for this page"));
    return RespondNow(WithArguments(GetAuxPageCaptureTarget(profile(), Pane(browser))));
  }
  if (method == "beginPageSurfaceCapture") {
    const auto tab_id = request ? request->FindInt("tabId") : std::nullopt;
    const auto* document = request ? request->FindString("documentId") : nullptr;
    auto* browser = GlobalBrowserCollection::GetInstance()->GetActiveBrowser();
    auto* pane = Pane(browser);
    auto* frame = pane ? pane->GetPrimaryMainFrame() : nullptr;
    if (!tab_id || *tab_id < 0 || !document || document->empty() || document->size() > 64 ||
        !browser || browser->GetProfile() != profile() || !pane || !frame ||
        pane->GetBrowserContext() != profile() || ExtensionTabUtil::GetTabId(pane) != *tab_id ||
        ExtensionApiFrameIdMap::GetDocumentId(frame).ToString() != *document)
      return RespondNow(Error("The selected screenshot page expired"));
    // Consume a matching native intent even when this call also has a gesture.
    const bool native_intent = ConsumeAuxPageCaptureIntent(browser, *document);
    if (!user_gesture() && !native_intent)
      return RespondNow(Error("The screenshot interaction expired"));
    const auto epoch = aux::GetProfileCookieBindingEpoch(profile());
    auto guard = base::BindRepeating([](base::WeakPtr<Profile> profile,
        base::WeakPtr<BrowserWindowInterface> browser, base::WeakPtr<content::WebContents> pane,
        std::string epoch) {
      return profile && browser && pane && IsAuxLocalProfileAdmitted(profile.get()) &&
          browser->GetProfile() == profile.get() && Pane(browser.get()) == pane.get() &&
          GlobalBrowserCollection::GetInstance()->GetActiveBrowser() == browser.get() &&
          aux::GetProfileCookieBindingEpoch(profile.get()) == epoch;
    }, profile()->GetWeakPtr(), browser->GetWeakPtr(), pane->GetWeakPtr(), epoch);
    return RespondNow(WithArguments(BeginAuxPageSurfaceCapture(profile(), pane, *document, std::move(guard))));
  }
  const auto* capability = request ? request->FindString("capability") : nullptr;
  if (!capability || capability->empty() || capability->size() > 64) return RespondNow(Error("A native capture capability is required"));
  if (method == "validatePageSurfaceCapture")
    return RespondNow(WithArguments(ValidateAuxPageSurfaceCapture(profile(), *capability)));
  if (method == "cancelPageSurfaceCapture") {
    CancelAuxPageSurfaceCapture(profile(), *capability);
    return RespondNow(WithArguments(base::DictValue().Set("success", true)));
  }
  if (method != "capturePageSurface") return RespondNow(Error("Unknown developer action"));
  pending_epoch_ = aux::GetProfileCookieBindingEpoch(profile());
  pending_capability_ = *capability;
  CaptureAuxPageSurface(profile(), *capability, base::BindOnce(&AuxDeveloperExpansionFunction::DidCapture, this));
  return did_respond() ? AlreadyResponded() : RespondLater();
}
void AuxDeveloperExpansionFunction::DidCapture(base::DictValue result) {
  if (shutting_down_ || !browser_context() || !IsAuxLocalProfileAdmitted(profile()) ||
      aux::GetProfileCookieBindingEpoch(profile()) != pending_epoch_ ||
      !ValidateAuxPageSurfaceCapture(profile(), pending_capability_).FindBool("success").value_or(false))
    result = Failure("The page or profile changed during capture. Please try again.");
  Respond(WithArguments(std::move(result)));
}
void AuxDeveloperExpansionFunction::OnBrowserContextShutdown() {
  shutting_down_ = true;
  if (browser_context() && !pending_capability_.empty())
    CancelAuxPageSurfaceCapture(profile(), pending_capability_);
  AuxFunction::OnBrowserContextShutdown();
}
}  // namespace extensions
