// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_STOCK_MEASUREMENT_NATIVE_STOCK_WARM_SESSION_H_
#define CHROME_BROWSER_UI_STOCK_MEASUREMENT_NATIVE_STOCK_WARM_SESSION_H_
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS) && !BUILDFLAG(ENABLE_AUX_SHELL)
#include <optional>
#include "base/functional/callback.h"
#include "base/memory/weak_ptr.h"
#include "base/scoped_observation.h"
#include "base/timer/timer.h"
#include "base/values.h"
#include "chrome/browser/ui/stock_measurement/native_stock_warm_creation_ticket.h"
#include "components/viz/common/quads/native_stock_ready_frame.h"
#include "components/viz/common/surfaces/surface_id.h"
#include "content/public/browser/web_contents_observer.h"
#include "content/public/browser/weak_document_ptr.h"
#include "services/viz/privileged/mojom/compositing/display_private.mojom.h"
#include "ui/compositor/compositor_observer.h"
class BrowserView;
class BrowserWindowInterface;
namespace views { class Widget; }
namespace aux {
// Native private warm fixture: actual original key event plus exact created
// Views owner within the retained original browser process generation. No method or selector is advertised to WebUI, CDP, or runtime callers.
class NativeStockWarmSession final : public content::WebContentsObserver,
                                        public ui::CompositorObserver {
 public:
  using Reply = base::OnceCallback<void(base::DictValue)>;
  explicit NativeStockWarmSession(BrowserView* actual);
  ~NativeStockWarmSession() override;
  void Start(base::WeakPtr<NativeStockWarmCreationTicket> ticket, Reply reply);
  // Called after actual BrowserView::ClientView::PaintChildren on that owner.
  // The first eligible paint before registration ACK terminates the sample.
  void Painted();
  static void ActualPainted(BrowserView* actual);
  static void ActualRemoved(BrowserView* actual);
  void Cancel(const char* reason = "warm_scope_cancelled");
  void PrimaryPageChanged(content::Page& page) override;
  void PrimaryMainFrameRenderProcessGone(base::TerminationStatus status) override;
  void WebContentsDestroyed() override;
  void OnCompositingShuttingDown(ui::Compositor* compositor) override;
  void OnCompositorVisibilityChanging(ui::Compositor* compositor, bool visible) override;
 private:
  friend class NativeStockWarmSessionLifetimeTest;
  bool Stable() const;
  std::optional<gfx::Rect> ReadReadyGeometry();
  void Registered(std::optional<base::TimeTicks> actual);
  void Submitted(std::optional<viz::NativeStockReadyFrame> actual);
  void Presented(viz::mojom::NativeStockRootPresentationPtr actual);
  void Refuse(const char* reason);
  void Finish(base::DictValue record);
  base::DictValue Record(const char* status, const char* reason) const;
  base::WeakPtr<BrowserView> view_;
  base::WeakPtr<BrowserWindowInterface> browser_;
  base::WeakPtr<views::Widget> widget_;
  base::ScopedObservation<ui::Compositor, ui::CompositorObserver> compositor_{this};
  base::WeakPtr<NativeStockWarmCreationTicket> ticket_;
  content::WeakDocumentPtr document_;
  base::UnguessableToken nonce_, document_receipt_;
  viz::SurfaceId root_;
  std::optional<gfx::Rect> bounds_;
  std::optional<viz::NativeStockReadyFrame> submission_;
  base::TimeTicks deadline_, registered_, ready_;
  uint64_t display_generation_ = 0;
  bool used_ = false, admitted_ = false, first_ready_paint_ = false;
  Reply reply_;
  base::OneShotTimer timeout_;
  base::WeakPtrFactory<NativeStockWarmSession> weak_factory_{this};
};
}  // namespace aux
#endif
#endif
