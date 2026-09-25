> Historical snapshot, superseded by [the current handoff](../../HANDOFF.md). Claims and priorities below describe that earlier checkpoint.

# Aux local Mac handoff

Give this document to an AI on the founder Mac. It is the remaining work after
the software-only Aux stack landed on `main`. This is not completion of the
five-phase roadmap and not proof of B1–B7.

Related: [ROADMAP.md](../../ROADMAP.md) (the single current roadmap), [progress log](../../progress/2026-09.md),
[checkpoint history](../AUX-HANDOFF-2026-09-21.md),
[AUX-DESIGN-INSPO-ZCODE.md](../../AUX-DESIGN-INSPO-ZCODE.md),
[AUX-PRIVATE-BUILD.md](../../AUX-PRIVATE-BUILD.md),
[AUX-FIRST-REVIEW.md](../../AUX-FIRST-REVIEW.md).

## Current state
**September 23 shell follow-up:** the current refinement is documented in
[the design checkpoint](../../ui/design-update-2026-09-23.md). New profiles default to
horizontal tabs; stored choices survive. Session Projects are profile-local chat
folders, separate from runtime Projects and saved Tasks. The vertical expanded
sidebar remains a column; only collapsed edge reveal floats. The native input
fix covers page scrolling after URL reveal and sidebar/toolbar dragging.
Use the checkpoint pickup checklist when continuing. B1–B7 remain open; neither
this change nor local packaging establishes founder acceptance or signing.



**Update 2026-09-23 (3):** all roadmap workstreams are implemented, verified
and **merged to `main` via PR #23** (merge commit `553fd26`): BR-01–07
(browser), CH-01–04 (conversation), AI-01–07 (agent capability), WS-01–06
(projects/agents/cloud), ME-01–02 (memory), SK-01–02 (skills/schedules), plus
the TR trust/privacy and PL platform packages — see `progress/2026-09.md` for the
per-slice evidence. CI at merge: 5/5 checks green including the release smoke
suite on macOS. What remains genuinely open is the founder-Mac list below
(B1–B7) and the non-gated engineering items R1–R6 — not implementation gaps
in the roadmap itself.

Landed from PR 14 (`cursor/aux-remaining-implementation-4932`) onto `main`.
PR 13 remains an earlier handoff-only draft and is superseded.

### Implementation on main

- Aux browser/agent shell: spaces, tabs, profiles, private windows, conversation,
  task promotion, documents/results, values-only Excel with optional http(s) source
  hyperlinks.
- Locked agent vault with opaque `cref_` grants. `fillCredential` never batches
  secrets through shared IPC and never writes secret values into steps, observations,
  or results.
- Parameterized routines, occurrence identity, uncertain-write block, honest missed
  runs when the desktop is closed.
- Schema v1: consolidated tables with explicit foreign keys and the `aux_meta`
  marker. Pre-versioning and legacy databases are refused unchanged; newer schemas
  fail closed.
- Task-level logical action IDs hashed without run id, so the same write cannot be
  re-issued from a later run.
- Agent replace, resource access (`reference` / `read` / `write`; CLI/MCP cannot set
  write), task search (title/objective/criteria/labels, not locators), exportable
  receipts, honest local `tasks.verifyCriterion`.
- Legacy Vector data is preserved and refused fail-closed; canonical
  `persist:aux-*`, `@aux` packages and `aux_*` MCP identities.
- Backup list/retention/restore; incomplete folders skipped.
- MCP scoped catalog grouping/filter; Preview vs Console split; incident companion
  markdown local-only.
- Cloud reconnect status is local bookkeeping. GitHub / Vercel / Sentry inspection
  is GET-only.
- Download retry after restart is a new transfer (`canResumePartialDownload() === false`).
- After crash/restart, detached originals are missing: `runs.retry` requires a live
  replacement tab.
- A failed write does not migrate or replay remaining steps. Uncertain outcomes
  stay blocked until reconciled with evidence.
- Landed on main (PRs 17–21): green-main repair (renderer gate drift,
  conversation run-panel controls), oxlint in CI with a warnings ratchet,
  tracker/ad blocking + scoped HTTPS bypass + Chromium-family bookmark import,
  portable `aux-routine@1` routine export/import, an offline `--validate`
  self-check for the task benchmark harness, and this batch's docs updates.
  The CEF host probe is resolved — the shell stays Electron; macOS probe
  results are platform-independent (`experiments/cef-shell/README.md`).

