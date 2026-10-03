// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_STOCK_MEASUREMENT_NATIVE_STOCK_STARTUP_COORDINATOR_H_
#define CHROME_BROWSER_UI_STOCK_MEASUREMENT_NATIVE_STOCK_STARTUP_COORDINATOR_H_
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS) && !BUILDFLAG(ENABLE_AUX_SHELL)
#include <memory>
#include <optional>
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/values.h"
#include "base/timer/timer.h"
#include "chrome/browser/ui/aux/native_startup_admission_waiter.h"
#include "chrome/browser/ui/stock_measurement/native_stock_startup_session.h"
class BrowserView;
namespace aux {
// Owned by the existing Stock fixture before browser creation. These hooks
// receive actual native owners, never bridge selectors or caller timestamps.
class NativeStockStartupCoordinator final {
 public:
  using Reply = base::OnceCallback<void(base::DictValue)>;
  using WarmRetained = NativeStockStartupSession::WarmRetained;
  NativeStockStartupCoordinator();
  ~NativeStockStartupCoordinator();
  void Start(Reply reply, WarmRetained retained = {});
  static void Added(BrowserView* actual);
  static void Painted(BrowserView* actual);
  static void Removed(BrowserView* actual);
 private:
  void Received(std::optional<NativeStartupLaunchReceipt> receipt);
  void Attach(BrowserView* actual);
  void Paint(BrowserView* actual);
  void TryStart();
  void Finished(base::DictValue record);
  void Refuse(const char* reason);
  NativeStartupAdmissionWaiter waiter_;
  std::optional<NativeStartupLaunchReceipt> receipt_;
  base::WeakPtr<BrowserView> view_;
  std::unique_ptr<NativeStockStartupSession> session_;
  Reply reply_;
  WarmRetained warm_retained_;
  bool used_ = false;
  base::OneShotTimer timeout_;
  base::WeakPtrFactory<NativeStockStartupCoordinator> weak_factory_{this};
};
}  // namespace aux
#endif
#endif
