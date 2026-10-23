# Profile isolation and protected startup — parallel local batch

Baseline: local main `43914674f`. The accepted app and its UI remain untouched. Work is local source implementation and bounded native verification; signing, provisioning, activation and release are separate.

## Integration lanes

| Lane | Ownership | Purpose |
| --- | --- | --- |
| Browser roots | `browser-roots/` | Capture actual Chromium data/cache roots and transfer retained descriptors over the authenticated native peer connection. |
| Subprocess custody | `spawn-custody/` | Admit actual Node async/sync and PTY launches through the retained owner, constrain inherited descriptors, and retain truthful child state through syscall and cleanup failures. |
| Protected startup | `startup/` | Carry authenticated roots through startup, close creation before releasing service ownership, and implement a fresh-only versioned task/control layout. |
| Integrator | `containment/` | Mandatory native filesystem envelope, actual disposable sandbox check, exact supplied task/broker boundary inventory, integration evidence. |

No lane can independently enable the protected cold hook. Shared source composition, native registration, packaging and activation remain integrator-owned. Compiles run through `/tmp/aux-build.lock` using `scripts/native-build.py`.

## Local source integration outcome

All three lane commits are integrated on main. `integration-summary.json` pins the 41 source files and five authoritative evidence receipts. Actual checks passed: seven Chromium/daemon translation units, one early Local State provenance unit, six subprocess/PTY translation units, one paired whole-module 47-source Swift typecheck, and the synthetic macOS sandbox filesystem check. These are changed-boundary checks, not a full application build or runtime acceptance. The earlier multi-frontend Swift check was stopped and recorded as interrupted; the final single-frontend result is the valid evidence. The first PTY compile exposed an SDK-header include-order issue; only that unit was corrected and recompiled, retaining the five unchanged passed units.

Use `startup/integration-v5.json`, not its superseded initial graph. Browser patches are ordered `native.patch` then `early-local-state.patch`; neither is applied to the shared Chromium checkout by this batch. New native headers require paired consumer compilation and must not be associated with old linked artifacts.

Still requiring implementation: actual account/session task projections and their permission consumers; cache-policy override lifecycle coverage; native owner admission before earliest Local State IO; brokered-write ownership/cancellation and complete writer closure; then coherent native linking and exact entry/package association. The new root capture before Local State is provenance only. It is not permission to read private state and does not close the early owner-admission gap. A successful direct-child exit still does not establish all descendants are stopped.

No app was linked, packaged, launched, installed, signed or released in this batch. No owner profile, credential or OS permission was accessed. The current UI and accepted preview remain unchanged. There is no new user-testable app from these source changes yet, and no additional account setup is needed to continue the remaining local implementation.

## Readiness requirements

The mandatory filesystem envelope alone is not a full profile-switching solution. It needs authenticated roots, native launch admission, inherited-descriptor exclusion, legitimate task/runtime paths outside private state, and owner-bound brokered writes. Direct-child exit must not be misrepresented as descendant completion. Uncertain ownership remains blocking.

Existing layouts cannot silently acquire new semantics. New fresh-only task/control state needs an explicit policy/journal version; old or incomplete records must refuse unless an explicit migration exists. Source implementation does not authorize access to owner profiles or credentials.

Actual evidence is recorded in each lane. A successful compile is not protected runtime or UI acceptance. The previous unsigned review candidate remains inactive; it must not be presented as a newly working build based on these source changes.
