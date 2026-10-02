// Copyright 2026 The Aux Authors
#ifndef THIRD_PARTY_BLINK_RENDERER_CORE_FRAME_NATIVE_CREATED_GUEST_CONTROLLER_H_
#define THIRD_PARTY_BLINK_RENDERER_CORE_FRAME_NATIVE_CREATED_GUEST_CONTROLLER_H_
#include "base/memory/weak_ptr.h"
#include "mojo/public/cpp/bindings/remote.h"
#include "third_party/blink/public/mojom/widget/native_guest_stage_measurement.mojom-blink.h"
#include "third_party/blink/renderer/core/frame/native_created_guest_frame.h"
namespace blink {
class CORE_EXPORT NativeCreatedGuestController final {
 public:
  using Result = base::OnceCallback<void(mojom::blink::NativeCreatedGuestFrameSubmissionPtr)>;
  NativeCreatedGuestController(WidgetBase* widget, NativeCreatedGuestFrame::ScopeReader scope,
      NativeCreatedGuestFrame::WitnessReader witness);
  ~NativeCreatedGuestController();
  bool Prepare(mojom::blink::NativeCreatedGuestFrameScopePtr scope,
      mojo::PendingRemote<mojom::blink::NativeCreatedGuestFrameReadiness> readiness, Result result);
 private:
  void Accepted(bool accepted);
  void Complete(CreatedGuestFrameSubmission sample);
  void Cancel();
  NativeCreatedGuestFrame::WitnessReader read_witness_;
  NativeCreatedGuestFrame measurement_;
  mojom::blink::NativeCreatedGuestFrameScopePtr scope_;
  mojo::Remote<mojom::blink::NativeCreatedGuestFrameReadiness> readiness_;
  Result result_;
  bool ready_ = false;
  base::WeakPtrFactory<NativeCreatedGuestController> weak_factory_{this};
};
}  // namespace blink
#endif
