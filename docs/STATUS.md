# Aux status

Last updated 2026-10-27. This is the single current-state page. Dated history through 2026-10-26 is in [archive/status-history-through-2026-10-26.md](archive/status-history-through-2026-10-26.md). The working plan is [2026-10-27 pre-release completion](plans/2026-10-27-pre-release-completion.md); [ROADMAP-EXECUTION-GRAPH.md](ROADMAP-EXECUTION-GRAPH.md) is the outcome inventory. [PAUSE-HANDOFF.md](integration/proposed/completion-20261026/PAUSE-HANDOFF.md) records the October 26 startup failure only.

## Pause

The owner stopped the pre-release pass here and asked for the docs and the local commits to match the tree. No candidate process, fixture server, or native build from this pass is running.

Resume at the local journeys under Open. The Phase 1 link, the logo replacement, and the split-metrics repair stay as they are until a later change invalidates them.

## Artifacts

| Role | Path | Inventory |
|---|---|---|
| Current candidate | `out/provided-candidate-completion-20261026-a1/Aux.app` | `b0f780b0f82f5823b54cdde6bd18eb813b1955cb9a6d47de346fb521eef71b9e` (receipt `combined-prepared-lease-recovery-a1`) |
| What that seal adds | Shutdown races fixed and interrupted helper leases recoverable (`desktop/shutdown-authorization-a1`); bounded peer-loss shutdown (`runtime/daemon-peerloss-deadline-a1`); split menu without "Send Feedback" and a Framework built in the reconciled durable checkout (Batch 1 `0e79a582`). The JS lifeline edit is gone | On top of `2a215e71`: Phase 1 native batch, Aux product logos, multi-pane split metrics fix, brand-sweep `e0228418` |
| Fallback | `out/provided-candidate-local-completion-20261025-a38/Aux.app` | Last broad acceptance. Launch with its adjacent `Launch Aux.command` |
| Source selection | `docs/integration/proposed/completion-20261026/integrator/current-source-selection.json` | |
| Native checkout | `/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src` | Default in `scripts/aux_chromium.py`. `AUX_CHROMIUM_SRC` overrides it |

`scripts/native-build.py` only holds `/tmp/aux-build.lock` around the command it is given. It does not choose the checkout.

The older tree at `/private/tmp/aux-chromium-recovery-snapshot-20261023/src` was still on disk on 2026-10-27, and historical receipts and prepare scripts still name it. The `2a215e71` seal was built there, not in the durable checkout. The durable tree was missing the `phase1-native-a1`, `product-logo-a1` and `split-multipane-metrics-a1` projections, and its `out/AuxFast` had been copied with the wrong toolchain path depth. Both were reconciled on 2026-10-27 (`desktop/durable-checkout-a1`). Builds now run only in the durable checkout, and `chromium/tree/` holds its complete verified delta from upstream (`scripts/chromium-tree.py`).

Screenshots and logs under `out/` stay local. The committed record is the JSON cited below.

## Observed on this candidate

On `d81855c4` (Phase 1 seal, before the logo and split reseals): profile picker, profile open with restored windows and the agent new-tab page, menu Quit with the daemon stopped, and no "Daemon installation authorization failed" line. Receipt: `desktop/phase1-native-a1/actual-result.json`.

In that same session, recorded in `desktop/acceptance/actual-phase2-a1.json`: Space create, name, and switch; a second window on the same profile; Cmd+T palette; tab rename and Undo; 2–4 pane split; stacked orientation; resize; pane close; global pin; archive and Undo; Aux mark on the profile picker.

On `2a215e71` after the split-metrics reseal: a saved 3-pane split restored ("View 1 of 3") and the active pane reloaded, with no fatal abort. Menu Quit then stopped the candidate processes. Local evidence: `out/provided-candidate-completion-20261026-a1/split-restore-a1`.

The organization journeys above were not repeated after that reseal. The repair relaxed `split_tabs::LogSplitViewUpdatedUKM` so a split may have more than two panes.

## Earlier evidence, not repeated on `2a215e71`

These passed on earlier seals of this same app path (brand sweep `e0228418`, final polish, `9910013f`). They are not a fresh acceptance of the current seal:

Startup with the relinked PDF-ABI daemon, session restore, attached-PDF `read_file`, memory search with a citation, `get_time`, HEIC conversion, REPL Stop, device routine run/notify ("Runs on: This computer"), shortcut remap with palette hint, interruption recovery, Quit/reopen, profile/window isolation, CLI destination, Peek, restored two-pane layout, Quick navigation/handoff, theme apply/cancel, sidebar/minimal, PiP, background CLI list/resolve, cold Cmd+L, full-page capture, global-pin unload/reload.

## Open

Local, on this candidate:

- Profile-note isolation, protected close prompt, file download/collision/drag, capture, PiP, DevTools, BYOK Muse journey, REPL `aux.pdf`, site-rule routing, Quit/reopen persistence of Spaces/theme/remap, and Finder launch without the workspace launcher. A profile-note type was attempted and is inconclusive: the field did not show the typed value, and SecurityAgentHelper was frontmost.
- **Daemon after a browser abort:** fixed on `03e13f8e` (`runtime/daemon-peerloss-deadline-a1`). The daemon exits 21 s after the abort and relaunch works. The cause was chokidar watchers the supplied shutdown never closes, plus a drain that waits for a browser that is gone.
- **Shutdown races fixed (seal `b0f780b0`, `desktop/shutdown-authorization-a1/actual-result.json`):** Quit at +10 to +45 s exits the daemon in 1.8 to 2.9 s and the browser in 6.7 to 7.8 s. A crash ends the daemon in 21 s and relaunch works. A memory-helper lease interrupted between prepare and spawn no longer blocks startup forever: it settles only after a full census finds no `aux-memory` process. Quit within about 4 s of launch still waits for the first session token (daemon 11 s).
- Split toolbar menu "Send Feedback": removed in the sealed Framework (`desktop/split-menu-feedback-a1`). Not yet looked at in the UI.
- Shortcut-edit acceptance was not repeated on this seal. The validator source is in the linked Phase 1 batch.
- Sidebar popup lifetime: `desktop/popup-lifetime-rebase-a1` found no source change. The current snapshot already contains the A32 fixes and calls `RetireAuxProfilePopup` from `OnOrdinaryWindowClosing`. The real-app checks in that README were not run.
- Remaining Aside identifiers that stay until a versioned migration: `AsideNativeSwift` / `AsideNativeRun` and keychain group `8CPD4K4TBB.at.studio.AsideBrowser.cryptography` live in the immutable supplied addon and are remapped at runtime. `aside.*` storage keys are legacy migration readers. The `aside` scheme was removed in Phase 1.
- A future resource cohort must keep the PDF-ABI correction, the final-polish rules, and the brand-sweep rules. `current-source-selection.json` records `futureResourcesLackRules` for final-polish and brand-sweep.

Repo and pipeline, found in the 2026-10-27 cleanup:

- A fresh `stage:provided` stops at the Agent revision review, for both the default profile and the candidate's (`--cloud-profile development --identity-profile aux-v1 --state-identity-version 2`, with or without `--feature-profile desktop-v1`). The candidate's Agent (`1.26.1016.1888`) came from the completion repair deltas, not from this stage path, and `vendor/provided/agent-revisions.json` has no review for a current fresh stage. So `pnpm check:provided` cannot pass until a new revision is reviewed. `scripts/lib/provided-ui.test.mjs` is skipped for the same reason.
- A fresh Chromium checkout cannot be rebuilt from the repo. The `aux-chromium` setup tool had not run since 2026-10-18 and was removed. The durable checkout's Git is now self-contained: its object store borrowed from `aux-chromium-proof`, which moved to `~/Documents/Aux-archive` today, so the borrowed objects were repacked in and the alternates file was set aside as `alternates.dissociated-2026-10-27`.
- `out/cleanup-2026-10-27/cleanup.sh` ran on 2026-10-27. It removed the 180 purged `/private/tmp` worktrees, 492 branches and 1,227 disposable `out/` entries, freeing about 181 GB; `out/` is now 114 GB in 78 entries, and 62 worktrees and 53 branches remain. All their commits are already under `refs/archive/` and in `~/Documents/Aux-archive/aux-all-refs-2026-10-27b.bundle`. The 50 worktrees in `~/Documents/Aux-archive/worktrees` and 11 in `~/.codex/worktrees` stay.
- The repair executor and plan freezer (`integrator/combined-product-repair/`) still pointed at the pre-rename `/Users/rcourson/Documents/Vibe/web`. They now find the repository root from their own location and re-root the paths recorded in approved reviews; every pinned file is still checked by SHA-256.
- `services/aux-cloud` already carries the confirmed company/contact copy (`confirmed-facts-routes.patch` applied); the product-information README said otherwise and is corrected. `runtime/selected-repl-fs/checkpoint.json` (v2: integrated, compiled, not activated) supersedes the pause note's "unjoined".
- `~/Applications/Aux.app` is the 2026-10-19 launcher for the retired independent build, not this candidate.

