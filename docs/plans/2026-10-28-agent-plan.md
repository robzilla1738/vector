# Aux release: agent plan

2026-10-28. Everything Claude does to take Aux from seal `b606bf7c` to a signed, notarized, self-updating release candidate. It stops right before anything is published. Robert's side is in the [owner plan](2026-10-28-owner-plan.md). The decisions behind both are in the [release readiness checklist](2026-10-28-release-readiness.md), section 1. Evidence for every finding is in [2026-10-28-release-audit/](2026-10-28-release-audit/).

## Ground rules for this plan

- **Stop point.** Claude never uploads a build, deploys `aux-web` or `aux-cloud` to production, or publishes an appcast without Robert's yes for that step (owner plan item 20). Everything up to that point is in scope.
- **Native work.**
  - Edits go in the durable checkout (`/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src`). Never reset it or touch unrelated owner changes.
  - Every compile goes through `python3 scripts/native-build.py …`, which holds `/tmp/aux-build.lock`.
  - After every native batch, re-export the delta with `python3 scripts/chromium-tree.py export <src> chromium/tree`.
- **Package work.**
  - Changes are count-checked, receipt-bound deltas under `docs/integration/proposed/completion-20261026/`, prepared with `scripts/candidate/prepare_edits.py` and applied by the repair executor (`scripts/candidate/repair_combined.py`, plans from `freeze_plan.py`).
  - `python3 scripts/verify-candidate.py` must pass after every reseal.
- **Branding versus platform.** Branding and platform changes stay in separate, reviewable patches.
- **Testing.**
  - `pnpm test` on every change, plus one focused check for the boundary touched.
  - One disposable real launch per native batch, through `Launch Aux.command` until the launch path changes (phase 1).
  - Passing tests or hashes are not UI parity. UI claims need the D12 grants (owner item 1).
- **Credentials.** Keys come only from the 1Password Agents vault through `op-agents`, and are never printed or committed. AI checks use only the Muse Gateway connection within the recorded spending authority. Provider checks on Robert's own subscriptions (phase 2) need his yes at the time.
- **Records.** Every batch ends with a receipt, an updated STATUS entry and a commit on local `main` as `robzilla1738`, then a push to `robzilla1738/vector`.
- **Order.** Phases 0 and 1 first. Phases 2 to 5 run alongside the native work, but only one native build runs at a time. Phase 9 waits on D12, and parts of phase 5 wait on the Developer ID.

## Phase 0: Back up and push

1. Finish the full-history secret scan (`gitleaks git`, values redacted). For each finding:
   - A fixture or example value: record it as such.
   - A real credential: stop and tell Robert. Rotation comes first, because the history won't be rewritten (receipts cite hashes).
2. `gh auth switch --user robzilla1738`, then `git push -u origin main`. The repo is public and about 203 MiB packed, with no blob over 50 MB. The pushed head has no `.github/workflows`, so the push itself triggers no hosted Actions.
3. Switch `gh` back to `rwcourson` (the default).
4. Record the push in STATUS.

**Done when** `origin/main` equals local `main`.

## Phase 1: Product batch (one native build, one reseal)

### 1A. Native (durable checkout)

**Entitlements and app identity**
- Outer app: add `com.apple.security.device.camera`, `com.apple.security.device.audio-input`, `com.apple.security.personal-information.location` and `com.apple.security.automation.apple-events` beside `allow-jit`. `chrome/app/app-entitlements.plist` already lists them; wire the Aux build to use it. Keep the helper entitlements as upstream Chrome ships them (renderer, GPU, plugin, alerts).
- `Aux Computer Use.app`: add the Apple Events and Contacts entitlements its usage strings already ask for.
- Exported file types: replace the `org.chromium.*` UTI exports with `dev.aux.*` (or import them instead), so Aux doesn't collide with an installed Chrome or Chromium.

