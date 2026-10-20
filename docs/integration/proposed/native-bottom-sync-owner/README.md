# Supplied bottom-container sync owner

This proposal replaces the extra Chromium new-tab button in the Aux/macOS branch with the supplied bottom container's genuine, hidden sync-status subtree and service owner. Other build configurations retain their existing button path. It layers on the two actual native266 bottom-container files; the region267 footer retirement and sidebar268 avatar correction are disjoint.

## Recovered behavior

The original constructor at `3621b00` creates a vertical card, a horizontal row, an 18px Throbber and the literal `Syncing...` label. This is not a new-tab button. It sets card margins `(2,4,4,4)`, interior margins `(10,12,10,12)`, the throbber's right margin to 8, label context 5 / style 4096 and derived font weight 600. Label multiline and subpixel rendering are disabled. The original card radius is 12 and its border is 1px. Actual mixer recipes 215, 221 and 250 are pinned, rather than treating original numeric color IDs as Chromium155 IDs.

`4244d38` always hides the inner row and stops the throbber. Its label is `Syncing...` when no types are pending; otherwise it appends the first two datatype debug names, a remaining count if needed and parentheses, for example `Syncing... (Bookmarks, Preferences +1)`. The original counter iterates datatype ordinal order; the port uses the actual current `DataTypeSet` iterator and `DataTypeToDebugString`.

Factory `21acfc0` checks the real `disable-sync` switch and resolves the profile's service. Its constructor literally names the factory `SyncService` at `da4cfa5`. `4245090` reads the service's pending initial-sync datatype set and refreshes only when that set changes. It then keeps the outer card hidden and reapplies the saved compact presentation. `42452c8` and its adjusted observer thunk forward only for the observed service. Shutdown `42452f8` removes observation, clears the service pointer and refreshes the genuine empty state. Destruction also releases observation.

The Chromium155 adaptation uses `SyncServiceFactory::GetForProfile(browser_->GetProfile())`, `GetTypesWithPendingDownloadForInitialSync()` and `base::ScopedObservation`. No sync configuration, credentials, enablement, downloads or network test is fabricated. The modern public getter includes Chromium155's documented initial-engine case; the original code inlined its then-current data-manager access. Using the public service API avoids reading obsolete object offsets.

The original main container is visible only in the compact presentation. The original card and inner row remain hidden, including when genuine pending types exist. No independent expanded footer, visible sync status, new-tab replacement or fallback control is introduced.

## Exact remaining limits

This ports the real owner, observer shutdown, hidden subtree, label state and visible-control correction. It does **not** claim complete native fidelity. The original per-view helper created at `a6ddb24` and resized through `6e01164` still needs its exact identity recovered; no substitute blur/shadow is guessed. The throbber is started then synchronously stopped exactly as the supplied constructor/update sequence, but its original semantic color 221 has not been registered as a shared155 color ID. It is hidden and stopped in all recovered paths; no invented animation or visible color behavior is exposed. The recovered fixed card/label colors are resolved against the actual window color mode.

No new source file or GN source registration is needed. The existing UI target already has `//chrome/browser/sync`; integrator should confirm direct sync service/base header dependencies under Chromium's dependency checker. The header adds a conditional observer base and therefore requires normal dependent recompilation.

## Evidence and verification

`source-evidence.json` pins the supplied arm64 distribution, original bounded function bytes/assembly, exact UTF16 fragments, current155 API source and palette constant ranges. The earlier raw-target Ghidra constructor session is auxiliary only; the full original LLVM ranges here are the authority because external tailcalls can truncate a bounded raw decompile.

Run `python3 docs/integration/proposed/native-bottom-sync-owner/verify.py`. It checks the input hashes, exact original visibility/stop instructions, factory and punctuation literals, fixed margins, service API/lifetime anchors and two-file disposable patch replay. It does not execute the supplied app, instantiate SyncService, access owner profiles or perform a native build. Actual native compilation and real UI observation remain with the integrator.
