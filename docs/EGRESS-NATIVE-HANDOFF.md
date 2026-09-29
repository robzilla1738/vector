# EGRESS request authority — runtime/native integration handoff

Status: **runtime source committed; scoped native 0121 source handed to integrator;
native qualification and relay isolation remain open**. Runtime base: `e1184a2f`.
Runtime commits: `54c859cf` and projection revision `3fa25ab7` (integrated by root as
`28a6ea60`). Native source is not a passing request-path artifact. The integrator now owns native source for patch **0121**, generated outputs,
patch packaging, the serial AuxDev build, and qualification records. The EGRESS
lane has stopped editing the shared native checkout.

## Outcome and boundary

An agent-owned browser request may send only under current Profile/run/task/page/
document authority. Private recalled memory and saved credentials must not be sent
to an unintended recipient. Cross-origin page content requires a source → recipient
review. An approval applies to one deferred request and its bytes. Cancellation,
navigation, takeover, stale tasks, and lost runtime connectivity revoke authority.

Direct owner CLI operations with no explicit run stay outside agent attribution.
The content-blocking proxy is an interception seam, not a substitute for these
checks. Source unit tests cannot establish that Chromium actually intercepted a
navigation, worker, redirect, or subresource.

## Private wire contract

These are authenticated host messages. Do not expose them to `aux://` JavaScript,
page JavaScript, model tools, external bearer tokens, or generic runtime invokers.

| Message | Direction | Result / meaning |
| --- | --- | --- |
| `native.egressContext({tabId, expectedUrl})` | runtime → browser | Return native Profile ID, page ID, primary frame ID, document token, and source origin only after the current native URL exactly matches. |
| `native.egressInstall({lease, expectedUrl})` | runtime → browser | `{accepted:true}` only after revalidating native identity, Profile, URL, expiry and run lease. Install or renew without changing identity/recipient authority. |
| `native.egressRevoke({leaseId})` | runtime → browser | Synchronously deny that lease and leave a denied-document tombstone. |
| `egress.request({requestId, evidence, projection})` | browser → runtime | `{requestId, decision}` after bounded projection inspection and any local one-use consent; `inspected` is preflight only, never permission to send. Final bytes stay deferred until a matching `allow` and native identity check. |

`packages/contracts/src/egress.ts` is the wire source; `host-methods.ts` registers the
three runtime-only native methods. The integrator must run
`scripts/gen-host-bindings.mjs` after building contracts and coordinate its shared
outputs. The `egress.request` callback is registered on the authenticated native
channel in `main.ts`; it is deliberately absent from public MethodSchemas.

### Identity meanings

| Field | Authority |
| --- | --- |
| `profileId` | Exact native Aux Profile identity; never infer from a request URL. |
| `tabId` | Aux `PageTarget.pageId` / TabCatalog page ID, not a CDP target ID or strip index. |
| `frameId` | Owning primary RFH global identity encoded `render_process_id:routing_id`. Request attribution must prove that the initiating frame/worker belongs to this document. |
| `documentToken` | Native primary-document token as an opaque string. Use the Chromium document token (or a browser-owned per-document token with equivalent lifetime), never renderer input or the URL. An identical-URL reload must change it. |
| `documentEpoch` | Runtime PageTarget epoch supplied at install; native stores and echoes it only after the actual native token/frame matches. Epoch is an additional fence, not native identity proof. |
| `runId`, `taskId?`, `taskRevision` | Runtime authority from a live run and durable page claim. Scoped task sessions store the actual task revision; changed revisions end their old session authority. |
| `leaseId`, `issuedAt`, `expiresAt` | Random process-local authority, at most 30 seconds, renewed every 10 seconds while current. Renewal cannot rearm a consumed blank navigation or clear tombstones. |
| `sourceOrigin` | Native exact HTTP(S) origin; the sole special value `aux://blank` is accepted only for a targeted initial about:blank lease. |
| `initialDestination?` | Required for `aux://blank`, prohibited for ordinary sources: exact credential-free HTTP(S) URL authorized for one initial GET navigation, with an empty body. |

