// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_startup_presentation_session.h"
#include "chrome/browser/ui/aux/native_aux_warm_creation_ticket.h"
#include "chrome/browser/ui/aux/native_aux_warm_owner.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <vector>
#include <algorithm>
#include "base/functional/bind.h"
#include "base/strings/string_number_conversions.h"
#include "base/unguessable_token.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/native_performance_mailbox.h"
#include "chrome/browser/ui/aux/native_presentation_record_codec.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface_iterator.h"
#include "chrome/browser/ui/webui_browser/webui_browser_ui.h"
#include "chrome/browser/ui/webui_browser/webui_browser_window.h"
#include "content/browser/renderer_host/render_widget_host_impl.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_ui.h"
#include "ui/compositor/compositor.h"
#include "ui/gfx/presentation_feedback.h"
#include "ui/views/widget/widget.h"
namespace aux {
NativeStartupPresentationSession::NativeStartupPresentationSession(base::WeakPtr<WebUIBrowserUI> ui)
    : content::WebContentsObserver(ui && ui->web_ui() ? ui->web_ui()->GetWebContents() : nullptr), ui_(ui), browser_(ui && ui->browser() ? ui->browser()->GetWeakPtr() : base::WeakPtr<BrowserWindowInterface>()) {}
NativeStartupPresentationSession::NativeStartupPresentationSession(
    base::WeakPtr<WebUIBrowserUI> ui,
    base::WeakPtr<NativeAuxWarmCreationTicket> exact_warm_ticket)
    : NativeStartupPresentationSession(ui) {
  warm_mode_ = true; warm_ticket_ = exact_warm_ticket;
}
std::unique_ptr<NativeAuxWarmOwner> NativeStartupPresentationSession::TakeOriginalWarmOwner() {
  if (warm_mode_ || reply_ || !used_ || !original_warm_owner_ ||
      !original_warm_owner_->BeforeCreation()) return nullptr;
  return std::move(original_warm_owner_);
}
const NativeStartupLaunchReceipt* NativeStartupPresentationSession::OriginalLaunch() const {
  if (warm_mode_) return warm_ticket_ && warm_ticket_->owner() ?
      &warm_ticket_->owner()->original_launch() : nullptr;
  return receipt_ ? &*receipt_ : nullptr;
}
std::optional<NativeStartupViewport> NativeStartupPresentationSession::CurrentViewport() const {
  return warm_mode_ ? ReadNativeWarmStartupViewport(ui_, warm_ticket_) : ReadNativeStartupViewport(ui_);
}
NativeStartupPresentationSession::~NativeStartupPresentationSession() {
  weak_factory_.InvalidateWeakPtrs(); timeout_.Stop();
  auto* compositor = compositor_observation_.GetSource();
  if (compositor && scope_) compositor->CancelNativeStartupHardwareObservation(scope_->request_nonce);
  compositor_observation_.Reset(); admission_.Cancel(); lease_.reset(); hello_observation_.RunAndReset();
}
bool NativeStartupPresentationSession::UniqueRegularOwner() const {
  if (warm_mode_) return ui_ && browser_ && warm_ticket_ && warm_ticket_->Stable() &&
      warm_ticket_->owner() && warm_ticket_->owner()->created_browser().get() == browser_.get() &&
      ui_->browser() == browser_.get();
  if (!NativeStartupObservationEnabled() || !ui_ || !ui_->web_ui() || !browser_ || ui_->browser() != browser_.get()) return false;
  auto* profile = Profile::FromWebUI(ui_->web_ui());
  if (!profile || profile->IsOffTheRecord() || ui_->browser()->GetProfile() != profile) return false;
  const auto browser = browser_;
  const auto selected = profile->GetPath().DirName();
  std::vector<base::WeakPtr<BrowserWindowInterface>> inventory;
  ForEachCurrentBrowserWindowInterfaceOrderedByActivation(
      [&inventory, selected](BrowserWindowInterface* candidate) {
        if (candidate->GetProfile() && candidate->GetProfile()->GetPath().DirName() == selected &&
            WebUIBrowserWindow::FromBrowser(candidate)) inventory.push_back(candidate->GetWeakPtr());
        return true;
      });
  return ui_ && browser && inventory.size() == 1 && inventory[0] && inventory[0].get() == browser.get() &&
      NativePerformanceOwnerInventoryMatches(browser.get(), {}, {browser.get()});
}
bool NativeStartupPresentationSession::WithinDeadline() const {
  return !deadline_.is_null() && base::TimeTicks::Now() <= deadline_;
}
bool NativeStartupPresentationSession::Stable() const {
  auto* frame = document_.AsRenderFrameHostIfValid();
  return reply_ && WithinDeadline() && ui_ && ui_->web_ui() && browser_ && widget_ && compositor_observation_.IsObserving() &&
      widget_->GetCompositor() == compositor_observation_.GetSource() &&
      (!display_generation_ || compositor_observation_.GetSource()->native_startup_display_generation() == display_generation_) &&
      ui_->browser() == browser_.get() && web_contents() && !web_contents()->IsBeingDestroyed() && frame &&
      frame == web_contents()->GetPrimaryMainFrame() && frame == ui_->web_ui()->GetRenderFrameHost() &&
      owner_ && UniqueRegularOwner() && ReadNativeGuestStageShellOwner(ui_) == owner_ &&
      (warm_mode_ ? (OriginalLaunch() && OriginalLaunch()->lease && OriginalLaunch()->lease->Validate()) :
       (!receipt_ || (OriginalLaunch()->lease && OriginalLaunch()->lease->Validate())));
}
void NativeStartupPresentationSession::Start(Reply reply) {
  if (reply.is_null()) return;
  if (used_) { std::move(reply).Run(Record("refused", "startup_already_observed")); return; }
  used_ = true; reply_ = std::move(reply);
  started_ = base::TimeTicks::Now(); deadline_ = started_ + base::Seconds(5);
  if (warm_mode_) {
    if (!warm_ticket_ || !warm_ticket_->Stable() || !warm_ticket_->input()) {
      Refuse("unavailable_exact_warm_ticket"); return;
    }
    deadline_ = std::min(deadline_, std::min(warm_ticket_->prepared_at() + base::Seconds(5),
        warm_ticket_->input()->original_event_time + base::Seconds(5)));
  }
  if (!NativeStartupObservationEnabled()) { Refuse("startup_observer_not_admitted"); return; }
  timeout_.Start(FROM_HERE, base::Seconds(5), base::BindOnce(
      &NativeStartupPresentationSession::Refuse, weak_factory_.GetWeakPtr(), "startup_presentation_timeout"));
  TryInitialDocument();
}
void NativeStartupPresentationSession::TryInitialDocument() {
  if (!reply_ || owner_) return;
  // WebUI construction can precede initial page commit. Bind on the original
  // native PrimaryPageChanged event, never a repeated later-frame poll.
  const auto initial = ReadNativeGuestStageShellOwner(ui_);
  if (!initial) return;
  auto* frame = web_contents() ? web_contents()->GetPrimaryMainFrame() : nullptr;
  if (!frame || !UniqueRegularOwner()) { Refuse("unavailable_initial_shell"); return; }
  auto* window = warm_mode_ && web_contents() ?
      WebUIBrowserWindow::FromWebShellWebContents(web_contents()) :
      WebUIBrowserWindow::FromBrowser(browser_.get());
  if (!window || !window->widget() || !window->widget()->GetCompositor()) { Refuse("unavailable_initial_compositor"); return; }
  widget_ = window->widget()->GetWeakPtr();
  compositor_observation_.Observe(widget_->GetCompositor());
  owner_ = initial; document_ = frame->GetWeakDocumentPtr();
  if (!Stable()) { Refuse("unstable_initial_shell"); return; }
  if (warm_mode_) {
    Admitted(std::nullopt);
    return;
  }
  auto* profile = Profile::FromWebUI(ui_->web_ui());
  hello_observation_ = NativeStartupRuntimeHelloStore::Observe(profile, base::BindRepeating(
      &NativeStartupPresentationSession::HelloObserved, weak_factory_.GetWeakPtr()));
  if (!hello_observation_) { Refuse("runtime_hello_observer_unavailable"); return; }
  admission_.Wait(base::BindOnce(&NativeStartupPresentationSession::Admitted, weak_factory_.GetWeakPtr()));
}

void NativeStartupPresentationSession::Admitted(std::optional<NativeStartupLaunchReceipt> receipt) {
  if (warm_mode_) {
    if (receipt || !Stable() || !OriginalLaunch() || !OriginalLaunch()->lease ||
        !OriginalLaunch()->lease->Validate() || !warm_ticket_ || !warm_ticket_->input()) {
      Refuse("unavailable_retained_warm_launch_lease"); return;
    }
  } else {
    if (!Stable() || !receipt || !receipt->lease || !receipt->lease->Validate()) {
      Refuse("unavailable_original_launch_lease"); return;
    }
    receipt_ = std::move(receipt);
  }
  scope_ = blink::mojom::NativeStartupFrameScope::New();
  scope_->request_nonce = warm_mode_ ? warm_ticket_->nonce() : base::UnguessableToken::Create();
  scope_->sample_sequence = warm_mode_ ? 2 : 1;
  scope_->window_id = owner_->window_id; scope_->widget_routing_id = owner_->shell_widget_routing_id;
  scope_->renderer_pid = owner_->shell_renderer_pid; scope_->native_document_generation = 1;
  scope_->document = owner_->shell_document; scope_->shell_sink = owner_->shell_sink;
  scope_->display_sink = owner_->display_sink; scope_->admitted_launch = OriginalLaunch()->launch;
  scope_->purpose = warm_mode_ ? blink::mojom::NativeStartupFramePurpose::kAuxWarm :
      blink::mojom::NativeStartupFramePurpose::kAuxCold;
  scope_->measurement_input = warm_mode_ ? warm_ticket_->input()->original_event_time : OriginalLaunch()->launch;
  auto* window = warm_mode_ && web_contents() ?
      WebUIBrowserWindow::FromWebShellWebContents(web_contents()) : WebUIBrowserWindow::FromBrowser(ui_->browser());
  if (!Stable() || !window || !window->widget() || !window->widget()->GetCompositor()) {
    Refuse("unavailable_early_display_observer"); return;
  }
  display_generation_ = compositor_observation_.GetSource()->native_startup_display_generation();
  if (!display_generation_) { Refuse("display_generation_unavailable"); return; }
  // Real Display registration ACK precedes the first eligible renderer commit.
  window->widget()->GetCompositor()->BeginNativeStartupHardwareObservation(
      scope_->request_nonce, scope_->shell_sink, base::BindOnce(
          &NativeStartupPresentationSession::HardwareObservationReady, weak_factory_.GetWeakPtr()));
}
void NativeStartupPresentationSession::HardwareObservationReady(std::optional<base::TimeTicks> registered) {
  if (!Stable() || !scope_ || !registered || registered->is_null() ||
      *registered < scope_->measurement_input || *registered > base::TimeTicks::Now()) {
    Refuse("unavailable_original_display_registration"); return;
  }
  scope_->hardware_registration = *registered;
  auto* frame = document_.AsRenderFrameHostIfValid();
  if (!frame) { Refuse("document_changed_before_early_arm"); return; }
  auto* widget = static_cast<content::RenderWidgetHostImpl*>(frame->GetRenderWidgetHost());
  widget->BeginNativeStartupFrameForTesting(scope_->Clone(), lease_.BindNewPipeAndPassReceiver(),
      base::BindOnce(&NativeStartupPresentationSession::Submitted, weak_factory_.GetWeakPtr()));
  if (!Stable()) { Refuse("owner_changed_during_early_arm"); return; }
  lease_.set_disconnect_handler(base::BindOnce(
      &NativeStartupPresentationSession::LeaseDisconnected, weak_factory_.GetWeakPtr()));
}

void NativeStartupPresentationSession::Submitted(blink::mojom::NativeStartupFrameSubmissionPtr actual) {
  const auto now = base::TimeTicks::Now();
  if (!Stable() || !scope_ || !actual || !actual->scope || !actual->scope->Equals(*scope_) ||
      !actual->activated || !actual->submitted_frame || actual->submission_failure >= 0 ||
      !actual->shell_frame_token || actual->witness_document != scope_->document ||
      actual->composer_instance.empty() || actual->composer_instance.size() > 64 ||
      actual->observed_typeable_at.is_null() ||
      scope_->purpose != (warm_mode_ ? blink::mojom::NativeStartupFramePurpose::kAuxWarm :
          blink::mojom::NativeStartupFramePurpose::kAuxCold) ||
      (!warm_mode_ && scope_->measurement_input != scope_->admitted_launch) ||
      (warm_mode_ && (!warm_ticket_ || !warm_ticket_->input() ||
       scope_->measurement_input != warm_ticket_->input()->original_event_time ||
       scope_->measurement_input <= scope_->admitted_launch)) ||
      scope_->hardware_registration.is_null() || scope_->measurement_input > scope_->hardware_registration ||
      scope_->hardware_registration > actual->observed_typeable_at ||
      actual->observed_typeable_at > actual->commit || actual->commit > actual->submitted_at ||
      actual->submitted_at > now) { Refuse("invalid_initial_shell_submission"); return; }
  viewport_ = CurrentViewport();
  if (!Stable() || !viewport_ || viewport_->owner != *owner_) { Refuse("unavailable_full_initial_viewport"); return; }
  submission_ = std::move(actual);
  inclusion_ = viz::mojom::NativeGuestInclusionScope::New();
  inclusion_->kind = viz::mojom::NativeInclusionScopeKind::kShellStartup;
  inclusion_->display_sink = scope_->display_sink; inclusion_->shell_sink = scope_->shell_sink;
  inclusion_->mutation_shell_token = submission_->shell_frame_token;
  inclusion_->input = scope_->measurement_input; inclusion_->mutation = submission_->observed_typeable_at;
  inclusion_->shell_submission = submission_->submitted_at;
  inclusion_->startup_shell = viewport_->shell_surface;
  inclusion_->startup_shell_size = viewport_->geometry.shell_pixels;
  inclusion_->startup_shell_bounds = viewport_->shell_root_pixels;
  auto* window = WebUIBrowserWindow::FromBrowser(ui_->browser());
  if (!window || !window->widget() || !window->widget()->GetCompositor()) { Refuse("unavailable_initial_display"); return; }
  window->widget()->GetCompositor()->CompleteNativeStartupHardwareObservation(scope_->request_nonce, inclusion_->Clone(),
      base::BindOnce(&NativeStartupPresentationSession::Presented, weak_factory_.GetWeakPtr()));
}
void NativeStartupPresentationSession::Presented(viz::mojom::NativeGuestInclusionResultPtr actual) {
  const auto now = base::TimeTicks::Now();
  const auto current = CurrentViewport();
  if (!Stable() || !viewport_ || current != viewport_ || !inclusion_ || !submission_ ||
      !actual || !actual->measured || !actual->scope || !actual->scope->Equals(*inclusion_) ||
      actual->display_surface.frame_sink_id() != scope_->display_sink || actual->drawn.size() != 1 ||
      !actual->drawn[0] || actual->drawn[0]->surface != viewport_->shell_surface ||
      actual->drawn[0]->token != submission_->shell_frame_token ||
      actual->drawn[0]->visible_bounds != viewport_->shell_root_pixels ||
      actual->drawn[0]->surface_size != viewport_->geometry.shell_pixels ||
      submission_->submitted_at > actual->draw || actual->draw > actual->swap.swap_start ||
      actual->swap.swap_start > actual->swap.swap_end || actual->swap.swap_end > actual->feedback.timestamp ||
      actual->feedback.timestamp > now || actual->draw.is_null() || actual->swap.swap_start.is_null() ||
      actual->swap.swap_end.is_null() || actual->feedback.timestamp.is_null() ||
      !(actual->feedback.flags & gfx::PresentationFeedback::kHWCompletion) ||
      (actual->feedback.flags & gfx::PresentationFeedback::kFailure)) {
    Refuse("invalid_initial_shell_hardware_pair"); return;
  }
  auto record = Record("measured", "first_full_interactive_shell_hardware");
  record.Set("measured", true); record.Set("earliestPresentationProven", true); record.Set("composerInstance", submission_->composer_instance);
  AppendNativePresentationTick(record, "typeableObservedUs", submission_->observed_typeable_at);
  AppendNativePresentationTick(record, "commitUs", submission_->commit);
  AppendNativePresentationTick(record, "submittedUs", submission_->submitted_at);
  AppendNativePresentationTick(record, "drawUs", actual->draw);
  AppendNativePresentationTick(record, "swapStartUs", actual->swap.swap_start);
  AppendNativePresentationTick(record, "swapEndUs", actual->swap.swap_end);
  AppendNativePresentationTick(record, "presentedUs", actual->feedback.timestamp);
  AppendNativePresentationTick(record, "observedUs", now);
  record.Set("elapsedUs", base::NumberToString((actual->feedback.timestamp - scope_->measurement_input).InMicroseconds()));
  record.Set("shellFrameToken", static_cast<double>(submission_->shell_frame_token));
  record.Set("feedbackFlags", static_cast<double>(actual->feedback.flags));
  record.Set("drawn", EncodeNativePresentationDrawn(actual->drawn));
  if (!Stable() || CurrentViewport() != viewport_) { Refuse("owner_changed_after_hardware_read"); return; }
  hardware_presented_ = actual->feedback.timestamp;
  hardware_record_ = std::move(record);
  if (warm_mode_) {
    if (!warm_ticket_ || !warm_ticket_->Confirmed() || !Stable() || !WithinDeadline() ||
        CurrentViewport() != viewport_) { Refuse("warm_owner_changed_before_delivery"); return; }
    Finish(std::move(*hardware_record_));
    return;
  }
  TryComplete();
}
void NativeStartupPresentationSession::HelloObserved(std::optional<NativeStartupRuntimeHello> actual) {
  if (!reply_) return;
  if (!WithinDeadline()) { Refuse("startup_deadline_elapsed"); return; }
  if (!Stable() || !actual) { Refuse("original_runtime_hello_retired"); return; }
  if (hello_ || actual->connection_generation != 1) { Refuse("runtime_hello_republished"); return; }
  hello_ = std::move(actual);
  TryComplete();
}
void NativeStartupPresentationSession::TryComplete() {
  if (!reply_ || !hardware_record_ || !hello_ || confirmation_pending_) return;
  if (!WithinDeadline()) { Refuse("startup_deadline_elapsed"); return; }
  if (!Stable() || !receipt_ || hello_->acknowledged < OriginalLaunch()->launch ||
      hello_->acknowledged > base::TimeTicks::Now() || CurrentViewport() != viewport_) {
    Refuse("invalid_runtime_hello_hardware_join"); return;
  }
  confirmation_pending_ = true;
  NativeStartupRuntimeHelloStore::Confirm(Profile::FromWebUI(ui_->web_ui()), *hello_, deadline_,
      base::BindOnce(&NativeStartupPresentationSession::HelloConfirmed, weak_factory_.GetWeakPtr()));
}
void NativeStartupPresentationSession::HelloConfirmed(std::optional<base::TimeTicks> confirmed) {
  if (!reply_) return;
  if (!WithinDeadline()) { Refuse("startup_deadline_elapsed"); return; }
  if (!confirmed || confirmed->is_null() || !Stable() || !receipt_ || !hardware_record_ || !hardware_presented_ || !hello_ ||
      *confirmed < *hardware_presented_ || *confirmed < hello_->acknowledged || *confirmed > base::TimeTicks::Now() ||
      CurrentViewport() != viewport_) {
    Refuse("runtime_peer_changed_before_startup_delivery"); return;
  }
  auto record = std::move(*hardware_record_);
  AppendNativePresentationTick(record, "runtimePeerConfirmedUs", *confirmed);
  AppendNativePresentationTick(record, "runtimeHelloUs", hello_->acknowledged);
  record.Set("runtimeHelloElapsedUs", base::NumberToString((hello_->acknowledged - OriginalLaunch()->launch).InMicroseconds()));
  record.Set("runtimeConnectionGeneration", base::NumberToString(hello_->connection_generation));
  record.Set("runtimePid", hello_->peer.pid);
  record.Set("runtimePidVersion", hello_->peer.pid_version);
  base::ListValue audit;
  for (const auto word : hello_->peer.audit_token) audit.Append(static_cast<double>(word));
  record.Set("runtimeAuditToken", std::move(audit));
  AppendNativePresentationTick(record, "observedUs", base::TimeTicks::Now());
  Finish(std::move(record));
}
base::DictValue NativeStartupPresentationSession::Record(const char* status, const char* reason) const {
  auto result = base::DictValue().Set("producer", warm_mode_ ? "aux-native-warm-window" : "aux-native-startup-presentation")
      .Set("version", 1).Set("earliestPresentationProven", false).Set("status", status).Set("reason", reason).Set("measured", false);
  if (!started_.is_null()) {
    AppendNativePresentationTick(result, "observationStartedUs", started_);
    AppendNativePresentationTick(result, "observationDeadlineUs", deadline_);
  }
  if (const auto* original = OriginalLaunch()) {
    result.Set("trial", original->trial); result.Set("launchReceiptNonce", original->receipt_nonce);
    result.Set("launchReceiptSha256", original->original_receipt_sha256);
    result.Set("launcherPid", original->launcher_pid); result.Set("browserPid", original->browser_pid);
    result.Set("helperBinarySha256", original->helper_sha256); result.Set("helperSourceSha256", original->helper_source_sha256);
    result.Set("helperProcessUuid", original->helper_process_uuid);
    result.Set("helperProcessStart", base::NumberToString(original->helper_process_start));
    result.Set("launchMachTicks", base::NumberToString(original->launch_mach_ticks));
    result.Set("spawnReturnedMachTicks", base::NumberToString(original->spawn_returned_mach_ticks));
    AppendNativePresentationTick(result, "launchUs", original->launch);
  }
  if (warm_mode_ && warm_ticket_ && warm_ticket_->owner()) {
    const auto* warm_owner = warm_ticket_->owner();
    const auto& process = warm_owner->original_process();
    result.Set("classification", "warm-additional-window");
    result.Set("inputLineageProven", false);
    result.Set("warmCreationConfirmed", warm_ticket_->Confirmed());
    result.Set("preparedWindowId", warm_owner->original_shell().window_id);
    result.Set("browserProcessUuid", process.process_uuid);
    result.Set("browserProcessStart", base::NumberToString(process.process_start_absolute));
    AppendNativePresentationTick(result, "preparedUs", warm_ticket_->prepared_at());
    if (const auto& input = warm_ticket_->input()) {
      AppendNativePresentationTick(result, "originalInputUs", input->original_event_time);
      result.Set("originalEventTimestamp", input->original_event_seconds);
      result.Set("originalCgTimestampNs", base::NumberToString(input->original_cg_timestamp_ns));
      result.Set("inputSourcePid", base::NumberToString(input->source_pid));
      result.Set("inputSourceState", base::NumberToString(input->source_state));
      result.Set("inputWindowNumber", input->window_number);
      result.Set("inputKeyCode", input->key_code);
      result.Set("inputCgFlags", base::NumberToString(input->cg_flags));
      result.Set("inputModifierFlags", base::NumberToString(input->modifier_flags));
    }
  }
  if (scope_) {
    result.Set("nativeDisplayGeneration", base::NumberToString(display_generation_));
    AppendNativePresentationTick(result, "hardwareRegisteredUs", scope_->hardware_registration);
    result.Set("requestNonce", scope_->request_nonce.ToString()); result.Set("sampleSequence", base::NumberToString(scope_->sample_sequence));
    result.Set("windowId", scope_->window_id); result.Set("rendererPid", scope_->renderer_pid);
    result.Set("widgetRoutingId", scope_->widget_routing_id); result.Set("nativeDocumentGeneration", "1");
    result.Set("shellSink", EncodeNativePresentationSink(scope_->shell_sink));
    result.Set("displaySink", EncodeNativePresentationSink(scope_->display_sink));
  }
  return result;
}
void NativeStartupPresentationSession::LeaseDisconnected() { Refuse("startup_frame_lease_disconnected"); }
void NativeStartupPresentationSession::Refuse(const char* reason) {
  if (reply_) Finish(Record("refused", reason));
}
void NativeStartupPresentationSession::Finish(base::DictValue record) {
  weak_factory_.InvalidateWeakPtrs(); timeout_.Stop();
  auto* compositor = compositor_observation_.GetSource();
  if (compositor && scope_) compositor->CancelNativeStartupHardwareObservation(scope_->request_nonce);
  compositor_observation_.Reset(); admission_.Cancel(); lease_.reset(); hello_observation_.RunAndReset();
  std::unique_ptr<NativeAuxWarmOwner> retained_warm;
  if (!warm_mode_ && record.FindBool("measured").value_or(false) && WithinDeadline() && receipt_) {
    retained_warm = NativeAuxWarmOwner::RetainOriginal(std::move(*receipt_), ui_);
    // Retaining a continuation must not admit a replacement document after
    // cancellation/teardown. Bind it to the original delivered startup owner.
    if (retained_warm && (!owner_ || retained_warm->original_shell() != *owner_ || !ui_ ||
        !ui_->web_ui() || !document_.AsRenderFrameHostIfValid() ||
        ui_->web_ui()->GetWebContents()->GetPrimaryMainFrame() != document_.AsRenderFrameHostIfValid()))
      retained_warm.reset();
  }
  submission_.reset(); inclusion_.reset(); scope_.reset(); viewport_.reset(); receipt_.reset(); owner_.reset();
  hello_.reset(); hardware_record_.reset(); hardware_presented_.reset(); confirmation_pending_ = false;
  if (reply_) {
    if (record.FindBool("measured").value_or(false) && !WithinDeadline())
      record = Record("refused", "startup_deadline_elapsed");
    if (!warm_mode_ && record.FindBool("measured").value_or(false) && WithinDeadline())
      original_warm_owner_ = std::move(retained_warm);
    std::move(reply_).Run(std::move(record));
  }
}
void NativeStartupPresentationSession::PrimaryPageChanged(content::Page&) {
  if (owner_) Refuse("startup_document_changed");
  else TryInitialDocument();
}
void NativeStartupPresentationSession::PrimaryMainFrameRenderProcessGone(base::TerminationStatus) { Refuse("startup_renderer_gone"); }
void NativeStartupPresentationSession::OnCompositingShuttingDown(ui::Compositor*) {
  compositor_observation_.Reset(); Refuse("startup_compositor_shutdown");
}
void NativeStartupPresentationSession::OnCompositorVisibilityChanging(ui::Compositor*, bool visible) {
  if (!visible) Refuse("startup_compositor_hidden");
}
void NativeStartupPresentationSession::WebContentsDestroyed() { Refuse("startup_shell_destroyed"); }
}  // namespace aux
#endif
