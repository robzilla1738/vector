# Recovered content exception and155 port

This subordinate recovery stages a real10-file content/browser-client patch, not an applied or compiled change. It reads only the supplied pinned arm64 image and current frozen nativev24 (the10 affected files are unchanged by parentv25 preference proposal). `content-recovery-manifest.json` records exact baselines, proposed outputs, count-checked edit anchors and patch hash; a fresh temporary replay of all10 outputs passes. Shared/native/root source, builds, applications, profiles, preferences, Keychain, grants and endpoints were not touched.

## Actual original contract

The earlier question about a broad extension-scheme exemption is resolved: **the original exception is the exact current eligible Agent newtab URL for the actual browser context**. It is not all extension pages, all Agent pages, all internal schemes, or a suffix-name permission.

1. Original global content-client browser pointer is loaded from0xeee7aa8+8. The devirtualization comparison at01e60268..284 binds that actual object to vtable0xe154558; constructor02ed2ed4..edc installs the same table. Its slot+0x8d0 points to0409ed78.
2. That0409ed78 callback has bool(BrowserContext*,const GURL&) shape. It passes the context/profile to the exact eligibility042b14c0, checks the optional resolved GURL exists, and compares requested GURL bytes for exact equality. It returns false for missing/unequal eligibility. The method itself does not use a generic extension host wildcard or histogram suffix.
3. WebContents StartPrerendering04057aa0 stamps an added PrerenderAttributes boolean immediately after its GURL (original+0x78, trigger shifted+0x7c). This happens only for trigger3/embedder, a nonHTTP(S) URL, the original primary-root byte guard, and a successful callback. It is browser code, not renderer speculation-rule input.
4. Registry CreateAndStartHost04042320 computes a **local revalidated** flag from that attribute, browser-initiated state (no optional initiator origin), same initiator/prerender WebContents, embedder trigger3, the primary-root byte and the callback again. Only this local flag relaxes the hidden-initiator restriction, nonHTTP(S) initial URL, and candidate effective-URL restriction. The initiator effective-URL check remains before the candidate branch. Standard delegate/preloading preference, device-memory, critical-memory and subsequent lifecycle checks remain in place.
5. Registry StartHost04043040..306c checks the attribute and repeats the callback before actually starting the host, so an intervening profile/override preference change does not preserve stale permission.
6. Throttle identification is independently tied to string PrerenderNavigationThrottle at0xd98c64b: name method06791820 and its vtable0xe0e0a28; start/redirect trampolines0679182c/34 lead to040437c4. In that function, attribute+0x78 enables the exception only if navigation URL equals the original host URL AND the live profile callback still agrees. A changed URL—even an HTTP(S) redirect—cancels with InvalidSchemeNavigation. Once validated, only scheme/effective-URL checks are relaxed; existing form submission, origin, response, download and host-lifetime handling continues.

The original primary-root byte loads are WC+0x8f8→+0x140→+0x138. The proposed155 source adaptation uses `GetPrimaryFrameTree().root()->is_on_initial_empty_document()` and rechecks it at initial creation. That maps the fresh service WebContents invariant to the155 semantic API and prevents enabling this path on an existing page; the exact original field layout meaning remains an explicit verification caveat. Parent service must create the original empty WebContents, not navigate a hidden primary page first.

## Exact proposed155 API and integration

`content::ContentBrowserClient::IsAuxNewTabPagePrerenderingAllowed(BrowserContext*,const GURL&)` is an adaptation name because the original symbol is stripped. The base implementation returns false, out of line. Chrome's override only exists behaviorally under ENABLE_AUX_BROWSER and calls:

```cpp
aux::IsEligibleNtpPrerenderUrl(Profile::FromBrowserContext(browser_context), url)
```

Parent provides that function in `chrome/browser/aux/ntp_prerender_service.h`, backed by the recovered exact eligibility/manifest/profile check. Patch adds only a dependency on the new header-only `//chrome/browser/aux:ntp_prerender` interface to `//chrome/browser:core`, where ChromeContentBrowserClient.cc is compiled. Actual service implementation belongs to parent's existing UI target, preserving the content→chrome boundary and avoiding a new content dependency on Chrome.

The patch adds a false-by-default browser-only attribute, revalidates source/trigger/context/current URL at registry creation, repeats live callback validation at StartHost, and validates exact unchanged initial URL plus callback for each prerender navigation. Non-Aux browser clients continue to deny. Nothing replaces current navigation with a successful no-op and no exception is granted by a histogram suffix. Candidate scheme is still restricted by the supplied exact eligibility function.

## Evidence and limits

`content-recovery-audit.py <pinned-thin-arm64>` verifies full image SHA, browser-client callback table/BL, raw guard and downstream scheme/callback instruction words, and bounded windows. Its successful result is `content-recovery-evidence.json`; bounded LLVM extracts retain the relevant control flow. Original bodies and code are static evidence, not observed execution.

The10-file patch replay and proposed SHA checks pass in temporary storage. No compilation, browser behavior, prerender activation or generic extension-API deferral acceptance is claimed. Focused negative searches in current extension_function_dispatcher.cc, extension_navigation_throttle.cc and Chrome extension browser/renderer clients found no additional prerender rejection there; this does not establish exhaustive renderer safety or runtime parity. The parent's actual UI/newtab extension calls and activation lifecycle still require the resulting compiled browser's disposable observation.

## Extension boundary and service compatibility review

The read-only155 source audit is pinned in `content-recovery-source-review.json`. `ExtensionNavigationThrottle` retains enabled-extension/resource/platform/guest checks, then explicitly permits a browser-initiated navigation with no initiator origin. `ExtensionWebContentsObserver::ReadyToCommitNavigation` initializes the extension frame before its prerender-only autoplay skip. Chrome's prerender binder policy explicitly grants associated `extensions::mojom::LocalFrameHost` (including SendRequestIPC), EventRouter and RendererHost; no extra binder exemption is proposed. Extension frame-ID lookup admits prerendering documents, and the messaging port lifecycle preserves existing registrations on page activation. These facts establish no additional direct blocker in the examined paths, not exhaustive runtime parity.

The service port was checked against actual155 declarations for StartPrerendering's complete argument list, handle lifecycle observers, WeakDocumentPtr, RFH fallback views, Profile weak references, BrowserWindowInterface close subscriptions, and ProfileBrowserCollection scoped observation. No concrete declaration mismatch was found. The actual Chrome delegate attaches TabHelpers and a prerender task-manager tag; release clears that tag, matching the port.

A complete direct-BL scan of the pinned __text found exactly one caller of original042b2454, at045ce16c inside boolean helper045ce128 (`content-recovery-handle-callers.json`, bounded disassembly `content-recovery-handle-nav-call.txt`). That helper checks object+0x4f8, takes a true shortcut if the transferred-handle check agrees, otherwise tests current GlobalRenderFrameHostId membership in a set at+0x570. Calls of the helper are030ae990,030aee40 and045cd534. Its exact current semantic function remains unproven; no speculative navigation/activation change is added. It is not established as an activation prerequisite.
