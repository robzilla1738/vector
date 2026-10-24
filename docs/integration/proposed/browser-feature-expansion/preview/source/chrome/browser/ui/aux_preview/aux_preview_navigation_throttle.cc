// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#include "chrome/browser/ui/aux_preview/aux_preview_navigation_throttle.h"
#include <memory>
#include "chrome/browser/ui/aux_preview/aux_preview_ingress.h"
#include "chrome/browser/ui/aux_preview/aux_preview_controller.h"
#include "content/public/browser/navigation_handle.h"
#include "content/public/browser/navigation_throttle_registry.h"
#include "content/public/browser/web_contents.h"
namespace aux::preview {
void NavigationThrottle::MaybeCreateAndAdd(content::NavigationThrottleRegistry& registry) {
  registry.AddThrottle(std::make_unique<NavigationThrottle>(registry));
}
NavigationThrottle::NavigationThrottle(content::NavigationThrottleRegistry& registry)
    : content::NavigationThrottle(registry) {}
NavigationThrottle::ThrottleCheckResult NavigationThrottle::Check() {
  auto* handle = navigation_handle();
  if (!IsPreviewContents(handle->GetWebContents())) return PROCEED;
  if (!CurrentOwner(handle->GetWebContents())) return CANCEL_AND_IGNORE;
  if (handle->GetURL() == GURL("about:blank") &&
      handle->GetWebContents()->GetLastCommittedURL().is_empty()) return PROCEED;
  // Subresource policies, safe browsing and ordinary permission prompts remain
  // Chromium's. A preview cannot initiate POST/auth or unsupported top-level
  // protocols; promote first. No renderer-declared permission is sufficient.
  if (IsPeekContents(handle->GetWebContents()) && handle->IsInPrimaryMainFrame() &&
      (!handle->GetURL().SchemeIsHTTPOrHTTPS() ||
       handle->GetURL().has_username() || handle->GetURL().has_password() ||
       handle->IsPost())) {
    ReportRestriction(handle->GetWebContents(), "Open this preview as a tab to continue this action.");
    return CANCEL_AND_IGNORE;
  }
  return PROCEED;
}
NavigationThrottle::ThrottleCheckResult NavigationThrottle::WillStartRequest() {
  if (!IsPreviewContents(navigation_handle()->GetWebContents()) &&
      MaybePeekNavigation(navigation_handle())) return CANCEL_AND_IGNORE;
  return Check();
}
NavigationThrottle::ThrottleCheckResult NavigationThrottle::WillRedirectRequest() { return Check(); }
NavigationThrottle::ThrottleCheckResult NavigationThrottle::WillProcessResponse() {
  if (!IsPreviewContents(navigation_handle()->GetWebContents())) return PROCEED;
  if (!CurrentOwner(navigation_handle()->GetWebContents())) return CANCEL_AND_IGNORE;
  if (IsPeekContents(navigation_handle()->GetWebContents()) && navigation_handle()->IsDownload()) {
    ReportRestriction(navigation_handle()->GetWebContents(), "Open this preview as a tab before downloading.");
    return CANCEL_AND_IGNORE;
  }
  return PROCEED;
}
NavigationThrottle::ThrottleCheckResult NavigationThrottle::WillCommitWithoutUrlLoader() { return Check(); }
const char* NavigationThrottle::GetNameForLogging() { return "AuxPeekNavigationThrottle"; }
}  // namespace aux::preview
