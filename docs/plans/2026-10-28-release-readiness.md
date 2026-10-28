# Aux release readiness

2026-10-28. Everything that stands between the current seal and a public, signed, self-updating macOS release. It builds on [STATUS](../STATUS.md), the [excellence audit](2026-10-27-excellence-audit.md) and three read-only audits run today, whose full tables with file and line evidence are in [2026-10-28-release-audit/](2026-10-28-release-audit/) ([native](2026-10-28-release-audit/native.md), [service](2026-10-28-release-audit/service.md), [components](2026-10-28-release-audit/components.md)). Nothing was built, launched, signed or deployed for this list.

Baseline on 2026-10-28: candidate seal `b606bf7c`. `pnpm test` gives 416 pass, 0 fail, 5 skipped. `verify-candidate.py` checks 89 pins and 11,191 entries, with 0 differences. Service tests pass 64/64 and `tsc` is clean. `chromium/tree` matches the durable checkout. No desktop journey has been driven on this seal, because the OS grants (D12) are still missing.

The owner put distribution, notarization, release and Developer ID signing in scope on 2026-10-28 (AGENTS.md updated), and decided or delegated every open question (section 1).

Legal and licensing (distribution rights, third-party licenses and notices, terms and privacy facts) are handled separately by the owner and are not on this list; the [audit tables](2026-10-28-release-audit/) keep those findings for reference.

Each item is marked **[owner]** (only Robert can do it), **[agent]** (Claude can do it, with the build, reseal and test the rules require) or **[external]** (waiting on a third party).

## 1. Decisions (owner, 2026-10-28)

Robert answered the first six; for the rest he asked for whatever gives the best product, so those are Claude's calls, recorded here.

| # | Question | Decision |
|---|---|---|
| 1 | Subscription sign-in providers (Claude Pro/Max, Copilot, Kimi, Meta, Grok, the `openai-codex` login) | Keep: users can sign in with them. The provider list in the contract and AGENTS.md is widened to match. Each one still needs a real sign-in check in the acceptance pass |
| 2 | Release scope and signing | Allowed: distribution, notarization, release and Developer ID signing (`Developer ID Application: Robert Courson (9F2JXY8TCK)`) |
| 3 | Final state location | `~/Library/Application Support/Aux` and `~/Library/Caches/Aux`, the standard single-word form (as Arc uses `Arc`). On this Mac `Aux`, `Aux Browser`, `Aux Browser A38 Disposable` and `Aux Browser Completion 20261026` already exist from earlier builds; move them to an archive folder, with the owner's yes, before the first launch of a release build, and never let the release adopt them |
| 4 | Where updates and downloads live | The getaux.co website: `getaux.co/download` for the DMG and `getaux.co/updates/appcast.xml` for Sparkle. The DMG and update archives sit in a public Vercel Blob store (they are too large for a deployment) and the site links or redirects to them. Every release is immutable; the feed is published only after its files exist |
| 5 | Version scheme | Aux 1.0.0 as the public version (`CFBundleShortVersionString`), with an integer `CFBundleVersion` that increases on every build. Components keep their supplied internal versions, so the daemon health check must stop pinning `1.26.1016.1852` |
| 6 | Crash reports | Opt-in, off by default: Aux asks once after the first crash. Crashpad minidumps go to Sentry's native minidump endpoint, with no URLs or page content attached. Needs a Sentry project (owner) and a privacy-page line (handled with legal) |
| 7 | Safe Browsing | On. Chromium's built-in protection needs a Google Safe Browsing API key. Google limits that API to non-commercial use and points commercial products to the paid Web Risk API, which needs an application and approval. Aux takes no payments, so check which applies, then get the key and Claude wires it in. Until then, ship with Safe Browsing off and the API-keys infobar suppressed |
| 8 | Widevine (Netflix, Spotify, Disney+) | On. Needs a Widevine license from Google (widevine.com) and VMP signing of every release, for example through castLabs EVS. Claude adds the signing step to the release script once the license exists. Proprietary codecs (H.264, AAC) stay on |
| 9 | Languages | English plus Spanish, French, German, Portuguese (Brazil), Italian, Japanese, Korean, Simplified and Traditional Chinese at launch. These are all left-to-right, which Aux's views already handle; Arabic and Hebrew follow once RTL works. Chromium's own strings already cover them; Aux must translate its extension UI, its native literals (about 290 move into `.grd`) and its reworded Chrome/Chromium strings in each locale, and unpin the extension from English (D8) |
| 10 | `dev-cloud.getaux.co` | Retire it. Bundle the 46 built-in skill icons in the app (faster, private, offline), then remove the alias once no shipped build points at it |
| 11 | Hosted site calling the local daemon | Yes, for `app.getaux.co` only. Drop `api.getaux.co` (it serves no pages, so it only adds attack surface). Every call still needs the daemon's session token |
| 12 | Alerts and operations | Alert recipient `robertcourson96@gmail.com`. Uptime: a Better Stack monitor on readiness every 3 minutes, alerting after 2 failures. Sign-in abuse: Vercel BotID on the email-code route plus a Vercel Firewall rate rule. Preview builds: `check-environment` requires the readiness secret only in production (no production secrets copied to Preview) |
| 13 | Repository identity | Fix `.git/config` so commits are `robzilla1738`. Don't rewrite history: receipts cite commit hashes, and a rewrite would break them. If code is ever published, publish a fresh export, not this history. Push `main` to the private `robzilla1738/vector` remote as the off-machine copy, once the owner confirms the remote is private |
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
- **1Password:** a Developer ID copy in `/Applications`, a disposable vendor account, and the official extension's autofill. Its native host runs in a sandbox that denies fork and exec, so check whether the desktop-app pairing works at all, then accept R18.

## 7. Reproducibility and repo (agent unless noted)

- Prove one clean `chromium-tree.py apply` plus a full build. Record the tree manifest hash in every native receipt. Fix the dangling `node_headers` symlink left by the web→Aux rename.
- A fresh `stage:provided` stops at the Agent revision review, so only the repair chain defines the candidate. A release needs one documented rebuild path: either reproduce from source, or accept the A38 base plus the repairs as the input and keep it backed up.
- Add tests for the repair executor, `verify-candidate.py` and `aux_drive.py`. Run `verify-candidate.py` from `pnpm check`. Make about 15 input-dependent tests fail instead of skipping when an input is missing. Move the staging imports out of `docs/integration` into `scripts/`.
- Repo weight: 203 MiB packed, mostly multiple versions of 28.8 MB patch blobs.
- **[owner]** Remove the stale `~/Applications/Aux.app` launcher for the retired build, and the four Codex worktrees under `~/.codex/worktrees/aux-*` whose commits are already in `main` (if Codex isn't using them). Archive the four old state folders (decision 3).
- Before any CI: decide what can run off this Mac. The build needs the durable checkout and the `out/` inputs.

## 8. Accounts and approvals only the owner can get

- Import the Developer ID p12 into the login Keychain, and create the Developer ID provisioning profile for `dev.aux.browser.daemon`.
- Accessibility and Automation for the terminal running Claude, or Computer use (D12).
- Google Safe Browsing key, or Web Risk approval (decision 7).
- Widevine license and a castLabs EVS account (decision 8).
- Sentry project for crash reports (decision 6).
- Better Stack account for uptime alerts (decision 12).
- A public Vercel Blob store for downloads, or approval for Claude to create one in the personal team (decision 4).
- Confirm `robzilla1738/vector` is private before the first push (decision 13).

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
