# Aux excellence audit and plan

> **Superseded:** the [finish plan](../ROADMAP-EXECUTION-GRAPH.md) replaces this page wherever they disagree. It stays for its decisions and history.

2026-10-27. Item-by-item status as of 2026-10-28 is in [2026-10-28-release-audit/](2026-10-28-release-audit/) and the [release readiness checklist](2026-10-28-release-readiness.md). Read-only review of the whole product: the native browser (Chromium delta), daemon and runtime, extension UI and branding, the hosted service, and the repo, pipeline and docs. Five parallel reviews, with the most consequential findings checked directly (marked **✓ verified**). Nothing was changed. Live layout review was limited to the first screen, because UI control (Accessibility/Automation) is still not granted.

## Verdict

The core is solid in places that matter: every hosted query is scoped to the user (no IDOR found), CDP and daemon auth are sound, telemetry is genuinely off, the wire protocol and key domains are Aux, and shutdown and crash recovery now work. But Aux is **not yet excellent or release-safe**. Six things block that outright:

1. **Every build encrypts cookies and saved data with a fixed mock key.** `use-mock-keychain` is forced on all processes. **✓ verified** `chrome_main_delegate.cc:1326`
2. **The release build flags produce the retired shell, not Aux.** `flags.release.gn` imports `flags.fast.gn`, which sets `enable_aux_shell=true` and never enables the browser. **✓ verified**
3. **The candidate is a dev-cloud build.** The daemon points at `https://dev-cloud.getaux.co` (9 references), its CORS accepts that remote origin, and a history-sync worker posts browsing history rows to `/sync/history/sources`. **✓ verified**
4. **Drive sync is broken on the hosted service.** The recovery router's `use('*')` leaks its 16 KiB body limit, 30-per-minute rate limit and device-only rule onto every route mounted after it, so drive sync fails for files over about 12 KB. **✓ verified, and reproduced by the reviewer**
5. **Aside branding still ships inside images and videos.** The sign-in hero videos, the browser-import art, Channels, the mini popup and the CLI illustrations all carry it. **✓ verified** Text sweeps can't see it. There is also a live link to Aside's Discord.
6. **The candidate's definition lives only on one disk.** 29 of 67 pins, the A38 base, `live-inputs` and keys exist only in ignored `out/`, with no off-machine copy.

## Corrections to the record

- **`node-development/index.mjs` never runs.** Its first statement throws ("generation 2 is quarantined"); the daemon runs `aux-native-entry.mjs`. **✓ verified** So the earlier "JS lifeline is ineffective, `process.exit` doesn't work" conclusion was wrong: that edit was only in `index.mjs`. The native peer-loss fix stands. Later fixes worked because they also patched the entry.
- **Reproducibility is overstated.** `verify-candidate.py` confirms the candidate matches its receipts, but nothing rebuilds it. `chromium/tree` has never been applied to a clean checkout, and Framework receipts aren't tied to the tree manifest.
- **Docs drift.**
  - AGENTS.md and the contract still say `provided-native.node` remains (it was removed).
  - STATUS mixes "open" and "fixed" for the Quit races and has stale pin counts.
  - ROADMAP, ARCHITECTURE, chromium/README and BUILDING still describe the patch series or old seals.
- **`pnpm test` depends on `/private/tmp`.** `vendor/provided/aux-productivity-account-lifecycle.test.mjs` reads `/private/tmp/aux-offline-runtime-source-20261023/index.mjs`, which wasn't preserved. **✓ verified**

## Decisions (owner, 2026-10-27: take the recommendations)

The owner chose the recommended option for every decision below. Two still need the owner's own action: D11 needs a backup destination, and D12 needs the OS permission grants.

