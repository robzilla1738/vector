// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
// Reuses Chromium's native DownloadItem drag transport for an explicitly chosen
// and identity-checked file; paths never originate in a renderer API argument.
#include "chrome/browser/ui/aux_chosen_files_service.h"
#import <Cocoa/Cocoa.h>
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "components/remote_cocoa/common/native_widget_ns_window.mojom.h"
#include "ui/gfx/geometry/clamp_float_geometry.h"
#include "ui/views/cocoa/native_widget_mac_ns_window_host.h"
#include "ui/views/widget/widget.h"
namespace aux::files {
bool BeginVerifiedFileDrag(Profile* profile, const base::FilePath& path,
                            const base::DictValue& expected, gfx::NativeView native_view,
                            base::RepeatingCallback<bool()> current) {
  if (!profile || !native_view || !current) return false;
  auto profile_owner = profile->GetWeakPtr();
  if (!current.Run()) return false;
  NSView* view = native_view.GetNativeNSView();
  if (!view || !view.window) return false;
  auto* browser_view = BrowserView::GetBrowserViewForNativeWindow(gfx::NativeWindow(view.window));
  if (!browser_view || browser_view->GetProfile() != profile) return false;
  const auto window_owner = browser_view->browser()->GetWeakPtr();
  auto binding_current = [&] {
    if (!profile_owner || !window_owner || window_owner->GetProfile() != profile_owner.get() ||
        !current.Run() || !view.window) return false;
    auto* active_view = BrowserView::GetBrowserViewForNativeWindow(gfx::NativeWindow(view.window));
    return active_view && active_view->browser() == window_owner.get();
  };
  if (!binding_current()) return false;
  const auto actual = FingerprintRegularFile(path);
  if (!actual || *actual != expected) return false;
  auto* host = views::NativeWidgetMacNSWindowHost::GetFromNativeView(native_view);
  if (!host || !host->GetNSWindowMojo()) return false;
  NSPoint location = view.window.mouseLocationOutsideOfEventStream;
  auto data = remote_cocoa::mojom::FileDragData::New();
  data->file_path = path;
  data->image_offset = gfx::Vector2d(8, 8);
  auto* widget = views::Widget::GetWidgetForNativeView(native_view);
  if (widget) widget->ReleaseCapture();
  // Capture release may destroy the source window, so reacquire its host.
  host = views::NativeWidgetMacNSWindowHost::GetFromNativeView(native_view);
  if (!host || !host->GetNSWindowMojo() || !binding_current()) return false;
  const auto after_release = FingerprintRegularFile(path);
  if (!after_release || *after_release != expected || !binding_current()) return false;
  host->GetNSWindowMojo()->BeginFileDrag(std::move(data),
      gfx::PointF(gfx::ClampFloatGeometry(location.x), gfx::ClampFloatGeometry(location.y)));
  return true;
}
}  // namespace aux::files
