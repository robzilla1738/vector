// Copyright 2026 Aux Authors. All rights reserved.
// Original045cc578/6690,045cd440,045ce128/9f8 and030ae900.
#include "chrome/browser/ui/views/frame/aux_ntp_transition_state.h"

#include <optional>
#include <utility>

#include "base/functional/bind.h"
#include "base/task/single_thread_task_runner.h"
#include "base/time/time.h"
#include "base/values.h"
#include "chrome/browser/aux/ntp_prerender_service.h"
#include "chrome/common/chrome_isolated_world_ids.h"
#include "components/viz/common/surfaces/surface_id.h"
#include "content/public/browser/navigation_handle.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/render_widget_host_view.h"
#include "content/public/browser/web_contents.h"
#include "third_party/skia/include/core/SkColor.h"
#include "ui/compositor/layer.h"
#include "ui/compositor/layer_surface.h"
#include "ui/compositor/layer_tree_owner.h"
#include "ui/gfx/geometry/point_conversions.h"
#include "ui/views/controls/native/native_view_host.h"
#include "ui/views/view.h"

namespace {
// Copied unchanged from original UTF16 constant0xd6e4064. Browser-owned world4
// corresponds to155 ISOLATED_WORLD_ID_CHROME_INTERNAL, never a renderer hook.
constexpr char16_t kBodyBackgroundProbe[] =
    uR"AUXPROBE(

(() => {
  const body = document.body;
  if (!body) {
    return false;
  }
  const color = getComputedStyle(body).backgroundColor;
  if (typeof color !== 'string' || color.trim().length === 0) {
    return false;
  }

  const normalized = color.trim().toLowerCase();
  if (normalized === 'transparent' || normalized === 'rgba(0, 0, 0, 0)') {
    return false;
  }

  const parseAlpha = (value) => {
    if (!value) {
      return 1;
    }
    const trimmed = value.trim();
    const parsed = Number.parseFloat(trimmed);
    if (!Number.isFinite(parsed)) {
      return 1;
    }
    return trimmed.endsWith('%') ? parsed / 100 : parsed;
  };
  const rgbaMatch =
      normalized.match(/^rgba\([^,]+,[^,]+,[^,]+,\s*([^)]+)\)$/);
  const slashAlphaMatch =
      normalized.match(/^(?:rgb|rgba|color)\([^/]+\/\s*([^)]+)\)$/);
  const alpha = parseAlpha(
      (rgbaMatch && rgbaMatch[1]) ||
      (slashAlphaMatch && slashAlphaMatch[1]));
  return alpha >= 0.5;
})()
)AUXPROBE";

std::unique_ptr<ui::Layer> CloneWithSurface(ui::Layer* source,
                                            bool& has_surface) {
  if (!source)
    return nullptr;
  auto clone = source->Clone();
  if (auto* surface = source->AsSurface()) {
    const auto* primary = surface->GetSurfaceId();
    const auto* fallback = surface->GetOldestAcceptableFallback();
    has_surface |=
        (primary && primary->is_valid()) || (fallback && fallback->is_valid());
  }
  for (ui::Layer* child : source->children()) {
    auto child_clone = CloneWithSurface(child, has_surface);
    if (child_clone)
      clone->Add(child_clone.release());
  }
  return clone;
}
}  // namespace

AuxNtpTransitionState::AuxNtpTransitionState(
    views::View* owner,
    views::NativeViewHost* holder,
    base::RepeatingClosure update_background)
    : owner_(owner),
      holder_(holder),
      update_background_(std::move(update_background)) {}
AuxNtpTransitionState::~AuxNtpTransitionState() {
  RestoreOpacity();
}

bool AuxNtpTransitionState::IsTarget(content::WebContents* contents) const {
  return aux::IsNtpPrerenderContents(contents);
}