**State location and version**
- Replace `Aux Browser Completion 20261026` with `Aux` in:
  - `chrome_main_delegate.cc:697,709` (user data and caches),
  - `AuxNativeParentColdLaunch.cc:275-322`,
  - `AuxFreshBootstrapPolicy.swift:27-29`,
  - and anything else a sweep finds. Crashpad already uses `Application Support/Aux/Crashpad`; keep one root.
- Public version 1.0.0 in `CFBundleShortVersionString`, and an integer `CFBundleVersion` from a build-number file that only increases.
- The daemon health check stops pinning `1.26.1016.1852`: accept the bundled component's own version, read from its manifest.

**Release-mode launch path**
- Behind `aux_test_hooks=false` (and therefore in every release build), compile out:
  - acceptance of `/private/tmp/aux-fresh-browser-*` as a user-data-dir (`chrome_main_delegate.cc:617`),
  - the candidate launcher's "private path selection" refusal,
  - every other test-only switch.
- The app must start from Finder, the Dock, `open -a`, and link opens with Aux as the default browser.
- Real Keychain stays the default (D2). `--use-mock-keychain` remains only as a dev switch the launcher passes.

**Google and Chrome surfaces**
- Feature defaults: Glic, LensOverlay, Compose, AI Mode, actor and contextual tasks default off in an Aux feature-override list. The appended `--disable-features` switch stays only as a second guard.
- Turn off Google sign-in and sync for every profile (`kSigninAllowed` default false), the iOS promos (`chrome_browser_main_extra_parts_profiles.cc:1126`, `address_bubbles_controller.cc:319`) and the sign-in promos.
- Suppress the "Google API keys are missing" infobar (`chrome/browser/ui/startup/infobar_utils.cc:256-267`) while no Safe Browsing key is configured.
- Remove the 751 profile-switch guard lines that only exist for Glic, Lens, actor and the iOS promo.
- Strings:
  - Reword the 8 remaining "Chromium" strings (the SSL interstitials first) and the reachable "Chrome" strings, starting with sign-in, sync, iOS and update.
  - Remove or neutralize the "Gemini in Aux" strings.
  - Credit Chromium on the About page (`components_chromium_strings.grd:279`).
  - Keep the "Chrome Web Store" and "Root Store" names, which are proper names.

**Daemon supervisor**
- If the daemon dies mid-session, the native route relaunches it with the existing bounded backoff, instead of staying down until the browser restarts.
- A visible "Agent unavailable — Retry" state in the sidebar and new-tab surfaces, driven by the supervisor state.
- Cache the selected route instead of 23 repeated filesystem reads on the UI thread.

**Security cleanup (dead code with weight)**
- Remove the Vault passkey broker from the WebAuthn path, and the Vault extension ID from the CDP trust list.
- Remove the legacy carrier and direct-daemon route (`RunCarrier`, carrier custody, its `#else` branches).
- Remove the shell-era `chrome://aux` host in `webui_browser/`.
- Cap CDP challenges per peer, not just 1,024 in total.

**Polish**
- Downgrade the 162 `LOG(ERROR)` traces to `DVLOG` or `VLOG`, starting with the per-event palette trace.
- Accessible names for the 2 unnamed buttons, and announce the agent-running state.
- Move the ~23 hard-coded `SkColor` sites to ColorProvider IDs, so themes and high contrast reach them.
- One form of each name: "Aux" and "Aux Daemon".
- Fix `isAux` hard-coded to false in settings (it breaks returning from the Library to History after clearing data).

### 1B. Package, daemon and extension (receipt-bound deltas)

**Owner paths and provenance**
- `bundle.json`: regenerate a release manifest without the ~995 owner and `/private/tmp` paths or the stale `cloudPolicy: development`. Keep the provenance hashes in the repo, not in the app.
- 646 `.pyc` files embed `/Users/rcourson/.aside/...`. Recompile them with `compileall -d` pointing at a neutral in-bundle prefix, or ship sources and let the runtime compile into the Aux home. Pick whichever keeps the runtime's validation intact.
- Venv `pyvenv.cfg`, pip shebangs and `runtime-text-root.json` use the old `/Vibe/web/...` path. Make them relative.
- `prepare-python.py`: change the "Aside: …" message.
- The `aside-runtime`/`bro-components` CI path in `aux-daemon` and `runtime-source-pins.json`: neutralize it where it's read at runtime, and keep it in the repo's source pins.

