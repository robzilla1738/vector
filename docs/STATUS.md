# Aux status — October 7, 2026

## Current local checkpoint

Work is consolidated on local `main`. Nothing has been pushed; no hosted CI, signing, notarization or release has run. Aux remains under development. The approved competitive-browser execution is active in [the execution graph](ROADMAP-EXECUTION-GRAPH.md). Integrated source and the native candidate remain distinct from measured acceptance; competitor parity is not yet established.

Read the [fluidity and coding plan](AUX-FLUIDITY-PLAN.md) for the delivered scope, [ROADMAP](ROADMAP.md) for owner decisions and scheduled acceptance, [ARCHITECTURE](ARCHITECTURE.md) for system boundaries, and [native build instructions](../chromium/BUILDING.md) before starting another builder. Earlier chronological notes are [archived](archive/status-before-sidebar-polish-2026-10-07.md).

## Competitive-browser work in progress

The October 7 approved plan is being implemented with three isolated workers and one integrator. Its acceptance work is active; the earlier owner deferral described below is historical and does not waive this plan's performance, design or workflow evidence.

- Optional setup now ends after four stages. Starters fill the ordinary composer with current native source identities. The separate first-task dispatcher was deleted.
- Native areas 0087–0090 replace the polling bridge, add Profile-owned memory saving, register its browser controls, and expose bookmark controls and events without Node. The shell's old memory scheduler was removed. Folder/tree/context and bulk-tab controls are integrated; identity-bound folder reordering remains in progress.
- Independent public web reads overlap under their original cancellation and dispatch authority. Native search preference is authoritative. Model working context uses route capacity while preserving the full durable transcript.
- Encrypted page indexes and local embedding batches warm cooperatively outside search. Cold recall returns lexical results while vectors prepare; capture, model changes, Forget and shutdown fence late work. Active Space policy reads schedule idle prewarm, and memory mutations await derivative invalidation. Bounded, ephemeral auto-recall is still being integrated.
- Development tools use one shared product/Fast source configuration and one plain builder lock. The first new native candidate is compiling under `node scripts/dev.mjs --temp-profile`; no changed native behavior has been observed yet. Do not treat the existing app as the new accepted candidate during this build.

The latest integrated source check passed typecheck/lint and 4,203 tests; its one missing native-memory fixture was repaired and its 15 affected tests passed. The bookmark transport's changed envelope passed its affected 19 tests after one fixture repair; the adjacent memory control had already passed. The memory worker rebuilt runtime and passed 34 focused tests. These checks do not substitute for native observations. `/tmp/aux-native-fluidity-context-check.log`, `/tmp/aux-native-preferences-repair.log`, and `/tmp/aux-native-bookmark-envelope-repair.log` retain the local results.

The performance harness now records an immediate same-Profile warm relaunch and 100 native input samples per browser for tab-switch/omnibox p95. Available runtime boot marks include elapsed process time. No complete valid measurement report exists yet.

## Delivered behavior

- Chromium is the only engine. Vertical layout and Ask first default; Skip confirmation is remembered and Auto remains in Settings. The sidebar contains the native address/search field, pinned icon tray, separate bookmark folders and manually ordered tabs. Native browsing remains available without the runtime.
- Compact composers, anchored context/model menus, consistent controls and native glass work in both appearances. Core page rendering is eager; approval UI mounts only for an actual confirmation. Long Settings controls wrap. Project and package choices stay in run options.
- Per-run modes and explicit once/run/site/global scopes share the policy boundary. Exact file/browser/command review binds concrete effects and current authority; broader grants remain separate. Drift, revocation, Stop and late approvals cannot silently enlarge authority.
- Aux's own loop provides governed search, versioned create/edit/move/delete batches, durable changes/diff, reconciliation and conflict-safe file undo. Supervised commands and background monitors retain process identity and bounded log artifacts. Arbitrary command side effects are not advertised as undoable.
- QuickJS coding surfaces use the same admission, journal and suspension path, replay confirmed results and stop on uncertain mutations. Declarative coder profiles use isolated worktrees; integration preserves parent changes and individual outcomes. Aux Packages provide pinned skills, profiles and declarative workflows, without a foreign runtime or permission bypass.
- Tool, budget, model and cloud reviews survive restart through explicit continuation. Native window/workspace/source authority is rebound before dispatch. Accepted ordinary answers persist through budget pauses. Cloud recovery retains exact session identity and funding for uncertain creation, preventing duplicate creation.

