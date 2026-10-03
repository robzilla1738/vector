// Copyright 2025 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "chrome/browser/ui/webui_browser/webui_browser_window.h"

#import <AppKit/AppKit.h>
#import <objc/runtime.h>

#include <utility>
#include <cmath>
#include <limits>

#include "build/build_config.h"
#include "base/process/process_handle.h"
#include "base/functional/bind.h"
#include "base/time/time.h"
#include "chrome/app/chrome_command_ids.h"
#include "chrome/browser/apps/app_shim/app_shim_host_mac.h"
#include "chrome/browser/apps/app_shim/app_shim_manager_mac.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(ENABLE_AUX_SHELL)
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/appearance_prefs.h"
#include "chrome/browser/ui/aux/picture_in_picture_user_input.h"
#include "ui/events/event.h"
#include "ui/events/keycodes/dom/keycode_converter.h"
#include "chrome/browser/ui/aux/methods/shortcuts_methods.h"
#include "chrome/browser/ui/aux/quick_ask_controller.h"
#include "components/prefs/pref_service.h"
#endif
#include "chrome/browser/ui/browser_command_controller.h"
#include "chrome/browser/ui/browser_commands.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "content/public/browser/render_widget_host.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/render_widget_host_view.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#import "chrome/browser/ui/cocoa/browser_window_command_handler.h"
#import "chrome/browser/ui/cocoa/chrome_command_dispatcher_delegate.h"
#include "components/input/native_web_keyboard_event.h"
#include "base/strings/string_number_conversions.h"
#include "base/strings/string_util.h"
#include "chrome/browser/ui/webui_browser/webui_browser_ui.h"
#if BUILDFLAG(ENABLE_AUX_SHELL) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include "chrome/browser/ui/aux/native_aux_warm_creation_ticket.h"
#endif
#include "ui/events/keycodes/keyboard_code_conversion_mac.h"
#include "ui/content_accelerators/accelerator_util.h"
#include "ui/views/focus/focus_manager.h"
#import "components/remote_cocoa/app_shim/native_widget_ns_window_bridge.h"
#include "ui/base/accelerators/global_accelerator_listener/global_accelerator_listener.h"
#include "ui/views/cocoa/native_widget_mac_ns_window_host.h"
#include "ui/views/widget/native_widget_mac.h"

#if !BUILDFLAG(IS_MAC)
#error "This file is macOS-only and should not be included on other platforms."
#endif

#if BUILDFLAG(ENABLE_AUX_SHELL)
// Match BrowserNativeWidgetMac's material underlay: preserve Chromium's
// content view and responder chain, and never intercept content hit testing.
API_AVAILABLE(macos(26.0))
@interface AuxGlassBackgroundView : NSGlassEffectView
@end
@implementation AuxGlassBackgroundView
- (NSView*)hitTest:(NSPoint)point { return nil; }
@end

@interface AuxVisualEffectBackgroundView : NSVisualEffectView
@end
@implementation AuxVisualEffectBackgroundView
- (NSView*)hitTest:(NSPoint)point { return nil; }
@end
#endif

#include "content/public/browser/picture_in_picture_user_authority.h"

#if BUILDFLAG(ENABLE_AUX_SHELL)
namespace aux {
bool RecordPictureInPictureViewsInput(content::RenderFrameHost& target,
                                     const ui::Event& event,
                                     gfx::NativeWindow source_window) {
  NSEvent* native = event.native_event().Get();
  NSWindow* window = source_window.GetNativeNSWindow();
  if (!event.HasNativeEvent() || !native || native != NSApp.currentEvent ||
      !window || native.window != window || !window.visible ||
      (event.flags() & ui::EF_IS_SYNTHESIZED)) return false;
  // A non-activating browser bubble may belong to the current key window.
  NSWindow* owner = window;
  for (int depth = 0; owner && owner != NSApp.keyWindow && depth < 8; ++depth)
    owner = owner.parentWindow;
  if (owner != NSApp.keyWindow) return false;
  const bool mouse = event.IsMouseEvent() &&
      (native.type == NSEventTypeLeftMouseDown ||
       native.type == NSEventTypeLeftMouseUp);
  const bool key = event.IsKeyEvent() &&
      (native.type == NSEventTypeKeyDown || native.type == NSEventTypeKeyUp) &&
      !native.isARepeat && !ui::KeycodeConverter::IsDomKeyForModifier(event.AsKeyEvent()->GetDomKey()) &&
      event.AsKeyEvent()->key_code() != ui::VKEY_ESCAPE;
  if (!mouse && !key) return false;
  // The Chrome observer has already resolved this exact session request ID to
  // its current Profile document. No activation enum participates in authority.
  return content::RecordPictureInPictureBrowserUIInput(target);
}
}  // namespace aux
#endif

