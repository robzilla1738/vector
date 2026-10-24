// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/aux/routing/routing_service.h"
#include <set>
#include <utility>
#include "base/functional/bind.h"
#include "base/memory/ref_counted.h"
#include "base/memory/weak_ptr.h"
#include "base/strings/utf_string_conversions.h"
#include "base/timer/timer.h"
#include "base/uuid.h"
#include "chrome/browser/aux/AuxBrowserPrivateRoots.h"
#include "chrome/browser/aux/AuxSelectedStateHome.h"
#include "chrome/browser/aux/organization/organization_profile_service.h"
#include "chrome/browser/aux/profile_identity.h"
#include "chrome/browser/aux/routing/routing_model.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/profiles/profile_window.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/navigator/browser_navigator.h"
#include "chrome/browser/ui/navigator/browser_navigator_params.h"
#include "chrome/browser/ui/views/frame/aux_organization_window_controller.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/browser_thread.h"
#include "net/base/url_util.h"
#include "base/strings/string_util.h"
#include "ui/base/window_open_disposition.h"
#include "url/origin.h"
namespace aux::routing {
namespace {
base::DictValue Error(std::string code) {
  return base::DictValue().Set("ok", false).Set("handled", true).Set("error", code);
}
PrefService* Local() { return g_browser_process ? g_browser_process->local_state() : nullptr; }
ProfileManager* Manager() { return g_browser_process ? g_browser_process->profile_manager() : nullptr; }
bool Admitted(Profile* p) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!p || !p->IsRegularProfile() || p->IsOffTheRecord() ||
      aux::IsProfileCookieRestorePending(p) || !Local() || !Manager() ||
      !Local()->FindPreference(kRulesPref) || !Local()->FindPreference(kProfileIndexPref)) return false;
  auto roots = aux::peer::CaptureActualChromiumBrowserRoots();
  const auto state = aux::peer::InspectNativeBrowserShutdown();
  return roots && roots->Revalidate() && state.admitted_generation &&
      !state.wrong_process && !state.admission_closed && !state.sequence_uncertain;
}
Decoded Config() {
  const auto& stored = Local()->GetDict(kRulesPref);
  if (stored.empty()) return {.config = Configuration{
      .revision = "62421b4e-3acf-4a12-9b12-bb26106339aa"}};
  return DecodeConfiguration(stored);
}
// This index is written only by RememberProfile from a native loaded Profile.
// It stores one native directory basename, never a renderer-supplied path.
ProfileAttributesEntry* Entry(const std::string& id) {
  const auto* leaf = Local()->GetDict(kProfileIndexPref).FindString(id);
  if (!leaf || leaf->empty() || leaf->find_first_of("/\\") != std::string::npos ||
      *leaf == "." || *leaf == "..") return nullptr;
  auto* entry = Manager()->GetProfileAttributesStorage().GetProfileAttributesWithPath(
      Manager()->user_data_dir().Append(base::FilePath::FromUTF8Unsafe(*leaf)));
  if (!entry || entry->IsOmitted() || entry->IsEphemeral() || entry->IsSigninRequired())
    return nullptr;
  auto* loaded = Manager()->GetProfileByPath(entry->GetPath());
  if (loaded && (!loaded->IsRegularProfile() || loaded->IsOffTheRecord() ||
                 aux::GetProfileId(loaded) != id)) return nullptr;
  return entry;
}
std::string ProfileSelector(const std::string& value) {
  if (base::Uuid::ParseLowercase(value).is_valid()) return Entry(value) ? value : "";
  std::string found;
  for (const auto row : Local()->GetDict(kProfileIndexPref)) {
    auto* e = Entry(row.first);
    if (e && base::UTF16ToUTF8(e->GetName()) == value) {
      if (!found.empty()) return "";
      found = row.first;
    }
  }
  return found;
}
std::string SpaceSelector(Profile* p, const std::string& value) {
  auto* owner = organization::OrganizationProfileServiceFactory::GetForProfileIfExists(p);
  if (!owner || !owner->EnsureCurrentBinding() || owner->loading() || !owner->model()) return "";
  const auto& spaces = owner->model()->snapshot().spaces;
  if (spaces.contains(value)) return value;
  std::string found;
  for (const auto& [id, space] : spaces) {
    if (space.name == value) {
      if (!found.empty()) return "";
      found = id;
    }
  }
  return found;
}
bool BypassAutomaticRouting(const GURL& url) {
  if (url.host() == "localhost" || url.host() == "[::1]" ||
      base::StartsWith(url.host_piece(), "127.")) return true;
  for (net::QueryIterator it(url); !it.IsAtEnd(); it.Advance()) {
    const auto key = base::ToLowerASCII(it.GetKey());
    if (key.find('%') != std::string::npos) return true;
    if (key == "code" || key == "state" || key == "access_token" ||
        key == "id_token" || key == "oauth_token" || key == "oauth_verifier")
      return true;
  }
  const auto fragment = base::ToLowerASCII(url.ref_piece());
  return fragment.find("access_token=") != std::string::npos ||
         fragment.find("id_token=") != std::string::npos;
}
class OpenRequest : public base::RefCounted<OpenRequest> {
 public:
  OpenRequest(Profile* p, Intent intent, base::DictValue resolved,
              base::OnceCallback<void(base::DictValue)> done)
      : source_(p->GetWeakPtr()), epoch_(aux::GetProfileCookieBindingEpoch(p)),
        generation_(aux::peer::InspectNativeBrowserShutdown().admitted_generation),
        intent_(std::move(intent)), resolved_(std::move(resolved)), done_(std::move(done)) {}
  void Start() {
    timer_.Start(FROM_HERE, base::Seconds(15),
        base::BindOnce(&OpenRequest::Fail, base::RetainedRef(this), "routing-timeout"));
    auto* entry = Entry(*resolved_.FindString("profileId"));
    if (!entry) { Fail("profile-unavailable"); return; }
    profiles::LoadProfileAsync(entry->GetPath(),
        base::BindOnce(&OpenRequest::Loaded, base::RetainedRef(this)));
  }
 private:
  friend class base::RefCounted<OpenRequest>;
  ~OpenRequest() = default;
  bool Current() const {
    if (!done_ || !source_ || !Admitted(source_.get()) ||
        aux::GetProfileCookieBindingEpoch(source_.get()) != epoch_ ||
        aux::peer::InspectNativeBrowserShutdown().admitted_generation != generation_)
      return false;
    const auto current = Config();
    return current.config && current.config->revision == *resolved_.FindString("revision");
  }
  void Fail(std::string reason) {
    if (!done_) return;
    timer_.Stop();
    std::move(done_).Run(Error(std::move(reason)));
  }
  void Loaded(Profile* p) {
    if (!Current()) { Fail("routing-cancelled"); return; }
    if (!Admitted(p) || aux::GetProfileId(p) != *resolved_.FindString("profileId") ||
        !Entry(aux::GetProfileId(p))) { Fail("profile-unavailable"); return; }
    target_ = p->GetWeakPtr();
    target_epoch_ = aux::GetProfileCookieBindingEpoch(p);
    profiles::OpenBrowserWindowForProfile(
        base::BindOnce(&OpenRequest::Window, base::RetainedRef(this)), false, false, false, p);
  }
  void Window(BrowserWindowInterface* browser) {
    if (!Current() || !target_ || !Admitted(target_.get()) || !browser ||
        browser->GetProfile() != target_.get() ||
        browser->GetType() != BrowserWindowInterface::TYPE_NORMAL ||
        aux::GetProfileCookieBindingEpoch(target_.get()) != target_epoch_ ||
        aux::GetProfileId(target_.get()) != *resolved_.FindString("profileId") ||
        !Entry(aux::GetProfileId(target_.get()))) { Fail("routing-cancelled"); return; }
    const std::string requested_space = *resolved_.FindString("spaceId");
    if (!requested_space.empty()) {
      const auto space = SpaceSelector(target_.get(), requested_space);
      auto* controller = aux::AuxOrganizationWindowController::FromBrowser(browser);
      if (space.empty() || !controller || !controller->IsProjectionReady() ||
          !controller->SelectSpace(space)) { Fail("space-unavailable-or-busy"); return; }
      resolved_.Set("spaceId", space);
    }
    NavigateParams params(browser, intent_.url, ui::PAGE_TRANSITION_LINK);
    params.disposition = WindowOpenDisposition::NEW_FOREGROUND_TAB;
    // External/CLI input is not a trusted browser-UI navigation or an opener.
    params.initiator_origin = url::Origin();
    Navigate(&params);
    if (!params.navigated_or_inserted_contents) { Fail("navigation-refused"); return; }
    timer_.Stop();
    resolved_.Set("opened", true);
    std::move(done_).Run(std::move(resolved_));
  }
  base::WeakPtr<Profile> source_, target_;
  const std::string epoch_;
  const uint64_t generation_;
  std::string target_epoch_;
  Intent intent_;
  base::DictValue resolved_;
  base::OnceCallback<void(base::DictValue)> done_;
  base::OneShotTimer timer_;
};
}  // namespace
void RememberProfile(Profile* p) {
  if (!Admitted(p)) return;
  auto* entry = Manager()->GetProfileAttributesStorage().GetProfileAttributesWithPath(p->GetPath());
  if (!entry || entry->IsOmitted() || entry->IsEphemeral() ||
      p->GetPath().DirName() != Manager()->user_data_dir()) return;
  auto index = Local()->GetDict(kProfileIndexPref).Clone();
  const auto id = aux::GetProfileId(p);
  if (!base::Uuid::ParseLowercase(id).is_valid()) return;
  const auto leaf = p->GetPath().BaseName().AsUTF8Unsafe();
  if (index.FindString(id)) return;  // Never silently retarget an existing UUID.
  index.Set(id, leaf);
  Local()->SetDict(kProfileIndexPref, std::move(index));
}
base::DictValue GetState(Profile* p) {
  if (!Admitted(p)) return Error("routing-authority-unavailable");
  auto config = Config();
  if (!config.config) return Error(config.error);  // Preserve unknown stored bytes.
  base::ListValue profiles;
  for (const auto row : Local()->GetDict(kProfileIndexPref)) {
    auto* entry = Entry(row.first);
    if (!entry) continue;
    base::ListValue spaces;
    if (auto* loaded = Manager()->GetProfileByPath(entry->GetPath())) {
      auto* owner = organization::OrganizationProfileServiceFactory::GetForProfileIfExists(loaded);
      if (owner && owner->EnsureCurrentBinding() && !owner->loading() && owner->model())
        for (const auto& [id, space] : owner->model()->snapshot().spaces)
          spaces.Append(base::DictValue().Set("id", id).Set("name", space.name));
    }
    profiles.Append(base::DictValue().Set("id", row.first)
        .Set("name", base::UTF16ToUTF8(entry->GetName())).Set("spaces", std::move(spaces)));
  }
  return base::DictValue().Set("ok", true).Set("configuration", EncodeConfiguration(*config.config))
      .Set("profiles", std::move(profiles));
}
base::DictValue ReplaceRules(Profile* p, const std::string& revision,
                            const base::DictValue& value) {
  if (!Admitted(p)) return Error("routing-authority-unavailable");
  const auto before = Config();
  if (!before.config) return Error(before.error);
  if (before.config->revision != revision) return Error("routing-revision-conflict");
  auto next = DecodeConfiguration(value);
  if (!next.config || next.config->revision != revision)
    return Error(next.config ? "routing-revision-conflict" : next.error);
  // Allow retaining an existing unavailable destination so it can be disabled or
  // removed; never introduce a new reference to an unavailable profile.
  for (const auto& rule : next.config->rules) {
    if (Entry(rule.destination.profile_id)) continue;
    bool existing = false;
    for (const auto& old : before.config->rules)
      existing |= old.id == rule.id && old.destination.profile_id == rule.destination.profile_id;
    if (!existing) return Error("profile-unavailable");
  }
  next.config->revision = base::Uuid::GenerateRandomV4().AsLowercaseString();
  Local()->SetDict(kRulesPref, EncodeConfiguration(*next.config));
  // Native PrefService owns persistence; this receipt means accepted in memory,
  // not a durable-write/drain certificate.
  return GetState(p).Set("persistence", "native-pref-queued");
}
base::DictValue Resolve(Profile* p, const Intent& intent) {
  if (!Admitted(p)) return Error("routing-authority-unavailable");
  if (!RoutableUrl(intent.url)) return Error("unsupported-url");
  auto config = Config();
  if (!config.config) return Error(config.error);
  auto* source_entry = Entry(aux::GetProfileId(p));
  if (!source_entry || source_entry->GetPath() != p->GetPath())
    return Error("profile-identity-unavailable");
  Destination destination;
  std::string rule_id;
  if (!intent.profile.empty()) {
    destination.profile_id = ProfileSelector(intent.profile);
    if (destination.profile_id.empty()) return Error("profile-missing-or-ambiguous");
  } else if (const auto* rule = BypassAutomaticRouting(intent.url) ? nullptr :
                 Match(*config.config, intent.url)) {
    destination = rule->destination;
    rule_id = rule->id;
  } else if (intent.authority == Authority::kCurrentProfile) {
    destination.profile_id = aux::GetProfileId(p);
  } else {
    return base::DictValue().Set("ok", true).Set("handled", false);
  }
  if (!Entry(destination.profile_id)) return Error("profile-unavailable");
  if (intent.authority == Authority::kCurrentProfile && destination.profile_id != aux::GetProfileId(p))
    return Error("destination-outside-authenticated-profile");
  if (!intent.space.empty()) destination.space_id = intent.space;
  std::string space_status = "none";
  if (!destination.space_id.empty()) {
    auto* loaded = Manager()->GetProfileByPath(Entry(destination.profile_id)->GetPath());
    if (loaded) {
      const auto space = SpaceSelector(loaded, destination.space_id);
      if (space.empty()) return Error("space-unavailable-or-busy");
      destination.space_id = space;
      space_status = "ready";
    } else {
      space_status = "requires-profile-load";
    }
  }
  return base::DictValue().Set("ok", true).Set("handled", true)
      .Set("spaceStatus", space_status)
      .Set("profileId", destination.profile_id).Set("spaceId", destination.space_id)
      .Set("ruleId", rule_id).Set("revision", config.config->revision);
}
void Open(Profile* p, Intent intent, base::OnceCallback<void(base::DictValue)> done) {
  auto resolved = Resolve(p, intent);
  if (!resolved.FindBool("ok").value_or(false) || !resolved.FindBool("handled").value_or(false)) {
    std::move(done).Run(std::move(resolved)); return;
  }
  auto request = base::MakeRefCounted<OpenRequest>(p, std::move(intent), std::move(resolved), std::move(done));
  request->Start();
}
}  // namespace aux::routing