| # | Decision | Recommendation |
|---|---|---|
| D1 | Should the shipping build be local-only or talk to `dev-cloud`? Should browsing-history sync exist at all? | Local-only build until the hosted deploy is approved. History sync off and opt-in. |
| D2 | Should Aux use the real macOS Keychain for browser secrets? (This touches Keychain at runtime.) | Yes. A mock key in a user build is not acceptable. |
| D3 | Should cookie backup and server-held sync keys ship? If so, the privacy page must say the operator can decrypt. | Defer cookie backup. Keep sync keys device-bound and disclose them. |
| D4 | Delete or just fence the billing, Stripe and hosted-AI code (service and UI)? | Delete it, keeping compatibility stubs. |
| D5 | "Send Feedback" exists in the settings sidebar, the new-tab menu and the chat session menu. | Keep one entry, wired to the Aux feedback route, and remove the rest. |
| D6 | Remote Control and relay ("Pro plan" copy): in scope? | Out of scope for launch. Hide the copy. |
| D7 | Should Info.plist show the version as 155.0.8059.85 and "Copyright The Chromium Authors"? | Product version 1.26.x, Courson Digital copyright, Chromium credit kept in About/legal. |
| D8 | Should the extension UI be English-only inside a localized browser? | Pin the extension to English for launch. |
| D9 | On account deletion, should the Clerk user be deleted and the email allowed to register again? | Yes. |
| D10 | Who handles share abuse reports and takedowns? | hello@getaux.co plus an operator revoke script. |
| D11 | Make an off-machine encrypted backup of the critical `out/` contents and git (outward-facing)? | Yes, to a destination you choose. |
| D12 | Grant Accessibility and Automation so the live UI and layout pass can run? | Yes. It is required for real parity and layout review. |

## Phases

The phases are ordered by risk. Each one ends in one native build (if needed), one reseal, one focused real launch, and `pnpm test` plus the hosted tests. The full journey pass runs once, in Phase 7.

### Phase 0: Safety net (no product change)
- Copy `/private/tmp/aux-offline-runtime-source-20261023` into `out/live-inputs` and repoint the test. (S)
- Off-machine encrypted backup of the snapshot, A38, candidate receipts, live-inputs, keys and the git bundle, with a hash manifest committed. Needs D11. (S)
- Fix the doc drift: AGENTS and contract identity, STATUS consistency, ROADMAP, ARCHITECTURE, chromium/README, BUILDING, .gitattributes, the plan's context line. (S)

### Phase 1: Release and privacy blockers
- Base `flags.release.gn` and `flags.fast.gn` on `flags.aux.gn`. Add GN asserts: shell and browser are exclusive, and the release build is the browser. (S)
- Remove the forced `use-mock-keychain`. Keep it only behind an explicit dev switch and the launcher. Needs D2; its runtime check touches Keychain. (S, plus approval)
- Make the candidate local-only: `resolveCloudServicePolicy({})`, remote origins out of daemon CORS, history-sync worker off unless opted in. Needs D1. (M)
- Narrow daemon-trusted UI origins to the extension and the daemon's own origin; today any `localhost:*` counts. (S)
- Hosted service:
  - Scope the recovery and inference middleware to their own paths, and add a full-app route composition test. (S)
  - Complete account deletion: Clerk user, anonymized row, bindings, attachments, shares and avatars, with a test that checks every table. (M)
  - Require device-bound sessions for `/sync/key/*`, `/drive/*`, `/sync/agent-files/*` and `/sync/sessions*`. (M)
  - Fault-isolate the maintenance cron per step and per user, with logging. (S-M)

### Phase 2: Brand and scope correctness (user-visible)
- Retouch the label text in the six Aside-labeled rasters and videos, keeping their geometry. Add an OCR step to the identity audit and re-pin the baseline. (M)
- Discord link: remove it or point it at Aux. Hide Docs and Community until app.getaux.co serves them. Replace or hide the `127.0.0.1:9/aux-unavailable` install command and the channel help links, which also have a stray `}`. (S)
- Sweep Chromium-branded strings in the component `.grdp` files: about 45 English strings say "Chromium" (similar in each locale), and about 360 say "Chrome". Reword the reachable ones first: omnibox pedals, settings, incognito, SSL. (M)
- Replace the chrome://version Chromium logo and favicon (`version_ui_scaled_resources.grdp`). Make the Help menu stop opening support.google.com/chrome and google.com/chrome/tips. (S)
- Payments and scope leftovers:
  - Guard the billing route with `beforeLoad`.
  - Remove "Plan & Usage", credits and referral entries from settings search.
  - Gate the referral and "Aux Pro" rows and the Developers "Pro plan" copy on `AUX_LAUNCH_POLICY`.
  - Reword the Vault/Password Manager text in the recovery flow. (S)
