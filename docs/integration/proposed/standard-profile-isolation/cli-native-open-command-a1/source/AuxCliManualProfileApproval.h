#pragma once
#include <memory>
#include "base/functional/callback.h"
namespace aux::cli {
class Invocation;
class BrowserInvocation;
}
class BrowserWindowInterface;
class Profile;
namespace aux::cli {
// Native UI sequence only. There is no deserializer, caller Boolean or public
// constructor. Only the actual LocalAuthentication reply can create this lease.
// It retains the exact audited invocation and actual native Profile binding.
class ApprovedCliInvocation final {
 public:
  ~ApprovedCliInvocation();
  ApprovedCliInvocation(const ApprovedCliInvocation&) = delete;
  ApprovedCliInvocation& operator=(const ApprovedCliInvocation&) = delete;
  bool Current() const;
  Profile* RevalidatedNativeProfile() const;
 private:
  struct State;
  explicit ApprovedCliInvocation(std::unique_ptr<State>);
  std::unique_ptr<State> state_;
  friend class ManualProfileApprovalRequest;
  friend class BrowserInvocation;
  friend class NativeOpenOperation;
  // Single-use, called only immediately before the real native navigation.
  std::unique_ptr<Invocation> ConsumeForNativeOpen(Profile* actual_target);
};
// The native browser owner retains this pending operation; destroying it
// invalidates its actual LAContext and all late callbacks. No prompt is created
// by including this source or by receiving a public CLI request alone.
class ManualProfileApprovalRequest final {
 public:
  using Done = base::OnceCallback<void(std::unique_ptr<ApprovedCliInvocation>)>;
  static std::unique_ptr<ManualProfileApprovalRequest> BeginForActualWindow(
      BrowserWindowInterface&, std::unique_ptr<Invocation>, Done);
  ~ManualProfileApprovalRequest();
  ManualProfileApprovalRequest(const ManualProfileApprovalRequest&) = delete;
  ManualProfileApprovalRequest& operator=(const ManualProfileApprovalRequest&) = delete;
  void Cancel();
 private:
  struct State;
  explicit ManualProfileApprovalRequest(std::unique_ptr<State>);
  void BeginActualAuthentication();
  void PollPendingInvocation();
  void AuthenticationReplied(bool actual_os_success);
  std::unique_ptr<State> state_;
};
}
