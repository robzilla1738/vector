// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license in the LICENSE file.
#include "chrome/browser/ui/aux/native_command_presentation_session.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <iostream>
#include <utility>
#include "base/command_line.h"
#include "base/functional/bind.h"
#include "base/json/json_writer.h"
#include "base/strings/string_number_conversions.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/webui_browser/webui_browser_ui.h"
#include "chrome/browser/ui/webui_browser/webui_browser_window.h"
#include "content/browser/renderer_host/render_frame_host_impl.h"
#include "content/browser/renderer_host/render_widget_host_impl.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/render_process_host.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_ui.h"
#include "ui/gfx/presentation_feedback.h"
namespace aux {
namespace {
constexpr uint64_t kLargestSafeCounter = 9007199254740991ULL;
constexpr unsigned kMaximumRecords = 4000;
unsigned records = 0;
bool SameIdentity(const blink::mojom::NativeCommandPresentationScope& a,
                  const blink::mojom::NativeCommandPresentationScope& b) {
  return a.window_id == b.window_id && a.content_id == b.content_id &&
      a.renderer_pid == b.renderer_pid && a.document_generation == b.document_generation &&
      a.document == b.document && a.frame_sink == b.frame_sink;
}
bool ObservedModeMatchesSource(const blink::mojom::NativeCommandPresentationScope& scope) {
  return (scope.surface_mode == blink::mojom::NativeCommandPresentationMode::kCommand &&
          scope.source == blink::mojom::NativeCommandPresentationSource::kRegistry) ||
      ((scope.surface_mode == blink::mojom::NativeCommandPresentationMode::kNewTab ||
        scope.surface_mode == blink::mojom::NativeCommandPresentationMode::kEdit) &&
       scope.source == blink::mojom::NativeCommandPresentationSource::kHistory);
}
base::DictValue ScopeRecord(const blink::mojom::NativeCommandPresentationScope& scope,
                            uint64_t sequence) {
  base::DictValue record;
  record.Set("producer", "aux-native-command-presentation");
  record.Set("version", 1);
  record.Set("sampleSequence", base::NumberToString(sequence));
  record.Set("windowId", scope.window_id);
  // This is the actual shell RenderWidgetHost routing ID, never a guest ID.
  record.Set("widgetRoutingId", scope.content_id);
  record.Set("rendererPid", scope.renderer_pid);
  record.Set("nativeDocumentGeneration", base::NumberToString(scope.document_generation));
  record.Set("frameSinkClientId", static_cast<double>(scope.frame_sink.client_id()));
  record.Set("frameSinkSinkId", static_cast<double>(scope.frame_sink.sink_id()));
  record.Set("resultsSource", scope.source == blink::mojom::NativeCommandPresentationSource::kHistory
      ? "history" : scope.source == blink::mojom::NativeCommandPresentationSource::kRegistry ? "registry" : "unknown");
  record.Set("surfaceMode", scope.surface_mode == blink::mojom::NativeCommandPresentationMode::kNewTab
      ? "new-tab" : scope.surface_mode == blink::mojom::NativeCommandPresentationMode::kEdit
      ? "edit" : scope.surface_mode == blink::mojom::NativeCommandPresentationMode::kCommand
      ? "command" : "unknown");
  return record;
}
void Tick(base::DictValue& record, const char* name, base::TimeTicks ticks) {
  record.Set(name, ticks.is_null() ? base::Value() :
      base::Value(base::NumberToString(ticks.since_origin().InMicroseconds())));
}
void Emit(const char* prefix, const base::DictValue& record) {
  if (!NativePerformanceObservationEnabled() || records >= kMaximumRecords) return;
  auto json = base::WriteJson(record);
  if (!json || json->size() > 4000) return;
  ++records;
  std::cerr << prefix << " " << *json << std::endl;
}
}  // namespace
std::optional<base::TimeDelta> ValidateCommandPresentationPair(
    const blink::mojom::NativeCommandPresentationResult& result,
    const PerformanceInput& input, base::TimeTicks observed) {
  if (!result.scope || result.scope->window_id <= 0 || result.scope->content_id <= 0 ||
      result.scope->renderer_pid <= 0 || !result.scope->document_generation ||
      !result.scope->frame_sink.is_valid() ||
      (result.scope->source != blink::mojom::NativeCommandPresentationSource::kHistory &&
       result.scope->source != blink::mojom::NativeCommandPresentationSource::kRegistry) ||
      !ObservedModeMatchesSource(*result.scope) ||
      !result.measured || input.kind != PerformanceInputKind::kKeyDown ||
      input.target.window_id != result.scope->window_id ||
      input.target.content_id != result.scope->content_id ||
      input.target.process_id != result.scope->renderer_pid ||
      input.target.document_generation != result.scope->document_generation ||
      input.event_ticks != result.input || input.observed_ticks < input.event_ticks ||
      input.observed_ticks > observed || !base::TimeTicks::IsConsistentAcrossProcesses() ||
      !result.frame_token || !result.activated || !result.submitted_frame ||
      result.submission_failure >= 0 || result.mutation > result.commit ||
      result.commit > result.submitted || result.timing.received_compositor_frame_timestamp.is_null() ||
      result.submitted > result.timing.received_compositor_frame_timestamp ||
      result.timing.received_compositor_frame_timestamp > result.timing.embedded_frame_timestamp ||
      result.timing.embedded_frame_timestamp > result.timing.draw_start_timestamp ||
      result.timing.draw_start_timestamp > result.timing.presentation_feedback.timestamp)
    return std::nullopt;
  return ValidatedPresentationInterval(input.event_ticks, result.mutation, observed,
                                        result.timing.presentation_feedback);
}
NativeCommandPresentationSession::NativeCommandPresentationSession(
    base::WeakPtr<WebUIBrowserUI> ui) : ui_(std::move(ui)) {}
NativeCommandPresentationSession::~NativeCommandPresentationSession() { Cancel(); }
blink::mojom::NativeCommandPresentationScopePtr
NativeCommandPresentationSession::ReadOwnedScope() {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!ui_ || !NativePerformanceObservationEnabled() || records >= kMaximumRecords) return nullptr;
  auto* web_ui = ui_->web_ui();
  auto* contents = web_ui ? web_ui->GetWebContents() : nullptr;
  auto* frame = contents ? contents->GetPrimaryMainFrame() : nullptr;
  auto* window = contents ? WebUIBrowserWindow::FromWebShellWebContents(contents) : nullptr;
  if (!contents || contents->IsBeingDestroyed() || !frame || !window ||
      frame != web_ui->GetRenderFrameHost() || !frame->IsRenderFrameLive() ||
      frame->IsErrorDocument() || !frame->IsInLifecycleState(content::RenderFrameHost::LifecycleState::kActive) ||
      frame->GetLastCommittedURL().spec() != "chrome://aux/" || !window->browser()) return nullptr;
  Profile* profile = Profile::FromWebUI(web_ui);
  const base::FilePath selected(base::CommandLine::ForCurrentProcess()->GetSwitchValueASCII("user-data-dir"));
  if (!profile || profile->IsOffTheRecord() || profile != window->browser()->GetProfile() ||
      profile->GetPath().DirName() != selected) return nullptr;
  const auto native = window->GetAuxAppearanceSnapshot();
  const auto window_id = native.FindInt("windowId");
  auto* widget = static_cast<content::RenderWidgetHostImpl*>(frame->GetRenderWidgetHost());
  auto* process = frame->GetProcess();
  if (!window_id || *window_id <= 0 || !widget || !process ||
      !process->GetProcess().IsValid() || widget->GetProcess() != process ||
      widget->GetRoutingID() <= 0 || !widget->GetFrameSinkId().is_valid()) return nullptr;
  const auto token = static_cast<content::RenderFrameHostImpl*>(frame)->GetDocumentToken();
  if (!last_document_ || *last_document_ != token) {
    if (document_generation_ == kLargestSafeCounter) return nullptr;
    last_document_ = token;
    ++document_generation_;
  }
  auto scope = blink::mojom::NativeCommandPresentationScope::New();
  scope->window_id = *window_id;
  scope->content_id = widget->GetRoutingID();
  scope->renderer_pid = process->GetProcess().Pid();
  scope->document_generation = document_generation_;
  scope->document = token;
  scope->frame_sink = widget->GetFrameSinkId();
  scope->source = blink::mojom::NativeCommandPresentationSource::kObserveCurrent;
  scope->surface_mode = blink::mojom::NativeCommandPresentationMode::kObserveCurrent;
  return scope;
}
std::optional<PerformanceTarget> NativeCommandPresentationSession::ReadTarget() {
  auto scope = ReadOwnedScope();
  if (!scope) return std::nullopt;
  return PerformanceTarget{scope->window_id, scope->content_id, scope->renderer_pid,
                           scope->document_generation};
}
bool NativeCommandPresentationSession::Stable(
    const blink::mojom::NativeCommandPresentationScope& actual) {
  auto* frame = document_.AsRenderFrameHostIfValid();
  auto current = ReadOwnedScope();
  return frame && current && SameIdentity(*current, actual) && ui_ &&
      ui_->web_ui()->GetWebContents()->GetPrimaryMainFrame() == frame;
}
bool NativeCommandPresentationSession::Prepare(Result result) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (result.is_null()) return false;
  auto scope = ReadOwnedScope();
  if (result_ || sample_sequence_ == kLargestSafeCounter || !scope) {
    base::DictValue refusal;
    refusal.Set("producer", "aux-native-command-presentation"); refusal.Set("version", 1);
    refusal.Set("measured", false); refusal.Set("status", "refused");
    refusal.Set("reason", result_ ? "overlapping_request" : "unavailable_owned_scope");
    std::move(result).Run(false, std::move(refusal));
    return false;
  }
  auto* frame = ui_->web_ui()->GetWebContents()->GetPrimaryMainFrame();
  document_ = frame->GetWeakDocumentPtr();
  requested_ = scope->Clone();
  prepared_.reset(); input_.reset(); result_ = std::move(result);
  ++sample_sequence_;
  readiness_.reset();
  auto ready = readiness_.BindNewPipeAndPassRemote();
  readiness_.set_disconnect_handler(base::BindOnce(
      [](base::WeakPtr<NativeCommandPresentationSession> session) {
        // A one-shot Ready remote closes normally after its genuine receipt.
        if (session && session->result_ && !session->prepared_)
          session->Refuse("readiness_disconnected");
      }, weak_factory_.GetWeakPtr()));
  timeout_.Start(FROM_HERE, base::Seconds(6), base::BindOnce(
      &NativeCommandPresentationSession::Refuse, weak_factory_.GetWeakPtr(), "timeout"));
  static_cast<content::RenderWidgetHostImpl*>(frame->GetRenderWidgetHost())
      ->MeasureNativeCommandPresentationForTesting(std::move(scope), std::move(ready),
          base::BindOnce(&NativeCommandPresentationSession::Complete, weak_factory_.GetWeakPtr(), sample_sequence_));
  return true;
}
void NativeCommandPresentationSession::Ready(
    blink::mojom::NativeCommandPresentationScopePtr actual) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!result_ || prepared_ || !actual || !requested_ ||
      !SameIdentity(*requested_, *actual) || !Stable(*actual) ||
      !ObservedModeMatchesSource(*actual) ||
      (actual->source != blink::mojom::NativeCommandPresentationSource::kHistory &&
       actual->source != blink::mojom::NativeCommandPresentationSource::kRegistry)) {
    Refuse("invalid_readiness"); return;
  }
  prepared_ = std::move(actual);
  auto record = ScopeRecord(*prepared_, sample_sequence_);
  record.Set("status", "ready");
  Emit("AUX_NATIVE_COMMAND_PRESENTATION_READY_V1", record);
}
void NativeCommandPresentationSession::ObserveNativeInput(const gfx::NativeEvent& event) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!result_ || !prepared_ || !Stable(*prepared_)) return;
  const auto input = ReadNativePerformanceInput(event, base::BindRepeating(
      [](base::WeakPtr<NativeCommandPresentationSession> session) -> std::optional<PerformanceTarget> {
        return session ? session->ReadTarget() : std::nullopt;
      }, weak_factory_.GetWeakPtr()));
  if (!input || input->kind != PerformanceInputKind::kKeyDown) return;
  if (input_) { Refuse("multiple_native_inputs"); return; }
  input_ = input;
}
void NativeCommandPresentationSession::Complete(
    uint64_t sequence, blink::mojom::NativeCommandPresentationResultPtr result) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!result_ || sequence != sample_sequence_) return;
  if (!result || !result->scope) { Refuse("missing_result"); return; }
  const bool stable = prepared_ && Stable(*prepared_) &&
      SameIdentity(*prepared_, *result->scope) && result->scope->source == prepared_->source &&
      result->scope->surface_mode == prepared_->surface_mode;
  auto record = ScopeRecord(*result->scope, sample_sequence_);
  record.Set("rendererMeasured", result->measured);
  record.Set("rendererFailure", result->failure);
  record.Set("frameToken", static_cast<double>(result->frame_token));
  record.Set("activated", result->activated);
  record.Set("submittedFrame", result->submitted_frame);
  record.Set("submissionFailure", result->submission_failure);
  record.Set("feedbackFlags", static_cast<double>(result->timing.presentation_feedback.flags));
  Tick(record, "rendererInputUs", result->input); Tick(record, "mutationUs", result->mutation);
  Tick(record, "commitUs", result->commit); Tick(record, "submittedUs", result->submitted);
  Tick(record, "receivedUs", result->timing.received_compositor_frame_timestamp);
  Tick(record, "embeddedUs", result->timing.embedded_frame_timestamp);
  Tick(record, "drawUs", result->timing.draw_start_timestamp);
  Tick(record, "presentationUs", result->timing.presentation_feedback.timestamp);
  Tick(record, "nativeInputUs", input_ ? input_->event_ticks : base::TimeTicks());
  Tick(record, "nativeReceiptUs", input_ ? input_->observed_ticks : base::TimeTicks());
  record.Set("nativeInputSourcePid", input_ ? base::Value(input_->source_pid) : base::Value());
  const auto elapsed = input_ ? ValidateCommandPresentationPair(*result, *input_, base::TimeTicks::Now())
                              : std::nullopt;
  const bool measured = stable && elapsed.has_value();
  record.Set("measured", measured);
  record.Set("elapsedMs", measured ? base::Value(elapsed->InMillisecondsF()) : base::Value());
  record.Set("status", measured ? "measured" : "refused");
  if (!stable) record.Set("reason", "stale_result_scope");
  Finish(measured, std::move(record));
}
void NativeCommandPresentationSession::Refuse(const char* reason) {
  if (!result_) return;
  auto record = requested_ ? ScopeRecord(*requested_, sample_sequence_) : base::DictValue();
  record.Set("status", "refused"); record.Set("reason", reason); record.Set("measured", false);
  Finish(false, std::move(record));
}
void NativeCommandPresentationSession::Finish(bool measured, base::DictValue record) {
  auto result = std::move(result_);
  timeout_.Stop(); readiness_.reset();
  prepared_.reset(); requested_.reset(); input_.reset(); document_ = content::WeakDocumentPtr();
  Emit("AUX_NATIVE_COMMAND_PRESENTATION_V1", record);
  if (result) std::move(result).Run(measured, std::move(record));
}
void NativeCommandPresentationSession::Cancel() { Refuse("cancelled"); }
}  // namespace aux
#endif
