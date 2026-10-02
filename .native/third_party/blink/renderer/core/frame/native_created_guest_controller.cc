// Copyright 2026 The Aux Authors
#include "third_party/blink/renderer/core/frame/native_created_guest_controller.h"
#include <utility>
#include "base/functional/bind.h"
#include "third_party/blink/renderer/core/frame/native_guest_stage_controller.h"
namespace blink {
NativeCreatedGuestController::NativeCreatedGuestController(WidgetBase* widget,
    NativeCreatedGuestFrame::ScopeReader scope, NativeCreatedGuestFrame::WitnessReader witness)
    : read_witness_(witness), measurement_(widget, std::move(scope), std::move(witness)) {}
NativeCreatedGuestController::~NativeCreatedGuestController() {
  weak_factory_.InvalidateWeakPtrs(); Cancel();
}
bool NativeCreatedGuestController::Prepare(mojom::blink::NativeCreatedGuestFrameScopePtr scope,
    mojo::PendingRemote<mojom::blink::NativeCreatedGuestFrameReadiness> readiness, Result result) {
  if (scope_ || result_ || !scope ||
      scope->surface_kind != mojom::blink::NativeCreatedGuestSurfaceKind::kLittleWindow || scope->request_nonce.is_empty() || scope->external_arm.is_null() ||
      !readiness.is_valid() || result.is_null() || read_witness_.is_null()) return false;
  const auto self = weak_factory_.GetWeakPtr();
  const auto witness = read_witness_.Run();
  if (!self) return false;
  if (scope_ || result_ || !witness || witness->document != scope->shell_document) return false;
  scope_ = std::move(scope); result_ = std::move(result);
  const bool prepared = measurement_.Prepare(scope_->external_arm, base::BindOnce(
      &NativeCreatedGuestController::Complete, weak_factory_.GetWeakPtr()));
  if (!self) return false;
  if (!prepared) {
    scope_.reset(); result_.Reset(); return false;
  }
  readiness_.Bind(std::move(readiness));
  readiness_.set_disconnect_handler(base::BindOnce(
      &NativeCreatedGuestController::Cancel, weak_factory_.GetWeakPtr()));
  readiness_->Ready(scope_->Clone(), EncodeNativeGuestStageWitness(*witness), base::BindOnce(
      &NativeCreatedGuestController::Accepted, weak_factory_.GetWeakPtr()));
  return true;
}
void NativeCreatedGuestController::Accepted(bool accepted) {
  if (!result_) return;
  if (!accepted) { Cancel(); return; }
  ready_ = true;
  readiness_.reset();
  measurement_.Accepted();
}
void NativeCreatedGuestController::Complete(CreatedGuestFrameSubmission sample) {
  if (!result_ || !scope_) return;
  auto out = mojom::blink::NativeCreatedGuestFrameSubmission::New();
  out->scope = scope_->Clone(); out->witness = EncodeNativeGuestStageWitness(sample.witness);
  out->witness_observed = sample.witness_observed;
  out->commit = sample.submission.commit; out->submitted_at = sample.submission.submitted;
  out->shell_frame_token = sample.submission.frame_token;
  out->activated = sample.submission.activated; out->submitted_frame = sample.submission.submitted_frame;
  out->submission_failure = sample.submission.failure_reason; out->submitted = ready_ && sample.submitted;
  ready_ = false; readiness_.reset(); scope_.reset();
  std::move(result_).Run(std::move(out));
}
void NativeCreatedGuestController::Cancel() { measurement_.Cancel(); }
}  // namespace blink
