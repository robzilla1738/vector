# Aux release readiness

2026-10-28. Everything that stands between the current seal and a public, signed, self-updating macOS release. It builds on [STATUS](../STATUS.md), the [excellence audit](2026-10-27-excellence-audit.md) and three read-only audits run today, whose full tables with file and line evidence are in [2026-10-28-release-audit/](2026-10-28-release-audit/) ([native](2026-10-28-release-audit/native.md), [service](2026-10-28-release-audit/service.md), [components](2026-10-28-release-audit/components.md)). Nothing was built, launched, signed or deployed for this list.

Baseline on 2026-10-28: candidate seal `b606bf7c`. `pnpm test` gives 416 pass, 0 fail, 5 skipped. `verify-candidate.py` checks 89 pins and 11,191 entries, with 0 differences. Service tests pass 64/64 and `tsc` is clean. `chromium/tree` matches the durable checkout. No desktop journey has been driven on this seal, because the OS grants (D12) are still missing.

AGENTS.md still lists distribution, notarization and release as deferred, and it limits signing to local Apple Development reseals. Sections 1 and 5 can't start until the owner lifts that.

Each item is marked **[owner]** (only Robert can do it), **[agent]** (Claude can do it, with the build, reseal and test the rules require) or **[external]** (waiting on a third party).

## 1. Decisions to make first

These change what gets built, so they come before the next native batch.

1. **[owner] The right to distribute the supplied Aside implementation.** The repo records Robert's instruction to reuse the supplied packages. It records no license, assignment or written permission from At Inc. (Aside's publisher, team `8CPD4K4TBB`) to copy, modify or redistribute the Agent extension, daemon, CLI, runtime or UI. Parts were reconstructed by disassembly. A public release needs that permission in writing, or replacement components. Everything below assumes it is settled.
2. **[owner] Anthropic skill files.** The daemon ships the built-in `docx`, `pptx` and `xlsx` skills under "© 2025 Anthropic, PBC. All rights reserved", whose license forbids redistribution. Remove them or get permission.
3. **[owner] Out-of-scope sign-in providers.** The contract allows bring-your-own keys or an eligible ChatGPT plan. The daemon still holds the Codex CLI's OAuth client ID as the `openai-codex` login, and the UI offers subscription reuse for Claude Pro/Max, GitHub Copilot (it sends VS Code headers), Kimi, Meta and Grok. Recommendation: remove or hide every one without its own permission, and keep ChatGPT behind the eligibility approval.
4. **[owner] Release scope and signing rules.** Lift the deferral of distribution, notarization and release in AGENTS.md and the contract. Reconcile the Developer ID rule: AGENTS.md says "no Developer ID", while STATUS records approval of one Developer ID copy for the 1Password test.
5. **[owner] Final state location.** The binary hard-codes `~/Library/Application Support/Aux Browser Completion 20261026` and `~/Library/Caches/Aux Browser Completion 20261026`. Choose the shipping name, for example `Aux`, before anyone has data, because renaming it later is a migration. `~/Library/Application Support/Aux` may already hold state from the retired independent build.
6. **[owner] Update and download hosting.** Choose where the Sparkle appcast and the DMGs live (getaux.co or GitHub Releases) and who owns the update signing key.
7. **[owner] Version scheme.** `1.26.1016.1888` is derived from Aside. Pick Aux's own public version (for example 1.0.0) and a monotonic `CFBundleVersion` for Sparkle.
8. **[owner] Crash reports.** The privacy page says no crash upload, and the crash scaffolding in the tree is unwired. Ship none, or wire it up with consent and update privacy.
9. **[owner] Safe Browsing and Google services.** No Google API key is configured, so Safe Browsing phishing and malware protection is off and the "Google API keys are missing" infobar can appear. Decide: ship without Safe Browsing (and say so), or get keys. Then suppress the infobar either way.
10. **[owner] Widevine and codecs.** The flags enable Widevine and proprietary codecs. DRM playback (Netflix, Spotify) in a non-Google browser needs a Widevine license and VMP signing (for example through castLabs). Decide whether DRM is in scope. Proprietary codecs (H.264, AAC) carry their own patent-licensing question.
11. **[owner] Localization.** The extension is pinned to English (D8). Chromium is localized, RTL is essentially unsupported in Aux views, and about 290 Aux UI strings are literals. Decide whether launch is English-only.
12. **[owner] `dev-cloud.getaux.co`.** It points at production but production CORS refuses it, and 46 built-in skill icons load from it. Keep it, or remove it after the icons move.
13. **[owner] Daemon CORS.** The production-cloud edit re-added `app.getaux.co` and `api.getaux.co` to the daemon's trusted origins after the audit removed remote origins. Decide whether the hosted site may call the local daemon.
14. **[owner] Repository identity.** `.git/config` sets `user.name` to the literal `user.email`. About 4,900 commits in this personal repo carry the B&G work email. Fix the config, and decide whether to rewrite authorship before the repo or its history goes anywhere public (a history rewrite needs your yes). The 4,105 local commits are not pushed. AGENTS.md forbids pushing, so the only off-machine copies are the ref bundles and the 2026-10-27 encrypted backup, made before the evening of 2026-10-27 and everything committed since.

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
- Suppress the API-keys infobar (see decision 9).
- Reword the 8 remaining "Chromium" strings (mostly SSL interstitials) and the reachable share of 339 "Chrome" strings ("Sign in to Chrome", "Download Chrome for iOS", update strings). Remove the "Gemini in Aux" strings, which would be false claims.

