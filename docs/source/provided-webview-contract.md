# Pinned Agent live-tab webview: conditional contract and bounded native audit

The pinned Agent `1.26.1016.1852` has one `attachTab` reference across all1074 JavaScript/JSON/HTML files: its Experimental settings pane. A fresh anonymous local account has no email and does **not** instantiate that pane, even if a general experimental feature flag permits the settings route. Preserve these original gates and the fallback. Do not fake an internal email, force feature flags, register a fake custom element, substitute ordinary tab navigation, or activate the old guessed native adapter to make this conditional experiment appear available.

This is a bounded static conclusion for the actual supplied default local account, **not** a claim that all accounts/builds can never reach the experiment. Internal `@at.studio` accounts can pass the extra gate; the native implementation of their requested contract has not been recovered from the reviewed older framework. That conditional fidelity gap remains explicit.

## Exact caller and route evidence

Pinned source hashes, exact UTF8 byte offsets and counts are recorded in `provided-webview-contract.json`. All source inspection was inert; no owner account/profile/state was read.

- Agent manifest requests `at.studio.Aside.blink.expose-wv`; Aux's existing identity-only transform maps that name to `dev.aux.blink.expose-wv`. The manifest request alone neither registers an element nor proves attachment support.
- `extension-main-Dz1-AsCT.js` lazy-loads `experimental-Xq3YsEPK.js` for `/u/$userId/settings/experimental/`. Its `beforeLoad` calls the actual daemon `analytics.isExperimentalEligible` and redirects to General when false. The settings nav also filters its `internalOnly` Experimental entry using that result.
- Original daemon eligibility accepts an internal email, Canary input, or a general feature flag; its account-specific implementation supplies `isCanary:false` and can fall back to the real feature-flag result. No fake analytics response is needed or introduced here. Route eligibility therefore does **not** imply live-webview eligibility.
- Inside the experimental chunk, `de` fetches the actual `accounts.get` account and instantiates live-pane `me` **only** when `account.email?.trim().toLowerCase().endsWith("@at.studio")` is true. All other accounts get the ordinary scroll/main wrapper containing the supplied settings. The daemon `accounts.get` returns AccountRegistry.getAccount; its default and newly minted anonymous/local slots contain no email.
- Inside `me`, availability further requires `chrome.tabs.query` and `customElements.get("webview")`. No synthetic `supportsWebview` capability field exists. Unavailable native support shows the supplied browser-build fallback. Even an eligible internal account does not automatically call `attachTab`: it must choose a candidate and click Attach.

The generic eligibility helper accepting a Canary argument does not bypass the separate live-pane email gate. The visible text mentioning internal users/Canary builds is not stronger evidence than these actual conditions. We do not claim route-level flags always return false or inspect any owner's email/flag state.

## Required behavior when the conditional pane is reachable

These are observed **consumer requirements**, not recovered native implementation or a newly invented security policy:

| Consumer action | Actual required contract |
| --- | --- |
| Query | `chrome.tabs.query({})` and `getCurrent()`; candidates have numeric IDs, exclude the current tab, active/discarded tabs, and non-HTTP(S) URLs. Query invalidation listens to created/removed/updated/activated/replaced. |
| Create | `document.createElement("webview")`, `className="size-full"`, aria-label `Live tab content`; append it into the real resize pane. |
| Attach | `element.attachTab(tabId)` returns a Promise. Fulfilment changes “Attaching…” to “Attached”; rejection's `error.message` closes the pane and displays an error. No fulfilment value is consumed. |
| Detach | Native element dispatches `detached`; callback clears the selected attachment. Exact native event causes/payload are not established by the caller. |
| Remove/unmount | Remove the `detached` listener, remove the element and ignore a late Promise callback. Explicit Detach unmounts it. |
| Content ownership | Supplied UI promises that the original tab stays open and its page state survives detach. A second navigation, cloned tab, screenshot, fake acknowledgement or close-and-reopen does not satisfy this. |

