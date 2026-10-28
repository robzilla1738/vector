# Aux workspace

Aux is a Chromium-based macOS browser. It reuses the Aside implementation the owner supplied and rebrands it as Aux, keeping its UI and behavior 1:1. It is not a clean-room rebuild.

Read first: [README](README.md), [STATUS](docs/STATUS.md) (the only live state page), and the [product contract](docs/design/aside-contract.md). These rules are current. Dated plans, receipts and the archive record earlier decisions; when they disagree with this file, this file wins.

## Product

- Reuse the supplied source and packages directly: component structure, CSS, typography, layout, interactions, daemon, Agent extension, CLI, helpers and runtime. Do not substitute newly designed screens or behavior. Where the supplied implementation and older Aux code differ, the supplied implementation wins.
- One owner-approved exception (2026-10-28): the Agent layer in the [agent model plan](docs/plans/2026-10-28-agent-model.md), meaning the customizable agent, its home thread, side chats and the sidebar agent button. It is built from the supplied components and tokens and is not precedent for redesigning other surfaces.
- Change only what Aux needs: names, artwork, bundle/extension identities, state locations, endpoints, and the platform adaptations Aux Chromium requires. Keep branding changes and platform changes in separate, count-checked, reviewable patches. No unrelated visual or functional changes.
- The canonical logo is `assets/brand/arch-mark.svg`. Keep both paths and its 1024 viewBox; derive every app, extension and UI asset from it.
- Scope: users bring provider API keys (BYOK) or sign in with a supported subscription (ChatGPT/Codex, Claude Pro/Max, GitHub Copilot, Kimi, Meta, Grok; owner, 2026-10-28). No Aux payments, subscriptions or hosted credits. No built-in password manager or Vault; users bring their own (for example 1Password) through browser extensions, and that compatibility must be verified, not assumed. Routines run on the selected device only. Platform: Apple silicon, macOS 27. Distribution, notarization and release are in scope (owner, 2026-10-28); the plan is [release readiness](docs/plans/2026-10-28-release-readiness.md). Deferred: backups as a product feature, mobile, legacy migration.

## Identity

- Every delivered name, endpoint, identifier and protocol should end up Aux. On the current candidate the wire protocol (`AuxDaemonSessionToken`, `AuxSessionToken`, `aux.daemon.auth.`, `Aux Daemon Auth v1\0`, health `service:"aux-daemon"`, `Aux.*` commands) and the key domains (`aux.dk.v2`) are already Aux (audit 2026-10-27). The supplied addon and its carrier were unreachable and are removed; no `AsideNative` symbol ships. The historical Keychain interposer `libaux-native-boundary.dylib` and the unloaded guard and probe files were removed too (owner-approved, 2026-10-27), so no Aside Keychain group or prefix ships. Legacy `aside.*` storage keys survive only as readers beside their `aux.*` successors.
- Replacing that addon or any persisted format is a versioned migration, not a branding edit: change every caller and receiver together, never decrypt old ciphertext under a renamed domain, and never reset keys, delete credentials or read owner state to make it work. Keep the current accepted app intact until its successor is verified.
- HTML's `aside` element and required third-party legal notices are not branding. Original source inventories and historical evidence stay truthful.

## Inputs and owner data

- Authorized static inputs: `~/Downloads/aside-rea 2`, `~/AI Blueprints/06`, installed component packages under `~/Library/Application Support/Aside/`, and the frozen copy at `out/provided-source-snapshot-1.26.1016.1852` (target version `1.26.1016.1852`). Pin exact files and hashes. Tests read the frozen copy because the installed Aside keeps updating.
- Owner profiles, accounts, credentials, Keychain items and OS grants are never source material. Ask before touching them.
- Keep Aux isolated from Aside: its own home, app data, installation identity and ports (daemon 21520, bridge 21522, CDP 45203). Never connect to, stop or replace the owner's Aside.

## Working rules

- Stay local by default: no push, hosted Actions or provisioning without the owner's yes for that action. Candidate reseals go through the approved repair executor (`scripts/candidate/repair_combined.py`; plans from `freeze_plan.py`, edits from `prepare_edits.py`) with the existing local identity. Release builds may be signed with `Developer ID Application: Robert Courson (9F2JXY8TCK)` with hardened runtime and secure timestamps, notarized with the existing team notary profile and stapled (owner, 2026-10-28). Publishing a release (uploading downloads, publishing the appcast) is outward-facing: confirm each one with the owner. Sparkle uses a dedicated Aux key; never reuse another app's. Other earlier signing authorizations are historical.
- Commit coherent slices to local `main`. Parallel lanes use separate worktrees under `/Users/rcourson/Documents/Vibe/aux-worktrees/`, never `/private/tmp`: macOS purges it. Remove a worktree once its commits are delivered.
- Never hard-code the repository path. Use `scripts/lib/repo-root.mjs` (JS) or a path relative to the script. Live build inputs never live under `/private/tmp`.
- Chromium checkout: `/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src` (`scripts/aux_chromium.py`, `scripts/lib/aux-chromium.mjs`; `AUX_CHROMIUM_SRC` overrides). It holds owner changes: never reset it or delete unrelated files. Serialize native builds with `python3 scripts/native-build.py <command>`, which holds `/tmp/aux-build.lock`. See [chromium/BUILDING.md](chromium/BUILDING.md).
- Launch only with disposable profiles and state homes and `--use-mock-keychain` (the launcher passes it). The build itself now uses the real Keychain by default (D2), so never launch the candidate without the launcher. The switch does not prove helper Keychain calls are confined; verify those separately.
- Never print or commit credentials. AI checks use only `vercel-ai-gateway/meta/muse-spark-1.3-contributor` through the product's own credential API, within the recorded spending authority (`docs/integration/proposed/completion-20261026/integration/ordinary-chat/resume-spending-authority.json`), and remove the test credential afterward.
- Verification: run `pnpm test` for every change. Then focused checks for the boundary you changed, and a real disposable launch for UI or behavior. Passing tests or hashes are not UI/behavior parity. Record observed results and gaps in STATUS.
