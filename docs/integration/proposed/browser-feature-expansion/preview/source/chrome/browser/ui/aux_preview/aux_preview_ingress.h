// Copyright 2026 Aux Authors. BSD-style license: see //LICENSE.
#ifndef CHROME_BROWSER_UI_AUX_PREVIEW_AUX_PREVIEW_INGRESS_H_
#define CHROME_BROWSER_UI_AUX_PREVIEW_AUX_PREVIEW_INGRESS_H_
namespace content { class WebContents; class NavigationHandle; class RenderFrameHost; struct OpenURLParams; }
class GURL;
namespace aux::preview {
inline constexpr int kPeekLinkCommand = 34140;
void AttachIngress(content::WebContents*);
void TrustedMouseDownLink(content::RenderFrameHost*, const GURL&);
// True consumes a genuine native click and schedules its native preview. Caller
// cancels the old navigation; no fallback navigation after a refused preview.
bool MaybePeekNavigation(content::NavigationHandle*);
bool MaybePeekOpenURL(content::WebContents*, const content::OpenURLParams&);
// Shared native restrictions, including non-navigation download paths.
bool MaybePeekDownload(content::WebContents*, const GURL&);
bool AllowDownload(content::WebContents*);
bool AllowExternalProtocol(content::WebContents*);
bool AllowCloseContents(content::WebContents*);
}
#endif
