# L1 source checkpoint — 2026-10-01

This checkpoint is for review and integration, not F1 completion or READY-TO-MERGE.
Current source base: contracts-v5 98d8a3f89ff8fe535c4ba52268b3a4f91d46766d, merged through8d4173ea. Root-authorized conflict resolution kept centralized App dispatch and the incoming parameterized Quick Ask/Little onboarding test. All five contextual IDs have central unavailable fallbacks, typed feature invocation/results and authoritative bridge.windowKind eligibility. Root applied the exact NavigationButtons settingsRoute context adapter, preserving Settings history/refresh behavior without inventing store state.

Owned native mirrors were rebased from read-only stable0186/0187; only baseline webui_browser_ui.cc changed. Both patches apply cleanly after the actual stable enum/cookie adapters. No stable mutation by this lane.

## Included behavior

- Central registered command dispatch, feature invocation payload, window eligibility, and asynchronous feature error handling.
- Extracted App action map; registered toolbar/navigation/new-tab/sidebar/palette entry points route through runCommand.
- Remappable default inventory, import/export validation, reserved macOS refusal, overlapping-platform conflicts, accessible busy/error/empty states, and controlled ExtensionShortcuts group for an actual L7 settings mount.
- Native normal/private window command dispatch, menu New Tab routing, focus metadata, all-command validator with Space support, Toggle/Inspect DevTools modes.
- Website double-press forwarding constrained by exact accelerator, active focused guest, contents identity, navigation identity, URL, and 800 ms interval. No synthetic key-up.
- Quick Ask opt-in effective Profile binding inventory, atomic global registration, and shared native reserved/bare/modifier validation.

Native patch identities:
- 0140-command-dispatch.patch: ddc9ba4fd2a177e2c64a7bffffb6666b95a19607481f4b1f1d20be2efdd2b249
- 0141-quick-ask-shortcut-registry.patch: ab6ad208c9e46dae0c968cac154ed1769c6f411874d6098cd8f5cde225568b7b
Both sequentially apply and exactly reproduce the owned .native mirror in a disposable tree. Root independently reviewed and apply-checked the paired enum→0140→0141 chain. Stable tree untouched by this lane.

## Verified source checks

- Workspace rebuilt before runtime tests; final v5 typecheck passed (/tmp/aux-l1-v5-route-typecheck.log).
- Full final v5 unit run passed: 387 files / 2,053 tests (/tmp/aux-l1-v5-route-unit.log). This includes contextual payload, rejected Promise exactly once, window refusal, Settings route history/refresh and registry invariant.
- Final lint (382 warning lines), format ratchet, diff checks passed (/tmp/aux-l1-v5-route-{lint,format}.log).
- Bindings check passed: 195 methods / 26 events, hashde283406805e (/tmp/aux-l1-v5-bindings.log).
- Native port inventory --check passed (/tmp/aux-l1-v5-inventory.log).
- Fresh Vite bundle and budgets passed: startup JS473/490KB, CSS179/180KB, totalJS1689/1800KB (/tmp/aux-l1-v5-route-{bundle,budgets}.log).
- Bridge --check still fails dispatchCommand until root integrates its native handler patch into series. Full journey registry --check still fails other feature modules. Neither gate was weakened (/tmp/aux-l1-v5-{bridge,registry}.log).

## Native evidence and unfinished scope

Journey modules shortcut-registry-core, shortcut-registry and shortcut-perf are supplied but unrun. No native pass, performance number, design approval, acceptance manifest, or promoted qualification is claimed. Core covers HID focus/windows/Quick Ask, reserved import refusal, persisted Reader rebind and dead old chord; real website keydown/keyup counts, navigation/focus/target/exact-accelerator refusals and physical modifier preservation. Perf records 20 actual AX effects, power state and p95, counting HID helper/IPC overhead; assertion remains ≤50ms.

Full original F1 all-new-default proof still requires future Minimal UI, pinned apps, Little windows, PiP, split, Spaces, Profiles handlers and meaningful functional output. Full shortcut-registry must be extended to all six split defaults and all nine Space/Profile ordinals with real fixtures. Extension group needs L7 host retrieval/persistence mount and its native refusal/remap proof. Global Quick Ask remap/Profile activation needs actual native proof and later L6 deletion cleanup coordination.

The current source invariant checks registered literal IDs and parameterless new-tab/palette/sidebar intents. Remaining Palette static action aliases and all command controls must derive registered intent through dispatch. Unregistered Library/Stop loading/reading-list and other Palette actions need root registry additions plus real handlers; L3 parity is an explicit F1 dependency. Do not characterize the current invariant as exhaustive rendered-command parity. Native reviewer captures/P0–P1 closure, complete target registry, candidate manifests, ≤50ms measurement and clean-split qualification/promotion remain required.

Ordinal/cycling commands retain canonical F4 shared sidebar order. L4 store.activate owns claim-before-selection/refusal; do not ownPages-filter these commands. Its actual cross-window behavior remains a dependency until L4 integrates. ownPages is for local surfaces/lifecycle.
