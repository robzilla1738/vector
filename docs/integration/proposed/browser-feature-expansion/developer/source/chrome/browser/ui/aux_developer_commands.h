// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_AUX_DEVELOPER_COMMANDS_H_
#define CHROME_BROWSER_UI_AUX_DEVELOPER_COMMANDS_H_
#include <string_view>
#include "base/values.h"
class Profile;
class BrowserWindowInterface;
namespace content { class WebContents; }
base::DictValue GetAuxDeveloperSettings(Profile*);
base::DictValue SetAuxDeveloperMode(Profile*, bool enabled);
base::DictValue OpenAuxExtensionManager(BrowserWindowInterface&);
base::DictValue GetAuxDeveloperCommandState(Profile*, content::WebContents* actual_pane);
base::DictValue OpenAuxDeveloperTools(Profile*, content::WebContents* actual_pane);
// Called only by native command execution or a validated command-owner gesture.
bool AuthorizeAuxPageCapture(BrowserWindowInterface*);
bool ConsumeAuxPageCaptureIntent(BrowserWindowInterface*, std::string_view document_id);
bool CanShowAuxPageCapture(BrowserWindowInterface*);
bool ShowAuxPageCapture(BrowserWindowInterface*);
#endif
