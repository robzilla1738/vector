// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_AUX_WARM_OWNER_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_AUX_WARM_OWNER_H_
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_SHELL) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <memory>
#include "base/memory/weak_ptr.h"
#include "chrome/browser/ui/aux/native_guest_stage_owner.h"
#include "chrome/browser/ui/aux/native_process_footprint.h"
#include "chrome/browser/ui/aux/native_startup_launch_receipt.h"
#include "content/public/browser/weak_document_ptr.h"
class BrowserWindowInterface;
class WebUIBrowserUI;
namespace views { class Widget; }
namespace aux {
// Native-only continuation of the successful original cold lease. This does
// not create a window, arm input, admit a JSON receipt or imply presentation.
class NativeAuxWarmOwner final {
 public:
  static std::unique_ptr<NativeAuxWarmOwner> RetainOriginal(
      NativeStartupLaunchReceipt receipt, base::WeakPtr<WebUIBrowserUI> ui);
  ~NativeAuxWarmOwner();
  NativeAuxWarmOwner(const NativeAuxWarmOwner&) = delete;
  NativeAuxWarmOwner& operator=(const NativeAuxWarmOwner&) = delete;
  bool BeforeCreation() const;
  bool MatchesOriginalRequest(base::WeakPtr<WebUIBrowserUI> actual) const;
  bool MatchesOriginalDocument(base::WeakPtr<WebUIBrowserUI> actual) const;
  // Exact native creation transaction only; no next-window or title search.
  bool BindCreated(BrowserWindowInterface* actual, views::Widget* actual_widget);
  bool DuringCreation() const;
  bool WithCreated() const;
  bool MatchesChild(base::WeakPtr<WebUIBrowserUI> actual) const;
  base::WeakPtr<BrowserWindowInterface> original_browser() const;
  base::WeakPtr<BrowserWindowInterface> created_browser() const;
  const NativeStartupLaunchReceipt& original_launch() const;
  const NativeProcessFootprint& original_process() const;
  const NativeGuestStageOwnedSnapshot& original_shell() const;
 private:
  NativeAuxWarmOwner(NativeStartupLaunchReceipt receipt,
      base::WeakPtr<WebUIBrowserUI> ui, NativeGuestStageOwnedSnapshot shell,
      NativeProcessFootprint process);
  bool Lifetime() const;
  bool Inventory(bool created) const;
  NativeStartupLaunchReceipt receipt_;
  const NativeGuestStageOwnedSnapshot shell_;
  const NativeProcessFootprint process_;
  base::WeakPtr<WebUIBrowserUI> ui_;
  base::WeakPtr<BrowserWindowInterface> original_, created_;
  base::WeakPtr<views::Widget> created_widget_;
  content::WeakDocumentPtr document_;
  bool creation_attempted_ = false;
};
}  // namespace aux
#endif
#endif
