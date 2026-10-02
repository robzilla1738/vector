// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_PIP_VIDEO_BACKING_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_PIP_VIDEO_BACKING_H_
#include <cstdint>
#include <optional>
#include "ui/gfx/geometry/rect.h"
#include "third_party/skia/include/core/SkColor.h"
namespace views { class Widget; class View; }
namespace aux {
// Private installed-layer readback, not caller authority or hardware paint proof.
// Object identities stay in-process and are never emitted in capture metadata.
struct NativePipSolidBacking {
  uintptr_t view_identity = 0;
  uintptr_t layer_identity = 0;
  gfx::Rect frame;
  SkColor4f color;
  bool operator==(const NativePipSolidBacking&) const = default;
};
std::optional<NativePipSolidBacking> ReadNativePipSolidBackingView(
    views::Widget* widget, views::View* background);
}  // namespace aux
#endif
