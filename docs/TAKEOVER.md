# Aux takeover

This is the handoff for the official Chromium build. It stops before Developer ID signing, Apple notarization submission, production update hosting and release. The Electron package commands in `docs/packaging.md` apply to the development preview and do not qualify this browser.

## Current gate

`scripts/chromium-sign.mjs` plans Chromium's `sign_chrome.py` pipeline and an ad-hoc DMG. It requires an **official static** build (`is_component_build=false`, `is_debug=false`) containing `Aux.app` with bundle ID `dev.aux.browser`, `Contents/Helpers/Aux Runtime`, and generated `* Packaging/sign_chrome.py`. The existing `out/AuxProof` is a component proof named `Aux Host Proof`; a dry run correctly reports it unready. No official ad-hoc app or DMG is claimed by these scripts.

From the Aux repository, after the native lane completes the official build:

```sh
node scripts/chromium-sign.mjs --input /absolute/path/to/chromium/src/out/AuxRelease --output "$PWD/release/official-adhoc"
```

Review its JSON preflight. Then, only for the official static build:

```sh
node scripts/chromium-sign.mjs --input /absolute/path/to/chromium/src/out/AuxRelease --output "$PWD/release/official-adhoc" --execute
```

The script calls the generated Chromium signer with `--identity - --development --notarize none --disable-packaging`, verifies the app signature and bundle ID, creates a local DMG, and writes `Aux-release.json` with a SHA-256 digest. It refuses existing output instead of replacing it. Keep `release/` local; do not send Profiles, credentials or personal screenshots with the build.

## Owner signing and Apple service

Set the Team ID and Developer ID Application identity in the official build configuration. The signing planner accepts `--team-id` and `--identity` together and checks the resulting Team ID after signing. The owner manages the signing key in Keychain. Use a new output directory so the ad-hoc artifact remains available for comparison. Do not use the ad-hoc signature for Keychain continuity or 1Password qualification.

Request the browser passkey entitlement with [the prepared text](APPLE-PASSKEY-ENTITLEMENT-REQUEST.md), install the approved provisioning profile, and verify Aux-owned application and Keychain groups on the signed app and relevant helpers. Do not add the restricted entitlement to an ad-hoc build.

`scripts/chromium-notarize.mjs` is deliberately dry-run only. It checks for a Developer ID app signature and prints `notarytool`, stapler and Gatekeeper commands without submitting anything:

```sh
node scripts/chromium-notarize.mjs --app /absolute/path/to/Aux.app --dmg /absolute/path/to/Aux.dmg --profile YOUR_NOTARYTOOL_PROFILE
```

After the owner authorizes and executes notarization, retain Apple’s request ID, acceptance log and stapler output under local `release/test-artifacts/`. Store credentials in a Keychain notarytool profile, never in arguments or checked-in files.

## Takeover dry runs

Each script below prints prerequisites, exact actions and evidence to capture. The all-case run can write a local JSON plan. These dry runs do not open accounts, touch Profiles, or qualify a release.

```sh
node tests/takeover/run.mjs --output "$PWD/release/test-artifacts/takeover-plan.json"
node tests/takeover/keychain-continuity.mjs
node tests/takeover/onepassword.mjs
node tests/takeover/passkey.mjs
node tests/takeover/sparkle.mjs
node tests/takeover/notarization.mjs
```

The owner runs the real tests with a disposable macOS user, test accounts, signed N and N+1 apps and an isolated local feed. Keep raw evidence local and summarize redacted outcomes in `docs/EVIDENCE.md`. Keychain continuity requires a stable Team ID signature across both builds. 1Password requires its desktop app and test account. Platform passkeys require Apple's approved entitlement. Sparkle requires a locally held test EdDSA key and N/N+1 builds. See each generated case plan for the observations to record.

## Founder test script

Use a fresh regular Profile and a separate private Profile. Record build hash, macOS version, machine, window dimensions, test account identities and each pass/fail with a reproducible note. Test at least one site with a login popup, one extension and one long task.

| Area | Founder action and expected result |
| --- | --- |
| Browsing and organization | Browse, group and split tabs; create Spaces; switch horizontal and liquid-glass vertical layouts; test floating sidebar, restore, bookmarks, imports and private separation. |
| Search and command | Use the command bar for a URL, history, bookmark, tab, task and command; test scope pills and a changed search engine. |
| Page intelligence | Ask from Home and a page selection, capture a region, use Reader/translate, test Docs/PDF extraction and dictation. |
| Agent execution | Run a typed workflow and code mode with a subagent, observe real native pages, stop it, then retry after restart. |
| Human control and safety | Steer, queue, stop and take over during a pending action; verify no later dispatch, inspect approval and journal entries. |
| Automation and reuse | Save and rerun a Skill, import one plugin with no initial authority, trigger an automation and inspect its result. |
| Connectors and external agents | Scope an inbound MCP token, revoke it; approve one outbound MCP server and one tool, then revoke both; exercise Calendar and GitHub. |
| Artifacts and work | Produce cited report, table, DOCX, PPTX and chart; open them in native apps; inspect version history and isolated HTML. |
| Memory and recall | Opt in to extraction, recall a fact with source, Forget it, and confirm it no longer appears. |
| Compatibility and platform | Install and relaunch an extension, test passwords/passkeys, native messaging, per-site permissions, update N→N+1 and rollback. |

## Known release gates

- The official static Aux build, ad-hoc DMG and native release verification are still required.
- Developer ID, notarization, stable Keychain signature, 1Password and passkey tests depend on the owner and external services.
- Sparkle N→N+1/rollback, crash reporting consent, Electron profile migration, complete native journeys and performance measurements must be recorded before release.
- No publication, production feed hosting or personal-data migration occurs at this stop line.