namespace {

#if BUILDFLAG(ENABLE_AUX_SHELL)
char kAuxMaterialViewKey;
char kAuxMaterialKey;

void ApplyAuxAppearance(NSWindow* window,
                        views::NativeWidgetMacNSWindowHost* host,
                        const std::string& theme, bool translucent,
                        const std::string& material) {
  window.appearance = theme == "system" ? nil :
      [NSAppearance appearanceNamed:theme == "light" ? NSAppearanceNameAqua
                                                     : NSAppearanceNameDarkAqua];
  const bool glass = translucent &&
      !NSWorkspace.sharedWorkspace.accessibilityDisplayShouldReduceTransparency;
  NSString* requested = glass ? [NSString stringWithUTF8String:material.c_str()]
                              : @"solid";
  NSString* installed = objc_getAssociatedObject(window, &kAuxMaterialKey);
  if (![installed isEqualToString:requested]) {
    NSView* previous = objc_getAssociatedObject(window, &kAuxMaterialViewKey);
    [previous removeFromSuperview];
    NSView* effect = nil;
    NSView* content = window.contentView;
    if (glass) {
      if (@available(macOS 26.0, *)) {
        if (material == "liquid-glass") {
          AuxGlassBackgroundView* native_glass =
              [[AuxGlassBackgroundView alloc] initWithFrame:content.bounds];
          native_glass.style = NSGlassEffectViewStyleRegular;
          native_glass.tintColor = NSColor.clearColor;
          effect = native_glass;
        }
      }
      if (!effect) {
        AuxVisualEffectBackgroundView* visual =
            [[AuxVisualEffectBackgroundView alloc] initWithFrame:content.bounds];
        visual.blendingMode = NSVisualEffectBlendingModeBehindWindow;
        visual.state = NSVisualEffectStateFollowsWindowActiveState;
        visual.material = material == "sidebar" ? NSVisualEffectMaterialSidebar :
            material == "under-window" ? NSVisualEffectMaterialUnderWindowBackground :
                                         NSVisualEffectMaterialTitlebar;
        effect = visual;
      }
      effect.wantsLayer = YES;
      effect.autoresizingMask = NSViewWidthSizable | NSViewHeightSizable;
      [content addSubview:effect positioned:NSWindowBelow relativeTo:nil];
    }
    objc_setAssociatedObject(window, &kAuxMaterialViewKey, effect,
                             OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    objc_setAssociatedObject(window, &kAuxMaterialKey, requested,
                             OBJC_ASSOCIATION_COPY_NONATOMIC);
  }
  window.opaque = !glass;
  // Chromium's glass frame uses a nearly transparent backing to avoid AppKit
  // continuously invalidating a completely transparent window surface.
  window.backgroundColor = glass ?
      [NSColor.windowBackgroundColor colorWithAlphaComponent:0.001] :
      NSColor.windowBackgroundColor;
  host->SetLayerAndCompositorOpaque(false);
  window.titlebarAppearsTransparent = YES;
  window.styleMask |= NSWindowStyleMaskFullSizeContentView;
  window.titleVisibility = NSWindowTitleHidden;
}
#endif

AppShimHost* GetHostForBrowser(BrowserWindowInterface* browser) {
  auto* const shim_manager = apps::AppShimManager::Get();
  CHECK(browser);
  if (!shim_manager) {
    return nullptr;
  }
  return shim_manager->GetHostForRemoteCocoaBrowser(browser);
}

bool ShouldHandleKeyboardEvent(const input::NativeWebKeyboardEvent& event) {
  // |event.skip_if_unhandled| is true when it shouldn't be handled by the
  // browser if it was ignored by the renderer. See http://crbug.com/41018016.
  if (event.skip_if_unhandled) {
    return false;
  }

  // Ignore synthesized keyboard events. See http://crbug.com/41007517.
  if (event.GetType() == input::NativeWebKeyboardEvent::Type::kChar) {
    return false;
  }

  // Do not fire shortcuts on key up, and only forward shortcuts if we have an
  // underlying os event.
  return event.os_event && event.os_event.Get().type == NSEventTypeKeyDown;
}

}  // namespace

#if BUILDFLAG(ENABLE_AUX_SHELL)
bool WebUIBrowserWindow::SetAuxShortcuts(const base::ListValue& bindings) {
  std::map<ui::Accelerator, std::pair<std::string, bool>> next;
  for (const auto& value : bindings) {
    const auto& row = value.GetDict();
    const std::string key = base::ToLowerASCII(*row.FindString("key"));
    ui::KeyboardCode code = ui::VKEY_UNKNOWN;
    NSString* text = [NSString stringWithUTF8String:key.c_str()];
    if (text.length == 1) code = ui::KeyboardCodeFromCharCode([text characterAtIndex:0]);
    const std::map<std::string, ui::KeyboardCode> named = {
        {" ", ui::VKEY_SPACE}, {"space", ui::VKEY_SPACE}, {"tab", ui::VKEY_TAB}, {"enter", ui::VKEY_RETURN},
        {"escape", ui::VKEY_ESCAPE}, {"backspace", ui::VKEY_BACK},
        {"delete", ui::VKEY_DELETE}, {"left", ui::VKEY_LEFT},
        {"right", ui::VKEY_RIGHT}, {"up", ui::VKEY_UP},
        {"down", ui::VKEY_DOWN}, {"home", ui::VKEY_HOME},
        {"end", ui::VKEY_END}, {"pageup", ui::VKEY_PRIOR},
        {"pagedown", ui::VKEY_NEXT}};
    if (auto found = named.find(key); found != named.end()) code = found->second;
    int function = 0;
    if (key.starts_with("f") && base::StringToInt(key.substr(1), &function) &&
        function >= 1 && function <= 24)
      code = static_cast<ui::KeyboardCode>(ui::VKEY_F1 + function - 1);
    if (code == ui::VKEY_UNKNOWN) return false;
    const int modifiers = (*row.FindBool("meta") ? ui::EF_COMMAND_DOWN : 0) |
        (*row.FindBool("ctrl") ? ui::EF_CONTROL_DOWN : 0) |
        (*row.FindBool("shift") ? ui::EF_SHIFT_DOWN : 0) |
        (*row.FindBool("alt") ? ui::EF_ALT_DOWN : 0);
    if (!aux::IsAllowedAuxShortcut(ui::Accelerator(code, modifiers))) return false;
    next[ui::Accelerator(code, modifiers)] = {*row.FindString("commandId"), row.FindBool("focusShell").value_or(false)};
  }
  std::vector<ui::Accelerator> quick_ask;
  for (const auto& [accelerator, command] : next)
    if (command.first == "quick-ask") quick_ask.push_back(accelerator);
  aux::SetQuickAskShortcutBindings(browser_->GetProfile(), quick_ask);
  auto* focus = widget_->GetFocusManager();
  focus->UnregisterAccelerators(this);
  aux_shortcuts_ = std::move(next);
  for (const auto& [accelerator, command] : aux_shortcuts_)
    focus->RegisterAccelerator(accelerator, ui::AcceleratorManager::kHighPriority, this);
  return true;
}

namespace {
content::WebContents* FocusedAuxWebsite(BrowserWindowInterface* browser) {
  auto* contents = browser->GetTabStripModel()->GetActiveWebContents();
  return contents && contents->GetPrimaryMainFrame() &&
      contents->ContainsOrIsFocusedWebContents() &&
      contents->GetRenderWidgetHostView() && contents->GetRenderWidgetHostView()->HasFocus() &&
      contents->GetLastCommittedURL().SchemeIsHTTPOrHTTPS() ? contents : nullptr;
}
bool IsAuxShortcutDocument(content::WebContents* contents, int64_t navigation_id,
                           const std::string& url) {
  return contents && contents->GetPrimaryMainFrame() &&
      contents->GetPrimaryMainFrame()->GetNavigationId() == navigation_id &&
      contents->GetLastCommittedURL().spec() == url;
}
}  // namespace

// Cocoa calls its responder delegate before rejecting unmatched releases.
// Only the exact physical second press can authorize this one-shot handoff.
bool WebUIBrowserWindow::HandleAuxWebsiteKeyEvent(
    const input::NativeWebKeyboardEvent& event,
    content::WebContents* event_contents) {
  NSEvent* physical = event.os_event.Get();
  if (!physical || !aux_site_shortcut_release_) return false;
  if (physical.type == NSEventTypeKeyDown) {
    if (!physical.isARepeat) aux_site_shortcut_release_.reset();
    return false;
  }
  if (physical.type != NSEventTypeKeyUp ||
      physical.keyCode != aux_site_shortcut_release_->key_code) return false;
  auto pair = std::exchange(aux_site_shortcut_release_, std::nullopt);
  auto* contents = pair->contents.get();
  NSWindow* owner = pair->window.GetNativeNSWindow();
  auto* focused_frame = event_contents ? event_contents->GetFocusedFrame() : nullptr;
  // SurfaceEmbed guests share the shell's Cocoa responder. Its actual focused
  // frame must still belong to the captured guest; root-view focus is not enough.
  if (!owner || physical.timestamp < pair->pressed_at ||
      GetNativeWindow().GetNativeNSWindow() != owner || NSApp.keyWindow != owner ||
      (physical.window && physical.window != owner) ||
      !contents || FocusedAuxWebsite(browser_.get()) != contents ||
      !IsAuxShortcutDocument(contents, pair->navigation_id, pair->url) ||
      !event_contents || (event_contents != contents && FromWebShellWebContents(event_contents) != this) ||
      !focused_frame || content::WebContents::FromRenderFrameHost(focused_frame) != contents) return false;
  input::NativeWebKeyboardEvent release = event;
  release.skip_if_unhandled = true;
  contents->GetRenderWidgetHostView()->GetRenderWidgetHost()->ForwardKeyboardEvent(release);
  return true;
}

bool WebUIBrowserWindow::HasAuxAccelerator(const ui::Accelerator& accelerator) const {
  return aux_shortcuts_.contains(accelerator);
}

bool WebUIBrowserWindow::DispatchAuxAccelerator(const ui::Accelerator& accelerator,
                                               const input::NativeWebKeyboardEvent* event) {
  NSEvent* native_down = event ? event->os_event.Get() : NSApp.currentEvent;
  if (native_down) {
    input::NativeWebKeyboardEvent physical{base::apple::OwnedNSEvent(native_down)};
    HandleAuxWebsiteKeyEvent(physical, nullptr);
  }
  auto found = aux_shortcuts_.find(accelerator);
  if (found == aux_shortcuts_.end()) return false;
  if (found->second.first.empty()) return true;
  auto* shell = GetWebUIBrowserUI();
  if (!shell) return false;
  const std::string& id = found->second.first;
  std::optional<base::UnguessableToken> warm_input_receipt;
  // Record only this genuine registered physical input before the shortcut
  // hands control to asynchronous shell JS. WebUI origin is not authority.
  if (native_down && native_down == NSApp.currentEvent &&
      native_down.type == NSEventTypeKeyDown && !native_down.isARepeat &&
      native_down.window == GetNativeWindow().GetNativeNSWindow() &&
      native_down.window == NSApp.keyWindow) {
    input::NativeWebKeyboardEvent physical{base::apple::OwnedNSEvent(native_down)};
    if (ui::GetAcceleratorFromNativeWebKeyboardEvent(physical) == accelerator &&
        !(physical.GetModifiers() & blink::WebInputEvent::kFromDebugger)) {
      auto* source = shell->web_ui()->GetWebContents()->GetPrimaryMainFrame();
      if (source) content::RecordPictureInPictureUserInput(*source, physical);
#if BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
      if (id == "new-window") {
        auto ticket = aux::NativeAuxWarmCreationTicket::PreparedTicket();
        auto original_browser = browser_->GetWeakPtr();
        auto original_shell = shell->GetWeakPtr();
        if (ticket) warm_input_receipt = ticket->CaptureRegisteredShortcut(original_browser.get(), id);
        // Refusal can synchronously tear down the measured owner. Do not
        // resume this dispatch using raw window/UI pointers afterward.
        if (!original_browser || !original_shell) return true;
      }
#endif
    }
  }
  if (native_down && native_down.isARepeat)
    return shell->DispatchAuxShortcut(id, found->second.second);
  auto* contents = FocusedAuxWebsite(browser_.get());
  const bool site_chord = !found->second.second && contents &&
      id != "new-tab" && id != "new-window" && id != "new-private-window" &&
      id != "close-tab" && id != "close-window" && id != "reopen-closed-tab" &&
      id != "quick-ask" && id != "tab-next" && id != "tab-previous" &&
      !id.starts_with("tab-") && !id.starts_with("space-") && !id.starts_with("profile-");
  const base::TimeTicks now = base::TimeTicks::Now();
  if (site_chord && id == aux_site_shortcut_id_ &&
      aux_site_shortcut_accelerator_ && *aux_site_shortcut_accelerator_ == accelerator &&
      aux_site_shortcut_contents_.get() == contents &&
      IsAuxShortcutDocument(contents, aux_site_shortcut_navigation_id_, aux_site_shortcut_url_) &&
      now - aux_site_shortcut_at_ <= base::Milliseconds(800) &&
      native_down && native_down.type == NSEventTypeKeyDown && !native_down.isARepeat) {
    aux_site_shortcut_release_ = AuxWebsiteShortcutRelease{
        contents->GetWeakPtr(), GetNativeWindow(), aux_site_shortcut_navigation_id_,
        aux_site_shortcut_url_, native_down.keyCode, native_down.timestamp};
    aux_site_shortcut_id_.clear();
    shell->DispatchAuxShortcut(id, false, true);
    input::NativeWebKeyboardEvent forwarded = event ? *event :
        input::NativeWebKeyboardEvent(base::apple::OwnedNSEvent(native_down));
    forwarded.skip_if_unhandled = true;
    contents->Focus();
    auto* host = contents->GetRenderWidgetHostView()->GetRenderWidgetHost();
    host->ForwardKeyboardEvent(forwarded);
    return true;
  }
  aux_site_shortcut_id_ = site_chord ? id : "";
  aux_site_shortcut_accelerator_ = site_chord ? std::optional<ui::Accelerator>(accelerator) : std::nullopt;
  aux_site_shortcut_at_ = now;
  aux_site_shortcut_navigation_id_ = site_chord ? contents->GetPrimaryMainFrame()->GetNavigationId() : 0;
  aux_site_shortcut_url_ = site_chord ? contents->GetLastCommittedURL().spec() : "";
  aux_site_shortcut_contents_ = site_chord ? contents->GetWeakPtr() : base::WeakPtr<content::WebContents>();
  return shell->DispatchAuxShortcut(id, found->second.second,
                                   site_chord ? std::optional<bool>(false) : std::nullopt,
                                   warm_input_receipt);
}
#endif

bool WebUIBrowserWindow::HandleKeyboardEvent(
    const input::NativeWebKeyboardEvent& event) {
  if (!ShouldHandleKeyboardEvent(event)) {
    return false;
  }

  // On Mac keyboard shortcuts are caught by the menu entries, so the keyboard
  // shortcut events must be redispatched to the system so properly configured
  // menu items can catch the keyboard shortcuts.
  return views::NativeWidgetMacNSWindowHost::GetFromNativeWindow(
             GetNativeWindow())
      ->RedispatchKeyEvent(event.os_event.Get());
}

// Note that the logic here is often derived from BrowserNativeWidgetMac.
class WebUIBrowserNativeWidgetMac : public views::NativeWidgetMac {
 public:
  WebUIBrowserNativeWidgetMac(BrowserWindowInterface* browser,
                              views::Widget* widget)
      : NativeWidgetMac(widget), browser_(browser) {}

