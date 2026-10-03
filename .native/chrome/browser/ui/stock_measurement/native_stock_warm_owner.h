// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_STOCK_MEASUREMENT_NATIVE_STOCK_WARM_OWNER_H_
#define CHROME_BROWSER_UI_STOCK_MEASUREMENT_NATIVE_STOCK_WARM_OWNER_H_
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS) && !BUILDFLAG(ENABLE_AUX_SHELL)
#include <memory>
#include "base/memory/weak_ptr.h"
#include "chrome/browser/ui/aux/native_startup_launch_receipt.h"
#include "chrome/browser/ui/aux/native_process_footprint.h"
#include "content/public/browser/weak_document_ptr.h"
class BrowserWindowInterface;
namespace aux {
// A native-only retained continuation of the original admitted cold lifetime.
// This does not arm input, create a window or supply a presentation endpoint.
// Only the cold session's validated success path may transfer its original
// receipt here. A decoded JSON receipt cannot construct a retained lease.
class NativeStockWarmOwner final {
 public:
  static std::unique_ptr<NativeStockWarmOwner> RetainOriginal(
      NativeStartupLaunchReceipt original, BrowserWindowInterface* browser);
  ~NativeStockWarmOwner();
  NativeStockWarmOwner(const NativeStockWarmOwner&) = delete;
  NativeStockWarmOwner& operator=(const NativeStockWarmOwner&) = delete;
  bool BeforeCreation() const;
  // The input transaction supplies the exact returned CreateBrowserWindow
  // result, never a last-active, title, next-window or frame-size search.
  bool BindCreated(BrowserWindowInterface* actual_returned);
  // Only while the exact native creation call is on the stack: the actual
  // Browser is not yet published by BrowserManagerService. Final delivery
  // still requires WithCreated after exact returned-BWI confirmation.
  bool DuringCreation() const;
  bool WithCreated() const;
  base::WeakPtr<BrowserWindowInterface> original_browser() const;
  base::WeakPtr<BrowserWindowInterface> created_browser() const;
  const NativeStartupLaunchReceipt& original_launch() const;
  const NativeProcessFootprint& original_process() const;
  int original_browser_window_id() const;
 private:
  NativeStockWarmOwner(NativeStartupLaunchReceipt original,
      BrowserWindowInterface* browser, NativeProcessFootprint process);
  bool Lifetime() const;
  bool Inventory(bool with_created) const;
  NativeStartupLaunchReceipt receipt_;
  const NativeProcessFootprint process_;
  const int original_browser_window_id_;
  base::WeakPtr<BrowserWindowInterface> original_, created_;
  content::WeakDocumentPtr original_document_;
  bool created_attempted_ = false;
};
}  // namespace aux
#endif
#endif