### Current design: Aside parity with Aux branding

See [visual direction](../../AUX-DESIGN-DIRECTION.md) and [parity audit](../../ASIDE-PARITY.md).
The earlier ZCode treatment is superseded: current type is Geist/Geist Mono,
icons are Central Icons, and the brand assets are the arch SVG and silver native icon.

- **Palette:** reference neutral/alpha tokens; native Liquid Glass on macOS 26+,
  titlebar fallback, configurable sidebar tint and content opacity, solid alternative.
- **Tool cards:** summary-first step cards in conversation and the agent rail.
  Nested `fillCredential` with a left-border rail, redacted secrets, HTTP(S) chips
  open Aux tabs, absolute paths use `openPath`. Chat work history starts collapsed;
  Pause/Stop and attention states remain visible. One-shot entrance per `stepId`.
- **Sidebar:** `⌘S` toggles expanded ↔ fully closed, with no logo rail. The left
  edge reveals a floating sidebar. URL and adjacent controls reveal on hover/focus.
- **Chat:** optional task promotion lives under Options, successful replies avoid
  duplicate status text, and unsent drafts survive task promotion.
- **Packaging:** unsigned local previews have launched; signing, notarization and
  the seven-day pilot remain B7. No installed-app or distribution claim follows.

Visual founder acceptance and VoiceOver are still B4. Design polish is not Chrome
Web Store, 1Password, Apple Passwords, or passkey parity.

## Validate on the founder Mac

