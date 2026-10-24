"""Project exact current profile/window callback fixes; never edit native inputs."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
files, patch = [], []
sha = lambda data: hashlib.sha256(data).hexdigest()


def project(name, edits):
    original = (ROOT / name).read_bytes()
    text = original.decode()
    anchors = []
    for before, after in edits:
        assert text.count(before) == 1, (name, before[:100], text.count(before))
        text = text.replace(before, after)
        anchors.append({'find': before, 'replace': after, 'count': 1})
    target = HERE / 'source' / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text)
    files.append({'path': name, 'inputSha256': sha(original), 'outputSha256': sha(text.encode()),
                  'output': str(target), 'anchors': anchors})
    patch.extend(difflib.unified_diff(original.decode().splitlines(True), text.splitlines(True),
                                    fromfile='a/' + name, tofile='b/' + name))


prefix = 'chrome/browser/ui/views/frame/'
project(prefix + 'aux_profile_switch_request.cc', [
    ('namespace aux {\nnamespace {\nvoid ReportCurrentSwitchFailure(',
     '''namespace aux {
namespace {
Browser* CurrentSwitchWindow(base::WeakPtr<BrowserWindowInterface> window,
                             base::WeakPtr<Profile> expected) {
  const auto* unload = window ? UnloadController::From(window.get()) : nullptr;
  if (!window || !expected || window->GetProfile() != expected.get() || !window->GetWindow() ||
      !unload || unload->is_attempting_to_close_browser() || unload->is_delete_scheduled() ||
      browser_shutdown::HasShutdownStarted() || browser_shutdown::IsTryingToQuit()) return nullptr;
  return static_cast<Browser*>(window.get());
}
Browser* CurrentSwitchResult(base::WeakPtr<BrowserWindowInterface> window,
                             base::WeakPtr<Profile> expected, uint64_t generation) {
  auto* browser = CurrentSwitchWindow(window, expected);
  const auto* state = browser ? BrowserInitState::From(browser) : nullptr;
  return state && state->IsCurrentAuxProfileSwitchRequest(generation) ? browser : nullptr;
}
void ReportCurrentSwitchFailure('''),
    ('  const uint64_t generation = state->BeginAuxProfileSwitchRequest();\n  if (target ==',
     '  const uint64_t generation = state->BeginAuxProfileSwitchRequest();\n'
     '  const auto source_weak = profile->GetWeakPtr();\n  if (target =='),
    ('      std::move(completion).Run(sender_weak ? sender : nullptr);\n    }\n    return;\n  }\n  state->KeepAuxProfileSwitchProfileAlive(profile);',
     '      std::move(completion).Run(CurrentSwitchResult(sender_weak, source_weak, generation));\n'
     '    }\n    return;\n  }\n  state->KeepAuxProfileSwitchProfileAlive(profile);'),
    ('                         sender_weak, profile->GetWeakPtr(), generation,',
     '                         sender_weak, source_weak, generation,'),
    ('        recovered->GetWindow()->Activate();\n        // Activation can dispatch observers and close either native window.',
     '''        recovered->GetWindow()->Activate();
        const auto current_recovery = [&]() -> Browser* {
          return CurrentSwitchResult(sender_weak, source, generation)
              ? CurrentSwitchWindow(recovered_weak, target_weak) : nullptr;
        };
        // Activation can dispatch observers and close or rebind either native window.'''),
    ('        if (notify && recovered_weak && recovered_weak->GetWindow()) {',
     '        if (notify && current_recovery()) {'),
    ('        if (completion) std::move(completion).Run(\n            recovered_weak ? static_cast<Browser*>(recovered_weak.get()) : nullptr);',
     '        if (completion) std::move(completion).Run(current_recovery());'),
    ('    std::move(completion).Run(sender_weak ? sender : nullptr);\n  }\n}\n\nvoid ProfileSwitchRequest::ContinueAfterCacheSetup(',
     '    std::move(completion).Run(CurrentSwitchResult(sender_weak, target_weak, generation));\n'
     '  }\n}\n\nvoid ProfileSwitchRequest::ContinueAfterCacheSetup('),
])

workspace = (ROOT / prefix / 'aux_profile_switch_workspaces.cc').read_text()
start = workspace.index('BrowserWindowInterface* GetOrCreateProfileSwitchWorkspace(')
end = workspace.index('void PrepareProfileSwitchWorkspace(', start)
project(prefix + 'aux_profile_switch_workspaces.cc', [
    ('  if (!loaded || loaded->IsOffTheRecord()) {',
     '  if (!loaded || !loaded->IsRegularProfile() || loaded->IsOffTheRecord()) {'),
    ('  BrowserInitState::From(owner)->KeepAuxProfileSwitchProfileAlive(target);\n  BrowserInitState::From(cache)->KeepAuxProfileSwitchProfileAlive(target);',
     '''  const auto owner_weak = owner->GetWeakPtr(), cache_weak = cache->GetWeakPtr();
  const auto target_weak = target->GetWeakPtr();
  auto* owner_state = BrowserInitState::From(owner);
  if (!owner_state) return;
  owner_state->KeepAuxProfileSwitchProfileAlive(target);
  if (!owner_weak || !cache_weak || !target_weak) return;
  if (auto* cache_state = BrowserInitState::From(cache_weak.get()))
    cache_state->KeepAuxProfileSwitchProfileAlive(target_weak.get());'''),
    (workspace[start:end], '''BrowserWindowInterface* GetOrCreateProfileSwitchWorkspace(
    BrowserWindowInterface* owner, Profile* target, bool ensure_tab) {
  if (!owner || !target || !g_browser_process || !g_browser_process->profile_manager() ||
      owner->GetType() != BrowserWindowInterface::TYPE_NORMAL || !owner->GetProfile() ||
      !owner->GetProfile()->IsRegularProfile() || owner->GetProfile()->IsOffTheRecord() ||
      IsClosing(owner) || browser_shutdown::HasShutdownStarted() ||
      browser_shutdown::IsTryingToQuit() || g_browser_process->IsShuttingDown()) return nullptr;
  const auto* source_state = BrowserInitState::From(owner);
  if (!source_state || source_state->is_aux_profile_switch_cache()) return nullptr;
  target = target->GetOriginalProfile();
  if (!target || !target->IsRegularProfile() || target->IsOffTheRecord() || target->GetPath().empty() ||
      profiles::IsProfileLocked(target->GetPath()) ||
      g_browser_process->profile_manager()->GetProfileByPath(target->GetPath()) != target) return nullptr;
  const auto owner_weak = owner->GetWeakPtr();
  const auto source_profile = owner->GetProfile()->GetWeakPtr(), target_weak = target->GetWeakPtr();
  const uint64_t workspace = source_state->aux_profile_switch_workspace_id();
  const auto current = [&](base::WeakPtr<BrowserWindowInterface> cache) {
    if (!owner_weak || !source_profile || !target_weak || !cache ||
        owner_weak->GetProfile() != source_profile.get() || cache->GetProfile() != target_weak.get() ||
        IsClosing(owner_weak.get()) || IsClosing(cache.get()) || browser_shutdown::HasShutdownStarted() ||
        browser_shutdown::IsTryingToQuit() || !g_browser_process || g_browser_process->IsShuttingDown() ||
        !g_browser_process->profile_manager() || profiles::IsProfileLocked(target_weak->GetPath()) ||
        g_browser_process->profile_manager()->GetProfileByPath(target_weak->GetPath()) != target_weak.get()) return false;
    const auto* source = BrowserInitState::From(owner_weak.get());
    const auto* destination = BrowserInitState::From(cache.get());
    return source && !source->is_aux_profile_switch_cache() && source->aux_profile_switch_workspace_id() == workspace &&
        destination && destination->is_aux_profile_switch_cache() &&
        destination->aux_profile_switch_workspace_id() == workspace;
  };
  if (auto* cache = FindProfileSwitchWorkspace(owner, target->GetPath())) {
    const auto cache_weak = cache->GetWeakPtr();
    if (!current(cache_weak)) return nullptr;
    KeepTargetAlive(owner_weak.get(), cache_weak.get(), target_weak.get());
    return current(cache_weak) ? cache_weak.get() : nullptr;
  }
  BrowserWindowCreateParams params(BrowserWindowInterface::TYPE_NORMAL, target, /*from_user_gesture=*/false);
  params.omit_from_session_restore = true;
  params.should_trigger_session_restore = false;
  params.aux_profile_switch_cache = true;
  params.aux_profile_switch_workspace_id = workspace;
  params.vertical_tab_strip_collapsed = false;
  if (const auto* strip = tabs::VerticalTabStripStateController::From(owner))
    params.vertical_tab_strip_uncollapsed_width = strip->GetUncollapsedWidth();
  else params.vertical_tab_strip_uncollapsed_width = source_state->get_vertical_tabs_initial_uncollapsed_width();
  auto* cache = CreateBrowserWindow(std::move(params));
  if (!cache) return nullptr;
  const auto cache_weak = cache->GetWeakPtr();
  // Constructors/attachment observers may reenter close or profile switching.
  // Keep an unfinished cache intact; never borrow another window's contents.
  if (!current(cache_weak)) return nullptr;
  if (ensure_tab && cache_weak->GetTabStripModel() && cache_weak->GetTabStripModel()->empty()) {
    chrome::AddAndReturnTabAt(cache_weak.get(), GURL(), -1, /*foreground=*/true, std::nullopt, /*pinned=*/false);
    if (!current(cache_weak)) return nullptr;
  }
  KeepTargetAlive(owner_weak.get(), cache_weak.get(), target_weak.get());
  return current(cache_weak) ? cache_weak.get() : nullptr;
}
'''),
    ('            !BrowserInitState::From(candidate)->is_aux_profile_switch_cache()) {',
     '            BrowserInitState::From(candidate) &&\n            !BrowserInitState::From(candidate)->is_aux_profile_switch_cache()) {'),
])

prefix = 'chrome/browser/aux/'
project(prefix + 'account_profile_avatar.h', [
    ('#include <string>', '#include <cstdint>\n#include <string>'),
    ('  void DidFetch(std::string url, const gfx::Image& image,',
     '  void DidFetch(std::string url, uint64_t generation, std::string epoch, const gfx::Image& image,'),
    ('  std::string requested_url_;', '  std::string requested_url_;\n  uint64_t request_generation_ = 0;'),
])
project(prefix + 'account_profile_avatar.cc', [
    ('  if (!weak || requested_url_ != picture_url) return;',
     '  if (!weak || requested_url_ != picture_url || request_generation_ != generation) return;'),
    ('#include "chrome/browser/aux/account_profile_prefs.h"',
     '#include "chrome/browser/aux/account_profile_prefs.h"\n#include "chrome/browser/aux/profile_identity.h"'),
    ('void AccountProfileAvatar::ClearOwnedPicture() {',
     'void AccountProfileAvatar::ClearOwnedPicture() {\n  ++request_generation_;'),
    ('void AccountProfileAvatar::Refresh(const std::string& picture_url) {\n  requested_url_ = picture_url;',
     'void AccountProfileAvatar::Refresh(const std::string& picture_url) {\n  const uint64_t generation = ++request_generation_;\n  requested_url_ = picture_url;'),
    ('  image_fetcher::ImageFetcherParams params(kAvatarAnnotation, "AuxProfileAvatar");',
     '  const auto epoch = GetProfileCookieBindingEpoch(profile_);\n'
     '  if (epoch.empty() || IsProfileCookieRestorePending(profile_)) return;\n'
     '  image_fetcher::ImageFetcherParams params(kAvatarAnnotation, "AuxProfileAvatar");'),
    ('      weak_.GetWeakPtr(), picture_url), std::move(params));',
     '      weak_.GetWeakPtr(), picture_url, generation, epoch), std::move(params));'),
    ('    std::string url, const gfx::Image& image,\n    const image_fetcher::RequestMetadata&) {\n  if (!profile_ || !storage_ || requested_url_ != url) return;',
     '    std::string url, uint64_t generation, std::string epoch, const gfx::Image& image,\n'
     '    const image_fetcher::RequestMetadata&) {\n'
     '  if (!profile_ || !storage_ || requested_url_ != url || request_generation_ != generation ||\n'
     '      epoch.empty() || GetProfileCookieBindingEpoch(profile_) != epoch || IsProfileCookieRestorePending(profile_)) return;'),
    ('  if (!weak || requested_url_ != url) return;\n  if (auto* current = Entry()) current->SetIsUsingGAIAPicture(!image.IsEmpty());',
     '  if (!weak || requested_url_ != url || request_generation_ != generation ||\n'
     '      GetProfileCookieBindingEpoch(profile_) != epoch || IsProfileCookieRestorePending(profile_)) return;\n'
     '  if (auto* current = Entry()) current->SetIsUsingGAIAPicture(!image.IsEmpty());'),
])

project(prefix + 'account_profile_updater.cc', [
    ('#include "components/prefs/pref_service.h"',
     '#include "components/prefs/pref_service.h"\n#include "components/prefs/pref_change_registrar.h"'),
    ('    storage_observation_.Observe(storage);\n    cookie_restore_subscription_',
     '    storage_observation_.Observe(storage);\n'
     '    identity_prefs_.Init(profile->GetPrefs());\n'
     '    if (profile->GetPrefs()->FindPreference("aux.profile_id"))\n'
     '      identity_prefs_.Add("aux.profile_id", base::BindRepeating(\n'
     '          &AccountProfileUpdater::Refresh, weak_.GetWeakPtr(), true));\n'
     '    cookie_restore_subscription_'),
    ('    authorization_subscription_ = {};\n    cookie_restore_subscription_',
     '    authorization_subscription_ = {};\n    identity_prefs_.Reset();\n    cookie_restore_subscription_'),
    ('  AccountProfileAvatar avatar_;',
     '  AccountProfileAvatar avatar_;\n  PrefChangeRegistrar identity_prefs_;'),
    ('    const auto home = StateHome();\n    if (home.empty()) {\n      DidRead(allow_binding, std::nullopt);\n      return;\n    }\n    if (watcher_.is_null()) StartWatch(home);\n    base::ThreadPool::PostTaskAndReplyWithResult(FROM_HERE, {base::MayBlock()},\n        base::BindOnce(&ReadPrivateAccountRegistry, home),\n        base::BindOnce(&AccountProfileUpdater::DidRead, weak_.GetWeakPtr(),\n                       allow_binding));',
     '''    const auto home = StateHome();
    const auto binding_epoch = GetProfileCookieBindingEpoch(profile_);
    const auto restore_epoch = GetProfileCookieRestoreEpoch(profile_);
    if (binding_epoch.empty() || restore_epoch.empty()) { reading_ = false; return; }
    if (home.empty()) { DidRead(allow_binding, home, binding_epoch, restore_epoch, std::nullopt); return; }
    if (!watcher_.is_null() && watch_home_ != home) { ++watch_generation_; watcher_.Reset(); }
    if (watcher_.is_null()) StartWatch(home);
    const bool posted = base::ThreadPool::PostTaskAndReplyWithResult(FROM_HERE, {base::MayBlock()},
        base::BindOnce(&ReadPrivateAccountRegistry, home),
        base::BindOnce(&AccountProfileUpdater::DidRead, weak_.GetWeakPtr(),
                       allow_binding, home, binding_epoch, restore_epoch));
    // False is a definite non-start, not a failed read or projection. Do not
    // leave all later native refreshes stuck behind reading_ during shutdown.
    if (!posted) reading_ = false;'''),
    ('    if (!weak) return std::nullopt;\n    auto* prefs = profile_->GetPrefs();',
     '    if (!weak || input.profile_id.empty()) return std::nullopt;\n    auto* prefs = profile_->GetPrefs();'),
    ('    const uint64_t generation = ++watch_generation_;\n    watcher_ =',
     '    const uint64_t generation = ++watch_generation_;\n    watch_home_ = home;\n    watcher_ ='),
    ('                                weak_.GetWeakPtr())));\n    watcher_.AsyncCall',
     '                                weak_.GetWeakPtr(), generation)));\n    watcher_.AsyncCall'),
    ('  void RegistryChanged(bool error) {\n    if (error) {',
     '  void RegistryChanged(uint64_t generation, bool error) {\n    if (generation != watch_generation_) return;\n    if (error) {'),
    ('  void DidRead(bool allow_binding, std::optional<base::DictValue> state) {',
     '  void DidRead(bool allow_binding, base::FilePath home, std::string binding_epoch,\n'
     '               std::string restore_epoch, std::optional<base::DictValue> state) {'),
    ('    const bool stale_cookie_read = std::exchange(discard_cookie_read_, false);',
     '    const bool stale_cookie_read = std::exchange(discard_cookie_read_, false) ||\n'
     '        home != StateHome() || binding_epoch != GetProfileCookieBindingEpoch(profile_) ||\n'
     '        restore_epoch != GetProfileCookieRestoreEpoch(profile_);'),
    ('  uint64_t watch_generation_ = 0;', '  uint64_t watch_generation_ = 0;\n  base::FilePath watch_home_;'),
])

prefix = 'chrome/browser/ui/views/frame/'
project(prefix + 'aux_sidebar_view.cc', [
    ('#include "chrome/browser/ui/browser_commands.h"',
     '#include "chrome/browser/ui/browser_commands.h"\n#include "chrome/browser/ui/browser_init_state.h"'),
    ('  if (!sender || !sender->GetProfile() ||\n      sender->GetProfile()->IsOffTheRecord()) {',
     '  if (!sender || !sender->GetProfile() ||\n      !sender->GetProfile()->IsRegularProfile() || sender->GetProfile()->IsOffTheRecord()) {'),
    ('  ProfileManager::CreateMultiProfileAsync(\n      name, /*icon_index=*/26, /*is_hidden=*/false,',
     '  auto* state = BrowserInitState::From(sender.get());\n'
     '  if (!state || state->is_aux_profile_switch_cache()) return;\n'
     '  const auto source = sender->GetProfile()->GetWeakPtr();\n'
     '  const auto epoch = aux::GetProfileCookieBindingEpoch(source.get());\n'
     '  if (epoch.empty() || aux::IsProfileCookieRestorePending(source.get())) return;\n'
     '  const uint64_t generation = state->BeginAuxProfileSwitchRequest();\n'
     '  ProfileManager::CreateMultiProfileAsync(\n      name, /*icon_index=*/26, /*is_hidden=*/false,'),
    ('          [](base::WeakPtr<BrowserWindowInterface> browser, Profile* profile) {\n            if (browser && profile) {\n              DispatchSelectedProfile(browser, profile->GetPath());\n            }\n          },\n          sender));',
     """          [](base::WeakPtr<BrowserWindowInterface> browser,
             base::WeakPtr<Profile> source, std::string epoch,
             uint64_t generation, Profile* profile) {
            const auto current = [&]() {
              const auto* state = browser ? BrowserInitState::From(browser.get()) : nullptr;
              return browser && source && browser->GetProfile() == source.get() && state &&
                  state->IsCurrentAuxProfileSwitchRequest(generation) &&
                  aux::GetProfileCookieBindingEpoch(source.get()) == epoch &&
                  !aux::IsProfileCookieRestorePending(source.get());
            };
            if (!current() || !profile) return;
            const auto target = profile->GetWeakPtr();
            const auto identity = aux::InitializeFreshProfileIdentity(profile);
            if (current() && target &&
                identity != aux::FreshProfileIdentityInitialization::kUnavailable)
              DispatchSelectedProfile(browser, target->GetPath());
          },
          sender, source, epoch, generation));"""),
    ('// Supplied040fe7a4 receives the actual weak sender, not a global active window.',
     '''// Menu retirement is asynchronous. An old command must not retarget a
// window that switched profiles/accounts before the posted action executes.
void RunProfileMenuAction(base::WeakPtr<BrowserWindowInterface> sender,
                          base::WeakPtr<Profile> source, std::string epoch,
                          base::OnceClosure action) {
  if (!sender || !source || epoch.empty() || sender->GetProfile() != source.get() ||
      aux::GetProfileCookieBindingEpoch(source.get()) != epoch ||
      aux::IsProfileCookieRestorePending(source.get())) return;
  std::move(action).Run();
}
// Supplied040fe7a4 receives the actual weak sender, not a global active window.'''),
    ('        browser_(browser), sender_(browser->GetWeakPtr()) {',
     '        browser_(browser), sender_(browser->GetWeakPtr()), source_(browser->GetProfile()->GetWeakPtr()),\n'
     '        source_epoch_(aux::GetProfileCookieBindingEpoch(browser->GetProfile())) {'),
    ('          FROM_HERE, std::move(pending_switch_));',
     '          FROM_HERE, base::BindOnce(&RunProfileMenuAction, sender_, source_, source_epoch_,\n'
     '                                    std::move(pending_switch_)));'),
    ('  const base::WeakPtr<BrowserWindowInterface> sender_;\n  raw_ptr<views::View> contents_',
     '  const base::WeakPtr<BrowserWindowInterface> sender_;\n'
     '  const base::WeakPtr<Profile> source_;\n  const std::string source_epoch_;\n'
     '  raw_ptr<views::View> contents_'),
    ('        owner_(browser),\n        path_(std::move(path)) {',
     '        owner_(browser),\n        path_(std::move(path)),\n'
     '        source_(browser->GetProfile()->GetWeakPtr()),\n'
     '        source_epoch_(aux::GetProfileCookieBindingEpoch(browser->GetProfile())) {'),
    ('          FROM_HERE, std::move(pending_));',
     '          FROM_HERE, base::BindOnce(&RunProfileMenuAction, browser_, source_, source_epoch_,\n'
     '                                    std::move(pending_)));'),
    ('  const base::FilePath path_;\n  raw_ptr<views::View> contents_',
     '  const base::FilePath path_;\n  const base::WeakPtr<Profile> source_;\n'
     '  const std::string source_epoch_;\n  raw_ptr<views::View> contents_'),
])

project('chrome/browser/aux/profile_identity.h', [
    ('// Existing nonempty IDs are retained; only the actual loaded profile is mutated.\nstd::string GetProfileId(Profile* profile);',
     """// Read-only: returns unavailable for an absent/unregistered ID; never invents one.
