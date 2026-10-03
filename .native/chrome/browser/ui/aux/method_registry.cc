// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/aux/method_registry.h"

#include <algorithm>
#include <cmath>
#include <cstdlib>
#include <initializer_list>
#include <utility>

#include "base/command_line.h"
#include "build/build_config.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_split.h"
#include "chrome/browser/buildflags.h"
#include "chrome/browser/ui/aux/generated/aux_host_methods.h"
#include "components/version_info/version_info.h"
#include "url/gurl.h"
#if BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include "chrome/browser/ui/aux/journey_fixture_path.h"
#include "chrome/browser/ui/aux/native_performance_observer.h"
#endif

namespace aux {

const AuxMethodRegistry& AuxMethodRegistry::Get() {
  static const auto* registry = new AuxMethodRegistry();
  return *registry;
}

AuxMethodRegistry::~AuxMethodRegistry() = default;

AuxMethodRegistry::AuxMethodRegistry() {
  auto register_shell = [this](AuxShellMethodGroup group,
                               std::initializer_list<std::string_view> names) {
    for (std::string_view name : names)
      shell_handlers_.emplace(name, group);
  };
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
  if (NativeAppearanceObservationEnabled())
    register_shell(AuxShellMethodGroup::kWindow, {"appearanceSnapshot", "pipAppearanceSnapshot"});
  if (NativePerformanceObservationEnabled())
    register_shell(AuxShellMethodGroup::kWindow,
        {"commandPresentationSnapshot", "prepareGuestSplitDropPresentation",
         "prepareGuestDividerFramePresentation", "prepareGuestTabSwitchPresentation",
         "completeGuestPresentation", "prepareLittleWindowPresentation", "completeLittleWindowPresentation",
         "performanceFixtureNextRequest", "sampleShellMemory", "sampleProcessMemory", "prepareSubagentMemoryWorkload",
         "prepareOrganizationAutoArchiveWork", "prepareOrganizationLiveFolderWork", "completeOrganizationWork"});
#endif
  register_shell(AuxShellMethodGroup::kContent,
                 {"preview", "readArticle", "siteZoom", "privatePageZoom", "siteInfo", "setSiteTrackers", "sitePermissions",
                  "httpAuthRequests", "respondHttpAuth",
                  "clearSitePermission", "clearSiteData", "siteDataCount",
                  "browsingDataPreview", "clearBrowsingData", "httpsUpgrade",
                  "setHttpsUpgrade", "cookieControls", "setCookieControls",
                  "crashReporting", "setCrashReporting",
                  "proceedInsecure", "useHttp"});
  register_shell(AuxShellMethodGroup::kContent,
                 {"translatePage", "showOriginal"});
  register_shell(AuxShellMethodGroup::kCredentials,
                 {"autofillProfile", "setAutofillProfile", "autofill",
                  "vaultFill", "vaultSave", "vaultDismiss",
                  "passwordExport", "passwordImport"});
  register_shell(AuxShellMethodGroup::kDictation,
                 {"dictationStatus", "startDictation", "stopDictation",
                  "cancelDictation"});
  register_shell(AuxShellMethodGroup::kBlocking,
                 {"filterLists", "updateFilters", "addFilterSource",
                  "removeFilterSource", "setFilterSourceEnabled", "privacy",
                  "setTrackerBlock", "removeAllowedHost"});
  register_shell(AuxShellMethodGroup::kMigration,
                 {"migrationReview", "migrationBegin", "migrationBatch",
                  "migrationFinish", "migrationRollback",
                  "exportRuntimeBackup", "exportMigrationLayout",
                  "stageRuntimeRestore", "cancelRuntimeRestore",
                  "runtimeRestoreStatus"});
  register_shell(AuxShellMethodGroup::kProfiles,
                 {"browserProfiles", "createBrowserProfile",
                  "renameBrowserProfile", "archiveBrowserProfile",
                  "deleteBrowserProfile", "openBrowserProfile",
                  "openBrowserProfileUrl", "setBrowserProfileAppearance",
                  "focusBrowserProfileSpace", "moveTabToProfile", "javascriptAppleEvents",
                  "linkRoutes", "setLinkRoutes", "testLinkRoute",
                  "routedOpens", "routePrompts", "resolveRoutePrompt"});
  register_shell(AuxShellMethodGroup::kPageControls,
                 {"createResultPreview", "releaseResultPreview",
                  "surfaceContentId", "hardReload", "printPage", "devTools",
                  "savePagePdf", "downloadFolder", "chooseDownloadFolder",
                  "spellCheck",
                  "languagePreferences",
                  "automaticPictureInPicture",
                  "keepRuntimeInBackground",
                  "defaultPageZoom",
                  "startupPreferences",
                  "downloadsSnapshot", "controlDownload", "retryDownload"});
  register_shell(AuxShellMethodGroup::kSurfaces,
                 {"setStageVisible", "pictureInPicture"});
  register_shell(AuxShellMethodGroup::kExtensions,
                 {"extensions", "installStoreExtension",
                  "checkStoreExtensionUpdate", "setExtensionEnabled",
                  "reloadExtension", "removeExtension", "showExtensionAction",
                  "installUnpackedExtension", "updateUnpackedExtension",
                  "extensionActions", "pinExtensionAction", "extensionCommands",
                  "setExtensionCommandShortcut", "extensionSidePanel"});
  register_shell(AuxShellMethodGroup::kLibrary,
                 {"organizationSnapshot", "organizationCommit"});
  register_shell(AuxShellMethodGroup::kTabs,
                 {"bindTabSpace", "migrateTabSpaces", "tabsSnapshot",
                  "tabsSince", "tabCommand", "tabAudio", "tabsUnsavedWork", "tabSleep", "archiveTab"});
  register_shell(AuxShellMethodGroup::kHealth,
                 {"healthSummary", "clearHealth", "exportDiagnostics"});
  register_shell(AuxShellMethodGroup::kWindow,
                 {"defaultBrowser", "setDefaultBrowser", "dataDir",
                  "resolveSearch", "setAppearance", "setShortcuts", "dispatchCommand",
                  "windowControlsVisible", "focusShell", "showRunAttention", "openFile", "saveFile", "saveWorkbook",
                  "saveStoredArtifact",
                  "agentConfig", "agentConnections", "agentClients",
                  "revokeAgentConnection",
                  "openPluginDirectory", "pickEvidenceImage",
                  "pickEvidenceDocument", "closeWindow", "openExternal",
                  "navigationMenu", "contextMenu",
                  "revealPath", "openPath"});
  register_shell(AuxShellMethodGroup::kWindow,
                 {"quickAsk", "quickAskShortcut", "littleWindow", "externalLinkTarget", "showTabWindow"});
  auto register_runtime = [this](AuxRuntimeMethodGroup group,
                                 std::initializer_list<std::string_view> names) {
    for (std::string_view name : names)
      runtime_handlers_.emplace(name, group);
  };
  register_runtime(AuxRuntimeMethodGroup::kLibrary,
                   {"native.capabilities", "native.searchEngineGet", "native.searchEngineSet",
                    "native.searchSuggestionsGet", "native.searchSuggestionsSet",
                    "native.bookmarksInvoke", "native.organizationSnapshot", "native.liveFolderSources"});
  register_runtime(AuxRuntimeMethodGroup::kBlocking,
                   {"native.permissionRetire", "native.egressContext", "native.egressInstall", "native.egressRevoke",
                    "native.contentBlockBegin", "native.contentBlockAppend",
                    "native.cosmeticBegin", "native.cosmeticAppend"});
  register_runtime(AuxRuntimeMethodGroup::kPower, {"native.powerActivity", "native.powerStatus", "native.powerRelease"});
  register_runtime(AuxRuntimeMethodGroup::kCdp,
                   {"native.cdpReset", "native.cdpDispatch", "native.cdpVersion"});
  register_runtime(AuxRuntimeMethodGroup::kTabs,
                   {"native.listPages", "native.createAgentPage", "native.tabCommand", "native.movePage",
                    "native.focusPage", "native.stopPage", "native.recoverPage",
                    "native.acquireStage", "native.releaseStage"});
  register_runtime(AuxRuntimeMethodGroup::kPageControls,
                   {"native.stopFind", "native.setZoom"});
  register_runtime(AuxRuntimeMethodGroup::kAsync,
                   {"native.personRead", "native.recorderStart", "native.recorderDrain", "native.recorderStop"});
  register_runtime(AuxRuntimeMethodGroup::kAsync,
                   {"native.downloadRenameReceipts", "native.downloadNamingCandidate", "native.downloadPreviewText",
                    "native.renameDownload", "native.undoDownloadRename",
                    "native.setCookies", "native.captureReadablePage",
                    "native.fillSavedPassword", "native.zapInstallStylesheet",
                    "native.cosmeticCommit", "native.findInPage",
                    "native.contentBlockCommit", "native.historyClear",
                    "native.historyImport",
                    "native.historyRemove", "native.webmcpList",
                    "native.webmcpCall"});
  register_runtime(AuxRuntimeMethodGroup::kWorker,
                   {"native.storeSecret", "native.readSecret",
                    "native.profileStorageRoot", "native.profileStorageFactor",
                    "native.recoveryOwnerAuth"});
}

AuxShellMethodGroup AuxMethodRegistry::ShellGroup(
    std::string_view method) const {
  auto it = shell_handlers_.find(method);
  return it == shell_handlers_.end() ? AuxShellMethodGroup::kNone : it->second;
}

AuxRuntimeMethodGroup AuxMethodRegistry::RuntimeGroup(
    std::string_view method) const {
  auto it = runtime_handlers_.find(method);
  return it == runtime_handlers_.end() ? AuxRuntimeMethodGroup::kNone
                                       : it->second;
}

bool AuxMethodRegistry::HasRuntimeHandler(std::string_view method) const {
  return RuntimeGroup(method) != AuxRuntimeMethodGroup::kNone;
}

bool AuxMethodRegistry::Validate(std::string_view method,
                                 const base::Value& args,
                                 std::string* error) const {
  const std::optional<generated::MethodId> id = generated::LookupMethod(method);
  if (!id) {
    if (error)
      *error = "Unknown Aux host method";
    return false;
  }
  return generated::ValidateMethodArgs(*id, args, error);
}

base::DictValue AuxMethodRegistry::Capabilities() const {
  base::DictValue result;
  result.Set("buildId", std::string(version_info::GetVersionNumber()) + "+" +
                            std::string(generated::kManifestHash) + "+" +
                            std::string(generated::kSourceCommit));
  result.Set("sourceCommit", std::string(generated::kSourceCommit));
  base::ListValue qualified_features;
  for (std::string_view feature : base::SplitStringPiece(
           generated::kQualifiedFeatures, ",", base::TRIM_WHITESPACE,
           base::SPLIT_WANT_NONEMPTY)) {
    qualified_features.Append(std::string(feature));
  }
  result.Set("qualifiedFeatures", std::move(qualified_features));
#if BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
  // Read only from the native process command line, never renderer/RPC input.
  // A production build omits this capability; consumers use the default clock.
  const auto* command = base::CommandLine::ForCurrentProcess();
  const GURL fixture(command->GetSwitchValueASCII("aux-loopback-services-url"));
  if (fixture.is_valid() && fixture.SchemeIs("http") && fixture.host() == "127.0.0.1" &&
      fixture.has_port() && !fixture.has_username() && !fixture.has_password() &&
      fixture.path() == "/" && !fixture.has_query() && !fixture.has_ref() &&
      OwnedJourneyFixtureRoot(command->GetSwitchValueASCII("user-data-dir")) &&
      command->HasSwitch("use-mock-keychain") && command->GetSwitchValueASCII("password-store") == "basic") {
    result.Set("loopbackServicesUrl", fixture.spec());
  }
  const std::string requested_scale =
      base::CommandLine::ForCurrentProcess()->GetSwitchValueASCII(
          "aux-test-clock-scale");
  double clock_scale = 1;
  if (base::StringToDouble(requested_scale, &clock_scale) &&
      std::isfinite(clock_scale) && clock_scale >= 1 && clock_scale <= 100000) {
    result.Set("testClockScale", clock_scale);
  }
#endif
  // This only requests a runtime proof; the runtime validates the disposable
  // Profile marker before it can enable any preview feature.
  result.Set("developmentAcceptanceRequested",
             std::getenv("AUX_DEV_ACCEPTANCE_TOKEN") != nullptr);
  base::ListValue methods;
  for (const generated::MethodInfo& info : generated::Methods()) {
    if (info.name == "capabilities" || info.name == "autocomplete" ||
        ShellGroup(info.name) != AuxShellMethodGroup::kNone ||
        HasRuntimeHandler(info.name)) {
      methods.Append(std::string(info.name));
    }
  }
  result.Set("methods", std::move(methods));
  return result;
}

}  // namespace aux
