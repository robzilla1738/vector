// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_PREFERENCES_AUX_BROWSER_PREFERENCES_API_H_
#define CHROME_BROWSER_EXTENSIONS_API_AUX_BROWSER_PREFERENCES_AUX_BROWSER_PREFERENCES_API_H_
#include "base/callback_list.h"
#include "chrome/browser/extensions/api/aux_common/aux_api.h"
#include "chrome/browser/shell_integration.h"
class PrefRegistrySimple;
namespace user_prefs {
class PrefRegistrySyncable;
}
namespace extensions {
void RegisterAuxProfilePrefs(user_prefs::PrefRegistrySyncable* registry);
void RegisterAuxBrowserLocalStatePrefs(PrefRegistrySimple* registry);
class AuxBrowserPreferencesFunction : public AuxFunction {
 protected:
  ~AuxBrowserPreferencesFunction() override = default;
  ResponseAction RunAux() override;
  void OnBrowserContextShutdown() override;

 private:
  void DidLoadSearchEngines();
  base::CallbackListSubscription search_engines_loaded_subscription_;
  bool search_engines_pending_ = false;
  void DidDefaultBrowser(shell_integration::DefaultWebClientState state);
  void DidDock(base::DictValue state);
};
class AuxBrowserPreferencesGetWindowBackgroundVibrancyEnabledFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION(
      "auxBrowserPreferences.getWindowBackgroundVibrancyEnabled",
      AUXBROWSERPREFERENCES_GETWINDOWBACKGROUNDVIBRANCYENABLED)
 protected:
  ~AuxBrowserPreferencesGetWindowBackgroundVibrancyEnabledFunction() override =
      default;
};
class AuxBrowserPreferencesSetWindowBackgroundVibrancyEnabledFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION(
      "auxBrowserPreferences.setWindowBackgroundVibrancyEnabled",
      AUXBROWSERPREFERENCES_SETWINDOWBACKGROUNDVIBRANCYENABLED)
 protected:
  ~AuxBrowserPreferencesSetWindowBackgroundVibrancyEnabledFunction() override =
      default;
};
class AuxBrowserPreferencesGetBrowserColorSchemeFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getBrowserColorScheme",
                             AUXBROWSERPREFERENCES_GETBROWSERCOLORSCHEME)
 protected:
  ~AuxBrowserPreferencesGetBrowserColorSchemeFunction() override = default;
};
class AuxBrowserPreferencesSetBrowserColorSchemeFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.setBrowserColorScheme",
                             AUXBROWSERPREFERENCES_SETBROWSERCOLORSCHEME)
 protected:
  ~AuxBrowserPreferencesSetBrowserColorSchemeFunction() override = default;
};
class AuxBrowserPreferencesGetTabStyleFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getTabStyle",
                             AUXBROWSERPREFERENCES_GETTABSTYLE)
 protected:
  ~AuxBrowserPreferencesGetTabStyleFunction() override = default;
};
class AuxBrowserPreferencesSetTabStyleFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.setTabStyle",
                             AUXBROWSERPREFERENCES_SETTABSTYLE)
 protected:
  ~AuxBrowserPreferencesSetTabStyleFunction() override = default;
};
class AuxBrowserPreferencesGetVerticalTabInsertionPositionFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION(
      "auxBrowserPreferences.getVerticalTabInsertionPosition",
      AUXBROWSERPREFERENCES_GETVERTICALTABINSERTIONPOSITION)
 protected:
  ~AuxBrowserPreferencesGetVerticalTabInsertionPositionFunction() override =
      default;
};
class AuxBrowserPreferencesSetVerticalTabInsertionPositionFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION(
      "auxBrowserPreferences.setVerticalTabInsertionPosition",
      AUXBROWSERPREFERENCES_SETVERTICALTABINSERTIONPOSITION)
 protected:
  ~AuxBrowserPreferencesSetVerticalTabInsertionPositionFunction() override =
      default;
};
class AuxBrowserPreferencesGetHorizontalTabShrinkEnabledFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION(
      "auxBrowserPreferences.getHorizontalTabShrinkEnabled",
      AUXBROWSERPREFERENCES_GETHORIZONTALTABSHRINKENABLED)
 protected:
  ~AuxBrowserPreferencesGetHorizontalTabShrinkEnabledFunction() override =
      default;
};
class AuxBrowserPreferencesSetHorizontalTabShrinkEnabledFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION(
      "auxBrowserPreferences.setHorizontalTabShrinkEnabled",
      AUXBROWSERPREFERENCES_SETHORIZONTALTABSHRINKENABLED)
 protected:
  ~AuxBrowserPreferencesSetHorizontalTabShrinkEnabledFunction() override =
      default;
};
class AuxBrowserPreferencesGetTabSwitcherSortByRecentlyUsedFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION(
      "auxBrowserPreferences.getTabSwitcherSortByRecentlyUsed",
      AUXBROWSERPREFERENCES_GETTABSWITCHERSORTBYRECENTLYUSED)
 protected:
  ~AuxBrowserPreferencesGetTabSwitcherSortByRecentlyUsedFunction() override =
      default;
};
class AuxBrowserPreferencesSetTabSwitcherSortByRecentlyUsedFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION(
      "auxBrowserPreferences.setTabSwitcherSortByRecentlyUsed",
      AUXBROWSERPREFERENCES_SETTABSWITCHERSORTBYRECENTLYUSED)
 protected:
  ~AuxBrowserPreferencesSetTabSwitcherSortByRecentlyUsedFunction() override =
      default;
};
class AuxBrowserPreferencesGetDefaultZoomFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getDefaultZoom",
                             AUXBROWSERPREFERENCES_GETDEFAULTZOOM)
 protected:
  ~AuxBrowserPreferencesGetDefaultZoomFunction() override = default;
};
class AuxBrowserPreferencesSetDefaultZoomFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.setDefaultZoom",
                             AUXBROWSERPREFERENCES_SETDEFAULTZOOM)
 protected:
  ~AuxBrowserPreferencesSetDefaultZoomFunction() override = default;
};
class AuxBrowserPreferencesGetAutoPipEnabledFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getAutoPipEnabled",
                             AUXBROWSERPREFERENCES_GETAUTOPIPENABLED)
 protected:
  ~AuxBrowserPreferencesGetAutoPipEnabledFunction() override = default;
};
class AuxBrowserPreferencesSetAutoPipEnabledFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.setAutoPipEnabled",
                             AUXBROWSERPREFERENCES_SETAUTOPIPENABLED)
 protected:
  ~AuxBrowserPreferencesSetAutoPipEnabledFunction() override = default;
};
class AuxBrowserPreferencesGetVerticalTabsBookmarksSectionEnabledFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION(
      "auxBrowserPreferences.getVerticalTabsBookmarksSectionEnabled",
      AUXBROWSERPREFERENCES_GETVERTICALTABSBOOKMARKSSECTIONENABLED)
 protected:
  ~AuxBrowserPreferencesGetVerticalTabsBookmarksSectionEnabledFunction()
      override = default;
};
class AuxBrowserPreferencesSetVerticalTabsBookmarksSectionEnabledFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION(
      "auxBrowserPreferences.setVerticalTabsBookmarksSectionEnabled",
      AUXBROWSERPREFERENCES_SETVERTICALTABSBOOKMARKSSECTIONENABLED)
 protected:
  ~AuxBrowserPreferencesSetVerticalTabsBookmarksSectionEnabledFunction()
      override = default;
};
class AuxBrowserPreferencesGetKeepTasksRunningStateFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getKeepTasksRunningState",
                             AUXBROWSERPREFERENCES_GETKEEPTASKSRUNNINGSTATE)
 protected:
  ~AuxBrowserPreferencesGetKeepTasksRunningStateFunction() override = default;
};
class AuxBrowserPreferencesSetKeepTasksRunningEnabledFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.setKeepTasksRunningEnabled",
                             AUXBROWSERPREFERENCES_SETKEEPTASKSRUNNINGENABLED)
 protected:
  ~AuxBrowserPreferencesSetKeepTasksRunningEnabledFunction() override = default;
};
class AuxBrowserPreferencesGetDefaultBrowserStateFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getDefaultBrowserState",
                             AUXBROWSERPREFERENCES_GETDEFAULTBROWSERSTATE)
 protected:
  ~AuxBrowserPreferencesGetDefaultBrowserStateFunction() override = default;
};
class AuxBrowserPreferencesSetAsDefaultBrowserFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.setAsDefaultBrowser",
                             AUXBROWSERPREFERENCES_SETASDEFAULTBROWSER)
 protected:
  ~AuxBrowserPreferencesSetAsDefaultBrowserFunction() override = default;
};
class AuxBrowserPreferencesGetDockStateFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getDockState",
                             AUXBROWSERPREFERENCES_GETDOCKSTATE)
 protected:
  ~AuxBrowserPreferencesGetDockStateFunction() override = default;
};
class AuxBrowserPreferencesAddToDockFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.addToDock",
                             AUXBROWSERPREFERENCES_ADDTODOCK)
 protected:
  ~AuxBrowserPreferencesAddToDockFunction() override = default;
};
class AuxBrowserPreferencesGetBrowserVersionFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getBrowserVersion",
                             AUXBROWSERPREFERENCES_GETBROWSERVERSION)
 protected:
  ~AuxBrowserPreferencesGetBrowserVersionFunction() override = default;
};
class AuxBrowserPreferencesGetSyncStatusFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getSyncStatus",
                             AUXBROWSERPREFERENCES_GETSYNCSTATUS)
 protected:
  ~AuxBrowserPreferencesGetSyncStatusFunction() override = default;
};
class AuxBrowserPreferencesCheckForUpdatesFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.checkForUpdates",
                             AUXBROWSERPREFERENCES_CHECKFORUPDATES)
 protected:
  ~AuxBrowserPreferencesCheckForUpdatesFunction() override = default;
};
class AuxBrowserPreferencesGetLanguageSettingsFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getLanguageSettings",
                             AUXBROWSERPREFERENCES_GETLANGUAGESETTINGS)
 protected:
  ~AuxBrowserPreferencesGetLanguageSettingsFunction() override = default;
};
class AuxBrowserPreferencesGetSupportedLanguagesFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getSupportedLanguages",
                             AUXBROWSERPREFERENCES_GETSUPPORTEDLANGUAGES)
 protected:
  ~AuxBrowserPreferencesGetSupportedLanguagesFunction() override = default;
};
class AuxBrowserPreferencesSetPreferredLanguagesFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.setPreferredLanguages",
                             AUXBROWSERPREFERENCES_SETPREFERREDLANGUAGES)
 protected:
  ~AuxBrowserPreferencesSetPreferredLanguagesFunction() override = default;
};
class AuxBrowserPreferencesSetSpellCheckEnabledFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.setSpellCheckEnabled",
                             AUXBROWSERPREFERENCES_SETSPELLCHECKENABLED)
 protected:
  ~AuxBrowserPreferencesSetSpellCheckEnabledFunction() override = default;
};
class AuxBrowserPreferencesGetSearchEnginesFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getSearchEngines",
                             AUXBROWSERPREFERENCES_GETSEARCHENGINES)
 protected:
  ~AuxBrowserPreferencesGetSearchEnginesFunction() override = default;
};
class AuxBrowserPreferencesSetDefaultSearchEngineFunction final
    : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.setDefaultSearchEngine",
                             AUXBROWSERPREFERENCES_SETDEFAULTSEARCHENGINE)
 protected:
  ~AuxBrowserPreferencesSetDefaultSearchEngineFunction() override = default;
};
class AuxBrowserPreferencesGetCommandContextFunction final : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getCommandContext",
                             AUXBROWSERPREFERENCES_GETCOMMANDCONTEXT)
 protected:
  ~AuxBrowserPreferencesGetCommandContextFunction() override = default;
};
class AuxBrowserPreferencesCommitCommandFunction final : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.commitCommand",
                             AUXBROWSERPREFERENCES_COMMITCOMMAND)
 protected:
  ~AuxBrowserPreferencesCommitCommandFunction() override = default;
};
class AuxBrowserPreferencesGetAlwaysShowFullUrlFunction final : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getAlwaysShowFullUrl",
                             AUXBROWSERPREFERENCES_GETALWAYSSHOWFULLURL)
 protected:
  ~AuxBrowserPreferencesGetAlwaysShowFullUrlFunction() override = default;
};
class AuxBrowserPreferencesSetAlwaysShowFullUrlFunction final : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.setAlwaysShowFullUrl",
                             AUXBROWSERPREFERENCES_SETALWAYSSHOWFULLURL)
 protected:
  ~AuxBrowserPreferencesSetAlwaysShowFullUrlFunction() override = default;
};
class AuxBrowserPreferencesGetKeyboardShortcutsFunction final : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.getKeyboardShortcuts",
                             AUXBROWSERPREFERENCES_GETKEYBOARDSHORTCUTS)
 protected:
  ~AuxBrowserPreferencesGetKeyboardShortcutsFunction() override = default;
};
class AuxBrowserPreferencesSetKeyboardShortcutFunction final : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.setKeyboardShortcut",
                             AUXBROWSERPREFERENCES_SETKEYBOARDSHORTCUT)
 protected:
  ~AuxBrowserPreferencesSetKeyboardShortcutFunction() override = default;
};
class AuxBrowserPreferencesResetKeyboardShortcutFunction final : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.resetKeyboardShortcut",
                             AUXBROWSERPREFERENCES_RESETKEYBOARDSHORTCUT)
 protected:
  ~AuxBrowserPreferencesResetKeyboardShortcutFunction() override = default;
};
class AuxBrowserPreferencesSetShortcutHandlingSuspendedFunction final : public AuxBrowserPreferencesFunction {
 public:
  DECLARE_EXTENSION_FUNCTION("auxBrowserPreferences.setShortcutHandlingSuspended",
                             AUXBROWSERPREFERENCES_SETSHORTCUTHANDLINGSUSPENDED)
 protected:
  ~AuxBrowserPreferencesSetShortcutHandlingSuspendedFunction() override = default;
};
}  // namespace extensions
#endif
