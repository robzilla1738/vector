// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_STOCK_MEASUREMENT_NATIVE_STOCK_VIEWS_READINESS_H_
#define CHROME_BROWSER_UI_STOCK_MEASUREMENT_NATIVE_STOCK_VIEWS_READINESS_H_
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS) && !BUILDFLAG(ENABLE_AUX_SHELL)
#include <optional>
#include "ui/gfx/geometry/rect.h"
class BrowserView;
namespace aux {
// Native read-only eligibility, never a presented-frame or root-coverage proof.
// The session must own the original BrowserView/window/Profile/document lease
// and call this only around its actual native paint/commit/hardware callbacks.
std::optional<gfx::Rect> ReadNativeStockViewsReadyRoot(BrowserView* current);
// Geometry only; callers independently fence a native-owned scope before and
// after this read. Cold retains the unique-one-window wrapper above; warm
// supplies its original+exact-created ticket. This helper grants no authority.
std::optional<gfx::Rect> ReadNativeStockViewsRootGeometry(BrowserView* current);
}  // namespace aux
#endif
#endif
