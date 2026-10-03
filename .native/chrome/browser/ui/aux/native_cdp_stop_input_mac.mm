// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_cdp_measurement_producer.h"
#include "chrome/browser/ui/aux/native_cdp_stop_input_mac.h"
#include "chrome/browser/buildflags.h"
#import <Cocoa/Cocoa.h>
#include <cmath>
#include <limits>
#include <unistd.h>
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/egress_controller.h"
#include "chrome/browser/ui/aux/native_cdp_retirement_measurement.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/webui_browser/webui_browser_ui.h"
#include "content/public/browser/native_platform_input_admission.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/render_widget_host.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_ui.h"
#include "ui/events/event_utils.h"

namespace aux {
namespace {
WebUIBrowserUI* OriginalShell(content::RenderFrameHost* frame) {
  auto* contents = frame ? content::WebContents::FromRenderFrameHost(frame) : nullptr;
  auto* web_ui = contents ? contents->GetWebUI() : nullptr;
  if (!frame || !contents || !frame->IsActive() || !frame->IsRenderFrameLive() ||
      contents->GetPrimaryMainFrame() != frame || !web_ui ||
      !web_ui->GetController())
    return nullptr;
  return web_ui->GetController()->GetAs<WebUIBrowserUI>();
}
}  // namespace

#if BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
bool AdmitNativeCdpStopMeasurementInput(
    const content::NativePlatformInputAdmission& admission) {
  auto* shell = OriginalShell(admission.document().AsRenderFrameHostIfValid());
  return shell && shell->AdmitAuxNativeStopMeasurement(admission);
}
#endif

bool NativeCdpMeasurementProducer::AdmitStopInput(
    const content::NativePlatformInputAdmission& admission) {
  // A later native admission cannot leave an earlier token available for a
  // different click. This state never carries browser effect authority.
  stop_input_.reset();
  auto* frame = admission.document().AsRenderFrameHostIfValid();
  auto* shell = OriginalShell(frame);
  auto* contents = frame ? content::WebContents::FromRenderFrameHost(frame) : nullptr;
  NSEvent* event = admission.event().Get();
  if (!OwnerCurrent() || !armed_ || !controller_->CurrentCdpMeasurementInput() || !shell || shell->browser() != owner_.get() ||
      contents != admission.contents() ||
      frame->GetRenderWidgetHost() != admission.widget() || !event ||
      event.type != NSEventTypeLeftMouseUp || !event.CGEvent ||
      !std::isfinite(event.timestamp) || event.timestamp <= 0 ||
      !base::TimeTicks::IsConsistentAcrossProcesses())
    return false;
  const auto source = CGEventGetIntegerValueField(event.CGEvent, kCGEventSourceUnixProcessID);
  if (source < 0 || source > std::numeric_limits<int>::max() || source == getpid())
    return false;
  const auto event_ticks = ui::EventTimeStampFromSeconds(event.timestamp);
  const auto admitted = admission.admitted_ticks();
  if (event_ticks.is_null() || event_ticks > admitted ||
      ui::EventLatencyTimeFromNative(admission.event(), admitted) != event_ticks)
    return false;
  const auto* measurement = controller_->cdp_measurement_.get();
  if (!measurement || !measurement->current() ||
      measurement->mode() != NativeCdpRetirementMeasurement::Mode::kStop ||
      !admission.Consume())
    return false;
  auto receipt = std::unique_ptr<NativeStopInputReceipt>(new NativeStopInputReceipt);
  receipt->owner_ = owner_;
  receipt->controller_ = controller_;
  receipt->shell_document_ = admission.document();
  receipt->id_ = base::UnguessableToken::Create();
  receipt->run_id_ = measurement->root_run();
  receipt->host_incarnation_ = measurement->owner_incarnation();
  receipt->connection_generation_ = measurement->connection_generation();
  receipt->event_ticks_ = event_ticks;
  receipt->admitted_ticks_ = admitted;
  // Keep the original arm deadline; no fresh event window is created.
  receipt->deadline_ = measurement->deadline();
  if (base::TimeTicks::Now() >= receipt->deadline_ ||
      !admission.PublishMeasurementId(receipt->id_))
    return false;
  stop_input_ = std::move(receipt);
  return true;
}

std::unique_ptr<NativeStopInputReceipt> NativeCdpMeasurementProducer::TakeStopInput(
    const base::UnguessableToken& id, content::RenderFrameHost* original_shell,
    const std::string& run_id) {
  auto input = std::move(stop_input_);
  auto* shell = OriginalShell(original_shell);
  if (!input || id.is_empty() || input->id_ != id || !OwnerCurrent() || !armed_ ||
      !controller_->CurrentCdpMeasurementInput() ||
      !shell || shell->browser() != input->owner_.get() || run_id != input->run_id_ ||
      !input->controller_ || input->controller_.get() != controller_.get() ||
      input->shell_document_.AsRenderFrameHostIfValid() != original_shell ||
      base::TimeTicks::Now() >= input->deadline_)
    return nullptr;
  const auto* measurement = controller_->cdp_measurement_.get();
  if (!measurement || !measurement->current() ||
      measurement->mode() != NativeCdpRetirementMeasurement::Mode::kStop ||
      measurement->root_run() != input->run_id_ ||
      measurement->owner_incarnation() != input->host_incarnation_ ||
      measurement->connection_generation() != input->connection_generation_)
    return nullptr;
  return input;
}
}  // namespace aux
