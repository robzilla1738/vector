// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_little_presentation_fixture.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <limits>
#include "base/functional/bind.h"
#include "base/no_destructor.h"
#include "base/strings/string_number_conversions.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/native_guest_stage_session.h"
#include "chrome/browser/ui/aux/native_presentation_record_codec.h"
#include "chrome/browser/ui/aux/page_identity.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/webui_browser/webui_browser_ui.h"
#include "chrome/browser/ui/webui_browser/webui_browser_window.h"
#include "components/guest_contents/browser/guest_contents_handle.h"
#include "content/browser/renderer_host/render_frame_host_impl.h"
#include "content/browser/renderer_host/render_widget_host_impl.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/render_process_host.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_ui.h"
#include "ui/compositor/compositor.h"
#include "ui/views/widget/widget.h"
namespace aux {
namespace {
base::WeakPtr<NativeLittlePresentationFixture>& ActiveFixture() {
  static base::NoDestructor<base::WeakPtr<NativeLittlePresentationFixture>> active;
  return *active;
}
}  // namespace
std::optional<NativeLittleRouteObservation> ObserveLittleExternalRoute(Profile* profile) {
  return ActiveFixture() ? ActiveFixture()->BeginExternalRoute(profile) : std::nullopt;
}
NativeLittlePresentationFixture::NativeLittlePresentationFixture(base::WeakPtr<WebUIBrowserUI> source)
    : source_(source), ticket_(source) {}
NativeLittlePresentationFixture::~NativeLittlePresentationFixture() {
  if (ActiveFixture().get() == this) ActiveFixture().reset();
  weak_factory_.InvalidateWeakPtrs(); timeout_.Stop(); guest_lease_.reset(); readiness_.reset();
}
bool NativeLittlePresentationFixture::StableSource() const {
  return source_owner_ && ReadNativeGuestStageShellOwner(source_) == source_owner_;
}
base::DictValue NativeLittlePresentationFixture::Record(const char* status, const char* reason) const {
  auto record = base::DictValue().Set("producer", "aux-native-little-presentation-upperbound")
      .Set("version", 1).Set("status", status).Set("reason", reason).Set("measured", false);
  if (source_owner_ && !nonce_.is_empty()) {
    record.Set("metric", "little-window"); record.Set("startKind", "native-arm-upperbound");
    record.Set("earliestPresentationProven", false);
    record.Set("requestNonce", nonce_.ToString()); record.Set("sampleSequence", base::NumberToString(sequence_));
    record.Set("windowId", source_owner_->window_id); record.Set("widgetRoutingId", source_owner_->shell_widget_routing_id);
    record.Set("rendererPid", source_owner_->shell_renderer_pid);
    record.Set("nativeDocumentGeneration", base::NumberToString(source_document_generation_));
    record.Set("shellSink", EncodeNativePresentationSink(source_owner_->shell_sink));
    record.Set("displaySink", EncodeNativePresentationSink(source_owner_->display_sink));
    AppendNativePresentationTick(record, "armedUs", ticket_.armed_at());
  }
  return record;
}
void NativeLittlePresentationFixture::Prepare(Reply ready) {
  if (active_ || record_ || completed_ || (ActiveFixture() && ActiveFixture().get() != this) ||
      ticket_.CreatedBrowserForOwner() || sequence_ >= 4000) {
    std::move(ready).Run(Record("refused", "prior_sample_unconsumed")); return;
  }
  ticket_.Cancel();
  ticket_.SetCommittedCallback(base::BindRepeating(
      &NativeLittlePresentationFixture::TryStart, weak_factory_.GetWeakPtr()));
  source_owner_ = ReadNativeGuestStageShellOwner(source_);
  const auto nonce = source_owner_ ? ticket_.Arm() : std::nullopt;
  if (!nonce || !StableSource()) {
    source_owner_.reset(); std::move(ready).Run(Record("refused", "unavailable_owned_source")); return;
  }
  if (last_source_document_ != source_owner_->shell_document) {
    if (source_document_generation_ == std::numeric_limits<uint64_t>::max()) {
      ticket_.Cancel(); std::move(ready).Run(Record("refused", "document_generation_exhausted")); return;
    }
    last_source_document_ = source_owner_->shell_document; ++source_document_generation_;
  }
  ++sequence_; nonce_ = *nonce; consumed_ = false; active_ = true;
  record_.reset(); target_owner_.reset(); scope_.reset(); submission_.reset(); target_.reset();
  ActiveFixture() = weak_factory_.GetWeakPtr();
  timeout_.Start(FROM_HERE, base::Seconds(5), base::BindOnce(
      &NativeLittlePresentationFixture::Refuse, weak_factory_.GetWeakPtr(), "creation_presentation_timeout"));
  std::move(ready).Run(Record("ready", "ready"));
}
void NativeLittlePresentationFixture::Complete(Reply completed) {
  if (completed_ || consumed_ || (!active_ && !record_)) {
    std::move(completed).Run(Record("refused", "no_prepared_sample")); return;
  }
  if (record_) {
    auto record = std::move(*record_); record_.reset(); consumed_ = true;
    std::move(completed).Run(std::move(record)); return;
  }
  completed_ = std::move(completed); TryStart();
}
std::optional<NativeLittleRouteObservation> NativeLittlePresentationFixture::BeginExternalRoute(Profile* source) {
  if (!active_ || !StableSource()) return std::nullopt;
  const auto nonce = ticket_.BeginExternalRoute(source);
  if (!nonce) { Refuse("ambiguous_or_foreign_external_route"); return std::nullopt; }
  return NativeLittleRouteObservation{weak_factory_.GetWeakPtr(), *nonce};
}
void NativeLittlePresentationFixture::Created(const base::UnguessableToken& nonce, BrowserWindowInterface* window) {
  if (!active_ || !ticket_.Created(nonce, window)) Refuse("invalid_created_little_owner");
}
void NativeLittlePresentationFixture::Delivered(const base::UnguessableToken& nonce,
    content::WebContents* guest, base::WeakPtr<content::NavigationHandle> navigation) {
  if (!active_ || !ticket_.Delivered(nonce, guest, navigation)) Refuse("invalid_delivered_navigation");
}
base::WeakPtr<BrowserWindowInterface> NativeLittlePresentationFixture::CleanupWindowForMailbox() const {
  return StableSource() ? ticket_.CreatedBrowserForOwner() : base::WeakPtr<BrowserWindowInterface>();
}
std::optional<NativeGuestStageOwnedSnapshot> NativeLittlePresentationFixture::CurrentTarget() {
  if (!StableSource() || !target_ || !guest_ || !guest_document_.AsRenderFrameHostIfValid() ||
      guest_document_.AsRenderFrameHostIfValid() != guest_->GetPrimaryMainFrame()) return std::nullopt;
  const auto actual = ticket_.ReadTarget(target_);
  const auto* identity = PageIdentity::FromWebContents(guest_.get());
  auto* handle = guest_contents::GuestContentsHandle::FromWebContents(guest_.get());
  if (!actual || !identity || identity->runtime_owned() || !handle) return std::nullopt;
  return ReadNativeGuestStageOwnedSnapshot(target_, {{identity->id(), handle->id().ToString()}});
}
void NativeLittlePresentationFixture::TryStart() {
  if (!active_ || !completed_ || starting_) return;
  const auto browser = ticket_.CreatedBrowserForOwner();
  if (!browser) return;  // Genuine creation/commit callback or bounded timeout completes this wait.
  auto* window = WebUIBrowserWindow::FromBrowser(browser.get());
  auto* ui = window ? window->GetWebUIBrowserUI() : nullptr;
  auto* guest = browser->GetTabStripModel() ? browser->GetTabStripModel()->GetActiveWebContents() : nullptr;
  auto* frame = guest ? guest->GetPrimaryMainFrame() : nullptr;
  if (!ui || !guest || !frame || !ticket_.ReadTarget(ui->GetWeakPtr())) return;
  target_ = ui->GetWeakPtr(); guest_ = guest->GetWeakPtr(); guest_document_ = frame->GetWeakDocumentPtr();
  target_owner_ = CurrentTarget();
  if (!target_owner_ || target_owner_->guests.size() != 1) { Refuse("unavailable_current_target_geometry"); return; }
  if (last_target_document_ != target_owner_->shell_document) {
    if (target_document_generation_ == std::numeric_limits<uint64_t>::max()) {
      Refuse("document_generation_exhausted"); return;
    }
    last_target_document_ = target_owner_->shell_document; ++target_document_generation_;
  }
  starting_ = true;
  scope_ = blink::mojom::NativeCreatedGuestFrameScope::New();
  scope_->surface_kind = blink::mojom::NativeCreatedGuestSurfaceKind::kLittleWindow;
  scope_->request_nonce = nonce_; scope_->sample_sequence = sequence_;
  scope_->window_id = target_owner_->window_id; scope_->shell_widget_routing_id = target_owner_->shell_widget_routing_id;
  scope_->shell_renderer_pid = target_owner_->shell_renderer_pid; scope_->native_document_generation = target_document_generation_;
  scope_->shell_document = target_owner_->shell_document; scope_->shell_sink = target_owner_->shell_sink;
  scope_->display_sink = target_owner_->display_sink; scope_->external_arm = ticket_.armed_at();
  auto grant = blink::mojom::NativeGuestDocumentFrameScope::New();
  grant->document = static_cast<content::RenderFrameHostImpl*>(frame)->GetDocumentToken();
  grant->request_nonce = nonce_; grant->widget_routing_id = frame->GetRenderWidgetHost()->GetRoutingID();
  grant->renderer_pid = frame->GetProcess()->GetProcess().Pid();
  grant->frame_sink = target_owner_->guests.front().guest_surface.frame_sink_id();
  auto* widget = static_cast<content::RenderWidgetHostImpl*>(frame->GetRenderWidgetHost());
  widget->BeginNativeGuestDocumentFrameForTesting(std::move(grant), guest_lease_.BindNewPipeAndPassReceiver(),
      base::BindOnce(&NativeLittlePresentationFixture::GuestArmed, weak_factory_.GetWeakPtr()));
}
void NativeLittlePresentationFixture::GuestArmed(bool accepted) {
  if (!active_ || !accepted || !scope_ || CurrentTarget() != target_owner_) {
    Refuse("unavailable_current_guest_lease"); return;
  }
  guest_lease_.set_disconnect_handler(base::BindOnce(
      &NativeLittlePresentationFixture::Refuse, weak_factory_.GetWeakPtr(), "guest_lease_disconnected"));
  auto* frame = target_->web_ui()->GetRenderFrameHost();
  auto* widget = static_cast<content::RenderWidgetHostImpl*>(frame->GetRenderWidgetHost());
  widget->MeasureCreatedGuestFrameForTesting(scope_->Clone(), readiness_.BindNewPipeAndPassRemote(),
      base::BindOnce(&NativeLittlePresentationFixture::Submitted, weak_factory_.GetWeakPtr()));
}
void NativeLittlePresentationFixture::Ready(blink::mojom::NativeCreatedGuestFrameScopePtr scope,
    blink::mojom::NativeGuestStageWitnessPtr witness, ReadyCallback accepted) {
  const auto current = CurrentTarget();
  const bool valid = active_ && scope_ && scope && scope->Equals(*scope_) && witness &&
      current && current == target_owner_ && witness->document == scope_->shell_document &&
      !witness->dragging && !witness->split_instance && witness->pages.size() == 1 &&
      NativeGuestStageGeometryMatches(*witness, *current);
  const auto self = weak_factory_.GetWeakPtr();
  std::move(accepted).Run(valid);
  if (self && !valid) Refuse("invalid_created_guest_ready");
}
void NativeLittlePresentationFixture::Submitted(blink::mojom::NativeCreatedGuestFrameSubmissionPtr actual) {
  const auto current = CurrentTarget();
  if (!active_ || !scope_ || !current || current != target_owner_ || !actual || !actual->scope ||
      !actual->scope->Equals(*scope_) || !actual->witness || !actual->submitted || !actual->activated ||
      !actual->submitted_frame || actual->submission_failure >= 0 || !actual->shell_frame_token ||
      actual->witness->document != scope_->shell_document || actual->witness->pages.size() != 1 ||
      actual->witness->split_instance || actual->witness->dragging ||
      !NativeGuestStageGeometryMatches(*actual->witness, *current) ||
      actual->witness_observed.is_null() || scope_->external_arm > actual->witness_observed ||
      actual->witness_observed > actual->commit || actual->commit > actual->submitted_at) {
    Refuse("invalid_created_guest_submission"); return;
  }
  submission_ = std::move(actual);
  auto request = viz::mojom::NativeGuestInclusionScope::New();
  request->display_sink = scope_->display_sink; request->shell_sink = scope_->shell_sink;
  request->mutation_shell_token = submission_->shell_frame_token; request->input = scope_->external_arm;
  request->mutation = submission_->witness_observed; request->shell_submission = submission_->submitted_at;
  const auto& page = submission_->witness->pages.front();
  const auto& owner = target_owner_->guests.front();
  request->guests = {owner.guest_surface};
  request->shapes.push_back(viz::mojom::NativeGuestExpectedShape::New(owner.guest_surface,
      *page->plugin_bounds_in_parent_pixels, page->pane_bounds, page->pane_radius));
  auto* window = WebUIBrowserWindow::FromBrowser(target_->browser());
  if (!window || !window->widget() || !window->widget()->GetCompositor()) { Refuse("unavailable_target_display"); return; }
  window->widget()->GetCompositor()->MeasureNativeGuestInclusion(std::move(request), base::BindOnce(
      &NativeLittlePresentationFixture::Presented, weak_factory_.GetWeakPtr()));
}
void NativeLittlePresentationFixture::Presented(viz::mojom::NativeGuestInclusionResultPtr actual) {
  const auto current = CurrentTarget();
  const auto now = base::TimeTicks::Now();
  const auto elapsed = actual && current && current->guests.size() == 1 ?
      ValidateLittleHardwareUpperBound(ticket_.armed_at(), ticket_.committed_at(),
          current->guests.front(), *actual, now) : std::nullopt;
  if (!active_ || !scope_ || !submission_ || !current || current != target_owner_ || !actual || !actual->scope ||
      !elapsed || actual->scope->mutation_shell_token != submission_->shell_frame_token ||
      actual->scope->mutation != submission_->witness_observed || actual->scope->shell_submission != submission_->submitted_at) {
    Refuse("invalid_created_guest_hardware_pair"); return;
  }
  bool leased_frame = false;
  for (const auto& drawn : actual->drawn)
    leased_frame |= drawn && drawn->surface == current->guests.front().guest_surface &&
        HasNativeGuestDocumentFrameForTesting(target_, guest_, nonce_, drawn->surface, drawn->token, drawn->surface_size);
  if (!leased_frame) { Refuse("created_guest_document_frame_not_included"); return; }
  auto record = Record("measured", "measured-upperbound"); record.Set("measured", true);
  auto target = base::DictValue().Set("windowId", scope_->window_id)
      .Set("widgetRoutingId", scope_->shell_widget_routing_id).Set("rendererPid", scope_->shell_renderer_pid)
      .Set("nativeDocumentGeneration", base::NumberToString(scope_->native_document_generation))
      .Set("shellSink", EncodeNativePresentationSink(scope_->shell_sink))
      .Set("displaySink", EncodeNativePresentationSink(scope_->display_sink));
  record.Set("target", std::move(target));
  AppendNativePresentationTick(record, "guestCommittedUs", ticket_.committed_at());
  AppendNativePresentationTick(record, "witnessObservedUs", submission_->witness_observed);
  AppendNativePresentationTick(record, "commitUs", submission_->commit);
  AppendNativePresentationTick(record, "submittedUs", submission_->submitted_at);
  AppendNativePresentationTick(record, "drawUs", actual->draw);
  AppendNativePresentationTick(record, "swapStartUs", actual->swap.swap_start);
  AppendNativePresentationTick(record, "swapEndUs", actual->swap.swap_end);
  AppendNativePresentationTick(record, "presentedUs", actual->feedback.timestamp);
  AppendNativePresentationTick(record, "observedUs", now);
  record.Set("elapsedUs", base::NumberToString(elapsed->InMicroseconds()));
  record.Set("shellFrameToken", static_cast<double>(submission_->shell_frame_token));
  record.Set("feedbackFlags", static_cast<double>(actual->feedback.flags));
  record.Set("drawn", EncodeNativePresentationDrawn(actual->drawn));
  Finish(std::move(record));
}
void NativeLittlePresentationFixture::Refuse(const char* reason) {
  if (active_) Finish(Record("refused", reason));
}
void NativeLittlePresentationFixture::Finish(base::DictValue record) {
  // Retire every asynchronous callback before releasing leases or replying.
  if (ActiveFixture().get() == this) ActiveFixture().reset();
  weak_factory_.InvalidateWeakPtrs();
  timeout_.Stop(); readiness_.reset(); guest_lease_.reset(); starting_ = false; active_ = false;
  record_ = std::move(record);
  // Keep the exact creation ticket through reply/Next until target destruction.
  // It grants cleanup continuity only, never another operation/effect.
  if (completed_) {
    auto reply = std::move(completed_); auto value = std::move(*record_); record_.reset(); consumed_ = true;
    std::move(reply).Run(std::move(value));
  }
}
}  // namespace aux
#endif
