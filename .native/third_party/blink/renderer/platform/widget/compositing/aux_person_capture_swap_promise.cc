// Copyright 2026 The Aux Authors
#include <utility>
#include "third_party/blink/renderer/platform/widget/compositing/aux_person_capture_swap_promise.h"
#include "components/viz/common/quads/compositor_frame_metadata.h"
namespace blink {
AuxPersonCaptureSwapPromise::AuxPersonCaptureSwapPromise(base::OnceCallback<void(uint32_t)> reply) : reply_(std::move(reply)) {}
int64_t AuxPersonCaptureSwapPromise::GetTraceId() const { return 0; }
AuxPersonCaptureSwapPromise::~AuxPersonCaptureSwapPromise() { if (reply_) std::move(reply_).Run(0); }
void AuxPersonCaptureSwapPromise::WillSwap(viz::CompositorFrameMetadata* metadata) {
  token_ = metadata ? metadata->frame_token : 0;
  if (token_) metadata->aux_person_capture_activation_requested = true;
}
void AuxPersonCaptureSwapPromise::DidSwap() { if (reply_) std::move(reply_).Run(token_); }
cc::SwapPromise::DidNotSwapAction AuxPersonCaptureSwapPromise::DidNotSwap(DidNotSwapReason reason, base::TimeTicks now) {
  if (reply_) std::move(reply_).Run(0);
  return DidNotSwapAction::BREAK_PROMISE;
}
}
