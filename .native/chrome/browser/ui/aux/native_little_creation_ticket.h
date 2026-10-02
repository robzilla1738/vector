// Copyright 2026 The Aux Authors
#ifndef CHROME_BROWSER_UI_AUX_NATIVE_LITTLE_CREATION_TICKET_H_
#define CHROME_BROWSER_UI_AUX_NATIVE_LITTLE_CREATION_TICKET_H_
#include "build/build_config.h"
#include "chrome/browser/buildflags.h"
#if BUILDFLAG(IS_MAC) && BUILDFLAG(AUX_ALLOW_REMOTE_DEBUGGING_FOR_TESTS)
#include <optional>
#include <utility>
#include "base/memory/weak_ptr.h"
#include "base/functional/callback.h"
#include "base/time/time.h"
#include "base/unguessable_token.h"
#include "chrome/browser/ui/aux/native_guest_stage_owner.h"
#include "services/viz/privileged/mojom/compositing/display_private.mojom.h"
#include "content/public/browser/weak_document_ptr.h"
#include "content/public/browser/web_contents_observer.h"
class BrowserWindowInterface;
class Profile;
class WebUIBrowserUI;
namespace content { class WebContents; class NavigationHandle; }
namespace aux {
// Pure fixed-clock/SurfaceId pairing only. It grants no authority; native caller
// must still revalidate creation ticket, current documents and activated guest
// frame metadata lease. A matching later HW frame is an upperbound on first
// content, never a claim that this was the earliest frame.
std::optional<base::TimeDelta> ValidateLittleHardwareUpperBound(
    base::TimeTicks armed, base::TimeTicks committed,
    const NativeGuestPresentationOwner& owner,
    const viz::mojom::NativeGuestInclusionResult& actual, base::TimeTicks observed);

// Internal instrumentation ticket. It observes an existing policy-approved
// route; it never creates/authorizes a window, selects a URL, or grants access.
// Arm precedes the external OS trigger. Its clock is a conservative upperbound
// start, not an invented NSEvent timestamp.
class NativeLittleCreationTicket final : public content::WebContentsObserver {
 public:
  explicit NativeLittleCreationTicket(base::WeakPtr<WebUIBrowserUI> source);
  ~NativeLittleCreationTicket() override;
  base::WeakPtr<NativeLittleCreationTicket> GetWeakPtr() { return weak_factory_.GetWeakPtr(); }
  void SetCommittedCallback(base::RepeatingClosure callback) { on_committed_ = std::move(callback); }
  base::WeakPtr<BrowserWindowInterface> CreatedBrowserForOwner() const;
  std::optional<base::UnguessableToken> Arm();
  // Actual native external routing entry only. The returned nonce must travel
  // through that exact async route's callbacks, not be looked up at creation.
  std::optional<base::UnguessableToken> BeginExternalRoute(Profile* source);
  bool Created(const base::UnguessableToken& route, BrowserWindowInterface* created);
  bool Delivered(const base::UnguessableToken& route, content::WebContents* actual_guest,
      base::WeakPtr<content::NavigationHandle> actual_navigation);
  void DidFinishNavigation(content::NavigationHandle* actual_navigation) override;
  void WebContentsDestroyed() override;
  std::optional<NativeGuestPresentationOwner> ReadTarget(base::WeakPtr<WebUIBrowserUI> target);
  base::TimeTicks armed_at() const { return armed_at_; }
  base::TimeTicks committed_at() const { return committed_at_; }
  void Cancel();
 private:
  bool StableSource() const;
  bool StableOwner() const;
  base::WeakPtr<WebUIBrowserUI> source_;
  base::WeakPtr<Profile> profile_;
  content::WeakDocumentPtr source_document_;
  std::optional<NativeGuestStageOwnedSnapshot> source_owner_;
  base::WeakPtr<BrowserWindowInterface> target_browser_;
  base::WeakPtr<content::WebContents> target_guest_;
  content::WeakDocumentPtr target_document_;
  base::UnguessableToken nonce_;
  base::TimeTicks armed_at_;
  base::TimeTicks committed_at_;
  bool route_claimed_ = false;
  bool delivered_ = false;
  int64_t navigation_id_ = 0;
  base::RepeatingClosure on_committed_;
  base::WeakPtrFactory<NativeLittleCreationTicket> weak_factory_{this};
};
}  // namespace aux
#endif
#endif
