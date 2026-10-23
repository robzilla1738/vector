# Selected daemon child completion

This successor fixes two concrete lifetime gaps while preserving all UI and all browser-root admission refusals.

The selected-home monitor previously stopped as soon as admission closed, even if its owned daemon child had not exited. No normal caller polled the retained child registry afterward. In addition, `InspectOwnedChild` reaped real exit but did not remove that terminal child from the retained registry.

The monitor now continues on its existing background thread after closure, inspecting the exact retained child through the existing mutex and sole `ReapLocked` implementation. It sleeps 250 ms between pending observations, closes admission once, and never waits on the UI thread. It also handles a queued monitor that first executes after closure. Actual observed-and-reaped exit or launch failure ends inspection; sticky unknown ownership also ends polling but does not unregister the retained child. `InspectOwnedChild` now removes only a genuinely terminal child under the existing registry rules. No second waiter, signal, timeout-as-success, or path-based adoption is introduced.

## Integration

Replace the two source files listed in `sources.json` with this subtree's successors. Keep the existing paired headers, authority, protocol, and shutdown hook sources. `sources.json` pins both predecessors and successors. Stage only after any current browser snapshot build freezes/finishes, then use normal GN dependency rebuilding of affected objects; do not mutate an active compile snapshot.

## Verification and limits

`check_monitor.py` extracts the actual production monitor body and checks delayed exit, a queued monitor starting after close, unknown exit ownership, and selected-owner mismatch with synthetic peer/child observations. It never runs protected runtime or uses owner state. `compile.py` compiles both actual Chromium translation units against the paired native headers in a disposable source overlay; invoke through `scripts/native-build.py`.

This is completion of the finite direct daemon child ledger only. It does not prove whole-browser writer drain or enable admitted-root reopen. The main process can still exit before its background monitor observes daemon exit. Renderers, utility/network processes, native messaging descendants, and late filesystem writes remain separate. macOS child spawning uses explicit FD mappings and close-on-exec defaults; an inherited flock descriptor is not mandatory writer authority because children can close or unlock it and other launch roots bypass it. No clean receipt is minted from a phase event, socket closure, parent exit, or descriptor availability. Existing admitted-root recovery therefore remains refused.
