// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_BROWSER_SHUTDOWN_DRAIN_H_
#define CHROME_BROWSER_UI_AUX_BROWSER_SHUTDOWN_DRAIN_H_
namespace aux {
// Actual process lifecycle only. Never a window-close/profile-switch API.
void PrepareNativeBrowserShutdownDrain();
void FinishNativeBrowserShutdownDrain();
}
#endif