- Guard the `/artifact-test`, `/error-test` and `/liquid-glass-playground` routes; `artifact-test` contains Korean "Aside" text and hot-links. (S)
- Disable Google-only features via feature defaults rather than porting them: Glic/Gemini, AI overlay, iOS promo, sign-in/sync promos. Then remove the profile-switch guards that exist only for them. (M)
- Apply D5 (feedback), D6 (Pro/relay copy) and D7 (Info.plist). Standardize naming: "Aux" and "Aux Daemon", one form each. (S)
- Hosted public pages: rewrite privacy, terms, docs and community from the confirmed `proposed-decisions.md`, disclosing key custody per D3. (S)

### Phase 3: Robustness and responsiveness
- **Shutdown, always bounded:**
  - The JS shutdown gets one overall budget, then exits with status 75, so a single failed stage no longer leaves a 503-only daemon.
  - The native drain deadline tracks whether the parent is alive, not flags frozen before the loop.
  - Both deadlines are measured from the first peer loss, cutting crash exit from about 21 s to about 10 s. (S)
- **Daemon supervisor:**
  - Bounded backoff recovery from `kFailed`, and a deadline on the native-signature loop.
  - A visible "agent unavailable / retry" state in the UI.
  - Health polling backs off from 250 ms to about 5 s once Ready.
  - Cache the selected route instead of 23 syscall-heavy reads on the UI thread. (M)
- Move native-messaging `Capture()` off the UI thread (it can freeze the UI for up to 4 s per connect). Queue host launches until the daemon is ready. Document the fork/exec sandbox policy. (M)
- Replace nested `RunLoop`s and sleep loops in startup and shutdown (`browser_platform.cc:141,254`, the shutdown drain, native messaging close) with async deadlines. (M)
- Memory-helper census: match the recorded install path or state home, and treat zombie processes as gone. Today another Aux install or a zombie blocks recovery. (S)
- Smaller items, each (S):
  - CDP: cap challenges per peer.
  - Ignore provider keys inherited from the environment in the packaged daemon.
  - `loadBinding` returns null again on error, matching the supplied contract.
  - Strip the embedded Aside PostHog key.
  - Downgrade the `LOG(ERROR)` debug traces in the palette and profile switch.

### Phase 4: Remove dead code (smaller, clearer, safer)
- **Native:**
  - Delete the retired shell: `chrome/browser/ui/aux/**`, `webui_browser`, 275 `ENABLE_AUX_SHELL` sites and GPL filter lists. That is about 466 files and 317k lines, roughly 25% of the delta. (L)
  - Delete the legacy carrier/direct-daemon route: `RunCarrier`, carrier custody, `#else` branches, `aux_accepted_development_startup.h`, and `[[maybe_unused]]` shutdown reports. (M)
  - Delete the Vault passkey broker, `aux_credentials_api` and its `content/` hooks. (M)
- **Package:** delete `libaux-native-boundary.dylib` (nothing loads it), `aux-native.cjs`, the guard and probe `.cjs`/`.node` files, and the env-gated load-only branch. That retires the last Aside Keychain strings without a Keychain migration; confirm with one launch. Also shrink `index.mjs` to a stub (12 MB of dead weight). (M)
- **Service:** delete billing/Stripe, hosted inference, image and speech code per D4, keeping stubs. (M)
- **Repo:** delete 11 unreferenced scripts, the unused `aux-cdp-gate.mjs`, duplicate `AuxDevelopmentWorkerHost` copies and the empty `chromium/patches/`. (S)