**Signatures**
- Re-sign the 86 binaries signed by At Inc. (`rg`, the poppler tools, 31 dylibs, the lxml `.so` files, node-pty) under the Aux identity, inside out. That means Apple Development for local reseals and Developer ID in the release script.
- Drop the `darwin-x64` node-pty prebuilds; Aux is arm64-only.

**Daemon**
- Environment: filter inherited provider variables (AWS and Bedrock, `HF_TOKEN` and the ~12 others) with an allowlist, so only what Aux sets reaches the daemon.
- CORS: trust `app.getaux.co` only; drop `api.getaux.co` (decision 11). Every request still needs the session token.
- Skill icons: copy the 46 `builtin-skills/v1/*` icons into the daemon's static folder and rewrite each `SKILL.md` `icon:` to the bundled path. After that, nothing shipped needs `dev-cloud.getaux.co`.

**Extension**
- Replace the dead `127.0.0.1:9/aux-unavailable/docs/help/channels-*.md` links with `https://app.getaux.co/docs/channels/<platform>`, or hide the link until that page exists.
- Format the one remaining locale-dependent timestamp like the others.

**Baselines**
- Re-pin the visual baseline: `aux-identity-ui-baseline.json` without the 7 pre-retouch Aside rasters, and a real `visual-manifest.json`.
- Check `background-BriNwY3v.webm` frame by frame for Aside branding.

### 1C. Build, reseal, check

1. Compile changed units, then the full build: `python3 scripts/native-build.py autoninja -C out/AuxFast chrome`.
2. `python3 scripts/chromium-tree.py export <src> chromium/tree`, then `verify`.
3. Prepare the edits, freeze the plan and run the repair executor for the reseal. Then run `python3 scripts/verify-candidate.py`.
4. Archive the four old state folders (`Aux`, `Aux Browser`, `Aux Browser A38 Disposable`, `Aux Browser Completion 20261026`) to `~/Documents/Aux-archive/state-2026-10-28/`, after Robert quits the running candidate (owner item 2). This is a move, not a delete.
5. Focused real launch without UI control:
   - `/health` ready.
   - `codesign -d --entitlements -` shows the new entitlements.
   - The state lands in `~/Library/Application Support/Aux`.
   - Quit, then abort and relaunch, with no process left.
   - The daemon relaunches after `kill -9` of the daemon alone.
6. `pnpm test`, a receipt under `completion-20261026/`, the STATUS seal entry, a commit and a push.

**Done when** the new seal passes `verify-candidate.py` and the focused launch, and the audit tables mark each item done.

## Phase 2: Providers, the T3 Code way (decision 1)

**Goal.** Users sign in with their own Claude, ChatGPT/Codex, Cursor, Grok and OpenCode subscriptions through each provider's official CLI, the way T3 Code does. Aux uses no borrowed OAuth client IDs and no spoofed editor headers.

1. **Inventory.**
   - Map every provider path in the daemon and extension: the `openai-codex` loader with the Codex CLI client ID (`app_EMoamEEZ73f0CkXaXp7hrann`), Claude Pro/Max, Copilot (VS Code headers), Kimi, Meta and Grok.
   - Write the map into a receipt.
2. **Detection.** For each CLI, the daemon resolves it through the user's login-shell PATH plus the common install paths (`/opt/homebrew/bin`, `~/.local/bin`, npm global). It records the version and asks for auth status without reading any token files:
   - Codex: `codex login status`.
   - Claude Code: `claude auth status`.
   - Cursor: `agent status`.
   - Grok Build: `grok` (its status command).
   - OpenCode: `opencode auth list`.

   Each provider then shows one of three states: not installed, signed out, or ready.