std::string GetProfileId(Profile* profile);
enum class FreshProfileIdentityInitialization {
  kExisting,
  kCreatedPending,
  kUnavailable,
};
// Creation lifecycle only. Requires the actual admitted, newly created native
// preference store and no existing user ID. kCreatedPending means SetString
// accepted into that store, not durable commit or a browser-drain certificate.
FreshProfileIdentityInitialization InitializeFreshProfileIdentity(Profile* profile);"""),
])
identity = (ROOT / 'chrome/browser/aux/profile_identity.cc').read_text()
start = identity.index('std::string GetProfileId(Profile* profile) {')
end = identity.index('std::string GetLoadedProfileIdForPath', start)
project('chrome/browser/aux/profile_identity.cc', [
    ('#include "chrome/browser/profiles/profile_manager.h"',
     '#include "chrome/browser/profiles/profile_manager.h"\n#include "chrome/browser/ui/aux_feature_lifecycle.h"'),
    (identity[start:end], """std::string GetProfileId(Profile* profile) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!profile) return {};
  auto* prefs = profile->GetOriginalProfile()->GetPrefs();
  return prefs && prefs->FindPreference("aux.profile_id")
      ? prefs->GetString("aux.profile_id") : std::string();
}
FreshProfileIdentityInitialization InitializeFreshProfileIdentity(Profile* profile) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  using Result = FreshProfileIdentityInitialization;
  if (!profile || !profile->IsRegularProfile() || profile->IsOffTheRecord() ||
      profile->GetOriginalProfile() != profile) return Result::kUnavailable;
  auto* prefs = profile->GetPrefs();
  const auto* pref = prefs ? prefs->FindPreference("aux.profile_id") : nullptr;
  if (!pref) return Result::kUnavailable;
  // Preserve all nonempty existing identities, including legacy formats.
  if (!prefs->GetString("aux.profile_id").empty()) return Result::kExisting;
  // IsNewProfile() also returns true during Chrome first-run. The actual store
  // initialization result and absent user value are the stronger fresh facts.
  if (prefs->GetInitializationStatus() != PrefService::INITIALIZATION_STATUS_CREATED_NEW_PREF_STORE ||
      prefs->GetUserPrefValue("aux.profile_id") || !pref->IsUserModifiable() ||
      !IsAuxLocalProfileAdmitted(profile)) return Result::kUnavailable;
  const auto alive = profile->GetWeakPtr();
  const auto id = base::Uuid::GenerateRandomV4().AsLowercaseString();
  // Preserve the real PrefService writer path. This queues persistence and
  // deliberately does not settle any native ticket or assert durable success.
  prefs->SetString("aux.profile_id", id);
  return alive && GetProfileId(alive.get()) == id
      ? Result::kCreatedPending : Result::kUnavailable;
}
"""),
])
project('chrome/browser/aux/profile_gate.cc', [
    ('#include "chrome/browser/aux/ntp_prerender_service.h"',
     '#include "chrome/browser/aux/ntp_prerender_service.h"\n#include "chrome/browser/aux/profile_identity.h"'),
    ('  if (!stopping && profile)\n    SetNtpPrerenderEnabled(profile, true);',
     '  if (!stopping && profile) {\n'
     '    const auto alive = profile->GetWeakPtr();\n'
     '    InitializeFreshProfileIdentity(profile);\n'
     '    if (alive) SetNtpPrerenderEnabled(alive.get(), true);\n  }'),
])
project('chrome/browser/aux/organization/organization_profile_service.cc', [
    ('    if (aux::features::IsNativeFeatureIoAdmissionClosed() || !profile_ || lifetime_->revoked.load() || profile_id != profile_id_ ||',
     '    if (aux::features::IsNativeFeatureIoAdmissionClosed() || !profile_ || profile_id_.empty() || lifetime_->revoked.load() || profile_id != profile_id_ ||'),
    ('OrganizationProfileService* OrganizationProfileServiceFactory::GetForProfile(Profile* profile) {\n  if (!profile || !profile->IsRegularProfile() || profile->IsOffTheRecord())',
     'OrganizationProfileService* OrganizationProfileServiceFactory::GetForProfile(Profile* profile) {\n'
     '  // Creation may precede the admitted fresh-identity hook. Do not cache an\n'
     '  // owner for an empty ID; a later real lookup can create it after setup.\n'
     '  if (!profile || !profile->IsRegularProfile() || profile->IsOffTheRecord() ||\n'
     '      aux::GetProfileId(profile).empty())'),
])

project('chrome/browser/ui/views/frame/aux_organization_window_controller.h', [
    ('#include "base/values.h"',
     '#include "base/values.h"\n#include "components/prefs/pref_change_registrar.h"'),
    ('  void Bind();', '  void BindFreshIdentity();\n  void Bind();'),
    ('  base::RepeatingTimer cleanup_timer_;',
     '  base::RepeatingTimer cleanup_timer_;\n  PrefChangeRegistrar fresh_identity_;'),
])
project('chrome/browser/ui/views/frame/aux_organization_window_controller.cc', [
    ('#include "chrome/browser/aux/ntp_prerender_service.h"',
     '#include "chrome/browser/aux/ntp_prerender_service.h"\n#include "chrome/browser/aux/profile_identity.h"\n#include "components/prefs/pref_service.h"'),
    ('  shutdown_ = true;\n  cleanup_timer_.Stop();',
     '  shutdown_ = true;\n  fresh_identity_.Reset();\n  cleanup_timer_.Stop();'),
    ('void AuxOrganizationWindowController::RebindForProfileSwitch() {\n  if (shutdown_) return;\n  cleanup_timer_.Stop();',
     'void AuxOrganizationWindowController::RebindForProfileSwitch() {\n  if (shutdown_) return;\n  fresh_identity_.Reset();\n  cleanup_timer_.Stop();'),
    ('  auto* owner = organization::OrganizationProfileServiceFactory::GetForProfile(profile_);\n  if (owner) ready_subscription_',
     """  // New-profile setup can finish after this window was constructed. Wait
  // only for a genuinely missing identity; existing nonempty owners never
  // mutate/rebind IDs or cancel their pending work through this observer.
  if (GetProfileId(profile_).empty() && profile_->GetPrefs()->FindPreference("aux.profile_id")) {
    fresh_identity_.Init(profile_->GetPrefs());
    fresh_identity_.Add("aux.profile_id", base::BindRepeating(
        [](base::WeakPtr<AuxOrganizationWindowController> self) {
          if (!self || !self->Current() || GetProfileId(self->profile_).empty()) return;
          // Let the actual PrefService change finish before rebinding views.
          base::SingleThreadTaskRunner::GetCurrentDefault()->PostTask(FROM_HERE,
              base::BindOnce(&AuxOrganizationWindowController::BindFreshIdentity, self));
        }, weak_.GetWeakPtr()));
  }
  auto* owner = organization::OrganizationProfileServiceFactory::GetForProfile(profile_);
  if (owner) ready_subscription_"""),
    ('void AuxOrganizationWindowController::Bind() {',
     """void AuxOrganizationWindowController::BindFreshIdentity() {
  if (!Current() || GetProfileId(profile_).empty()) return;
  fresh_identity_.Reset();
  // Retain the actual native tabs, supplied row eligibility and any restored
  // Space selection; only attach the owner that was unavailable during setup.
  auto* owner = organization::OrganizationProfileServiceFactory::GetForProfile(profile_);
  if (owner) ready_subscription_ = owner->ObserveReady(base::BindRepeating(
      &AuxOrganizationWindowController::Bind, weak_.GetWeakPtr()));
  Bind();
}
void AuxOrganizationWindowController::Bind() {"""),
])

result = {'format': 'aux.profile-window-completion.source.v1', 'nativeRoot': str(ROOT),
          'files': files, 'nativeCheckoutChanged': False, 'uiStylesChanged': False,
          'nativeCompiled': False, 'productExecuted': False, 'runtimeAcceptance': False}
(HERE / 'source-plan.json').write_text(json.dumps(result, indent=2) + '\n')
(HERE / 'native.patch').write_text(''.join(patch))
print(json.dumps({'files': len(files), 'countedAnchors': sum(len(row['anchors']) for row in files),
                  'nativeCheckoutChanged': False, 'uiStylesChanged': False}))
