// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_SWITCH_WORKSPACES_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_SWITCH_WORKSPACES_H_

#include "base/files/file_path.h"

class BrowserWindowInterface;
class Profile;

namespace aux {
// Searches only a loaded profile's registered, hidden cache owned by this
// window's independent workspace identity. Never selects another user window.
BrowserWindowInterface* FindProfileSwitchWorkspace(
    BrowserWindowInterface* owner,
    const base::FilePath& profile_path);

// Original455cfec: creates a real hidden normal browser, or returns its exact
// existing cache. This is not the visible-window profile migration transaction.
BrowserWindowInterface* GetOrCreateProfileSwitchWorkspace(
    BrowserWindowInterface* owner,
    Profile* target,
    bool ensure_tab);
}  // namespace aux
#endif  // CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PROFILE_SWITCH_WORKSPACES_H_
