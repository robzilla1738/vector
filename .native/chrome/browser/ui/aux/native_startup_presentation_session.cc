// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_startup_presentation_session.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <vector>
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
NativeStartupPresentationSession::~NativeStartupPresentationSession() {
  weak_factory_.InvalidateWeakPtrs(); timeout_.Stop();
  auto* compositor = compositor_observation_.GetSource();
  if (compositor && scope_) compositor->CancelNativeStartupHardwareObservation(scope_->request_nonce);
  compositor_observation_.Reset(); admission_.Cancel(); lease_.reset(); hello_observation_.RunAndReset();
}
bool NativeStartupPresentationSession::UniqueRegularOwner() const {
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
  return ui_ && browser && inventory.size() == 1 && inventory[0] == browser &&
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
      (!receipt_ || (receipt_->lease && receipt_->lease->Validate()));
}
void NativeStartupPresentationSession::Start(Reply reply) {
  if (reply.is_null()) return;
  if (used_) { std::move(reply).Run(Record("refused", "startup_already_observed")); return; }
  used_ = true; reply_ = std::move(reply);
  started_ = base::TimeTicks::Now(); deadline_ = started_ + base::Seconds(5);
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
  auto* window = WebUIBrowserWindow::FromBrowser(browser_.get());
  if (!window || !window->widget() || !window->widget()->GetCompositor()) { Refuse("unavailable_initial_compositor"); return; }
  widget_ = window->widget()->GetWeakPtr();
  compositor_observation_.Observe(widget_->GetCompositor());
  owner_ = initial; document_ = frame->GetWeakDocumentPtr();
  if (!Stable()) { Refuse("unstable_initial_shell"); return; }
  auto* profile = Profile::FromWebUI(ui_->web_ui());
  hello_observation_ = NativeStartupRuntimeHelloStore::Observe(profile, base::BindRepeating(
      &NativeStartupPresentationSession::HelloObserved, weak_factory_.GetWeakPtr()));
  if (!hello_observation_) { Refuse("runtime_hello_observer_unavailable"); return; }
  admission_.Wait(base::BindOnce(&NativeStartupPresentationSession::Admitted, weak_factory_.GetWeakPtr()));
}

