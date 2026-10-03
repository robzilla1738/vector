// Copyright 2026 The Aux Authors
#include "components/viz/service/display/native_stock_raster_draw.h"
#include <utility>

namespace viz {
NativeStockRasterDraw::Part::Part(Image* actual, gfx::Rect actual_rect, bool required, gfx::Rect actual_sample)
    : image(actual), rect(actual_rect), opaque_required(required), sample(actual_sample) {}
NativeStockRasterDraw::Part::~Part() = default;
NativeStockRasterDraw::Part::Part(Part&&) = default;
NativeStockRasterDraw::Part& NativeStockRasterDraw::Part::operator=(Part&&) = default;
NativeStockRasterDraw::NativeStockRasterDraw(gfx::Rect root, Reply reply)
    : root_(root), reply_(std::move(reply)) {
  valid_ = !root_.IsEmpty() && root_.origin() == gfx::Point() &&
      root_.width() <= 32768 && root_.height() <= 32768 && !!reply_;
}
NativeStockRasterDraw::~NativeStockRasterDraw() { Finish(false); }
void NativeStockRasterDraw::Invalidate() { valid_ = false; }
void NativeStockRasterDraw::AddExecutedOpaqueSolid(gfx::Rect actual) {
  Add(nullptr, actual, false, gfx::Rect());
}
void NativeStockRasterDraw::AddExecutedOriginalImage(Image* image, gfx::Rect actual,
                                                       bool actual_source_over,
                                                       gfx::Rect actual_sample) {
  if (!image || actual_sample.IsEmpty()) { Invalidate(); return; }
  Add(image, actual, !actual_source_over, actual_sample);
}
void NativeStockRasterDraw::Add(Image* image, gfx::Rect actual, bool opaque_required, gfx::Rect sample) {
  if (!valid_ || !reply_ || parts_.size() >= 512 || actual.IsEmpty() ||
      !root_.Contains(actual)) { Invalidate(); return; }
  parts_.emplace_back(image, actual, opaque_required, sample);
}
void NativeStockRasterDraw::CompleteSuccessfulOriginalDraw(
    ReadOriginal read, base::RepeatingCallback<bool()> actual_context_valid) {
  if (!reply_) return;
  // Detach every member before the read callback. Context loss or a callback
  // may retire the owner; no access to this occurs across external work.
  auto reply = std::move(reply_);
  auto parts = std::move(parts_);
  const auto root = root_;
  const bool admitted = valid_ && !read.is_null() && !actual_context_valid.is_null();
  valid_ = false;
  bool alpha_readback_attempted = false;
  if (!admitted) { std::move(reply).Run(false, alpha_readback_attempted); return; }
  if (!actual_context_valid.Run()) { std::move(reply).Run(false, alpha_readback_attempted); return; }
  std::vector<gfx::Rect> missing{root};
  for (const auto& part : parts) {
    if (!actual_context_valid.Run()) { std::move(reply).Run(false, alpha_readback_attempted); return; }
    // Failed/transparent original backing cannot fill any hole. Other proven
    // source-over backing may still cover the entire actual root. Unknown or
    // destructive blend/filter/mask state must have invalidated the pack.
    const auto backing = part.image ? read.Run(part.image.get(), part.sample) :
        NativeStockBackingRead{true, true, false};
    alpha_readback_attempted |= backing.alpha_readback_attempted;
    if (!backing.original_access_valid) { std::move(reply).Run(false, alpha_readback_attempted); return; }
    if (!backing.opaque) {
      // kSrc overwrites alpha, unlike source-over. An unproved source cannot
      // borrow another opaque backing when the executed draw can erase it.
      if (part.opaque_required) { std::move(reply).Run(false, alpha_readback_attempted); return; }
      continue;
    }
    std::vector<gfx::Rect> next;
    for (const auto& hole : missing) {
      const auto cut = gfx::IntersectRects(hole, part.rect);
      if (cut.IsEmpty()) { next.push_back(hole); }
      else {
        if (cut.y() > hole.y()) next.emplace_back(hole.x(), hole.y(), hole.width(), cut.y() - hole.y());
        if (cut.bottom() < hole.bottom()) next.emplace_back(hole.x(), cut.bottom(), hole.width(), hole.bottom() - cut.bottom());
        if (cut.x() > hole.x()) next.emplace_back(hole.x(), cut.y(), cut.x() - hole.x(), cut.height());
        if (cut.right() < hole.right()) next.emplace_back(cut.right(), cut.y(), hole.right() - cut.right(), cut.height());
      }
      if (next.size() > 512) { std::move(reply).Run(false, alpha_readback_attempted); return; }
    }
    missing = std::move(next);
  }
  std::move(reply).Run(actual_context_valid.Run() && missing.empty(), alpha_readback_attempted);
}
void NativeStockRasterDraw::Finish(bool full) {
  auto reply = std::move(reply_);
  parts_.clear(); valid_ = false;
  if (reply) std::move(reply).Run(full, false);
}
}  // namespace viz
