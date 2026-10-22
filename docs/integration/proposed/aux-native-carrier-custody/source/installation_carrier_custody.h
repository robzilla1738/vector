// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_AUX_INSTALLATION_CARRIER_CUSTODY_H_
#define CHROME_BROWSER_AUX_INSTALLATION_CARRIER_CUSTODY_H_
#include <cstddef>
#include <functional>
#include <memory>
#include <mutex>

namespace aux {
// Custody of this browser's direct installation-carrier calls only. No reopen.
// A launch callback must synchronously launch only the child it returns true for.
class InstallationCarrierCustody {
 private:
  struct State {
    std::mutex mutex;
    bool closed = false;
    size_t calls = 0;
    size_t unresolved_children = 0;
  };
 public:
  struct Snapshot {
    bool admission_closed;
    size_t active_calls;
    size_t unresolved_children;
    bool drained() const {
      return admission_closed && !active_calls && !unresolved_children;
    }
  };
  class Call {
   public:
    Call(const Call&) = delete;
    Call& operator=(const Call&) = delete;
    ~Call() {
      std::lock_guard guard(state_->mutex);
      --state_->calls;
      if (launched_ && !exited_) ++state_->unresolved_children;
    }
    bool LaunchIfAdmitted(const std::function<bool()>& launch) {
      std::lock_guard guard(state_->mutex);
      if (state_->closed || attempted_) return false;
      attempted_ = true;
      launched_ = launch();
      return launched_;
    }
    // Invoke only after actual WaitForExit* success for this call's owned child.
    void ObservedChildExit() {
      std::lock_guard guard(state_->mutex);
      if (launched_) exited_ = true;
    }
   private:
    friend class InstallationCarrierCustody;
    explicit Call(std::shared_ptr<State> state) : state_(std::move(state)) {}
    std::shared_ptr<State> state_;
    bool attempted_ = false;
    bool launched_ = false;
    bool exited_ = false;
  };
  std::shared_ptr<Call> BeginCall() {
    std::lock_guard guard(state_->mutex);
    if (state_->closed) return {};
    ++state_->calls;
    return std::shared_ptr<Call>(new Call(state_));
  }
  Snapshot CloseAdmission() {
    std::lock_guard guard(state_->mutex);
    state_->closed = true;
    return {true, state_->calls, state_->unresolved_children};
  }
  Snapshot Inspect() const {
    std::lock_guard guard(state_->mutex);
    return {state_->closed, state_->calls, state_->unresolved_children};
  }
 private:
  const std::shared_ptr<State> state_ = std::make_shared<State>();
};
}  // namespace aux
#endif