 private:
  // views::NativeWidgetMac implementation:
  void OnWidgetDestroyed(views::Widget* widget) override {
    browser_ = nullptr;
    NativeWidgetMac::OnWidgetDestroyed(widget);
  }

  void ValidateUserInterfaceItem(
      int32_t command,
      remote_cocoa::mojom::ValidateUserInterfaceItemResult* result) override {
    CHECK(browser_);
    // This allows menu items like "Close Tabs" to be enabled when the browser
    // has open tabs, which in turn enables the "Close Tabs" keyboard shortcut.
    result->enable = chrome::IsCommandEnabled(browser_, command);
  }

  // For our ValidateUserInterfaceItem() to be called we must register the
  // CommandDispatcher.
  void OnWindowInitialized() override {
    if (auto* bridge = GetInProcessNSWindowBridge()) {
      bridge->SetCommandDispatcher(
          [[ChromeCommandDispatcherDelegate alloc] init],
          [[BrowserWindowCommandHandler alloc] init]);

    } else {
      if (auto* host = GetHostForBrowser(browser_)) {
        host->GetAppShim()->CreateCommandDispatcherForWidget(
            GetNSWindowHost()->bridged_native_widget_id());
      }
    }
  }

  void OnWidgetInitDone() override {
    NativeWidgetMac::OnWidgetInitDone();
    // The bridge creates its real content view after OnWindowInitialized.
    // Install the material only once that view and its compositor exist.
    if (auto* bridge = GetInProcessNSWindowBridge()) {
#if BUILDFLAG(ENABLE_AUX_SHELL)
      const PrefService* prefs = browser_->GetProfile()->GetPrefs();
      ApplyAuxAppearance(
          bridge->ns_window(), GetNSWindowHost(),
          prefs->GetString(aux::kAppearanceThemePref),
          prefs->GetBoolean(aux::kAppearanceGlassPref),
          prefs->GetString(aux::kAppearanceMaterialPref));
#endif
    }
  }

#if BUILDFLAG(ENABLE_AUX_SHELL)
  std::optional<input::NativeWebKeyboardEvent> AuxCommandKeyEvent() {
    auto* window = WebUIBrowserWindow::FromBrowser(browser_);
    NSEvent* event = NSApp.currentEvent;
    if (!window || !event || event.type != NSEventTypeKeyDown ||
        event.window != window->GetNativeWindow().GetNativeNSWindow() ||
        event.window != NSApp.keyWindow) return std::nullopt;
    return input::NativeWebKeyboardEvent(base::apple::OwnedNSEvent(event));
  }
#endif

