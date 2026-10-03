// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_warm_input.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#import <Cocoa/Cocoa.h>
#include <cmath>
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window.h"
#include "ui/events/base_event_utils.h"
namespace aux {
std::optional<NativeWarmInput> ReadNativeWarmCurrentKeyDown(
    BrowserWindowInterface* actual_original, base::FunctionRef<bool()> original_stable) {
  auto original = actual_original ? actual_original->GetWeakPtr() : base::WeakPtr<BrowserWindowInterface>();
  if (!original || !original_stable() || !original) return std::nullopt;
  if (!original || !original->GetWindow()) return std::nullopt;
  NSWindow* actual_window = original->GetWindow()->GetNativeWindow().GetNativeNSWindow();
  NSEvent* event = NSApp.currentEvent;
  const auto modifiers = event.modifierFlags & NSEventModifierFlagDeviceIndependentFlagsMask;
  if (!actual_window || !event || event.type != NSEventTypeKeyDown || [event isARepeat] ||
      event.window != actual_window || NSApp.keyWindow != actual_window ||
      !actual_window.isVisible || !actual_window.isKeyWindow ||
      event.windowNumber != actual_window.windowNumber ||
      (modifiers & ~NSEventModifierFlagCapsLock) != NSEventModifierFlagCommand ||
      ![event.charactersIgnoringModifiers.lowercaseString isEqualToString:@"n"]) return std::nullopt;
  CGEventRef actual_cg = event.CGEvent;
  const double seconds = event.timestamp;
  if (!actual_cg || !std::isfinite(seconds) || seconds <= 0 ||
      CGEventGetType(actual_cg) != kCGEventKeyDown ||
      CGEventGetIntegerValueField(actual_cg, kCGKeyboardEventAutorepeat) != 0 ||
      CGEventGetIntegerValueField(actual_cg, kCGKeyboardEventKeycode) != event.keyCode) return std::nullopt;
  NativeWarmInput result;
  result.original_event_time = ui::EventTimeStampFromSeconds(seconds);
  // EventTimeFromNative can replace bad native clocks with Now. Keep the
  // original event endpoint instead and refuse invalid/future/stale timebases.
  const auto now = base::TimeTicks::Now();
  if (result.original_event_time.is_null() || result.original_event_time > now ||
      now - result.original_event_time > base::Seconds(1)) return std::nullopt;
  result.original_event_seconds = seconds;
  result.original_cg_timestamp_ns = CGEventGetTimestamp(actual_cg);
  result.window_number = event.windowNumber;
  result.source_pid = CGEventGetIntegerValueField(actual_cg, kCGEventSourceUnixProcessID);
  result.source_state = CGEventGetIntegerValueField(actual_cg, kCGEventSourceStateID);
  result.key_code = event.keyCode;
  result.cg_flags = CGEventGetFlags(actual_cg);
  result.modifier_flags = static_cast<uint64_t>(modifiers);
  if (!result.original_cg_timestamp_ns || !original_stable() || !original ||
      NSApp.currentEvent != event || NSApp.keyWindow != actual_window || !original->GetWindow() ||
      original->GetWindow()->GetNativeWindow().GetNativeNSWindow() != actual_window) return std::nullopt;
  return result;
}
}  // namespace aux
#endif
