# Canonical Agent background worker pause protocol

This is source-producer data, never native identity, authorization, durability or
whole-browser writer admission. It is available only when the exact adapted MV3
background module completed its own startup. No eval, synthetic worker execution
API, new extension permission or global Chrome API replacement is used.

## Actual native event and reply owners

Root adds a native-only `chrome.auxBrowserPreferences.onUiMigrationWorkerControl`
EventRouter event with one finite request object, and
`chrome.auxBrowserPreferences.replyUiMigrationWorkerControl` accepting:

```js
{requestId, operation, resultJson}
```

The native ExtensionFunction must restrict the reply to a real serviceworker
context (no render frame) and the held canonical enabled Agent Extension object,
Profile, partition, worker version/process/token and pending native RPC UUID.
The response is at most 65,536 UTF-8 bytes. Native does not trust identity fields
from this JSON; none are sent. Actual worker termination, owner change or a lost
reply remains unresolved until exact-owner recovery or explicit safe abort.

Every event has a fresh lowercase canonical UUID `requestId`, native-generated.
`prepare` retains that ID as the capture correlation. All later RPCs get fresh
outer IDs; their result JSON still echoes the original prepare request ID. Native
must distinguish the outer RPC from the retained capture. Read-only recovery may
adopt a lease only if that original request ID and actual native worker match.

| Operation | Request fields | Behavior |
| --- | --- | --- |
| `prepare` | `requestId`, `operation` | Pause new reviewed logical jobs, drain actual already-admitted callbacks and child writes, then hold. No timeout becomes completion. Same retained request only observes; a competing request refuses. |
| `read` | `requestId`, `operation` | Read current retained state. Does not flush, write, clear unknowns or create a lease. |
| `validate` | `requestId`, `operation`, `leaseId`, `revision` | Require exact held lease UUID and safe integer revision, no revision change, actual pending work, unknown outcome or unsupported owner. |
| `release` | `requestId`, `operation`, `leaseId` | Resume only this exact lease, replaying retained work once through actual callbacks. Native must open its physical backend gate first. No successor-worker retargeting. |

Extra selectors are refused. There are no profile IDs, roots, target paths,
epochs, journal status, writer-closed inputs or native grants in the request.

## Data-only report

The format is `aux.ui-background-writer-lease.v1`. A held report contains the
original `requestId`, generated `leaseId`, `revision`, `phase`, `retained`, local
`closed`/`ok`, `pendingCount`, `deferredCount`, fixed `pendingKinds` counters and
`unknownKinds`. `closed` means only these reviewed worker producers are idle and
held at an unchanged revision. It cannot qualify native barriers or target writes.
Queued future events can exist while locally held; their original promises stay
pending until real replay/cancellation, and the queue is never exported as data.

An exact release returns `released:true`, `closed:false` and actual resumed and
pending counts. If its reply is lost, a subsequent read reports open state and
last-release correlation; it never claims that resumed work is complete. Wrong
lease release leaves work paused. Worker memory loss is not successful release.

## Work retention and cancellation

All actual canonical storage-local set/remove and auth-session writer sites are
tracked at the underlying native Promise, even if original callers swallow a
rejection. Local set/remove and alarm arguments are cloned while held so caller
mutation cannot rewrite deferred intention. Cloning failure is explicit unknown;
no key or payload is included in reports.

Known logical metadata/history/context/Remix jobs pause before their original
body. Content/user-script and context-menu queues retain their actual callback
tails. The real native sign challenge and external password-extension Promise
remain pending beneath their original timeout/abort races. Daemon request and
bridge connection callbacks are observed separately from the bridge's mutable
connection/request maps.

A parsed command pauses before actual dispatch. Ping and cancellation remain
live. Cancellation can retire only the unstarted queued command with the exact
ID and same actual socket; it sends the original cancellation reply and never
calls the command. Already-running commands retain their original operation
Promise after abort/disconnect clears the old request map. Failed/unknown actual
outcomes remain latched across release and later prepare.

A new tab-capture subscriber/visible owner refuses local qualification. Native
must independently enumerate and hold every required frame, offscreen document,
content/user-script writer, worker and relevant browser/daemon producer. The
source producer does not claim generic remote server durability, response-body
completion after an unjoined fetch, or native writes inside arbitrary commands
whose underlying callback is not joined. Those require their actual native and
daemon drain owners; no report field substitutes for them.
