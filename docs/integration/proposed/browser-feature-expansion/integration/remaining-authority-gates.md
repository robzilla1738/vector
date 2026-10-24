# Remaining native authority gates

Read-only reconciliation on 2026-10-23 while the feature a17 build runs. Source/resource compilation and packaging cannot grant authority or substitute for these mechanisms. Keep coldFeatureEnabled and runtimeAuthorityGranted false. The accepted app remains intact.

| Gate | Actual missing implementation | Current evidence |
|---|---|---|
| Writer custody | Hold a mandatory namespace/object custody boundary after final startup inventory checks; close the confirmed external-hardlink bypass. Another writer can currently mutate after validation. | `docs/integration/proposed/profile-isolation-protected-startup/source/AuxBrowserFreshRootAdmission.swift:127`; `docs/integration/proposed/profile-isolation-custody/barrier/evidence/policy-checks-and-hardlink-bypass.json:68`; protected-startup README |
| Drain and normal reopen | Establish complete browser/service/descendant drain and authenticate clean previously admitted-root reopening. Known child/feature tracking and prepared-reservation recovery are insufficient. | Selected `chrome/browser/aux/AuxSelectedStateHome.cc:414` deliberately returns `whole_writer_drain_proven=false`; `docs/integration/proposed/profile-isolation-completion/restart/source/AuxOwnedCommandDispatcher.swift:482`; protected-startup source:51 |
| Runtime publication | Implement a native exclusive atomic runtime-directory publisher with complete seed validation. Existing code still reserves runtime and moves children individually; the proposed C/NAPI primitive is absent. | `docs/integration/proposed/profile-isolation-local-finish/runtime-publication-audit/README.md` and adjacent evidence.json (`implemented:false`) |

## Implemented predecessors

The startup inventory correction is already compiled, linked, paired and assembled; do not keep reporting that pairing as missing. See `profile-isolation-protected-startup/integration/daemon-link.json`, `source-pair.json`, `actual-package.json`.

New organization, FeatureStore and file-operation writers participate in actual admission and pending-operation settlement. Finite daemon-child monitoring, grant-cancellation retention and matching prepared-only interrupted-startup recovery also exist. These do not establish whole-browser custody or normal admitted-root reopening.

## Acceptance after implementation

The exact completed candidate still needs protected startup/resource association, clean and interrupted restart, cancellation/late-write observation, and genuine final UI/workflow comparison in disposable state under authorized lifecycle boundaries. No new signing, owner state, Keychain access, OS grant or product launch is authorized by this reconciliation. Signing alone does not implement the missing mechanisms.

## Common cache successor now built

The a18 browser plus a3 daemon/cache successor is actually assembled in an inactive package; see evidence/actual-cache-package-a3.json. Native matching-seed inspection, async Owner lifetime, exact mutable-package classification and exception-safe descriptor cleanup are compiled/linked and paired. Those are completed source/build improvements, not missing pairing work. The atomic publisher/custody/full-drain/reopen rows above remain missing implementation. Modified/newer runtime compatibility remains explicitly unverified rather than update provenance. Actual runtime and UI journeys remain not run.
