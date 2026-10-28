# Aux outcome inventory

Updated 2026-10-28. [STATUS](STATUS.md) is the live summary of the build. The working plans are the [pre-release completion plan](plans/2026-10-27-pre-release-completion.md) and the [excellence audit](plans/2026-10-27-excellence-audit.md). Everything between the current seal and a public release is in the [release readiness checklist](plans/2026-10-28-release-readiness.md). This page tracks the outcomes those plans aim at and what gates each one. The October 21–26 versions of this page are in Git history and `archive/`.

## Milestones

- **Local product:** the combined supplied implementation launches normally, the Aux UI is accepted, and R01–R19 and R21–R30 plus the core browser and agent journeys pass on one seal. External dependencies stay named and don't hold up the local handoff.
- **Full pre-release:** local product plus the Bash/PTY/CLI REPL, eligible ChatGPT plan use, 1Password compatibility, the hosted integration and non-backup operations.
- **Public release:** full pre-release plus the decisions, product blockers, signing, notarization, updates and hosted operations in the release checklist. Currently out of scope in AGENTS.md until the owner lifts the deferral.
- Platform: Apple silicon, macOS 27. Deferred: backups as a product feature, legacy migration, mobile, payments and Aux-funded inference. No built-in Vault.

## Outcomes

Current seal: `b606bf7c` (`out/provided-candidate-completion-20261026-a1/Aux.app`).

| Outcome | State | Remaining | Gated by |
|---|---|---|---|
| Startup and shutdown | Startup, Quit, abort and relaunch observed on `7f810851` to `fda5a3a7`; bounded peer-loss shutdown (about 10 s after a crash) | Menu Quit through the UI; daemon relaunch after it dies mid-session; an "agent unavailable" state | D12 grants |
| Desktop R01–R30 (no R20) | Organization and split journeys observed on earlier seals; UI passes 2026-10-27/28 resealed through `b606bf7c` | The full [JOURNEYS.md](../scripts/acceptance/JOURNEYS.md) pass on one seal, then one fix batch | D12 grants |
| BYOK, context, files, memory, tools | Passed on earlier seals only | Muse journey, REPL `aux.pdf`, cancel and restart on the current seal | D12 grants |
| Identity | Wire protocol, key domains and visible branding are Aux; the supplied addon, carrier and Keychain interposer are removed | Package leftovers: owner and Aside paths in `bundle.json`, `.pyc` files and the venv; At Inc.-signed runtime binaries; mixed naming | Agent batch |
| Google and Chrome surfaces | Lens and AI Mode menu items gone; Glic, Lens and Compose off by switch; chrome://version logo and Help links are Aux | Feature defaults instead of the switch; sign-in and sync, iOS promo, API-keys infobar; remaining "Chrome" strings; About page credit | Agent batch |
| REPL (Bash/PTY/CLI) | Source complete, rebased and inactive | Activation and its six journeys | Apple `2H4D7KNGUP` |
| 1Password | Native-messaging capture is off the UI thread | Developer ID copy in `/Applications`, vendor account, autofill and pairing (R18) | Owner (p12 import, profile), vendor account |
| ChatGPT plan | Adapter and eligibility packet ready | Submit the form; Aux client ID; sign-in, consent, inference, refresh and revoke | Owner, then OpenAI |
| Hosted service | Live since 2026-10-27 on `dpl_FCyG1B6SzBg4CTUSYpwru7krBxHo`; migration 013; cron healthy; J5 steps 8 and 9a passed | Deploy `09c024eba` and `608f900e3`; monitoring and alerts; J5 step 10; sign-in bot protection; env cleanup | Owner |
| Legal and public pages | Terms, privacy, docs and community live, built from the owner-confirmed answers | Governing-law state, processor regions; right to distribute the supplied code; npm notices | Owner |
| Release mechanics | Info.plist version and copyright set; Sparkle hooks in the tree but not buildable | Entitlements, final state folder, release flags build, Developer ID, notarization, Sparkle, DMG, Chromium update process | Owner decisions, then agent |
| Reproducibility | `verify-candidate.py` passes (89 pins); `chromium/tree` matches the checkout | Clean apply plus build; one documented rebuild path; tests for the release tools | Agent |
