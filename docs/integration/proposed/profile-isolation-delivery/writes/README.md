# Watcher, sync timer and OAuth refresh producer shutdown (inactive)

This successor adds concrete producer cancellation and closure before the existing finite-writer/resource shutdown. It consumes only exact `cd56bbb6…` supplied source and applies ten count-checked seams. UI and native ABI are unchanged; the ordinary cold-entry refusal remains. Root composes the complete source and dormant entry separately.

## Implemented

The actual DriveSync/history startup, poll, cookie and debounce entry points register a private idempotent producer stop. Once shutdown begins, new guarded admission is refused immediately. Before waiting for writer operations, the stop invalidates each real runtime generation, clears its actual debounce/poll/cookie interval handles, unregisters connected/reconnected transport triggers, removes its runtime and awaits its queued work and watcher close. History restarts are disabled; the original history `stop()` aborts its request controller, clears its real interval and awaits the active history tick. Native SQLite lifetimes remain open until this producer-stop phase completes; the prior broker then closes tracked databases.

The actual Chokidar watcher factory now retains an existing native `withBrokerAwaited` reservation before construction. Its original receiver-bound `close()` Promise controls that one resource's completion. Close is idempotent, rejected closure retains unknown, and shutdown awaits both active and rotated watchers. This does not infer that already emitted event callbacks or nested network/filesystem producers drained. Existing watcher/queue unknown markers remain.

History tick callbacks check owner admission before starting work. New timers cannot be registered after closure. Existing callback bodies and account-generation checks are preserved.

OAuth refresh is connected to an actual shutdown AbortController combined with the original caller signal via `AbortSignal.any`. It retains native pending custody through the original provider callback Promise. Shutdown aborts the controller before awaiting pending operations; an abort request never settles the reservation by itself. The original error conversion and return values remain. Because provider callbacks may detach work, native unknown is explicitly retained before invoking them and is never cleared by callback success, failure or cancellation. No credential/provider operation is run during implementation verification.

The producer-stop registry is internal scheduling, not native authority: no JS ID, clean flag or fake generation grants drain. It invokes only the newly pinned helpers. Native current Worker/Owner admission and counters remain in the existing compiled host. An outer shutdown timeout may still exit before completion, and never creates a clean-resume receipt.

## Evidence

The focused fixture runs the actual new helper/runtime against synthetic native bindings and controlled pending operations. It confirms timer clearing, queue-generation invalidation, transport unsubscribe, disabled history restart, awaited history/queue/watcher closure, provider abort delivery, and that pending provider custody blocks closure until callback settlement while unknown remains. Complete transformed syntax and changed input rejection pass. `evidence/source.json` and `integration.json` record exact input/output hashes and changed seams.

No native source changed, so no duplicate native compilation ran. No real browser, daemon, filesystem owner profile, provider endpoint, sign-in, Keychain or signing operation ran. These fixtures are not native authority acceptance or proof of all producers draining.

## Residual gaps

Other watcher classes, general routine schedules, download/extraction cancellation, model/runtime subprocesses, arbitrary provider-internal background work, imported utility/extension producers and descendant closure remain separate outstanding lifetimes. Runtime installation callbacks retain unknown. This batch cannot truthfully declare complete cancellation, clean admitted-root restart, or release/testable protected-browser readiness. It improves concrete stop behavior while preserving the blocker whenever ownership/drain remains uncertain.
