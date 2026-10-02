// Copyright 2026 The Aux Authors
#include "third_party/blink/renderer/core/frame/native_created_guest_frame.h"
#include <memory>
#include <utility>
#include "base/functional/bind.h"
#include "base/task/single_thread_task_runner.h"
#include "cc/trees/layer_tree_host.h"
#include "third_party/blink/renderer/platform/widget/widget_base.h"
namespace blink {
namespace {
bool SameVisibleWitness(const NativeGuestStageWitness& a, const NativeGuestStageWitness& b) {
  return a.document == b.document && a.stage_instance == b.stage_instance &&
      a.selection_generation == b.selection_generation &&
      a.geometry_generation == b.geometry_generation && !a.split_instance && !b.split_instance &&
      !a.dragging && !b.dragging && a.pages.size() == 1 && a.pages == b.pages;
}
}  // namespace
NativeCreatedGuestFrame::NativeCreatedGuestFrame(WidgetBase* widget, ScopeReader scope, WitnessReader witness)
    : widget_(widget ? widget->GetWeakPtr() : base::WeakPtr<WidgetBase>()),
      read_scope_(std::move(scope)), read_witness_(std::move(witness)) {
  if (widget_) widget_->SetPerformanceLifecycleCallbackForTesting(base::BindRepeating(
      &NativeCreatedGuestFrame::Lifecycle, weak_factory_.GetWeakPtr()));
}
NativeCreatedGuestFrame::~NativeCreatedGuestFrame() {
  weak_factory_.InvalidateWeakPtrs();
  if (widget_) widget_->SetPerformanceLifecycleCallbackForTesting({});
  Cancel();
}
bool NativeCreatedGuestFrame::Stable() {
  if (!sample_ || !widget_ || widget_->WillBeDestroyed() || !widget_->LayerTreeHost() ||
      read_scope_.is_null() || read_witness_.is_null()) return false;
  const auto self = weak_factory_.GetWeakPtr();
  const auto scope = read_scope_.Run();
  if (!self) return false;
  return widget_ && !widget_->WillBeDestroyed() && widget_->LayerTreeHost() &&
      sample_ && scope && *scope == sample_->scope &&
      base::TimeTicks::Now() - sample_->external_arm <= base::Seconds(5);
}
bool NativeCreatedGuestFrame::Prepare(base::TimeTicks external_arm, Result result) {
  const auto now = base::TimeTicks::Now();
  if (sample_ || result.is_null() || !widget_ || widget_->WillBeDestroyed() ||
      !widget_->LayerTreeHost() || read_scope_.is_null() || read_witness_.is_null() ||
      !base::TimeTicks::IsConsistentAcrossProcesses() || external_arm.is_null() ||
      external_arm > now || now - external_arm > base::Seconds(5)) return false;
  const auto self = weak_factory_.GetWeakPtr();
  const auto scope = read_scope_.Run();
  if (!self) return false;
  const auto witness = read_witness_.Run();
  if (!self) return false;
  if (sample_ || !widget_ || widget_->WillBeDestroyed() || !widget_->LayerTreeHost() || !scope || !witness ||
      witness->dragging || witness->split_instance || witness->pages.size() != 1 || !witness->stage_instance ||
      base::TimeTicks::Now() - external_arm >= base::Seconds(5))
    return false;
  sample_.emplace(); sample_->scope = *scope; sample_->witness = *witness;
  sample_->external_arm = external_arm; result_ = std::move(result);
  timeout_.Start(FROM_HERE, base::Seconds(5) - (base::TimeTicks::Now() - external_arm), base::BindOnce(
      &NativeCreatedGuestFrame::Cancel, weak_factory_.GetWeakPtr()));
  return true;
}
bool NativeCreatedGuestFrame::Accepted() {
  const auto self = weak_factory_.GetWeakPtr();
  const bool stable = !accepted_ && Stable();
  if (!self) return false;
  if (!stable) { Cancel(); return false; }
  accepted_ = true;
  // The swap promise records the exact subsequent actual commit/submission.
  // Browser verifies its emitted frame token in the root/guest inclusion group.
  widget_->LayerTreeHost()->SetNeedsCommit();
  return true;
}
void NativeCreatedGuestFrame::Lifecycle() {
  if (!accepted_ || !sample_ || !sample_->witness_observed.is_null()) return;
  const auto self = weak_factory_.GetWeakPtr();
  if (!Stable()) { if (self) Cancel(); return; }
  const auto witness = read_witness_.Run();
  if (!self) return;
  if (!sample_ || !widget_ || widget_->WillBeDestroyed() || !widget_->LayerTreeHost() || !witness ||
      !SameVisibleWitness(sample_->witness, *witness)) { Cancel(); return; }
  sample_->witness_observed = base::TimeTicks::Now();
  widget_->LayerTreeHost()->QueueSwapPromise(std::make_unique<aux::NativePerformanceSwapPromise>(
      base::SingleThreadTaskRunner::GetCurrentDefault(), base::BindOnce(
          &NativeCreatedGuestFrame::Submitted, weak_factory_.GetWeakPtr())));
}
void NativeCreatedGuestFrame::Submitted(aux::NativePerformanceSwapPromise::Submission actual) {
  if (!sample_) return;
  const auto self = weak_factory_.GetWeakPtr();
  if (!Stable()) { if (self) Cancel(); return; }
  const auto witness = read_witness_.Run();
  if (!self) return;
  if (!sample_) return;
  sample_->submission = actual;
  const bool valid = widget_ && !widget_->WillBeDestroyed() && witness &&
      SameVisibleWitness(sample_->witness, *witness) && actual.activated && actual.submitted_frame &&
      actual.frame_token && actual.failure_reason < 0 && !actual.commit.is_null() && !actual.submitted.is_null() &&
      sample_->external_arm <= sample_->witness_observed && sample_->witness_observed <= actual.commit &&
      actual.commit <= actual.submitted;
  Finish(valid);
}
void NativeCreatedGuestFrame::Finish(bool submitted) {
  if (!sample_) return;
  timeout_.Stop(); accepted_ = false; sample_->submitted = submitted;
  auto sample = std::move(*sample_); sample_.reset();
  if (result_) std::move(result_).Run(std::move(sample));
}
void NativeCreatedGuestFrame::Cancel() { Finish(false); }
}  // namespace blink
