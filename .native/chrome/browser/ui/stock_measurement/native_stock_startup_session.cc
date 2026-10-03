// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/stock_measurement/native_stock_startup_session.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS) && !BUILDFLAG(ENABLE_AUX_SHELL)
#include <utility>
#include "base/functional/bind.h"
#include "base/strings/string_number_conversions.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/stock_measurement/native_stock_memory_sampler.h"
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
void Tick(base::DictValue& record, const char* name, base::TimeTicks actual) {
  if (!actual.is_null()) record.Set(name, base::NumberToString(actual.since_origin().InMicroseconds()));
}
}  // namespace
NativeStockStartupSession::NativeStockStartupSession(BrowserView* actual)
    : view_(actual ? actual->GetAsWeakPtr() : base::WeakPtr<BrowserView>()),
      browser_(actual && actual->browser() ? actual->browser()->GetWeakPtr() : base::WeakPtr<BrowserWindowInterface>()) {}
NativeStockStartupSession::~NativeStockStartupSession() {
  weak_factory_.InvalidateWeakPtrs(); timeout_.Stop();
  if (auto* source = compositor_.GetSource()) source->CancelNativeStockStartupHardwareObservation(nonce_);
  compositor_.Reset(); Observe(nullptr);
}
void NativeStockStartupSession::Start(NativeStartupLaunchReceipt receipt, Reply reply, WarmRetained retained) {
  if (reply.is_null()) return;
  if (used_) { std::move(reply).Run(Record("refused", "startup_already_observed")); return; }
  used_ = true; reply_ = std::move(reply); warm_retained_ = std::move(retained); receipt_ = std::move(receipt);
  if (!receipt_->lease || receipt_->launch.is_null() || !receipt_->lease->Validate()) {
    Refuse("unavailable_original_launch_lease"); return;
  }
  // This Stock guard is stricter than a timer started after UI construction:
  // the original admitted OS-launch stamp also bounds every async delivery.
  admitted_ = true; deadline_ = receipt_->launch + base::Seconds(5);
  nonce_ = base::UnguessableToken::Create();
  if (!view_ || !browser_ || view_->browser() != browser_.get() ||
      !view_->GetWidget() || !view_->GetWidget()->GetCompositor()) {
    Refuse("unavailable_original_native_window"); return;
  }
  widget_ = view_->GetWidget()->GetWeakPtr(); compositor_.Observe(widget_->GetCompositor());
  if (!Stable()) { Refuse("unavailable_unique_stock_owner"); return; }
  timeout_.Start(FROM_HERE, deadline_ - base::TimeTicks::Now(), base::BindOnce(
      &NativeStockStartupSession::Refuse, weak_factory_.GetWeakPtr(), "startup_deadline_elapsed"));
  compositor_.GetSource()->BeginNativeStockStartupHardwareObservation(nonce_, base::BindOnce(
      &NativeStockStartupSession::Registered, weak_factory_.GetWeakPtr()));
}
bool NativeStockStartupSession::Stable() const {
  const auto current_owner = ReadNativeStockMeasurementOwner();
  if (!reply_ || deadline_.is_null() || base::TimeTicks::Now() > deadline_ ||
      !NativeStartupObservationEnabled() || !receipt_ || !receipt_->lease || !receipt_->lease->Validate() ||
      !view_ || !browser_ || !current_owner || current_owner.get() != browser_.get() ||
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
void NativeStockStartupSession::Registered(std::optional<base::TimeTicks> actual) {
  if (!Stable() || first_ready_paint_ || !actual || actual->is_null() ||
      *actual < receipt_->launch || *actual > base::TimeTicks::Now()) {
    Refuse("unavailable_early_native_display_registration"); return;
  }
  display_generation_ = compositor_.GetSource()->native_startup_display_generation();
  if (!display_generation_) { Refuse("unavailable_original_display_generation"); return; }
  registered_ = *actual;
}
void NativeStockStartupSession::Painted() {
  if (!reply_ || first_ready_paint_) return;
  if (!Stable()) { Refuse("native_owner_changed_before_first_ready_paint"); return; }
  const auto weak = weak_factory_.GetWeakPtr();
  const auto actual_bounds = ReadNativeStockViewsReadyRoot(view_.get());
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
      &NativeStockStartupSession::Submitted, weak_factory_.GetWeakPtr()));
}
void NativeStockStartupSession::Submitted(std::optional<viz::NativeStockReadyFrame> actual) {
  if (!Stable()) { Refuse("stock_owner_changed_before_submission_delivery"); return; }
  const auto weak = weak_factory_.GetWeakPtr();
  const auto current_input = ReadNativeStockViewsReadyRoot(view_.get());
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
      base::BindOnce(&NativeStockStartupSession::Presented, weak_factory_.GetWeakPtr()));
}
void NativeStockStartupSession::Presented(viz::mojom::NativeStockRootPresentationPtr actual) {
  if (!Stable()) { Refuse("stock_owner_changed_before_hardware_delivery"); return; }
  const auto weak = weak_factory_.GetWeakPtr();
  const auto current_input = ReadNativeStockViewsReadyRoot(view_.get());
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
  auto record = Record("measured", "first_full_interactive_stock_native_root_hardware");
  record.Set("measured", true).Set("earliestPresentationProven", true);
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
  record.Set("elapsedUs", base::NumberToString((actual->feedback.timestamp - receipt_->launch).InMicroseconds()));
  const auto final_input = ReadNativeStockViewsReadyRoot(view_.get());
  if (!weak) return;
  if (!Stable() || final_input != bounds_) { Refuse("stock_owner_changed_before_final_delivery"); return; }
  std::unique_ptr<NativeStockWarmOwner> warm;
  if (warm_retained_) {
    warm = NativeStockWarmOwner::RetainOriginal(std::move(*receipt_), browser_.get());
    receipt_.reset();
    // Retention performs real kernel/held-FD checks. Do not let those reads
    // cross the original absolute cold deadline or conceal a changed scope.
    if (!warm || !warm->BeforeCreation() || base::TimeTicks::Now() > deadline_) {
      Finish(Record("refused", "cold_scope_changed_during_warm_lease_retention")); return;
    }
    Tick(record, "observedUs", base::TimeTicks::Now());
  }
  Finish(std::move(record), std::move(warm));
}
base::DictValue NativeStockStartupSession::Record(const char* status, const char* reason) const {
  auto result = base::DictValue().Set("producer", "aux-native-stock-startup-presentation")
      .Set("version", 1).Set("status", status).Set("reason", reason)
      .Set("measured", false).Set("earliestPresentationProven", false);
  if (receipt_ && admitted_) {
    result.Set("trial", receipt_->trial).Set("launchReceiptNonce", receipt_->receipt_nonce)
        .Set("launchReceiptSha256", receipt_->original_receipt_sha256)
        .Set("launcherPid", receipt_->launcher_pid).Set("browserPid", receipt_->browser_pid)
        .Set("helperBinarySha256", receipt_->helper_sha256).Set("helperSourceSha256", receipt_->helper_source_sha256)
        .Set("helperProcessUuid", receipt_->helper_process_uuid)
        .Set("helperProcessStart", base::NumberToString(receipt_->helper_process_start))
        .Set("launchMachTicks", base::NumberToString(receipt_->launch_mach_ticks))
        .Set("spawnReturnedMachTicks", base::NumberToString(receipt_->spawn_returned_mach_ticks));
    Tick(result, "launchedUs", receipt_->launch); Tick(result, "spawnReturnedUs", receipt_->spawn_returned);
  }
  Tick(result, "deadlineUs", deadline_);
  if (browser_) result.Set("browserWindowId", browser_->GetSessionID().id());
  if (display_generation_) result.Set("displayGeneration", base::NumberToString(display_generation_));
  // This receipt names the retained native WeakDocument lease. It is not a
  // renderer-provided document token and cannot admit/recover a document.
  if (!document_receipt_.is_empty()) result.Set("documentReceipt", document_receipt_.ToString());
  return result;
}
void NativeStockStartupSession::Refuse(const char* reason) {
  if (reply_) Finish(Record("refused", reason));
}
void NativeStockStartupSession::Cancel(const char* reason) { Refuse(reason); }
void NativeStockStartupSession::Finish(base::DictValue record,
    std::unique_ptr<NativeStockWarmOwner> retained) {
  weak_factory_.InvalidateWeakPtrs(); timeout_.Stop();
  if (auto* source = compositor_.GetSource()) source->CancelNativeStockStartupHardwareObservation(nonce_);
  compositor_.Reset(); Observe(nullptr); receipt_.reset(); submission_.reset();
  auto callback = std::move(reply_);
  auto warm_callback = std::move(warm_retained_);
  // Detach both callbacks before crossing the ownership handoff. No member
  // access follows: the fixture may retire this session from either callback.
  if (warm_callback) std::move(warm_callback).Run(std::move(retained));
  if (callback) std::move(callback).Run(std::move(record));
}
void NativeStockStartupSession::PrimaryPageChanged(content::Page&) { Refuse("original_stock_document_changed"); }
void NativeStockStartupSession::PrimaryMainFrameRenderProcessGone(base::TerminationStatus) { Refuse("original_stock_renderer_gone"); }
void NativeStockStartupSession::WebContentsDestroyed() { Refuse("original_stock_contents_destroyed"); }
void NativeStockStartupSession::OnCompositingShuttingDown(ui::Compositor*) { Refuse("original_stock_compositor_destroyed"); }
void NativeStockStartupSession::OnCompositorVisibilityChanging(ui::Compositor*, bool visible) {
  if (!visible) Refuse("original_stock_window_hidden");
}
}  // namespace aux
#endif
