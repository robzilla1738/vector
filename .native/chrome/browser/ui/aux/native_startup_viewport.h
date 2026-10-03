// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_STARTUP_VIEWPORT_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_STARTUP_VIEWPORT_H_
#include <optional>
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include "base/memory/weak_ptr.h"
#include "chrome/browser/ui/aux/native_guest_stage_owner.h"
#include "components/viz/common/surfaces/surface_id.h"
#include "ui/gfx/geometry/rect.h"
#include "ui/gfx/geometry/size.h"
class WebUIBrowserUI;
namespace aux {
class NativeAuxWarmCreationTicket;
struct NativeStartupViewportGeometry {
  gfx::Rect shell_screen;
  gfx::Rect client_screen;
  gfx::Rect root_screen;
  gfx::Size shell_pixels;
  gfx::Size root_pixels;
  float shell_scale = 0;
  float root_scale = 0;
  bool operator==(const NativeStartupViewportGeometry&) const = default;
};
// Pure geometry validation, not an authority grant or paint observation.
std::optional<gfx::Rect> ValidateNativeStartupViewportGeometry(
    const NativeStartupViewportGeometry& geometry);
struct NativeStartupViewport {
  NativeGuestStageOwnedSnapshot owner;
  viz::SurfaceId shell_surface;
  NativeStartupViewportGeometry geometry;
  gfx::Rect shell_root_pixels;
  bool operator==(const NativeStartupViewport&) const = default;
};
// Fixed current normal owned-fixture shell only. No caller-supplied geometry,
// foreign window selection, guest creation, or presentation inference.
std::optional<NativeStartupViewport> ReadNativeStartupViewport(
    base::WeakPtr<WebUIBrowserUI> ui);
#if BUILDFLAG(ENABLE_AUX_SHELL)
// Same full native geometry/readback, with exact confirmed warm ticket only.
std::optional<NativeStartupViewport> ReadNativeWarmStartupViewport(
    base::WeakPtr<WebUIBrowserUI> ui,
    base::WeakPtr<NativeAuxWarmCreationTicket> ticket);
#endif
}  // namespace aux
#endif
#endif