`kind` is browser-derived: navigation, form, fetch, subresource, worker, or redirect.
`method` is the actual network method (GET/POST/PUT/PATCH/DELETE/OTHER), not a page
assertion. `observedAt` is native observation time. `destination` is the exact
HTTP(S) **origin only**; path, query and fragment never cross this private request
RPC. Reject userinfo and non-HTTP(S) destinations before projection. Source and
recipient origins are authority labels and are the only outgoing address text
shown in the UI.

### Native projection v1 (supersedes raw bodyBase64)

Raw URL paths/queries, body bytes, Cookie/Authorization and arbitrary header values
remain native. Saved-password matching runs natively **before either RPC**, including
URL host labels, with a narrow intended-origin exception. Runtime receives only
bounded SHA-256 projections and metadata; neither projections nor digests belong
in persisted audit logs. They are not encryption and can reveal low-entropy text
through guessing; keep this protocol on the authenticated private host channel.

The reference and golden tests are `safety/egress-projection.ts` and
`tests/unit/egress-projection.test.ts`:

- Complete UTF-8 body at most 65,536 bytes; null body means empty. A file, opaque
  data pipe, streaming upload, binary/invalid UTF-8 or oversize body fails closed.
  Never substitute empty bytes for an unavailable body.
- URL UTF-8 at most 2,048 bytes. At most 128 header pairs; sum of UTF-8 name/value
  bytes plus four per pair at most 16,384. No truncation.
- Independently inspect URL, each header name/value, and body. Include raw text,
  up to two strict percent/form decoding passes, and bounded common base64/base64url
  token decoding (tokens at least 16 characters, decoded at least 12 bytes, fatal
  UTF-8). No recursive base64 expansion.
- Text fingerprints: NFKC, Unicode lowercase, collapse JavaScript whitespace runs
  to one ASCII space; every contiguous 12 UTF-16 code-unit window, SHA-256 UTF-8.
  Page phrases: NFKC/lowercase, Unicode letter/number words; every four-word phrase
  at least 20 UTF-16 code units, joined by one space, SHA-256 UTF-8.
- Unique sorted hash arrays, at most 131,072 text hashes and 32,768 phrase hashes.
  Fail closed on normalization/decoding/bound failures. The arrays fit the existing
  16 MiB host frame cap. `projectionComplete:true` asserts all inspectable fields
  and representations were covered.
- `urlDigest = SHA256(exact URL bytes)`. `requestDigest` hashes ordered UTF-8
  length-prefixed parts (`byteLength:part`): `aux-egress-v1`, phase, actual method,
  exact URL, `complete`/`partial`, decimal header count, each lowercased header name
  then exact value in order (duplicates retained), then complete body text. The
  digest changes on any method/URL/body/header/phase change.
- `phase:preflight` checks URL/body/known headers **before target loader creation**
  and before a protected URL can cause DNS/network connection. Runtime returns
  `status:inspected, reason:preflight_only`; no recipient consent, no first-open
  consumption, and no permission to send.
- `phase:send` uses **final network headers including cookies/auth and all extension
  and enterprise mutations**, with `headersComplete:true`. Runtime may allow this
  exact snapshot or wait for one exact consent. The native callback must recheck
  lease/document and its own unchanged request digest immediately before release.
  Send never inherits preflight authority. Each phase/hop uses a fresh opaque ID.

Private recalled Memory matches even at the same origin. Native saved credentials
may be used only for their intended origin; a cross-origin copy in URL/body/headers
fails before RPC. Page prose copied into any inspected field follows its original
source to the recipient review. Neither consent nor general origin policy can
bypass private-data overlap.

## Native enforcement requirements for 0121

1. Hook actual navigation before network dispatch and all renderer factory paths.
   `ChromeContentBrowserClient::CreateURLLoaderThrottles` supplies navigation
   WebContents/frame identity. `WillCreateURLLoaderFactory` supplies document,
   subresource, worker, service-worker and prefetch factory context. Preserve that
   context when using the existing blocking-proxy shape. Wrap the final
   `TrustedURLLoaderHeaderClient` after enterprise injection, forwarding existing
   handlers first and inspecting their returned final headers. Set the per-request
   `kURLLoadOptionUseHeaderClient`; use browser-generated request IDs. A missing
   final header callback is failure, not a preflight-only send path.
