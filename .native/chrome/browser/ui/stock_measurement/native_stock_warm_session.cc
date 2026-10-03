// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/stock_measurement/native_stock_warm_session.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS) && !BUILDFLAG(ENABLE_AUX_SHELL)
#include <utility>
#include "base/no_destructor.h"
#include "content/public/browser/browser_thread.h"
#include "base/functional/bind.h"
#include "base/strings/string_number_conversions.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/stock_measurement/native_stock_warm_owner.h"
#include "chrome/browser/ui/stock_measurement/native_stock_views_readiness.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
#include "components/sessions/core/session_id.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/web_contents.h"
#include "ui/compositor/compositor.h"
#include "ui/views/widget/widget.h"
namespace aux {
namespace {
base::WeakPtr<NativeStockWarmSession>& ActiveWarmSession() {
  static base::NoDestructor<base::WeakPtr<NativeStockWarmSession>> session;
  return *session;
}
void UnpublishWarmSession(NativeStockWarmSession* actual) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (ActiveWarmSession().get() == actual) ActiveWarmSession().reset();
}
void Tick(base::DictValue& record, const char* name, base::TimeTicks actual) {
  if (!actual.is_null()) record.Set(name, base::NumberToString(actual.since_origin().InMicroseconds()));
}
}  // namespace
NativeStockWarmSession::NativeStockWarmSession(BrowserView* actual)
    : view_(actual ? actual->GetAsWeakPtr() : base::WeakPtr<BrowserView>()),
      browser_(actual && actual->browser() ? actual->browser()->GetWeakPtr() : base::WeakPtr<BrowserWindowInterface>()) {}