Use a fresh isolated profile. Do not use personal profiles or hunt for personal
credentials.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm --filter @aux/desktop typecheck
pnpm --filter @aux/desktop build
pnpm test:unit
AUX_LOAD_DOTENV=0 pnpm dev
```

Desktop typecheck force-emits unbundled main output: run the desktop build afterward
before launching Electron.

Optional isolated data:

```sh
AUX_LOAD_DOTENV=0 AUX_ENGINE=0 AUX_DATA_DIR=/tmp/aux-review AUX_PROFILE_DIR=/tmp/aux-review-profile pnpm dev
```

`AUX_LOAD_DOTENV=0` prevents loading `.env` keys into the founder session.
`AUX_ENGINE=0` keeps Chromium as the browsing backend for compatibility review.

Mock `?scenario=results` is not native permission, account, file, voice, or cloud
success. Node engines want `>=22.18.0`; a 22.14 warning does not fail tests.

## Remaining work that does not need the founder Mac

Ordered. Each is a normal engineering task, not an acceptance gate.

### R1 — `AI_GATEWAY_API_KEY` for real benchmark runs

The task benchmark (`tests/benchmarks/tasks/run.mjs`) ships manifest, scorer,
fixtures and an offline `--validate` self-check wired into `runtime.yml`. Real
runs need a provisioned `AI_GATEWAY_API_KEY` (org secret) and a paid model
budget. First action when the key exists: run the internal suite per planner
config, record numbers in `docs/BENCHMARKS.md`, then add Mind2Web /
WebVoyager-style public tasks.

### R2 — Planner quality spend (needs R1)

Model routing (cheap planner, `AUX_RECOVERY_MODEL` recovery), self-healing
refs, bounded replans, vision fallback, verifier quality — driven by the
benchmark numbers, not by feel. Includes the deep-research mode: sets already
fan out parallel members with a Results table, so a research preset is mostly
a planner + synthesis task, not new plumbing.

### R3 — Widevine / DRM license

Chromium builds lack Widevine CDM; Netflix/Hulu/Spotify-grade playback needs a
licensed CDM (Google Cast licensing program or Electron's shipped binary
caveat). Track whether the license is attainable before promising DRM
playback.

### R4 — Deferred daily-driver parity (Electron-capped) — mostly landed

BR-05/06/07 closed most of this list: password-store + bookmark/history/tab
import (Chromium-family, Arc, Firefox; Safari needs Full Disk Access),
cosmetic ad filtering (isolated-world stylesheet), in-place translation
through the configured model provider, and autofill/form-fill profiles all
ship. Still open:

- **Google Safe Browsing API integration** — downloads/phishing today get a
  local extension+scheme heuristic plus a confirm prompt, not reputation
  lookup. Needs an API key + service-terms decision.
- **Safari import without Full Disk Access** — currently a documented blocker;
  Safari bookmarks live behind TCC.
- **Platform passkeys / 1Password unlock** — needs the signed identity (B2).

### R5 — Warn-level lint debt (~400 findings)

`pnpm lint` enforces a `--max-warnings=390` ratchet. Largest classes:
jsx-a11y `prefer-tag-over-role` (~145), react-hooks `exhaustive-deps` (~43),
`set-state-in-effect` (~52), refs-in-render (~29), a handful of vitest
`valid-expect` false positives. Pay down by class; do not raise the cap.

### R6 — Distribution plumbing beyond B7

Auto-update channel (Squirrel/electron-updater or hosted delta), crash
reporting pipeline, and release-artifact provenance. The CI release jobs
already produce downloadable artifacts; they are unsigned and unupdated.

## Remaining work that requires the founder Mac

Do these in order. Software-only product work is already on `main`. Do not re-open
vault, routines, journal fencing, or the design token pass as missing.

### B1 — Founder SSO / MFA on real accounts

**Needs:** founder accounts, real IdP, this Mac.

**Do:** complete a real sign-in with popup/redirect, MFA, and session restore after
quit. Record the exact provider and outcome. Synthetic login fixtures are not this gate.

**Done when:** a real account signs in, MFA completes, cookies stay in the regular
profile, private windows stay empty of that session, and the founder accepts the
path. Failures are reported honestly, not papered over.

### B2 — 1Password / Apple Passwords / platform passkeys / signed app identity

**Needs:** signed Aux identity, real 1Password or Apple Passwords, Touch ID / iCloud
passkeys.

**Do:** attempt fill from the signed password manager and a platform passkey on a
real site. Virtual WebAuthn in CI is not this gate. Unsigned `pnpm dev` cannot prove
it.

**Done when:** the signed build fills from the real manager or passkey, or the
founder records a specific unsupported API. Do not claim parity from Electron APIs
or design polish.

### B3 — Chrome Web Store / full extension API parity

**Needs:** Web Store install path or a documented host that is not CEF Alloy.

**Do:** install a real Web Store extension, prove the APIs it needs, keep extensions
out of private windows. Managed unpacked MV3 copies already exist and are not this
gate.

**Done when:** a real Store extension installs, updates, and runs the APIs Aux
claims, without Alloy website content. **CEF Alloy remains rejected.** If a
Chromium browser-layer host is pursued, it must keep the React shell, native tab
lifecycle, trusted bridge, and profile separation, and prove tab/sidebar
controllability before any profile migration. Stop rather than substitute Alloy
for website content.

### B4 — VoiceOver and visual founder acceptance

**Needs:** founder eyes and VoiceOver on this Mac.

**Do:** VoiceOver through sidebar, conversation, agent rail, Settings, takeover,
needs-input, and live tool cards. Visual pass of dark/light, expanded/hidden/hover-peek
sidebar, 1024 / 1280 / 1512 conversation widths.

**Done when:** the founder accepts or files concrete defects. CSS unit checks and
mock screenshots are not this gate.

### B5 — Native TCC, pickers, and layout walkthroughs

**Needs:** macOS permission dialogs on this Mac.

**Do:** microphone (and camera if reviewing conferencing), native screen-share
picker, Open File, download-folder picker, print/PDF, crash/restart with a live
replacement tab. Cross-window transfer and extension × media × private combinations
have code; they need an isolated-profile walkthrough.

**Done when:** each dialog is the real OS prompt, decisions persist in Site
permissions, private windows do not inherit regular grants, and picker titles match
the product. Synthetic media fixtures are not TCC proof.

### B6 — Paid cloud mutation and remote takeover

**Needs:** explicit founder authorization plus paid GitHub / Vercel / Sentry / cloud
provider accounts.

**Do nothing until that authorization exists.** Current Connections inspection is
GET-only. Cloud reconnect status is local bookkeeping. Remote browser takeover is
unavailable. Provider-side spend budgets and hosted deletion schedulers are
unavailable.

**Done when:** the founder authorizes specific write APIs, each mutation is
reviewable and reversible, and Aux never silently pushes, opens a PR, deploys,
promotes, files an issue, or takes over a remote browser.

### B7 — Packaging, signing, notarization, seven-day pilot

**Needs:** Apple signing identity, notarization, a seven-day founder pilot.

**Do:** signed/notarized Aux Browser.app, launch from `/Applications`, seven days of
real browsing and tasks on an isolated profile.

**Done when:** Gatekeeper accepts the signed app, TCC prompts name Aux, B2 passkeys
can be re-attempted on that identity, and the founder finishes the pilot notes.
`pnpm package:local` is not this gate.

## Do not

- Import ZCode `packages/ui`, clone ZCode’s product, or turn Aux into an IDE/TUI.
- Revive CEF Alloy as the website content host.
- Claim Chrome Web Store, 1Password, Apple Passwords, or passkey parity from
  unsigned builds or design polish.
- Hunt for personal credentials, `.env` secrets, password-manager vaults, or cookie
  databases. Use isolated `AUX_DATA_DIR` / `AUX_PROFILE_DIR`.
- Copy Chromium Cookies, Login Data, Web Data, or similar stores. They stay in
  place (`profileBackupAction` is `refuse`).
- Perform unauthorized remote mutation: no GitHub push/PR, Vercel deploy/promote/
  rollback, Sentry issue write, or remote browser takeover.
- Weaken tests or policy to greenwash CI.
- Treat local `tasks.verifyCriterion` or routine alerts as business-outcome proof.
- Journal human address-bar `pages.navigate` as agent writes.
- Batch `fillCredential` through shared IPC or render secret values in tool cards.
- Merge spaces/workspaces by name. IDs stay distinct.
- Let CLI/MCP set resource `write` access.
- Fake B1–B7 complete.

## Code map

| Area | Where |
| --- | --- |
| Shell, drafts, conversation | `apps/desktop/renderer/src/App.tsx`, `store.ts`, `components/Conversation.tsx`, `AgentRail.tsx`, `QuickAsk.tsx` |
| Tool cards / steps | `components/StepTimeline.tsx`, `RunPanel.tsx` |
| Sidebar / hover peek | `components/Sidebar.tsx`, `sidebar-mode.ts`, `styles.css` |
| Tokens / type | `tokens.css`, `ui-font-size.ts`, `docs/AUX-DESIGN-DIRECTION.md` |
| Vault / fillCredential | `apps/runtime/src/services/vault.ts`, `execution/executor.ts`, `services/pages.ts` |
| Journal / leases | `apps/runtime/src/store/{repo,db}.ts`, `DurableWriteLedger`, schema 13 |
| GitHub/Vercel/Sentry GET | `apps/runtime/src/services/settings.ts` (`fetch` with no method; `serviceJson`) |
| CEF experiment (rejected as product) | `experiments/cef-shell/README.md` |
| Downloads | `apps/desktop/main/download-retry.ts` |
| Private shell | `apps/desktop/main/private-main.ts`, `browser-profiles.ts` |
| Compatibility claims | `docs/AUX-COMPATIBILITY.md`, `docs/AUX-BROWSER-COMPATIBILITY.md` |

## How to know an item is done

- B1–B7: founder-recorded outcome on this Mac, not a unit test or screenshot from
  another machine.
- Design: waiting chips share `--wait`; diffs/find do not reuse status green/red;
  collapsed sidebar still has a reopen control; secrets never appear in step cards.
- Policy: new GitHub/Vercel/Sentry calls stay GET unless B6 is explicitly authorized;
  Cookies/Login Data remain `refuse`; CEF Alloy is still not the content host.

## CI audit follow-up (2026-09-23)

See [CI operations](../../ci.md). The pipeline now includes native design regressions,
SHA-pinned maintained Actions, explicit read-only permissions, manual/merge-group
triggers, retained benchmark/design artifacts and an aggregate `CI passed` gate.
Integration serialization is enforced at the CLI. Native release fixtures now
explicitly select expanded vertical layout where their assertions require it.
Previous-turn context controls were restored after the release smoke exposed
their removal; native blank-area dragging now excludes disclosure summaries and
labels. Main now requires the aggregate check from the GitHub Actions app, with strict
up-to-date checks, resolved review threads and no force push/deletion. Admin
bypass remains available for explicit owner pushes; no second-person approval
is required. Actions SHA pinning is enforced and merged branches auto-delete.

Local validation: actionlint, typecheck, lint (388 warnings / cap 390), 1,029
unit tests, 27 serial integration tests and the repaired native fixtures passed.
Hosted Linux/macOS unit, integration and Electron e2e checks passed during this
audit. The release/design runs exposed fixture assumptions, async timing and
shutdown issues that were repaired. **Check the latest exact SHA's hosted run
before calling the whole pipeline green**; earlier green jobs do not qualify a
later commit. No failing check was removed or made optional.
