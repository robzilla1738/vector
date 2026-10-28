# Aux release readiness

2026-10-28. Everything that stands between the current seal and a public, signed, self-updating macOS release. It builds on [STATUS](../STATUS.md), the [excellence audit](2026-10-27-excellence-audit.md) and three read-only audits run today, whose full tables with file and line evidence are in [2026-10-28-release-audit/](2026-10-28-release-audit/) ([native](2026-10-28-release-audit/native.md), [service](2026-10-28-release-audit/service.md), [components](2026-10-28-release-audit/components.md)). Nothing was built, launched, signed or deployed for this list.

Baseline on 2026-10-28: candidate seal `b606bf7c`. `pnpm test` gives 416 pass, 0 fail, 5 skipped. `verify-candidate.py` checks 89 pins and 11,191 entries, with 0 differences. Service tests pass 64/64 and `tsc` is clean. `chromium/tree` matches the durable checkout. No desktop journey has been driven on this seal, because the OS grants (D12) are still missing.

The owner put distribution, notarization, release and Developer ID signing in scope on 2026-10-28 (AGENTS.md updated), and decided or delegated every open question (section 1).

Legal and licensing (distribution rights, third-party licenses and notices, terms and privacy facts) are handled separately by the owner and are not on this list; the [audit tables](2026-10-28-release-audit/) keep those findings for reference.

Each item is marked **[owner]** (only Robert can do it), **[agent]** (Claude can do it, with the build, reseal and test the rules require) or **[external]** (waiting on a third party).

## The two lists (2026-10-28)

The detailed, step-by-step versions are the [owner plan](2026-10-28-owner-plan.md) and the [agent plan](2026-10-28-agent-plan.md).

### Only Robert can do

Access and identity
1. ~~Grant Accessibility and Automation to the terminal running Claude (D12).~~ Done 2026-10-28; on macOS 27 Accessibility is "Device Control and Data Access", and `aux_drive.py check` passes from Claude.
2. Import `Aux Developer ID Application - 2026.p12` (iCloud Drive) into the login Keychain, and choose "Always Allow" for `codesign` when it first asks.
3. In the Apple Developer portal (team `9F2JXY8TCK`), create a Developer ID provisioning profile for `dev.aux.browser.daemon`, and tell Claude where it saved.
4. Approve the one real-Keychain check (saved passwords and cookies across Quit), which touches Keychain (D2), when Claude asks.
5. Quit the running Aux candidate when Claude asks. It holds the state folders and blocks reseal launches.
6. Run `out/cleanup-2026-10-28/cleanup.sh`. It removes the four merged Codex worktrees and moves `~/Applications/Aux.app` to the Trash; the safety check blocked Claude from doing it. Their HEADs are saved under `refs/archive/worktrees/codex-*`, and their untracked files are in `~/Documents/Aux-archive/worktree-salvage-2026-10-28/`.

Accounts (use `hello@getaux.co` as the contact; put every key in the 1Password Agents vault, never in chat)
7. Google Cloud: a Safe Browsing API key restricted to that API, or a Web Risk application if the free API doesn't fit (decision 7).
8. Widevine: request a license at widevine.com, and get VMP signing (decision 8). Inquiries sent 2026-10-28. A native Chromium build needs castLabs' commercial 3PL audit before EVS access; free EVS covers only castLabs Electron builds.
9. Sentry: one project for native crash reports, and its DSN (decision 6).
10. Better Stack: an account plus an API token, so Claude can create the readiness monitor with alerts to `robertcourson96@gmail.com` (decision 12).
11. Tartelet CI: create the GitHub App Tartelet asks for (it registers ephemeral runners) and install it on `robzilla1738/vector`. In the repo settings, set Actions to require approval for all outside collaborators.

Hosted service (Vercel `aux-cloud`, Neon, Resend)
12. Deploy the service when Claude says it's ready: today `09c024eba` and `608f900e3`, later the hosted batch. Or tell Claude it may run production deploys.
13. In Vercel: add a log drain to Better Stack, add the Firewall rate rule Claude specifies for the email-code route, delete the stale Stripe and hosted-AI variables and `AUX_PAYMENTS_ENABLED`/`AUX_HOSTED_AI_ENABLED`, and re-add the database URLs, Postgres passwords and Blob token as Sensitive.
14. Delete the J5 test account (Settings › Account › Delete account in Aux), then tell Claude to run the cleanup check.
15. In Resend: confirm `RESEND_FROM` is an `@getaux.co` sender and that SPF, DKIM and DMARC pass for getaux.co.
16. In Neon: confirm the point-in-time restore window for the Aux project (at least 7 days). The connected Neon account doesn't hold that project.

