# Retained agent-tabs bubble: actual supplied session ownership

Status: proposal only, uncompiled and unobserved. Shared checkout was read, never edited by this lane. This incremental three-file patch targets the **actual current native files after `native-task-feed`84a105df3**; exact baseline/output hashes are in `manifest.json`. No daemon, registration, schema, GN or persisted-state changes.

## Authoritative association, not a replacement ledger

The supplied runtime already owns `session_tabs` per account. Rows have `id`, `sessionId`, `targetId`, `ownership`, `source`, URL and `data` (including title). `AsideBrowser.openTab` obtains an actual `createAgentTab` target receipt and records ownership `owned` through `insertSessionTab`. Attached user tabs are recorded `borrowed`. The supplied extension creates the actual background Chrome tab and returns its real debugger target; grouping alone is not ownership proof. The exact code/table/router/bridge anchors are pinned in `docs/source/provided-native-agent-tabs-inputs.json`.

The proposal reads the **existing** `sessions.list`, `sessions.get` and `sessions.tabs.list` RPCs. There is no `/session/for-chrome/agent-tabs` request, new HTTP endpoint, duplicate database, ownership guessing from URL, persistent native registry or fake successful ledger response. The native in-memory groups are a disposable view projection of those source records and current native targets.

`list` omits browserBinding, so each actual session is fetched through `get`. Only an exact physical profile ID and explicit matching `default`/`incognito` binding are admitted; a missing mode is never guessed. Each tab row must belong to that exact session and declare `ownership:"owned"`. The existing tabs API includes child sessions; child rows are filtered out of a parent's response and considered only through that child's own verified binding. Live debugger IDs must resolve to an actual tab in the exact calling Profile. Extension tab IDs are never treated as native IDs or invented for source rows that do not contain one.

The inventory is bounded to200 sessions and2000 owned targets. A full session page or target cap is explicitly reported as partial in the retained bubble. Failed/unknown bindings are reported as unavailable rather than projected into another profile. The actual account including zero is added to each original RPC. Fresh authenticated PWM/profile verification runs before the query and again before displaying its result or mutating tabs.

## Real close/cleanup effects

An explicit Close or cleanup request re-reads that selected session and its authoritative tab rows, verifies its exact native profile/mode and current Vault/account state, and acts only on those currently live owned targets. Close matches both the actual source `sessionTabId` and debugger target ID. Cleanup skips active tabs, matching the supplied runtime's `closeOwnedTabs`/`closeOwnedSessionTabs` behavior. It cannot close borrowed tabs or another session's child rows.

The actual native TabStripModel close path is used for the user's explicit action. The result reports only observed removals; pending/before-unload confirmation times out to a visible error after three seconds rather than fabricated success. Tab removal is handled by the original extension observer, which calls the real `sessions.tabs.resolveByTarget` and `sessions.tabs.remove` to retire source metadata. That remove RPC only detaches metadata; it is **never** substituted for a physical close. No URL-based fallback is used.

There is no `autoClosePolicy` field or per-task setting in the pinned original contract. The original owned-tab disposal lifecycle stays intact. The retained native policy control is disabled with an explicit unavailable explanation; a programmatic policy request also returns an error. No UI-only policy is persisted and no lifecycle success is invented.

## Verification and limits

Performed: original source/table/bridge/API anchors verified against pinned SHA-256 inputs; changed C++ regions formatted in Chromium style; isolated `git apply --check` and actual patch replay; all three replay hashes equal the manifest. Native fixture/runtime behavior has **not** been executed and C++155 compilation is pending integrator scheduling. No supplied code was imported/executed, daemon/network contacted, owner profile/state opened, Keychain accessed or OS grant requested.

The retained bubble layout, grouping and activation path remain in place. The snapshot has no per-task automatic cleanup control until an actual source contract supplies one. The bounded inventory may be incomplete, and a tab waiting for page confirmation remains visibly open; these states are reported. Real packaged target creation/list/activation/borrowed exclusion/cleanup/lock/incognito scenarios are still required before acceptance.
