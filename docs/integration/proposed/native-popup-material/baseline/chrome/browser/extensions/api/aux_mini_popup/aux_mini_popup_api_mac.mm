// Copyright 2026 Aux Authors. All rights reserved.
#import <AppKit/AppKit.h>
#import <QuartzCore/QuartzCore.h>

#include "ui/gfx/native_ui_types.h"
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
void ApplyAuxPopupMaterial(gfx::NativeWindow native_window) {
  NSWindow* window = native_window.GetNativeNSWindow();
  if (!window) {
    return;
  }
  window.opaque = NO;
  window.backgroundColor = NSColor.clearColor;
  NSView* contents = window.contentView;
  contents.wantsLayer = YES;
  contents.layer.cornerRadius = 16;
  contents.layer.masksToBounds = YES;
  if (NSWorkspace.sharedWorkspace
          .accessibilityDisplayShouldReduceTransparency) {
    window.backgroundColor = NSColor.windowBackgroundColor;
    return;
  }
  NSVisualEffectView* effect =
      [[NSVisualEffectView alloc] initWithFrame:contents.bounds];
  effect.material = NSVisualEffectMaterialHUDWindow;
  effect.blendingMode = NSVisualEffectBlendingModeBehindWindow;
  effect.state = NSVisualEffectStateActive;
  effect.autoresizingMask = NSViewWidthSizable | NSViewHeightSizable;
  [contents addSubview:effect positioned:NSWindowBelow relativeTo:nil];
}
}  // namespace extensions
