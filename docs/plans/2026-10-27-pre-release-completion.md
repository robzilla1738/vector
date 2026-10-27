# Aux: plan to full pre-release

## Context

Aux is the supplied Aside browser rebranded and isolated as Aux. The current candidate, `out/provided-candidate-completion-20261026-a1/Aux.app` (seal `2a215e71`), launches, restores, splits and quits. The repo was cleaned on 2026-10-27, and `pnpm test` passes 406 tests. Before the owner paused work, a lot was built but little was formally accepted. Of the 29 desktop requirements, only R19 and R21 have been seen working on this seal, and none is formally accepted. Several external gates (Apple, OpenAI, 1Password, production deploy) haven't moved since Oct 26.

The owner wants one plan to "complete and excellent" in large batches, without over-testing.

**Owner decisions (2026-10-27):**
- **Finish line:** full pre-release. Distribution, notarization, public release, backups and mobile stay deferred.
- **Identity:** the versioned Aux identity migration is in scope.
- **REPL:** finish the Bash/PTY/CLI REPL source now. Apple's `2H4D7KNGUP` approval gates only its activation.
- **1Password:** one local Developer ID signing of an Aux build is allowed, installed in `/Applications`, for the pairing test only.
- **Feedback menu:** remove upstream "Send Feedback" from the split toolbar menu.

## Where Aux stands

| Area | State | What's left |
|---|---|---|
| Startup / quit / split restore | Seen working on `2a215e71` | Daemon outlives the browser after an abort and ignores SIGTERM/SIGINT |
| Desktop R01–R30 (no R20) | R19 and R21 seen; R01, R03 and R14 partly seen; the rest never run on this seal | One real acceptance pass |
| BYOK / memory / files / tools | Passed on earlier seals only | Full Muse journey and REPL `aux.pdf` on the current build |
| Build reproducibility | A fresh `stage:provided` fails: revisions stop at 33, the candidate is 36. Chromium can't be rebuilt from the repo: the 102-patch series lacks every completion delta, and the setup tool is gone | Port the deltas, review the revision, export the patch series, restore the apply script |
| Identity | Visible branding is Aux. Wire bytes, HKDF domains, DOM globals and memory/task IDs are still Aside. The supplied native addon has 1,228 `AsideNative*` symbols and a hard-coded keychain group | Versioned migration, in two halves |
| REPL | Runtime lane commits exist and the generic filesystem is compiled, but nothing is activated. `node-pty` loading isn't ready, and the ES observer isn't wired before Node | Finish the source; activate once Apple approves |
| Hosted (`services/aux-cloud`) | Production deployment is stale; `dev-cloud.getaux.co` is bound to Production; public info pages return 404; J5 not run; no rollback ID | Owner approvals, then deploy and J5 |
| Ops | No monitor, alert recipient, operator or rollback | Set up after the deploy |
| ChatGPT plan | Adapter and request draft ready; form not submitted, 5 fields null | Owner submits, then OpenAI decides |
| 1Password | Generic native-messaging fixtures pass; pairing needs a signed app in `/Applications` | Local signing, plus native-host cleanup |
| Legal | Privacy and terms drafts; about 20 facts missing | Owner supplies the facts |

Two doc contradictions to fix:
- Was the legal `confirmed-facts-routes.patch` applied?
- `selected-repl-fs`: the PAUSE note says "unjoined", but the checkpoint says compiled.

## Start now: owner actions with lead time

These run alongside the batches. Nothing on the agent side waits on them until Batch 4.

1. **ChatGPT eligibility form.**
   - Fill the 5 null fields in `chatgpt-eligibility/request.pending.json`: reply contact, distribution channel, audience and rollout, OpenAI representative, supporting material.
   - Settle the open-source vs commercial status.
   - Submit the form.
2. **Apple `2H4D7KNGUP`.** Follow up. Ask whether coverage extends to the browser's early observer, not just `dev.aux.browser.daemon`.
3. **Hosted approvals.** Fill these fields in `cloud-activation/approval-record.pending.json`:
   - Approve the staged production deploy.
   - Choose the service operator, alert recipient (is it `hello@getaux.co`?) and monitor provider.
   - Confirm the Clerk/Resend pairing.
4. **Legal facts.** Supply the missing terms and privacy facts listed in `integration/product-information/`, for example governing law, retention periods, age rules and analytics.
5. **Developer ID signing.** Confirm the identity to use for the one local 1Password signing.