  bool WillExecuteCommand(int32_t command,
                          WindowOpenDisposition window_open_disposition,
                          bool is_before_first_responder) override {
    CHECK(browser_);
#if BUILDFLAG(ENABLE_AUX_SHELL)
    if (auto event = AuxCommandKeyEvent(); event &&
        WebUIBrowserWindow::FromBrowser(browser_)->HasAuxAccelerator(
            ui::GetAcceleratorFromNativeWebKeyboardEvent(*event))) return true;
#endif
    if (is_before_first_responder) {
      // The specification for this private extensions API is incredibly vague.
      // For now, we avoid triggering chrome commands prior to giving the
      // firstResponder a chance to handle the event.
      if (ui::GlobalAcceleratorListener::GetInstance() &&
          ui::GlobalAcceleratorListener::GetInstance()
              ->IsShortcutHandlingSuspended()) {
        return false;
      }

      // If a command is reserved, then we also have it bypass the main menu.
      // This is based on the rough approximation that reserved commands are
      // also the ones that we want to be quickly repeatable.
      // https://crbug.com/41385540.
      // The function IsReservedCommandOrKey does not examine its event argument
      // on macOS.
      input::NativeWebKeyboardEvent dummy_event(
          blink::WebInputEvent::Type::kKeyDown, 0, base::TimeTicks());
      if (!chrome::BrowserCommandController::From(browser_)
               ->IsReservedCommandOrKey(command, dummy_event)) {
        return false;
      }
    }

    return true;
  }

