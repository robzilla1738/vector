# Supplied implementation contract

Aux reuses the owner's supplied Aside implementation on Chromium: its UI, behavior, daemon, extensions, CLI, skills, helpers and runtime. Aux changes the branding and isolates identities, state and endpoints. Where older independent Aux code differs, the supplied implementation wins. Working rules are in [AGENTS.md](../../AGENTS.md); dated decisions behind this page are in [plans/](../plans/).

## Source

- Target versions: Agent `1.26.1016.1852`, daemon `1.26.1016.1852`, CLI `1.26.1015`, runtime `1.26.1019.335`. Pin actual files and executable/SEA hashes before transforming them. The frozen copy is `out/provided-source-snapshot-1.26.1016.1852`.
- Reuse unchanged source, CSS, fonts, component structure and interactions directly. Record every branding and platform change as count-checked edits. Do not supply replacement screens or mock services that report success.
- Canonical artwork is `assets/brand/arch-mark.svg`: both paths, full geometry, 1024 viewBox. Derived assets keep that shape.
- Static implementation packages are authorized inputs. Owner profiles, accounts, credentials, Keychain items and OS grants are not.

## Scope

- **Inference:** users bring provider API keys or connect an eligible ChatGPT/Codex plan. Suppress paid-plan and checkout prompts; do not redesign the surfaces. Never silently spend Aux-hosted credits, and never treat ordinary sign-in as permission to use a ChatGPT plan. Details: [provider-funded launch](../plans/2026-10-23-provider-funded-launch.md).
- **Passwords:** no supplied Vault, no Aux password storage, no Vault onboarding/unlock/recovery screens, no first-party autofill UI. Users' own password-manager extensions (for example 1Password) must work; installation, autofill and native-messaging companions need real verification. Browsing and agent startup must not depend on a vault. Installation authentication, provider credentials and site sessions are not password-manager features: keep their security controls.
- **Not in scope:** backups, mobile, payments, legacy migration, distribution, notarization, release.

## Identity

Visible branding on the candidate is Aux. Its wire bytes and derivation domains are still the compatibility contract below. The Aux column is the target; it is not active.

| Compatibility contract (current) | Aux target |
| --- | --- |
| `AsideDaemonSessionToken` | `AuxDaemonSessionToken` |
| `AsideSessionToken` | `AuxSessionToken` |
| `aside.daemon.auth.` | `aux.daemon.auth.` |
| `Aside Daemon Auth v1\0` | `Aux Daemon Auth v1\0` (19 bytes including NUL) |
| `Aside Daemon Dev Auth v1\0` | `Aux Daemon Dev Auth v1\0` (23 bytes including NUL) |
| `aside-daemon` | `aux-daemon` |
| `Aside.*` | `Aux.*` |
| `aside.dk.*` / persisted installation records | Versioned Aux formats; needs a migration design and fixture verification first |

When the migration is authorized, change both sides, schemas, dispatch, health checks and byte-length calculations together. Never brand a challenge without its verifier. Never decrypt old ciphertext under a renamed HKDF domain. Existing state needs an explicit migration or a legacy reader; resets and owner-state access are not allowed. The migration includes no UI, geometry, CSS, typography, icon or interaction change. See [complete identity](../plans/2026-10-22-complete-aux-identity.md).

## Isolation

- **Standard browser profile isolation** (owner choice, 2026-10-23): personal and work cookies, extensions, site/provider/task state and all supervised Aux writers stay separate and settle before clean recovery. Unrelated apps under the same macOS user are outside this guarantee. See [the implementation scope](../integration/proposed/standard-profile-isolation/README.md).
- Keep Aux state and endpoints separate from Aside. Defaults: daemon 21520, bridge 21522, secure CDP 45203. Never attach to or stop the owner's Aside services.
- Bundled runtime, model and catalog payloads are immutable seeds; mutable npm/pip/bytecode state goes to the private Aux home. Preserve the original runtime validation, update failures and task-readiness behavior.
- Preserve the original native addon. Use the reviewed fixed guard/interposer/carrier and the original DP semantics; no owner-group fallback, replacement PEM authority or file-Keychain backend.
- Do not fabricate onboarding completion, unlocked state, subscriptions or cloud responses.

## Evidence

Acceptance needs actual evidence for the artifact being accepted: preserved bytes, compiled output, and observed behavior in a disposable profile. A hash check, a diagnostic, a successful compile or a visible control does not establish UI or behavior parity. Native runtime acceptance and anything touching macOS Keychain material or OS grants need explicit owner approval. Record results and gaps in [STATUS](../STATUS.md).