2. Runtime opens an inert about:blank native tab, attaches its driver, claims the
   exact page, installs its targeted lease, and only then calls `navigate`. A
   failed authority callback closes the newly created blank; no fallback navigate.
   The initial exact GET is allowed only **after** private-memory/page-source
   checks. The existing tool policy gate still authorizes the intended open before
   tab creation; this native admission adds no second generic approval. A substituted URL, other method/body/kind, or second initial navigation
   is denied. Redirects require the same admitted loader chain; the original
   destination origin may continue, another origin needs a new exact review.
3. A real document commit changes its token. Leave its requests deferred/denied
   until runtime receives PageUpdated and installs the new identity. Never let a
   new document inherit a stale lease or briefly become an unattributed bypass.
4. Inspect every redirect before follow, including `FollowRedirect`'s optional
   replacement `new_url` and method/body/header changes. Each hop gets a new
   request ID and runtime decision. A prior approval must not authorize recipient
   substitution. Native must bind redirect provenance to the actual deferred
   loader chain, not merely accept `kind:"redirect"` on another request.
5. Actual frame/document ownership is mandatory. Worker-origin/process matches
   alone cannot borrow a tab's authority. An ambiguous dedicated/shared/service
   worker path must fail closed while it could be acting for an agent/protected
   document; do not silently pass because RenderFrameHost is null. Attribute a
   supported dedicated worker only from a browser-owned creator chain.
6. Cancellation, page removal/crash/takeover, navigation, task revision change,
   lease expiry, failed renewal, runtime shutdown/disconnect and reconnect all
   deny stale work. **A document tombstone survives revocation** so delayed JS
   cannot send after the runtime drops its claim. Only trusted owner navigation
   or a newly validated agent install can retire that tombstone. Releasing a
   claim is not permission to resume unrestricted networking.
7. `AuxRuntimeHost::CallInternal` must remain asynchronous. Native request waits
   need a bounded timeout compatible with the runtime's 120-second approval
   window; the generic short request timeout must not discard waiting consent.
   Lost reply, bad ID, disconnect or expiry denies. Recheck native identity and
   the installed lease immediately before forwarding bytes after an allow reply.
8. Before `nativeFillSavedPassword` fills, `credential_fill.cc/.h` must register
   the used credential in native protected-data inspection bound to the exact
   document/run and destination origin. Keep raw credentials native. Never rely
   on redacted model observations to recover the filled password. Fail fill
   closed if the fingerprint cannot be installed.

## Runtime/UI behavior delivered

- Agent page claims install native authority before observation/dispatch. External
  actions carry their real external session run ID, revoke before releasing the
  claim, and external turn tabs use the same blank-before-navigate path.
- A native approval appears in the existing local action-confirmation surface
  with source and destination origins only. It uses the existing approval store,
  action-time sensitive-data policy and exact ephemeral request digest. General
  origin rules/standing grants cannot replace this one-request decision.
- Approving an in-flight browser request resumes that request without queuing a
  planner answer that could answer an unrelated later question. Decline/cancel/
  timeout does not dispatch. Consent cannot override newly learned protected
  fingerprints; bytes and identity are rechecked after the wait.
- Selected article references, auto-recall, memory search, Space memory summary
  and inherited workspace instructions register private text before it reaches
  the run. Fingerprints persist across navigation and pause/resume, and are
  cleared when the run terminates. Bounds are explicit and fail closed.
- Observed page prose, including observation-cache hits, records its source before
  being returned under a claimed run. Reuse across origins receives source →
  recipient review. Protected memory uses normalized 12-character SHA-256 windows;
  page prose uses normalized four-word phrase hashes. URL/form and common base64
  variants are inspected. This is bounded detection, not a proof against arbitrary
  semantic rephrasing, encryption, or covert channels.

## Focused native capture journey

Use `tests/host/native-egress-fixture.mjs` in a disposable Profile. Its three loopback
origins are source, intended recipient and substituted recipient. It provides
real controls, worker/service-worker scripts and redirects, plus capture metadata
(case, recipient role, method, byte count, digest, time). It never records request
bodies or query values. `fixture.secret` is disposable synthetic data, to protect
through the actual Memory producer and saved-password producer under test.

