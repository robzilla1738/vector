// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_AUX_WARM_FIXTURE_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_AUX_WARM_FIXTURE_H_
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(ENABLE_AUX_SHELL) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <memory>
#include <optional>
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/timer/timer.h"
#include "base/values.h"
class WebUIBrowserUI;
class BrowserWindowInterface;
namespace aux {
class NativeAuxWarmOwner;
class NativeAuxWarmCreationTicket;
// Native-owned, one additional window in the original admitted process.
// Fixed zero-arg preparation/completion observe but never perform an effect.
class NativeAuxWarmFixture final {
 public:
  using Reply = base::OnceCallback<void(base::DictValue)>;
  explicit NativeAuxWarmFixture(std::unique_ptr<NativeAuxWarmOwner> original);
  ~NativeAuxWarmFixture();
  NativeAuxWarmFixture(const NativeAuxWarmFixture&) = delete;
  NativeAuxWarmFixture& operator=(const NativeAuxWarmFixture&) = delete;
  void Prepare(base::WeakPtr<WebUIBrowserUI> original, Reply reply);
  void Complete(base::WeakPtr<WebUIBrowserUI> original, Reply reply);
  bool MatchesOriginal(base::WeakPtr<WebUIBrowserUI> original) const;
  // Exact bound native child for transport cleanup/inventory only. This is
  // neither a new-window selector nor a timing/presentation admission.
  base::WeakPtr<BrowserWindowInterface> CleanupWindow(base::WeakPtr<WebUIBrowserUI> original) const;
 private:
  friend class NativeAuxWarmFixtureLifetimeTest;
  void Created();
  void Observed(base::DictValue record);
  void Refused(const char* reason);
  void Deliver();
  base::DictValue Refusal(const char* reason) const;
  std::unique_ptr<NativeAuxWarmOwner> original_;
  std::unique_ptr<NativeAuxWarmCreationTicket> ticket_;
  base::WeakPtr<WebUIBrowserUI> original_ui_;
  std::optional<base::DictValue> result_;
  Reply complete_;
  base::TimeTicks deadline_;
  bool used_ = false, completed_ = false, child_bound_ = false;
  base::OneShotTimer timeout_;
  base::WeakPtrFactory<NativeAuxWarmFixture> weak_factory_{this};
};
}  // namespace aux
#endif
#endif
