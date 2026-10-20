// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/devtools/protocol/aux_profile_window.h"
#include "base/environment.h"
#include "base/files/file_util.h"
#include "base/functional/bind.h"
#include "base/memory/ref_counted.h"
#include "base/memory/weak_ptr.h"
#include "base/strings/string_number_conversions.h"
#include "base/task/thread_pool.h"
#include "chrome/browser/aux/browser_platform.h"
#include "chrome/browser/aux/installation_auth.h"
#include "chrome/browser/aux/profile_security_client.h"
#include "chrome/browser/aux/profile_identity.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/prefs/incognito_mode_prefs.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/profiles/profile_attributes_entry.h"
#include "chrome/browser/profiles/profile_attributes_storage.h"
#include "chrome/browser/profiles/profile_manager.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/profile_browser_collection.h"
#include "chrome/browser/ui/navigator/browser_navigator.h"
#include "chrome/browser/ui/navigator/browser_navigator_params.h"
#include "components/policy/core/common/policy_pref_names.h"
#include "content/public/browser/browser_thread.h"
#include "ui/base/base_window.h"
#include "url/gurl.h"
namespace aux {
namespace {
class WindowRequest : public base::RefCounted<WindowRequest> {
 public:
  WindowRequest(int index,
                std::optional<std::string> url,
                bool focus,
                base::RepeatingCallback<bool()> alive,
                base::OnceCallback<void(ProfileWindowOutcome)> done)
      : index_(index),
        url_(std::move(url)),
        focus_(focus),
        alive_(std::move(alive)),
        done_(std::move(done)) {}
  void Start() {
    DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
    auto* manager = Manager();
    if (!manager || index_ < 0)
      return Finish(-32602, "Profile index is invalid");
    auto entries = manager->GetProfileAttributesStorage()
                       .GetAllProfilesAttributesSortedForDisplay();
    if (static_cast<size_t>(index_) >= entries.size())
      return Finish(-32602, "Profile does not exist");
    path_ = entries[index_]->GetPath();
    if (entries[index_]->IsSigninRequired())
      return Locked();
    if (url_ && !GURL(*url_).is_valid())
      return Finish(-32602, "URL must be valid");
    const auto root = manager->user_data_dir();
    base::ThreadPool::PostTaskAndReplyWithResult(
        FROM_HERE, {base::MayBlock()},
        base::BindOnce(
            [](base::FilePath root, base::FilePath path) {
              const auto canonical_root = base::MakeAbsoluteFilePath(root);
              const auto canonical_path = base::MakeAbsoluteFilePath(path);
              return !canonical_root.empty() && !canonical_path.empty() &&
                     canonical_root.IsParent(canonical_path) &&
                     canonical_path == path.StripTrailingSeparators();
            },
            root, path_),
        base::BindOnce(&WindowRequest::DidValidatePath,
                       base::WrapRefCounted(this)));
  }