External
17. Follow up with Apple on `2H4D7KNGUP` (the Endpoint Security entitlement for the REPL). Sent 2026-10-28, case `103011717098`; awaiting Apple.
18. ~~Create a disposable 1Password account for the pairing test.~~ Superseded: the existing personal account with one dummy login.
19. ChatGPT eligibility form: optional now. With T3-style wiring (decision 1) Aux uses the user's own Codex CLI login and doesn't need its own OpenAI client. Submit it only if you want in-app ChatGPT sign-in without the CLI.

Release stop point
20. Approve each publication: uploading a build to `aux-downloads`, publishing the appcast, and putting the download page live. Claude builds, signs, notarizes and verifies everything up to that point, then stops.

### Claude can do now

Order: 1 and 2 first; 3–8 run alongside the native work; 9 and 10 wait on the owner items they name.

1. **Push and back up.** Finish the secret scan, push `main` to `robzilla1738/vector`, and record it.
2. **Product batch** (one native build, one reseal, a focused launch):
   - Entitlements: camera, microphone, location and Apple Events on the app; Contacts and Apple Events on Computer Use.
   - State folder `Aux`, public version 1.0.0 with an increasing build number, and no daemon version pin in the health check.
   - Launch from Finder and the Dock with the real Keychain. Release mode compiles out the test hooks, the `/private/tmp` profile path, the candidate launcher's refusal and debug-level `LOG(ERROR)` traces.
   - Google leftovers: Glic, Lens, Compose, AI Mode, actor and contextual tasks off by feature default; Google sign-in, sync and iOS promos off; the API-keys infobar suppressed; the 751 guard lines removed; about 340 Chrome and Chromium strings and the "Gemini in Aux" strings reworded; Chromium credited on the About page.
   - Daemon: it relaunches after dying mid-session, the UI shows an "agent unavailable / retry" state, and the selected route is cached.
   - Package: regenerate or strip `bundle.json`, the `.pyc` files, the venv paths, `runtime-text-root.json`, the `prepare-python.py` message and the CI path. Re-sign the 86 At Inc.-signed binaries under Aux, and drop the x64 prebuilds.
   - Security cleanup: remove the Vault passkey broker, the Vault CDP trust, the legacy carrier route and the shell-era `chrome://aux` host. Stop inherited AWS, Bedrock, `HF_TOKEN` and other provider variables. Cap CDP challenges per peer.
   - Bundle the 46 skill icons, then retire `dev-cloud`. Daemon CORS trusts `app.getaux.co` only.
   - Fixes: the dead help link, `isAux`, the locale timestamp, the `org.chromium.*` file types, two unnamed buttons, the agent-running announcement, about 23 hard-coded colors, and naming ("Aux", "Aux Daemon").
   - Archive the four old state folders once Aux has quit. Re-pin the visual baseline, and check the unretouched video frame by frame.
3. **Providers, T3 style** (decision 1): detect and drive the official Codex, Claude Code, Cursor, Grok Build and OpenCode CLIs with the user's own login. Add install and sign-in guidance in Settings, and fall back to API keys for Kimi and Meta. Remove the borrowed Codex client ID and the Copilot VS Code headers.
4. **Languages** (decision 9): move about 290 Aux native literals into `.grd`, and translate them, the extension UI and the reworded Chrome strings into Spanish, French, German, Portuguese (Brazil), Italian, Japanese, Korean and Simplified and Traditional Chinese. Unpin the extension from English.
5. **Hosted batch** (ready for the owner to deploy):
   - Vercel BotID on the email-code route, and the Firewall rule spec.
   - `check-environment`: the readiness secret only in production, and `RESEND_FROM` must be `@getaux.co`.
   - `Reply-To: hello@getaux.co` on sign-in mail; show the terms at desktop email-code sign-up and record age with consent.
   - An end-to-end purge test, an operator-blocked share state, the share title cleared on unshare, and JSON auth and recovery logs with request IDs.
   - zod past 4.6.6, the Clerk, Hono and Next patches, and a lint script.
   - Redirects for `getaux.co/policy/*`, `/docs` and `/community`.