NativeStockWarmSession::~NativeStockWarmSession() {
  UnpublishWarmSession(this);
  weak_factory_.InvalidateWeakPtrs(); timeout_.Stop();
  if (auto* source = compositor_.GetSource()) source->CancelNativeStockStartupHardwareObservation(nonce_);
  compositor_.Reset(); Observe(nullptr);
}
void NativeStockWarmSession::Start(base::WeakPtr<NativeStockWarmCreationTicket> ticket, Reply reply) {
  if (reply.is_null()) return;
  if (used_) { std::move(reply).Run(Record("refused", "warm_already_observed")); return; }
  if (ActiveWarmSession()) { std::move(reply).Run(Record("refused", "another_warm_session_is_active")); return; }
  used_ = true; reply_ = std::move(reply); ticket_ = std::move(ticket);
  if (!ticket_ || !ticket_->Stable() || !ticket_->input()) {
    Refuse("unavailable_original_launch_lease"); return;
  }
  // Every asynchronous delivery retains the absolute original native key
  // deadline. Warm timing never starts at a new process or reconstructed launch.
  admitted_ = true; deadline_ = ticket_->input()->original_event_time + base::Seconds(5);
  nonce_ = ticket_->nonce();
  if (!view_ || !browser_ || view_->browser() != browser_.get() ||
      !view_->GetWidget() || !view_->GetWidget()->GetCompositor()) {
    Refuse("unavailable_original_native_window"); return;
  }
  widget_ = view_->GetWidget()->GetWeakPtr(); compositor_.Observe(widget_->GetCompositor());
  if (!Stable()) { Refuse("unavailable_exact_added_window_owner"); return; }
  ActiveWarmSession() = weak_factory_.GetWeakPtr();
  timeout_.Start(FROM_HERE, deadline_ - base::TimeTicks::Now(), base::BindOnce(
      &NativeStockWarmSession::Refuse, weak_factory_.GetWeakPtr(), "warm_deadline_elapsed"));
  compositor_.GetSource()->BeginNativeStockStartupHardwareObservation(nonce_, base::BindOnce(
      &NativeStockWarmSession::Registered, weak_factory_.GetWeakPtr()));
}
void NativeStockWarmSession::ActualPainted(BrowserView* actual) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto session = ActiveWarmSession();
  if (session && session->view_.get() == actual) session->Painted();
}
void NativeStockWarmSession::ActualRemoved(BrowserView* actual) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  auto session = ActiveWarmSession();
  if (session && session->view_.get() == actual) session->Cancel("actual_warm_view_removed");
}
bool NativeStockWarmSession::Stable() const {
  if (!reply_ || deadline_.is_null() || base::TimeTicks::Now() > deadline_ ||
      !NativeStartupObservationEnabled() || !ticket_ || !ticket_->Stable() || !ticket_->owner() ||
      !view_ || !browser_ || ticket_->owner()->created_browser().get() != browser_.get() ||
      view_->browser() != browser_.get() || !browser_->GetProfile() || browser_->GetProfile()->IsOffTheRecord() ||
      !widget_ || widget_->IsClosed() || view_->GetWidget() != widget_.get() ||
      !compositor_.IsObserving() || widget_->GetCompositor() != compositor_.GetSource()) return false;
  auto* source = compositor_.GetSource();
  if (display_generation_ && source->native_startup_display_generation() != display_generation_) return false;
  if (!first_ready_paint_) return true;
  auto* frame = document_.AsRenderFrameHostIfValid();
  auto* strip = browser_->GetTabStripModel();
  return strip && web_contents() && !web_contents()->IsBeingDestroyed() && frame &&
      strip->GetActiveWebContents() == web_contents() &&
      frame == web_contents()->GetPrimaryMainFrame() &&
      web_contents()->GetBrowserContext() == browser_->GetProfile() &&
      root_ == viz::SurfaceId(source->frame_sink_id(), source->local_surface_id_from_parent()) &&
      bounds_ && *bounds_ == gfx::Rect(source->size());
}
std::optional<gfx::Rect> NativeStockWarmSession::ReadReadyGeometry() {
  if (!Stable()) return std::nullopt;
  const auto weak = weak_factory_.GetWeakPtr();
  const auto actual = ReadNativeStockViewsRootGeometry(view_.get());
  if (!weak || !Stable()) return std::nullopt;
  return actual;
}
void NativeStockWarmSession::Registered(std::optional<base::TimeTicks> actual) {
  if (!Stable() || first_ready_paint_ || !actual || actual->is_null() ||
      *actual < ticket_->input()->original_event_time || *actual > base::TimeTicks::Now()) {
    Refuse("unavailable_early_native_display_registration"); return;
  }
  display_generation_ = compositor_.GetSource()->native_startup_display_generation();
  if (!display_generation_) { Refuse("unavailable_original_display_generation"); return; }
  registered_ = *actual;
}
void NativeStockWarmSession::Painted() {
  if (!reply_ || first_ready_paint_) return;
  if (!Stable()) { Refuse("native_owner_changed_before_first_ready_paint"); return; }
  const auto weak = weak_factory_.GetWeakPtr();
  const auto actual_bounds = ReadReadyGeometry();
  if (!weak) return;
  if (!Stable()) { Refuse("native_owner_changed_during_input_read"); return; }
  if (!actual_bounds) return;  // Native input is genuinely not yet eligible.
  if (registered_.is_null() || !display_generation_) {
    Refuse("first_eligible_native_paint_before_registration"); return;
  }
  auto* strip = browser_->GetTabStripModel();
  auto* contents = strip ? strip->GetActiveWebContents() : nullptr;
  auto* frame = contents ? contents->GetPrimaryMainFrame() : nullptr;
  if (!frame || frame->IsErrorDocument() || contents->IsBeingDestroyed() ||
      contents->GetBrowserContext() != browser_->GetProfile()) {
    Refuse("unavailable_original_stock_document"); return;
  }
  Observe(contents); document_ = frame->GetWeakDocumentPtr();
  document_receipt_ = base::UnguessableToken::Create(); bounds_ = actual_bounds;
  root_ = viz::SurfaceId(compositor_.GetSource()->frame_sink_id(), compositor_.GetSource()->local_surface_id_from_parent());
  first_ready_paint_ = true; ready_ = base::TimeTicks::Now();
  if (!root_.is_valid() || registered_ > ready_ || !Stable()) {
    Refuse("unstable_first_ready_native_root"); return;
  }
  viz::NativeStockReadyFrame marker; marker.nonce = nonce_; marker.client_bounds = *bounds_; marker.ready = ready_;
  compositor_.GetSource()->QueueNativeStockReadyPaint(marker, base::BindOnce(
      &NativeStockWarmSession::Submitted, weak_factory_.GetWeakPtr()));
}
void NativeStockWarmSession::Submitted(std::optional<viz::NativeStockReadyFrame> actual) {
  if (!Stable()) { Refuse("stock_owner_changed_before_submission_delivery"); return; }
  const auto weak = weak_factory_.GetWeakPtr();
  const auto current_input = ReadReadyGeometry();
  if (!weak) return;
  if (!Stable() || current_input != bounds_) { Refuse("stock_input_changed_before_submission_delivery"); return; }
  const auto now = base::TimeTicks::Now();
  if (!Stable() || submission_ || !actual || actual->nonce != nonce_ ||
      actual->client_bounds != *bounds_ || actual->ready != ready_ || !actual->frame_token ||
      actual->commit.is_null() || actual->submitted.is_null() ||
      ready_ > actual->commit || actual->commit > actual->submitted || actual->submitted > now) {
    Refuse("invalid_original_native_root_submission"); return;
  }
  submission_ = std::move(actual);
  compositor_.GetSource()->CompleteNativeStockStartupHardwareObservation(nonce_, root_, submission_->frame_token,
      base::BindOnce(&NativeStockWarmSession::Presented, weak_factory_.GetWeakPtr()));
}
void NativeStockWarmSession::Presented(viz::mojom::NativeStockRootPresentationPtr actual) {
  if (!Stable() || !ticket_->Confirmed()) { Refuse("stock_owner_changed_before_hardware_delivery"); return; }
  const auto weak = weak_factory_.GetWeakPtr();
  const auto current_input = ReadReadyGeometry();
  if (!weak) return;
  if (!Stable() || current_input != bounds_) { Refuse("stock_input_changed_before_hardware_delivery"); return; }
  const auto now = base::TimeTicks::Now();
  if (!Stable() || !submission_ || !actual || actual->nonce != nonce_ || actual->root != root_ ||
      actual->token != submission_->frame_token || actual->output != *bounds_ ||
      actual->committed_client_bounds != *bounds_ || actual->ready != ready_ ||
      actual->commit != submission_->commit || actual->submitted != submission_->submitted ||
      actual->draw.is_null() || actual->swap.swap_start.is_null() || actual->swap.swap_end.is_null() ||
      actual->feedback.timestamp.is_null() || actual->observed.is_null() ||
      actual->submitted > actual->draw || actual->draw > actual->swap.swap_start ||
      actual->swap.swap_start > actual->swap.swap_end || actual->swap.swap_end > actual->feedback.timestamp ||
      actual->feedback.timestamp > actual->observed || actual->observed > now || now > deadline_ ||
      !(actual->feedback.flags & gfx::PresentationFeedback::kHWCompletion) ||
      (actual->feedback.flags & gfx::PresentationFeedback::kFailure)) {
    Refuse("invalid_original_stock_hardware_pair"); return;
  }
  auto record = Record("measured", "first_full_interactive_stock_added_window_root_hardware");
  record.Set("measured", true).Set("earliestPresentationProven", true)
      .Set("inputLineageProven", false);
  const auto& local = root_.local_surface_id();
  record.Set("rootSurface", base::DictValue()
      .Set("frameSink", base::DictValue().Set("clientId", static_cast<double>(root_.frame_sink_id().client_id()))
          .Set("sinkId", static_cast<double>(root_.frame_sink_id().sink_id())))
      .Set("parentSequenceNumber", static_cast<double>(local.parent_sequence_number()))
      .Set("childSequenceNumber", static_cast<double>(local.child_sequence_number()))
      .Set("embedToken", local.embed_token().ToString()));
  record.Set("rootFrameToken", static_cast<double>(actual->token));
  record.Set("measurementNonce", nonce_.ToString()).Set("sampleSequence", "1");
  record.Set("rootBounds", base::ListValue().Append(bounds_->x()).Append(bounds_->y()).Append(bounds_->width()).Append(bounds_->height()));
  record.Set("feedbackFlags", static_cast<double>(actual->feedback.flags));
  record.Set("alphaReadbackAttempted", actual->alpha_readback_attempted);
  Tick(record, "registeredUs", registered_); Tick(record, "typeableObservedUs", ready_);
  Tick(record, "commitUs", actual->commit); Tick(record, "submittedUs", actual->submitted);
  Tick(record, "drawUs", actual->draw); Tick(record, "swapStartUs", actual->swap.swap_start);
  Tick(record, "swapEndUs", actual->swap.swap_end); Tick(record, "presentedUs", actual->feedback.timestamp);
  Tick(record, "observedUs", now);
  record.Set("elapsedUs", base::NumberToString((actual->feedback.timestamp - ticket_->input()->original_event_time).InMicroseconds()));
  const auto final_input = ReadReadyGeometry();
  if (!weak) return;
  if (!Stable() || final_input != bounds_) { Refuse("stock_owner_changed_before_final_delivery"); return; }
  const auto final_observed = base::TimeTicks::Now();
  if (final_observed > deadline_) { Refuse("warm_deadline_before_final_delivery"); return; }
  Tick(record, "observedUs", final_observed);
  Finish(std::move(record));
}
base::DictValue NativeStockWarmSession::Record(const char* status, const char* reason) const {
  auto result = base::DictValue().Set("producer", "aux-native-stock-warm-presentation")
      .Set("version", 1).Set("status", status).Set("reason", reason)
      .Set("measured", false).Set("earliestPresentationProven", false).Set("inputLineageProven", false);
  if (ticket_ && ticket_->owner() && ticket_->input() && admitted_) {
    const auto& original = ticket_->owner()->original_launch();
    const auto& input = *ticket_->input();
    const auto& original_process = ticket_->owner()->original_process();
    result.Set("originalBrowserProcessUuid", original_process.process_uuid)
        .Set("originalBrowserProcessStart", base::NumberToString(original_process.process_start_absolute))
        .Set("originalBrowserWindowId", ticket_->owner()->original_browser_window_id())
        .Set("trial", original.trial).Set("launchReceiptNonce", original.receipt_nonce)
        .Set("launchReceiptSha256", original.original_receipt_sha256)
        .Set("launcherPid", original.launcher_pid).Set("browserPid", original.browser_pid)
        .Set("helperBinarySha256", original.helper_sha256).Set("helperSourceSha256", original.helper_source_sha256)
        .Set("helperProcessUuid", original.helper_process_uuid)
        .Set("helperProcessStart", base::NumberToString(original.helper_process_start))
        .Set("launchMachTicks", base::NumberToString(original.launch_mach_ticks))
        .Set("spawnReturnedMachTicks", base::NumberToString(original.spawn_returned_mach_ticks));
    Tick(result, "originalLaunchedUs", original.launch);
    Tick(result, "nativeInputUs", input.original_event_time);
    Tick(result, "preparedUs", ticket_->prepared_at());
    result.Set("originalEventSeconds", base::NumberToString(input.original_event_seconds))
        .Set("originalCgTimestampNs", base::NumberToString(input.original_cg_timestamp_ns))
        .Set("inputWindowNumber", input.window_number)
        .Set("inputSourcePid", base::NumberToString(input.source_pid))
        .Set("inputSourceState", base::NumberToString(input.source_state))
        .Set("inputKeyCode", static_cast<int>(input.key_code))
        .Set("inputCgFlags", base::NumberToString(input.cg_flags))
        .Set("inputModifierFlags", base::NumberToString(input.modifier_flags));
    Tick(result, "spawnReturnedUs", original.spawn_returned);
  }
  Tick(result, "deadlineUs", deadline_);
  if (browser_) result.Set("browserWindowId", browser_->GetSessionID().id());
  if (display_generation_) result.Set("displayGeneration", base::NumberToString(display_generation_));
  // This receipt names the retained native WeakDocument lease. It is not a
  // renderer-provided document token and cannot admit/recover a document.
  if (!document_receipt_.is_empty()) result.Set("documentReceipt", document_receipt_.ToString());
  return result;
}
void NativeStockWarmSession::Refuse(const char* reason) {
  if (reply_) Finish(Record("refused", reason));
}
void NativeStockWarmSession::Cancel(const char* reason) { Refuse(reason); }
void NativeStockWarmSession::Finish(base::DictValue record) {
  UnpublishWarmSession(this);
  weak_factory_.InvalidateWeakPtrs(); timeout_.Stop();
  if (auto* source = compositor_.GetSource()) source->CancelNativeStockStartupHardwareObservation(nonce_);
  compositor_.Reset(); Observe(nullptr); ticket_.reset(); submission_.reset();
  auto callback = std::move(reply_); if (callback) std::move(callback).Run(std::move(record));
}
void NativeStockWarmSession::PrimaryPageChanged(content::Page&) { Refuse("original_stock_document_changed"); }
void NativeStockWarmSession::PrimaryMainFrameRenderProcessGone(base::TerminationStatus) { Refuse("original_stock_renderer_gone"); }
void NativeStockWarmSession::WebContentsDestroyed() { Refuse("original_stock_contents_destroyed"); }
void NativeStockWarmSession::OnCompositingShuttingDown(ui::Compositor*) { Refuse("original_stock_compositor_destroyed"); }
void NativeStockWarmSession::OnCompositorVisibilityChanging(ui::Compositor*, bool visible) {
  if (!visible) Refuse("original_stock_window_hidden");
}
}  // namespace aux
#endif
