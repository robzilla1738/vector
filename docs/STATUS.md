# Aux status — October 7, 2026

## Current local checkpoint

Work is consolidated on local `main`. Nothing has been pushed; no hosted CI, signing, notarization or release has run. Aux remains under development. This checkpoint delivers the fluidity/coding implementation; it does not establish competitor parity or completion of every browser-roadmap phase.

Read [ROADMAP](ROADMAP.md) for owner decisions and scheduled acceptance, [ARCHITECTURE](ARCHITECTURE.md) for system boundaries, and [native build instructions](../chromium/BUILDING.md) before starting another builder. Earlier chronological notes are [archived](archive/status-before-sidebar-polish-2026-10-07.md).

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

The current implementation is distinct from empirical phase acceptance. The owner previously deferred broad acceptance to the next roadmap round: detailed Aside comparisons, the manual 20-task default-provider smoke, offline/provider/OAuth acceptance, and native import/extension/filter walkthroughs. Their targets remain in ROADMAP; none is marked passed from source or unit tests.

The paired native performance runner has been exercised, but setup failures have produced no valid samples or performance claims. Its preparation now uses the normal native UI and ordinary fixture tabs while preserving the privileged shell's exclusion from CDP. Record a benchmark row only after all required observations complete. See [benchmark instructions](native-benchmark.md).

Preserve Stop, Take over, site policy, secret protections, durable effects and undo while continuing development. No unrestricted evaluation or foreign agent harness is required by this implementation.