## Batches

Each batch ends in one combined native build (under `scripts/native-build.py`) and one candidate seal. Worker lanes use worktrees under `aux-worktrees/`. One integrator owns the manifests, builds and STATUS.

### Batch 1: Reproducible pipeline + local fixes (two parallel lanes)

**Lane A: pipeline**
- Fold the completion repair deltas into the stage transforms (`vendor/provided/*-stage.mjs` and `daemon-adapter.mjs`). Then a fresh `pnpm stage:provided --source-snapshot …` reproduces the candidate's Agent `1.26.1016.1888` files.
- Record the revisions in `vendor/provided/agent-revisions.json`.
- Un-skip `scripts/lib/provided-ui.test.mjs` and fix its 1852 version assertion.
- Export the durable checkout's native changes into `chromium/patches/` as new series areas. That covers the phase1, split-menu, multipane, logo and browser-policy patches; decide whether to keep or drop the never-applied 0106/0107.
- Restore a small fetch/apply script, then prove a replay onto clean upstream 155.0.8059.85 matches the durable tree byte for byte. Don't do a full clean build yet: the Batch 2 build exercises the series.

**Lane B: local corrections**
- **Daemon lifecycle:**
  - Daemon side: a count-checked transform in `vendor/provided/daemon-adapter.mjs` makes the daemon exit when its parent dies (a lifeline pipe or kqueue NOTE_EXIT) and puts a time limit on SIGTERM.
  - Browser side: `chrome/browser/aux/daemon_supervisor.cc` reaps a stale owned daemon, matched by PID, path and creation time, before launching.
- Remove "Send Feedback" in `split_tab_menu_model.cc` (`chrome::CanShowFeedback` block).
- Native-host reservation producer, startup consumer and process/pipe cleanup (needed for 1Password later).
- Carry the PDF-ABI, final-polish and brand-sweep rules into the resource cohort rules, which clears `futureResourcesLackRules`.
- Fix the two doc contradictions in STATUS.

**Lane E (starts here, runs through Batch 3): REPL source, inactive**
- Load PTY as a fixed built-in instead of `require('node-pty')`.
- Start the descendant ES observer before Node, refusing to run if its event stream is lost.
- Add the exec/PTY owner-reservation hooks and the single-reaper/descendant-cohort joins.
- Make the paired browser-side change.
- Rebase the runtime-lane proposals onto the actual signed addons.
- Land all of it compiled and gated off. The tools keep returning honest disabled-capability errors until activation.

**Exit:** one combined build carrying Lane B, and fresh stage + check passing from the repo.

### Batch 2: Identity migration, part 1 (wire + state, everything except the native addon)

This follows `docs/plans/2026-10-22-complete-aux-identity.md` and the table in `aside-contract.md`.
- **Wire/protocol v1:** rename `AuxDaemonSessionToken`, `AuxSessionToken`, `aux.daemon.auth.`, the 19- and 23-byte challenge strings, `aux-daemon` health and `Aux.*` commands. Change the browser, daemon, Agent, CLI and every byte-length calculation in one cohort.
- **State v2:** version the native preference keys and encrypted blobs under new Aux HKDF domains. Add legacy readers for old ciphertext; never re-decrypt it under a renamed domain, and never reset.
- **Remaining audit items** (`aux-remaining-identity-audit/README.md`): `__aside*` DOM globals, `aside_dom`, memory runtime IDs, task IDs, Trusted Types policy names, routine path `/aux/routines/v2`.
- **Proof:** fixture tests for the migration, and old-format state refused or read without mutation.
- No UI, CSS or geometry change.
- **Why now:** the wire and state rename touches nearly every component, so it lands before the big acceptance pass. That way the pass runs once.

### Batch 3: The one local acceptance campaign → **Local product handoff**

Run on one candidate (Batches 1 and 2 sealed), with two disposable profiles and two same-profile windows, `--use-mock-keychain`, Aux frontmost and real input. Group the journeys into about three sessions:
1. **Lifecycle and organization:**
   - Finder launch without the workspace launcher, fresh setup, and profile/note isolation (R07).
   - Spaces with icons and wheel switching, nested and pinned folders, collapse and order (R01–R04, R06).
   - Site-rule routing (R27), CLI open/list/resolve (R28).
   - Quit/reopen persistence of Spaces, theme and remap, plus one interruption/recovery.
   - An abort followed by a check that the daemon exits (verifies the Lane B fix).
