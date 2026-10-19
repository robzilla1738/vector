# Supplied Agent/Vault hosted-service boundary

This is a static audit of the pinned `1.26.1016.1852` Agent/Vault distributions. No URL was requested, browser opened, supplied code executed, credentials read or owner profile accessed. `provided-ui-hosted-inputs.json` records 29 first-party domain occurrences across 15 files, their source hashes, byte offsets and bounded caller context. `provided-ui-inputs.json` remains the complete source pin.

## Actual direct network consumers

| Pinned file | Observed caller/data flow | Narrow boundary |
| --- | --- | --- |
| Agent `background.js` | `bw` is `https://api.aside.com`; `Sw` resolves a path then calls fetch; `Ow` POSTs `/tabs-tidy/plan` | replace one API base |
| Agent `assets/strip-markdown-DRcmtuJc.js` | `Zt` is API base, exported as `Mn`; `K1` fetch helper exported as `Nn`; remote-host/session adapters use it for fetch, tRPC and WebSocket endpoints | replace one API base |
| Vault `background.js` | `Ne` API base feeds standalone email start/verify, token refresh, account-profile reads, `/pwm/v1/trpc`, credential metadata and encrypted synchronization client | replace one API base |
| Vault `assets/globals-CO6zPMxV.js` | `hx` API base exported as `V`, used by site-icon requests and imported auth/backend modules | replace one API base |
| Agent `assets/channels-CJn5l9_T.js` | two dynamic `docs.aside.com/help/channels-...` prefixes feed guide URLs, agent setup instructions and a fetch that parses a fenced connection prompt | replace exact active guide prefixes |
| Agent `assets/developers-DTvaoVBC.js` | user-facing remote CLI setup instructions contain `curl -fsSL https://releases.aside.com/install.sh \| bash` | replace exact installer URL with unavailable boundary |
| Agent `content/content.js` | `Zv` permits hosted `https://aside.at` in a window-message lasso-settings bridge origin allowlist (`get-lasso-settings`/`set-lasso-settings`); this is authorization, not an outbound request | remove that one hosted-origin member; retain existing three local development origins |

The browser's port9 boundary is `http://127.0.0.1:9/aux-unavailable`, matching the daemon's local-only disposition. Role suffixes are `/api`, `/docs`, `/releases`. This module never starts a server, supplies a success response, substitutes a token, or fabricates a cloud account/catalog/receipt. Existing consumer fetch/error behavior remains intact. Browsers can reject port9 as unsafe or report a network failure; these are truthful unavailable outcomes, not evidence of a successful service.

Agent's fetch helper accepts root-relative URL inputs, so `new URL('/tabs-tidy/plan', base)` drops the `/aux-unavailable/api` path prefix. The **origin remains loopback port9**. Other consumers concatenate paths and retain the prefix. WebSocket consumers derive `ws:` from the same loopback base. Tests assert origin confinement rather than incorrectly claiming every consumer retains the diagnostic path.

## Imported callers covered by the shared bases

Agent's `strip-markdown` exports are imported by:

- `appearance-Ceuw3-j6.js`: POST `/tabs-tidy/validate-prompt` through exported `Nn`.
- `update-banner-C_z-hMCt.js`: `/changelog/changelog` through `Nn`.
- `error-content-CCom8r6s.js`: `/billing/plans` through `Nn`.
- `recommended-filters-gA0HHZVC.js`: `adblock/assets` through `Nn`; unavailable remains an error, with no replacement catalog in this transform.
- `apple-icon-CLZb4-3_.js` and `site-icon-DIeTvqMR.js`: first-party icon endpoints through `Mn`. Existing independent website favicon fallbacks remain untouched.
- `route-VV0zL3cm.js`: channel-chat WebSocket, request and tRPC client bases through `Mn`.
- `route-BiU8pLwS.js`: cloud session agent endpoint and tRPC through `Mn`.
- `conversation-D9Q3VEsl.js`: channel attachments/read receipts, cloud Vault-key deletion, link-preview and image proxy through `Mn`.
- shared `strip-markdown` host adapters: remote-host lookup and remote/cloud chat/session endpoints.

Vault `globals` exports are imported by `auth-CvIrRFM9.js` (`V as P`: email/start, verify-code, refresh and profile fetch) and `backend-B-WKHlbp.js` (`V as ke`: PWM tRPC, metadata, cloud-account issuer and backend request helpers). The background bundle contains its own corresponding compiled copies, hence both API constants must change. No auth tokens or stored owner fields are synthesized or migrated.

