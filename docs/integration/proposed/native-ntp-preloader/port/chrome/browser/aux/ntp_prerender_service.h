// Copyright 2026 Aux Authors. All rights reserved.
// Ported from the owner-supplied Aside NTP prerender implementation.
#ifndef CHROME_BROWSER_AUX_NTP_PRERENDER_SERVICE_H_
#define CHROME_BROWSER_AUX_NTP_PRERENDER_SERVICE_H_
#include <memory>
class BrowserWindowInterface;
class Profile;
class GURL;
namespace content {
class WebContents;
}
namespace aux {
// Re-resolves the actual enabled Agent manifest override on every call.
bool IsEligibleNtpPrerenderUrl(Profile* profile, const GURL& url);
// Existing authenticated ProfileGate remains the Aux account/Vault boundary.
void SetNtpPrerenderEnabled(Profile* profile, bool enabled);
void ScheduleNtpPrerender(BrowserWindowInterface* browser);
std::unique_ptr<content::WebContents> TakePrerenderedNewTab(
    BrowserWindowInterface* browser,
    const GURL& requested_url);
}  // namespace aux
#endif
