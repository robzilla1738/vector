# Aux: reuse the supplied implementation and rebrand it

Status: active. Owner direction, 2026-10-19. This supersedes the clean-room reconstruction plan and instructions to independently recreate the product.

Launch scope update, 2026-10-23: ship without Aux payments. Reuse BYOK and integrate eligible ChatGPT/Codex plan connections; defer Aux subscriptions, paid tiers and Aux-funded inference while preserving the current UI. See [the active provider-funded launch plan](2026-10-23-provider-funded-launch.md). Earlier Stripe requirements are future paid-release work, not launch prerequisites.

On 2026-10-20 the owner explicitly authorized bounded local development signing to resolve the real account startup failure. That exception is implemented for the copied v498 development app and previously approved disposable Aux scope; see `docs/acceptance/provided-v498-local-auth-repair.json`. It does not authorize release, owner-profile access or unrelated OS grants. Broader no-signing statements below retain their ordinary-development scope outside this repair.

## Native frame fidelity — owner direction 2026-10-20

Where original custom C++ is absent, use the supplied recovered native functions, extracted resources/tokens and observed Aside desktop behavior to port the implementation into Aux Chromium. The owner explicitly authorized this approach after the source audit; lack of original C++ is not a blanket blocker. Keep provenance precise: recovered-function ports are not original source copies. Do not invent substitute screens or tune arbitrary geometry without reference evidence.

This pass targets full-height sidebar/adjacent toolbar topology, native address-bar treatment, sidebar controls and colors. Owner follow-up screenshots explicitly require zero reserved sidebar width when collapsed, edge-hover reveal as an inset floating panel with continuous motion, and a full-height right-hand Agent panel using its supplied header and current-page context. A simple collapsed rail or basic open/close check does not satisfy this acceptance. Compare actual desktop Aside and the resulting regular Aux window; keep owner content and credentials out of the Aux profile. Different account data is not a visual implementation regression. Build once with integrated changes, then fix concrete observed failures. Current no-signing scope and external-password-manager exception remain.

## Owner scope change — 2026-10-20

Aux will not include its own password manager or the supplied Vault product. Users bring their existing password managers, such as 1Password, through browser extensions. This overrides all Vault reuse, UI parity and acceptance requirements below; pinned Vault inputs remain historical source evidence, not a shipping requirement.

Implementation follow-up:
- Remove built-in Vault entrypoints, settings, onboarding, password-save/autofill prompts and packaged product surfaces.
- Decouple browser and agent/chat startup from Vault setup/unlock without bypassing installation authentication or exposing provider credentials. Audit shared consumers before removing code or resources.
- Preserve ordinary third-party extension installation and autofill; verify representative password-manager extension behavior in a disposable profile. Verify desktop companion/native messaging separately where supported by the vendor.
- Do not import or migrate user passwords into Aux. Do not delete existing credentials or owner profiles.

The local-browser pass implements Vault product removal, startup decoupling, supplied local Chat/Settings routes and native frame repairs. Runtime verification and third-party password-manager compatibility remain separate acceptance gates; see `docs/acceptance/local-browser-pass.json`. Browser UI and agent parity remain the priority.

## Complete Aux identity — owner override 2026-10-22

The owner requires all delivered product references and internal protocols to use Aux, preserving the current UI exactly. The earlier wire/crypto preservation bullets below are historical baseline constraints superseded by this direction. Migrate compatible endpoints together and version stored cryptographic formats without resetting or reading owner state. See [the active identity migration](2026-10-22-complete-aux-identity.md). Existing app acceptance does not transfer to renamed protocols.

## Goal

Reuse the implementation supplied by the owner, preserve its UI and behavior, and change its branding, assets and identifiers to Aux. Deliver the faithful local Aux browser, including the supplied daemon, Agent UI, CLI, helpers and runtimes as needed, excluding the built-in Vault/password manager. Adapt that implementation to Aux Chromium instead of replacing it with approximate screens or behavior.

Work locally on main, use parallel agents for substantial disjoint implementation, keep tests focused, and continue until the requested result is complete. No push, hosted Actions, signing, provisioning, notarization or release. Earlier scoped authentication-helper signing evidence is historical and is not part of current development work.

The owner reiterated the development priority: keep everything local and focus on 1:1 Aside UI and behavior. Do not run signing, provisioning or release preparation during this development work. Retain existing bounded authentication evidence as historical evidence and direct implementation work toward fidelity.

## Fidelity requirements