## Observed native behavior

Disposable Profiles and a synthetic local Git project were used throughout. The owner's real Profile was not used.

- A real provider completed a reviewed two-file change, with a single exact batch review and confirmed durable receipt. The shipped Aux package and project selection were visible in the native composer.
- A pending command survived normal app shutdown. After reopening, Aux refreshed its exact review and ran `npm test` once: exit 0, one test passed, durable log artifact. File hashes stayed unchanged across restart.
- Native Undo rejected a deliberate later manual edit and preserved both files. Removing only that test edit allowed a journaled reversal that restored a clean Git project.
- A Full-mode background process started without redundant confirmation, produced real monitor output and ticks, and reached stopped state through the native process control.
- Pausing the exact disposable runtime process left native navigation and tab activation usable. The runtime was resumed afterward.
- Both light and dark Liquid Glass remained readable at 0% sidebar tint. Native area 0080 corrects retained material appearance; 0081 forwards native owner proof for undo, worktree/package management and restart continuation.
- A fresh browser-backed question accepted its answer and completed through the configured default provider. The walkthrough exposed and corrected tool-result/context ordering and guarded-source answer admission. After native area 0082, a completed browser chat could immediately start another on the same two tabs.
- A parked question survived normal shutdown and restart: its cached source loaded automatically without manual reload, the same run accepted the answer and completed “Preference saved: Morning,” and Aux saved its report. Native areas 0083–0086 cover restored navigation, owned cleanup identity and truthful cached-response endpoint metadata. Normal shutdown with a parked question and after completion both exited with code 0.

The actual default provider used in these walkthroughs was `anthropic/claude-sonnet-5.5`; the workspace Gateway configuration worked. The inherited shell credential was rejected. A separate small request also verified the configured Luna fast route. These observations do not verify every provider, subscription/OAuth flow or offline model.

## Verification and runnable app

Runtime dist was rebuilt before runtime tests. The latest integrated check passed **4,218 tests across 686 files**, typecheck and lint, with existing advisory warnings (`/tmp/aux-final-owner-command-check.log`). Earlier integrated failures were fixed and rerun in their affected suites; passing suites were not repeatedly rerun. The subsequent reply/context fixes passed **40 focused tests**, including real SDK prompt conversion, native-source drift rejection and strict restored-source admission. Runtime dist was rebuilt and staged; touched-file lint passed. Evidence: `/tmp/aux-final-recovery-focused.log`, `/tmp/aux-final-recovery-mentions.log` and `/tmp/aux-final-recovery-lint.log`.

Chromium is **154.0.8037.98**. The runnable app is `/Users/rcourson/aux-chromium-product/chromium/src/out/AuxFast/Aux.app`. Native patches are consolidated through **0086** in `chromium/patches/series`. The final native build passed in **125 steps / 24m11.02s** (`/tmp/aux-cached-endpoint-native.log`), including helper relinks for the shared network correction. The preceding renderer typecheck/build and touched-file Oxlint passed with existing advisory warnings. The retained question completed as `run_muytag7n_2sv6fb`; its sanitized result is `/tmp/aux-final-restored-question-result.json`. The disposable Profile was retired normally and the development lock released. Current packaging is **11.95 MiB JavaScript / 18.53 MiB payload**, plus full ICU. Size targets are advisory.

## Remaining acceptance

The current implementation is distinct from empirical phase acceptance. Before the competitive-browser plan, the owner deferred broad acceptance: detailed Aside comparisons, the manual 20-task default-provider smoke, offline/provider/OAuth acceptance, and native import/extension/filter walkthroughs. Their targets remain in ROADMAP; none is marked passed from source or unit tests.

The paired native performance runner has been exercised, but setup failures have produced no valid samples or performance claims. Its preparation now uses the normal native UI and ordinary fixture tabs while preserving the privileged shell's exclusion from CDP. Record a benchmark row only after all required observations complete. See [benchmark instructions](native-benchmark.md).

Preserve Stop, Take over, site policy, secret protections, durable effects and undo while continuing development. No unrestricted evaluation or foreign agent harness is required by this implementation.
