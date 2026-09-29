# EGRESS request authority — runtime/native integration handoff

Status: **runtime source batch; native qualification remains open**. Base: `e1184a2f`.
This batch does not contain a Chromium patch, generated bindings, native build, or
passing native request-path artifact. The integrator owns patch **0121**, generated
outputs, the serial AuxDev build, and qualification records.

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
| `egress.request({requestId, evidence, bodyBase64})` | browser → runtime | `{requestId, decision}` after bounded inspection and any local one-use consent; defer bytes until a matching allow reply and a final native identity check. |

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
assertion. `observedAt` is native observation time. `destination` is the complete
current URL, at most 2048 characters. Userinfo/non-HTTP(S) destinations are denied.

`bodyBase64` is canonical base64 of the **complete** body bytes. `byteCount` is its
exact byte length, at most 65,536; `bodyComplete` must be true. Runtime uses fatal
UTF-8 decoding and denies malformed/binary content. Native must deny files, opaque
uploads, unreadable/streaming data pipes and larger bodies before send. Do not
convert unavailable bodies to an empty complete body. No URL query, body, raw
credential, memory specimen, or body base64 may be logged or persisted.

## Native enforcement requirements for 0121

1. Hook actual navigation before network dispatch and all renderer factory paths.
   `ChromeContentBrowserClient::CreateURLLoaderThrottles` supplies navigation
   WebContents/frame identity. `WillCreateURLLoaderFactory` supplies document,
   subresource, worker, service-worker and prefetch factory context. Preserve that
   context when using the existing blocking-proxy shape.
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
| Private URL and POST body; same-origin memory body | Native attempt/denial receipt plus zero captures; no approval can override. |
| Redirected private bytes | First source hop may occur; recipient sees zero bytes; decision records redirect denial. |
| Public redirect / replacement recipient | New target requires its own decision; original consent never permits substituted destination. |
| Subresource image and worker/service-worker attempts | Attributed inspection denial or explicit ambiguous-provenance denial; zero recipient captures. A factory bypass is a failure. |
| Cancellation during approval; delayed page JS | Approval becomes unusable; zero captures, including delayed request after release. |
| Same-URL reload, stale task revision, expired lease, lost runtime | Old identity denied and zero stale captures; resumed work requires a fresh native token/lease. |
| Saved-password fill | Legitimate intended-origin submission works; cross-origin URL/body/redirect copy denied by native credential fingerprints. |

Server silence alone is insufficient: record a native request attempt and a denial
for the same case, then assert capture count. Record new IDs/hash paths with the
built artifact in qualification. Unit and capture-fixture plumbing checks below
must never be promoted to a native pass. No paid provider benchmark is needed for
this deterministic boundary journey.

## Source verification

Focused unit coverage lives in `egress-guard.test.ts`, `browser-egress.test.ts`,
`browser-egress-approval.test.ts`, and `browser-egress-boundaries.test.ts`; external
session/scoped API regressions are checked because those call paths changed.
Always run `npx tsc -b` before unit tests because workspace exports use `dist`.
The fixture has a loopback-only self-test; it does not exercise Chromium.

Remaining integrator gate: generated bindings + patch 0121 + one serial native
build + the capture matrix above + an actual source → recipient approval journey.
Until that evidence exists, **EGRESS remains unqualified** in the roadmap graph.

Verification recorded 2026-09-28:

- `npm run typecheck` passed (workspace build and shell typecheck).
- Six-file focused unit sweep passed 38/38; two additional source/race cases
  passed in the subsequent 13-test BrowserEgress run (40 focused cases total).
- `npm run lint` passed the existing 390-warning ratchet.
- `npm run format:check` passed; `git diff --check` passed.
- Loopback capture-fixture plumbing self-test passed; no Chromium/native
  enforcement was exercised and no native build was run in this lane.
