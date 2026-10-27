# Supplied implementation contract

Aux reuses the owner's supplied Aside implementation on Chromium. Preserve its UI, behavior, daemon, extensions, CLI, skills, helpers and runtime. Aside wins when the retired independent implementation differs. Change visible branding to Aux and isolate app/extension identities, state and endpoints. The active [reuse plan](../plans/2026-10-19-supplied-implementation-reuse.md) supersedes independent reconstruction.

## Payment-free launch scope — owner direction2026-10-23

Launch with users' own provider keys and eligible ChatGPT/Codex plan connections. Aux payments, subscriptions and hosted-credit sales are deferred. Preserve the current UI design and supplied provider controls; suppress paid-plan/checkout prompts rather than redesigning the product. Do not silently spend Aux-hosted credits or present ordinary identity sign-in as permission to consume a ChatGPT plan. See [the active launch plan](../plans/2026-10-23-provider-funded-launch.md) for exact boundaries and unaccepted integration work.

## Password-manager scope exception — 2026-10-20

The owner explicitly excludes the built-in password manager from Aside parity. Do not ship the supplied Vault product, Aux password storage, Vault onboarding/unlock/recovery screens, or first-party password autofill UI. Support users' existing password managers through their browser extensions (for example, 1Password). Extension installation, autofill and optional desktop-app/native-messaging compatibility require actual verification; do not claim support from Chromium compatibility alone.

Normal browsing and agent/chat startup must not depend on setting up or unlocking a password vault. Separate those dependencies before removing shared code. Browser/daemon installation authentication, AI provider credentials and ordinary site sessions remain necessary and are not user-password-manager features. Do not remove their security controls or fabricate unlocked/account state. Do not delete existing owner credentials or profiles.

This exception supersedes Vault preservation and acceptance requirements elsewhere in older plans/status records. The runnable package excludes the Vault extension and its onboarding/storage UI, and native save/fill/manager surfaces are disabled or removed. Direct password-manager page navigation is rejected in the actual579 app. A remaining obsolete Vault builtin skill is being excluded from the supplied Settings consumer; daemon catalog corrections are separately proposed because they change the signed executable. Vendor companion pairing remains unverified. See current STATUS for exact artifact acceptance.

## Source and identity

- Agent/Vault target: `1.26.1016.1852`; daemon: `1.26.1016.1852`; supplied CLI: `1.26.1015`; runtime: `1.26.1019.335`. Pin actual files and executable/SEA hashes before transforming them.
- Reuse unchanged source, CSS, fonts, component structure and interactions directly. Record exact count-checked branding and necessary platform changes. Do not supply replacement screens or successful mock services.
- Canonical artwork is the exact owner-supplied `assets/brand/arch-mark.svg`: both paths, complete geometry and1024 viewBox. Derived UI/app/menu assets retain that shape.
- Static implementation packages are authorized inputs. Owner profiles, accounts, credentials, Keychain items and OS grants are not source material.

## Complete Aux identity — owner override 2026-10-22

The owner requires delivered product names, identifiers, and endpoints to use Aux, with the current UI preserved exactly. Visible branding on the current candidate is Aux. That candidate still uses the compatibility wire bytes and `aside.dk.*` HKDF domains in the existing-contract column below. Changing those bytes or domains is a versioned migration, not a branding edit. [STATUS](../STATUS.md) records which Aside identifiers remain and why. The target column is not activated.

| Existing compatibility contract | Target Aux contract |
| --- | --- |
| `AsideDaemonSessionToken` | `AuxDaemonSessionToken` |
| `AsideSessionToken` | `AuxSessionToken` |
| `aside.daemon.auth.` | `aux.daemon.auth.` |
| `Aside Daemon Auth v1\0` | `Aux Daemon Auth v1\0` (19 bytes including NUL) |
| `Aside Daemon Dev Auth v1\0` | `Aux Daemon Dev Auth v1\0` (23 bytes including NUL) |
| `aside-daemon` | `aux-daemon` |
| `Aside.*` | `Aux.*` |
| `aside.dk.*` / persisted installation records | Versioned Aux formats; migration design and fixture verification required before activation |

When that migration is authorized, update both sides, schemas, dispatch, health checks and byte-length calculations together. Never brand a challenge without changing its verifier. Never rename an HKDF domain and attempt to decrypt old ciphertext under the new domain. Existing Aux state needs an explicit migration or supported legacy-reader transition; neither owner-state access nor destructive resets are authorized. Original static inputs and historical evidence stay unchanged and accurately attributed. HTML's standard `aside` element and required upstream legal notices remain valid and must not be broken or erased.

See [complete identity migration](../plans/2026-10-22-complete-aux-identity.md). No UI redesign, geometry, CSS, glass, typography, icon or interaction changes are part of this migration.

## Local behavior and isolation

Owner-selected scope (2026-10-23): **standard browser profile isolation**. Personal/work cookies, extensions, site/provider/task state and all supervised Aux writers must remain separate and settle before clean recovery. Unrelated applications under the same macOS UID are outside this guarantee. This explicit choice supersedes the earlier mandatory same-UID-writer target; it does not exclude arbitrary code launched by Aux, weaken unknown/pending outcomes, grant OS permissions or authorize lifecycle/signing/release. See [the implementation scope](../integration/proposed/standard-profile-isolation/README.md).

- Preserve actual account/profile state and original installation cryptography. Decouple local browsing and agent startup from the excluded Vault product. Do not synthesize onboarding completion, unlocked state, subscriptions or cloud responses.
- Keep Aux state/endpoints separate from Aside. Defaults are daemon21520, bridge21522 and secure browser CDP45203. Never attach to or terminate the owner's Aside services.
- Bundled runtime/model/catalog payloads are immutable seeds. Actual mutable npm/pip/bytecode state uses the private Aux home. Preserve original cached-runtime validation, update failures and task readiness behavior.
- Preserve the original native addon. Use the reviewed fixed guard/interposer/carrier and scoped original DP semantics; no owner-group fallback, replacement PEM authority or file-Keychain backend.
- Native runtime acceptance is external and explicit. Packaging, launching, health readiness, successful compilation and deny-all registration do not grant it. Request approval before operating on macOS Keychain material or OS grants.

## Evidence and delivery

Commit coherent slices to local main; do not push, use hosted Actions, sign, provision, notarize or release during current development. Earlier scoped signing evidence is historical. Serialize native builds with `scripts/native-build.py`, preserve owner checkout changes and use disposable profiles with `--use-mock-keychain`.

Use actual preservation, compiled-artifact and disposable behavior evidence. A source hash check or diagnostic does not establish functional/UI parity. AI acceptance uses only `vercel-ai-gateway/meta/muse-spark-1.3-contributor`, with test credentials removed afterward. Current achieved work and remaining gaps belong in [STATUS](../STATUS.md).
