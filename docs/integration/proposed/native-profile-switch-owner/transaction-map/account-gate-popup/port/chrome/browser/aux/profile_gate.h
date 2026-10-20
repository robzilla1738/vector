// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_AUX_PROFILE_GATE_H_
#define CHROME_BROWSER_AUX_PROFILE_GATE_H_
#include <memory>

#include "base/functional/callback.h"
class BrowserWindowInterface;
class GURL;
namespace content {
class WebContents;
}
namespace aux {
// UI-sequence visibility guard. First call starts authenticated binding and an
// asynchronous account-state read; pending and invalid state deny visibility.
bool CanShowBrowser(
    BrowserWindowInterface* browser,
    base::RepeatingCallback<void(content::WebContents*)> initialize_tab = {});
void ShutdownProfileGates();
}  // namespace aux
#endif