Full pre-release. These external gates were not rechecked in this pause:

- General Bash/PTY/CLI REPL: Apple EndpointSecurity request `2H4D7KNGUP` has no approval on record. Generic filesystem draft (`728e4e108`) is unjoined.
- Official extension and 1Password autofill/companion. The companion needs an Apple-signed browser in `/Applications`. That signing is not authorized.
- Hosted services: last recorded production health was 404; `dev-cloud.getaux.co` was on Production; J5 has not been run; production deploy is not approved.
- ChatGPT plan usage: eligibility form not submitted.
- Operations: readiness, alerts, and rollback are not live. Legal facts under `integration/proposed/completion-20261026/integration/product-information/` are drafts.

Out of scope: backups, mobile, payments and Aux-funded inference, legacy migration, distribution, notarization, release, and a built-in Vault.

Owner decisions that gate later phases: signing for vendor pairing, how to proceed if Apple delays `2H4D7KNGUP`, submitting the ChatGPT eligibility form, approving the production deploy and the alert recipient, and whether the R2 token (around 2026-11-22) matters while backups stay deferred.

## Progress log

- 2026-10-27: Daemon peer-loss shutdown bounded natively (seal `03e13f8e`); abort no longer blocks relaunch. Shutdown stages traced: idle Quit is clean; Quit right after launch hits two startup races (Open).
- 2026-10-27: The owner approved the plan to full pre-release, in six batches. Decisions: signing, notarization and distribution stay deferred; the versioned identity migration is in scope; REPL source is built now, and Apple gates only its activation; one local Developer ID signing is allowed for the 1Password pairing test; "Send Feedback" is removed; local candidate reseals through the approved repair executor are allowed (AGENTS.md). Batch 1: durable checkout reconciled and built, executor re-rooted, Batch 1 seal `0e79a582` (feedback removal, lifeline edit). Abort test failed and is recorded under Open. 93 `/private/tmp` directories referenced by receipts were APFS-cloned to `out/live-inputs/tmp-preserved/` (`runtime/repl-activation-ready/README.md`).

- 2026-10-27: Repo cleanup. Fixed the paths the `web`→`Aux` rename broke (launchers, live source selection, 39 tests) and moved six live inputs out of `/private/tmp` into `out/live-inputs/`. `pnpm test` now runs every test: 406 pass, 0 fail, 12 opt-in skips (it was 218 pass, 55 fail). Retired `apps/`, `packages/` and their tooling, removed 760 unreferenced receipt folders and 542 uncited archive/acceptance files, and rewrote AGENTS.md and the entry docs as current rules. Everything removed is at tag `archive/pre-cleanup-2026-10-27`.
- 2026-10-27: Entry-point docs point here. Historical plans, the clean-room spec, and evidence receipts stay as dated records. See [docs/README.md](README.md).
- 2026-10-27: Paused at the owner's request. Docs aligned to seal `2a215e71`. Popup lifetime review recorded as no source change. Acceptance stopped.
- 2026-10-27: Native checkout copied to the durable path. Previous STATUS archived.
- 2026-10-27: Phase 1 native batch linked (`desktop/phase1-native-a1/actual-result.json`): daemon auth timeout/retry, `aside` scheme removed, `aux_profile_indicator_icon`, copyright strings, plus the shortcut validator and cold-input fixes already in the tree.
- 2026-10-27: Chromium product logos replaced (`desktop/product-logo-a1`). Phase 2 organization observations in `desktop/acceptance/actual-phase2-a1.json`. Restoring a 3–4 pane split aborted in split metrics; fixed in `desktop/split-multipane-metrics-a1` and observed on `2a215e71`.