2. **Windows and UI:**
   - Full URL (R08), docked and auto-hide sidebar (R09), minimal mode (R10), sidebar navigation (R11), theme editor (R12), motion (R13).
   - Cmd+K/T/L and shortcut edits (R14–R15), Peek (R16), Quick Window (R17).
   - Restored 3–4 pane split (R21), PiP (R26), DevTools (R29), capture (R30).
   - Protected close prompt.
3. **Files and AI** (Muse `muse-spark-1.3-contributor` only, ≤$1, credential entered through the product UI and removed afterward):
   - Downloads: rename (R22), collision, drag, recent files (R25).
   - Text/image/PDF/HEIC context.
   - Tidy (R05), @ tab references (R23), page actions and search (R24).
   - Memory search with citation, REPL `aux.pdf`, cancel/restart.
   - Device routine with notification.

Collect every defect, fix them all in one native build, then **re-run only the failed journeys**. Record the results in `desktop/acceptance/` and STATUS. That completes the **Local product** milestone. R18 (extensions) moves to Batch 5.

### Batch 4: Identity migration, part 2 (native addon + keychain group)

This is the critical path and the hardest piece.
- Replace the remaining `AsideNativeSwift`, `AsideNativeRun` and `AsideNativeFree` symbols and the hard-coded `8CPD4K4TBB.at.studio.AsideBrowser.cryptography` group. Use the reviewed `native-addon-identity-recovery` path, or rebuild the addon from its source if that turns out cleaner.
- Add a versioned keychain migration with a legacy reader. No credential deletion, no owner Keychain access.
- This needs a signing review, because it changes signed addon bytes.
- **Verification is focused, not a rerun of Batch 3:** startup, daemon auth, BYOK credential save/read/remove, quit/reopen, and old-state legacy read. These are the only journeys this boundary touches.

### Batch 5: External gates (as approvals arrive; each item independent)

- **Hosted:**
  - Do a read-only schema comparison.
  - Keep `dev-cloud` on Production, and move `app.`, `api.` and `share.getaux.co` explicitly.
  - Stage the deploy, with a hold/resume on the maintenance cron.
  - Fix the 404 public info pages with the final legal copy.
  - Run J5 once (11 steps, two disposable accounts), which includes feedback step 9a.
  - Then set up the readiness monitor (every 5 minutes, alert after 2 failures), an error alert and a recorded compatible rollback ID.
- **1Password:**
  - Developer ID-sign one local Aux build. Record this in AGENTS.md as a scoped, one-time exception.
  - Install it to `/Applications`.
  - Install the official extension, fill one dummy login from a disposable vendor account, and pair the desktop app.
  - Check isolation between the two profiles. This accepts R18.
- **ChatGPT:** once OpenAI issues a client ID, wire it into `vendor/aside/shims/aux-chatgpt.cjs`. Then run sign-in and consent, one separately authorized inference, refresh and revoke.
- **REPL activation** (when Apple approves):
  - Make the daemon-only entitlement/profile change and the v11 signing/resource delta.
  - Run the six journeys: one Bash command, yield/cancel, PTY input/resize/exit, escaped descendant, session revocation, normal Quit.

### Batch 6: Pre-release closeout

- Final combined candidate.
- One packaged identity audit: every delivered name, endpoint and identifier is Aux, apart from the `aside` HTML element and legal notices.
- Clear the STATUS open list, and update the README, AGENTS.md identity section and the contract table. The "Aux target" column becomes the current state.
- Remove worktrees whose commits are delivered.
- **Full pre-release** is declared only when every Batch 5 gate has real evidence. Any gate still waiting on Apple or OpenAI stays named as open; none is claimed.

## Order and parallelism

```
Owner actions ─────────────────────────────────────────────► (feed Batch 5)
Batch 1 [A ∥ B] → Batch 2 → Batch 3 (Local product) → Batch 4 → Batch 6
Lane E (REPL source) ─────────────── runs Batch 1→4 ───────► activation in Batch 5
Batch 5 items start as soon as their approval lands (hosted can start after Batch 1)
```

## Testing policy (to avoid over-testing)

