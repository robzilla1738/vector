// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_AUX_DEVELOPER_COMMANDS_H_
#define CHROME_BROWSER_UI_AUX_DEVELOPER_COMMANDS_H_
#include "base/values.h"
class Profile;
class BrowserWindowInterface;
namespace content { class WebContents; }
base::DictValue GetAuxDeveloperSettings(Profile*);
base::DictValue SetAuxDeveloperMode(Profile*, bool enabled);
base::DictValue OpenAuxExtensionManager(BrowserWindowInterface&);
base::DictValue GetAuxDeveloperCommandState(Profile*, content::WebContents* actual_pane);
base::DictValue OpenAuxDeveloperTools(Profile*, content::WebContents* actual_pane);
#endif
