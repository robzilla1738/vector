// Copyright 2026 The Aux Authors
#include "chrome/browser/ui/aux/native_little_creation_ticket.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <algorithm>
#include <cmath>
#include "ui/gfx/geometry/point_conversions.h"
#include "ui/gfx/geometry/size_conversions.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/aux/little_window_controller.h"
#include "chrome/browser/ui/aux/quick_ask_controller.h"
#include "chrome/browser/ui/browser_window/public/browser_window_interface.h"
#include "chrome/browser/ui/tabs/tab_strip_model.h"
#include "chrome/browser/ui/webui_browser/webui_browser_ui.h"
#include "content/public/browser/browser_thread.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/navigation_handle.h"
#include "content/public/browser/web_contents.h"
#include "content/public/browser/web_ui.h"
namespace aux {
std::optional<base::TimeDelta> ValidateLittleHardwareUpperBound(
    base::TimeTicks armed, base::TimeTicks committed,
    const NativeGuestPresentationOwner& owner,
    const viz::mojom::NativeGuestInclusionResult& actual, base::TimeTicks observed) {
  if (!actual.scope) return std::nullopt;
  const auto& scope = *actual.scope;
  const auto guest = std::ranges::find_if(actual.drawn, [&](const auto& item) {
    return item && item->surface == owner.guest_surface;
  });
  const auto shell = std::ranges::find_if(actual.drawn, [&](const auto& item) {
    return item && item->surface.frame_sink_id() == owner.shell_sink &&
        item->token == scope.mutation_shell_token;
  });
  if (armed.is_null() || committed.is_null() || committed < armed ||
      !actual.measured || !actual.elapsed || scope.input != armed ||
      scope.mutation < committed || scope.shell_submission < scope.mutation ||
      actual.draw < scope.shell_submission || actual.swap.is_null() ||
      actual.swap.swap_start < actual.draw || actual.swap.swap_end < actual.swap.swap_start ||
      actual.feedback.timestamp < actual.swap.swap_end ||
      observed < actual.feedback.timestamp || observed - armed > base::Seconds(5) ||
      !(actual.feedback.flags & gfx::PresentationFeedback::kHWCompletion) ||
      (actual.feedback.flags & gfx::PresentationFeedback::kFailure) ||
      !scope.mutation_shell_token || scope.shell_sink != owner.shell_sink ||
      scope.display_sink != owner.display_sink || !owner.guest_surface.is_valid() ||
      !actual.display_surface.is_valid() ||
      actual.display_surface.frame_sink_id() != owner.display_sink ||
      scope.guests.size() != 1 || scope.guests.front() != owner.guest_surface ||
      actual.drawn.size() != 2 || guest == actual.drawn.end() || shell == actual.drawn.end() ||
      !(*guest)->token || (*guest)->visible_bounds.IsEmpty() || (*shell)->visible_bounds.IsEmpty() ||
      (*shell)->surface_size.IsEmpty() || owner.native_frame_size_in_pixels.IsEmpty() ||
      (*guest)->surface_size != owner.native_frame_size_in_pixels ||
      scope.shapes.size() != 1 || !scope.shapes.front() ||
      scope.shapes.front()->surface != owner.guest_surface ||
      scope.shapes.front()->radius != 0 ||
      scope.shapes.front()->pane_in_shell_pixels != gfx::RectF(scope.shapes.front()->inner_in_shell_pixels) ||
      !std::isfinite(owner.device_scale_factor) || owner.device_scale_factor <= 0 ||
      scope.shapes.front()->inner_in_shell_pixels.size() != owner.native_frame_size_in_pixels ||
      actual.elapsed != actual.feedback.timestamp - armed) return std::nullopt;
  const auto& pixels = scope.shapes.front()->inner_in_shell_pixels;
  const float inverse = 1 / owner.device_scale_factor;
  if (gfx::Rect(gfx::ScaleToFlooredPoint(pixels.origin(), inverse),
          gfx::ScaleToCeiledSize(pixels.size(), inverse)) != owner.native_bounds_in_parent_dip)
    return std::nullopt;
  // NativeGuestInclusionReceipt measured only with authenticated complete shape
  // coverage in this exact aggregation/group. No AX endpoint or next-frame guess.
  return actual.feedback.timestamp - armed;
}

NativeLittleCreationTicket::NativeLittleCreationTicket(base::WeakPtr<WebUIBrowserUI> source)
    : source_(source) {}
NativeLittleCreationTicket::~NativeLittleCreationTicket() {
  weak_factory_.InvalidateWeakPtrs(); Cancel();
}
std::optional<base::UnguessableToken> NativeLittleCreationTicket::Arm() {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!nonce_.is_empty()) { Cancel(); return std::nullopt; }
  const auto owner = ReadNativeGuestStageShellOwner(source_);
  auto* web_ui = source_ ? source_->web_ui() : nullptr;
  auto* frame = web_ui ? web_ui->GetRenderFrameHost() : nullptr;
  auto* profile = web_ui ? Profile::FromWebUI(web_ui) : nullptr;
  auto* browser = source_ ? source_->browser() : nullptr;
  if (!owner || !frame || !profile || profile->IsOffTheRecord() || !browser ||
      browser->GetProfile() != profile || browser->GetType() != BrowserWindowInterface::TYPE_NORMAL ||
      IsLittleWindow(browser) || IsQuickAskWindow(browser)) return std::nullopt;
  source_owner_ = owner;
  profile_ = profile->GetWeakPtr();
  source_document_ = frame->GetWeakDocumentPtr();
  nonce_ = base::UnguessableToken::Create();
  armed_at_ = base::TimeTicks::Now();
  if (!StableSource()) { Cancel(); return std::nullopt; }
  return nonce_;
}
bool NativeLittleCreationTicket::StableSource() const {
  return StableOwner() && base::TimeTicks::Now() - armed_at_ <= base::Seconds(5);
}
bool NativeLittleCreationTicket::StableOwner() const {
  if (nonce_.is_empty() || !profile_ || profile_->IsOffTheRecord() ||
      !source_document_.AsRenderFrameHostIfValid() || armed_at_.is_null()) return false;
  const auto current = ReadNativeGuestStageShellOwner(source_);
  return current && source_owner_ && *current == *source_owner_ && source_ &&
      source_->browser() && source_->browser()->GetProfile() == profile_.get();
}
std::optional<base::UnguessableToken> NativeLittleCreationTicket::BeginExternalRoute(Profile* source) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!StableSource() || source != profile_.get() || route_claimed_) {
    Cancel(); return std::nullopt;
  }
  route_claimed_ = true;
  return nonce_;
}
bool NativeLittleCreationTicket::Created(const base::UnguessableToken& route,
    BrowserWindowInterface* created) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!StableSource() || !route_claimed_ || route != nonce_ || target_browser_ ||
      !created || created->GetProfile() != profile_.get() || !IsLittleWindow(created) ||
      created == source_->browser()) { Cancel(); return false; }
  target_browser_ = created->GetWeakPtr();
  return true;
}
bool NativeLittleCreationTicket::Delivered(const base::UnguessableToken& route,
    content::WebContents* actual_guest,
    base::WeakPtr<content::NavigationHandle> actual_navigation) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!StableSource() || route != nonce_ || !target_browser_ || navigation_id_ != 0 || delivered_ ||
      !actual_guest || actual_guest->IsBeingDestroyed() || !actual_navigation ||
      actual_navigation->GetWebContents() != actual_guest ||
      !actual_navigation->IsInPrimaryMainFrame() || actual_navigation->IsSameDocument() ||
      actual_navigation->GetNavigationId() <= 0 ||
      actual_guest->GetBrowserContext() != profile_.get() ||
      !target_browser_->GetTabStripModel() ||
      target_browser_->GetTabStripModel()->GetActiveWebContents() != actual_guest) {
    Cancel(); return false;
  }
  target_guest_ = actual_guest->GetWeakPtr();
  navigation_id_ = actual_navigation->GetNavigationId();
  Observe(actual_guest);
  return true;
}
void NativeLittleCreationTicket::DidFinishNavigation(content::NavigationHandle* navigation) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!navigation || !navigation->IsInPrimaryMainFrame()) return;
  if (!StableSource() || !target_guest_ || navigation->GetWebContents() != target_guest_.get() ||
      navigation->GetNavigationId() != navigation_id_ || delivered_ ||
      !navigation->HasCommitted() || navigation->IsErrorPage() || navigation->IsSameDocument()) {
    Cancel(); return;
  }
  auto* frame = navigation->GetRenderFrameHost();
  if (!frame || frame != target_guest_->GetPrimaryMainFrame() || !frame->IsRenderFrameLive() ||
      frame->IsErrorDocument() ||
      !frame->IsInLifecycleState(content::RenderFrameHost::LifecycleState::kActive)) {
    Cancel(); return;
  }
  target_document_ = frame->GetWeakDocumentPtr();
  committed_at_ = base::TimeTicks::Now();
  delivered_ = true;
  if (on_committed_) on_committed_.Run();
}
void NativeLittleCreationTicket::WebContentsDestroyed() { Cancel(); }
std::optional<NativeGuestPresentationOwner> NativeLittleCreationTicket::ReadTarget(
    base::WeakPtr<WebUIBrowserUI> target) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::UI);
  if (!StableSource() || !delivered_ || !target_browser_ || !target_guest_ || !target ||
      target->browser() != target_browser_.get() ||
      target_browser_->GetProfile() != profile_.get() || !IsLittleWindow(target_browser_.get()) ||
      !target_document_.AsRenderFrameHostIfValid() ||
      target_document_.AsRenderFrameHostIfValid() != target_guest_->GetPrimaryMainFrame() ||
      !target_browser_->GetTabStripModel() ||
      target_browser_->GetTabStripModel()->GetActiveWebContents() != target_guest_.get()) {
    Cancel(); return std::nullopt;
  }
  const auto actual = ReadNativeGuestPresentationOwner(target, target_guest_);
  if (!StableSource() || !target_browser_ || !target_guest_ ||
      !target_document_.AsRenderFrameHostIfValid() ||
      target_document_.AsRenderFrameHostIfValid() != target_guest_->GetPrimaryMainFrame() ||
      target_browser_->GetProfile() != profile_.get() || !target ||
      target->browser() != target_browser_.get()) { Cancel(); return std::nullopt; }
  return actual;
}
base::WeakPtr<BrowserWindowInterface> NativeLittleCreationTicket::CreatedBrowserForOwner() const {
  return StableOwner() && target_browser_ && IsLittleWindow(target_browser_.get()) &&
      target_browser_->GetProfile() == profile_.get() ? target_browser_ : base::WeakPtr<BrowserWindowInterface>();
}
void NativeLittleCreationTicket::Cancel() {
  Observe(nullptr); navigation_id_ = 0;
  nonce_ = {}; armed_at_ = {}; committed_at_ = {}; profile_.reset(); source_owner_.reset();
  source_document_ = {}; target_browser_.reset(); target_guest_.reset();
  target_document_ = {}; route_claimed_ = false; delivered_ = false;
}
}  // namespace aux
#endif