6. **Release engineering:**
   - A release configuration based on `flags.aux.gn` with GN asserts, a PGO profile, and a first official build compared with AuxFast.
   - Sparkle: vendor a pinned `third_party/aux_sparkle`, remove the `assert(false …)`, generate Aux's own EdDSA key, add "Check for Updates…", and stop the daemon before an update replaces the app.
   - A release script: sign inside out with hardened runtime and timestamps, notarize with the team profile (checked first), staple, build and sign the DMG, verify with `spctl`, generate the appcast, and stop before upload.
   - Crashpad-to-Sentry wiring behind the opt-in prompt, ready for the DSN; a Widevine VMP signing step, ready for the EVS account.
   - In `~/Documents/Vibe/aux-web` (Vercel `aux-web`, serves getaux.co): `/download` and `/updates/appcast.xml` pointing at `aux-downloads`, prepared but not deployed.
7. **CI on this Mac:** install Tartelet, build a Tart image with Node, pnpm and Python from the existing `macos-tahoe-xcode` base, and add workflows for the hermetic tests, the service tests, `tsc` and `next build`. Lock triggers to pushes to `main` and manual runs. Native builds stay on the host.
8. **Reproducibility:** a clean `chromium-tree.py apply` plus a full build in a separate directory (1.4 TB free), the tree manifest hash in every native receipt, one documented rebuild path, tests for the executor, `verify-candidate.py` and `aux_drive.py`, `verify-candidate.py` in `pnpm check`, missing-input tests that fail instead of skip, staging code moved out of `docs/integration`, and the `node_headers` symlink fixed.
9. **Chromium updates:** a documented process and script to rebase `chromium/tree` onto each new Chrome stable, then the first rebase to the current stable.
10. **After the owner items:**
    - D12 grants: the full journey pass and release checks, one fix batch, then rerun only the failures.
    - Developer ID and profile: the signed, notarized and stapled release candidate and DMG, verified, and stopped before publication.
    - Keys and accounts: wire Safe Browsing, Sentry, Better Stack, Widevine and Tartelet as each arrives.
    - Apple, OpenAI and 1Password: activate the REPL, ChatGPT and the 1Password pairing as each approval lands.
11. **Docs:** keep STATUS, the contract and this checklist current after every batch.

## 1. Decisions (owner, 2026-10-28)

Robert answered the first six; for the rest he asked for whatever gives the best product, so those are Claude's calls, recorded here.