void AuxNtpTransitionState::Prepare(content::WebContents* replacement) {
  if (!web_contents() || !replacement || replacement == web_contents() ||
      replacement->GetBrowserContext() != web_contents()->GetBrowserContext() ||
      !IsTarget(web_contents()) || !IsTarget(replacement) ||
      !owner_->GetWidget() || !owner_->layer() || !holder_->layer()) {
    ClearTransition();
    return;
  }
  if (transition_ && transition_target_.get() == web_contents()) {
    transition_target_ = replacement->GetWeakPtr();
    return;
  }
  ClearTransition();
  auto* old_view = web_contents()->GetRenderWidgetHostView();
  if (!old_view || !old_view->IsSurfaceAvailableForCopy())
    return;
  bool has_surface = false;
  auto root = CloneWithSurface(holder_->layer(), has_surface);
  if (!root || !has_surface)
    return;
  gfx::PointF origin;
  ui::Layer::ConvertPointToLayer(holder_->layer(), owner_->layer(), true,
                                 &origin);
  root->SetBounds(
      gfx::Rect(gfx::ToFlooredPoint(origin), root->bounds().size()));
  if (!root->AsSolidColor())
    root->SetFillsBoundsOpaquely(true);
  root->SetOpacity(1.0f);
  root->SetName("AuxNtpTransition");
  transition_ = std::make_unique<ui::LayerTreeOwner>(std::move(root));
  owner_->layer()->Add(transition_->root());
  transition_target_ = replacement->GetWeakPtr();
  // Original PrepareAsideNtpTransition uses literal2000000us.
  transition_timeout_.Start(
      FROM_HERE, base::Seconds(2),
      base::BindOnce(&AuxNtpTransitionState::TransitionExpired,
                     weak_.GetWeakPtr()));
}

void AuxNtpTransitionState::Adopt(content::WebContents* contents) {
  if (contents != web_contents()) {
    ready_.clear();
    page_background_target_.reset();
  }
  weak_.InvalidateWeakPtrs();
  pending_.clear();
  RestoreOpacity();
  Observe(contents);
  if (transition_ && transition_target_.get() != contents)
    ClearTransition();
  // Rebind a held-layer timer after invalidating callbacks from the old
  // document.
  if (transition_) {
    const auto remaining =
        transition_timeout_.desired_run_time() - base::TimeTicks::Now();
    transition_timeout_.Start(
        FROM_HERE, remaining.is_negative() ? base::TimeDelta() : remaining,
        base::BindOnce(&AuxNtpTransitionState::TransitionExpired,
                       weak_.GetWeakPtr()));
  }
  ScheduleProbe();
}

bool AuxNtpTransitionState::IsCurrent(content::WeakDocumentPtr document) const {
  auto* frame = document.AsRenderFrameHostIfValid();
  return frame && web_contents() && IsTarget(web_contents()) &&
         content::WebContents::FromRenderFrameHost(frame) == web_contents() &&
         web_contents()->GetPrimaryMainFrame() == frame;
}
bool AuxNtpTransitionState::IsReady() const {
  if (!web_contents() || !IsTarget(web_contents()))
    return false;
  auto* frame = web_contents()->GetPrimaryMainFrame();
  return frame && ((!transition_ &&
                    aux::IsNtpPrerenderBackgroundReady(web_contents())) ||
                   ready_.contains(frame->GetGlobalId()));
}

bool AuxNtpTransitionState::UpdateAndShouldUseTransparentBackground() {
  if (!IsTarget(web_contents())) {
    if (web_contents() && page_background_target_.get() == web_contents()) {
      web_contents()->SetPageBaseBackgroundColor(std::nullopt);
      page_background_target_.reset();
    }
    ClearTransition();
    RestoreOpacity();
    return false;
  }
  // Original030aec10..5c sets optional transparent base color for the target,
  // leaving ordinary pages' default unset. This is distinct from the matte.
  web_contents()->SetPageBaseBackgroundColor(SK_ColorTRANSPARENT);
  page_background_target_ = web_contents()->GetWeakPtr();
  const bool ready = IsReady();
  if (transition_ && ready)
    ClearTransition();
  const bool hide = transition_ || !ready;
  if (auto* layer = holder_->layer()) {
    if (hide && !opacity_hidden_) {
      saved_opacity_ = layer->opacity();
      opacity_hidden_ = true;
    }
    if (opacity_hidden_)
      layer->SetOpacity(hide ? 0.0f : saved_opacity_);
    if (!hide)
      opacity_hidden_ = false;
  }
  ScheduleProbe();
  return ready && !transition_;
}

