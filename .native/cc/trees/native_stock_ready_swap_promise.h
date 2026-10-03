// Copyright 2026 The Aux Authors
#ifndef CC_TREES_NATIVE_STOCK_READY_SWAP_PROMISE_H_
#define CC_TREES_NATIVE_STOCK_READY_SWAP_PROMISE_H_
#include <optional>
#include "base/functional/callback.h"
#include "cc/trees/swap_promise.h"
#include "components/viz/common/quads/native_stock_ready_frame.h"
namespace cc {
// Queued ONLY by the actual first eligible BrowserView native child paint,
// after its early private Display ACK. It follows that same cc commit/tree;
// it never selects the next frame token or an unrelated presentation callback.
class CC_EXPORT NativeStockReadySwapPromise final : public SwapPromise {
 public:
  using Reply = base::OnceCallback<void(std::optional<viz::NativeStockReadyFrame>)>;
  NativeStockReadySwapPromise(viz::NativeStockReadyFrame native_paint, Reply reply);
  ~NativeStockReadySwapPromise() override;
  void OnCommit() override;
  void DidActivate() override;
  void WillSwap(viz::CompositorFrameMetadata* metadata) override;
  void WillSubmit(uint32_t token, base::TimeTicks actual_submit) override;
  void DidSwap() override;
  DidNotSwapAction DidNotSwap(DidNotSwapReason reason, base::TimeTicks timestamp) override;
  int64_t GetTraceId() const override;
 private:
  void Finish(std::optional<viz::NativeStockReadyFrame> result);
  viz::NativeStockReadyFrame frame_;
  Reply reply_;
  bool valid_ = false, activated_ = false, swapped_ = false, submitted_ = false;
};
}  // namespace cc
#endif
