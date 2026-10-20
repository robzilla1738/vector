// Copyright 2026 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#include "chrome/browser/ui/webui/aux_importer/import_standalone_window.h"

#import <AppKit/AppKit.h>
#import <QuartzCore/QuartzCore.h>

#include <optional>
#include <utility>

#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_init_state.h"
#include "chrome/browser/ui/browser_tabstrip.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface_iterator.h"
#include "chrome/browser/ui/browser_window/public/create_browser_window.h"
#include "chrome/browser/ui/navigator/browser_navigator_params.h"
#include "skia/ext/skia_utils_mac.h"
#include "ui/base/base_window.h"
#include "ui/color/color_provider_key.h"
#include "ui/display/display.h"
#include "ui/display/screen.h"
#include "ui/gfx/geometry/rect.h"
#include "ui/views/widget/widget.h"
#include "url/gurl.h"

namespace aux_importer {
namespace {
constexpr char kAppName[] = "aux-import-data";

void ConfigureImporterWindow(gfx::NativeWindow native_window) {
  NSWindow* window = native_window.GetNativeNSWindow();
  if (!window) {
    return;
  }
  auto* widget = views::Widget::GetWidgetForNativeWindow(native_window);
  if (!widget) {
    return;
  }
  auto widget_weak = widget->GetWeakPtr();
  window.styleMask =
      (window.styleMask & ~(NSWindowStyleMaskMiniaturizable |
                            NSWindowStyleMaskResizable)) |
      NSWindowStyleMaskFullSizeContentView;
  if (!(window.collectionBehavior & NSWindowCollectionBehaviorFullScreenAuxiliary)) {
    window.collectionBehavior &= ~(NSWindowCollectionBehaviorFullScreenPrimary |
                                   NSWindowCollectionBehaviorFullScreenAuxiliary);
  }
  if (!widget_weak) {
    return;
  }
  // Original role243 is kColorAsideHoverCardBackground. Resolve the actual
  // widget color mode BEFORE the source's explicit DarkAqua appearance change.
  const bool dark = widget_weak->GetColorMode() ==
                    ui::ColorProviderKey::ColorMode::kDark;
  NSColor* background = skia::SkColorToSRGBNSColor(
      dark ? 0xff18181b : 0xffffffff);
  window.appearance = [NSAppearance appearanceNamed:NSAppearanceNameDarkAqua];
  window.opaque = YES;
  window.backgroundColor = background;
  NSView* content = window.contentView;
  if (content) {
    content.wantsLayer = YES;
    content.layer.backgroundColor = background.CGColor;
    NSView* parent = content.superview;
    if (parent) {
      parent.wantsLayer = YES;
      parent.layer.backgroundColor = background.CGColor;
    }
  }
  window.title = @"";
  window.titleVisibility = NSWindowTitleHidden;
  window.titlebarAppearsTransparent = YES;
  window.movableByWindowBackground = YES;
  [[window standardWindowButton:NSWindowCloseButton] setHidden:NO];
  [[window standardWindowButton:NSWindowCloseButton] setEnabled:YES];
  [[window standardWindowButton:NSWindowMiniaturizeButton] setHidden:YES];
  [[window standardWindowButton:NSWindowMiniaturizeButton] setEnabled:NO];
  [[window standardWindowButton:NSWindowZoomButton] setHidden:YES];
  [[window standardWindowButton:NSWindowZoomButton] setEnabled:NO];
  // Preserve the actual final source sequence, which enables all three even
  // though the miniaturize and zoom controls remain hidden.
  [[window standardWindowButton:NSWindowCloseButton] setEnabled:YES];
  [[window standardWindowButton:NSWindowMiniaturizeButton] setEnabled:YES];
  [[window standardWindowButton:NSWindowZoomButton] setEnabled:YES];
}
}  // namespace

BrowserWindowInterface* ShowStandaloneImporter(
    Profile& profile, BrowserWindowInterface* owning_window) {
  Profile* original = profile.GetOriginalProfile();
  for (auto* browser : GetAllBrowserWindowInterfaces()) {
    const auto* state = BrowserInitState::From(browser);
    if (state && state->create_params().app_name == kAppName &&
        browser->GetWindow() &&
        browser->GetProfile()->GetOriginalProfile() == original) {
      auto weak = browser->GetWeakPtr();
      browser->GetWindow()->Show();
      if (weak) {
        weak->GetWindow()->Activate();
      }
      return weak.get();
    }
  }
  if (GetBrowserWindowCreationStatusForProfile(profile) !=
          BrowserWindowInterface::CreationStatus::kOk ||
      profile.IsOffTheRecord()) {
    return nullptr;
  }
  gfx::Rect anchor;
  if (owning_window && owning_window->GetWindow()) {
    anchor = owning_window->GetWindow()->GetBounds();
    if (anchor.IsEmpty()) {
      anchor = owning_window->GetWindow()->GetRestoredBounds();
    }
  }
  auto* screen = display::Screen::Get();
  const gfx::Rect work_area = anchor.IsEmpty()
      ? screen->GetPrimaryDisplay().work_area()
      : screen->GetDisplayMatching(anchor).work_area();
  if (anchor.IsEmpty()) {
    anchor = work_area;
  }
  gfx::Rect bounds(anchor.x() + (anchor.width() - 720) / 2,
                   anchor.y() + (anchor.height() - 500) / 2, 720, 500);
  if (!work_area.IsEmpty()) {
    bounds.AdjustToFit(work_area);
  }
  auto profile_weak = profile.GetWeakPtr();
  auto params = BrowserWindowCreateParams::CreateForAppPopup(
      kAppName, /*trusted_source=*/true, bounds, &profile,
      /*user_gesture=*/true);
  params.omit_from_session_restore = true;
  params.should_trigger_session_restore = false;
  auto* browser = CreateBrowserWindow(std::move(params));
  if (!browser || !profile_weak) {
    return nullptr;
  }
  auto weak = browser->GetWeakPtr();
  auto* contents = chrome::AddAndReturnTabAt(
      browser, GURL("chrome://aux-import-data/"), -1, true, std::nullopt, false,
      NavigateParams::WindowAction::kNoAction);
  if (!weak) {
    return nullptr;
  }
  if (!contents) {
    // Only the owner created above is retired on a real navigation failure.
    if (auto* widget = views::Widget::GetWidgetForNativeWindow(
            weak->GetWindow()->GetNativeWindow())) {
      widget->CloseNow();
    }
    return nullptr;
  }
  ConfigureImporterWindow(weak->GetWindow()->GetNativeWindow());
  if (weak) {
    weak->GetWindow()->Show();
  }
  return weak.get();
}
}  // namespace aux_importer
