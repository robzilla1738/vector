// Copyright 2026 Aux Authors. All rights reserved.
#import <AppKit/AppKit.h>

namespace extensions {
namespace {
__weak NSWindow* g_previous_key_window;
bool g_activation_captured = false;
}  // namespace
void CaptureAuxPopupActivation() {
  if (g_activation_captured) {
    return;
  }
  g_activation_captured = true;
  g_previous_key_window = NSApp.isActive ? NSApp.keyWindow : nil;
}
void ClearAuxPopupActivation() {
  g_activation_captured = false;
  g_previous_key_window = nil;
}
void RestoreAuxPopupActivation() {
  NSWindow* previous = g_previous_key_window;
  ClearAuxPopupActivation();
  if (previous.isVisible && previous.canBecomeKeyWindow) {
    [previous makeKeyAndOrderFront:nil];
  }
}
}  // namespace extensions
