// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_UI_AUX_KEYBOARD_SHORTCUTS_H_
#define CHROME_BROWSER_UI_AUX_KEYBOARD_SHORTCUTS_H_

#include <optional>
#include <string>
#include "base/values.h"
class Profile;
namespace content {
class WebContents;
}
namespace user_prefs {
class PrefRegistrySyncable;
}
#if defined(__OBJC__)
@class NSEvent;
@class NSWindow;
#endif
namespace aux {
void RegisterKeyboardShortcutPrefs(user_prefs::PrefRegistrySyncable* registry);
base::ListValue GetKeyboardShortcuts(Profile* profile);
std::optional<std::string> SetKeyboardShortcut(Profile* profile,
                                               int command,
                                               const std::string& shortcut);
std::optional<std::string> ResetKeyboardShortcut(Profile* profile, int command);
void SetShortcutCapture(content::WebContents* sender, bool suspended);
#if defined(__OBJC__)
// nullopt: normal Chromium dispatch; 0: deliver directly to the responder for
// capture/displaced defaults; positive: real browser command, enabled as usual.
std::optional<int> ResolveKeyboardShortcut(NSEvent* event, NSWindow* window);
bool IsKeyboardShortcutCommandForWindow(int command, NSWindow* window);
#endif
}  // namespace aux
#endif
