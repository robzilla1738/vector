# Bounded fresh-browser milestone: blocked at startup

2026-10-25. This milestone stops here; no next feature or architecture batch has started.

Candidate: `/Users/rcourson/Documents/Vibe/web/out/provided-candidate-fresh-browser-20261025-a45/Aux.app`, incorporating repair A13. This is a complete paired diagnostic package, **not a usable or accepted browser build**. Its browser/framework is A49, daemon is A53, supplied UI is revision33, and the packaged CLI remains inactive. The accepted app at `out/provided-candidate-local-browser-pass/Aux.app` was not replaced.

The only installation/state scope used after A44 is `/private/tmp/aux-fresh-browser-c5mop317`. It was initially fresh and now retains the admitted installation and partial state from these failed starts. It was never reset, migrated or represented as a new empty scope. No owner profiles or credentials were accessed. The older refused partial scope also remains intact.

## Actual result

| Check | Result |
| --- | --- |
| Full native browser and daemon builds | Passed for their selected sources; not runtime acceptance. |
| Local signatures | All17 objects verify on A13. Only owner-approved candidate objects were re-signed. |
| Installation/root admission and paired native entry | Reached with the real disposable installation and native owner. |
| Node source lifetime and file ESM imports | Earlier concrete failures no longer occur. The sealed-source loader fixture also passed. |
| GPU/network helper launch and path initialization | Earlier launch1003 and helper validator CHECK failures no longer occur. |
| Account-store callback/broker validation | Corrected the demonstrated nested validation refusal; later runs advance beyond that immediate failure. |
| Startup / local HTTP readiness | **Failed.** The daemon did not expose `/health` before selected-native startup readiness failed at09:52:57.330 in A13. No usable normal window was observed; desktop inspection timed out. |
| Failed-startup shutdown | **Failed.** A13 eventually exits with SIGSEGV; launcher reports forced cleanup and `groupStopped:false`. Later process inventory finds no candidate executable remaining. That observation is not an all-descendant clean receipt. |
| Navigation and back/forward | Untested; blocked at startup. |
| Two fresh browser profiles / cookie and localStorage isolation | Untested on this successor; blocked at startup. |
| Multiple windows and independent viewing | Untested; blocked at startup. |
| Draft and attachment persistence / ordinary restart | Untested; blocked at startup. |
| Actual sidebar/chat/settings and comparison with Aside | Untested; blocked at startup. Viewing the supplied reference capture is not a comparison of this candidate. |
| UI resources | Exact preservation checks pass through package repairs; no CSS, layout, artwork, fonts or UI behavior changes were made in this milestone. |

The owned candidate is stopped and the synthetic loopback server is stopped. Disposable state and all failed signed preimages remain preserved. No clean-recovery result, legacy acceptance or runtime-ready marker was fabricated.

## What remains implementation versus verification

**Implementation blockers:** ordinary native-service initialization must reach actual listener/authorization readiness, and failed-startup teardown must terminate without SIGSEGV or unresolved forced cleanup. More deadline increases are not a solution. A11/A12 samples show repeated full protected policy/image/installation and peer revalidation during ordinary startup storage operations. Audit-bound Security-object reuse and lexical image-path optimization preserve those checks but did not make this startup usable.

The smallest next design change to assess is a retained ordinary-startup authorization lifetime: admit the existing native owner once, keep writes tied to the exact current process/profile generation, held private roots and live browser peer, and reserve full protected-state revalidation for the trust boundaries that actually require it. This is a change to the authorization lifecycle, **not implemented or authorized by a successful build/signature**. It needs a concrete bounded design before further edits; this milestone does not silently remove guard checks or begin the deferred task architecture. The observed shutdown failure must be diagnosed alongside that lifetime. These are the next known blockers, not proof that no later failures remain.

**Focused verification after startup:** the navigation, two-profile, windows, draft/attachment, restart and sidebar/chat/settings rows above. Repeat only affected checks after demonstrated fixes. Genuine pointer hover remains unverified because the available desktop tool has no pointer-move API.

**Explicit follow-ups:** account-dependent BYOK and eligible ChatGPT/Codex connection/model responses; Chrome extension installation and profile isolation; 1Password autofill and optional native messaging/desktop companion; CLI URL routing. None was accepted by this milestone or removed from the roadmap. Privileged tasks, exec/PTY, Computer Use and native addons remain disabled in this ordinary candidate.

**Deferred:** owner/legacy profile adoption and migration, advanced interrupted-write recovery, new task-capability architecture, mobile, production signing, notarization, distribution and release. Legacy profiles remain refused. This fixed-scope diagnostic package is not a general installation or release candidate. No cloud-account setup is needed to investigate the current ordinary-startup blocker.

## Evidence

- Latest exact package/signature inventory: `actual-bounded-repair-a13.json`; prior failed signed bytes: `out/provided-candidate-fresh-browser-20261025-a45-before-image-a13/Aux.app`.
- Actual launch command/PID/scope: `actual-launch-attempt-a13.json`; sanitized outcome: `actual-final-startup-result-a13.json`. Raw logs/samples remain private in the disposable scope.
- Full browser build: `/private/tmp/aux-chromium-recovery-snapshot-20261023/unsigned-native-readiness-budget-build-20261025-a49/receipt.json`.
- Daemon build: `actual-daemon-image-path-check-build-a13.json` (48 Swift sources,14 retained C++ objects).
- Review and source history: `focused-callback-authority-review-a11.json`, `actual-startup-profiling-a13.json`, `focused-peer-identity-review-a12b.json`, `focused-image-path-review-a13.json`, corresponding exact patches and projection receipts. The failed A12 compilation and corrected A12b build are both retained truthfully.
- Owner authorization: `owner-signing-approval-a5.json`. Same Robert Courson identity, fixed scope, existing entitlements/profile; no provisioning, new OS grants, owner-state access, notarization or release.
