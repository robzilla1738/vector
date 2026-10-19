// Copyright 2026 Aux Authors. All rights reserved.
#import <AppKit/AppKit.h>
#import <QuartzCore/QuartzCore.h>

#include "ui/gfx/native_ui_types.h"
namespace extensions {
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
