// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_AUX_PREVIEW_AUX_PREVIEW_CONTROLS_H_
#define CHROME_BROWSER_UI_AUX_PREVIEW_AUX_PREVIEW_CONTROLS_H_
class BrowserWindowInterface;
namespace aux::preview {
// Registers the native decorator. Called before native preview creation; no
// renderer or startup feature flag is allowed to install a substitute.
void EnsureNativePreviewControls();
int NativePreviewControlsWidth(BrowserWindowInterface*);
}
#endif