3. **Driving.** Run each harness in its own documented headless mode, and stream its events into Aux's chat surface:
   - Codex: `codex app-server` (JSON-RPC).
   - Claude Code: the Agent SDK / `claude -p --output-format stream-json`.
   - Cursor: `agent -p --output-format stream-json`.
   - Grok Build: its headless mode.
   - OpenCode: `opencode serve` (HTTP).

   Aux's browser tools reach these agents through a local MCP server the daemon exposes, scoped to the active profile and gated by the existing session token.
4. **Settings UI.** One row per provider, with these states and actions:
   - Install: a link to the official installer, plus a copy-able command.
   - Sign in: a copy-able `codex login`, `claude auth login`, `agent login`, `grok login` or `opencode auth login`, or "Open Terminal" to run it.
   - Ready: shows the model and a Disconnect explainer (sign-out happens in the CLI).

   Kimi and Meta stay as API-key providers. Copilot uses its official CLI if one is installed; otherwise it's hidden.
5. **Removal.** Delete the Codex client ID, the Copilot VS Code header spoofing and the in-app OAuth flows they replace. These are count-checked transforms, with a test that the strings are gone from the bundle.
6. **Tests.**
   - Fake CLI fixtures for every state: missing, signed out, ready, crash, slow, malformed stream.
   - Stream parsing tests.
   - Process cleanup on Stop and Quit.
7. **Real check.** All five CLIs are installed on this Mac. One short prompt per provider on Robert's own logins, only with his yes at the time (it uses his subscriptions).

**Done when** each provider moves through not installed, signed out and ready in Settings, completes one chat turn, stops cleanly on cancel, and leaves no child process after Quit.

## Phase 3: Languages (decision 9)

Launch languages: English, Spanish, French, German, Portuguese (Brazil), Italian, Japanese, Korean, Simplified Chinese, Traditional Chinese.

1. **Native strings.**
   - Move ~290 literal strings in Aux-owned views into an Aux `.grd` with message IDs and translator descriptions.
   - Add `.xtb` translations for the nine languages.
2. **Reworded Chromium strings.**
   - Changing an English source string changes its message ID, so the upstream translation no longer matches.
   - For each reworded string, add the nine translations to the matching `.xtb`.
   - For all other locales, confirm grit falls back to the English Aux text, not "Chrome".
   - Add a build check that fails if a launch-language string is missing.
3. **Extension.**
   - Inventory its user-visible strings.
   - Add a message catalog through a count-checked transform, plus translations for the nine languages.
   - Remove the English pin (D8) so it follows the browser locale.
4. **Hosted pages.** The `app.getaux.co` public pages and the `getaux.co` site get the same nine languages, or say clearly that they're English-only for now. Claude's recommendation: translate the download and docs landing pages, and keep legal pages in English.
5. **Quality.**
   - Claude produces the translations with glossary consistency (Aux, Space, Peek, Little Arc names, Quick Window).
   - A pseudo-locale build catches truncation and hard-coded strings.
   - The acceptance pass includes one run in Japanese and one in German (long strings).

**Done when** the app, extension and download page switch fully with the macOS language in all ten languages, with no English leftovers on the main surfaces.

## Phase 4: Hosted batch (`services/aux-cloud`, `aux-web`)

All in local source with tests. The deploy is Robert's (owner item 9).

1. **Bot protection.** Vercel BotID on `POST /api/v1/auth/email/start` and `/verify-code`, which fails closed on a bot verdict. Write the exact Firewall rule spec for owner item 8b.
2. **`check-environment`.**
   - Require `AUX_READINESS_SECRET` only when `VERCEL_ENV=production`, so Preview builds work again.
   - Require `RESEND_FROM` to be an `@getaux.co` address.