- `pnpm test` on every change (required by AGENTS.md), plus one focused check for the boundary changed.
- One disposable real launch per native batch, covering only what that batch changed.
- The full journey campaign runs **once** (Batch 3). It's placed after the wire/state migration so it isn't invalidated by it. Later batches re-check only the journeys their boundary touches.
- After fixes, re-run only failed or invalidated checks. No repeated broad audits, no twenty-task AI suites, no hash re-verification of unchanged leaves.

## Critical files

- STATUS, contract and rules: `docs/STATUS.md`, `docs/ROADMAP-EXECUTION-GRAPH.md`, `docs/design/aside-contract.md`, `AGENTS.md`
- Pipeline: `vendor/provided/agent-revisions.json`, `vendor/provided/daemon-adapter.mjs`, `vendor/provided/provider-launch-stage.mjs`, `scripts/stage-provided.mjs`, `scripts/lib/provided-ui.test.mjs`, `chromium/patches/series`, `chromium/BUILDING.md`
- Native (durable checkout): `chrome/browser/aux/daemon_supervisor.cc`, `chrome/browser/ui/tabs/split_tab_menu_model.cc`
- Delta flow: `docs/integration/proposed/completion-20261026/integrator/{current-source-selection.json,counted_projection.py,build-browser.py,build-daemon.py,prepare-resource-delta.py}`
- Identity: `docs/plans/2026-10-22-complete-aux-identity.md`, `.../integration/final-identity/`, `docs/integration/proposed/aux-remaining-identity-audit/README.md`
- REPL: `.../runtime/*` (selected-repl-fs, fixed-pty-linked, exec-*), `.../integrator/endpoint-entitlement/`
- External: `services/aux-cloud/`, `.../integration/{cloud-activation,chatgpt-eligibility,product-information}/`, `docs/integration/external-password-manager-vendor-readiness.md`, `vendor/aside/shims/aux-chatgpt.cjs`

## Verification (end to end)

- **After Batch 1:** a fresh stage + `pnpm check:provided` passes; the patch replay matches the durable tree; a forced browser abort leaves no daemon running.
- **After Batch 3:** every R01–R30 (except R18 and R20) and every local STATUS journey has a recorded result on one seal.
- **After Batch 4:** focused keychain/auth/BYOK checks pass, and legacy state is read without mutation.
- **After Batch 5:** J5 receipt; 1Password fill and pairing receipt; ChatGPT and REPL receipts if approved.
- **After Batch 6:** packaged identity audit is clean.

## Progress (2026-10-27)

- **Batch 1: done.**
  - Durable checkout reconciled and building; `chromium/tree/` is the complete verified delta (replaces the patch series).
  - `/private/tmp` inputs are preserved, and the repair executor is re-rooted.
  - "Send Feedback" is removed.
  - Daemon lifecycle fixed: a bounded peer-loss shutdown, and `/shutdown` waits for its session token.
  - The broker admits in-flight writes until producer stops settle, and the memory close waits for in-flight requests.
  - Interrupted helper leases are recoverable.
  - `scripts/verify-candidate.py` checks the repair chain. Lane A's stage-port was dropped by decision: the candidate is the A38 base plus the receipt chain, and the fresh-stage pipeline is its predecessor.
- **Batch 2: already done in the candidate** (audit). Wire protocol and key domains are Aux. The last extension brand string was removed.
- **Batch 3: blocked.** No way to drive the UI in this session: no computer-use tools, no assistive access, no Screen Recording.
- **Batch 4: done for delivered code.** The supplied addon and its carrier were unreachable (the selected native route owns installation authority) and are removed; no `AsideNative` symbol remains. Internal Keychain item names (`aux.<scope>.aside.*`) and the boundary's original-group constant need a Keychain data migration, which needs owner approval.
- **Batch 5:**
  - REPL: source complete, rebased onto the current seal (browser overlay, daemon JS with every rule, main with the peer-loss bound, which compiles) and inactive; waiting on Apple.
  - Hosted service: green locally (63/63, after fixing a stale BYOK test); source pins refreshed for the deploy review; deploy steps need owner approval.
  - 1Password: needs an identity choice, a vendor account and UI access.
  - ChatGPT: needs the form submitted.
  - Legal: needs the missing facts.
- **Batch 6:** STATUS, AGENTS.md, the contract and README updated to the current seal `3b9f9b68`; `scripts/verify-candidate.py` passes.
