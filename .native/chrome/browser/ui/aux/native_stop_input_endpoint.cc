// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_stop_input_endpoint.h"
#include "base/functional/bind.h"
#include "base/json/json_writer.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/native_cdp_measurement_producer.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/webui_browser/webui_browser_ui.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_ui.h"
#include "third_party/blink/public/common/associated_interfaces/associated_interface_provider.h"

namespace aux {
NativeStopInputEndpoint::NativeStopInputEndpoint(
    content::RenderFrameHost* frame, NativeCdpMeasurementProducer* producer) {
  auto* contents = frame ? content::WebContents::FromRenderFrameHost(frame) : nullptr;
  auto* web_ui = contents ? contents->GetWebUI() : nullptr;
  auto* ui = web_ui && web_ui->GetController()
      ? web_ui->GetController()->GetAs<WebUIBrowserUI>() : nullptr;
  auto* owner = ui ? ui->browser() : nullptr;
  if (!frame || !contents || contents->GetPrimaryMainFrame() != frame || !owner ||
      !producer || owner->GetType() != BrowserWindowInterface::TYPE_NORMAL ||
      !owner->GetProfile() || owner->GetProfile()->IsOffTheRecord())
    return;
  auto host = AuxRuntimeHost::ExistingForMeasuredStop(owner->GetProfile());
  if (!host) return;
  shell_document_ = frame->GetWeakDocumentPtr();
  ui_ = ui->GetWeakPtr();
  owner_ = owner->GetWeakPtr();
  producer_ = producer->GetWeakPtr();
  host_ = host;
  connection_generation_ = host->admitted_native_generation_;
  host_incarnation_ = host->native_owner_incarnation_;
}
NativeStopInputEndpoint::~NativeStopInputEndpoint() {
  weak_factory_.InvalidateWeakPtrs();
  receiver_.reset();
  if (renderer_.is_bound()) renderer_->Retire();
  renderer_.reset();
  preparation_timer_.Stop();
  completion_timer_.Stop();
  auto preparation = std::move(preparation_);
  auto completion = std::move(completion_);
  if (preparation) std::move(preparation).Run(false);
  if (completion) std::move(completion).Run(false);
}
bool NativeStopInputEndpoint::Current() const {
  auto* frame = shell_document_.AsRenderFrameHostIfValid();
  auto* contents = frame ? content::WebContents::FromRenderFrameHost(frame) : nullptr;
  const auto current_host = owner_ && owner_->GetProfile() ?
      AuxRuntimeHost::ExistingForMeasuredStop(owner_->GetProfile()) : base::WeakPtr<AuxRuntimeHost>();
  return frame && frame->IsActive() && frame->IsRenderFrameLive() && contents &&
      contents->GetPrimaryMainFrame() == frame && ui_ && owner_ && host_ && producer_ &&
      ui_->web_ui() == contents->GetWebUI() && ui_->browser() == owner_.get() &&
      owner_->GetType() == BrowserWindowInterface::TYPE_NORMAL &&
      owner_->GetProfile() && !owner_->GetProfile()->IsOffTheRecord() &&
      contents->GetBrowserContext() == owner_->GetProfile() &&
      producer_->owner_.get() == owner_.get() && producer_->OwnerCurrent() &&
      current_host && current_host.get() == host_.get() &&
      host_->admitted_native_generation_ == connection_generation_ &&
      host_->native_owner_incarnation_ == host_incarnation_;
}
void NativeStopInputEndpoint::Prepare(base::OnceCallback<void(bool)> callback) {
  const auto deadline = producer_ ? producer_->OriginalStopDeadline() : std::nullopt;
  if (!Current() || !deadline || *deadline <= base::TimeTicks::Now() ||
      renderer_.is_bound() || receiver_.is_bound() || preparation_) {
    std::move(callback).Run(false);
    return;
  }
  original_deadline_ = *deadline;
  preparation_ = std::move(callback);
  auto* frame = shell_document_.AsRenderFrameHostIfValid();
  frame->GetRemoteAssociatedInterfaces()->GetInterface(&renderer_);
  renderer_.set_disconnect_handler(base::BindOnce(&NativeStopInputEndpoint::Retire,
                                                 weak_factory_.GetWeakPtr()));
  preparation_timer_.Start(FROM_HERE, *deadline - base::TimeTicks::Now(),
      base::BindOnce(&NativeStopInputEndpoint::Retire, weak_factory_.GetWeakPtr()));
  renderer_->Prepare(receiver_.BindNewEndpointAndPassRemote(), base::BindOnce(
      &NativeStopInputEndpoint::Prepared, weak_factory_.GetWeakPtr()));
}
void NativeStopInputEndpoint::Prepared(bool ready) {
  const auto deadline = producer_ ? producer_->OriginalStopDeadline() : std::nullopt;
  ready_ = ready && Current() && deadline && *deadline > base::TimeTicks::Now();
  preparation_timer_.Stop();
  if (!ready_) {
    Retire();
    return;
  }
  auto callback = std::move(preparation_);
  if (callback) std::move(callback).Run(true);
}
void NativeStopInputEndpoint::Retire() {
  ready_ = false;
  preparation_timer_.Stop();
  receiver_.reset();
  if (renderer_.is_bound()) renderer_->Retire();
  renderer_.reset();
  completion_timer_.Stop();
  auto callback = std::move(preparation_);
  auto completion = std::move(completion_);
  if (callback) std::move(callback).Run(false);
  if (completion) std::move(completion).Run(false);
}
void NativeStopInputEndpoint::WaitForMeasuredCompletion(base::OnceCallback<void(bool)> callback) {
  if (!Current() || !ready_ || completion_ || original_deadline_.is_null() ||
      base::TimeTicks::Now() >= original_deadline_) { std::move(callback).Run(false); return; }
  if (measured_completed_) { std::move(callback).Run(measured_accepted_); return; }
  completion_ = std::move(callback);
  completion_timer_.Start(FROM_HERE, original_deadline_ - base::TimeTicks::Now(),
      base::BindOnce(&NativeStopInputEndpoint::Retire, weak_factory_.GetWeakPtr()));
}
void NativeStopInputEndpoint::Stop(
    const std::optional<base::UnguessableToken>& original_input,
    const std::string& run_id, StopCallback callback) {
  if (!ready_ || !Current() || run_id.empty() || run_id.size() > 160) {
    std::move(callback).Run(false, {});
    return;
  }
  auto* frame = shell_document_.AsRenderFrameHostIfValid();
  auto input = producer_->TakeStopInput(original_input.value_or(base::UnguessableToken()),
                                       frame, run_id);
  auto params = base::WriteJson(base::DictValue().Set("runId", run_id));
  if (!params || !Current()) {
    std::move(callback).Run(false, {});
    return;
  }
  // Exactly the existing local Stop API and original Worker completion. An
  // absent/refused measurement never suppresses or duplicates ordinary Stop.
  const bool measured = !!input;
  host_->CallApiWithMeasuredStop("runs.cancel", std::move(*params),
      base::BindOnce(&NativeStopInputEndpoint::Complete, weak_factory_.GetWeakPtr(),
                     measured, std::move(callback)), std::move(input));
}
void NativeStopInputEndpoint::Complete(bool measured, StopCallback callback,
                                     AuxRuntimeHost::Response response) {
  const bool accepted = response.ok && Current();
  base::OnceCallback<void(bool)> completion;
  bool measured_accepted = false;
  if (measured) {
    measured_completed_ = true;
    measured_accepted_ = accepted && base::TimeTicks::Now() < original_deadline_;
    measured_accepted = measured_accepted_;
    completion_timer_.Stop();
    completion = std::move(completion_);
  }
  // Original worker reply is delivered before measurement can retire the sink.
  // Move all callback ownership first; either callback can retire this endpoint.
  std::move(callback).Run(accepted, accepted ? std::move(response.result_json) : std::string());
  if (completion) std::move(completion).Run(measured_accepted);
}
}  // namespace aux
