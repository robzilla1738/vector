# Aux status — October 7, 2026

## Current local checkpoint

Work is consolidated on local `main`. Nothing has been pushed; no hosted CI, signing, notarization or release has run. Aux remains under development. The approved competitive-browser execution is active in [the execution graph](ROADMAP-EXECUTION-GRAPH.md). Integrated source and the native candidate remain distinct from measured acceptance; competitor parity is not yet established.

Read the [fluidity and coding plan](AUX-FLUIDITY-PLAN.md) for the delivered scope, [ROADMAP](ROADMAP.md) for owner decisions and scheduled acceptance, [ARCHITECTURE](ARCHITECTURE.md) for system boundaries, and [native build instructions](../chromium/BUILDING.md) before starting another builder. Earlier chronological notes are [archived](archive/status-before-sidebar-polish-2026-10-07.md).

## Competitive-browser work in progress

The October 7 approved plan is being implemented with three isolated workers and one integrator. Its acceptance work is active; the earlier owner deferral described below is historical and does not waive this plan's performance, design or workflow evidence.

- Optional setup now ends after four stages. Starters fill the ordinary composer with current native source identities. The separate first-task dispatcher was deleted.
- Native areas 0087–0090 replace the polling bridge, add Profile-owned memory saving and expose bookmark controls/events without Node. The first candidate compiled in 96 steps / 11m46.78s. With its exact runtime paused, native bookmark folder Rename/Undo, Settings and memory-saver controls remained usable. Chromium proactively discarded a clean background tab; activation restored it. Sleeping-state projection remains a follow-up.
- Ordinary Send now has durable UUID reconciliation and in-memory Temporary/private drafts. Native area 0092 forwards original window authority for reconciliation. A native lost-acknowledgement/restart walkthrough remains pending.
- Independent public web reads overlap under original cancellation and dispatch authority. Native search preference is authoritative. Model working context uses route capacity while preserving the full durable transcript.
- Encrypted indexes/embeddings warm cooperatively outside search; cold recall returns lexical results while vectors prepare. Automatic recall is now bounded and ephemeral at provider boundaries. Forget/model changes/shutdown fence late preparation; active Space policy reads schedule idle prewarm. Historical durable recall snippets are a separate unresolved retention concern.
- Source collections preserve exact live/captured identities, page metadata pickers and remove selection count walls. Recapture changes the capture identity even under the same clock. Provider excerpts use current human text and the actual remaining input budget after plans, coding evidence and images. Native collection walkthroughs remain pending.
- Native area 0093 owns private AI in the actual off-the-record Profile, with an authenticated UUID, in-memory database, isolated temporary artifacts and last-Profile retirement. Ask/rail use its private tabs with exact source authority. The 0091–0093 candidate compiled and is linking under the sole builder; private lifecycle observation remains pending. Configured stored direct/Gateway keys are supported; environment and OAuth account adoption still need a shared credential broker before provider parity can be claimed.
- Cloud coding now routes governed files and supervised commands to the retained original VM/Session. Receipts share the durable ledger, include remote identities, retain bounded logs and forbid replay after uncertain launch. Network policy remains locked while background commands live. Native preview and human Changes/Logs/Stop routing still require integration and actual cloud acceptance.
- The measured synthetic 300-turn chat workload mounted 300 detail panels and made about 900 detail/image reads. The conversation worker is implementing deferred settled-turn bodies and bounded whole-chat search/jump; no native timing claim is made from the synthetic workload.

The latest integrated source check passed typecheck/lint and **4,277 tests across 696 files**; one process Stop test pinned an OS-dependent signal instead of permitting a killed shell's exit code 137. Its three affected tests passed after repair. Evidence: `/tmp/aux-collections-cloud-check.log` and `/tmp/aux-cloud-process-stop-repair.log`. The preceding private source integration passed its 440 affected tests after old private-window registry expectations were updated. Runtime dist was rebuilt before tests. No source check substitutes for native observations.

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

## Earlier delivery evidence and current native candidate

Runtime dist was rebuilt before runtime tests. The earlier delivery check passed **4,218 tests across 686 files**, typecheck and lint, with existing advisory warnings (`/tmp/aux-final-owner-command-check.log`). Earlier integrated failures were fixed and rerun in their affected suites; passing suites were not repeatedly rerun. The subsequent reply/context fixes passed **40 focused tests**, including real SDK prompt conversion, native-source drift rejection and strict restored-source admission. Runtime dist was rebuilt and staged; touched-file lint passed. Evidence: `/tmp/aux-final-recovery-focused.log`, `/tmp/aux-final-recovery-mentions.log` and `/tmp/aux-final-recovery-lint.log`.

Chromium is **154.0.8037.98**. The runnable app is `/Users/rcourson/aux-chromium-product/chromium/src/out/AuxFast/Aux.app`. The active series is consolidated through **0093**. The installed candidate completed through **0090**; 0091–0093 is linking and has not launched. The earlier 0086 delivery build passed in **125 steps / 24m11.02s** (`/tmp/aux-cached-endpoint-native.log`), including helper relinks for the shared network correction. The preceding renderer typecheck/build and touched-file Oxlint passed with existing advisory warnings. The retained question completed as `run_muytag7n_2sv6fb`; its sanitized result is `/tmp/aux-final-restored-question-result.json`. The disposable Profile was retired normally and the development lock released. Current packaging is **11.95 MiB JavaScript / 18.53 MiB payload**, plus full ICU. Size targets are advisory.

## Remaining acceptance

The current implementation is distinct from empirical phase acceptance. Before the competitive-browser plan, the owner deferred broad acceptance: detailed Aside comparisons, the manual 20-task default-provider smoke, offline/provider/OAuth acceptance, and native import/extension/filter walkthroughs. Their targets remain in ROADMAP; none is marked passed from source or unit tests.

The paired native performance runner has been exercised, but setup failures have produced no valid samples or performance claims. Its preparation now uses the normal native UI and ordinary fixture tabs while preserving the privileged shell's exclusion from CDP. Record a benchmark row only after all required observations complete. See [benchmark instructions](native-benchmark.md).

Preserve Stop, Take over, site policy, secret protections, durable effects and undo while continuing development. No unrestricted evaluation or foreign agent harness is required by this implementation.
