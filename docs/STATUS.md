# Aux status

Last updated 2026-10-27. This is the single current-state page. Dated history through 2026-10-26 is in [archive/status-history-through-2026-10-26.md](archive/status-history-through-2026-10-26.md). The working plan is [2026-10-27 pre-release completion](plans/2026-10-27-pre-release-completion.md); [ROADMAP-EXECUTION-GRAPH.md](ROADMAP-EXECUTION-GRAPH.md) is the outcome inventory. [PAUSE-HANDOFF.md](integration/proposed/completion-20261026/PAUSE-HANDOFF.md) records the October 26 startup failure only.

## Where things stand

The 2026-10-27 plan ran through Batch 1 (pipeline, daemon lifecycle, shutdown races) and the identity audit. The rest is gated on UI access, owner approvals, Apple and OpenAI; see Open. No candidate process or native build is running.

## Artifacts

| Role | Path | Inventory |
|---|---|---|
| Current candidate | `out/provided-candidate-completion-20261026-a1/Aux.app` | `3b9f9b6830e602313cdaf4084833cb94af193791c009dc38c063dc520baf8095` (receipt `combined-legacy-addon-removal-a1`) |
| What that seal adds | Unreachable supplied addon and carrier removed; last extension brand string removed; shutdown races fixed and interrupted helper leases recoverable (`desktop/shutdown-authorization-a1`); bounded peer-loss shutdown (`runtime/daemon-peerloss-deadline-a1`); split menu without "Send Feedback" and a Framework built in the reconciled durable checkout (Batch 1 `0e79a582`). The JS lifeline edit is gone | On top of `2a215e71`: Phase 1 native batch, Aux product logos, multi-pane split metrics fix, brand-sweep `e0228418` |
| Fallback | `out/provided-candidate-local-completion-20261025-a38/Aux.app` | Last broad acceptance. Launch with its adjacent `Launch Aux.command` |
| Source selection | `docs/integration/proposed/completion-20261026/integrator/current-source-selection.json` | |
| Native checkout | `/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src` | Default in `scripts/aux_chromium.py`. `AUX_CHROMIUM_SRC` overrides it |

`scripts/native-build.py` only holds `/tmp/aux-build.lock` around the command it is given. It does not choose the checkout.

The older tree at `/private/tmp/aux-chromium-recovery-snapshot-20261023/src` was still on disk on 2026-10-27, and historical receipts and prepare scripts still name it. The `2a215e71` seal was built there, not in the durable checkout. The durable tree was missing the `phase1-native-a1`, `product-logo-a1` and `split-multipane-metrics-a1` projections, and its `out/AuxFast` had been copied with the wrong toolchain path depth. Both were reconciled on 2026-10-27 (`desktop/durable-checkout-a1`). Builds now run only in the durable checkout, and `chromium/tree/` holds its complete verified delta from upstream (`scripts/chromium-tree.py`).

Screenshots and logs under `out/` stay local. The committed record is the JSON cited below.

## Observed on earlier seals of this app (`d81855c4`, `2a215e71`)

On `d81855c4` (Phase 1 seal, before the logo and split reseals): profile picker, profile open with restored windows and the agent new-tab page, menu Quit with the daemon stopped, and no "Daemon installation authorization failed" line. Receipt: `desktop/phase1-native-a1/actual-result.json`.

In that same session, recorded in `desktop/acceptance/actual-phase2-a1.json`: Space create, name, and switch; a second window on the same profile; Cmd+T palette; tab rename and Undo; 2–4 pane split; stacked orientation; resize; pane close; global pin; archive and Undo; Aux mark on the profile picker.

On `2a215e71` after the split-metrics reseal: a saved 3-pane split restored ("View 1 of 3") and the active pane reloaded, with no fatal abort. Menu Quit then stopped the candidate processes. Local evidence: `out/provided-candidate-completion-20261026-a1/split-restore-a1`.

The organization journeys above were not repeated after that reseal. The repair relaxed `split_tabs::LogSplitViewUpdatedUKM` so a split may have more than two panes.

## Older evidence, not repeated on the current seal

These passed on earlier seals of this same app path (brand sweep `e0228418`, final polish, `9910013f`). They are not a fresh acceptance of the current seal:

Startup with the relinked PDF-ABI daemon, session restore, attached-PDF `read_file`, memory search with a citation, `get_time`, HEIC conversion, REPL Stop, device routine run/notify ("Runs on: This computer"), shortcut remap with palette hint, interruption recovery, Quit/reopen, profile/window isolation, CLI destination, Peek, restored two-pane layout, Quick navigation/handoff, theme apply/cancel, sidebar/minimal, PiP, background CLI list/resolve, cold Cmd+L, full-page capture, global-pin unload/reload.

## Open

### Fixed and observed on the current seal (`3b9f9b68`)

- Startup, normal Quit (browser 6–8 s, daemon 1–3 s, including Quit 10 s after launch), a browser abort (daemon exits about 21 s later) and relaunch after an abort. Measurements are in `desktop/shutdown-authorization-a1/actual-result.json` and `runtime/daemon-peerloss-deadline-a1/`.
- Interrupted memory-helper leases no longer block startup, after a full `aux-memory` census (`runtime/prepared-lease-recovery-a1`).
- The identity audit found the wire protocol and key domains already Aux. The last extension brand string is removed.

### Local journeys not yet run (need someone to drive the UI)

The full Batch 3 pass: R01–R30 except R18 and R20, plus profile-note isolation, the protected close prompt, downloads (collision and drag), capture, PiP, DevTools, the BYOK Muse journey, REPL `aux.pdf`, site-rule routing, Quit/reopen persistence of Spaces, theme and remap, Finder launch, shortcut edits, sidebar popup lifetime, and "Send Feedback" being absent from the split menu. This session has no computer-use tools, osascript has no assistive access, and the shell has no Screen Recording permission. Any one of these unblocks it: Computer use enabled for a session, or Accessibility plus Screen Recording granted to the terminal running Claude.

The bundled `aux-cli` refuses to run when invoked directly ("packaged state identity is unsupported or unaccepted"). It is meant to be reached through the product's installed CLI path, which also needs the UI to set up (R28).

### Identity, last piece (Batch 4)

The supplied addon (`provided-native.node`) and its carrier were unreachable in the shipped product, so they were removed. No `AsideNative` symbol remains; details are in `runtime/addon-replacement-scope/README.md`. No delivered code writes Aside-named Keychain items either: the JS uses `AUX_KEYCHAIN_ID_PREFIX=aux`, and the daemon and its Swift code contain no `aside.` item names. What remains is only the boundary guard's legacy acceptance list in `libaux-native-boundary.dylib`: the original group constant and `aside.` prefixes. The daemon's Swift queries pass their own access group through that guard, so narrowing it needs a runtime check against the Keychain, which needs owner approval. Also staying: the runtime-provenance path inside the daemon.

### External gates (Batch 5)

- **REPL (Bash/PTY/CLI):** the source is complete, rebased onto the current seal (browser overlay, daemon JS with every current rule, and the daemon main with the peer-loss bound, which compiles), and inactive. Waiting on Apple `2H4D7KNGUP`; the remaining steps are in `runtime/repl-activation-ready/README.md`.
- **1Password:** the candidate is already sealed with the Apple Development identity for team `9F2JXY8TCK`. The pairing check still needs the owner's choice of identity for the one `/Applications` install, a disposable vendor account, and someone to drive the UI. Native-host process and pipe cleanup is the remaining source item (`runtime/native-host`).
- **Hosted service:** typecheck and 63/63 tests pass locally after fixing a stale catalog test, which now asserts the BYOK scope. The deploy review's source pins must be refreshed because of that test change. Production deploy, the schema comparison, J5, monitors, alert recipient, operator and rollback ID all need owner approval (`integration/cloud-activation/`).
- **ChatGPT plan:** the eligibility form is not submitted. Proposed answers for its 5 empty fields and 3 status fields are in `integration/chatgpt-eligibility/request-packet/proposed-answers.md`, waiting for the owner to confirm them and submit.
- **Legal:** proposed answers for every open terms and privacy decision are in `integration/product-information/proposed-decisions.md`, waiting for owner or legal confirmation. It also records package facts: no analytics sent and no crash upload configured. The only item that can't be proposed is the LLC's state of organization (governing law), plus processor regions.

### Repo and pipeline