3. **Sign-in email.**
   - Add `reply_to: hello@getaux.co` to the Resend call in `src/auth.ts:187`.
   - Show the terms link and an age confirmation at desktop email-code sign-up, and store the age flag with the consent version and time.
4. **Account purge.** An end-to-end test that creates a user with data in every table plus blobs, deletes it, and checks that nothing remains.
5. **Shares.**
   - An operator-blocked state the owner can't republish over.
   - Clear the share title on unshare (today only the messages are cleared).
6. **Logs.** Auth and recovery errors as JSON lines carrying the request ID.
7. **Dependencies.**
   - A pnpm override for zod at 4.6.6 or later (the one high advisory).
   - The current Clerk, Hono and Next patch releases.
   - `pnpm audit --prod` clean.
8. **Lint.** Add a `lint` script (ESLint with the Next config), and fix what it finds.
9. **Optional.** A cheap database check in `/health`, and caching of Clerk lookups on the web path.
10. **`aux-web` (`~/Documents/Vibe/aux-web`, serves getaux.co).**
    - Redirects: `/policy/*`, `/docs`, `/community` and `/support` to their `app.getaux.co` pages.
    - A `/download` page: version, size, SHA-256, macOS 27 and Apple silicon requirement, release notes.
    - An `/updates/appcast.xml` route serving the signed appcast from the repo (or a redirect to the Blob copy).
    - Prepared and built locally, not deployed.
11. **Monitoring.** Once owner items 7 and 8 exist, create the Better Stack monitor through its API, with the token from the vault. Record its ID and the rollback deployment in the ops doc.
12. **J5 step 10.** After owner item 10, run the read-only cleanup check and record it.

**Done when** `pnpm test`, `tsc`, lint and a local `next build` pass. Then tell Robert it's ready to deploy, and after his deploy, verify readiness on all aliases.

## Phase 5: Release engineering

### 5A. Release build
- Rewrite `chromium/flags.release.gn` to import `flags.aux.gn` and override only `is_official_build=true`, ThinLTO, PGO, symbols and stripping.
- Add GN asserts: a release build is the browser, `aux_test_hooks` is false, and Sparkle is enabled.
- Fetch the matching PGO profile (`tools/update_pgo_profiles.py --target=mac-arm update`).
- Build `out/AuxRelease`. Compare startup, size and behavior with AuxFast, and keep both.

### 5B. Sparkle updates
- Vendor a pinned Sparkle 2 release into `third_party/aux_sparkle`: framework, XPC services and LICENSE, with its SHA-256 recorded in the tree.
- Remove the shell-era `assert(false && …)` at `chrome/BUILD.gn:526`, and build with `enable_aux_sparkle=true`.
- Generate Aux's own EdDSA key with `generate_keys --account dev.aux.browser.sparkle`, and record the public key in the GN args. Never reuse Muse's or Omnibot's key.
- Feed: `SUFeedURL=https://getaux.co/updates/appcast.xml`, automatic checks on, and a "Check for Updates…" item in the Aux menu.
- Update safety: Sparkle relaunches through normal Quit, so the supervisor stops the daemon first. Test that an update during an active agent task waits or asks.

### 5C. Release script (`scripts/release/`)
1. Preflight:
   - `security find-identity` shows the Developer ID.
   - `xcrun notarytool history --keychain-profile muse-desktop` authenticates (only success or a sanitized error is reported).
   - The Sparkle key exists, and the version is above the last published one.
2. Assemble the release app from the release build and the resealed components.
3. Sign inside out with hardened runtime, secure timestamps and per-target entitlements:
   - nested dylibs and executables in the runtime,
   - node-pty,
   - the CLI and Computer Use apps,
   - the daemon with its Developer ID profile,
   - the Sparkle XPC services and Updater,
   - the framework's helpers,
   - the framework,
   - the app.
