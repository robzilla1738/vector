# Aux workspace

Aux reuses the implementation supplied by the owner, preserving its UI and behavior while changing branding, assets and identifiers to Aux. Independently recreating the product is not the objective. The owner's explicit direction on 2026-10-19 supersedes the clean-room rebuild plan and its source-reading/copying restrictions.

Read `README.md`, `docs/design/aside-contract.md`, `docs/plans/2026-10-19-supplied-implementation-reuse.md` and `docs/STATUS.md` first. Earlier independent components remain recoverable in Git; they are not the default product implementation merely because they already exist.

## Implementation policy

- Reuse the supplied source and packaged implementation directly. Preserve component structure, CSS, typography, layout, interactions and behavior. Do not approximate them with newly designed screens.
- Change product names, Aux artwork/icons, bundle and extension identities, state locations and identifiers consistently across the stack. Make only integration changes necessary for Aux Chromium and local boundaries.
- The owner-provided `arch-mark.svg` (2026-10-19) is the canonical Aux logo. Preserve its complete two-path geometry and viewBox in `assets/brand/arch-mark.svg`; derive app, extension and UI assets from that SVG. Do not reuse the retired raster-derived mark or independently redraw it.
- Keep a pinned source inventory and reviewable count-checked patches. Separate branding/identifier changes from necessary platform adaptations. Do not introduce unrelated visual or functional changes.
- Preserve supplied public wire contracts: `AsideDaemonSessionToken`, `AsideSessionToken`, `aside.daemon.auth.`, `Aside Daemon Auth v1\0`, health `service:"aside-daemon"`, and `Aside.*` extension/CDP commands. Aux branding and isolated endpoints do not require renaming these protocol bytes.
- Preserve original cryptographic derivation labels and wrapped-key formats, including `aside.dk.*` HKDF domains. Isolate storage with the actual Aux home/query boundary; do not rename cryptographic domains as branding.
- The supplied implementation wins when existing independent Aux code differs. Reuse its daemon, Agent/Vault extensions, CLI, helpers and runtimes where needed to preserve behavior. Do not force its UI onto a replacement backend merely to retain prior work.
- Authorized static inputs include `~/Downloads/aside-rea 2`, `~/AI Blueprints/06` and installed component packages under `~/Library/Application Support/Aside/`. Agent/Vault target version is `1.26.1016.1852`; pin exact files/hashes. Static implementation copying is authorized; owner accounts, profiles and credentials are not.
- This is implementation reuse and rebranding. Do not claim clean-room provenance or require authorized reused files to differ from their supplied originals.

## Working rules

- Current development priority: preserve Aside UI and behavior 1:1 with Aux branding. Do not run signing, provisioning or release preparation as part of this work; the owner explicitly removed them from the development path. Existing scoped signing evidence is historical.
- Commit coherent slices to local `main`; parallel lanes use separate worktrees and deliver commits. Integrator owns root manifests, packaging, patch series, shared native registration/GN files and startup.
- Stay local. Never push, run hosted Actions, sign, provision, notarize or release during current development. Earlier authorization for the three disposable Aux authentication helpers and its resulting evidence are historical; do not resume that signing workflow as part of the current UI/behavior fidelity work.
- Preserve owner changes in the Chromium checkout. Never reset it or delete unrelated files. Serialize native builds with `scripts/native-build.py` and `/tmp/aux-build.lock`.
- Use disposable profiles/state homes. Ask before touching the owner's real profiles, credentials, Keychain material or OS grants. Reusing static code does not authorize reading owner data.
- Keep Aux home/app data, daemon/bridge/CDP ports and installation identity isolated from Aside. Do not connect to, stop or replace the owner's Aside daemon.
- Never print or commit credentials. AI tests use only `vercel-ai-gateway/meta/muse-spark-1.3-contributor`; configure through the actual implementation's credential API and remove test credentials afterward.
- Use `--use-mock-keychain` for unsigned Chromium. Verify helper/auth isolation separately; the switch does not prove custom Keychain calls are confined.
- Keep verification lean: focused checks for changed boundaries, disposable launch and real UI/behavior observation. Verify fidelity against the supplied implementation before declaring readiness.
- Record actual evidence and gaps in `docs/STATUS.md`. Earlier evidence remains historical, not proof that a newly reused stack works.