- The candidate is reproducible as the A38 base plus the ordered repair chain. `python3 scripts/verify-candidate.py` checks every pin and the whole app inventory; it passes with 66 pins and 11,202 entries. A fresh `stage:provided` is the predecessor pipeline and stops at its Agent revision review (`provided-ui.test.mjs` stays skipped).
- `chromium/tree/` is the complete Chromium delta: 1,609 tracked, 867 added and 31 deleted paths, verified by replay. It replaces the old patch series.
- Acceptance driver: `scripts/acceptance/aux_drive.py` (check, launch, quit, abort, key, menu, click, drag, open, shot, record) and the journey list `scripts/acceptance/JOURNEYS.md`. `aux_drive.py check` reports Screen Recording ok, but Accessibility and Automation still refused (2026-10-27).
- Worktrees (2026-10-27, read-only inventory): of 61, only 4 are clean and already merged into `main`, so safe to remove: `~/.codex/worktrees/aux-protected-startup`, `~/.codex/worktrees/aux-runtime-publication-audit`, `~/.codex/worktrees/visual-isolation-spec`, and `~/Documents/Aux-archive/worktrees/aux-readiness-chromium`. Five merged ones have uncommitted changes. The other 52 hold commits that are not in `main`; some, such as the detached Codex worktrees, are reachable only from the worktree itself. Keep those.
- Inputs that receipts cite under `/private/tmp` are preserved in `out/live-inputs/tmp-preserved/` with a hash manifest.
- `~/Applications/Aux.app` is the 2026-10-19 launcher for the retired independent build, not this candidate.

Out of scope: backups, mobile, payments and Aux-funded inference, legacy migration, distribution, notarization, release, and a built-in Vault.

## Progress log

- 2026-10-27: Daemon peer-loss shutdown bounded natively (seal `03e13f8e`); abort no longer blocks relaunch. Shutdown stages traced: idle Quit is clean; Quit right after launch hits two startup races (Open).
- 2026-10-27: The owner approved the plan to full pre-release, in six batches. Decisions: signing, notarization and distribution stay deferred; the versioned identity migration is in scope; REPL source is built now, and Apple gates only its activation; one local Developer ID signing is allowed for the 1Password pairing test; "Send Feedback" is removed; local candidate reseals through the approved repair executor are allowed (AGENTS.md). Batch 1: durable checkout reconciled and built, executor re-rooted, Batch 1 seal `0e79a582` (feedback removal, lifeline edit). Abort test failed and is recorded under Open. 93 `/private/tmp` directories referenced by receipts were APFS-cloned to `out/live-inputs/tmp-preserved/` (`runtime/repl-activation-ready/README.md`).

- 2026-10-27: Repo cleanup. Fixed the paths the `web`→`Aux` rename broke (launchers, live source selection, 39 tests) and moved six live inputs out of `/private/tmp` into `out/live-inputs/`. `pnpm test` now runs every test: 406 pass, 0 fail, 12 opt-in skips (it was 218 pass, 55 fail). Retired `apps/`, `packages/` and their tooling, removed 760 unreferenced receipt folders and 542 uncited archive/acceptance files, and rewrote AGENTS.md and the entry docs as current rules. Everything removed is at tag `archive/pre-cleanup-2026-10-27`.
- 2026-10-27: Entry-point docs point here. Historical plans, the clean-room spec, and evidence receipts stay as dated records. See [docs/README.md](README.md).
- 2026-10-27: Paused at the owner's request. Docs aligned to seal `2a215e71`. Popup lifetime review recorded as no source change. Acceptance stopped.
- 2026-10-27: Native checkout copied to the durable path. Previous STATUS archived.
- 2026-10-27: Phase 1 native batch linked (`desktop/phase1-native-a1/actual-result.json`): daemon auth timeout/retry, `aside` scheme removed, `aux_profile_indicator_icon`, copyright strings, plus the shortcut validator and cold-input fixes already in the tree.
- 2026-10-27: Chromium product logos replaced (`desktop/product-logo-a1`). Phase 2 organization observations in `desktop/acceptance/actual-phase2-a1.json`. Restoring a 3–4 pane split aborted in split metrics; fixed in `desktop/split-multipane-metrics-a1` and observed on `2a215e71`.