- Preserve component/rendering implementation, styles, typography, geometry, menus, states, shortcuts, transitions and workflows.
- Replace branding, Aux artwork and app/extension/bundle identifiers consistently. Keep contracts consistent across every affected caller and callee.
- Preserve the owner's explicit wire-contract exceptions: `AsideDaemonSessionToken`, `AsideSessionToken`, `aside.daemon.auth.`, `Aside Daemon Auth v1\0`, health `service:"aside-daemon"` and `Aside.*` commands. Apply Aux names to product identity and visible branding while keeping these supplied protocol bytes.
- Preserve original cryptographic formats and derivation labels, including `aside.dk.*` HKDF domains. Home/query isolation must not become a new cryptographic backend or an incompatible key format.
- Use the updated owner-supplied `arch-mark.svg` everywhere Aux branding appears. Keep its full two-path geometry/viewBox; the canonical repository copy is `assets/brand/arch-mark.svg`. Generate app/extension/menu icons and inline UI variants from it, and include source/derived asset hashes in staged provenance.
- Isolate local paths, ports, authentication identity and data from installed Aside. Local-only cloud boundaries remain explicit; never invent successful service responses to make a screen appear functional.
- Keep necessary platform adaptations small and separately reviewable. Do not redesign a surface or rebuild a supplied capability to avoid adapting it.
- Authorized source reuse is expected. Byte-identical unchanged UI/style files are evidence of fidelity; clean-room hash-inequality requirements are superseded.

## Inputs and preservation

Pin supplied material from `~/Downloads/aside-rea 2`, `~/AI Blueprints/06` and installed static component packages. Agent/Vault target is `1.26.1016.1852`. Record source roots, versions and hashes. Copy no owner profiles, accounts, credentials, Keychain items or OS grants.

Preserve the independent rebuild in Git and all existing owner/native changes. Stop further independent UI reconstruction and clean-room retirement. Keep the disposable app available until its replacement is assembled and verified. Retire processes only after verifying live identity.

## Dependency plan

1. **Pin and stage supplied implementation.** Inventory source/packages and reuse existing staging tooling where accurate. Stage immutable inputs and an explicit allowed-difference manifest. Preserve all CSS/layout/rendering files unless an Aux identity or necessary platform binding requires an edit.
2. **Brand and identify the UI.** Use original Agent/Vault entrypoints, assets and components. Replace marks/icons/names and extension identities; keep cross-extension links consistent. Do not ship generic replacement navigation, composer, settings or Vault screens.
3. **Reuse matching runtime contracts.** Restore/adapt supplied daemon, CLI, helpers and agent/memory runtime components required by the UI. Reconcile actual auth, sessions, streaming, Vault, bridge and native APIs end to end. Prefer the supplied working implementation over a broad compatibility facade on an unrelated backend.
4. **Integrate native Chromium.** Retain Aux native sidebar/frame work. Bind reused components and real private APIs to Aux identities, startup, profile/account scope, isolated ports and state. Preserve owner changes and serialize reviewed native edits/builds.
5. **Package and observe.** Assemble a self-contained local development Aux.app with the supplied implementation. Launch without external Node, using disposable home/profile and mock keychain. Verify actual entrypoints and behavior before replacing the local installation.
6. **Finish acceptance and docs.** Compare actual newtab/chat/sidepanel/settings/onboarding/Vault/utility/native surfaces with supplied UI in both themes. Verify core browser/agent flows, auth/profile isolation, Vault/import, CLI/helpers/runtime and the20 real Muse tasks. Review deviations from the pinned source and commit coherent local work.

UI and runtime adaptation run in parallel after input pinning. Native changes follow their concrete contract findings. Packaging requires coherent UI/runtime/native artifacts. Acceptance uses the packaged reused implementation, not mocks or a reconstructed UI.

## Parallel ownership

- UI lane: supplied Agent/Vault assets, branding transforms and faithful entrypoints.
- Runtime lane: supplied daemon/CLI/agent/memory/helper reuse and contract preservation.
- Native integration lane: supplied private API consumers, Aux identity mapping and narrowly necessary Chromium proposals.
- Integrator: root config/packaging, shared native files, integration commits and packaged observation.

Lanes use separate worktrees. Static implementation reuse is authorized; owner data access and external communications are not.

## Verification and completion

Use pinned hashes and allowed-difference review to prove preservation. Run focused tests for altered auth/crypto/profile/bridge/platform boundaries, compile affected code, and observe the real disposable packaged UI. A smoke page or typecheck alone does not establish UI/behavior fidelity.

Done means `~/Applications/Aux.app` runs the supplied implementation with Aux branding/assets/identifiers, faithful UI and local behavior, working matching runtime components, isolated owner data/ports/identity, required functional and Muse acceptance, current docs and coherent local commits. Cloud service deployment, signing, provisioning and release remain out of scope.

## Superseded work

The prior clean-room plan and independent UI are historical/recoverable. Their measurements/tests may help diagnose integration; their approximations do not define the product and must not displace the supplied implementation.
