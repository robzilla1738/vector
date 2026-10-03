// Copyright 2026 The Aux Authors
#include "components/viz/service/display/native_stock_first_hardware_retention.h"
#include <utility>
#include <algorithm>
#include "base/functional/bind.h"
namespace viz {
NativeStockRootFrame::NativeStockRootFrame() = default;
NativeStockRootFrame::~NativeStockRootFrame() = default;
NativeStockRootFrame::NativeStockRootFrame(const NativeStockRootFrame&) = default;
NativeStockRootFrame& NativeStockRootFrame::operator=(const NativeStockRootFrame&) = default;
NativeStockRootPresentation::NativeStockRootPresentation() = default;
NativeStockRootPresentation::~NativeStockRootPresentation() = default;
NativeStockRootPresentation::NativeStockRootPresentation(const NativeStockRootPresentation&) = default;
NativeStockFirstHardwareRetention::Group::Group() = default;
NativeStockFirstHardwareRetention::Group::~Group() = default;
NativeStockFirstHardwareRetention::NativeStockFirstHardwareRetention(base::UnguessableToken nonce, FrameSinkId display)
    : nonce_(nonce), display_(display), registered_(base::TimeTicks::Now()), deadline_(registered_ + base::Seconds(5)) {
  if (nonce_.is_empty() || !display_.is_valid() || registered_.is_null() || !base::TimeTicks::IsConsistentAcrossProcesses()) {
    active_ = false; return;
  }
  timeout_.Start(FROM_HERE, base::Seconds(5), base::BindOnce(&NativeStockFirstHardwareRetention::Cancel, weak_factory_.GetWeakPtr()));
}
NativeStockFirstHardwareRetention::~NativeStockFirstHardwareRetention() { Finish(std::nullopt); }
base::WeakPtr<NativeStockFirstHardwareRetention> NativeStockFirstHardwareRetention::GetWeakPtr() { return weak_factory_.GetWeakPtr(); }
std::optional<uint64_t> NativeStockFirstHardwareRetention::RegisterFrame(NativeStockRootFrame actual, base::TimeTicks draw) {
  if (!active_) return std::nullopt;
  // An unrelated unmarked frame is not eligible. A marked but malformed frame
  // terminates admission; silently skipping it would recover a later endpoint.
  if (actual.nonce.is_empty()) return std::nullopt;
  const auto now = base::TimeTicks::Now();
  if (actual.nonce != nonce_ || !actual.surface.is_valid() || actual.surface.frame_sink_id() != display_ ||
      !actual.token || actual.ready.is_null() || actual.commit.is_null() || actual.submitted.is_null() || draw.is_null() ||
      registered_ > actual.ready || actual.ready > actual.commit || actual.commit > actual.submitted || actual.submitted > draw || draw > now || now > deadline_) {
    Cancel(); return std::nullopt;
  }
  const auto key = std::make_pair(actual.surface, actual.token);
  if (first_.contains(key)) return std::nullopt;
  if (groups_.size() >= 64) { Cancel(); return std::nullopt; }
  const uint64_t group = ++sequence_;
  auto entry = groups_.try_emplace(group).first;
  entry->second.result.frame = actual; entry->second.result.draw = draw;
  if (actual.requires_original_raster_draw)
    entry->second.result.frame.entire_client_painted = false;
  first_.emplace(key, group);
  return group;
}
void NativeStockFirstHardwareRetention::Presented(uint64_t group, const gfx::SwapTimings& swap, const gfx::PresentationFeedback& feedback) {
  if (!active_) return;
  auto entry = groups_.find(group);
  if (entry == groups_.end() || entry->second.received || base::TimeTicks::Now() > deadline_) { Cancel(); return; }
  entry->second.received = true; entry->second.result.swap = swap; entry->second.result.feedback = feedback;
  entry->second.result.observed = std::max(entry->second.result.observed, base::TimeTicks::Now()); TryJoin();
}
void NativeStockFirstHardwareRetention::RasterDrawCompleted(
    uint64_t group, base::UnguessableToken nonce, SurfaceId original_root,
    uint32_t original_token, bool full_original_draw_succeeded,
    bool alpha_readback_attempted) {
  if (!active_) return;
  const auto found = groups_.find(group);
  const auto now = base::TimeTicks::Now();
  if (found == groups_.end() || nonce != nonce_ || now > deadline_ ||
      found->second.raster_received ||
      !found->second.result.frame.requires_original_raster_draw ||
      found->second.result.frame.surface != original_root ||
      found->second.result.frame.token != original_token) { Cancel(); return; }
  auto& actual = found->second;
  actual.raster_received = true;
  actual.result.frame.entire_client_painted = full_original_draw_succeeded;
  actual.result.frame.alpha_readback_attempted = alpha_readback_attempted;
  actual.result.observed = std::max(actual.result.observed, now);
  TryJoin();
}
void NativeStockFirstHardwareRetention::Join(base::UnguessableToken nonce, SurfaceId actual_root, uint32_t actual_token, Reply reply) {
  if (reply.is_null()) return;
  if (!active_ || used_ || nonce != nonce_ || !actual_root.is_valid() || actual_root.frame_sink_id() != display_ || !actual_token || base::TimeTicks::Now() > deadline_) {
    Cancel(); std::move(reply).Run(std::nullopt); return;
  }
  used_ = true; expected_ = std::make_pair(actual_root, actual_token); reply_ = std::move(reply); TryJoin();
}
void NativeStockFirstHardwareRetention::TryJoin() {
  if (!active_ || !reply_ || !expected_) return;
  if (base::TimeTicks::Now() > deadline_) { Cancel(); return; }
  const auto original = first_.find(*expected_);
  if (original == first_.end()) return;
  const auto entry = groups_.find(original->second);
  if (entry == groups_.end()) { Cancel(); return; }
  const auto& group = entry->second;
  if (!group.received || (group.result.frame.requires_original_raster_draw &&
      !group.raster_received)) return;
  const auto& r = group.result;
  if (!r.frame.entire_client_painted || r.frame.output.IsEmpty() || r.frame.output.origin() != gfx::Point() ||
      r.frame.committed_client_bounds != r.frame.output || r.swap.swap_start.is_null() || r.swap.swap_end.is_null() || r.feedback.timestamp.is_null() ||
      r.draw > r.swap.swap_start || r.swap.swap_start > r.swap.swap_end || r.swap.swap_end > r.feedback.timestamp ||
      r.feedback.timestamp > r.observed || r.observed > deadline_ || !(r.feedback.flags & gfx::PresentationFeedback::kHWCompletion) ||
      (r.feedback.flags & gfx::PresentationFeedback::kFailure)) { Cancel(); return; }
  Finish(r);
}
void NativeStockFirstHardwareRetention::Cancel() { Finish(std::nullopt); }
void NativeStockFirstHardwareRetention::Finish(std::optional<NativeStockRootPresentation> result) {
  if (!active_ && !reply_) return;
  active_ = false; weak_factory_.InvalidateWeakPtrs(); timeout_.Stop();
  auto callback = std::move(reply_); expected_.reset(); first_.clear(); groups_.clear();
  if (callback) std::move(callback).Run(std::move(result));
}
}  // namespace viz
