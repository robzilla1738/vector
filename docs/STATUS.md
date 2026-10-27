# Aux status

Last updated 2026-10-27. This page is the single current-state summary. The full dated history through 2026-10-26 is in [archive/status-history-through-2026-10-26.md](archive/status-history-through-2026-10-26.md); the working checklist is [ROADMAP-EXECUTION-GRAPH.md](ROADMAP-EXECUTION-GRAPH.md).

## Artifacts

| Role | Path | Inventory |
|---|---|---|
| Current candidate | `out/provided-candidate-completion-20261026-a1/Aux.app` | `d81855c4` (Phase 1 native batch on top of `e0228418` brand sweep) |
| Fallback (last broad acceptance) | `out/provided-candidate-local-completion-20261025-a38/Aux.app` | A38, launch with its adjacent `Launch Aux.command` |
| Source selection | `docs/integration/proposed/completion-20261026/integrator/current-source-selection.json` | |
| Native Chromium checkout | `/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src` (durable copy of `/private/tmp/aux-chromium-recovery-snapshot-20261023/src`) | |

## Working on the current candidate

Startup with the relinked PDF-ABI daemon, profile picker, session restore, attached-PDF `read_file`, memory search with citation, `get_time`, HEIC conversion, REPL Stop, device routine run/notify ("Runs on: This computer"), shortcut remap with palette hint, interruption recovery and clean menu Quit/reopen. Desktop journeys already observed: profile/window isolation, CLI destination, Peek, restored two-pane layout, Quick navigation/handoff, theme apply/cancel, sidebar/minimal, PiP, background CLI list/resolve, cold Cmd+L, full-page capture, global-pin unload/reload.

## Open

Local milestone:
- Chromium logo still shown on the profile picker and the session-restore infobar. Fix staged as `desktop/product-logo-a1`.
- Remaining Aside identifiers are classified as unchangeable: `AsideNativeSwift`/`AsideNativeRun` symbols and keychain group `8CPD4K4TBB.at.studio.AsideBrowser.cryptography` live in the immutable supplied addon (remapped at runtime); `aside.*` storage keys are legacy migration readers.
- Future resource cohort must retain the PDF-ABI, final-polish and brand-sweep rules.
- Remaining acceptance journeys: file content/rename/Undo, physical hover, organization/Spaces/cleanup, 3–4 pane split, BYOK full journey, REPL `aux.pdf`, site-rule routing, Finder launch without the workspace launcher.

Full pre-release (external dependencies):
- General Bash/PTY/CLI REPL: Apple EndpointSecurity request `2H4D7KNGUP` not approved; generic filesystem draft (`728e4e108`) unjoined.
- Official extension + 1Password autofill/companion: companion requires an Apple-signed browser in /Applications; not authorized.
- Hosted services: production health returns 404; `dev-cloud.getaux.co` alias on Production; J5 journey not run; production deploy not approved.
- ChatGPT plan usage: eligibility form not submitted.
- Operations: readiness/alerts/rollback not live; legal facts in `integration/proposed/completion-20261026/integration/product-information/` are drafts.

Out of scope: backups, mobile, payments/Aux-funded inference, legacy migration, distribution/notarization/release, built-in Vault.

## Progress log

- 2026-10-27: Native checkout copied out of `/private/tmp` to a durable location. Docs consolidated (this page; previous STATUS archived).
- 2026-10-27: Phase 1 native batch linked and resealed within the approved review (`desktop/phase1-native-a1/actual-result.json`): daemon auth timeout/retry, `aside` scheme removed, `aux_profile_indicator_icon`, copyright strings, plus the shortcut validator and cold-input fixes already in the tree. Startup, profile open, agent new-tab page and menu Quit observed; the authorization-failure log line is gone.
