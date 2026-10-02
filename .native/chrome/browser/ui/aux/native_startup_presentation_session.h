// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_STARTUP_PRESENTATION_SESSION_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_STARTUP_PRESENTATION_SESSION_H_
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <optional>
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/timer/timer.h"
#include "base/scoped_observation.h"
#include "base/values.h"
#include "chrome/browser/ui/aux/native_startup_admission_waiter.h"
#include "chrome/browser/ui/aux/native_startup_viewport.h"
#include "chrome/browser/ui/aux/native_startup_runtime_hello.h"
#include "content/public/browser/web_contents_observer.h"
#include "content/public/browser/weak_document_ptr.h"
#include "mojo/public/cpp/bindings/remote.h"
#include "services/viz/privileged/mojom/compositing/display_private.mojom.h"
#include "third_party/blink/public/mojom/widget/native_startup_measurement.mojom.h"
#include "ui/compositor/compositor_observer.h"
class WebUIBrowserUI;
class BrowserWindowInterface;
namespace views { class Widget; }
namespace aux {
// One initial process launch, attached before shell renderer startup. This is
// neither a renderer-invoked fixture nor a later-frame performance sampler.
class NativeStartupPresentationSession final : public content::WebContentsObserver, public ui::CompositorObserver {
 public:
  using Reply = base::OnceCallback<void(base::DictValue)>;
  explicit NativeStartupPresentationSession(base::WeakPtr<WebUIBrowserUI> ui);
  ~NativeStartupPresentationSession() override;
  void Start(Reply reply);
  void PrimaryPageChanged(content::Page& page) override;
  void PrimaryMainFrameRenderProcessGone(base::TerminationStatus status) override;
  void WebContentsDestroyed() override;
  void OnCompositingShuttingDown(ui::Compositor* compositor) override;
  void OnCompositorVisibilityChanging(ui::Compositor* compositor, bool visible) override;
 private:
  friend class NativeStartupPresentationSessionLifetimeTest;
  void LeaseDisconnected();
  void TryInitialDocument();
  bool Stable() const;
  bool WithinDeadline() const;
  bool UniqueRegularOwner() const;
  void Admitted(std::optional<NativeStartupLaunchReceipt> receipt);
  void HardwareObservationReady(std::optional<base::TimeTicks> registered);
  void Submitted(blink::mojom::NativeStartupFrameSubmissionPtr actual);
  void Presented(viz::mojom::NativeGuestInclusionResultPtr actual);
  void HelloObserved(std::optional<NativeStartupRuntimeHello> actual);
  void TryComplete();
  void HelloConfirmed(std::optional<base::TimeTicks> confirmed);
  void Refuse(const char* reason);
  void Finish(base::DictValue record);
  base::DictValue Record(const char* status, const char* reason) const;
  base::WeakPtr<WebUIBrowserUI> ui_;
  base::WeakPtr<BrowserWindowInterface> browser_;
  base::WeakPtr<views::Widget> widget_;
  base::ScopedObservation<ui::Compositor, ui::CompositorObserver> compositor_observation_{this};
  uint64_t display_generation_ = 0;
  NativeStartupAdmissionWaiter admission_;
  std::optional<NativeStartupLaunchReceipt> receipt_;
  std::optional<NativeGuestStageOwnedSnapshot> owner_;
  std::optional<NativeStartupViewport> viewport_;
  content::WeakDocumentPtr document_;
  blink::mojom::NativeStartupFrameScopePtr scope_;
  blink::mojom::NativeStartupFrameSubmissionPtr submission_;
  viz::mojom::NativeGuestInclusionScopePtr inclusion_;
  mojo::Remote<blink::mojom::NativeStartupFrameLease> lease_;
  base::ScopedClosureRunner hello_observation_;
  std::optional<NativeStartupRuntimeHello> hello_;
  std::optional<base::DictValue> hardware_record_;
  std::optional<base::TimeTicks> hardware_presented_;
  bool confirmation_pending_ = false;
  Reply reply_;
  bool used_ = false;
  base::TimeTicks started_, deadline_;
  base::OneShotTimer timeout_;
  base::WeakPtrFactory<NativeStartupPresentationSession> weak_factory_{this};
};
}  // namespace aux
#endif
#endif