void NativeStartupPresentationSession::Admitted(std::optional<NativeStartupLaunchReceipt> receipt) {
  if (!Stable() || !receipt || !receipt->lease || !receipt->lease->Validate()) {
    Refuse("unavailable_original_launch_lease"); return;
  }
  receipt_ = std::move(receipt);
  scope_ = blink::mojom::NativeStartupFrameScope::New();
  scope_->request_nonce = base::UnguessableToken::Create(); scope_->sample_sequence = 1;
  scope_->window_id = owner_->window_id; scope_->widget_routing_id = owner_->shell_widget_routing_id;
  scope_->renderer_pid = owner_->shell_renderer_pid; scope_->native_document_generation = 1;
  scope_->document = owner_->shell_document; scope_->shell_sink = owner_->shell_sink;
  scope_->display_sink = owner_->display_sink; scope_->admitted_launch = receipt_->launch;
  auto* window = WebUIBrowserWindow::FromBrowser(ui_->browser());
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
      *registered < receipt_->launch || *registered > base::TimeTicks::Now()) {
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
      actual->observed_typeable_at.is_null() || scope_->hardware_registration.is_null() || scope_->admitted_launch > scope_->hardware_registration ||
      scope_->hardware_registration > actual->observed_typeable_at ||
      actual->observed_typeable_at > actual->commit || actual->commit > actual->submitted_at ||
      actual->submitted_at > now) { Refuse("invalid_initial_shell_submission"); return; }
  viewport_ = ReadNativeStartupViewport(ui_);
  if (!Stable() || !viewport_ || viewport_->owner != *owner_) { Refuse("unavailable_full_initial_viewport"); return; }
  submission_ = std::move(actual);
  inclusion_ = viz::mojom::NativeGuestInclusionScope::New();
  inclusion_->kind = viz::mojom::NativeInclusionScopeKind::kShellStartup;
  inclusion_->display_sink = scope_->display_sink; inclusion_->shell_sink = scope_->shell_sink;
  inclusion_->mutation_shell_token = submission_->shell_frame_token;
  inclusion_->input = scope_->admitted_launch; inclusion_->mutation = submission_->observed_typeable_at;
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
  const auto current = ReadNativeStartupViewport(ui_);
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
  record.Set("elapsedUs", base::NumberToString((actual->feedback.timestamp - receipt_->launch).InMicroseconds()));
  record.Set("shellFrameToken", static_cast<double>(submission_->shell_frame_token));
  record.Set("feedbackFlags", static_cast<double>(actual->feedback.flags));
  record.Set("drawn", EncodeNativePresentationDrawn(actual->drawn));
  if (!Stable() || ReadNativeStartupViewport(ui_) != viewport_) { Refuse("owner_changed_after_hardware_read"); return; }
  hardware_presented_ = actual->feedback.timestamp;
  hardware_record_ = std::move(record);
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
  if (!Stable() || !receipt_ || hello_->acknowledged < receipt_->launch ||
      hello_->acknowledged > base::TimeTicks::Now() || ReadNativeStartupViewport(ui_) != viewport_) {
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
      ReadNativeStartupViewport(ui_) != viewport_) {
    Refuse("runtime_peer_changed_before_startup_delivery"); return;
  }
  auto record = std::move(*hardware_record_);
  AppendNativePresentationTick(record, "runtimePeerConfirmedUs", *confirmed);
  AppendNativePresentationTick(record, "runtimeHelloUs", hello_->acknowledged);
  record.Set("runtimeHelloElapsedUs", base::NumberToString((hello_->acknowledged - receipt_->launch).InMicroseconds()));
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
  auto result = base::DictValue().Set("producer", "aux-native-startup-presentation")
      .Set("version", 1).Set("earliestPresentationProven", false).Set("status", status).Set("reason", reason).Set("measured", false);
  if (!started_.is_null()) {
    AppendNativePresentationTick(result, "observationStartedUs", started_);
    AppendNativePresentationTick(result, "observationDeadlineUs", deadline_);
  }
  if (receipt_) {
    result.Set("trial", receipt_->trial); result.Set("launchReceiptNonce", receipt_->receipt_nonce);
    result.Set("launchReceiptSha256", receipt_->original_receipt_sha256);
    result.Set("launcherPid", receipt_->launcher_pid); result.Set("browserPid", receipt_->browser_pid);
    result.Set("helperBinarySha256", receipt_->helper_sha256); result.Set("helperSourceSha256", receipt_->helper_source_sha256);
    result.Set("helperProcessUuid", receipt_->helper_process_uuid);
    result.Set("helperProcessStart", base::NumberToString(receipt_->helper_process_start));
    result.Set("launchMachTicks", base::NumberToString(receipt_->launch_mach_ticks));
    result.Set("spawnReturnedMachTicks", base::NumberToString(receipt_->spawn_returned_mach_ticks));
    AppendNativePresentationTick(result, "launchUs", receipt_->launch);
  }
  if (scope_) {
    result.Set("nativeDisplayGeneration", base::NumberToString(display_generation_));
    AppendNativePresentationTick(result, "hardwareRegisteredUs", scope_->hardware_registration);
    result.Set("requestNonce", scope_->request_nonce.ToString()); result.Set("sampleSequence", "1");
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
  submission_.reset(); inclusion_.reset(); scope_.reset(); viewport_.reset(); receipt_.reset(); owner_.reset();
  hello_.reset(); hardware_record_.reset(); hardware_presented_.reset(); confirmation_pending_ = false;
  if (reply_) {
    if (record.FindBool("measured").value_or(false) && !WithinDeadline())
      record = Record("refused", "startup_deadline_elapsed");
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
