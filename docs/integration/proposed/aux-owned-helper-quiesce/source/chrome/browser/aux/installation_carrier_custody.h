// Copyright 2026 Aux Authors. All rights reserved.
#ifndef CHROME_BROWSER_AUX_INSTALLATION_CARRIER_CUSTODY_H_
#define CHROME_BROWSER_AUX_INSTALLATION_CARRIER_CUSTODY_H_
#include <cstddef>
#include <functional>
#include <memory>

namespace aux {
// Custody of this browser's direct installation-carrier calls only. No reopen.
// A launch callback must synchronously launch only the child it returns true for.
class InstallationCarrierCustody {
 private:
  struct State;

 public:
  InstallationCarrierCustody();
  ~InstallationCarrierCustody();
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
    ~Call();
    bool LaunchIfAdmitted(const std::function<bool()>& launch);
    // Invoke only after actual WaitForExit* success for this call's owned child.
    void ObservedChildExit();

   private:
    friend class InstallationCarrierCustody;
    explicit Call(std::shared_ptr<State> state);
    std::shared_ptr<State> state_;
    bool attempted_ = false;
    bool launched_ = false;
    bool exited_ = false;
  };
  std::shared_ptr<Call> BeginCall();
  Snapshot CloseAdmission();
  Snapshot Inspect() const;

 private:
  const std::shared_ptr<State> state_;
};
}  // namespace aux
#endif
