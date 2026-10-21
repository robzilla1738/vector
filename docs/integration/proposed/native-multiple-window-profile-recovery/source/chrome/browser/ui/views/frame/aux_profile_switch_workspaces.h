// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_SWITCH_WORKSPACES_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_SWITCH_WORKSPACES_H_

#include <cstdint>

#include "base/files/file_path.h"
#include "base/functional/callback.h"

class BrowserWindowInterface;
class Profile;

namespace aux {
// Searches only a loaded profile's registered, hidden cache owned by this
// window's independent workspace identity. Never selects another user window.
BrowserWindowInterface* FindProfileSwitchWorkspace(
    BrowserWindowInterface* owner,
    const base::FilePath& profile_path);

// Asynchronously prepare a fresh target workspace before transaction admission.
// Existing real tab collections are never restored over or replaced.
void PrepareProfileSwitchWorkspace(BrowserWindowInterface* owner,
                                   Profile* target,
                                   uint64_t request_generation,
                                   base::OnceCallback<void(bool)> completion);

// Original455cfec: creates a real hidden normal browser, or returns its exact
// existing cache. This is not the visible-window profile migration transaction.
BrowserWindowInterface* GetOrCreateProfileSwitchWorkspace(
    BrowserWindowInterface* owner,
    Profile* target,
    bool ensure_tab);
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_SWITCH_WORKSPACES_H_
