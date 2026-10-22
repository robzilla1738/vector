// Copyright 2026 Aux Authors. All rights reserved.
#include "chrome/browser/aux/installation_carrier_custody.h"

#include <mutex>
#include <utility>

namespace aux {
struct InstallationCarrierCustody::State {
  std::mutex mutex;
  bool closed = false;
  size_t calls = 0;
  size_t unresolved_children = 0;
};

InstallationCarrierCustody::InstallationCarrierCustody()
    : state_(std::make_shared<State>()) {}
InstallationCarrierCustody::~InstallationCarrierCustody() = default;

InstallationCarrierCustody::Call::Call(std::shared_ptr<State> state)
    : state_(std::move(state)) {}
InstallationCarrierCustody::Call::~Call() {
  std::lock_guard guard(state_->mutex);
  --state_->calls;
  if (launched_ && !exited_) ++state_->unresolved_children;
}
bool InstallationCarrierCustody::Call::LaunchIfAdmitted(
    const std::function<bool()>& launch) {
  std::lock_guard guard(state_->mutex);
  if (state_->closed || attempted_) return false;
  attempted_ = true;
  launched_ = launch();
  return launched_;
}
void InstallationCarrierCustody::Call::ObservedChildExit() {
  std::lock_guard guard(state_->mutex);
  if (launched_) exited_ = true;
}
std::shared_ptr<InstallationCarrierCustody::Call>
InstallationCarrierCustody::BeginCall() {
  std::lock_guard guard(state_->mutex);
  if (state_->closed) return {};
  ++state_->calls;
  return std::shared_ptr<Call>(new Call(state_));
}
InstallationCarrierCustody::Snapshot
InstallationCarrierCustody::CloseAdmission() {
  std::lock_guard guard(state_->mutex);
  state_->closed = true;
  return {true, state_->calls, state_->unresolved_children};
}
InstallationCarrierCustody::Snapshot InstallationCarrierCustody::Inspect() const {
  std::lock_guard guard(state_->mutex);
  return {state_->closed, state_->calls, state_->unresolved_children};
}
}  // namespace aux