  bool ExecuteCommand(int32_t command,
                      WindowOpenDisposition window_open_disposition,
                      bool is_before_first_responder) override {
#if BUILDFLAG(ENABLE_AUX_SHELL)
    // AppKit menu equivalents can precede the WebContents/focus-manager path.
    // Use the actual event and current registry before Chrome's default command.
    if (auto event = AuxCommandKeyEvent()) {
      auto* window = WebUIBrowserWindow::FromBrowser(browser_);
      const auto accelerator = ui::GetAcceleratorFromNativeWebKeyboardEvent(*event);
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
      // The test-only owning fixture can defer an actual registered tab command
      // until the SAME shell widget has armed this original NSEvent TimeTicks.
      // The eventual effect is still the current registered Aux dispatcher.
      auto* controller = window ? window->GetWebUIBrowserUI() : nullptr;
      if (controller && window->HasAuxAccelerator(accelerator) &&
          controller->DeferAuxGuestTabSwitchForTesting(event->os_event, base::BindOnce(
              [](base::WeakPtr<WebUIBrowserUI> ui, input::NativeWebKeyboardEvent event) {
                auto* current = ui ? ui->browser_window() : nullptr;
                if (current) current->DispatchAuxAccelerator(
                    ui::GetAcceleratorFromNativeWebKeyboardEvent(event), &event);
              }, controller->GetWeakPtr(), *event))) return true;
#endif
      if (window && window->DispatchAuxAccelerator(accelerator, &*event)) return true;
    }
#endif
    if (!WillExecuteCommand(command, window_open_disposition,
                            is_before_first_responder)) {
      return false;
    }

    // Actually Execute the specific command with |browser_|.
    // This facilitates commands initiated from keyboard shortcuts.
    chrome::ExecuteCommandWithDisposition(browser_, command,
                                          window_open_disposition);
    return true;
  }

