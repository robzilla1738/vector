// Copyright 2026 The Aux Authors
#ifndef THIRD_PARTY_BLINK_RENDERER_CORE_FRAME_NATIVE_CREATED_GUEST_FRAME_H_
#define THIRD_PARTY_BLINK_RENDERER_CORE_FRAME_NATIVE_CREATED_GUEST_FRAME_H_
#include <optional>
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/timer/timer.h"
#include "cc/trees/aux_performance_content_frame.h"
#include "third_party/blink/renderer/core/core_export.h"
#include "third_party/blink/renderer/core/frame/native_guest_stage_witness.h"
namespace blink {
class WidgetBase;
struct CreatedGuestFrameSubmission {
  aux::ContentPerformanceScope scope;
  NativeGuestStageWitness witness;
  base::TimeTicks external_arm;
  base::TimeTicks witness_observed;
  aux::NativePerformanceSwapPromise::Submission submission;
  bool submitted = false;
};
// Native-owned creation observer only. It requests an actual commit carrying the
// already committed target document/visible-embed witness. This is an observed
// qualifying frame upperbound, never native input or first-ever-frame proof.
class CORE_EXPORT NativeCreatedGuestFrame final {
 public:
  using ScopeReader = aux::NativeContentFrameMeasurement::ScopeReader;
  using WitnessReader = base::RepeatingCallback<std::optional<NativeGuestStageWitness>()>;
  using Result = base::OnceCallback<void(CreatedGuestFrameSubmission)>;
  NativeCreatedGuestFrame(WidgetBase* widget, ScopeReader scope, WitnessReader witness);
  ~NativeCreatedGuestFrame();
  bool Prepare(base::TimeTicks actual_external_arm, Result result);
  // Called only after native validates current target document, visible page,
  // connector geometry and genuine guest document frame leases on this widget.
  bool Accepted();
  void Cancel();
 private:
  bool Stable();
  void Lifecycle();
  void Submitted(aux::NativePerformanceSwapPromise::Submission actual);
  void Finish(bool submitted);
  base::WeakPtr<WidgetBase> widget_;
  ScopeReader read_scope_;
  WitnessReader read_witness_;
  std::optional<CreatedGuestFrameSubmission> sample_;
  Result result_;
  bool accepted_ = false;
  base::OneShotTimer timeout_;
  base::WeakPtrFactory<NativeCreatedGuestFrame> weak_factory_{this};
};
}  // namespace blink
#endif
