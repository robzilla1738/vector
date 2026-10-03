// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_cdp_measurement_producer.h"
#include <limits>
#include "base/functional/bind.h"
#include "base/process/process_handle.h"
#include "base/strings/string_number_conversions.h"
#include "components/sessions/core/session_id.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/egress_controller.h"
#include "chrome/browser/ui/aux/native_cdp_retirement_measurement.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
namespace aux {
namespace {
base::DictValue Refused() {
  return base::DictValue().Set("producer", "aux-native-cdp-retirement")
      .Set("version", 1).Set("status", "refused");
}
}  // namespace
NativeCdpMeasurementProducer::NativeCdpMeasurementProducer(BrowserWindowInterface* owner) {
  if (!owner || owner->GetType() != BrowserWindowInterface::TYPE_NORMAL ||
      !owner->GetProfile() || owner->GetProfile()->IsOffTheRecord()) return;
  owner_ = owner->GetWeakPtr();
  auto* existing = EgressController::ExistingForCdpMeasurement(owner->GetProfile());
  if (existing) controller_ = existing->GetWeakPtr();
}
NativeStopInputReceipt::NativeStopInputReceipt() = default;
NativeStopInputReceipt::~NativeStopInputReceipt() = default;
NativeCdpMeasurementProducer::~NativeCdpMeasurementProducer() {
  // Destroying the original owner never leaves an armed measurement that a
  // replacement producer could complete. This only discards measurement state.
  weak_factory_.InvalidateWeakPtrs();
  dispatch_timer_.Stop();
  auto dispatch_ready = std::move(dispatch_ready_);
  if (armed_ && controller_) controller_->CompleteCdpRetirementMeasurement();
  if (dispatch_ready) std::move(dispatch_ready).Run(false);
}
void NativeCdpMeasurementProducer::WaitForFreshDispatches(base::OnceCallback<void(bool)> callback) {
  if (dispatch_ready_ || !OwnerCurrent() || !armed_) { std::move(callback).Run(false); return; }
  dispatch_ready_ = std::move(callback);
  dispatch_timer_.Start(FROM_HERE, base::Milliseconds(10), base::BindRepeating(
      &NativeCdpMeasurementProducer::PollFreshDispatches, weak_factory_.GetWeakPtr()));
  PollFreshDispatches();
}
void NativeCdpMeasurementProducer::PollFreshDispatches() {
  if (!dispatch_ready_) return;
  if (!OwnerCurrent() || !armed_ || !controller_->CurrentCdpMeasurementPages() ||
      !controller_->cdp_measurement_ || !controller_->cdp_measurement_->current()) {
    FinishFreshDispatches(false); return;
  }
  if (controller_->cdp_measurement_->HasFreshDispatches()) FinishFreshDispatches(true);
}
void NativeCdpMeasurementProducer::FinishFreshDispatches(bool ready) {
  dispatch_timer_.Stop();
  auto callback = std::move(dispatch_ready_);
  if (callback) std::move(callback).Run(ready);
}
bool NativeCdpMeasurementProducer::OwnerCurrent() const {
  return owner_ && controller_ && owner_->GetType() == BrowserWindowInterface::TYPE_NORMAL &&
      owner_->GetProfile() && !owner_->GetProfile()->IsOffTheRecord() &&
      EgressController::ExistingForCdpMeasurement(owner_->GetProfile()) == controller_.get();
}
std::optional<base::TimeTicks> NativeCdpMeasurementProducer::OriginalStopDeadline() const {
  if (!OwnerCurrent() || !armed_ || !controller_->CurrentCdpMeasurementInput())
    return std::nullopt;
  return controller_->cdp_measurement_->deadline();
}
base::DictValue NativeCdpMeasurementProducer::Run(Operation operation) {
  if (!OwnerCurrent() || sequence_ == std::numeric_limits<uint64_t>::max()) return Refused();
  if (operation != Operation::kComplete) {
    if (armed_ || !controller_->BeginCdpRetirementMeasurement(operation == Operation::kPrepareStop))
      return Refused();
    armed_ = true;
    ++sequence_;
    auto record = controller_->ReadCdpRetirementMeasurementArm();
    record.Set("sequence", base::NumberToString(sequence_));
    record.Set("pid", base::GetCurrentProcId());
    record.Set("browserWindowId", owner_->GetSessionID().id());
    return record;
  }
  if (!armed_) return Refused();
  armed_ = false;
  stop_input_.reset();
  auto record = controller_->CompleteCdpRetirementMeasurement();
  if (record.FindString("status") && *record.FindString("status") == "sampled") {
    record.Set("sequence", base::NumberToString(sequence_));
    record.Set("pid", base::GetCurrentProcId());
    record.Set("browserWindowId", owner_->GetSessionID().id());
  }
  return record;
}
}  // namespace aux
