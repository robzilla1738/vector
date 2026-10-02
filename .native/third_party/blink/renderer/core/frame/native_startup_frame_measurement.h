// Copyright 2026 The Aux Authors
#ifndef THIRD_PARTY_BLINK_RENDERER_CORE_FRAME_NATIVE_STARTUP_FRAME_MEASUREMENT_H_
#define THIRD_PARTY_BLINK_RENDERER_CORE_FRAME_NATIVE_STARTUP_FRAME_MEASUREMENT_H_
#include <optional>
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/timer/timer.h"
#include "base/unguessable_token.h"
#include "cc/trees/aux_performance_content_frame.h"
#include "third_party/blink/renderer/core/core_export.h"
#include "third_party/blink/renderer/core/frame/native_startup_interactive_witness.h"
namespace blink {
class WidgetBase;
struct NativeStartupFrameScope {
  aux::ContentPerformanceScope widget;
  DocumentToken document;
  base::UnguessableToken nonce;
  uint64_t sequence = 0;
  // Only the browser-owned admitted actual native launcher receipt supplies it.
  base::TimeTicks launch;
  base::TimeTicks hardware_registration;
  bool operator==(const NativeStartupFrameScope&) const = default;
};
struct NativeStartupFrameSubmission {
  NativeStartupFrameScope scope;
  NativeStartupInteractiveWitness witness;
  aux::NativePerformanceSwapPromise::Submission submission;
  bool submitted = false;
};
// One exclusive current-widget lifecycle owner, installed by the native-owned
// private fixture only. Records actual committed frame submission; Display HW
// inclusion and browser owner revalidation are separate required endpoints.
class CORE_EXPORT NativeStartupFrameMeasurement final {
 public:
  using ScopeReader = base::RepeatingCallback<std::optional<NativeStartupFrameScope>()>;
  using WitnessReader = base::RepeatingCallback<std::optional<NativeStartupInteractiveWitness>()>;
  using Result = base::OnceCallback<void(std::optional<NativeStartupFrameSubmission>)>;
  NativeStartupFrameMeasurement(WidgetBase* widget, ScopeReader scope, WitnessReader witness);
  ~NativeStartupFrameMeasurement();
  bool Prepare(Result result);
  void Cancel();
 private:
  friend class NativeStartupFrameMeasurementLifetimeTest;
  bool Stable();
  void Lifecycle();
  void Submitted(aux::NativePerformanceSwapPromise::Submission submission);
  void Finish(std::optional<NativeStartupFrameSubmission> submission);
  base::WeakPtr<WidgetBase> widget_;
  ScopeReader read_scope_;
  WitnessReader read_witness_;
  std::optional<NativeStartupFrameSubmission> sample_;
  uint64_t last_sequence_ = 0;
  base::UnguessableToken last_nonce_;
  bool queued_ = false;
  Result result_;
  base::OneShotTimer timeout_;
  base::WeakPtrFactory<NativeStartupFrameMeasurement> weak_factory_{this};
};
}  // namespace blink
#endif
