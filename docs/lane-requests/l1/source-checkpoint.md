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

## Latest resumed source freeze

Integration bffd6eb6 merged cleanly through260f8bcb, preserving central command ownership and adding root CSS contrast/test harness changes. Rebuild, typecheck, lint, format, bindings195/26, inventory and fresh bundle budgets473/179/1689 passed. Full source suite passed387files/2053tests (/tmp/aux-l1-current-unit.log).

Independent root review found fixture handlers were serializing {body:html} into JSON. The owned routes now return literal HTML strings through registerShortcutFixtures; every native UI assertion remains intact. A new regression test fetches both actual loopback HTTP responses and checks status200, text/html MIME, doctype/no JSON wrapper, all30article paragraphs and website input/counters/modifier script. Fixture plus dispatch/invariant checks passed6tests (/tmp/aux-l1-fixture-proof.log); final exact fixture check1/1 passed (/tmp/aux-l1-fixture-proof-final.log). Final typecheck/lint/format/diff gates pass after this test/fixture correction (/tmp/aux-l1-fixture-{typecheck,lint-final,format}.log). No native behavioral evidence is implied by this fixture-only proof.

Native0140/0141 hashes remain ddc9ba4f... / ab6ad208... unchanged. Root independently checked paired application and mirror equality against actualstable0186/0187. Root will add both patch paths to isolated candidate series and regenerate the paired asset pin through the dedicated builder. This is candidate composition, not feature acceptance, merge qualification or completion. Bridge/full target registry remain red until corresponding integration composition/features are supplied; all F1 gaps above remain required.

## Physical release repair and measured failure baseline

Actual candidate f4428484 compiled successfully (52 native build steps), with 132 handlers and zero missing bridge symbols. Its core shortcut journey failed honestly: the second physical press reached the website as one keydown with correct modifiers, but the actual keyup count was zero. Chromium's Cocoa unmatched-keydown bookkeeping rejects the release because the accelerator path forwarded the down directly to the renderer. The old PreHandle keyup branch cannot fix that upstream suppression.

Incremental 0142 (SHA256 c81e38022b507a113169beadec086b8ef4f4277747fbb61853d3dd3d7c2b549a) arms an application-local physical release monitor before the eligible second down, forwards only its matched real keyup once, and consumes that event to prevent duplicate delivery. It retains window, focused target, weak contents, navigation and URL guards; next distinct down and destruction clean up the monitor. There is no synthetic release or arbitrary held-key expiry. Root independently applied 0140→0141→0142 to disposable pure current core and byte-compared all three edited mirror files successfully. Native compile and release journey proof remain pending. Builder alone writes stable.

The actual 20 AC-power performance trials failed at p95 99.821125ms (92.46–103.19ms), measuring request through AX observation with the helper's 40ms sleeps and IPC included. This result is preserved; the 50ms budget remains unchanged. A proposed shared measureKey adapter is saved in measure-key-shared.patch. Its observer registers before actual HID posting, and the same helper monotonic clock records posting through the first notification confirming the expected AX name. It uses an actual timed HID release and pumps the observer run loop without blocking sleeps. No notification/unsupported observation fails; no latency is subtracted. Scratch Swift typecheck and exact patch apply-check pass. Shared application, real AX notification support and new 20-trial evidence are pending root review and builder diagnostic.

DR006 advisory stacking is repaired in owned dispatch: refresh a single advisory and remove it on successful website handoff. The unit regression passes; the native journey requires exactly one advisory, captures shortcut-single-advisory, and then requires its dismissal alongside the unchanged keydown/keyUp counts. Capture work is outside the bounded double-press pair. Design closure requires a new actual native capture.

V6 integration 5fc1ff6 merged through root-authored fb7de10d, retaining central command source. Its exact incoming asset pin is intentionally interim and must be regenerated against the final lane source by the dedicated builder. Rebuild, focused 3 files/7 tests, typecheck, format and diff checks pass (/tmp/aux-l1-release-*). Current lint fails an inherited shared tests/host/lib/app.mjs line96 no-unused-expressions ternary; root has the exact diagnostic for its shared adapter. Full F1/default feature mounts, complete user-action/Palette parity, registry gate, extension native proof, performance, qualification/promotion and design gaps above remain open. This checkpoint is not READY-TO-MERGE.

Final source review follow-up: exact integration0730c6a0 merged to inherit the root-owned explicit LaunchServices close branches. Lint now passes without lane edits to shared app.mjs; format, bindings195/26de28 and native port inventory pass. Timing request revised to standard a/tests and b/tests paths (SHA256 2c9ffcf5402a95010364faf058f9b003b9130b9f311259b39323c25497fdeabf). It drains queued AX notifications while unarmed, verifies live owner/frontmost target and initial unexpected name before posting, and requires live owner plus expected name on the confirming notification. Physical measurement provenance is recorded as command:key, sourceCommand:measureKey with full native result; the qualification input allowlist is unchanged. Revised Swift typecheck and default git apply --check pass. The owned performance journey now uses that proposed adapter and retains 20 AC trials, raw per-trial native timestamp/notification/target evidence, and the unchanged 50ms p95 assertion. Shared adapter review/application and all new native evidence remain pending.
