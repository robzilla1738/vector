# Agent router beforeunload lifetime

Actual v608 completed a small local attachment read and showed the attachment,
but profile switching still reported `agent-pending-local-file-read`.
The native gate observes **any** beforeunload listener on the Agent host. The
supplied router in `Matches-B99cyGDb.js` always registered its history listener,
even with zero registered navigation blockers. Its callback was then a no-op,
but Chromium correctly continued reporting a live handler. This is not evidence
that the composer pending-read listener itself failed to clear.

The production pending-file transform now also applies two count-checked edits
to that supplied router. Its actual blocker setter subscribes on transition from
zero to nonzero registered blockers and unsubscribes when the last is removed.
The original event handler, blocker predicates, callback timing, capture flag,
ignoreBlocker navigation implementation, and history destroy cleanup remain.
A newly registered blocker clears an old one-shot navigation bypass, so a bypass
from a period with no blockers cannot suppress newly registered work.
Function-valued enableBeforeUnload predicates remain evaluated at the original
event time; they are not sampled for listener installation. Even explicitly
beforeunload-disabled registered blockers conservatively keep the listener.

The composer still installs its own listener synchronously before the actual
FileReader queue starts and removes it only after the queue is empty, attachment
state is committed, and the original draft callback has been invoked. This change
does not weaken that handoff, native admission, or active daemon-task ownership.
It does not promise successful disk storage if the supplied writer swallows a
quota error, nor migrate pending uploads.

Pinned supplied resource SHA-256:
`0015100f56dc2593455746b2ea7017a1f875d5336649b774ce98079ce44cd1fa`

Output of this transform alone, before other staging transforms:
`b88e01581af913fa95d030e947d2b9ba7f8e7ca95d965c675d09581b1c822614`

Focused check executes the actual transformed history implementation against a
small window/event fixture: initial idle state, concurrent pending-read listener,
multiple registered blockers, dynamically enabled blocker, disabled blocker,
last-blocker removal and destruction. It checks listener identity so removing
the router cannot remove the composer's pending-read protection. Full transformed
module syntax also passed. No app launch, native build or broad suite was run.

```
node docs/integration/proposed/agent-router-beforeunload-lifetime/check.mjs /path/to/provided-source-snapshot-1.26.1016.1852 /tmp/router.mjs
node --check /tmp/router.mjs
```

Integrator must add the exact Matches leaf to the existing resource-review
inventory, restage, and verify the actual app's completed-attachment/profile-switch
path. Actual v608 native code is reusable; this correction is supplied JS only.