| Case | Required oracle |
| --- | --- |
| First agent-open navigation | Browser claim/install precedes first capture; target substitution and repeat initial request denied. |
| Same-origin public POST | Exactly one source capture under a current native lease. |
| Public cross-origin request | Waiting source → recipient UI; exactly one intended capture after local approval. Decline gives zero captures. |
| Private URL, POST body, arbitrary X header and network-added cookie; same-origin memory | Native attempt/denial receipt plus zero captures; no approval can override. |
| Redirected private bytes | First source hop may occur; recipient sees zero bytes; decision records redirect denial. |
| Public redirect / replacement recipient | New target requires its own decision; original consent never permits substituted destination. |
| Subresource image and worker/service-worker attempts | Attributed inspection denial or explicit ambiguous-provenance denial; zero recipient captures. A factory bypass is a failure. |
| Cancellation during approval; delayed page JS | Approval becomes unusable; zero captures, including delayed request after release. |
| Same-URL reload, stale task revision, expired lease, lost runtime | Old identity denied and zero stale captures; resumed work requires a fresh native token/lease. |
| Saved-password fill | Legitimate intended-origin submission works with no raw IPC; cross-origin URL/body/header/redirect copy denied by native credential fingerprints. |
| Final header mutation and opaque upload | Changed final headers bind fresh digest/approval; missing header completeness or opaque body denied before send. |

Server silence alone is insufficient: record a native request attempt and a denial
for the same case, then assert capture count. Record new IDs/hash paths with the
built artifact in qualification. Unit and capture-fixture plumbing checks below
must never be promoted to a native pass. No paid provider benchmark is needed for
this deterministic boundary journey.

## Source verification

Focused unit coverage lives in `egress-guard.test.ts`, `browser-egress.test.ts`,
`browser-egress-approval.test.ts`, `browser-egress-boundaries.test.ts`, and
`egress-projection.test.ts`; external
session/scoped API regressions are checked because those call paths changed.
Always run `npx tsc -b` before unit tests because workspace exports use `dist`.
The fixture has a loopback-only self-test; it does not exercise Chromium.

Remaining integrator gate: generated bindings + patch 0121 + one serial native
build + the capture matrix above + an actual source → recipient approval journey.
The HTTP/opaque transport journey is a scoped gate. Even after that passes, the
relay isolation batch in [EGRESS-RELAY-ISOLATION.md](EGRESS-RELAY-ISOLATION.md) must
close before **EGRESS** can be qualified in the roadmap graph.

Verification recorded 2026-09-28:

- `npm run typecheck` passed (workspace build and shell typecheck).
- Six-file focused unit sweep passed 38/38; two additional source/race cases
  passed in the subsequent 13-test BrowserEgress run (40 focused cases total).
- `npm run lint` passed the existing 390-warning ratchet.
- `npm run format:check` passed; `git diff --check` passed.
- Loopback capture-fixture plumbing self-test passed; no Chromium/native
  enforcement was exercised and no native build was run in this lane.


Projection revision source verification (2026-09-28): workspace build and five-file
focused EGRESS sweep **32/32** passed. This revises the private request contract;
regenerate host bindings after integration. Native projection parity, final-header
interception, native saved-password capture and every request-path oracle remain
open until patch 0121 is built and exercised. Keepalive's browser throttle receives
an invalid FrameTreeNodeId in Chromium 154; it requires factory document context
or explicit ambiguous-provenance denial. WebSocket/WebTransport/non-HTTP channels
must be denied or separately attributed before claiming complete agent egress
coverage. Bounded text matching does not detect arbitrary rephrasing, ciphertext,
fragmented sub-window secrets or covert channels.


## Native 0121 source handoff (2026-09-28)

Frozen delta: `/tmp/aux-egress-0121-lifecycle.patch`, **23 files / 1,904 patch lines**,
SHA-256 `24470f2ed9d745c86620ea1b297e8ffca222bab59997556cca9acf3bc1b95d42`.
File list: `/tmp/aux-egress-0121-files.txt`; pre-edit stack snapshot:
`/tmp/aux-egress-0121-base`. These are integration artifacts on this machine,
not a release artifact or a native pass. The integrator may revise the source;
qualification must use the final staged patch and built artifact hashes.

Source includes:

- Browser-generated per-document token; exact Profile/tab/frame/document/run
  install and renewal; mandatory accepted:true; tombstone after revoke/disconnect.
