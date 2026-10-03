// Copyright 2026 The Aux Authors
#include "third_party/blink/renderer/core/frame/native_startup_frame_measurement.h"
#include <memory>
#include <utility>
#include "base/functional/bind.h"
#include "base/task/single_thread_task_runner.h"
#include "cc/trees/layer_tree_host.h"
#include "third_party/blink/renderer/platform/widget/widget_base.h"
namespace blink {
bool ValidateNativeStartupFrameTiming(const NativeStartupFrameScope& scope,
                                     base::TimeTicks now) {
  if (scope.launch.is_null() || scope.measurement_input.is_null() ||
      scope.hardware_registration.is_null() || scope.launch > scope.measurement_input ||
      scope.measurement_input > scope.hardware_registration || scope.hardware_registration > now)
    return false;
  switch (scope.purpose) {
    case NativeStartupFramePurpose::kAuxCold:
      return scope.measurement_input == scope.launch;
    case NativeStartupFramePurpose::kAuxWarm:
      return scope.measurement_input > scope.launch;
    case NativeStartupFramePurpose::kUnspecified:
      return false;
  }
  return false;
}
NativeStartupFrameMeasurement::NativeStartupFrameMeasurement(
    WidgetBase* widget, ScopeReader scope, WitnessReader witness)
    : widget_(widget ? widget->GetWeakPtr() : base::WeakPtr<WidgetBase>()),
      read_scope_(std::move(scope)), read_witness_(std::move(witness)) {}
NativeStartupFrameMeasurement::~NativeStartupFrameMeasurement() { Cancel(); }
bool NativeStartupFrameMeasurement::Stable() {
  if (!sample_ || !widget_ || widget_->WillBeDestroyed() || !widget_->LayerTreeHost() ||
      read_scope_.is_null()) return false;
  const auto weak = weak_factory_.GetWeakPtr();
  const auto reader = read_scope_;
  const auto current = reader.Run();
  return weak && widget_ && !widget_->WillBeDestroyed() && sample_ && current &&
      *current == sample_->scope;
}
bool NativeStartupFrameMeasurement::Prepare(Result result) {
  if (sample_ || result.is_null() || !widget_ || widget_->WillBeDestroyed() ||
      !widget_->LayerTreeHost() || read_scope_.is_null() || read_witness_.is_null() ||
      !base::TimeTicks::IsConsistentAcrossProcesses()) return false;
  const auto weak = weak_factory_.GetWeakPtr();
  const auto reader = read_scope_;
  const auto scope = reader.Run();
  if (!weak || !widget_ || widget_->WillBeDestroyed() || !scope || scope->nonce.is_empty() ||
      scope->sequence <= last_sequence_ || scope->nonce == last_nonce_ ||
      scope->widget.window_id <= 0 || scope->widget.content_id <= 0 ||
      scope->widget.renderer_pid <= 0 || !scope->widget.document_generation ||
      !scope->widget.frame_sink.is_valid() ||
      !ValidateNativeStartupFrameTiming(*scope, base::TimeTicks::Now())) return false;
  sample_.emplace(); sample_->scope = *scope;
  last_sequence_ = scope->sequence; last_nonce_ = scope->nonce;
  result_ = std::move(result); queued_ = false;
  widget_->SetPerformanceLifecycleCallbackForTesting(base::BindRepeating(
      &NativeStartupFrameMeasurement::Lifecycle, weak_factory_.GetWeakPtr()));
  timeout_.Start(FROM_HERE, base::Seconds(5), base::BindOnce(
      &NativeStartupFrameMeasurement::Cancel, weak_factory_.GetWeakPtr()));
  return true;
}
void NativeStartupFrameMeasurement::Lifecycle() {
  if (!sample_ || queued_) return;
  auto weak = weak_factory_.GetWeakPtr();
  if (!Stable()) { if (weak) Cancel(); return; }
  const auto reader = read_witness_;
  const auto witness = reader.Run();
  if (!weak) return;
  if (!witness) return;
  if (!Stable()) { if (weak) Cancel(); return; }
  if (witness->document != sample_->scope.document || witness->composer_instance.empty() ||
      witness->observed_typeable_at.is_null() || witness->observed_typeable_at < sample_->scope.measurement_input ||
      witness->observed_typeable_at > base::TimeTicks::Now()) { Cancel(); return; }
  sample_->witness = *witness; queued_ = true;
  widget_->LayerTreeHost()->QueueSwapPromise(std::make_unique<aux::NativePerformanceSwapPromise>(
      base::SingleThreadTaskRunner::GetCurrentDefault(), base::BindOnce(
          &NativeStartupFrameMeasurement::Submitted, weak_factory_.GetWeakPtr())));
}
void NativeStartupFrameMeasurement::Submitted(aux::NativePerformanceSwapPromise::Submission submission) {
  if (!sample_ || !queued_) return;
  const auto weak = weak_factory_.GetWeakPtr();
  if (!Stable()) { if (weak) Cancel(); return; }
  const auto reader = read_witness_;
  const auto current = reader.Run();
  if (!weak) return;
  if (!Stable()) { if (weak) Cancel(); return; }
  if (!current || current->document != sample_->witness.document ||
      current->composer_instance != sample_->witness.composer_instance || !submission.activated ||
      !submission.submitted_frame || !submission.frame_token || submission.failure_reason >= 0 ||
      submission.commit.is_null() || submission.submitted.is_null() ||
      !ValidateNativeStartupFrameTiming(sample_->scope, base::TimeTicks::Now()) ||
      sample_->scope.hardware_registration > sample_->witness.observed_typeable_at ||
      sample_->witness.observed_typeable_at > submission.commit || submission.commit > submission.submitted ||
      submission.submitted > base::TimeTicks::Now()) { Cancel(); return; }
  sample_->submission = submission; sample_->submitted = true;
  auto result = std::move(*sample_);
  Finish(std::move(result));
}
void NativeStartupFrameMeasurement::Finish(std::optional<NativeStartupFrameSubmission> submission) {
  if (!sample_) return;
  timeout_.Stop(); weak_factory_.InvalidateWeakPtrs();
  if (widget_ && !widget_->WillBeDestroyed()) widget_->SetPerformanceLifecycleCallbackForTesting({});
  sample_.reset(); queued_ = false;
  if (result_) std::move(result_).Run(std::move(submission));
}
void NativeStartupFrameMeasurement::Cancel() { Finish(std::nullopt); }
}  // namespace blink
