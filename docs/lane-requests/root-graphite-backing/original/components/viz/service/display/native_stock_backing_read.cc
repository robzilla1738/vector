// Copyright 2026 The Aux Authors
#include "components/viz/service/display/native_stock_backing_read.h"

#include <cmath>
#include <vector>

#include "gpu/command_buffer/service/shared_context_state.h"
#include "components/viz/common/resources/shared_image_format_utils.h"
#include "third_party/skia/include/core/SkImage.h"
#include "third_party/skia/include/core/SkImageInfo.h"
#include "third_party/skia/include/gpu/ganesh/SkImageGanesh.h"
#include "third_party/skia/include/private/chromium/GrPromiseImageTexture.h"

namespace viz {
bool NativeStockPixelsHaveExactOpaqueAlpha(base::span<const float> rgba) {
  if (rgba.empty() || rgba.size() % 4 != 0) return false;
  for (size_t index = 0; index < rgba.size(); index += 4) {
    if (!std::isfinite(rgba[index]) || !std::isfinite(rgba[index + 1]) ||
        !std::isfinite(rgba[index + 2]) || rgba[index + 3] != 1.0f)
      return false;
  }
  return true;
}

NativeStockBackingRead NativeStockReadOriginalBackingOpaque(
    gpu::SkiaImageRepresentation::ScopedReadAccess& actual_access,
    gpu::SharedContextState& context,
    const gpu::Mailbox& original_mailbox,
    const gfx::Size& original_size,
    SharedImageFormat original_format,
    const gfx::Rect& executed_sample_bounds,
    const SkImage* actually_consumed_image) {
  if (context.context_lost()) return {};
  const auto* actual = actual_access.representation();
  if (!actual || actual->mailbox() != original_mailbox ||
      actual->size() != original_size || actual->format() != original_format ||
      !actual->IsCleared() || original_size.IsEmpty() ||
      executed_sample_bounds.IsEmpty() ||
      !gfx::Rect(original_size).Contains(executed_sample_bounds) ||
      !actual->format().is_single_plane() ||
      actual->format().PrefersExternalSampler()) return {};
  // This first producer is the real Ganesh original-texture path only.
  // Graphite/raw draw require their own supported executed-backing witness.
  if (!context.gr_context() || context.graphite_shared_context()) return {};
  auto* actual_texture = actual_access.promise_image_texture();
  if (!actual_texture || !actual_texture->backendTexture().isValid() ||
      actual_texture->backendTexture().width() != original_size.width() ||
      actual_texture->backendTexture().height() != original_size.height()) return {};
  // The installed backing format plus the successfully acquired actual GPU
  // texture establishes no-alpha semantics; imported opacity hints do not.
  if (!actual->format().HasAlpha()) return {true, true, false};
  // Actual MakePromiseSkImageSinglePlane installs RGB_888x semantics for
  // RGBA/BGRA only when the consumed SkImage is constructed that way. This
  // is the executed image color type, not force_rgbx/alpha metadata alone.
  if (actually_consumed_image &&
      actually_consumed_image->width() == original_size.width() &&
      actually_consumed_image->height() == original_size.height() &&
      actually_consumed_image->colorType() == kRGB_888x_SkColorType &&
      (actual->format() == SinglePlaneFormat::kRGBA_8888 ||
       actual->format() == SinglePlaneFormat::kBGRA_8888)) return {true, true, false};
  constexpr size_t kMaxPixels = 8 * 1024 * 1024;
  const size_t width = static_cast<size_t>(executed_sample_bounds.width());
  const size_t height = static_cast<size_t>(executed_sample_bounds.height());
  if (width > kMaxPixels || height > kMaxPixels / width) return {true, false, false};
  // Read actual stored alpha, including backings advertised opaque. The
  // ordinary CreateSkImage propagates backing alpha_type and can synthesize
  // alpha=1 from that hint. Borrow the SAME acquired backend texture with its
  // installed color format and an alpha-bearing interpretation instead.
  // Premultiplication changes RGB interpretation, never the stored alpha.
  auto original = SkImages::BorrowTextureFrom(context.gr_context(),
      actual_texture->backendTexture(), actual->surface_origin(),
      ToClosestSkColorType(actual->format()), kPremul_SkAlphaType, nullptr);
  if (context.context_lost() || !original || original->width() != original_size.width() ||
      original->height() != original_size.height() ||
      original->alphaType() != kPremul_SkAlphaType) return {false, false, true};
  std::vector<float> pixels(width * height * 4);
  const auto info = SkImageInfo::Make(executed_sample_bounds.width(), executed_sample_bounds.height(),
      kRGBA_F32_SkColorType, kUnpremul_SkAlphaType, nullptr);
  if (!original->readPixels(context.gr_context(), info, pixels.data(),
      width * 4 * sizeof(float), executed_sample_bounds.x(),
      executed_sample_bounds.y(), SkImage::kDisallow_CachingHint)) return {false, false, true};
  // Retain exact read pixels, not inferred opacity from image metadata. This
  // synchronous diagnostic overhead belongs in the original measurement.
  return {!context.context_lost(),
          !context.context_lost() && NativeStockPixelsHaveExactOpaqueAlpha(pixels), true};
}
}  // namespace viz
