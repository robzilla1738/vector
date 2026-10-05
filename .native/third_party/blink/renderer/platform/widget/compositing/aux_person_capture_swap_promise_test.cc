// Copyright 2026 The Aux Authors
#include "third_party/blink/renderer/platform/widget/compositing/aux_person_capture_swap_promise.h"
#include "base/test/bind.h"
#include "components/viz/common/quads/compositor_frame_metadata.h"
#include "testing/gtest/include/gtest/gtest.h"
namespace blink {
TEST(AuxPersonCaptureSwapPromiseTest, ActualWillSwapTokenOnlyOnce) {
  uint32_t result = 0; int replies = 0;
  AuxPersonCaptureSwapPromise promise(base::BindLambdaForTesting([&](uint32_t token) { result = token; ++replies; }));
  viz::CompositorFrameMetadata metadata; metadata.frame_token = 73;
  promise.WillSwap(&metadata); promise.DidSwap(); promise.DidSwap();
  EXPECT_EQ(73u, result); EXPECT_EQ(1, replies);
  EXPECT_TRUE(metadata.aux_person_capture_activation_requested);
}
TEST(AuxPersonCaptureSwapPromiseTest, EveryNonSubmissionRefuses) {
  for (auto reason : {cc::SwapPromise::SWAP_FAILS, cc::SwapPromise::COMMIT_FAILS,
                      cc::SwapPromise::COMMIT_NO_UPDATE, cc::SwapPromise::ACTIVATION_FAILS}) {
    uint32_t result = 99;
    AuxPersonCaptureSwapPromise promise(base::BindLambdaForTesting([&](uint32_t token) { result = token; }));
    viz::CompositorFrameMetadata metadata; metadata.frame_token = 73;
    promise.WillSwap(&metadata);
    EXPECT_EQ(cc::SwapPromise::DidNotSwapAction::BREAK_PROMISE, promise.DidNotSwap(reason, base::TimeTicks()));
    EXPECT_EQ(0u, result);
  }
}
TEST(AuxPersonCaptureSwapPromiseTest, MissingTokenAndDestroyedCallbackRefuse) {
  uint32_t result = 99;
  { AuxPersonCaptureSwapPromise promise(base::BindLambdaForTesting([&](uint32_t token) { result = token; }));
    promise.DidSwap(); }
  EXPECT_EQ(0u, result); result = 99;
  { AuxPersonCaptureSwapPromise promise(base::BindLambdaForTesting([&](uint32_t token) { result = token; })); }
  EXPECT_EQ(0u, result);
}
}  // namespace blink
