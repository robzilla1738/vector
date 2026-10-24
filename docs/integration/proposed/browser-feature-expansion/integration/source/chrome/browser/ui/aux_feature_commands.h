// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_AUX_FEATURE_COMMANDS_H_
#define CHROME_BROWSER_UI_AUX_FEATURE_COMMANDS_H_
class BrowserWindowInterface;
namespace aux {
bool IsAuxFeatureCommand(int command);
bool IsAuxFeatureCommandEnabled(BrowserWindowInterface* browser, int command);
bool ExecuteAuxFeatureCommand(BrowserWindowInterface* browser, int command);
}  // namespace aux
#endif
