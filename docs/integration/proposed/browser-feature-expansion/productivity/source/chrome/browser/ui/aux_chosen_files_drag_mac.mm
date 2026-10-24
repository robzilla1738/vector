// Copyright 2026 The Aux Authors. BSD-style license: see //LICENSE.
// Reuses Chromium's native DownloadItem drag transport for an explicitly chosen
// and identity-checked file; paths never originate in a renderer API argument.
#include "chrome/browser/ui/aux_chosen_files_service.h"
#import <Cocoa/Cocoa.h>
#include "components/remote_cocoa/common/native_widget_ns_window.mojom.h"
#include "ui/gfx/geometry/clamp_float_geometry.h"
#include "ui/views/cocoa/native_widget_mac_ns_window_host.h"
#include "ui/views/widget/widget.h"
namespace aux::files {
bool BeginVerifiedFileDrag(const base::FilePath& path, const base::DictValue& expected,
                            gfx::NativeView native_view) {
  const auto actual = FingerprintRegularFile(path);
  if (!actual || *actual != expected || !native_view) return false;
  NSView* view = native_view.GetNativeNSView();
  if (!view || !view.window) return false;
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
  if (!host || !host->GetNSWindowMojo()) return false;
  host->GetNSWindowMojo()->BeginFileDrag(std::move(data),
      gfx::PointF(gfx::ClampFloatGeometry(location.x), gfx::ClampFloatGeometry(location.y)));
  return true;
}
}  // namespace aux::files