  // views::NativeWidget implementation:
  views::internal::NativeWidgetPrivate* AsNativeWidgetPrivate() override {
    return this;
  }

  void PopulateCreateWindowParams(
      const views::Widget::InitParams& widget_params,
      remote_cocoa::mojom::CreateWindowParams* params) override {
    // Loosely based on BrowserNativeWidgetMac::PopulateCreateWindowParams().
    params->style_mask = NSWindowStyleMaskTitled | NSWindowStyleMaskClosable |
                         NSWindowStyleMaskMiniaturizable |
                         NSWindowStyleMaskResizable |
                         NSWindowStyleMaskFullSizeContentView;
    params->window_class = remote_cocoa::mojom::WindowClass::kBrowser;
    // Ensure tabstrip/profile button are visible.
    params->titlebar_appears_transparent = true;
    params->window_title_hidden = true;
    params->animation_enabled = true;
  }

  void GetWindowFrameTitlebarHeight(bool* override_titlebar_height,
                                    float* titlebar_height) override {
    *override_titlebar_height = true;
    *titlebar_height = 40;
  }

  raw_ptr<BrowserWindowInterface> browser_;
};

views::NativeWidget* WebUIBrowserWindow::CreateNativeWidget() {
  return new WebUIBrowserNativeWidgetMac(browser_.get(), widget_.get());
}

bool WebUIBrowserWindow::IsOnCurrentWorkspace() const {
  NSWindow* window = GetNativeWindow().GetNativeNSWindow();
  return window && window.isOnActiveSpace;
}

#if BUILDFLAG(ENABLE_AUX_SHELL)
bool WebUIBrowserWindow::SetAuxWindowControlsVisible(bool visible) {
  if (!GetNativeWindow().GetNativeNSWindow()) return false;
  aux_window_controls_requested_ = visible;
  UpdateAuxWindowControlsForCursor();
  return true;
}

void WebUIBrowserWindow::UpdateAuxWindowControlsForCursor() {
  NSWindow* window = GetNativeWindow().GetNativeNSWindow();
  if (!window) return;
  const NSPoint cursor = window.mouseLocationOutsideOfEventStream;
  const CGFloat height = window.contentView.bounds.size.height;
  const bool corner = window.isKeyWindow && cursor.x >= 0 && cursor.x < 60 &&
                      cursor.y <= height && cursor.y > height - 40;
  const bool visible = aux_window_controls_requested_ || corner;
  if (visible == aux_window_controls_shown_) return;
  aux_window_controls_shown_ = visible;
  const bool reduce_motion = NSWorkspace.sharedWorkspace.accessibilityDisplayShouldReduceMotion;
  for (NSWindowButton kind : {NSWindowCloseButton, NSWindowMiniaturizeButton,
                              NSWindowZoomButton}) {
    NSButton* button = [window standardWindowButton:kind];
    if (!button) continue;
    if (visible) button.hidden = NO;
    [NSAnimationContext runAnimationGroup:^(NSAnimationContext* context) {
      context.duration = reduce_motion ? 0 : 0.2;
      button.animator.alphaValue = visible ? 1 : 0;
    } completionHandler:^{
      if (!visible && button.alphaValue == 0) button.hidden = YES;
    }];
  }
}


#if BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
base::DictValue WebUIBrowserWindow::GetAuxAppearanceSnapshot() const {
  NSWindow* window = GetNativeWindow().GetNativeNSWindow();
  if (!window || !window.visible || window.windowNumber <= 0 ||
      window.windowNumber > std::numeric_limits<int>::max()) return {};
  const CGWindowID window_id = static_cast<CGWindowID>(window.windowNumber);
  CFArrayRef windows = CGWindowListCopyWindowInfo(
      kCGWindowListOptionIncludingWindow, window_id);
  if (!windows) return {};
  CGRect bounds;
  bool owned = false;
  if (CFArrayGetCount(windows) == 1) {
    NSDictionary* info = (__bridge NSDictionary*)CFArrayGetValueAtIndex(windows, 0);
    owned = [info[(__bridge NSString*)kCGWindowOwnerPID] intValue] == base::GetCurrentProcId() &&
        [info[(__bridge NSString*)kCGWindowNumber] unsignedIntValue] == window_id &&
        CGRectMakeWithDictionaryRepresentation(
            (__bridge CFDictionaryRef)info[(__bridge NSString*)kCGWindowBounds], &bounds);
  }
  CFRelease(windows);
  if (!owned || !std::isfinite(bounds.origin.x) ||
      !std::isfinite(bounds.origin.y) || !std::isfinite(bounds.size.width) ||
      !std::isfinite(bounds.size.height) || bounds.size.width <= 0 ||
      bounds.size.height <= 0) return {};
  base::DictValue result, frame;
  result.Set("pid", base::GetCurrentProcId());
  result.Set("windowId", static_cast<int>(window_id));
  frame.Set("x", bounds.origin.x); frame.Set("y", bounds.origin.y);
  frame.Set("width", bounds.size.width); frame.Set("height", bounds.size.height);
  result.Set("frame", std::move(frame));
  NSString* theme = [window.effectiveAppearance bestMatchFromAppearancesWithNames:
      @[NSAppearanceNameAqua, NSAppearanceNameDarkAqua]];
  if ([theme isEqualToString:NSAppearanceNameAqua]) result.Set("nativeTheme", "light");
  else if ([theme isEqualToString:NSAppearanceNameDarkAqua]) result.Set("nativeTheme", "dark");
  else result.Set("nativeTheme", base::Value());
  NSString* installed = objc_getAssociatedObject(window, &kAuxMaterialKey);
  NSView* effect = objc_getAssociatedObject(window, &kAuxMaterialViewKey);
  const char* backing = nullptr;
  const char* material = nullptr;
  if ([installed isEqualToString:@"solid"] && !effect && window.opaque) {
    backing = "solid"; material = "solid";
  } else if (effect && !effect.hidden && effect.alphaValue > 0 &&
             effect.superview == window.contentView) {
    if ([effect isKindOfClass:NSClassFromString(@"NSGlassEffectView")]) {
      backing = "liquid-glass"; material = "liquid-glass";
    } else if ([effect isKindOfClass:[NSVisualEffectView class]]) {
      backing = "visual-effect";
      switch (((NSVisualEffectView*)effect).material) {
        case NSVisualEffectMaterialSidebar: material = "sidebar"; break;
        case NSVisualEffectMaterialUnderWindowBackground: material = "under-window"; break;
        case NSVisualEffectMaterialTitlebar: material = "titlebar"; break;
        default: break;
      }
    }
  }
  result.Set("backing", backing ? base::Value(backing) : base::Value());
  result.Set("material", material ? base::Value(material) : base::Value());
  result.Set("observedAtUnixMs", static_cast<double>(
      base::Time::Now().InMillisecondsSinceUnixEpoch()));
  return result;
}
#endif

void WebUIBrowserWindow::SetAuxAppearance(const std::string& theme,
                                         bool translucent,
                                         const std::string& material) {
  auto* host = views::NativeWidgetMacNSWindowHost::GetFromNativeWindow(GetNativeWindow());
  ApplyAuxAppearance(GetNativeWindow().GetNativeNSWindow(), host, theme,
                     translucent, material);
}
#endif
