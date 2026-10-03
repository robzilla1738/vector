// Copyright 2026 The Aux Authors
#include "cc/trees/native_stock_ready_swap_promise.h"
#include <utility>
namespace cc {
NativeStockReadySwapPromise::NativeStockReadySwapPromise(viz::NativeStockReadyFrame native_paint, Reply reply)
    : frame_(native_paint), reply_(std::move(reply)) {
  valid_ = base::TimeTicks::IsConsistentAcrossProcesses() && !frame_.nonce.is_empty() && !frame_.client_bounds.IsEmpty() && frame_.client_bounds.origin() == gfx::Point() &&
      !frame_.ready.is_null() && frame_.ready <= base::TimeTicks::Now() && frame_.commit.is_null() && frame_.submitted.is_null() && !frame_.frame_token;
}
NativeStockReadySwapPromise::~NativeStockReadySwapPromise() { Finish(std::nullopt); }
void NativeStockReadySwapPromise::OnCommit() {
  if (!valid_ || !frame_.commit.is_null()) { valid_ = false; return; }
  frame_.commit = base::TimeTicks::Now();
  if (frame_.ready > frame_.commit) valid_ = false;
}
void NativeStockReadySwapPromise::DidActivate() {
  if (!valid_ || frame_.commit.is_null() || activated_) { valid_ = false; return; }
  activated_ = true;
}
void NativeStockReadySwapPromise::WillSwap(viz::CompositorFrameMetadata* metadata) {
  if (!valid_ || !activated_ || swapped_ || !metadata || !metadata->frame_token || metadata->native_stock_ready || frame_.commit > base::TimeTicks::Now()) {
    valid_ = false; return;
  }
  swapped_ = true; frame_.frame_token = metadata->frame_token;
  // This marker is cloned/serialized on this exact root frame. Actual submit
  // is stamped in LayerTreeHostImpl immediately before SubmitCompositorFrame,
  // never here: WillSwap is metadata preparation, not submission evidence.
  metadata->native_stock_ready = frame_;
}
void NativeStockReadySwapPromise::WillSubmit(uint32_t token, base::TimeTicks actual_submit) {
  if (!valid_ || !swapped_ || submitted_ || token != frame_.frame_token || actual_submit.is_null() ||
      actual_submit < frame_.commit || actual_submit > base::TimeTicks::Now()) { valid_ = false; return; }
  submitted_ = true; frame_.submitted = actual_submit;
}
void NativeStockReadySwapPromise::DidSwap() {
  if (!valid_ || !submitted_) { Finish(std::nullopt); return; }
  Finish(frame_);
}
SwapPromise::DidNotSwapAction NativeStockReadySwapPromise::DidNotSwap(DidNotSwapReason, base::TimeTicks) {
  Finish(std::nullopt); return DidNotSwapAction::BREAK_PROMISE;
}
int64_t NativeStockReadySwapPromise::GetTraceId() const { return 0; }
void NativeStockReadySwapPromise::Finish(std::optional<viz::NativeStockReadyFrame> result) {
  valid_ = false; auto callback = std::move(reply_);
  if (callback) std::move(callback).Run(std::move(result));
}
}  // namespace cc