 private:
  friend class base::RefCounted<WindowRequest>;
  ~WindowRequest() = default;
  ProfileManager* Manager() {
    return g_browser_process ? g_browser_process->profile_manager() : nullptr;
  }
  bool Registered() {
    if (!alive_ || !alive_.Run() || !Manager())
      return false;
    auto entries = Manager()
                       ->GetProfileAttributesStorage()
                       .GetAllProfilesAttributesSortedForDisplay();
    return index_ >= 0 && static_cast<size_t>(index_) < entries.size() &&
           entries[index_]->GetPath() == path_ &&
           !entries[index_]->IsSigninRequired();
  }
  void DidValidatePath(bool valid) {
    if (!valid || !Registered())
      return Finish(-32600, "Profile route is no longer available");
    // Loading an explicitly requested registered profile is not opening it.
    // Canonical UUIDs belong to actual loaded PrefService, not path hashes.
    const bool accepted = Manager()->LoadProfileByPath(
        path_, false,
        base::BindOnce(&WindowRequest::DidLoad, base::WrapRefCounted(this)));
    if (!accepted) Finish(-32000, "Profile could not be loaded");
  }
  void Verify() {
    if (!Registered())
      return Finish(-32600, "Profile route changed");
    unsigned port = 21520;
    if (auto text = base::Environment::Create()->GetVar("AUX_PORT");
        text && (!base::StringToUint(*text, &port) || !port || port > 65535))
      return Finish(-32000, "Daemon port is invalid");
    auto factory = g_browser_process->shared_url_loader_factory();
    const auto auth = BrowserPlatform::Get().authorization();
    if (!factory || auth.empty())
      return Finish(-32000, "Owned daemon authentication is unavailable");
    FetchProfileSecurity(StateHome(), path_, GetProfileId(profile_.get()),
                         std::move(factory), port, auth,
                         base::BindOnce(&WindowRequest::DidVerify,
                                        base::WrapRefCounted(this)));
  }
  void DidVerify(ProfileSecurityState state) {
    if (!Registered())
      return Finish(-32600, "Profile route changed");
    if (!state.bound || !state.account_id || !state.error.empty())
      return Finish(-32000, state.error.empty()
                                ? "Profile account binding is unavailable"
                                : state.error);
    if (!state.matches_profile_index(index_))
      return Finish(-32600,
                    "Stored profile index is stale; refresh profile context");
    if (!state.allows_browsing())
      return Locked();
    if (account_ && account_ != state.account_id)
      return Finish(-32600, "Profile account changed");
    account_ = state.account_id;
    OpenWindow();
  }
  void DidLoad(Profile* profile) {
    if (!done_)
      return;
    if (!profile || profile->IsOffTheRecord() || profile->IsGuestSession() ||
        profile->GetPath() != path_)
      return Finish(-32000, "Profile could not be loaded");
    if (IncognitoModePrefs::GetAvailability(profile->GetPrefs()) ==
        policy::IncognitoModeAvailability::kForced)
      return Finish(-32600,
                    "A normal profile window is unavailable under policy");
    profile_ = profile->GetWeakPtr();
    Verify();
  }
  void OpenWindow() {
    if (!done_ || !profile_ || !Registered())
      return Finish(-32600, "Profile is no longer available");
    if (IncognitoModePrefs::GetAvailability(profile_->GetPrefs()) ==
        policy::IncognitoModeAvailability::kForced)
      return Finish(-32600,
                    "A normal profile window is unavailable under policy");
    auto* window = ProfileBrowserCollection::GetForProfile(profile_.get())
                       ->FindTabbedBrowser(/*match_original_profiles=*/false);
    if (window && (window->GetProfile() != profile_.get() ||
                   window->GetType() != BrowserWindowInterface::TYPE_NORMAL))
      return Finish(-32600, "A normal profile window is unavailable");
    if (window && !url_) {
      if (focus_)
        window->GetWindow()->Activate();
      return Finish(0, {});
    }
    const GURL target(url_.value_or("chrome://newtab/"));
    NavigateParams navigation(profile_.get(), target,
                              ui::PAGE_TRANSITION_AUTO_TOPLEVEL);
    navigation.browser = window;
    navigation.disposition = window ? WindowOpenDisposition::NEW_FOREGROUND_TAB
                                    : WindowOpenDisposition::NEW_WINDOW;
    navigation.window_action =
        focus_ ? NavigateParams::WindowAction::kShowWindow
               : NavigateParams::WindowAction::kShowWindowInactive;
    Navigate(&navigation);
    if (!navigation.navigated_or_inserted_contents)
      return Finish(-32000, "Failed to open URL");
    Finish(0, {});
  }
  void Locked() { Finish(-32600, "Profile is locked"); }
  void Finish(int code, std::string message) {
    if (done_)
      std::move(done_).Run({code, std::move(message)});
  }
  const int index_;
  const std::optional<std::string> url_;
  const bool focus_;
  const base::RepeatingCallback<bool()> alive_;
  base::OnceCallback<void(ProfileWindowOutcome)> done_;
  base::FilePath path_;
  std::optional<int> account_;
  base::WeakPtr<Profile> profile_;
};
}  // namespace
void EnsureProfileWindow(int index,
                         std::optional<std::string> url,
                         std::optional<bool> focus,
                         bool authenticated,
                         base::RepeatingCallback<bool()> caller_alive,
                         base::OnceCallback<void(ProfileWindowOutcome)> done) {
  if (!authenticated) {
    std::move(done).Run({-32000,
                         "Profile windows are only supported from "
                         "secure remote debugging sessions"});
    return;
  }
  base::MakeRefCounted<WindowRequest>(index, std::move(url),
                                      focus.value_or(false),
                                      std::move(caller_alive), std::move(done))
      ->Start();
}
}  // namespace aux
