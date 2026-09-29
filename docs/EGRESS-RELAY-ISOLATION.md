# EGRESS relay boundary — next coherent batch

Status: **read-only design; no isolation implementation or native qualification**.
The 0121 source batch provides a scoped HTTP/final-header/credential and opaque
transport gate. It does not establish transitive confinement across ordinary
same-Profile pages. This dependency must close before EGRESS/S7 or S14 pass.

## Why another boundary is required

An agent-owned document can put private text into BroadcastChannel, localStorage,
IndexedDB, CacheStorage, a shared/service worker, a MessagePort or another related
window. An ordinary same-Profile document can read it and send an unowned request.
Its request has no agent lease, so a gate applied only to owned pages cannot inspect
that transmission under the original run's protected context. Opening new popups
is denied by 0121; existing windows and shared storage still require isolation.

Adding one BroadcastChannel hook would leave the other paths open. Existing Mojo
endpoints and storage transactions also survive a later lease acquisition. A
per-process restriction alone shares the same storage and does not close these
channels.

## Recommended outcome: isolated task browsing

An agent that can receive private context performs page actions only in tabs
created within a native, per-run in-memory StoragePartition and a fresh
BrowsingInstance with no opener or transferred MessagePorts. Every tab in that
partition remains subject to the run's request gate. Ordinary owner tabs retain
their current sessions and storage.

Existing owner pages cannot be reassigned to another partition in place. The
product must offer **Continue in a task tab** (same URL, new isolated browser
context) for actions. A future read-only owner-page context path would need a
separate audited API that cannot inject private inputs or dispatch arbitrary JS;
the current all-purpose page executor must not quietly bypass isolation.

### Native seams already present in Chromium 154

| Seam | Evidence / use |
| --- | --- |
| Fixed partition SiteInstance | `content/public/browser/site_instance.h:253–258` exposes `CreateForFixedStoragePartition(BrowserContext*, GURL, StoragePartitionConfig)`: new BrowsingInstance, partition preserved across navigations. Implementation `content/browser/site_instance_impl.cc:251–260` sets `is_fixed_storage_partition=true`. |
| Ephemeral identity | `content/public/browser/storage_partition_config.h:35–47`: non-default random partition domain/name, `in_memory=true`. Use an unguessable run-specific native identifier; never accept a renderer-supplied partition key. |
| Tab creation | `WebContents::CreateParams.site_instance` at `content/public/browser/web_contents.h:224–234`, with empty opener and suppressed opener. Wire the runtime blank-before-install-before-navigate flow to this creation path. |
| Broadcast isolation | `content/browser/storage_partition_impl.cc:1512` creates one BroadcastChannelService per partition; `broadcast_channel_service.cc:99–113` indexes its own local connections by `(StorageKey,name)`. Different partitions cannot share that service. |
| Shared storage and worker ownership | StoragePartition owns DOM storage, IndexedDB, CacheStorage, service workers and the shared worker service. Verify actual partition identity on factory/frame/worker context; do not substitute matching origin/process IDs. |
| Process isolation | Chromium documents custom partitions as a process-isolation boundary in `chrome/browser/chrome_content_browser_client.cc:1790–1810`. Assert renderer process/partition identity in the native journey rather than treating a new tab or URL as proof. |

Native files above are in the sibling Chromium checkout, not this web repository.
Line references are from the audit, before any subsequent integrator edits.

## Batch contract and ownership

- **Contract/native:** Add a private runtime method to create an inert tab for an
  exact run/task revision and return an opaque native isolation identity. Context
  and install must confirm the frame belongs to that run's fixed partition. Do not
  expose raw partition names or create authority in renderer/public agent inputs.
  Keep run cancellation, Profile scope and task revision fences.
- **Runtime:** Extend the page opener/claim path and external task sessions to
  require isolation before exposing private context to page dispatch. A run's
  additional tabs reuse only its own partition. Other runs receive distinct
  partitions. Redirects, BFCache, reload, crashes and resumed sessions must retain
  the native partition fence or fail closed. No automatic upgrade of old pages.
- **UI:** Explain the task-tab transition and its separate sign-in state. On
  takeover/end, keep the controlled page inert or close it; offer an explicit
  fresh owner copy if useful. Recovery must not turn an old protected document's
  delayed JS into unrestricted networking. The current 0121 tombstone has no
  trusted owner-navigation retirement flow yet; deliver that in this batch.
- **Auth:** Default to a clean partition and native saved-password fill after
  installing the lease. Do not copy an owner's whole cookie jar or storage. If
  shared authentication is required, design an explicit origin-scoped native
  handoff and origin-bound credential/cookie fingerprints before copying. Raw
  cookies and credentials remain native. Never copy service workers, channel
  endpoints, local/session storage, IndexedDB or CacheStorage into the partition.
- **Lifecycle:** Run isolation is ephemeral; no restoration into the default
  partition. Persisted tabs/tasks may store a safe descriptor, but restart must
  create fresh native authority before action. Close worker/factory endpoints and
  clear partition data only after all run tabs have detached; cleanup must be
  scoped to the exact disposable partition.