| # | Question | Decision |
|---|---|---|
| 1 | Subscription sign-in providers (Claude Pro/Max, Copilot, Kimi, Meta, Grok, the `openai-codex` login) | Keep, and wire them the way T3 Code does: Aux drives each provider's own official CLI or SDK with the user's existing login (`codex login`, `claude auth login`, Cursor `agent login`, `grok login`, `opencode auth login`), instead of in-app OAuth with borrowed client IDs or spoofed editor headers. Aux detects which CLIs are installed and signed in, offers "Install" and "Sign in" links when they aren't, and falls back to API keys for providers without an official CLI (Kimi, Meta). Each one needs a real sign-in and chat check in the acceptance pass |
| 2 | Release scope and signing | Allowed: distribution, notarization, release and Developer ID signing (`Developer ID Application: Robert Courson (9F2JXY8TCK)`) |
| 3 | Final state location | `~/Library/Application Support/Aux` and `~/Library/Caches/Aux`, the standard single-word form (as Arc uses `Arc`). Owner approved archiving the four existing folders on this Mac (`Aux`, `Aux Browser`, `Aux Browser A38 Disposable`, `Aux Browser Completion 20261026`). They move to `~/Documents/Aux-archive/state-2026-10-28/` while no Aux process is running, before the first launch of the renamed build. The release must never adopt them |
| 4 | Where updates and downloads live | The getaux.co website: `getaux.co/download` for the DMG and `getaux.co/updates/appcast.xml` for Sparkle. The files live in the public Vercel Blob store `aux-downloads` (`store_keswZfgEx7j6cpf0`, iad1, created 2026-10-28, not connected to `aux-cloud` so the service's Blob token is untouched). Every release is immutable; the feed is published only after its files exist |
| 5 | Version scheme | Aux 1.0.0 as the public version (`CFBundleShortVersionString`), with an integer `CFBundleVersion` that increases on every build. Components keep their supplied internal versions, so the daemon health check must stop pinning `1.26.1016.1852` |
| 6 | Crash reports | Opt-in, off by default: Aux asks once after the first crash. Crashpad minidumps go to Sentry's native minidump endpoint, with no URLs or page content attached. Needs a Sentry project (owner) and a privacy-page line (handled with legal) |
| 7 | Safe Browsing | On. Chromium's built-in protection needs a Google Safe Browsing API key. Google limits that API to non-commercial use and points commercial products to the paid Web Risk API, which needs an application and approval. Aux takes no payments, so check which applies, then get the key and Claude wires it in. Until then, ship with Safe Browsing off and the API-keys infobar suppressed |
| 8 | Widevine (Netflix, Spotify, Disney+) | On. Needs a Widevine license from Google (widevine.com) and VMP signing of every release, for example through castLabs EVS. Claude adds the signing step to the release script once the license exists. Proprietary codecs (H.264, AAC) stay on |
| 9 | Languages | English plus Spanish, French, German, Portuguese (Brazil), Italian, Japanese, Korean, Simplified and Traditional Chinese at launch. These are all left-to-right, which Aux's views already handle; Arabic and Hebrew follow once RTL works. Chromium's own strings already cover them; Aux must translate its extension UI, its native literals (about 290 move into `.grd`) and its reworded Chrome/Chromium strings in each locale, and unpin the extension from English (D8) |
| 10 | `dev-cloud.getaux.co` | Retire it. Bundle the 46 built-in skill icons in the app (faster, private, offline), then remove the alias once no shipped build points at it |
| 11 | Hosted site calling the local daemon | Yes, for `app.getaux.co` only. Drop `api.getaux.co` (it serves no pages, so it only adds attack surface). Every call still needs the daemon's session token |
| 12 | Alerts and operations | Alert recipient `robertcourson96@gmail.com`. Uptime: a Better Stack monitor on readiness every 3 minutes, alerting after 2 failures. Sign-in abuse: Vercel BotID on the email-code route plus a Vercel Firewall rate rule. Preview builds: `check-environment` requires the readiness secret only in production (no production secrets copied to Preview) |
| 13 | Repository identity | Commits are `robzilla1738` (`.git/config` fixed 2026-10-28). No history rewrite: receipts cite commit hashes. `robzilla1738/vector` is public, and the owner approved pushing `main` there after a secret scan. CI runs on this Mac through Tartelet (ephemeral Tart VMs as self-hosted GitHub Actions runners). Because the repo is public, workflows run only on pushes to `main` and on manual dispatch, never on fork pull requests, and outside contributors' runs need approval |
| 14 | Debug and test leftovers | The release build compiles out every test hook, the `/private/tmp` profile path, the candidate launcher's refusal, and the `LOG(ERROR)` traces below `WARNING` |
| 15 | Customer-facing email | `hello@getaux.co` everywhere a user sees or replies to an address: support, feedback, share reports, the public pages, store and vendor listings, and the Sentry and Widevine contact. It is already the only address in the shipped app and the service. Sign-in code emails get `Reply-To: hello@getaux.co`, and `RESEND_FROM` must be an `@getaux.co` sender. `robertcourson96@gmail.com` gets internal alerts only and never appears to users |

## 2. Product blockers (agent, one native batch plus reseal)

Fix these before the acceptance pass, so it runs once.

### Permissions and identity of the shipped app
- **Entitlements.** The outer app is signed with hardened runtime and only `allow-jit`. Without the camera, microphone, location and Apple Events entitlements that `chrome/app/app-entitlements.plist` already declares, web video calls, geolocation and Safari import should fail. `Aux Computer Use.app` has no entitlements but asks for Contacts and Apple Events. Add them per helper, then check each in the live pass.
- **Shipping launch path.** The binary refuses any `--user-data-dir` except a `/private/tmp/aux-fresh-browser-*` path, and the candidate only starts through `Launch Aux.command`. The release must start from Finder, the Dock and default-browser link opens, with the real Keychain (D2), the final state folder, and no test-only path acceptance.
- **Packaged leftovers.**
  - A 4.3 MB `bundle.json` lists about 995 owner and `/private/tmp` paths plus dev-cloud metadata (`cloudPolicy` mode `development`).
  - 646 `.pyc` files embed `/Users/rcourson/.aside/...`.
  - The venv config, pip shebangs and `runtime-text-root.json` point at the old `/Vibe/web/...` path.
  - `prepare-python.py` prints "Aside: …".
  - The `aside-runtime`/`bro-components` CI path is in `aux-daemon` and `runtime-source-pins.json`.
  Strip or regenerate all of these.
- **Third-party signatures.** 86 runtime and PTY binaries (`rg`, the poppler tools, 31 dylibs, lxml, x64 node-pty) are signed by At Inc.'s Developer ID. Re-sign them under Aux, which hardened-runtime library validation needs anyway. Drop the x64 prebuilds on an arm64-only app.
- **About page.** It says "Aux is made possible by the Aux open source project" (`components_chromium_strings.grd:279`). Credit Chromium.
- **Exported file types.** The app exports `org.chromium.*` UTIs that collide with an installed Chrome or Chromium.

### Google and Chrome surfaces
- Turn off Glic, Lens and Compose through feature defaults instead of only the appended `--disable-features` switch. Disable Google sign-in and sync (`kSigninAllowed` is only false for non-personal profiles), the iOS promos, AI Mode, actor and contextual tasks. Then delete the 751 profile-switch guard lines that only exist for them.
- Suppress the API-keys infobar until a Safe Browsing key exists (decision 7).
- Reword the 8 remaining "Chromium" strings (mostly SSL interstitials) and the reachable share of 339 "Chrome" strings ("Sign in to Chrome", "Download Chrome for iOS", update strings). Remove the "Gemini in Aux" strings, which would be false claims.

### Agent and daemon
- **Daemon recovery.** On the shipping native route a retry can't relaunch a dead daemon, so the agent stays down until the browser restarts. There is also no "agent unavailable / retry" state in the UI.
- **Version pin.** The health check pins daemon version `1.26.1016.1852`, which breaks the first update that bumps it.
- **Inherited keys.** AWS/Bedrock credentials, `HF_TOKEN` and about 12 other provider variables still pass from the launching environment into the daemon.
- **Dead code with security weight.** The Vault passkey broker is still in the WebAuthn path, and the Vault extension ID is still trusted for CDP. Remove both, along with the legacy carrier route (`RunCarrier`) and the shell-era `chrome://aux` host in `webui_browser/`.
- **Dead help link.** The messenger bot setup links to `127.0.0.1:9/aux-unavailable/docs/help/channels-*.md`.
- **Skill icons.** Bundle the 46 icons in the app, then retire `dev-cloud.getaux.co` (decision 10).
- **Daemon CORS.** Trust `app.getaux.co` only; drop `api.getaux.co` (decision 11).
- **Languages.** Translate the extension UI and the Aux native strings into the nine launch languages, and unpin the extension from English (decision 9).
- **Crash reports.** Wire Crashpad to Sentry behind the opt-in prompt (decision 6).
- **State folder and version.** Switch to `Aux` and Aux 1.0.0 (decisions 3 and 5).
- **CDP.** Cap challenges per peer (today it is 1,024 in total).
- **Bugs.** `isAux` is hard-coded false in settings, which breaks the Library's return to History after clearing data. One timestamp still follows the system locale.

### Polish that a release should have
- Downgrade the 162 `LOG(ERROR)` traces, including one on every palette event.
- Give the 2 unnamed buttons accessible names, announce the agent-running state, and do a VoiceOver pass.
- Move about 23 hard-coded `SkColor` sites to ColorProvider, so high contrast and the theme editor reach every view.
- Use one form of each name: "Aux", "Aux Daemon" (today "Aux Browser", "Aux daemon" and "Aux Daemon" are mixed).
- Re-pin the visual baseline. `aux-identity-ui-baseline.json` still protects the 7 pre-retouch Aside rasters, and `visual-manifest.json` is all null. Check the one unretouched video (`background-BriNwY3v.webm`) frame by frame.

## 3. Acceptance

1. **[owner] D12:** grant Accessibility and Automation to the terminal running Claude, or enable Computer use. Nothing in this section can run without it.
2. **[agent]** One pass over [JOURNEYS.md](../../scripts/acceptance/JOURNEYS.md) on the post-batch seal: lifecycle and isolation, organization and windows, navigation and layout, files and media, the Muse-only AI journeys within the spending authority, and the excellence audit's "needs live review" list.
3. **[agent]** Release-only journeys that the list doesn't cover yet:
   - First launch from a DMG on a clean macOS user account, with no developer tools on PATH.
   - Set Aux as the default browser, and open links from Mail and Messages.
   - Camera, microphone and geolocation prompts on a test site.
   - Real Keychain: saved passwords and cookies survive Quit and reopen (needs owner approval, since it touches Keychain).
   - Sleep and wake, a second display, full screen, a narrow window.
   - Startup time, memory and energy against a Chrome baseline.
   - Crash and forced-quit recovery.
   - Update from the previous build through Sparkle, with the daemon running.
4. **[agent]** Collect defects, fix them in one build, and rerun only the failures. Record results in `desktop/acceptance/` and STATUS.

## 4. Hosted service

Owner:
- Deploy the two undeployed commits (`09c024eba` users/settings merge, `608f900e3` site icon; `app.getaux.co/icon.png` returns 404). Then record a compatible rollback deployment.
- Create the Better Stack monitor on readiness with alerts to `robertcourson96@gmail.com`, and add a log drain and the Firewall rate rule on the email-code route (decision 12). Today a failing cron returns 500 and nobody is told.
- Run J5 step 10 (delete the test account) and its cleanup check. It is the only live proof that the purge works.
- Remove the stale Stripe and hosted-AI variables, and mark the database URLs, Postgres passwords and Blob token as sensitive.
- Confirm the Neon point-in-time restore window.

Agent:
- Vercel BotID on the email-code sign-in (decision 12). It shares a global cap of 300 sends an hour, so today a spread-out attack can block every real sign-in.
- `check-environment` requires `AUX_READINESS_SECRET` only in production, so Preview builds work again.
- Add `Reply-To: hello@getaux.co` to the sign-in code email, and have `check-environment` require an `@getaux.co` `RESEND_FROM` (decision 15).
- An operator-blocked share state. Today the owner can republish a share the operator took down.
- An end-to-end purge test. The current test only checks that every user table is listed.
- Clear the share title on unshare.
- JSON auth and recovery logs that carry the request ID.
- Bump zod past 4.6.6 (the one high advisory) and apply the Clerk, Hono and Next patch releases.
- Show the terms at desktop email-code sign-up, and record age with consent.
- Point `getaux.co/policy/*`, `/docs` and `/community` at `app.getaux.co`, or add redirects. Decide on `/support`.
- Add a lint script.

## 5. Signing, notarization and updates

1. **[owner]** Import `Aux Developer ID Application - 2026.p12` into the login Keychain. Only the Apple Development identity is installed today.
2. **[owner]** Create a Developer ID provisioning profile for `dev.aux.browser.daemon` (team `9F2JXY8TCK`). Its restricted entitlements need one, and the REPL's Endpoint Security entitlement will too.
3. **[agent]** Build the release configuration for the first time. `flags.release.gn` imports `flags.fast.gn`, an official build that doesn't import `flags.aux.gn`, so it loses the first-run and default-browser suppression. It also needs a PGO profile. Base it on `flags.aux.gn`, add a GN assert that release means the browser, and compare the result with the AuxFast candidate.
4. **[agent]** Sparkle:
   - Vendor a pinned, checksum-verified `third_party/aux_sparkle` (it doesn't exist).
   - Remove the shell-era `assert(false …)` at `chrome/BUILD.gn:526`.
   - Generate a dedicated EdDSA key under its own Keychain account, never another app's.
   - Use an HTTPS feed and a signed appcast, and add "Check for Updates…".
   - Make the updater stop the daemon before replacing the app.
5. **[agent]** A release script that signs inside out with hardened runtime and secure timestamps (each Chromium helper, the framework, the daemon, CLI and Computer Use apps, then the app). Notarize with the existing team profile, staple, then check with `codesign --verify --deep --strict`, `stapler validate` and `spctl`. Then build, sign, notarize and staple the DMG.
6. **[agent]** A download page and release notes on getaux.co, with checksums. Publish the feed only after the downloads exist.
7. **[agent, owner]** A Chromium security-update process. 155.0.8059.85 ages quickly and Chrome ships security fixes most weeks. Plan how Aux follows stable: rebase `chromium/tree` onto each new stable, rebuild, then reseal or re-release. This is the largest ongoing cost of shipping a browser.

## 6. External gates (independent)

- **Apple `2H4D7KNGUP`:** the Endpoint Security entitlement for the REPL (Bash, PTY and CLI). The source is complete and inactive. Activation steps are in `runtime/repl-activation-ready/README.md`.
- **ChatGPT plan:** confirm the proposed answers and submit the eligibility form. When approved, wire Aux's own client ID, then test sign-in, consent, one authorized inference, refresh and revoke.
- **1Password:** a Developer ID copy in `/Applications`, Robert's existing personal 1Password account with one dummy fixture login (no real logins touched), and the official extension's autofill. Its native host runs in a sandbox that denies fork and exec, so check whether the desktop-app pairing works at all, then accept R18.

## 7. Reproducibility and repo (agent unless noted)

- Prove one clean `chromium-tree.py apply` plus a full build. Record the tree manifest hash in every native receipt. Fix the dangling `node_headers` symlink left by the web→Aux rename.
- A fresh `stage:provided` stops at the Agent revision review, so only the repair chain defines the candidate. A release needs one documented rebuild path: either reproduce from source, or accept the A38 base plus the repairs as the input and keep it backed up.
- Add tests for the repair executor, `verify-candidate.py` and `aux_drive.py`. Run `verify-candidate.py` from `pnpm check`. Make about 15 input-dependent tests fail instead of skipping when an input is missing. Move the staging imports out of `docs/integration` into `scripts/`.
- Repo weight: 203 MiB packed, mostly multiple versions of 28.8 MB patch blobs.
- **[owner]** Remove the stale `~/Applications/Aux.app` launcher for the retired build, and the four Codex worktrees under `~/.codex/worktrees/aux-*` whose commits are already in `main` (if Codex isn't using them). Archive the four old state folders (decision 3).
- Before any CI: decide what can run off this Mac. The build needs the durable checkout and the `out/` inputs.

## 8. Owner and agent lists

The two working lists are at the top of this page.

## 9. Already done (don't redo)

- Mock Keychain is no longer forced; only the launcher passes it.
- Wire protocol and key domains are Aux; the supplied addon, carrier and Keychain interposer are gone.
- Daemon uses `api.`/`share.getaux.co`, history sync is unreachable, the PostHog key is replaced, and `index.mjs` is a 198-byte stub.
- The billing route and test routes are guarded; Pro, relay, Discord and the extra feedback entries are gone; formatting is pinned to English.
- No "aside" text in any image (OCR over every bundled raster).
- chrome://version logo, Help links to `app.getaux.co/docs`, Info.plist version and copyright.
- Supervisor backoff, native-messaging capture off the UI thread, bounded shutdown on peer loss.
- Hosted: billing and hosted AI removed, account purge, device-bound sync routes, scoped middleware, share limits and revoke script, separate readiness token, migration 013 live, cron healthy on the Pro plan.
- Zero TODO, FIXME or HACK in the 529 Aux-owned native files.

## Order

```
Decisions (1) ─► product batch (2) ─► D12 grants ─► acceptance (3) ─► fix batch ─► release build + Sparkle + signing (5) ─► release
Hosted (4) and external gates (6) run alongside; reproducibility (7) lands before the first public build.
```

The release-critical path is gated by the D12 grants, the Developer ID import and provisioning profile, and the owner accounts in section 9. Native builds and real launches bound the agent work. The REPL and ChatGPT can ship later as updates if Apple or OpenAI haven't answered.
