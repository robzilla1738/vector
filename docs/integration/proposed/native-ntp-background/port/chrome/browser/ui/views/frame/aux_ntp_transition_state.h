// Copyright 2026 Aux Authors. All rights reserved.
// Supplied ContentsWebView transition/probe adapted to Chromium155.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_NTP_TRANSITION_STATE_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_NTP_TRANSITION_STATE_H_

#include <memory>
#include <set>

#include "base/functional/callback.h"
#include "base/memory/raw_ptr.h"
#include "base/memory/weak_ptr.h"
#include "base/timer/timer.h"
#include "content/public/browser/global_routing_id.h"
#include "content/public/browser/weak_document_ptr.h"
#include "content/public/browser/web_contents_observer.h"

namespace base {
class Value;
}
namespace content {
class WebContents;
class NavigationHandle;
}  // namespace content
namespace ui {
class LayerTreeOwner;
}
namespace views {
class View;
class NativeViewHost;
}  // namespace views

// Only the actual enabled Agent newtab override is in this adaptation's scope.
// Ordinary contents and other extension/dialog surfaces retain existing
// behavior.
class AuxNtpTransitionState final : public content::WebContentsObserver {
 public:
  AuxNtpTransitionState(views::View* owner,
                        views::NativeViewHost* holder,
                        base::RepeatingClosure update_background);
  ~AuxNtpTransitionState() override;
  void Prepare(content::WebContents* replacement);
  void Adopt(content::WebContents* contents);
  // Called during the owning ContentsWebView's ordinary background update.
  bool UpdateAndShouldUseTransparentBackground();

 private:
  bool IsTarget(content::WebContents* contents) const;
  bool IsCurrent(content::WeakDocumentPtr document) const;
  bool IsReady() const;
  void ScheduleProbe();
  void ProbeResult(content::WeakDocumentPtr document, base::Value result);
  void VisualResult(content::WeakDocumentPtr document, bool success);
  void Retry(content::WeakDocumentPtr document);
  void MarkReady(content::WeakDocumentPtr document);
  void ClearTransition();
  void TransitionExpired();
  void RestoreOpacity();
  void RefreshBackground();
  void DOMContentLoaded(content::RenderFrameHost* frame) override;
  void RenderFrameHostChanged(content::RenderFrameHost*,
                              content::RenderFrameHost*) override;
  void RenderFrameDeleted(content::RenderFrameHost* frame) override;
  void DidFinishNavigation(content::NavigationHandle* navigation) override;
  void WebContentsDestroyed() override;

  raw_ptr<views::View> owner_;
  raw_ptr<views::NativeViewHost> holder_;
  base::RepeatingClosure update_background_;
  std::unique_ptr<ui::LayerTreeOwner> transition_;
  base::WeakPtr<content::WebContents> transition_target_;
  base::WeakPtr<content::WebContents> page_background_target_;
  std::set<content::GlobalRenderFrameHostId> ready_;
  std::set<content::GlobalRenderFrameHostId> pending_;
  base::OneShotTimer transition_timeout_;
  bool opacity_hidden_ = false;
  float saved_opacity_ = 1.0f;
  base::WeakPtrFactory<AuxNtpTransitionState> weak_{this};
};
#endif