void AuxNtpTransitionState::ScheduleProbe() {
  if (!web_contents() || !IsTarget(web_contents()) || IsReady())
    return;
  auto* frame = web_contents()->GetPrimaryMainFrame();
  if (!frame || !frame->IsRenderFrameLive() || !frame->IsDOMContentLoaded() ||
      !frame->IsInLifecycleState(
          content::RenderFrameHost::LifecycleState::kActive) ||
      !pending_.insert(frame->GetGlobalId()).second)
    return;
  frame->ExecuteJavaScriptInIsolatedWorld(
      kBodyBackgroundProbe,
      base::BindOnce(&AuxNtpTransitionState::ProbeResult, weak_.GetWeakPtr(),
                     frame->GetWeakDocumentPtr()),
      ISOLATED_WORLD_ID_CHROME_INTERNAL);
}
void AuxNtpTransitionState::ProbeResult(content::WeakDocumentPtr document,
                                        base::Value result) {
  if (!IsCurrent(document))
    return;
  auto* frame = document.AsRenderFrameHostIfValid();
  pending_.erase(frame->GetGlobalId());
  if (!result.is_bool() || !result.GetBool()) {
    Retry(document);
    return;
  }
  if (!transition_) {
    MarkReady(document);
    return;
  }
  pending_.insert(frame->GetGlobalId());
  frame->InsertVisualStateCallback(base::BindOnce(
      &AuxNtpTransitionState::VisualResult, weak_.GetWeakPtr(), document));
}
void AuxNtpTransitionState::VisualResult(content::WeakDocumentPtr document,
                                         bool success) {
  if (!IsCurrent(document))
    return;
  pending_.erase(document.AsRenderFrameHostIfValid()->GetGlobalId());
  if (success)
    MarkReady(document);
  else
    Retry(document);
}
void AuxNtpTransitionState::Retry(content::WeakDocumentPtr document) {
  if (!IsCurrent(document))
    return;
  const auto id = document.AsRenderFrameHostIfValid()->GetGlobalId();
  if (!pending_.insert(id).second)
    return;
  base::SingleThreadTaskRunner::GetCurrentDefault()->PostDelayedTask(
      FROM_HERE,
      base::BindOnce(
          [](base::WeakPtr<AuxNtpTransitionState> state,
             content::WeakDocumentPtr document,
             content::GlobalRenderFrameHostId id) {
            if (!state || !state->IsCurrent(document))
              return;
            if (state->pending_.erase(id))
              state->ScheduleProbe();
          },
          weak_.GetWeakPtr(), document, id),
      base::Milliseconds(50));
}
void AuxNtpTransitionState::MarkReady(content::WeakDocumentPtr document) {
  if (!IsCurrent(document))
    return;
  ready_.insert(document.AsRenderFrameHostIfValid()->GetGlobalId());
  ClearTransition();
  RefreshBackground();
}
void AuxNtpTransitionState::ClearTransition() {
  transition_timeout_.Stop();
  transition_.reset();
  transition_target_.reset();
}
void AuxNtpTransitionState::TransitionExpired() {
  ClearTransition();
  RefreshBackground();
}
void AuxNtpTransitionState::RefreshBackground() {
  // Original045cd1dc/3b8 guards GetWidget before UpdateBackgroundColor.
  if (owner_->GetWidget())
    update_background_.Run();
}
void AuxNtpTransitionState::RestoreOpacity() {
  if (opacity_hidden_ && holder_->layer())
    holder_->layer()->SetOpacity(saved_opacity_);
  opacity_hidden_ = false;
}
void AuxNtpTransitionState::DOMContentLoaded(content::RenderFrameHost*) {
  ScheduleProbe();
}
void AuxNtpTransitionState::RenderFrameHostChanged(content::RenderFrameHost*,
                                                   content::RenderFrameHost*) {
  RefreshBackground();
}
void AuxNtpTransitionState::RenderFrameDeleted(
    content::RenderFrameHost* frame) {
  ready_.erase(frame->GetGlobalId());
  pending_.erase(frame->GetGlobalId());
}
void AuxNtpTransitionState::DidFinishNavigation(
    content::NavigationHandle* navigation) {
  if (navigation->HasCommitted() && navigation->IsInPrimaryMainFrame() &&
      !navigation->IsSameDocument()) {
    ready_.erase(navigation->GetRenderFrameHost()->GetGlobalId());
    pending_.clear();
    RefreshBackground();
  }
}
void AuxNtpTransitionState::WebContentsDestroyed() {
  weak_.InvalidateWeakPtrs();
  pending_.clear();
  ClearTransition();
  RestoreOpacity();
  Observe(nullptr);
}
