// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/aux/profile_gate.h"

#include "chrome/browser/aux/ntp_prerender_service.h"
#include "chrome/browser/aux/profile_identity.h"
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
