// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/ui/aux_keyboard_shortcuts.h"

#import <AppKit/AppKit.h>
#import <objc/runtime.h>
#include "ui/base/cocoa/command_dispatcher.h"
#include <algorithm>
#include <iterator>
#include <set>
#include <string_view>
#include "base/no_destructor.h"
#include "chrome/app/chrome_command_ids.h"
#include "chrome/browser/ui/browser_commands.h"
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
    {34066, "Command+Shift+-"}, {kPopup, "Alt+Space"},
    {IDC_NEW_TAB, "Command+T"}, {IDC_FOCUS_LOCATION, "Command+L"},
    {IDC_FOCUS_SEARCH, "Command+K"}, {IDC_CLOSE_TAB, "Command+W"},
    {IDC_RESTORE_TAB, "Command+Shift+T"}, {IDC_RELOAD, "Command+R"},
    {IDC_RELOAD_BYPASSING_CACHE, "Command+Shift+R"},
    {IDC_BACK, "Command+Left"}, {IDC_FORWARD, "Command+Right"},
    {IDC_SHOW_DOWNLOADS, "Command+Shift+J"},
    {IDC_DEV_TOOLS, "Command+Alt+I"}, {IDC_VIEW_SOURCE, "Command+Alt+U"}};
struct NavigationCommand { int command; const char* id; const char* title; };
constexpr NavigationCommand kNavigationCommands[] = {
    {IDC_NEW_TAB, "new-tab", "New tab"},
    {IDC_FOCUS_LOCATION, "navigate", "Open URL or search"},
    {IDC_FOCUS_SEARCH, "command-bar", "Commands"},
    {IDC_BACK, "back", "Back"}, {IDC_FORWARD, "forward", "Forward"},
    {IDC_RELOAD, "reload", "Reload"},
    {IDC_RELOAD_BYPASSING_CACHE, "reload-without-cache", "Reload without cache"},
    {IDC_STOP, "stop", "Stop loading"}, {IDC_CLOSE_TAB, "close-tab", "Close tab"},
    {IDC_RESTORE_TAB, "restore-tab", "Reopen closed tab"},
    {IDC_SHOW_DOWNLOADS, "downloads", "Downloads"},
    {IDC_SHOW_HISTORY, "history", "History"},
    {IDC_DEV_TOOLS, "developer-tools", "Developer tools"},
    {IDC_DEV_TOOLS_INSPECT, "inspect", "Inspect page"},
    {IDC_VIEW_SOURCE, "view-source", "View source"},
    {34061, "sidebar", "Toggle sidebar"},
    {34068, "ask-aux", "Ask Aux"}, {34071, "copy-url", "Copy URL"}};

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
  if (!profile->GetPrefs()->FindPreference(kOverrides)) return Default(binding);
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
const char kOriginalMenuEquivalent = 0;
NSDictionary* OriginalMenuEquivalent(NSMenuItem* item) {
  NSDictionary* original = objc_getAssociatedObject(item, &kOriginalMenuEquivalent);
  // Respect a real native owner changing a menu item after our last update;
  // only our own last-written equivalent may be restored from the snapshot.
  if (!original || ![original[@"lastKey"] isEqualToString:item.keyEquivalent] ||
      [original[@"lastModifiers"] unsignedIntegerValue] != item.keyEquivalentModifierMask) {
    original = @{@"key": item.keyEquivalent ?: @"",
                 @"modifiers": @(item.keyEquivalentModifierMask),
                 @"lastKey": item.keyEquivalent ?: @"",
                 @"lastModifiers": @(item.keyEquivalentModifierMask)};
    objc_setAssociatedObject(item, &kOriginalMenuEquivalent, original,
                             OBJC_ASSOCIATION_RETAIN_NONATOMIC);
  }
  return original;
}
void SetMenuEquivalent(NSMenuItem* item, NSString* key, NSUInteger modifiers) {
  NSDictionary* original = OriginalMenuEquivalent(item);
  item.keyEquivalent = key;
  item.keyEquivalentModifierMask = modifiers;
  objc_setAssociatedObject(item, &kOriginalMenuEquivalent,
      @{@"key": original[@"key"], @"modifiers": original[@"modifiers"],
        @"lastKey": key, @"lastModifiers": @(modifiers)},
      OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}
bool SameEquivalent(NSString* key, NSUInteger modifiers,
                    KeyEquivalentAndModifierMask* other) {
  return [key isEqualToString:other.keyEquivalent] && modifiers == other.modifierMask;
}
void UpdateMenuItem(Profile* profile, NSMenuItem* item) {
  if (item.action != @selector(commandDispatch:) &&
      item.action != @selector(commandDispatchUsingKeyModifiers:))
    return;
  const auto* binding = FindBinding(item.tag);
  NSDictionary* original = OriginalMenuEquivalent(item);
  if (binding && binding->command != kPopup) {
    const auto parsed = ParseKeyboardShortcut(Effective(profile, *binding));
    if (!parsed) return;
    auto* equivalent = ui::GetKeyEquivalentAndModifierMaskFromAccelerator(*parsed);
    SetMenuEquivalent(item, equivalent.keyEquivalent, equivalent.modifierMask);
    return;
  }
  NSString* key = original[@"key"];
  NSUInteger modifiers = [original[@"modifiers"] unsignedIntegerValue];
  // A supplied/profile shortcut may displace an unrelated upstream default
  // (e.g. Toggle Sidebar / Save Page). Remove only its misleading key hint,
  // retaining the actual menu item and all native click/enabled validation.
  if (key.length) {
    for (const auto& candidate : kBindings) {
      if (candidate.command == kPopup) continue;
      const auto parsed = ParseKeyboardShortcut(Effective(profile, candidate));
      if (parsed && SameEquivalent(key, modifiers,
          ui::GetKeyEquivalentAndModifierMaskFromAccelerator(*parsed))) {
        key = @"";
        modifiers = 0;
        break;
      }
    }
  }
  SetMenuEquivalent(item, key, modifiers);
}
void UpdateMenu(Profile* profile, NSMenu* menu) {
  for (NSMenuItem* item in menu.itemArray) {
    UpdateMenuItem(profile, item);
    if (item.submenu) UpdateMenu(profile, item.submenu);
  }
}
void RefreshActiveMenu() {
  auto* browser = GlobalBrowserCollection::GetInstance()->GetActiveBrowser();
  if (browser) RefreshKeyboardShortcutMenu(browser->GetProfile());
}
bool MenuConflict(Profile* profile, NSMenu* menu,
                  KeyEquivalentAndModifierMask* key, int command) {
  for (NSMenuItem* item in menu.itemArray) {
    if (item.submenu && MenuConflict(profile, item.submenu, key, command))
      return true;
    if (item.tag == command) continue;
    const auto* binding = FindBinding(item.tag);
    if (binding && binding->command != kPopup) {
      const auto effective = ParseKeyboardShortcut(Effective(profile, *binding));
      if (effective) {
        auto* equivalent = ui::GetKeyEquivalentAndModifierMaskFromAccelerator(*effective);
        if (SameEquivalent(equivalent.keyEquivalent, equivalent.modifierMask, key))
          return true;
      }
    } else {
      NSDictionary* original = OriginalMenuEquivalent(item);
      if (SameEquivalent(original[@"key"],
                         [original[@"modifiers"] unsignedIntegerValue], key))
        return true;
    }
  }
  return false;
}
}  // namespace