Likely ownership: `packages/contracts/src/egress.ts` and private host methods;
`apps/runtime/src/safety/browser-egress.ts`, `services/pages/opener.ts`,
`services/pages/executor.ts`, `services/external-session*.ts`, coordinator page
claims; task-tab/attention UI. Native: EgressController, TabCatalog/native tab
methods, PageIdentity restoration metadata and the fixed-partition creation seam.
Integrator exclusively coordinates generated bindings, patch series and serial
native build. No worker may edit those shared outputs independently.

Estimated coherent batch: **2–4 agent-days implementation and review, plus 1–2
serial native qualification iterations**. Reassess after the creation/restore
prototype; this is an estimate, not completion evidence.

## Focused acceptance matrix

Use a disposable Profile with two same-origin owner tabs, two isolated runs and a
loopback capture endpoint. Before each isolation attempt, prove the owner relay
works with a synthetic public control. Then prove all of the following:

1. A task tab sends a permitted same-origin request with current native run,
   document and partition identity; cross-origin public data gets exact consent.
2. Private Memory cannot reach an ordinary owner tab through BroadcastChannel,
   localStorage/storage events, IndexedDB, CacheStorage, shared/service-worker
   messages, postMessage/opener or transferred MessagePorts. Both native boundary
   receipts/partition identity and zero recipient captures are required.
3. A related window or channel opened **before** control cannot survive into the
   controlled context. Default-partition tabs refuse action instead of reusing
   an old socket/IPC endpoint. A second run cannot receive the first run's data.
4. New iframe, worker, popup, redirect, same-URL reload and history transitions
   retain the same native partition boundary and fresh document lease. Unsupported
   worker provenance fails closed and records its reason.
5. Cancel, human takeover, renderer crash, runtime disconnect and restart leave
   delayed requests unusable. An explicit owner copy is a fresh document with no
   inherited agent storage, channels, private memory or request authority.
6. Native intended-origin password fill and ordinary owner browsing still work;
   agent saved-password exfil remains denied without raw-secret IPC.
7. Partition cleanup affects only this run's ephemeral storage. The owner tabs,
   their cookies and another active run continue working.

Audit privileged channels outside web storage (clipboard, extension/native
messaging and pre-existing permission grants) before extending the claim to all
agent-capable transport paths. Disable unsupported channels in controlled
contexts or state an explicit remaining blocker; storage partitioning alone must
not be described as a universal proof against arbitrary covert channels.

## Required completion evidence

Source SHA + generated manifest hash + exact native patch/artifact SHA; fixed
partition/process assertions; focused capture journey and cancellation/restart
receipts; native saved-password no-raw-IPC evidence; independent relay review.
Only then reconcile EGRESS/S7 and S14 qualification. An HTTP pass on 0121 alone
cannot close this dependency. Signed release packaging stays outside scope.

## Proposed private contract (for integrator review)

These method names are proposals; they are not implemented or added to generated
bindings by this planning document.

| Method / fields | Required authority and result |
| --- | --- |
| `native.createAgentPage({runId, taskId?, taskRevision, initialDestination, source?})` | Authenticated runtime only, after existing task/tool policy admission. Native mints the partition and creates inert about:blank without an opener. `source?` contains only a trusted owner-selected `pageId`, exact committed URL and native document token. Return `{pageId, isolationId, runId, taskRevision, inMemory:true}`; isolationId is an opaque receipt, never a caller-selected storage name. Creation does not navigate. |
| `native.egressContext` additions | Return `isolation:{id,runId,taskRevision,inMemory:true}` only after checking `frame.GetStoragePartition().GetConfig()` and `frame.GetSiteInstance().GetSecurityPrincipal().GetStoragePartitionConfig()` against the native registry. Default or mismatched partitions return a recoverable refusal, not optional/missing authority. |
| `native.egressInstall` additions | Bind the lease to isolationId plus existing Profile/run/task revision/tab/frame/document token/epoch. Fail if native partition identity differs. Renewal cannot move a lease to a different run, partition or document. |
| `native.seedAgentSession({sourcePageId,sourceDocumentToken,sourceUrl,targetPageId,targetDocumentToken,isolationId,runId,taskRevision,approvalId})` | Optional owner-only flow below. Approval is a native one-use capability minted by the local owner surface for this exact tuple; never a renderer/model-supplied boolean. Return counts/status only. |
| `native.releaseAgentIsolation({isolationId,runId,taskRevision})` | Revoke requests first, close controlled documents and worker endpoints, then clear only that native registry entry's ephemeral partition after detach. Caller strings never become filesystem paths or a default-partition selector. Idempotent bounded receipt. |

The fixed partition is a **native invariant**, not just a runtime tab label.
Reject navigation/history/restore/factory contexts that switch to the default or
another run's partition. A missing registry entry after restart is a refusal.
Native descriptors from a previous process cannot recreate authority by name.

### Source authority and no silent takeover

1. The user/task's existing selected-page scope identifies the owner source. The
   runtime obtains its native document token and exact committed HTTP(S) URL.
   A model-provided URL is a requested destination, never proof of owner-page or
   cookie authority. Any source navigation between selection and creation fails
   the exact-document check.