A faithful native path would need actual guest/widget attachment of the existing live contents, correct ownership/restore on element/document teardown and native detach notification. The caller does not prove the original browser's profile/incognito/security checks, validator design, Mojo surface, view layering, focus routing, target activation behavior or detach races. Do not present the earlier proposed lease/Mojo/Vault-gate choices as recovered originals.

## Native and compressed resource scope

Original reviewed native artifact: `/Applications/Aside.app/.../Versions/1.0.928.1/Aside Framework`, universal SHA256 `0338d5517ac8910ff0f821f573e0b297107e0df6d914c3989986051ca6b745db`; its ARM64 slice SHA256 `64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c` matches the supplied native-fork map for Chromium153. The whole Mach-O contains no exact `expose-wv` or `attachTab` literal; it does contain the stock `AttachUnownedInnerWebContents` feature name. **These literal results alone are not code/resource absence.**

We therefore decoded every unique indexed payload of the four original nonlocale PAKs using their actual DataPack headers and Chromium gzip/Brotli conventions:6004resources total,3201gzip,914Brotli,1889plain, zero decode failures. `provided-webview-pak-scan.json` records per-pack source hashes, resource IDs/offsets/codecs/decoded hashes. The scanner never evaluates code.

There is one `attachTab` **substring** in decoded resource22982, SHA256 `1984b45aab43c5e5f48193a54cd547844e6f4be7e95e638ed4ad76a861007a57`. It is `TabWebviewElement.attachTabContents()` on **`cr-tab-webview`**, using `browserProxyFactory.handler.getGuestIdForTabId()` and `chrome.browser.attachIframeGuest()`. Current upstream `chrome/browser/resources/webui_browser/webview.ts` confirms that separate WebUI browser class. It is **not** the Agent's `webview.attachTab(tabId)` contract. Eleven decoded resources reference stock `webViewInternal`; no decoded resource contains `expose-wv`. We do not infer that an unrelated guest-ID API can be aliased to the Agent method.

This PAK scan covers indexed payload bytes, including known compression, not arbitrary native semantics, locales, V8 snapshot deserialization, dynamically constructed strings or an unprovided newer Canary framework. Those remain unknown. The supplied retained native-fork text subset (623source/script/IDL files) also has no `attachTab`/`expose-wv` reference, but it is not a complete source tree. A matching original native implementation was **not** recovered, and no replacement was authored.

The native REA provider attempt failed because Kuna is unconfigured/does not support this universal target; no alternate full-framework decompilation was silently started. Two bounded REA JS analyses corroborate the selected caller/route inventory; Evidence IDs and their partial coverage are in the JSON ledger. Native byte/PAK observations are ordinary static-file analysis, not REA native semantic evidence.

## Actual default behavior and end state

For the supplied fresh no-email local slot, account gating prevents the live-pane element construction/call regardless of generic experimental-route flags. Existing supplied settings markup, eligibility checks and unavailable-support fallback stay unchanged. Unknown requested permissions are install warnings/removal rather than fatal manifest errors in current upstream `extensions/common/manifest_handlers/permissions_parser.cc`; that source behavior does not establish extension runtime acceptance or native capability support.

The unresolved expose-wv capability remains **unimplemented/unverified for eligible internal accounts**. It is not silently marked successful or removed from the original manifest. It is not a requirement to activate this prototype for the default anonymous/local acceptance path. The old `native-provided-webview.patch` remains an unapplied historical experiment; its custom lease, extra Vault checks and disabled unowned-attachment feature were platform design guesses, not supplied implementation reuse. Do not apply it on this audit's authority.

No shared native source, registration, permission, feature flag, UI/daemon transform or root packaging code was changed. No build, native execution, browser/profile access, Keychain call, OS grant or runtime attachment test occurred. The only focused fixture validates the static PAK parser's plain/gzip/Brotli decoding and malformed-bound refusal; it does not simulate or claim webview behavior.