bool IsNavigationCommand(int command) {
  return std::ranges::find(kNavigationCommands, command,
                          &NavigationCommand::command) != std::end(kNavigationCommands);
}
base::ListValue GetNavigationCommandCatalog(BrowserWindowInterface* browser) {
  base::ListValue result;
  if (!browser) return result;
  for (const auto& command : kNavigationCommands) {
    base::DictValue row;
    row.Set("id", command.id);
    row.Set("commandId", command.command);
    row.Set("title", command.title);
    row.Set("enabled", chrome::IsCommandEnabled(browser, command.command));
    if (const auto* binding = FindBinding(command.command))
      row.Set("shortcut", Effective(browser->GetProfile()->GetOriginalProfile(), *binding));
    result.Append(std::move(row));
  }
  return result;
}
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
      MenuConflict(profile, NSApp.mainMenu,
                   ui::GetKeyEquivalentAndModifierMaskFromAccelerator(*parsed),
                   command))
    return "This shortcut is already used by a browser menu command.";
  if (command == kPopup) {
    auto error = extensions::SetAuxMiniPopupShortcut(profile, value);
    if (!error) RefreshActiveMenu();
    return error;
  }
  auto* prefs = profile->GetPrefs();
  if (prefs->IsManagedPreference(kOverrides))
    return "Shortcuts are managed";
  {
    ScopedDictPrefUpdate update(prefs, kOverrides);
    update->Set(base::NumberToString(command), value);
  }
  RefreshActiveMenu();
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
  // Once customized, the old chord must not leak through to Chromium's
  // static accelerator table. Effective bindings above win any reassignment.
  for (const auto& binding : kBindings) {
    if (binding.command != kPopup &&
        ParseKeyboardShortcut(Default(binding)) == pressed &&
        Effective(profile, binding) != Default(binding))
      return 0;
  }
  return std::nullopt;
}
bool IsKeyboardShortcutCommandForWindow(int command, NSWindow* window) {
  return command != kPopup && FindBinding(command) &&
         GlobalBrowserCollection::GetInstance()->FindBrowserWithWindow(
             gfx::NativeWindow(window));
}
bool GetKeyboardShortcut(Profile* profile, int command, ui::Accelerator* accelerator) {
  const auto* binding = FindBinding(command);
  if (!binding) return false;
  const auto parsed = ParseKeyboardShortcut(Effective(profile->GetOriginalProfile(), *binding));
  if (!parsed) return false;
  *accelerator = *parsed;
  return true;
}
void RefreshKeyboardShortcutMenu(Profile* profile) {
  UpdateMenu(profile->GetOriginalProfile(), NSApp.mainMenu);
}
void UpdateKeyboardShortcutMenuItem(NSMenuItem* item, NSWindow* window) {
  auto* browser = GlobalBrowserCollection::GetInstance()->FindBrowserWithWindow(
      gfx::NativeWindow(window));
  if (browser) UpdateMenuItem(browser->GetProfile()->GetOriginalProfile(), item);
}
}  // namespace aux