2. The source supplies **only its URL and clearly labeled source context**. Do not
   copy its DOM, storage, opener, MessagePort, renderer state or active request
   endpoints into the new WebContents. Send no Referer from the owner document.
   Existing private context entering the run is fingerprinted before dispatch.
3. Open native blank → verify native isolation → claim the new page → install its
   one-use initial URL lease → navigate. Failure closes the inert blank or leaves
   a recoverable inert result; it never falls back to navigating the owner page.
4. Direct `page.act`, `evaluate`, form fill, navigation, custom element/tool calls
   and external task-session operations on a default-partition/other-run page
   fail at the shared executor **before CDP dispatch and before private inputs
   enter page JS**. Native install independently refuses the same operation.
   Claim acquisition is rolled back; the owner tab remains usable.
5. UI recovery offers creation of the isolated task tab. It must not retry the
   original action on the old page after an isolation refusal. An existing run
   resuming from old saved page IDs must take the same recovery path.

### Explicit optional cookie handoff

Default behavior is **no cookie transfer**. A clean task tab can use the native
saved-password fill after its lease is installed. If preserving an existing
sign-in is required, the same batch must implement this complete owner flow:

- Local owner chooses **Use this site's sign-in** for the exact source origin and
  task tab, with a current run/task revision and both native document tokens.
  Model, external-token or standing origin approval cannot mint this permission.
  Keep the permission short-lived, one-use and bound to the displayed source →
  isolated recipient. Cancellation or either navigation invalidates it.
- Read eligible cookies from the source frame's actual partition through native
  CookieManager. Copy only cookies belonging to the approved source origin and
  valid for the target's exact initial URL. Start with host-only cookies; do not
  broaden a parent-domain cookie or silently change its semantics. Unsupported
  domain/partitioned-cookie cases require fresh sign-in and a clear explanation.
  Preserve Secure, HttpOnly, SameSite, expiry and applicable partition semantics.
- Before writing a value into the target partition, register native-only protected
  cookie fingerprints bound to this run and the exact intended origin (including
  port). Raw values, Cookie/Set-Cookie headers and account/session identifiers do
  not cross runtime IPC, appear in UI, or enter evidence. Copy counts/status only.
  A later request to another origin must fail even if the browser would normally
  attach a same-host cookie across ports or JavaScript copies its value.
- Use bounded native transaction staging and a pristine target origin. If any
  identity, fingerprint or cookie-write check fails, remove only cookies staged
  by this transaction and leave the task tab inert. Never mutate the source jar.
  Do not send a target request between partial cookie writes and commit.
- No automatic resync, back-copy or reuse by another run. A subsequent native
  Set-Cookie response in a controlled partition needs the same origin-bound
  producer registration before its values become available to page code. Bound
  exhaustion fails closed; it cannot silently stop protecting later cookies.
- Existing `chrome/browser/ui/aux/cookie_import.cc` demonstrates native
  `SetCanonicalCookie`, but its existing default-Profile/import semantics are
  not an isolation/session-handoff API. Add a scoped native entry point rather
  than reusing generic import authority.

If this optional authenticated-session outcome is deferred, ship the explicit
fresh-sign-in path and record that limitation. Do not claim owner-session
continuity or silently copy authentication to avoid the UI transition.

### Additional exact acceptance oracles for this contract

| Journey | Pass evidence |
| --- | --- |
| Ordinary tab mutation attempt | Native isolation refusal plus **zero CDP/action dispatch**, unchanged owner page/controller and recoverable task-tab UI. Repeat with external task tokens and a resumed old page ID. |
| Blank creation failure | No first destination capture and no fallback owner navigation; inert blank closed or explicit recoverable state. |
| Partition immutability | Native partition/config/run identity recorded at blank, first commit, cross-origin redirect, same-URL reload, history restore and process restart. Default or substituted isolation ID never installs. |
| No-transfer default | Owner cookie/storage marker absent from isolated tab; owner remains signed in; legitimate native password fill can sign into the isolated origin. No browser storage endpoint is copied. |
| Approved cookie seed | Only the approved host/origin's bounded eligible cookies appear in the target after local consent; capture proves intended-origin authenticated request; other owner-origin markers remain absent. No raw value in RPC/log/artifact. |
| Cookie exfil/recipient substitution | Native URL/body/header cookie-copy attempts to a second origin, including same hostname with a different port, denied with native receipt and zero recipient captures. Consent does not override the protected producer. |
| Seed cancellation/race/partial failure | Changing source document, target document, run/task revision, approval ID or isolation identity causes no committed target session; rollback touches only staged target values. |
| Explicit owner recovery | Old controlled document's delayed script remains denied; opening a fresh owner copy does not carry its isolated channels/storage/private values. No tombstone-to-bypass interval on the old document. |

This is one end-to-end outcome: a user can safely continue an authorized task in a
controlled browsing context, with clear session authority and no old-tab fallback.
It should be integrated as one coherent contract/native/runtime/UI batch, then
verified once with these focused journeys alongside the necessary 0121 regressions.
