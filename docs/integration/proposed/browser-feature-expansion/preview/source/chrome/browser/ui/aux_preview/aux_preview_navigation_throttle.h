// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_AUX_PREVIEW_AUX_PREVIEW_NAVIGATION_THROTTLE_H_
#define CHROME_BROWSER_UI_AUX_PREVIEW_AUX_PREVIEW_NAVIGATION_THROTTLE_H_
#include "content/public/browser/navigation_throttle.h"
namespace content { class NavigationThrottleRegistry; }
namespace aux::preview {
class NavigationThrottle final : public content::NavigationThrottle {
 public:
  static void MaybeCreateAndAdd(content::NavigationThrottleRegistry&);
  explicit NavigationThrottle(content::NavigationThrottleRegistry&);
  ThrottleCheckResult WillStartRequest() override;
  ThrottleCheckResult WillRedirectRequest() override;
  ThrottleCheckResult WillProcessResponse() override;
  const char* GetNameForLogging() override;
 private:
  ThrottleCheckResult Check();
};
}  // namespace aux::preview
#endif
