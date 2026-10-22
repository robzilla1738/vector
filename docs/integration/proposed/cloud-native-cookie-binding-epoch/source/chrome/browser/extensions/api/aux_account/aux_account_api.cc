// Copyright 2026 Aux Authors. All rights reserved.
// Account/profile and installation signing: native/apis-core A1, platform
// P2/P3.
#include "chrome/browser/extensions/api/aux_account/aux_account_api.h"

#include "base/base64.h"
#include "base/environment.h"
#include "base/memory/ref_counted.h"
#include "chrome/browser/aux/browser_platform.h"
#include "chrome/browser/extensions/extension_tab_util.h"
#include "chrome/browser/ui/aux/page_identity.h"
#include "chrome/browser/aux/profile_security_client.h"
#include "chrome/browser/net/system_network_context_manager.h"
#include "base/files/file_util.h"
#include "base/functional/bind.h"
#include "base/json/json_reader.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/utf_string_conversions.h"
#include "base/task/thread_pool.h"
#include "chrome/browser/aux/component_bootstrap.h"
#include "chrome/browser/aux/installation_auth.h"
#include "chrome/browser/aux/profile_state.h"
#include "chrome/browser/aux/profile_identity.h"
#include "components/prefs/pref_service.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/ui/navigator/browser_navigator.h"
#include "chrome/browser/ui/navigator/browser_navigator_params.h"
#include "content/public/browser/web_contents.h"
namespace extensions {
namespace {
base::ListValue ProfileSnapshot(Profile* current) {
  base::ListValue result;
  auto* manager = g_browser_process->profile_manager();
  int index = 0;
  for (auto* entry : manager->GetProfileAttributesStorage()
                         .GetAllProfilesAttributesSortedForDisplay()) {
    base::DictValue profile;
    profile.Set("profileId", aux::GetLoadedProfileIdForPath(entry->GetPath()));
    profile.Set("profilePath", entry->GetPath().value());
    profile.Set("profileIndex", index++);
    profile.Set("name", base::UTF16ToUTF8(entry->GetLocalProfileName()));
    profile.Set("isCurrent",
                entry->GetPath() == current->GetOriginalProfile()->GetPath());
    result.Append(std::move(profile));
  }
  return result;
}
base::ListValue ReadSecurity(base::FilePath home, base::ListValue profiles) {
  for (auto& value : profiles) {
    auto& row = value.GetDict();
    const auto* path = row.FindString("profilePath");
    if (!path) {
      continue;
    }
    const auto* id = row.FindString("profileId");
    const auto security = aux::ReadProfileSecurity(
        home, base::FilePath(*path), id ? *id : std::string());
    row.Set("isLocked", !security.allows_browsing());
    row.Set("configured", security.configured);
    row.Set("onboardingComplete", security.onboarding_complete);
    if (security.account_id) {
      row.Set("accountId", *security.account_id);
    }
  }
  return profiles;
}

class ProfileListRequest : public base::RefCounted<ProfileListRequest> {
 public:
  ProfileListRequest(base::FilePath home, base::ListValue rows,
                     base::OnceCallback<void(base::ListValue)> done)
      : home_(std::move(home)), rows_(std::move(rows)), done_(std::move(done)),
        authorization_(aux::BrowserPlatform::Get().authorization()) {}
  void Start() {
    if (auto text = base::Environment::Create()->GetVar("AUX_PORT")) {
      unsigned port = 0;
      if (!base::StringToUint(*text, &port) || !port || port > 65535) {
        Finish();
        return;
      }
      port_ = port;
    }
    Next();
  }
 private:
  friend class base::RefCounted<ProfileListRequest>;
  ~ProfileListRequest() = default;
  void Next() {
    if (index_ >= rows_.size() || !g_browser_process ||
        !g_browser_process->system_network_context_manager()) {
      Finish();
      return;
    }
    const auto* path = rows_[index_].GetDict().FindString("profilePath");
    const auto* id = rows_[index_].GetDict().FindString("profileId");
    if (!path || !id || id->empty()) { ++index_; Next(); return; }
    aux::FetchProfileSecurity(home_, base::FilePath(*path), *id,
        g_browser_process->system_network_context_manager()
            ->GetSharedURLLoaderFactory(), port_, authorization_,
        base::BindOnce(&ProfileListRequest::DidFetch, base::WrapRefCounted(this)));
  }
  void DidFetch(aux::ProfileSecurityState state) {
    auto& row = rows_[index_].GetDict();
    row.Set("bindingVersion", 1);
    const auto* id = row.FindString("profileId");
    if (id) row.Set("chromiumProfileId", *id);
    if (state.local_only.has_value() && state.binding_error.empty()) {
      row.Set("localOnly", *state.local_only);
    } else {
      row.Set("profileBindingError", state.binding_error.empty()
          ? "Profile identity could not be verified" : state.binding_error);
    }
    if (state.account_id) {
      row.Set("accountId", *state.account_id);
      row.Set("boundAccountId", *state.account_id);
    }
    if (!state.bound_user_id.empty()) row.Set("boundUserId", state.bound_user_id);
    row.Set("isLocked", !state.allows_browsing() ||
        authorization_ != aux::BrowserPlatform::Get().authorization());
    row.Set("configured", state.configured);
    row.Set("onboardingComplete", state.onboarding_complete);
    ++index_;
    Next();
  }
  void Finish() {
    if (authorization_ != aux::BrowserPlatform::Get().authorization()) {
      for (auto& value : rows_) value.GetDict().Set("isLocked", true);
    }
    if (done_) std::move(done_).Run(std::move(rows_));
  }
  const base::FilePath home_;
  base::ListValue rows_;
  base::OnceCallback<void(base::ListValue)> done_;
  const std::string authorization_;
  uint16_t port_ = 21520;
  size_t index_ = 0;
};

}  // namespace
base::ListValue ReadAuxProfileSecurity(base::FilePath home,
                                       base::ListValue profiles) {
  return ReadSecurity(std::move(home), std::move(profiles));
}
void FetchAuxProfileSecurity(base::FilePath home, base::ListValue profiles,
                            base::OnceCallback<void(base::ListValue)> done) {
  for (auto& value : profiles) value.GetDict().Set("isLocked", true);
  base::MakeRefCounted<ProfileListRequest>(std::move(home), std::move(profiles),
                                         std::move(done))->Start();
}
ExtensionFunction::ResponseAction AuxAccountFunction::RunAux() {
  const std::string method = name();
  if (method == "auxAccount.signDaemonAuthChallenge") {
    if (args().size() != 1 || !args()[0].is_string()) {
      return RespondNow(Error("A base64 challenge is required"));
    }
    const auto& challenge = args()[0].GetString();
    const auto bytes = base::Base64Decode(challenge);
    if (!bytes || bytes->size() != 32) {
      return RespondNow(Error("Challenge must contain 32 bytes"));
    }
    base::ThreadPool::PostTaskAndReplyWithResult(
        FROM_HERE, {base::MayBlock()},
        base::BindOnce(&aux::SignDaemonChallenge, aux::StateHome(), challenge),
        base::BindOnce(&AuxAccountFunction::DidSign, base::RetainedRef(this)));
    return RespondLater();
  }
  if (method == "auxAccount.getProfiles") {
    if (!args().empty()) return RespondNow(Error("This method takes no arguments"));
    auto* manager = g_browser_process ? g_browser_process->profile_manager() : nullptr;
    if (!manager) return RespondNow(Error("Profile manager is unavailable"));
    base::ListValue profiles;
    int index = 0;
    const auto current_path = profile()->GetOriginalProfile()->GetPath();
    for (auto* entry : manager->GetProfileAttributesStorage()
                            .GetAllProfilesAttributesSortedForDisplay()) {
      const int entry_index = index++;
      if (entry->IsOmitted()) continue;
      base::DictValue row;
      row.Set("profileIndex", entry_index);
      row.Set("name", base::UTF16ToUTF8(entry->GetName()));
      row.Set("isCurrent", entry->GetPath() == current_path);
      row.Set("isLocked", entry->IsSigninRequired());
      profiles.Append(std::move(row));
    }
    return RespondNow(WithArguments(std::move(profiles)));
  }
  if (method == "auxAccount.getProfileContext") {
    // Extension bindings may normalize an omitted optional argument to null.
    const bool has_draft_tab_id = !args().empty() && !args()[0].is_none();
    if (args().size() > 1 || (has_draft_tab_id && !args()[0].is_int()))
      return RespondNow(Error("Optional draft tab ID must be an integer"));
    auto* current = profile()->GetOriginalProfile();
    const auto id = aux::GetProfileId(current);
    if (id.empty()) return RespondNow(Error("Aux account profile context unavailable"));
    base::DictValue context;
    context.Set("profileId", id);
    context.Set("profilePath", current->GetPath().value());
    const bool regular = profile()->IsRegularProfile() &&
                         !profile()->IsOffTheRecord();
    context.Set("isRegularProfile", regular);
    context.Set("isOffTheRecord", profile()->IsOffTheRecord());
    if (regular)
      context.Set("cookieBindingEpoch",
                  aux::GetProfileCookieBindingEpoch(profile()));
    // Additive private draft identity; never replace the live DevTools target.
    // OTR documents retain only their original session-scoped draft storage.
    if (has_draft_tab_id && profile()->IsRegularProfile() &&
        !profile()->IsOffTheRecord() && args()[0].GetInt() > 0) {
      content::WebContents* tab = nullptr;
      if (ExtensionTabUtil::GetTabById(args()[0].GetInt(), profile(),
                                      false, &tab) &&
          tab && tab->GetBrowserContext() == profile()) {
        context.Set("draftPageId", aux::PageIdentity::GetOrCreate(profile(), tab));
      }
    }
    if (const auto index = aux::GetProfileIndex(current))
      context.Set("profileIndex", *index);
    auto* prefs = current->GetPrefs();
    const bool persisted =
        prefs->FindPreference("aside.account_has_persisted_session") &&
        prefs->GetBoolean("aside.account_has_persisted_session");
    const bool paused = prefs->FindPreference("aside.account_auth_paused") &&
                        prefs->GetBoolean("aside.account_auth_paused");
    context.Set("hasAccountSession", persisted);
    context.Set("accountAuthPaused", paused);
    if (prefs->FindPreference("aside.account_user_id")) {
      const auto& user = prefs->GetString("aside.account_user_id");
      if (!user.empty()) context.Set("boundUserId", user);
    }
    if (prefs->FindPreference("aside.account_id")) {
      const int account = prefs->GetInteger("aside.account_id");
      if (account >= 0) context.Set("boundAccountId", account);
    }
    return RespondNow(WithArguments(std::move(context)));
  }
  auto profiles = ProfileSnapshot(profile());
  if (method == "auxAccount.openProfileRoute") {
    if (args().size() != 1 || !args()[0].is_dict()) {
      return RespondNow(Error("Profile route options are required"));
    }
    const auto& options = args()[0].GetDict();
    const auto* path = options.FindString("profilePath");
    const auto* id = options.FindString("profileId");
    const auto* target = options.FindString("url");
    const auto* source = options.FindString("sourceUrl");
    if (!path || !id || !target || !source) {
      return RespondNow(Error("Profile route identity is incomplete"));
    }
    const GURL url(*target), source_url(*source);
    if (!url.is_valid() ||
        (!url.SchemeIsHTTPOrHTTPS() && !url.SchemeIs("chrome-extension")) ||
        !source_url.is_valid() || source_url.host() != extension_id()) {
      return RespondNow(Error("Profile route is not allowed"));
    }
    if (url.SchemeIs("chrome-extension") &&
        url.host() != aux::kAgentExtensionId) {
      return RespondNow(Error("Extension route is not allowed"));
    }
    bool found = false;
    for (const auto& value : profiles) {
      if (value.GetDict().FindString("profilePath") &&
          *value.GetDict().FindString("profilePath") == *path &&
          *value.GetDict().FindString("profileId") == *id) {
        found = true;
      }
    }
    if (!found) {
      return RespondNow(Error("Profile is not registered"));
    }
    // Opening a registered browser profile is not a Vault-unlock operation.
    // The exact native path/ID and allowed destination were validated above;
    // the supplied Agent resolves its actual account and authenticates RPCs.
    if (profile()->IsOffTheRecord()) {
      return RespondNow(Error("Cross-profile routes are unavailable in private browsing"));
    }
    auto* target_profile =
        g_browser_process->profile_manager()->GetProfileByPath(base::FilePath(*path));
    if (!target_profile) {
      return RespondNow(Error("Selected profile is not loaded"));
    }
    NavigateParams navigation(target_profile, url, ui::PAGE_TRANSITION_LINK);
    navigation.disposition = WindowOpenDisposition::NEW_FOREGROUND_TAB;
    Navigate(&navigation);
    return RespondNow(WithArguments(navigation.navigated_or_inserted_contents != nullptr));
  }
  if (!args().empty()) {
    return RespondNow(Error("This method takes no arguments"));
  }
  FetchAuxProfileSecurity(aux::StateHome(), std::move(profiles),
      base::BindOnce(&AuxAccountFunction::DidReadProfiles,
                     base::RetainedRef(this)));
  return RespondLater();
}
void AuxAccountFunction::DidSign(std::optional<std::string> signature) {
  if (!signature) {
    Respond(Error("Installation signing credential is missing or unsafe"));
    return;
  }
  base::DictValue result;
  result.Set("signedChallenge", *signature);
  Respond(WithArguments(std::move(result)));
}
void AuxAccountFunction::DidReadProfiles(base::ListValue profiles) {
  if (!browser_context()) {
    Respond(Error("Profile is no longer available"));
    return;
  }
  if (std::string_view(name()) == "auxAccount.getProfiles") {
    Respond(WithArguments(std::move(profiles)));
    return;
  }
  for (auto& value : profiles) {
    if (value.GetDict().FindBool("isCurrent").value_or(false)) {
      const auto& row = value.GetDict();
      if (const auto* error = row.FindString("profileBindingError")) {
        Respond(Error(*error));
        return;
      }
      if (!row.FindBool("localOnly").has_value()) {
        Respond(Error("Profile identity could not be verified"));
        return;
      }
      value.GetDict().Set(
          "browserMode", profile()->IsOffTheRecord() ? "incognito" : "default");
      Respond(WithArguments(std::move(value)));
      return;
    }
  }
  Respond(Error("Calling profile is no longer registered"));
}
}  // namespace extensions
