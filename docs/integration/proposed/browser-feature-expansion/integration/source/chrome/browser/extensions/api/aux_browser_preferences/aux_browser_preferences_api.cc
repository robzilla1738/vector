// Copyright 2026 Aux Authors. All rights reserved.
// Independently authored preference bindings: native/apis-core A2.
#include "chrome/browser/extensions/api/aux_browser_preferences/aux_browser_preferences_api.h"

#include <algorithm>
#include <cmath>

#include "base/functional/bind.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_util.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/thread_pool.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/content_settings/host_content_settings_map_factory.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/search_engines/template_url_service_factory.h"
#include "chrome/browser/themes/theme_service.h"
#include "chrome/browser/themes/theme_service_factory.h"
#include "chrome/browser/ui/aux_keyboard_shortcuts.h"
#include "chrome/browser/ui/views/frame/aux_tab_search_bubble.h"
#include "components/omnibox/browser/omnibox_pref_names.h"
#include "chrome/browser/ui/tabs/tab_strip_prefs.h"
#include "chrome/browser/ui/zoom/chrome_zoom_level_prefs.h"
#include "chrome/common/pref_names.h"
#include "components/content_settings/core/browser/host_content_settings_map.h"
#include "components/language/core/browser/language_prefs.h"
#include "components/language/core/browser/pref_names.h"
#include "components/pref_registry/pref_registry_syncable.h"
#include "components/prefs/pref_service.h"
#include "components/search_engines/template_url.h"
#include "components/search_engines/template_url_service.h"
#include "components/spellcheck/browser/pref_names.h"
#include "components/spellcheck/browser/spellcheck_platform.h"
#include "components/version_info/version_info.h"
#include "third_party/blink/public/common/page/page_zoom.h"
#include "ui/base/l10n/l10n_util.h"
namespace extensions {
base::DictValue ReadAuxDockState();
base::DictValue AddAuxToDock();
bool ReadAuxWindowVibrancyEnabled();
bool WriteAuxWindowVibrancyEnabled(bool enabled);
namespace {
constexpr const char* kShrink = tabs::kAuxProfileHorizontalTabShrinkEnabled;
constexpr char kMru[] = "aux.browser.tab_switcher_mru";
constexpr char kBookmarks[] = "aux.browser.sidebar_bookmarks";
base::DictValue SearchEngines(Profile* profile) {
  auto* service = TemplateURLServiceFactory::GetForProfile(profile);
  base::ListValue engines;
  const auto* current = service->GetDefaultSearchProvider();
  for (const auto& engine : service->GetTemplateURLs()) {
    if (!engine->SupportsReplacement(service->search_terms_data())) {
      continue;
    }
    base::DictValue row;
    row.Set("id", base::NumberToString(engine->id()));
    row.Set("name", base::UTF16ToUTF8(engine->short_name()));
    row.Set("keyword", base::UTF16ToUTF8(engine->keyword()));
    row.Set("isDefault", engine == current);
    engines.Append(std::move(row));
  }
  base::DictValue result;
  result.Set("searchEngines", std::move(engines));
  if (current) {
    result.Set("defaultEngineId", base::NumberToString(current->id()));
  }
  return result;
}
}  // namespace
void RegisterAuxProfilePrefs(user_prefs::PrefRegistrySyncable* registry) {
  aux::RegisterKeyboardShortcutPrefs(registry);
  registry->RegisterListPref("aux.browser.sidebar.expanded_bookmark_folders");
  registry->RegisterListPref("aux.browser.sidebar.collapsed_sections");
  registry->RegisterListPref("aux.browser.import.source_profiles");
  registry->RegisterBooleanPref(kShrink, true);
  registry->RegisterBooleanPref(kMru, true);
  registry->RegisterBooleanPref(kBookmarks, true);
}
void RegisterAuxBrowserLocalStatePrefs(PrefRegistrySimple* registry) {
  registry->RegisterDictionaryPref("aux.routing.rules");
  registry->RegisterDictionaryPref("aux.routing.profile_index");
  registry->RegisterStringPref(tabs::kAuxVerticalTabInsertionPosition, "top");
  registry->RegisterBooleanPref(tabs::kAuxHorizontalTabShrinkEnabled, true);
}
ExtensionFunction::ResponseAction AuxBrowserPreferencesFunction::RunAux() {
  const std::string_view method = std::string_view(name()).substr(22);
  auto* prefs = profile()->GetPrefs();
  if (method == "getCommandContext") {
    if (!args().empty()) return RespondNow(Error("This method takes no arguments"));
    return RespondNow(WithArguments(GetAuxCommandContext(GetSenderWebContents())));
  }
  if (method == "commitCommand") {
    if (args().size() != 1 || !args()[0].is_dict())
      return RespondNow(Error("Command request required"));
    return RespondNow(WithArguments(CommitAuxCommand(GetSenderWebContents(), args()[0].GetDict())));
  }
  if (method == "getAlwaysShowFullUrl") {
    if (!args().empty()) return RespondNow(Error("This method takes no arguments"));
    return RespondNow(WithArguments(prefs->GetBoolean(omnibox::kPreventUrlElisionsInOmnibox)));
  }
  if (method == "setAlwaysShowFullUrl") {
    if (args().size() != 1 || !args()[0].is_bool()) return RespondNow(Error("Boolean required"));
    if (prefs->IsManagedPreference(omnibox::kPreventUrlElisionsInOmnibox))
      return RespondNow(Error("URL display is managed"));
    prefs->SetBoolean(omnibox::kPreventUrlElisionsInOmnibox, args()[0].GetBool());
    return RespondNow(NoArguments());
  }
  if (method == "getKeyboardShortcuts") {
    if (!args().empty()) return RespondNow(Error("This method takes no arguments"));
    return RespondNow(WithArguments(aux::GetKeyboardShortcuts(profile()->GetOriginalProfile())));
  }
  if (method == "setShortcutHandlingSuspended") {
    if (args().size() != 1 || !args()[0].is_bool() || !GetSenderWebContents())
      return RespondNow(Error("Capture flag and live calling page required"));
    aux::SetShortcutCapture(GetSenderWebContents(), args()[0].GetBool());
    return RespondNow(NoArguments());
  }
  if (method == "setKeyboardShortcut" || method == "resetKeyboardShortcut") {
    const bool reset = method == "resetKeyboardShortcut";
    if (args().size() != (reset ? 1u : 2u) || !args()[0].is_int() ||
        (!reset && !args()[1].is_string()))
      return RespondNow(Error("Shortcut command and value required"));
    auto error = reset
        ? aux::ResetKeyboardShortcut(profile()->GetOriginalProfile(), args()[0].GetInt())
        : aux::SetKeyboardShortcut(profile()->GetOriginalProfile(), args()[0].GetInt(), args()[1].GetString());
    if (error) return RespondNow(Error(*error));
    return RespondNow(NoArguments());
  }
  const bool setter = base::StartsWith(method, "set");
  const bool requires_value = setter && method != "setAsDefaultBrowser";
  if (requires_value && args().size() != 1) {
    return RespondNow(Error("Exactly one setting value is required"));
  }
  if (!requires_value && !args().empty()) {
    return RespondNow(Error("This method takes no arguments"));
  }
  struct BooleanPref {
    std::string_view getter, setter;
    const char* key;
  };
  for (const auto& item : std::initializer_list<BooleanPref>{
           {"getTabSwitcherSortByRecentlyUsed",
            "setTabSwitcherSortByRecentlyUsed", kMru},
           {"getVerticalTabsBookmarksSectionEnabled",
            "setVerticalTabsBookmarksSectionEnabled",
            "aux.vertical_tabs.bookmarks_section_enabled"}}) {
    if (method == item.getter) {
      return RespondNow(WithArguments(prefs->GetBoolean(item.key)));
    }
    if (method == item.setter) {
      if (!args()[0].is_bool()) {
        return RespondNow(Error("Boolean value required"));
      }
      prefs->SetBoolean(item.key, args()[0].GetBool());
      return RespondNow(NoArguments());
    }
  }
  if (method == "getWindowBackgroundVibrancyEnabled") {
    return RespondNow(WithArguments(ReadAuxWindowVibrancyEnabled()));
  }
  if (method == "setWindowBackgroundVibrancyEnabled") {
    if (!args()[0].is_bool()) {
      return RespondNow(Error("Boolean value required"));
    }
    if (!WriteAuxWindowVibrancyEnabled(args()[0].GetBool())) {
      return RespondNow(Error("Could not synchronize window vibrancy preference"));
    }
    return RespondNow(NoArguments());
  }
  if (method == "getHorizontalTabShrinkEnabled" ||
      method == "setHorizontalTabShrinkEnabled") {
    auto* local_state = g_browser_process->local_state();
    if (!setter) {
      return RespondNow(WithArguments(
          tabs::GetAuxHorizontalTabShrinkEnabled(local_state, prefs)));
    }
    if (!args()[0].is_bool()) {
      return RespondNow(Error("Boolean value required"));
    }
    const bool enabled = args()[0].GetBool();
    if (local_state) {
      local_state->SetBoolean(tabs::kAuxHorizontalTabShrinkEnabled, enabled);
    }
    prefs->SetBoolean(kShrink, enabled);
    if (auto* manager = g_browser_process->profile_manager()) {
      for (Profile* loaded_profile : manager->GetLoadedProfiles()) {
        loaded_profile->GetPrefs()->SetBoolean(kShrink, enabled);
      }
    }
    return RespondNow(NoArguments());
  }
  if (method == "getBrowserColorScheme") {
    const auto scheme =
        ThemeServiceFactory::GetForProfile(profile())->GetBrowserColorScheme();
    return RespondNow(WithArguments(
        scheme == ThemeService::BrowserColorScheme::kLight  ? "light"
        : scheme == ThemeService::BrowserColorScheme::kDark ? "dark"
                                                            : "system"));
  }
  if (method == "setBrowserColorScheme") {
    if (!args()[0].is_string()) {
      return RespondNow(Error("Appearance value required"));
    }
    const auto& scheme = args()[0].GetString();
    if (scheme != "light" && scheme != "dark" && scheme != "system") {
      return RespondNow(Error("Unknown appearance"));
    }
    ThemeServiceFactory::GetForProfile(profile())->SetBrowserColorScheme(
        scheme == "light"  ? ThemeService::BrowserColorScheme::kLight
        : scheme == "dark" ? ThemeService::BrowserColorScheme::kDark
                           : ThemeService::BrowserColorScheme::kSystem);
    return RespondNow(NoArguments());
  }
  if (method == "getTabStyle") {
    return RespondNow(WithArguments(
        prefs->GetBoolean(prefs::kVerticalTabsEnabled) ? "vertical"
                                                       : "horizontal"));
  }
  if (method == "setTabStyle") {
    if (!args()[0].is_string() || (args()[0].GetString() != "vertical" &&
                                   args()[0].GetString() != "horizontal")) {
      return RespondNow(Error("Tab style must be vertical or horizontal"));
    }
    if (prefs->IsManagedPreference(prefs::kVerticalTabsEnabled)) {
      return RespondNow(Error("Setting is managed"));
    }
    prefs->SetBoolean(prefs::kVerticalTabsEnabled,
                      args()[0].GetString() == "vertical");
    return RespondNow(NoArguments());
  }
  if (method == "getVerticalTabInsertionPosition") {
    auto* local_state = g_browser_process->local_state();
    return RespondNow(WithArguments(
        local_state && local_state->GetString(
                           tabs::kAuxVerticalTabInsertionPosition) == "bottom"
            ? "bottom" : "top"));
  }
  if (method == "setVerticalTabInsertionPosition") {
    if (!args()[0].is_string() ||
        (args()[0].GetString() != "top" && args()[0].GetString() != "bottom")) {
      return RespondNow(Error("Insertion position must be top or bottom"));
    }
    auto* local_state = g_browser_process->local_state();
    if (!local_state) {
      return RespondNow(Error("Browser local state unavailable"));
    }
    local_state->SetString(tabs::kAuxVerticalTabInsertionPosition,
                           args()[0].GetString());
    return RespondNow(NoArguments());
  }
  if (method == "getDefaultZoom") {
    return RespondNow(
        WithArguments(profile()->GetZoomLevelPrefs()->GetDefaultZoomFactor()));
  }
  if (method == "setDefaultZoom") {
    if (!args()[0].is_double() && !args()[0].is_int()) {
      return RespondNow(Error("Zoom must be numeric"));
    }
    const double factor = args()[0].GetDouble();
    if (!std::isfinite(factor) || factor < 0.25 || factor > 5) {
      return RespondNow(Error("Zoom factor must be between 0.25 and 5"));
    }
    profile()->GetZoomLevelPrefs()->SetDefaultZoomLevelPref(
        blink::ZoomFactorToZoomLevel(factor));
    return RespondNow(NoArguments());
  }
  if (method == "getKeepTasksRunningState") {
    auto* local_state = g_browser_process->local_state();
    const bool can_set = local_state && local_state->IsUserModifiablePreference(
                                             prefs::kBackgroundModeEnabled);
    base::DictValue value;
    value.Set("supported", local_state != nullptr);
    value.Set("enabled", local_state && local_state->GetBoolean(
                                            prefs::kBackgroundModeEnabled));
    value.Set("canSet", can_set);
    value.Set("policyDisabled", local_state && !can_set);
    return RespondNow(WithArguments(std::move(value)));
  }
  if (method == "setKeepTasksRunningEnabled") {
    if (!args()[0].is_bool()) {
      return RespondNow(Error("Boolean value required"));
    }
    auto* local_state = g_browser_process->local_state();
    if (!local_state) {
      return RespondNow(Error("Browser local state unavailable"));
    }
    if (!local_state->IsUserModifiablePreference(prefs::kBackgroundModeEnabled)) {
      return RespondNow(Error("Keep tasks running setting is disabled by policy"));
    }
    local_state->SetBoolean(prefs::kBackgroundModeEnabled, args()[0].GetBool());
    return RespondNow(NoArguments());
  }
  if (method == "getAutoPipEnabled") {
    auto* map = HostContentSettingsMapFactory::GetForProfile(profile());
    return RespondNow(
        WithArguments(map->GetDefaultContentSetting(
                          ContentSettingsType::AUTO_PICTURE_IN_PICTURE,
                          nullptr) != CONTENT_SETTING_BLOCK));
  }
  if (method == "setAutoPipEnabled") {
    if (!args()[0].is_bool()) {
      return RespondNow(Error("Boolean value required"));
    }
    HostContentSettingsMapFactory::GetForProfile(profile())
        ->SetDefaultContentSetting(ContentSettingsType::AUTO_PICTURE_IN_PICTURE,
                                   args()[0].GetBool() ? CONTENT_SETTING_ALLOW
                                                       : CONTENT_SETTING_BLOCK);
    return RespondNow(NoArguments());
  }
  if (method == "getBrowserVersion") {
    return RespondNow(
        WithArguments(std::string(version_info::GetVersionNumber())));
  }
  if (method == "getSyncStatus") {
    base::DictValue value;
    value.Set("mode", "local");
    value.Set("available", false);
    return RespondNow(WithArguments(std::move(value)));
  }
  if (method == "checkForUpdates") {
    base::DictValue value;
    value.Set("version", std::string(version_info::GetVersionNumber()));
    value.Set("status", "disabled");
    value.Set("message", "Chromium " + std::string(version_info::GetVersionNumber()) +
        ". Updates are disabled for this local Aux build.");
    return RespondNow(WithArguments(std::move(value)));
  }
  if (method == "getDefaultBrowserState" || method == "setAsDefaultBrowser") {
    auto worker =
        base::MakeRefCounted<shell_integration::DefaultBrowserWorker>();
    if (setter) {
      const auto* policy = g_browser_process->local_state()->FindPreference(
          prefs::kDefaultBrowserSettingEnabled);
      if ((policy && policy->IsManaged() && !policy->GetValue()->GetBool()) ||
          !shell_integration::CanSetAsDefaultBrowser()) {
        return RespondNow(Error("Setting the default browser is unavailable or managed"));
      }
      worker->StartSetAsDefault(
          base::BindOnce(&AuxBrowserPreferencesFunction::DidDefaultBrowser,
                         base::RetainedRef(this)));
    } else {
      worker->StartCheckIsDefault(
          base::BindOnce(&AuxBrowserPreferencesFunction::DidDefaultBrowser,
                         base::RetainedRef(this)));
    }
    return RespondLater();
  }
  if (method == "getDockState" || method == "addToDock") {
    base::ThreadPool::PostTaskAndReplyWithResult(
        FROM_HERE, {base::MayBlock()},
        base::BindOnce(method == "addToDock" ? &AddAuxToDock
                                             : &ReadAuxDockState),
        base::BindOnce(&AuxBrowserPreferencesFunction::DidDock,
                       base::RetainedRef(this)));
    return RespondLater();
  }
  if (method == "getLanguageSettings") {
    language::LanguagePrefs languages(prefs);
    std::vector<std::string> codes;
    languages.GetAcceptLanguagesList(&codes);
    base::ListValue list;
    for (const auto& code : codes) {
      list.Append(code);
    }
    base::DictValue value;
    value.Set("preferredLanguages", std::move(list));
    value.Set("spellCheckEnabled",
              prefs->GetBoolean(spellcheck::prefs::kSpellCheckEnable));
    std::vector<std::string> supported;
    spellcheck_platform::GetAvailableLanguages(&supported);
    const bool spellcheck_supported = spellcheck_platform::SpellCheckerAvailable() &&
        std::ranges::any_of(codes, [&](const std::string& code) {
          return std::ranges::any_of(supported, [&](const std::string& language) {
            return base::EqualsCaseInsensitiveASCII(code, language);
          });
        });
    value.Set("spellCheckSupported", spellcheck_supported);
    return RespondNow(WithArguments(std::move(value)));
  }
  if (method == "getSupportedLanguages") {
    base::ListValue list;
    for (const auto& code : l10n_util::GetAcceptLanguagesForLocale(
             g_browser_process->GetApplicationLocale())) {
      base::DictValue value;
      value.Set("code", code);
      value.Set("displayName",
                base::UTF16ToUTF8(l10n_util::GetDisplayNameForLocale(
                    code, g_browser_process->GetApplicationLocale(), true)));
      value.Set("nativeDisplayName",
                base::UTF16ToUTF8(l10n_util::GetDisplayNameForLocale(
                    code, code, true)));
      list.Append(std::move(value));
    }
    base::DictValue result;
    result.Set("languages", std::move(list));
    return RespondNow(WithArguments(std::move(result)));
  }
  if (method == "setPreferredLanguages") {
    if (!args()[0].is_list() || args()[0].GetList().empty() ||
        args()[0].GetList().size() > 100) {
      return RespondNow(Error("A bounded nonempty language list is required"));
    }
    std::vector<std::string> codes;
    for (const auto& value : args()[0].GetList()) {
      if (!value.is_string() || value.GetString().empty() ||
          value.GetString().size() > 35 ||
          !std::ranges::all_of(value.GetString(), [](char c) {
            return base::IsAsciiAlpha(c) || base::IsAsciiDigit(c) || c == '-';
          })) {
        return RespondNow(Error("Invalid language code"));
      }
      if (std::ranges::find(codes, value.GetString()) == codes.end()) {
        codes.push_back(value.GetString());
      }
    }
    language::LanguagePrefs(prefs).SetUserSelectedLanguagesList(codes);
    return RespondNow(NoArguments());
  }
  if (method == "setSpellCheckEnabled") {
    if (!args()[0].is_bool()) {
      return RespondNow(Error("Boolean value required"));
    }
    if (prefs->IsManagedPreference(spellcheck::prefs::kSpellCheckEnable)) {
      return RespondNow(Error("Setting is managed"));
    }
    prefs->SetBoolean(spellcheck::prefs::kSpellCheckEnable,
                      args()[0].GetBool());
    return RespondNow(NoArguments());
  }
  if (method == "getSearchEngines") {
    auto* service = TemplateURLServiceFactory::GetForProfile(profile());
    service->Load();
    if (service->loaded()) {
      return RespondNow(WithArguments(SearchEngines(profile())));
    }
    // Load() is asynchronous when backed by KeywordWebDataService. Returning
    // the pre-load vector would disable the supplied chooser with empty data.
    search_engines_pending_ = true;
    search_engines_loaded_subscription_ = service->RegisterOnLoadedCallback(
        base::BindOnce(&AuxBrowserPreferencesFunction::DidLoadSearchEngines,
                       base::RetainedRef(this)));
    return RespondLater();
  }
  if (method == "setDefaultSearchEngine") {
    if (!args()[0].is_string()) {
      return RespondNow(Error("Engine identity required"));
    }
    auto* service = TemplateURLServiceFactory::GetForProfile(profile());
    if (!service->loaded()) {
      return RespondNow(Error("Search engines are still loading"));
    }
    for (const auto& engine : service->GetTemplateURLs()) {
      if (base::NumberToString(engine->id()) == args()[0].GetString()) {
        if (!engine->SupportsReplacement(service->search_terms_data())) {
          return RespondNow(Error("Engine does not support search"));
        }
        service->SetUserSelectedDefaultSearchProvider(engine);
        return RespondNow(NoArguments());
      }
    }
    return RespondNow(Error("Search engine no longer exists"));
  }
  return RespondNow(Error("Unsupported Aux preference method"));
}
void AuxBrowserPreferencesFunction::DidLoadSearchEngines() {
  search_engines_pending_ = false;
  search_engines_loaded_subscription_ = {};
  Respond(WithArguments(SearchEngines(profile())));
}
void AuxBrowserPreferencesFunction::OnBrowserContextShutdown() {
  if (!search_engines_pending_) {
    return;
  }
  // ExtensionFunction::Shutdown retains this instance through this cleanup.
  // Remove the callback before its profile/service can disappear; never take
  // a snapshot or report success for a retired profile.
  search_engines_pending_ = false;
  search_engines_loaded_subscription_ = {};
  Respond(Error("Profile closed before search engines finished loading"));
}
void AuxBrowserPreferencesFunction::DidDefaultBrowser(
    shell_integration::DefaultWebClientState state) {
  base::DictValue value;
  value.Set("isDefault", state == shell_integration::IS_DEFAULT);
  value.Set("known", state != shell_integration::UNKNOWN_DEFAULT);
  const auto* policy = g_browser_process->local_state()->FindPreference(
      prefs::kDefaultBrowserSettingEnabled);
  const bool policy_disabled = policy && policy->IsManaged() &&
      !policy->GetValue()->GetBool();
  value.Set("policyDisabled", policy_disabled);
  value.Set("canSet", !policy_disabled && shell_integration::CanSetAsDefaultBrowser());
  Respond(WithArguments(std::move(value)));
}
void AuxBrowserPreferencesFunction::DidDock(base::DictValue state) {
  Respond(WithArguments(std::move(state)));
}
}  // namespace extensions
