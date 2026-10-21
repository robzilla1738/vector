// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/ui/aux_keyboard_shortcuts.h"

#import <AppKit/AppKit.h>
#include <algorithm>
#include <iterator>
#include <set>
#include <string_view>
#include "base/no_destructor.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/utf_string_conversions.h"
#include "base/supports_user_data.h"
#include "chrome/browser/browser_process.h"
#include "chrome/browser/extensions/api/aux_mini_popup/aux_mini_popup_api.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux_keyboard_shortcut_parser.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/global_browser_collection.h"
#include "components/pref_registry/pref_registry_syncable.h"
#include "components/prefs/pref_service.h"
#include "components/prefs/scoped_user_pref_update.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_contents_observer.h"
#include "ui/base/accelerators/accelerator.h"
#include "ui/base/accelerators/global_accelerator_listener/global_accelerator_listener.h"
#include "ui/base/accelerators/platform_accelerator_cocoa.h"
#include "ui/events/event_constants.h"
#include "ui/events/keycodes/keyboard_code_conversion_mac.h"
#include "ui/gfx/native_ui_types.h"

namespace aux {
namespace {
constexpr char kOverrides[] = "aux.browser.keyboard_shortcuts";
constexpr char kPopupShortcut[] = "aux.popup.shortcut";
constexpr int kPopup = 34069;
struct Binding {
  int command;
  std::string_view shortcut;
};
constexpr Binding kBindings[] = {
    {34061, "Command+S"},       {52500, "Command+Shift+A"},
    {34068, "Command+E"},       {34067, "Command+Shift+E"},
    {34071, "Command+Shift+C"}, {34057, "Command+Shift+\\"},
    {34066, "Command+Shift+-"}, {kPopup, "Alt+Space"}};

const Binding* FindBinding(int command) {
  const auto it = std::ranges::find(kBindings, command, &Binding::command);
  return it == std::end(kBindings) ? nullptr : it;
}

std::string Default(const Binding& binding) {
  if (binding.command != kPopup)
    return std::string(binding.shortcut);
  // Preserve the real registered global owner's default, not the UI fallback.
  return g_browser_process->local_state()
      ->GetDefaultPrefValue(kPopupShortcut)
      ->GetString();
}
std::string Effective(Profile* profile, const Binding& binding) {
  if (binding.command == kPopup)
    return g_browser_process->local_state()->GetString(kPopupShortcut);
  const auto* saved = profile->GetPrefs()
                          ->GetDict(kOverrides)
                          .FindString(base::NumberToString(binding.command));
  return saved && ParseKeyboardShortcut(*saved) ? *saved : Default(binding);
}
class Capture;
std::set<Capture*>& Captures() {
  static base::NoDestructor<std::set<Capture*>> captures;
  return *captures;
}
bool& PreviouslySuspended() {
  static bool value = false;
  return value;
}
const char kCaptureKey = 0;
class Capture : public base::SupportsUserData::Data,
                public content::WebContentsObserver {
 public:
  explicit Capture(content::WebContents* contents)
      : WebContentsObserver(contents) {}
  ~Capture() override { Set(false); }
  void Set(bool suspended) {
    auto& captures = Captures();
    if (suspended == captures.contains(this))
      return;
    auto* listener = ui::GlobalAcceleratorListener::GetInstance();
    if (suspended) {
      if (captures.empty()) {
        PreviouslySuspended() =
            listener && listener->IsShortcutHandlingSuspended();
        if (listener)
          listener->SetShortcutHandlingSuspended(true);
      }
      captures.insert(this);
    } else {
      captures.erase(this);
      if (captures.empty() && listener && !PreviouslySuspended())
        listener->SetShortcutHandlingSuspended(false);
    }
  }
  void PrimaryPageChanged(content::Page&) override { Set(false); }
  void PrimaryMainFrameRenderProcessGone(base::TerminationStatus) override {
    Set(false);
  }
  void WebContentsDestroyed() override { Set(false); }
};
bool MenuConflict(NSMenu* menu,
                  KeyEquivalentAndModifierMask* key,
                  int command) {
  for (NSMenuItem* item in menu.itemArray) {
    if (item.submenu && MenuConflict(item.submenu, key, command))
      return true;
    if (item.tag != command &&
        [item.keyEquivalent isEqualToString:key.keyEquivalent] &&
        item.keyEquivalentModifierMask == key.modifierMask)
      return true;
  }
  return false;
}
}  // namespace

void RegisterKeyboardShortcutPrefs(user_prefs::PrefRegistrySyncable* registry) {
  registry->RegisterDictionaryPref(kOverrides);
}
base::ListValue GetKeyboardShortcuts(Profile* profile) {
  base::ListValue result;
  for (const auto& binding : kBindings) {
    const auto effective = Effective(profile, binding);
    const auto initial = Default(binding);
    base::DictValue row;
    row.Set("commandId", binding.command);
    row.Set("serializedShortcut", effective);
    row.Set("defaultSerializedShortcut", initial);
    const auto effective_key = ParseKeyboardShortcut(effective);
    row.Set("shortcut",
            effective_key ? base::UTF16ToUTF8(effective_key->GetShortcutText())
                          : effective);
    row.Set(
        "defaultShortcut",
        base::UTF16ToUTF8(ParseKeyboardShortcut(initial)->GetShortcutText()));
    row.Set("isCustomized", effective != initial);
    result.Append(std::move(row));
  }
  return result;
}
std::optional<std::string> SetKeyboardShortcut(Profile* profile,
                                               int command,
                                               const std::string& value) {
  const auto* binding = FindBinding(command);
  const auto parsed = ParseKeyboardShortcut(value);
  if (!binding || !parsed)
    return "Shortcut is not valid";
  for (const auto& other : kBindings) {
    if (other.command != command &&
        ParseKeyboardShortcut(Effective(profile, other)) == parsed)
      return "This shortcut is already in use. Choose a different shortcut.";
  }
  // Allow a command's own supplied default even when it replaces a Chromium
  // menu default (notably Toggle Sidebar / Save Page). Reject other menu
  // clashes.
  if (value != Default(*binding) &&
      MenuConflict(NSApp.mainMenu,
                   ui::GetKeyEquivalentAndModifierMaskFromAccelerator(*parsed),
                   command))
    return "This shortcut is already used by a browser menu command.";
  if (command == kPopup)
    return extensions::SetAuxMiniPopupShortcut(profile, value);
  auto* prefs = profile->GetPrefs();
  if (prefs->IsManagedPreference(kOverrides))
    return "Shortcuts are managed";
  ScopedDictPrefUpdate update(prefs, kOverrides);
  update->Set(base::NumberToString(command), value);
  return std::nullopt;
}
std::optional<std::string> ResetKeyboardShortcut(Profile* profile,
                                                 int command) {
  const auto* binding = FindBinding(command);
  if (!binding)
    return "Unknown shortcut command";
  if (auto error = SetKeyboardShortcut(profile, command, Default(*binding)))
    return error;
  if (command != kPopup) {
    ScopedDictPrefUpdate update(profile->GetPrefs(), kOverrides);
    update->Remove(base::NumberToString(command));
  }
  return std::nullopt;
}
void SetShortcutCapture(content::WebContents* sender, bool suspended) {
  auto* capture = static_cast<Capture*>(sender->GetUserData(&kCaptureKey));
  if (!capture) {
    auto owned = std::make_unique<Capture>(sender);
    capture = owned.get();
    sender->SetUserData(&kCaptureKey, std::move(owned));
  }
  capture->Set(suspended);
}
std::optional<int> ResolveKeyboardShortcut(NSEvent* event, NSWindow* window) {
  if (event.type != NSEventTypeKeyDown)
    return std::nullopt;
  for (auto* capture : Captures()) {
    if (capture->web_contents() &&
        capture->web_contents()->GetTopLevelNativeWindow() ==
            gfx::NativeWindow(window))
      return 0;
  }
  auto* browser = GlobalBrowserCollection::GetInstance()->FindBrowserWithWindow(
      gfx::NativeWindow(window));
  if (!browser)
    return std::nullopt;
  auto* profile = browser->GetProfile()->GetOriginalProfile();
  int flags = 0;
  if (event.modifierFlags & NSEventModifierFlagCommand)
    flags |= ui::EF_COMMAND_DOWN;
  if (event.modifierFlags & NSEventModifierFlagControl)
    flags |= ui::EF_CONTROL_DOWN;
  if (event.modifierFlags & NSEventModifierFlagOption)
    flags |= ui::EF_ALT_DOWN;
  if (event.modifierFlags & NSEventModifierFlagShift)
    flags |= ui::EF_SHIFT_DOWN;
  const ui::Accelerator pressed(ui::KeyboardCodeFromKeyCode(event.keyCode),
                                flags);
  for (const auto& binding : kBindings) {
    if (binding.command != kPopup &&
        ParseKeyboardShortcut(Effective(profile, binding)) == pressed)
      return binding.command;
  }
  return std::nullopt;
}
bool IsKeyboardShortcutCommandForWindow(int command, NSWindow* window) {
  return command != kPopup && FindBinding(command) &&
         GlobalBrowserCollection::GetInstance()->FindBrowserWithWindow(
             gfx::NativeWindow(window));
}
}  // namespace aux
