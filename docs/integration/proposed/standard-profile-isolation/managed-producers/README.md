# Managed routine/session producers — inactive successor

This adds 20 count-checked edits after the actual standard daemon projection a1. It leaves the existing feature, runtime, research, background-writer, shutdown and runtime-coordination artifacts immutable. No UI changes, product execution, native execution, signing or owner data access occurred.

## Integration contract

Import `source/transform.mjs` and call `transformAuxManagedProducers(text)` independently for ordinary source and the independently adapted dormant entry. It returns `{text, changes}`; each change has literal `find`, `replace`, `count: 1` and a descriptive name. Pin all three source files in `overlay.json`. A missing or duplicate anchor refuses composition. The manifest records actual a1 input/output hashes for the isolated replay, not a requirement to relabel a later combined predecessor as a1.

The integrator may apply the disjoint refresh-and-skill adapter first, then this adapter. It must record the resulting actual intermediate hashes and replay every original and new anchor, run the original dormant-entry projector on the final ordinary source, and compare that output with the independently adapted entry. This lane's replay does not replace that final projector check, native binding, staging or package checks.

## Actual behavior changed

- The two reviewed recurring callbacks, routine listeners and orphan retry no longer declare every successful invocation permanently unknown. Their actual returned work is retained through native broker `withBrokerAwaited`, while existing native FS/child/agent owners remain authoritative for physical operations.
- Shutdown synchronously detaches these listeners and cancels only timers that have not fired. It waits for already-admitted work; neither cancellation nor elapsed time settles it. Native boundary failure remains a native failure. A completed, reviewed domain operation may return its error to its caller without declaring unseen work; no native unknown flag is cleared.
- Session recovery is awaited during bootstrap, including pending coder reports. Reconnect reconciliation, report delivery/retry, archived/deleted coder stops and stopped-session workflow callbacks are retained. Once closing starts, bootstrap does not start the next scheduler, and recovered reports do not create new retry work.
- The extension bridge's connect hook now returns an idempotent unsubscribe. A local-only dispatch observer marks the exact browser command send attempt; it is not a serialized command, PID proof or completion receipt.
- Orphan, idle and owned-session tab closes use the existing connection-bound response. Only confirmed closed tabs lose their saved rows. `closed:false`, absent browser bindings, failed requests and ambiguous results retain records. An ephemeral session is not purged while it still owns an unclosed tab.
- Shutdown closes request admission immediately but defers actual WebSocket/HTTP close until admitted producers and HTTP handlers have drained. Otherwise its own transport teardown destroys outstanding browser close acknowledgments.

## Why the browser acknowledgment is sufficient for this narrow operation

The actual selected Chromium `chrome/browser/extensions/api/tabs/tabs_api.cc` lines 3246–3365 implements `TabsRemoveFunction` using `WebContentsDestroyedObserver`. For a single tab, success is returned only after `WebContentsDestroyed` (or synchronous completion); `contents->Close()` alone is not the response.

The supplied Agent `qa()` helper awaits `chrome.tabs.remove(e)` before returning true. `Aux.controlTab` awaits that helper; `Aux.clearAiTabsGroup` awaits each close. The daemon's existing pending-request map checks both response ID and original connection ID. This change uses that existing successful response. A pre-dispatch connection refusal performs no browser mutation. After a send attempt, a timeout, disconnect, cancellation, error or malformed acknowledgment remains unknown and calls the existing native untracked marker. It never clears that marker when the JavaScript promise ends.

A response `closed:false` may mean active/non-agent/missing target; target lookup catches some errors. It is deliberately not treated as proof that the saved tab can be forgotten. An acknowledged group cleanup may skip protected tabs and return zero; it confirms completion of the attempted command, not closure of every tab in the browser.

## Focused evidence and limits

`check.mjs` executes only the new helper and adapted functions with synthetic deferred callbacks. It verifies admitted-work drain, unfired timer cancellation, listener unsubscription, normal logical error propagation, pre/post-dispatch uncertainty, confirmed-row removal, all close callbacks settling before aggregate failure, and transport ordering against a deferred browser acknowledgment.

Both actual ordinary and dormant source copies received all 20 edits, independently replayed their literal changes, and passed `node --check`. Exact evidence is in `source-check.json`. These are source/inert checks only. The final combined projection and runtime behavior remain unverified. `whole_writer_drain_proven`, runtime acceptance and testability remain false; this does not claim coverage for every daemon writer or weaken descendant/native-owner requirements.
