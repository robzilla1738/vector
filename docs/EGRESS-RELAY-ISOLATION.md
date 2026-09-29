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