- URLLoader factory preflight before target creation, final complete network
  headers after extension/enterprise mutations, browser-generated loader IDs,
  redirect URL/body/header replacement checks and final identity recheck.
- Native-only credential hashes installed immediately before saved-password fill;
  intended-origin use remains possible, cross-origin copies denied before RPC.
- Revocation notifications cancel active guarded loaders. New-document requests
  wait at most five seconds (64 pending bound) for the new native lease.
- Ambiguous worker contexts fail closed while the Profile contains protected
  documents. WebSocket/WebTransport/P2P and opaque streaming uploads are denied
  in protected contexts; already-open opaque transports refuse subsequent agent
  install. Owner fills without an agent lease similarly require a fresh document
  before agent takeover, to avoid inheriting an untracked native credential.
- Protected-document DNS hints, preconnect, prefetch, prerender and new popup
  creation are denied. Existing storage/IPC relay channels remain a blocker.
- A bounded native log oracle emits at most 256 `AUX_EGRESS` records per controller:
  opaque request ID, kind, phase, outcome and reason. No raw address, body,
  headers, credential or fingerprint is logged. Correlate one fixture action at
  a time with these receipts and capture counts.
- Focused native projection test target `//chrome/browser/ui/aux:egress_projection_unittests`
  includes the JS reference request digest and normalization golden. The standalone
  target may need ICU test initialization; AuxDev initializes ICU normally.

Source checks: new C++ files formatted with Xcode clang-format; frozen patch
reverse-application check passed. **No native compile, build or C++ test was run
by this lane.** Compiler/API errors and live behavior must be resolved by the
integrator's one native lane.

Additional capture controls: arbitrary header, network-added cookie, new
WebSocket, already-open WebSocket, WebTransport and WebRTC attempts. The local
fixture's WebSocket control handshake and no-raw-capture plumbing passed in Node;
that check does not exercise Chromium. WebTransport/WebRTC denial cases require a
native admission receipt; a missing capture alone cannot prove interception.

Remaining concrete gates: final native compilation and capture journeys; trusted
owner-navigation recovery from a protected tombstone; cross-page/worker/storage
relay isolation; review of privileged channels before any complete confinement
claim. Signed release packaging is outside this work.

### Scoped 0121 acceptance harness and lifecycle follow-up

Run the two independent groups in `tests/host/native-egress-journey.mjs` after the
single integrator build. Use `--describe` for the exact invocation. Each creates a
disposable Profile, local scripted model and loopback capture servers. The model
drives an actual coordinator run and its first `openTab` blank→lease→navigation;
there is no test-only lease installer or public debugging endpoint. Receiver
counts must agree with bounded native decision receipts. Operator approval is
required in the normal Aux UI for reviewed recipient requests and credential fill.
The manifest binds the native generated source ID, executable/helper and patch
hashes, harness source, run, native receipts and bounded receiver metadata. It
never saves the raw model prompts, request bytes, credential or bearer.

- `--group requests`: same-origin final-header admission; memory copies in URL,
  body, headers and network-added cookies; redirects and substituted recipients;
  subresource/worker/service-worker attempts; opaque uploads; WebSocket,
  WebTransport and WebRTC admission; recipient and page-prose review; cancelled
  pending request and later tombstone denial; working owner WebSocket followed by
  refusal to admit that same document to an agent run.
- `--group credentials`: disposable TLS/password setup; explicit Aux native
  saved-password fill; intended-origin submission validated by the receiver;
  cross-origin credential denial; second-run refusal on the same document before
  any model dispatch. Chromium automatic saved-password autofill is **not**
  covered by this producer hook. It remains a blocker: isolated controlled tabs
  must disable automatic owner-password reuse or route that producer through
  document/run tracking and owner review before qualification.

The lifecycle follow-up binds saved-password producer run provenance to the
browser-owned document and rejects a different run on the same token. A live
lease cannot be replaced without revocation. Revoke/disconnect remove queued and
in-flight native checks and synchronously deny their callbacks; late runtime
answers contain only invalidated IDs. Already-revoked documents cannot enqueue
new navigation-wait requests. Native compilation and live acceptance remain the
integrator's responsibility; source checks are not native qualification.