Agent Google/email sign-in popup/callback/status routes use `queries-ldd77hNk.js` export `S`, derived from the **local daemon** base (original21420, mapped21520 by native compatibility). Billing embedded-checkout/return and callback origins likewise use that local daemon constant. Those are not additional direct first-party cloud origins; daemon boundary handling remains root/runtime-owned. The standalone Vault auth calls are direct hosted consumers and are covered above.

No independent direct hardcoded hosted share URL was found in this bounded pinned text audit. Share URLs returned dynamically by the daemon remain the daemon boundary's responsibility. This is not a claim that arbitrary runtime data can never contain an external URL.

## Preserved occurrences and reasons

| Occurrences | Disposition |
| --- | --- |
| Agent `route-TQyeTEXE.js` `https://docs.aside.com` | ordinary user-clicked Docs navigation; preserve |
| `ai-CzEX5E7S.js` and `add-on-credits-dialog-Dn5FxOyZ.js` policy/terms URLs | ordinary external legal hyperlinks; preserve |
| add-on dialog `https://asidehq.com` | non-browser `typeof window==='undefined'` return-URL fallback, not the actual extension billing URL (which uses the local daemon); preserve and record |
| Agent manifest `https://api.aside.com/*` and `https://api.asidehq.com/*` | `web_accessible_resources` match metadata for `main.html`; no request is issued by these strings, and changing them is not necessary to block the actual consumers |
| `artifact-test-CdjpLuI1.js` three synthetic `jun@aside.at` addresses and sample post link; `chat-wBzshK0k.js` sample markdown link | fixture/demo text, not autonomous API calls; preserve |
| `subscription-C_XzJh5Z.js` `@aside.com` / `@at.studio`; `experimental-Xq3YsEPK.js` `@at.studio` | email-suffix UI eligibility rules; preserve semantics rather than altering account/plan authorization in a URL patch |
| Vault globals `static.asidehq.com` | hostname exclusion in favicon parsing, not an autonomous fetch base; preserve |

Agent Channels has four automatic image templates under `https://static.asidehq.com/bots/`, in the connection-choice header, connection list, and two connect rows. **Preserve them** pending faithful static asset provisioning. They render through `avatar-iEt_J7Lk.js` (`n as te` fallback, `r as ae` image, `t as ne` wrapper). Each image has a label-initial fallback; the image error handler hides the image and activates that fallback. Redirecting these asset URLs to the unavailable boundary would visibly replace real bot artwork with initials, so that proposed rewrite was removed before delivery. The complete pinned Agent/Vault asset inventory contains no matching `bots/*.jpg` payload. No substitute was invented or downloaded. These four hosted asset dependencies remain explicit; this module does not claim fully offline artwork or complete network silence. Root may later pin exact authorized static images and rewrite their src to packaged equivalents.

All third-party provider API/auth URLs, provider icons, website assets and external documentation links remain byte-identical. This audit does not authorize visiting or contacting them. Wire fields and deliberate `Aside.*` protocol tokens remain untouched. Telemetry defaults belonging to third parties are outside this first-party-host scope; this module is not proof of complete network silence for all supplied dependencies.

The developer setup snippet's installer endpoint is disabled, but its remaining original lowercase CLI command examples are not rewritten by this URL module. Root should keep the remote-host setup surface truthfully unavailable in the local build and audit those command instructions before presenting them as a working Aux workflow. No installed Aside CLI is invoked by this audit or transform.

## Hook and checked differences

New `scripts/lib/provided-ui-boundary.mjs` exports `transformProvidedUiBoundary({component,path,text}) -> {text,anchors}` and immutable `providedUiBoundaryRules`. Root owns the actual stager/native-compat modules; this delivery does not edit or mount either. Compose the hook after native compatibility and concatenate anchors in replay order:

```js
const native = transformProvidedNativeUi(input);
const boundary = transformProvidedUiBoundary({...input, text: native.text});
return {text: boundary.text, anchors: [...native.anchors, ...boundary.anchors]};
```

There are seven checked anchors / eight replacements across seven pinned files. API bases each occur once; Channels guide prefixes occur twice; installer and origin member once each. Each rule checks exact count and records `kind:'integration'` find/replace/count anchors. Unknown files remain exact. There is no broad product-domain replacement, fetch override, global mock, iframe shim, route-layout rewrite, permission spoof or successful cloud stub. CSS/HTML/component geometry is unchanged.

Focused tests use the actual pinned text, verify source hashes, replay all returned anchors to exact output, parse every modified JS file without importing/executing it, assert unchanged third-party URLs and `Aside.*` tokens, preserve ordinary links/samples/manifest, retain local bridge origins, reject altered/repeated anchors, and verify both relative and concatenated API requests stay at the unavailable loopback origin. They send no requests. This establishes the bounded transformation, not packaged browser/network acceptance; root must mount the hook and restage before it takes effect.
