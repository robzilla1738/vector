// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_STARTUP_ADMISSION_WAITER_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_STARTUP_ADMISSION_WAITER_H_
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/threading/sequence_bound.h"
#include "base/timer/timer.h"
#include "chrome/browser/ui/aux/native_startup_launch_receipt.h"
namespace aux {
// Fixed original owned-fixture receipt only; no path/file/PID/window selectors.
// Single native initial admission wait, not a repeated renderer measurement poll.
class NativeStartupAdmissionWaiter final {
 public:
  using Reply = base::OnceCallback<void(std::optional<NativeStartupLaunchReceipt>)>;
  NativeStartupAdmissionWaiter();
  ~NativeStartupAdmissionWaiter();
  void Wait(Reply reply);
  void Cancel();
 private:
  class State;
  void Received(std::optional<NativeStartupLaunchReceipt> receipt);
  Reply reply_;
  bool used_ = false;
  base::OneShotTimer timeout_;
  base::SequenceBound<State> state_;
  base::WeakPtrFactory<NativeStartupAdmissionWaiter> weak_factory_{this};
};
}  // namespace aux
#endif
#endif
