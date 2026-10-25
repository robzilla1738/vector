// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/aux/profile_gate.h"

#include "chrome/browser/aux/ntp_prerender_service.h"
#include "chrome/browser/aux/profile_identity.h"
#include "chrome/browser/buildflags.h"
#include "chrome/browser/prefs/session_startup_pref.h"
#include "chrome/common/pref_names.h"
#include "base/uuid.h"
#include "chrome/browser/ui/aux_feature_lifecycle.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/browser_thread.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"

namespace aux {
namespace {
bool stopping = false;
}  // namespace

bool CanShowBrowser(
    BrowserWindowInterface* browser,
    base::RepeatingCallback<void(content::WebContents*)> initialize_tab) {
  if (stopping || !browser || !browser->GetProfile())
    return false;
  // Aux has no built-in password manager. Local browser visibility is not an
  // account onboarding or Vault-unlock decision. Daemon RPCs still require
  // their actual installation authorization and profile-account resolution.
  SetNtpPrerenderEnabled(browser->GetProfile(), true);
  return true;
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
  if (!alive || GetProfileId(alive.get()) != id)
    return Result::kUnavailable;
#if BUILDFLAG(ENABLE_AUX_BROWSER)
  // Set the Aux browser default once, at the genuine fresh admitted store
  // boundary. Logical rows alone cannot restore the independent native views,
  // histories and page identities that own durable chat drafts/attachments.
  // Preserve explicit startup choices, policy and recommended configuration;
  // do not rewrite the saved startup URL list or alter existing profiles.
  if (!prefs->GetUserPrefValue(prefs::kRestoreOnStartup) &&
      !SessionStartupPref::TypeIsManaged(prefs) &&
      !SessionStartupPref::TypeHasRecommendedValue(prefs)) {
    prefs->SetInteger(prefs::kRestoreOnStartup,
                      SessionStartupPref::kPrefValueLast);
  }
#endif
  return alive ? Result::kCreatedPending : Result::kUnavailable;
}
void RequestProfileBootstrap(Profile* profile) {
  // Profile creation no longer opens the removed password-manager onboarding.
  // Account resolution remains owned by the authenticated supplied Agent.
  if (!stopping && profile) {
    const auto alive = profile->GetWeakPtr();
    InitializeFreshProfileIdentity(profile);
    if (alive) SetNtpPrerenderEnabled(alive.get(), true);
  }
}

void ShutdownProfileGates() {
  stopping = true;
}
}  // namespace aux
