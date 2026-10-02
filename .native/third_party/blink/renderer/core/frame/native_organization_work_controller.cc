// Copyright 2026 The Aux Authors
#include "third_party/blink/renderer/core/frame/native_organization_work_controller.h"
#include <utility>
#include "base/functional/bind.h"
#include "base/task/single_thread_task_runner.h"
#include "third_party/blink/renderer/core/dom/document.h"
#include "third_party/blink/renderer/core/frame/local_frame.h"
#include "third_party/blink/renderer/core/frame/native_organization_work_witness.h"
namespace blink {
NativeOrganizationWorkController::NativeOrganizationWorkController(
    Document& document, mojom::blink::NativeOrganizationWorkScopePtr scope,
    mojo::PendingReceiver<mojom::blink::NativeOrganizationWorkLease> receiver)
    : document_(&document), scope_(std::move(scope)) {
  if (!Current() || !receiver.is_valid()) return;
  const auto work = scope_->metric == mojom::blink::NativeOrganizationWorkMetric::kAutoArchive
      ? NativeOrganizationWork::kAutoArchive : NativeOrganizationWork::kLiveFolderRefresh;
  witness_ = std::make_unique<NativeOrganizationWorkWitness>(document, work);
  if (!witness_->armed()) { witness_.reset(); return; }
  receiver_.Bind(std::move(receiver));
  receiver_.set_disconnect_handler(base::BindOnce(
      &NativeOrganizationWorkController::Cancel, weak_factory_.GetWeakPtr()));
}
NativeOrganizationWorkController::~NativeOrganizationWorkController() { Cancel(); }
bool NativeOrganizationWorkController::Current() const {
  return document_ && scope_ && !scope_->nonce.is_empty() && scope_->sample_sequence &&
      scope_->window_id > 0 && scope_->renderer_pid > 0 && scope_->widget_routing_id > 0 &&
      (scope_->metric == mojom::blink::NativeOrganizationWorkMetric::kAutoArchive ||
       scope_->metric == mojom::blink::NativeOrganizationWorkMetric::kLiveFolderRefresh) &&
      scope_->document_generation && document_->Token() == scope_->document &&
      document_->Url().Protocol() == "chrome" && document_->Url().Host() == "aux" &&
      document_->GetFrame() && document_->GetFrame()->IsOutermostMainFrame() &&
      document_->GetFrame()->GetDocument() == document_;
}
bool NativeOrganizationWorkController::armed() const {
  return !consumed_ && receiver_.is_bound() && witness_ && witness_->armed() && Current();
}
void NativeOrganizationWorkController::Read(ReadCallback callback) {
  if (!armed() || pending_) { std::move(callback).Run(nullptr); return; }
  // One actual request only. Bounded native delivery wait is not a task metric.
  consumed_ = true;
  pending_ = std::move(callback);
  deadline_ = base::TimeTicks::Now() + base::Seconds(20);
  TryRead();
}
void NativeOrganizationWorkController::TryRead() {
  if (!pending_) return;
  if (!Current() || !witness_ || base::TimeTicks::Now() >= deadline_) { Cancel(); return; }
  auto sample = witness_->Read(*document_);
  if (!sample) {
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostDelayedTask(FROM_HERE,
        base::BindOnce(&NativeOrganizationWorkController::TryRead,
                      weak_factory_.GetWeakPtr()), base::Milliseconds(10));
    return;
  }
  auto result = mojom::blink::NativeOrganizationWorkSample::New();
  result->scope = scope_->Clone();
  result->start_ms = sample->start_ms;
  result->duration_ms = sample->duration_ms;
  result->duration_upper_bound_ms = sample->duration_upper_bound_ms;
  result->long_task_coverage = sample->long_task_coverage;
  result->overlapping_long_tasks = sample->overlapping_long_tasks;
  result->maximum_long_task_ms = sample->maximum_long_task_ms;
  result->completed_tasks = sample->completed_tasks;
  result->maximum_task_ms = sample->maximum_task_ms;
  result->completed_through_ms = sample->completed_through_ms;
  result->operation_id = sample->operation_id;
  result->units = sample->units;
  result->folder_id = sample->folder_id;
  witness_.reset();
  weak_factory_.InvalidateWeakPtrs();
  // Keep the responder pipe alive until this real reply is serialized. The
  // browser retires its read-once remote on receipt; resetting the receiver
  // first could turn a successful sample into a disconnect.
  // Reply may synchronously delete the owning widget/controller.
  std::move(pending_).Run(std::move(result));
}
void NativeOrganizationWorkController::Cancel() {
  weak_factory_.InvalidateWeakPtrs();
  consumed_ = true;
  witness_.reset();
  if (pending_) {
    // This callback may destroy us. The receiver is retired by its owner or
    // the browser after the actual refusal reply; never touch it afterward.
    std::move(pending_).Run(nullptr);
    return;
  }
  receiver_.reset();
}
}  // namespace blink
