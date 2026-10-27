# Aux status

Last updated 2026-10-27. This is the pause checkpoint and the single current-state page. Dated history through 2026-10-26 is in [archive/status-history-through-2026-10-26.md](archive/status-history-through-2026-10-26.md). The working checklist is [ROADMAP-EXECUTION-GRAPH.md](ROADMAP-EXECUTION-GRAPH.md). [PAUSE-HANDOFF.md](integration/proposed/completion-20261026/PAUSE-HANDOFF.md) records the October 26 startup failure only.

## Pause

The owner stopped the pre-release pass here and asked for the docs and the local commits to match the tree. No candidate process, fixture server, or native build from this pass is running.

Resume at the local journeys under Open. The Phase 1 link, the logo replacement, and the split-metrics repair stay as they are until a later change invalidates them.

## Artifacts

| Role | Path | Inventory |
|---|---|---|
| Current candidate | `out/provided-candidate-completion-20261026-a1/Aux.app` | `2a215e7185b3c755380b01735d36121f078e1c1c81c8f2788d5d018f9c679132` |
| What that seal adds | Phase 1 native batch, Aux product logos (including the two `resources.pak` logo entries), multi-pane split metrics fix | On top of brand-sweep `e0228418`. Split repair receipt `combined-split-multipane-a1` records before-inventory `e1d68d96` |
| Fallback | `out/provided-candidate-local-completion-20261025-a38/Aux.app` | Last broad acceptance. Launch with its adjacent `Launch Aux.command` |
| Source selection | `docs/integration/proposed/completion-20261026/integrator/current-source-selection.json` | |
| Native checkout | `/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src` | Default in `scripts/aux_chromium.py`. `AUX_CHROMIUM_SRC` overrides it |

`scripts/native-build.py` only holds `/tmp/aux-build.lock` around the command it is given. It does not choose the checkout.

The older tree at `/private/tmp/aux-chromium-recovery-snapshot-20261023/src` was still on disk on 2026-10-27. Historical receipts and prepare scripts still name it. Builds use the durable checkout. On this date the reviewed sidebar file `chrome/browser/ui/views/frame/aux_sidebar_view.cc` was SHA256 `1fd991f83b88158b2df5424644efd5252267ba189b45a2e1791780afd0fa38e5` in both trees.

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
- After a browser abort the candidate daemon can outlive the browser and ignore SIGTERM and SIGINT. Seen when the split crash left the daemon up. Lifecycle fix not started.
- Split toolbar menu still offers upstream "Send Feedback". Left as supplied behavior for an owner decision.
- Shortcut-edit acceptance was not repeated on this seal. The validator source is in the linked Phase 1 batch.
- Sidebar popup lifetime: `desktop/popup-lifetime-rebase-a1` found no source change. The current snapshot already contains the A32 fixes and calls `RetireAuxProfilePopup` from `OnOrdinaryWindowClosing`. The real-app checks in that README were not run.
- Remaining Aside identifiers that stay until a versioned migration: `AsideNativeSwift` / `AsideNativeRun` and keychain group `8CPD4K4TBB.at.studio.AsideBrowser.cryptography` live in the immutable supplied addon and are remapped at runtime. `aside.*` storage keys are legacy migration readers. The `aside` scheme was removed in Phase 1.
- A future resource cohort must keep the PDF-ABI correction, the final-polish rules, and the brand-sweep rules. `current-source-selection.json` records `futureResourcesLackRules` for final-polish and brand-sweep.

Full pre-release. These external gates were not rechecked in this pause:

- General Bash/PTY/CLI REPL: Apple EndpointSecurity request `2H4D7KNGUP` has no approval on record. Generic filesystem draft (`728e4e108`) is unjoined.
- Official extension and 1Password autofill/companion. The companion needs an Apple-signed browser in `/Applications`. That signing is not authorized.
- Hosted services: last recorded production health was 404; `dev-cloud.getaux.co` was on Production; J5 has not been run; production deploy is not approved.
- ChatGPT plan usage: eligibility form not submitted.
- Operations: readiness, alerts, and rollback are not live. Legal facts under `integration/proposed/completion-20261026/integration/product-information/` are drafts.

Out of scope: backups, mobile, payments and Aux-funded inference, legacy migration, distribution, notarization, release, and a built-in Vault.

Owner decisions that gate later phases: signing for vendor pairing, how to proceed if Apple delays `2H4D7KNGUP`, submitting the ChatGPT eligibility form, approving the production deploy and the alert recipient, and whether the R2 token (around 2026-11-22) matters while backups stay deferred.

## Progress log

- 2026-10-27: Entry-point docs point here. Historical plans, the clean-room spec, and evidence receipts stay as dated records. See [docs/README.md](README.md).
- 2026-10-27: Paused at the owner's request. Docs aligned to seal `2a215e71`. Popup lifetime review recorded as no source change. Acceptance stopped.
- 2026-10-27: Native checkout copied to the durable path. Previous STATUS archived.
- 2026-10-27: Phase 1 native batch linked (`desktop/phase1-native-a1/actual-result.json`): daemon auth timeout/retry, `aside` scheme removed, `aux_profile_indicator_icon`, copyright strings, plus the shortcut validator and cold-input fixes already in the tree.
- 2026-10-27: Chromium product logos replaced (`desktop/product-logo-a1`). Phase 2 organization observations in `desktop/acceptance/actual-phase2-a1.json`. Restoring a 3–4 pane split aborted in split metrics; fixed in `desktop/split-multipane-metrics-a1` and observed on `2a215e71`.
