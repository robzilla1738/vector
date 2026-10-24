// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_PREFERENCES_AUX_DEVELOPER_EXPANSION_API_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_PREFERENCES_AUX_DEVELOPER_EXPANSION_API_H_
#include <string>
#include "chrome/browser/extensions/api/aux_common/aux_api.h"
namespace extensions {
class AuxDeveloperExpansionFunction : public AuxFunction {
 protected:
  AuxDeveloperExpansionFunction();
  ~AuxDeveloperExpansionFunction() override;
  ResponseAction RunAux() override;
  void OnBrowserContextShutdown() override;
 private:
  void DidCapture(base::DictValue result);
  std::string pending_epoch_;
  std::string pending_capability_;
  bool shutting_down_ = false;
};
class AuxBrowserPreferencesGetPageCaptureTargetFunction final : public AuxDeveloperExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getPageCaptureTarget", AUXBROWSERPREFERENCES_GETPAGECAPTURETARGET)
 protected:
  ~AuxBrowserPreferencesGetPageCaptureTargetFunction() override = default;
};
class AuxBrowserPreferencesBeginPageSurfaceCaptureFunction final : public AuxDeveloperExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.beginPageSurfaceCapture", AUXBROWSERPREFERENCES_BEGINPAGESURFACECAPTURE)
 protected:
  ~AuxBrowserPreferencesBeginPageSurfaceCaptureFunction() override = default;
};
class AuxBrowserPreferencesCapturePageSurfaceFunction final : public AuxDeveloperExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.capturePageSurface", AUXBROWSERPREFERENCES_CAPTUREPAGESURFACE)
 protected:
  ~AuxBrowserPreferencesCapturePageSurfaceFunction() override = default;
};
class AuxBrowserPreferencesValidatePageSurfaceCaptureFunction final : public AuxDeveloperExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.validatePageSurfaceCapture", AUXBROWSERPREFERENCES_VALIDATEPAGESURFACECAPTURE)
 protected:
  ~AuxBrowserPreferencesValidatePageSurfaceCaptureFunction() override = default;
};
class AuxBrowserPreferencesCancelPageSurfaceCaptureFunction final : public AuxDeveloperExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.cancelPageSurfaceCapture", AUXBROWSERPREFERENCES_CANCELPAGESURFACECAPTURE)
 protected:
  ~AuxBrowserPreferencesCancelPageSurfaceCaptureFunction() override = default;
};
class AuxBrowserPreferencesGetDeveloperSettingsFunction final : public AuxDeveloperExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getDeveloperSettings", AUXBROWSERPREFERENCES_GETDEVELOPERSETTINGS)
 protected:
  ~AuxBrowserPreferencesGetDeveloperSettingsFunction() override = default;
};
class AuxBrowserPreferencesSetDeveloperModeFunction final : public AuxDeveloperExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.setDeveloperMode", AUXBROWSERPREFERENCES_SETDEVELOPERMODE)
 protected:
  ~AuxBrowserPreferencesSetDeveloperModeFunction() override = default;
};
class AuxBrowserPreferencesOpenDeveloperToolsFunction final : public AuxDeveloperExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.openDeveloperTools", AUXBROWSERPREFERENCES_OPENDEVELOPERTOOLS)
 protected:
  ~AuxBrowserPreferencesOpenDeveloperToolsFunction() override = default;
};
class AuxBrowserPreferencesOpenExtensionManagerFunction final : public AuxDeveloperExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.openExtensionManager", AUXBROWSERPREFERENCES_OPENEXTENSIONMANAGER)
 protected:
  ~AuxBrowserPreferencesOpenExtensionManagerFunction() override = default;
};
class AuxBrowserPreferencesReportPageCaptureErrorFunction final : public AuxDeveloperExpansionFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.reportPageCaptureError", AUXBROWSERPREFERENCES_REPORTPAGECAPTUREERROR)
 protected:
  ~AuxBrowserPreferencesReportPageCaptureErrorFunction() override = default;
};
}  // namespace extensions
#endif
