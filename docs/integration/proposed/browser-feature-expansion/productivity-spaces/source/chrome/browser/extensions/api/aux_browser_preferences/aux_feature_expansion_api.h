// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_PREFERENCES_AUX_FEATURE_EXPANSION_API_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_PREFERENCES_AUX_FEATURE_EXPANSION_API_H_
#include <string>
#include "base/memory/weak_ptr.h"
namespace aux::organization { struct CommitResult; }
#include "chrome/browser/extensions/api/aux_common/aux_api.h"
#include "content/public/browser/weak_document_ptr.h"
class BrowserWindowInterface;
class Profile;
// Called by the native profile transaction before the old profile is detached.
void CancelAuxThemePreviewsForProfile(Profile* profile);
namespace extensions {
class AuxFeatureExpansionFunction : public AuxFunction {
 protected:
  AuxFeatureExpansionFunction();
  ~AuxFeatureExpansionFunction() override;
  ResponseAction RunAux() override;
  void OnBrowserContextShutdown() override;
 private:
  void DidCommit(aux::organization::CommitResult result);
  void DidFeatureResult(base::DictValue result);
  void DidRoute(base::DictValue result);
  bool shutting_down_ = false;
  base::WeakPtr<BrowserWindowInterface> pending_browser_;
  content::WeakDocumentPtr pending_document_;
  std::string pending_generation_;
  std::string pending_proposal_;
};
class AuxBrowserPreferencesGetOrganizationSnapshotFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getOrganizationSnapshot", AUXBROWSERPREFERENCES_GETORGANIZATIONSNAPSHOT)
 protected:
  ~AuxBrowserPreferencesGetOrganizationSnapshotFunction() override = default;
};
class AuxBrowserPreferencesShowOrganizationProposalFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.showOrganizationProposal", AUXBROWSERPREFERENCES_SHOWORGANIZATIONPROPOSAL)
 protected:
  ~AuxBrowserPreferencesShowOrganizationProposalFunction() override = default;
};
class AuxBrowserPreferencesApplyOrganizationProposalFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.applyOrganizationProposal", AUXBROWSERPREFERENCES_APPLYORGANIZATIONPROPOSAL)
 protected:
  ~AuxBrowserPreferencesApplyOrganizationProposalFunction() override = default;
};
class AuxBrowserPreferencesUndoOrganizationFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.undoOrganization", AUXBROWSERPREFERENCES_UNDOORGANIZATION)
 protected:
  ~AuxBrowserPreferencesUndoOrganizationFunction() override = default;
};
class AuxBrowserPreferencesCaptureTabReferencesFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.captureTabReferences", AUXBROWSERPREFERENCES_CAPTURETABREFERENCES)
 protected:
  ~AuxBrowserPreferencesCaptureTabReferencesFunction() override = default;
};
class AuxBrowserPreferencesValidateTabReferencesFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.validateTabReferences", AUXBROWSERPREFERENCES_VALIDATETABREFERENCES)
 protected:
  ~AuxBrowserPreferencesValidateTabReferencesFunction() override = default;
};
class AuxBrowserPreferencesGetFramePresentationFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getFramePresentation", AUXBROWSERPREFERENCES_GETFRAMEPRESENTATION)
 protected:
  ~AuxBrowserPreferencesGetFramePresentationFunction() override = default;
};
class AuxBrowserPreferencesSetFramePresentationFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.setFramePresentation", AUXBROWSERPREFERENCES_SETFRAMEPRESENTATION)
 protected:
  ~AuxBrowserPreferencesSetFramePresentationFunction() override = default;
};
class AuxBrowserPreferencesGetThemeStateFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getThemeState", AUXBROWSERPREFERENCES_GETTHEMESTATE)
 protected:
  ~AuxBrowserPreferencesGetThemeStateFunction() override = default;
};
class AuxBrowserPreferencesPreviewThemeFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.previewTheme", AUXBROWSERPREFERENCES_PREVIEWTHEME)
 protected:
  ~AuxBrowserPreferencesPreviewThemeFunction() override = default;
};
class AuxBrowserPreferencesApplyThemeFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.applyTheme", AUXBROWSERPREFERENCES_APPLYTHEME)
 protected:
  ~AuxBrowserPreferencesApplyThemeFunction() override = default;
};
class AuxBrowserPreferencesCancelThemeFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.cancelTheme", AUXBROWSERPREFERENCES_CANCELTHEME)
 protected:
  ~AuxBrowserPreferencesCancelThemeFunction() override = default;
};
class AuxBrowserPreferencesResetThemeFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.resetTheme", AUXBROWSERPREFERENCES_RESETTHEME)
 protected:
  ~AuxBrowserPreferencesResetThemeFunction() override = default;
};
class AuxBrowserPreferencesSaveThemePresetFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.saveThemePreset", AUXBROWSERPREFERENCES_SAVETHEMEPRESET)
 protected:
  ~AuxBrowserPreferencesSaveThemePresetFunction() override = default;
};
class AuxBrowserPreferencesDeleteThemePresetFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.deleteThemePreset", AUXBROWSERPREFERENCES_DELETETHEMEPRESET)
 protected:
  ~AuxBrowserPreferencesDeleteThemePresetFunction() override = default;
};
class AuxBrowserPreferencesExportThemePresetFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.exportThemePreset", AUXBROWSERPREFERENCES_EXPORTTHEMEPRESET)
 protected:
  ~AuxBrowserPreferencesExportThemePresetFunction() override = default;
};
class AuxBrowserPreferencesGetOrganizationSettingsFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getOrganizationSettings", AUXBROWSERPREFERENCES_GETORGANIZATIONSETTINGS)
 protected:
  ~AuxBrowserPreferencesGetOrganizationSettingsFunction() override = default;
};
class AuxBrowserPreferencesSetOrganizationCleanupPolicyFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.setOrganizationCleanupPolicy", AUXBROWSERPREFERENCES_SETORGANIZATIONCLEANUPPOLICY)
 protected:
  ~AuxBrowserPreferencesSetOrganizationCleanupPolicyFunction() override = default;
};
class AuxBrowserPreferencesListRecentFilesFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.listRecentFiles", AUXBROWSERPREFERENCES_LISTRECENTFILES)
 protected:
  ~AuxBrowserPreferencesListRecentFilesFunction() override = default;
};
class AuxBrowserPreferencesPrepareDownloadRenameFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.prepareDownloadRename", AUXBROWSERPREFERENCES_PREPAREDOWNLOADRENAME)
 protected:
  ~AuxBrowserPreferencesPrepareDownloadRenameFunction() override = default;
};
class AuxBrowserPreferencesApplyDownloadRenameFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.applyDownloadRename", AUXBROWSERPREFERENCES_APPLYDOWNLOADRENAME)
 protected:
  ~AuxBrowserPreferencesApplyDownloadRenameFunction() override = default;
};
class AuxBrowserPreferencesUndoDownloadRenameFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.undoDownloadRename", AUXBROWSERPREFERENCES_UNDODOWNLOADRENAME)
 protected:
  ~AuxBrowserPreferencesUndoDownloadRenameFunction() override = default;
};
class AuxBrowserPreferencesDragRecentFileFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.dragRecentFile", AUXBROWSERPREFERENCES_DRAGRECENTFILE)
 protected:
  ~AuxBrowserPreferencesDragRecentFileFunction() override = default;
};
class AuxBrowserPreferencesRevealRecentFileFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.revealRecentFile", AUXBROWSERPREFERENCES_REVEALRECENTFILE)
 protected:
  ~AuxBrowserPreferencesRevealRecentFileFunction() override = default;
};
class AuxBrowserPreferencesTogglePictureInPictureFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.togglePictureInPicture", AUXBROWSERPREFERENCES_TOGGLEPICTUREINPICTURE)
 protected:
  ~AuxBrowserPreferencesTogglePictureInPictureFunction() override = default;
};
class AuxBrowserPreferencesGetRoutingStateFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getRoutingState", AUXBROWSERPREFERENCES_GETROUTINGSTATE)
 protected:
  ~AuxBrowserPreferencesGetRoutingStateFunction() override = default;
};
class AuxBrowserPreferencesSetRoutingRulesFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.setRoutingRules", AUXBROWSERPREFERENCES_SETROUTINGRULES)
 protected:
  ~AuxBrowserPreferencesSetRoutingRulesFunction() override = default;
};
class AuxBrowserPreferencesTestRoutingUrlFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.testRoutingUrl", AUXBROWSERPREFERENCES_TESTROUTINGURL)
 protected:
  ~AuxBrowserPreferencesTestRoutingUrlFunction() override = default;
};
class AuxBrowserPreferencesRouteBrowserLinkFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.routeBrowserLink", AUXBROWSERPREFERENCES_ROUTEBROWSERLINK)
 protected:
  ~AuxBrowserPreferencesRouteBrowserLinkFunction() override = default;
};
class AuxBrowserPreferencesGetShortcutProfileFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getShortcutProfile", AUXBROWSERPREFERENCES_GETSHORTCUTPROFILE)
 protected:
  ~AuxBrowserPreferencesGetShortcutProfileFunction() override = default;
};
class AuxBrowserPreferencesExportShortcutProfileFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.exportShortcutProfile", AUXBROWSERPREFERENCES_EXPORTSHORTCUTPROFILE)
 protected:
  ~AuxBrowserPreferencesExportShortcutProfileFunction() override = default;
};
class AuxBrowserPreferencesImportShortcutProfileFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.importShortcutProfile", AUXBROWSERPREFERENCES_IMPORTSHORTCUTPROFILE)
 protected:
  ~AuxBrowserPreferencesImportShortcutProfileFunction() override = default;
};
class AuxBrowserPreferencesResetShortcutProfileFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.resetShortcutProfile", AUXBROWSERPREFERENCES_RESETSHORTCUTPROFILE)
 protected:
  ~AuxBrowserPreferencesResetShortcutProfileFunction() override = default;
};
class AuxBrowserPreferencesGetTabMentionSpacesFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getTabMentionSpaces", AUXBROWSERPREFERENCES_GETTABMENTIONSPACES)
 protected:
  ~AuxBrowserPreferencesGetTabMentionSpacesFunction() override = default;
};
class AuxBrowserPreferencesCaptureTabMentionSpaceFunction final : public AuxFeatureExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.captureTabMentionSpace", AUXBROWSERPREFERENCES_CAPTURETABMENTIONSPACE)
 protected:
  ~AuxBrowserPreferencesCaptureTabMentionSpaceFunction() override = default;
};
}  // namespace extensions
#endif