### Phase 5: Engineering system
- `verify-candidate.py`: recompute the full inventory digest, use the executor's inventory helper, make pins repo-relative, and run it as `pnpm check`. (S)
- Tests for the executor (refusal paths with a codesign stub), `chromium-tree.py` (round trip on a tiny repo), `verify-candidate.py` and `aux_drive.py`. Default the 9 env-gated tests to the frozen snapshot and make them fail, not skip, when an input is missing. Wire in the 12 orphaned `docs/integration` tests that still apply. Use one `inputs.json` resolver so tests are hermetic. (M)
- Move live tools out of `docs/integration` into `scripts/candidate/`: the executor, freezer and lane prepares. Use a relocatable plan format, and freeze the rest as records. (M)
- `chromium/tree`: export per area (Aux-owned sources, upstream edits split into branding and platform), record the manifest hash in every native receipt, and prove one clean apply and build. Cut hooks into `browser_view.cc` and the content browser client toward small seams. (L)
- Repo weight: prune duplicate multi-MB inventories (836 duplicate blobs; 14 copies of one receipt) at an archive tag. Commit hashes, not bytes. (M)
- Worktrees: archive the 52 holding unique commits to `refs/archive/*`, then remove them. Fix AGENTS' worktree location. (S)
- Transforms: one shared exact-replace helper (no `String.replace` `$`-pattern hazards). Turn `typeof` reach-ins into transform-time anchors. Document which databases are outside broker custody. (M)
- Launcher from a tracked template with temp dirs. Acceptance results record the seal. Make `aux_drive abort` safe when nothing is running. (S)

### Phase 6: Hosted hardening
- Shares: per-user count and byte quotas, a rate limit, a report link, an operator revoke script and acceptable-use terms (D10). (M)
- Record consent version, time and age at signup. Bot protection and a global send budget on the email code. Firewall rate rules. Cache Clerk verification, and write `aux_users` only on change. (M)
- Separate readiness token (not `CRON_SECRET`), and a database check in `/health`. Structured logs with request IDs, plus maintenance summaries and alerts. (S-M)
- Additive migration 013 with the missing indexes. Confirm the Vercel plan supports a 5-minute cron. Clean up share-import blobs. Clean up old avatars. Fix the 503 loop on a webhook for a deleted Clerk user. (S)

### Phase 7: Live UI excellence and acceptance (needs D12)
- One acceptance pass with `scripts/acceptance` across `JOURNEYS.md`, plus the "needs live review" list:
  - Upgrade buttons for BYOK users; Experimental hidden.
  - The "Google API keys missing" infobar; sign-in and avatar promos.
  - The menu-bar icon; the hero video layout.
  - The recovery flow; dark and light favicons; focus rings.
  - Narrow-width truncation; mixed-language UI.
- Native UI polish:
  - ColorProvider IDs instead of hard-coded `SkColor`, so the theme editor and high contrast reach every view.
  - Move about 300 literal strings to `.grd`, and add RTL mirroring.
  - Accessible names: about 25 icon buttons, and the agent-running state.
  - clang-format, and split the 3,049-line sidebar file.
  - Run these only where the supplied UI rule allows; they are Aux-owned native views.
- Collect defects, fix them in one build, and rerun only the failures. Re-pin the visual baseline: 2 of 135 files have drifted, and it currently protects Aside-labeled rasters.

### Phase 8: External gates (unchanged)
1Password (identity, vendor account, plus the native-messaging fixes above), hosted deploy (run order in `cloud-activation/DEPLOYMENT.md`), ChatGPT form, legal confirmation, and Apple `2H4D7KNGUP` for the REPL.

### Phase 9: Release design (deferred scope, design only)
A written path for Developer ID signing, notarization and stapling, the update mechanism (Chromium on macOS has none built in), DMG packaging and CI. Reconcile the two signing stories: `docs/source/provided-signing.md` says ad hoc, while the repair flow uses an Apple Development identity.

## What was checked and found sound

- **Hosted service:** all queries are scoped to the user; share IDs are 144-bit; markdown is safe; Clerk webhooks are Svix-verified and idempotent; refresh-token rotation has reuse detection; OTPs are hashed and attempt-capped; attachment downloads are sandboxed; CORS is an allowlist.
- **Daemon:** telemetry is genuinely disabled; CDP loopback, Host, Origin and token checks are sound; the wire protocol and key domains are Aux.
- **UI text:** no "Aside" in extension text, URLs or locales; icons derive from the arch mark.
- **Repo:** `verify-candidate` passes (67 pins), and `pnpm test` gives 406 passed, 0 failed, 12 skipped.

## Coverage gaps

These need live access or a deeper pass: `AuxNativePeerTransport.cc` (2.1k lines), the storage-migration worker, the Spaces model internals, the split pane tree, the CLI wire protocol, the PDF/DOCX services, the native broker internals, the agent runtime and memory helper, the hosted dashboard state, and all runtime rendering, focus and scaling.