4. Widevine VMP signing (castLabs EVS) once owner item 15 exists. Until then the step is present and reports "skipped: no license".
5. Notarize a `ditto` zip; it must come back `Accepted`. Staple, then check `codesign --verify --deep --strict`, `stapler validate` and `spctl --assess --type execute`.
6. DMG: `hdiutil` image with the app and an Applications link. Sign, notarize and staple it, then check `spctl --assess --type open --context context:primary-signature`.
7. Update archive and appcast:
   - Zip the stapled app.
   - Run `generate_appcast`, then `sign_update --verify`.
   - Write release notes.
   - Record SHA-256 sums.
8. Upload dSYMs to Sentry once owner item 13 exists.
9. **Stop.** Print the artifacts, hashes and the three publication steps, then wait for Robert.

### 5D. Crash reports
- Point Crashpad's upload URL at Sentry's minidump endpoint, derived from the DSN in the vault. Don't attach URLs or page content.
- Native opt-in prompt after the first crash ("Send crash reports to help fix Aux?"), remembered in local state and changeable in Settings › Privacy. Off until the user says yes.
- Test with a forced crash in a disposable profile: no upload without consent, one upload with it.

### 5E. Safe Browsing
Once owner item 14 exists, build with the key (or a Web Risk adapter), enable Safe Browsing by default, and check the Google test pages (`testsafebrowsing.appspot.com`). Remove the infobar suppression once a key is configured.

**Done when** the release script produces a stapled app and DMG that pass every `spctl` check, and an older test build updates to the new one through "Check for Updates…" from a locally served appcast. No upload happens.

## Phase 6: CI on this Mac (Tartelet)

1. `brew install --cask tartelet`.
2. Create the runner image:
   - `tart clone ghcr.io/cirruslabs/macos-tahoe-xcode:27 aux-ci`.
   - Install Node 22, pnpm 11.27.1, Python 3 and gitleaks, and pre-warm the pnpm store.
   - Record the image recipe in `scripts/ci/`.
   - Disk space is fine (1.4 TB free; Tart clones are copy-on-write).
3. Split tests:
   - Mark the tests that need `out/` inputs (the frozen snapshot, the candidate).
   - Add `pnpm test:ci` for the hermetic set.
   - `pnpm test` on the host stays the full suite.
4. Workflows in `.github/workflows/`:
   - `ci.yml`: hermetic tests, service `pnpm test`, `tsc`, lint and `next build` with fixture env, plus a gitleaks scan.
   - `runs-on: self-hosted`. Triggers: `push` to `main` and `workflow_dispatch` only, never `pull_request` or `pull_request_target`.
   - `permissions: contents: read`, and pinned action SHAs.
5. Native builds, reseals and signing stay on the host. They need the durable checkout, `out/` and the Keychain, none of which belong in a CI VM.
6. After owner item 6, run one manual dispatch and confirm the VM is created, runs and is deleted.

## Phase 7: Reproducibility

1. Clean rebuild proof.
   - Fetch Chromium `155.0.8059.85` into a separate directory (`aux-chromium-clean/`).
   - Run `chromium-tree.py apply`, then build `out/AuxFast` there.
   - Compare the app's file inventory with the durable build, and record the differences and why they exist.
2. Record the `chromium/tree/manifest.json` hash in every native receipt and in `verify-candidate.py`'s pins.
3. One documented rebuild path in `docs/source/rebuild.md`: frozen snapshot plus A38 base plus the ordered repair chain plus the tree, with every input and its backup location. Decide whether the fresh `stage:provided` path is retired or brought level, and say so.
4. Tests:
   - The repair executor's refusal paths, with a codesign stub.
   - `verify-candidate.py` against a tiny fixture app.
   - `aux_drive.py` argument and safety handling (`abort` with nothing running).
   - Add `verify-candidate.py` to `pnpm check`.
5. Make the ~15 input-dependent tests fail instead of skip when an input is missing, behind one `inputs.json` resolver.
6. Move the staging imports out of `docs/integration` into `scripts/candidate/`, and freeze the rest as records.
7. Fix the dangling `node_headers` symlink left by the web→Aux rename.
8. Correct `chromium/tree/README.md` if any other claim proves wrong during the clean apply.