### Agent and daemon
- **Daemon recovery.** On the shipping native route a retry can't relaunch a dead daemon, so the agent stays down until the browser restarts. There is also no "agent unavailable / retry" state in the UI.
- **Version pin.** The health check pins daemon version `1.26.1016.1852`, which breaks the first update that bumps it.
- **Inherited keys.** AWS/Bedrock credentials, `HF_TOKEN` and about 12 other provider variables still pass from the launching environment into the daemon.
- **Dead code with security weight.** The Vault passkey broker is still in the WebAuthn path, and the Vault extension ID is still trusted for CDP. Remove both, along with the legacy carrier route (`RunCarrier`) and the shell-era `chrome://aux` host in `webui_browser/`.
- **Dead help link.** The messenger bot setup links to `127.0.0.1:9/aux-unavailable/docs/help/channels-*.md`.
- **Skill icons.** Bundle the 46 icons locally, or serve them from `app.getaux.co`.
- **CDP.** Cap challenges per peer (today it is 1,024 in total).
- **Bugs.** `isAux` is hard-coded false in settings, which breaks the Library's return to History after clearing data. One timestamp still follows the system locale.

### Licensing in the bundle
- Ship third-party notices for the npm dependencies of the extension and the daemon. Node, Python, Rust/ONNX and the filter lists are already covered.
- Add the Sparkle license once Sparkle ships.

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
- Add an uptime monitor on readiness, an alert recipient, a log drain and firewall rate rules. Today a failing cron returns 500 and nobody is told.
- Add bot protection for the email-code sign-in. It shares a global cap of 300 sends an hour, so a spread-out attack can block every real sign-in.
- Run J5 step 10 (delete the test account) and its cleanup check. It is the only live proof that the purge works.
- Previews fail on `AUX_READINESS_SECRET`. Either add it to Preview, or let Claude make `check-environment` require it only in production.
- Remove the stale Stripe and hosted-AI variables, and mark the database URLs, Postgres passwords and Blob token as sensitive.
- Confirm the Neon point-in-time restore window.
- Legal: name the LLC's state of organization (governing law), and confirm the Blob, Clerk and Resend regions.

Agent:
- Turnstile or an equivalent check on the email code.
- An operator-blocked share state. Today the owner can republish a share the operator took down.
- An end-to-end purge test. The current test only checks that every user table is listed.
- Clear the share title on unshare.
- JSON auth and recovery logs that carry the request ID.
- Bump zod past 4.6.6 (the one high advisory) and apply the Clerk, Hono and Next patch releases.
- Show the terms at desktop email-code sign-up, and record age with consent.
- Point `getaux.co/policy/*`, `/docs` and `/community` at `app.getaux.co`, or add redirects. Decide on `/support`.
- Add a lint script.

## 5. Signing, notarization and updates (needs decision 4)

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
- **[owner]** Remove the stale `~/Applications/Aux.app` launcher for the retired build, and the four Codex worktrees under `~/.codex/worktrees/aux-*` whose commits are already in `main` (if Codex isn't using them).
- Before any CI: decide what can run off this Mac. The build needs the durable checkout and the `out/` inputs.

## 8. Already done (don't redo)

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

The release-critical path is gated by decisions 1–5, the D12 grants and the Developer ID import. Native builds and real launches bound the agent work. The REPL and ChatGPT can ship later as updates if Apple or OpenAI haven't answered.
