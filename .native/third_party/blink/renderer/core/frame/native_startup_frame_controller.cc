// Copyright 2026 The Aux Authors
#include "third_party/blink/renderer/core/frame/native_startup_frame_controller.h"
#include <utility>
#include "base/functional/bind.h"
#include "mojo/public/cpp/bindings/callback_helpers.h"
#include "third_party/blink/renderer/core/dom/document.h"
#include "third_party/blink/renderer/core/frame/local_frame.h"
#include "third_party/blink/renderer/core/frame/native_startup_early_eligibility.h"
#include "third_party/blink/renderer/platform/widget/widget_base.h"
namespace blink {
NativeStartupFrameController::NativeStartupFrameController(WidgetBase* widget,
    Document* document, NativeStartupFrameMeasurement::ScopeReader read_scope)
    : widget_(widget ? widget->GetWeakPtr() : base::WeakPtr<WidgetBase>()),
      document_(document), read_scope_(std::move(read_scope)) {}
NativeStartupFrameController::~NativeStartupFrameController() {
  weak_factory_.InvalidateWeakPtrs(); lease_.reset(); measurement_.reset();
}
std::optional<NativeStartupFrameScope> NativeStartupFrameController::CurrentScope() {
  if (!expected_ || !document_ || !widget_ || widget_->WillBeDestroyed() || read_scope_.is_null() ||
      document_->Token() != expected_->document || document_->Url().GetString() != "chrome://aux/" ||
      !document_->GetFrame() || document_->GetFrame()->GetDocument() != document_.Get() ||
      !document_->GetFrame()->IsOutermostMainFrame()) return std::nullopt;
  const auto weak = weak_factory_.GetWeakPtr();
  const auto reader = read_scope_;
  const auto actual = reader.Run();
  if (!weak || !document_ || !widget_ || widget_->WillBeDestroyed() || !actual ||
      !expected_ || *actual != *expected_ || document_->Token() != expected_->document) return std::nullopt;
  return actual;
}
std::optional<NativeStartupInteractiveWitness> NativeStartupFrameController::CurrentWitness() {
  const auto weak = weak_factory_.GetWeakPtr();
  if (!CurrentScope()) return std::nullopt;
  if (!weak || !document_) return std::nullopt;
  const auto actual = ReadNativeStartupInteractiveWitness(*document_);
  if (!weak || !CurrentScope()) return std::nullopt;
  return actual;
}
bool NativeStartupFrameController::Begin(mojom::blink::NativeStartupFrameScopePtr scope,
    mojo::PendingReceiver<mojom::blink::NativeStartupFrameLease> lease, Reply result) {
  auto refuse = mojo::WrapCallbackWithDefaultInvokeIfNotRun(std::move(result),
      mojom::blink::NativeStartupFrameSubmissionPtr());
  if (used_ || !scope || !lease.is_valid() || !document_ || !widget_ || widget_->WillBeDestroyed() ||
      read_scope_.is_null() || !NativeStartupDocumentCanArm(*document_) ||
      scope->request_nonce.is_empty() || !scope->sample_sequence || scope->window_id <= 0 ||
      scope->widget_routing_id <= 0 || scope->renderer_pid <= 0 || !scope->native_document_generation ||
      scope->document != document_->Token() || !scope->shell_sink.is_valid() ||
      !scope->display_sink.is_valid() || scope->shell_sink == scope->display_sink ||
      scope->admitted_launch.is_null() || scope->hardware_registration.is_null() ||
      scope->admitted_launch > scope->hardware_registration || scope->hardware_registration > base::TimeTicks::Now()) return false;
  expected_ = NativeStartupFrameScope{
      {scope->window_id, scope->widget_routing_id, scope->renderer_pid,
       scope->native_document_generation, scope->shell_sink},
      scope->document, scope->request_nonce, scope->sample_sequence, scope->admitted_launch, scope->hardware_registration};
  const auto weak = weak_factory_.GetWeakPtr();
  if (!CurrentScope()) { if (weak) expected_.reset(); return false; }
  if (!weak) return false;
  if (!document_ || !NativeStartupDocumentCanArm(*document_)) { expected_.reset(); return false; }
  used_ = true; scope_ = std::move(scope); reply_ = std::move(refuse);
  lease_.Bind(std::move(lease));
  lease_.set_disconnect_handler(base::BindOnce(&NativeStartupFrameController::Stop, weak));
  measurement_ = std::make_unique<NativeStartupFrameMeasurement>(widget_.get(),
      base::BindRepeating(&NativeStartupFrameController::CurrentScope, weak),
      base::BindRepeating(&NativeStartupFrameController::CurrentWitness, weak));
  const bool armed = measurement_->Prepare(base::BindOnce(&NativeStartupFrameController::Finished, weak));
  if (!weak) return false;
  if (!armed) Finished(std::nullopt);
  return armed;
}
void NativeStartupFrameController::Stop() {
  if (measurement_) measurement_->Cancel();
  else {
    weak_factory_.InvalidateWeakPtrs(); lease_.reset(); expected_.reset(); scope_.reset();
    if (reply_) std::move(reply_).Run(mojom::blink::NativeStartupFrameSubmissionPtr());
  }
}
void NativeStartupFrameController::Finished(std::optional<NativeStartupFrameSubmission> result) {
  const auto weak = weak_factory_.GetWeakPtr();
  const auto current = CurrentScope();
  if (!weak) return;
  auto response = mojom::blink::NativeStartupFrameSubmission::New();
  if (!result || !current || !scope_ || result->scope != *current || !result->submitted ||
      result->witness.document != scope_->document || result->witness.composer_instance.empty()) {
    response.reset();
  } else {
    response->scope = scope_->Clone(); response->witness_document = result->witness.document;
    response->composer_instance = String::FromUtf8(result->witness.composer_instance);
    response->observed_typeable_at = result->witness.observed_typeable_at;
    response->commit = result->submission.commit; response->submitted_at = result->submission.submitted;
    response->shell_frame_token = result->submission.frame_token;
    response->activated = result->submission.activated; response->submitted_frame = result->submission.submitted_frame;
    response->submission_failure = result->submission.failure_reason;
  }
  // A successful submission is not the final HW result. Keep the exact
  // renderer/document lease until the browser completes its display check.
  weak_factory_.InvalidateWeakPtrs(); measurement_.reset();
  if (response) {
    lease_.set_disconnect_handler(base::BindOnce(
        &NativeStartupFrameController::Stop, weak_factory_.GetWeakPtr()));
  } else {
    lease_.reset(); expected_.reset(); scope_.reset();
  }
  if (reply_) std::move(reply_).Run(std::move(response));
}
}  // namespace blink