## Phase 8: Chromium security updates

1. Write `docs/source/chromium-updates.md` and `scripts/chromium-rebase.py`:
   - Fetch the new stable tag into a fresh checkout and apply `chromium/tree` with three-way fallback.
   - List conflicts by area (Aux-owned sources, branding edits, platform edits).
   - Rebuild, reseal, run the focused checks and the update test.
2. Cadence: follow Chrome stable security releases. Every rebase ships as a Sparkle update after Robert approves its publication.
3. Do the first rebase from 155.0.8059.85 to the current stable once phase 7's clean apply works. Record how long each step took in builds, not calendar time.

## Phase 9: Acceptance (after owner item 1)

1. `python3 scripts/acceptance/aux_drive.py check` reports all three permissions as ok.
2. The full [JOURNEYS.md](../../scripts/acceptance/JOURNEYS.md) pass on the phase 1 seal:
   - Lifecycle and isolation.
   - Organization and windows.
   - Navigation and layout.
   - Files and media.
   - The AI journeys on Muse only, within the spending authority, removing the connection afterward.
   - The excellence audit's "needs live review" list.
3. Release-only checks, on the signed candidate once it exists:
   - First launch from the DMG on a clean macOS user account, with only system tools on PATH.
   - Set Aux as the default browser, and open links from Mail and Messages.
   - Camera, microphone and location prompts on a test page (`webrtc.github.io/samples`, a geolocation test).
   - The real-Keychain check (owner item 19).
   - Sleep and wake, a second display, full screen and a narrow window.
   - Startup time, memory and energy against Chrome on the same pages.
   - Crash and forced-quit recovery, and the crash-report prompt.
   - Update from the previous build through Sparkle, with the daemon running and a task active.
   - Each provider from phase 2, one launch language from phase 3, and Widevine playback once licensed.
4. Collect every defect, fix them in one native build, then rerun only the failed journeys.
5. Record results in `desktop/acceptance/` and STATUS.

## Phase 10: As owner items arrive

| Owner item | Claude then |
|---|---|
| 1 UI access | Phase 9 |
| 2 Aux quit | Phase 1C step 4 (archive) and the reseal launch |
| 4 + 5 Developer ID and profile | Phase 5C end to end; the Developer ID copy in `/Applications` for 1Password |
| 6 Tartelet App | Phase 6 step 6 |
| 7 + 8 Better Stack, Vercel | Phase 4 step 11 |
| 9 Service deployed | Verify readiness on all aliases; record the rollback |
| 10 J5 account deleted | Phase 4 step 12 |
| 13 Sentry | Phase 5D wiring and the dSYM upload |
| 14 Safe Browsing | Phase 5E |
| 15 Widevine and EVS | Phase 5C step 4 and a playback check |
| 16 Apple approval | REPL activation: daemon entitlement and profile, the v11 resource delta, then six journeys (a Bash command, yield and cancel, PTY input, resize and exit, escaped descendant, session revocation, normal Quit) |
| 17 1Password account | R18: install the official extension, fill the dummy login, pair the desktop app, and check isolation between profiles. Fix the native host's fork/exec sandbox denial if pairing needs it |
| 18 ChatGPT approval | Aux's own client ID for in-app ChatGPT sign-in beside the Codex CLI path |
| 19 Keychain approval | The real-Keychain check |
| 20 Publication approvals | Upload to `aux-downloads`, deploy `aux-web`, publish the appcast, one step per approval |

## Phase 11: Records

After every phase:
- Update STATUS (seal, observed results, gaps), the checklist, the audit tables' state column, the contract and AGENTS.md where a rule changed, and the ops doc for hosted changes.
- Commit on local `main` and push to `robzilla1738/vector`.

The release candidate is declared ready only when phases 1–7 and 9 are done, and every owner item that gates a launch feature (1, 4, 5, 9, 14) is done or explicitly deferred by Robert.
