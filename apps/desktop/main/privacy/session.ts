import { webContents as electronWebContents } from "electron";
import { cloudPreviewTokens, registry } from "../app/services.js";
import { profileSession } from "../native-views.js";
import { installRequestPolicy } from "../request-policy.js";
import { installSitePermissions, permissionOrigin } from "../site-permissions.js";
import { stateForEntry } from "../windows/registry.js";
import { noteContentResponse } from "../content-capture.js";
import { blockedHostSet, httpsFirst, insecureBypass, noteBlockedRequest, privacy, saveSitePermissions, sitePermissions, trackersAllowed } from "./state.js";

export function configurePagePermissions() {
  const ses = profileSession();
  ses.webRequest.onHeadersReceived((details, callback) => {
    const contents = details.webContents;
    if (details.resourceType === "mainFrame" && contents && registry.byWebContentsId(contents.id))
      noteContentResponse(contents.id, details.url, details.statusCode, details.responseHeaders ?? {});
    callback({});
  });
  // On supported macOS releases Chromium hands modern getDisplayMedia requests to
  // the native source picker. The picker is the consent boundary: Aux never sees
  // or preselects the list of windows/screens, and every request requires a fresh
  // user choice. Older platforms fall through to this handler and fail closed.
  // Legacy chromeMediaSource getUserMedia requests still reach the media handler
  // below with an empty mediaTypes array and remain denied.
  ses.setDisplayMediaRequestHandler((request, callback) => {
    const contents = request.frame ? electronWebContents.fromFrame(request.frame) : undefined;
    const origin = permissionOrigin(request.securityOrigin);
    if (!contents || contents.isDestroyed() || !registry.byWebContentsId(contents.id)
      || !origin || !request.userGesture || !request.videoRequested) {
      callback({});
      return;
    }
    // This callback is only reached when the native picker is unavailable.
    // Never choose or enumerate a source on the site's behalf.
    callback({});
  }, { useSystemPicker: process.platform === "darwin" });
  installSitePermissions(ses, {
    owner: contents => stateForEntry(registry.byWebContentsId(contents.id))?.win,
    read: () => sitePermissions,
    save: saveSitePermissions,
  });
  installRequestPolicy(ses, {
    httpsUpgrade: details => httpsFirst.upgrade(details.url),
    blockingEnabled: () => privacy.trackerBlock,
    blockedHosts: () => blockedHostSet,
    hostAllowed: trackersAllowed,
    onBlocked: noteBlockedRequest,
  });
  // Explicit per-host certificate bypass for "proceed anyway" choices this
  // session only; -3 defers to Chromium's verifier for every other request.
  ses.setCertificateVerifyProc((request, callback) =>
    callback(insecureBypass.has(request.hostname) ? 0 : -3));
}

export function configureCloudPreviewHeaders(){
  // Filtered to preview hosts: every other request skips main-process JS.
  profileSession().webRequest.onBeforeSendHeaders({urls:['https://vercel.run/*','https://*.vercel.run/*']},(details,callback)=>{
    let token:string|undefined;
    try{
      const origin=new URL(details.url).origin;
      // Only the preview's own document gets the token: a navigation to it, or
      // a request from a tab already showing it. A third-party page must not
      // be able to send authenticated subresource requests to the preview.
      let top:string|undefined;try{top=details.webContents?new URL(details.webContents.getURL()).origin:undefined;}catch{/* no document yet */}
      if(details.resourceType==='mainFrame'||top===origin)token=cloudPreviewTokens.get(origin);
    }catch{/* malformed request URL */}
    callback(token?{requestHeaders:{...details.requestHeaders,'X-Aux-Preview-Token':token}}:{requestHeaders:details.requestHeaders});
  });
}
