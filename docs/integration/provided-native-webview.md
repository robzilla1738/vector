# Supplied experimental webview adapter proposal

The pinned Agent experimental chunk creates a `webview`, invokes `attachTab(tabId)`, listens for `detached`, and removes the element during cleanup. The supplied older native framework does not establish this newer contract. This proposal is a necessary platform adaptation, not recovered original implementation.

`proposed/native-provided-webview.patch` stages a private renderer custom element, Mojo document service and browser lease over Chromium GuestContentsHandle. It borrows the existing tab WebContents, checks the exact component extension, profile/mode and authenticated Vault state, and retires leases on removal, document destruction, target destruction or security change. It does not close the borrowed tab. The public consumer and layout remain unchanged.

The Chromium AttachUnownedInnerWebContents feature is disabled by default and explicitly experimental. This proposal does not enable it. Requests fail unavailable while disabled. Browser-view restoration, native layering, Mojo generation and actual attachment remain unverified. These sources have not been compiled or run and must not be treated as packaged readiness evidence. The custom CDP domain required by the supplied daemon takes priority before this canary consumer.

Validation: the patch applies after the entrypoint, profile-security and capture/launch proposals to disposable source copies; proposed output SHA256 values match. Chromium JSON parsing passes. The JavaScript boundary fixture covers acknowledgement, removal during attachment and detach-before-acknowledgement; it does not prove native behavior. No shared native edit/build, owner data access or runtime capture occurred.
