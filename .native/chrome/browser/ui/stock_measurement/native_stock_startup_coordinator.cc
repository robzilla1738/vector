// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/stock_measurement/native_stock_startup_coordinator.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS) && !BUILDFLAG(ENABLE_AUX_SHELL)
#include <utility>
#include "base/functional/bind.h"
#include "base/no_destructor.h"
#include "chrome/browser/ui/stock_measurement/native_stock_views_readiness.h"
#include "chrome/browser/ui/views/frame/browser_view.h"
namespace aux {
namespace {
base::WeakPtr<NativeStockStartupCoordinator>& Active() {
  static base::NoDestructor<base::WeakPtr<NativeStockStartupCoordinator>> active;
  return *active;
}
}  // namespace
NativeStockStartupCoordinator::NativeStockStartupCoordinator() = default;
NativeStockStartupCoordinator::~NativeStockStartupCoordinator() {
  if (Active().get() == this) Active().reset();
  weak_factory_.InvalidateWeakPtrs();
  timeout_.Stop(); waiter_.Cancel();
  session_.reset();
}
void NativeStockStartupCoordinator::Start(Reply reply, WarmRetained retained) {
  if (reply.is_null()) return;
  if (used_ || Active() || !NativeStartupObservationEnabled()) {
    std::move(reply).Run(base::DictValue().Set("producer", "aux-native-stock-startup-presentation")
        .Set("version", 1).Set("status", "refused").Set("reason", "unavailable_unique_early_fixture")
        .Set("measured", false).Set("earliestPresentationProven", false));
    return;
  }
  used_ = true; reply_ = std::move(reply); warm_retained_ = std::move(retained); Active() = weak_factory_.GetWeakPtr();
  waiter_.Wait(base::BindOnce(&NativeStockStartupCoordinator::Received, weak_factory_.GetWeakPtr()));
}
void NativeStockStartupCoordinator::Added(BrowserView* actual) {
  if (Active()) Active()->Attach(actual);
}
void NativeStockStartupCoordinator::Painted(BrowserView* actual) {
  if (Active()) Active()->Paint(actual);
}
void NativeStockStartupCoordinator::Removed(BrowserView* actual) {
  if (Active() && Active()->view_.get() == actual) Active()->Refuse("original_stock_view_removed");
}
void NativeStockStartupCoordinator::Attach(BrowserView* actual) {
  if (!reply_ || !actual) return;
  if (view_) {
    if (view_.get() != actual) Refuse("multiple_stock_native_views");
    return;
  }
  view_ = actual->GetAsWeakPtr();
  TryStart();
}
void NativeStockStartupCoordinator::Received(std::optional<NativeStartupLaunchReceipt> receipt) {
  if (!reply_) return;
  if (!receipt || !receipt->lease || !receipt->lease->Validate()) {
    Refuse("unavailable_original_stock_launch_receipt"); return;
  }
  const auto remaining = receipt->launch + base::Seconds(5) - base::TimeTicks::Now();
  if (remaining <= base::TimeDelta()) { Refuse("original_stock_startup_deadline_elapsed"); return; }
  receipt_ = std::move(receipt);
  timeout_.Start(FROM_HERE, remaining, base::BindOnce(
      &NativeStockStartupCoordinator::Refuse, weak_factory_.GetWeakPtr(), "original_stock_startup_deadline_elapsed"));
  TryStart();
}
void NativeStockStartupCoordinator::TryStart() {
  if (!reply_ || session_ || !view_ || !receipt_) return;
  session_ = std::make_unique<NativeStockStartupSession>(view_.get());
  session_->Start(std::move(*receipt_), base::BindOnce(
      &NativeStockStartupCoordinator::Finished, weak_factory_.GetWeakPtr()), std::move(warm_retained_));
  // Start may synchronously finish and invoke the fixture's callback; no owner
  // access follows that callback boundary.
}
void NativeStockStartupCoordinator::Paint(BrowserView* actual) {
  if (!reply_ || view_.get() != actual) return;
  if (session_) { session_->Painted(); return; }
  const auto weak = weak_factory_.GetWeakPtr();
  const auto eligible = ReadNativeStockViewsReadyRoot(actual);
  if (!weak) return;
  if (eligible) Refuse("first_eligible_native_paint_before_launch_admission");
}
void NativeStockStartupCoordinator::Finished(base::DictValue record) {
  if (Active().get() == this) Active().reset();
  weak_factory_.InvalidateWeakPtrs(); timeout_.Stop(); waiter_.Cancel(); receipt_.reset();
  auto reply = std::move(reply_);
  if (reply) std::move(reply).Run(std::move(record));
}
void NativeStockStartupCoordinator::Refuse(const char* reason) {
  if (!reply_) return;
  if (session_) { session_->Cancel(reason); return; }
  Finished(base::DictValue().Set("producer", "aux-native-stock-startup-presentation")
      .Set("version", 1).Set("status", "refused").Set("reason", reason)
      .Set("measured", false).Set("earliestPresentationProven", false));
}
}  // namespace aux
#endif
