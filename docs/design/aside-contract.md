# Supplied implementation contract

Aux reuses the owner's supplied Aside implementation on Chromium. Preserve its UI, behavior, daemon, extensions, CLI, skills, helpers and runtime. Aside wins when the retired independent implementation differs. Change visible branding to Aux and isolate app/extension identities, state and endpoints. The active [reuse plan](../plans/2026-10-19-supplied-implementation-reuse.md) supersedes independent reconstruction.

## Source and identity

- Agent/Vault target: `1.26.1016.1852`; daemon: `1.26.1016.1852`; supplied CLI: `1.26.1015`; runtime: `1.26.1019.335`. Pin actual files and executable/SEA hashes before transforming them.
- Reuse unchanged source, CSS, fonts, component structure and interactions directly. Record exact count-checked branding and necessary platform changes. Do not supply replacement screens or successful mock services.
- Canonical artwork is the exact owner-supplied `assets/brand/arch-mark.svg`: both paths, complete geometry and1024 viewBox. Derived UI/app/menu assets retain that shape.
- Static implementation packages are authorized inputs. Owner profiles, accounts, credentials, Keychain items and OS grants are not source material.

## Original wire and cryptographic bytes

Preserve these supplied contracts even though the visible product is Aux:

| Contract | Required value |
| --- | --- |
| HTTP native-session scheme | `AsideDaemonSessionToken` |
| Browser CDP native-session scheme | `AsideSessionToken` |
| WS auth prefix | `aside.daemon.auth.` |
| HTTP signed challenge domain | `Aside Daemon Auth v1\0` —21 bytes including NUL |
| Health service | `aside-daemon` |
| Extension/browser bridge commands | `Aside.*` |
| Key derivation domains | Original `aside.dk.*` labels and wrapped-key formats |

CDP verifies its original raw32-byte challenge, without the HTTP domain prefix. Product prose is Aux; HTML's `aside` element and licensed upstream language tokens remain valid. Do not rename protocol bytes or cryptographic labels as a branding operation.

## Local behavior and isolation

- Preserve actual account/profile/PWM state, original installation cryptography and the supplied Vault setup/unlock/recovery flow. Do not synthesize onboarding completion, unlocked state, subscriptions or cloud responses.
- Keep Aux state/endpoints separate from Aside. Defaults are daemon21520, bridge21522 and secure browser CDP45203. Never attach to or terminate the owner's Aside services.
- Bundled runtime/model/catalog payloads are immutable seeds. Actual mutable npm/pip/bytecode state uses the private Aux home. Preserve original cached-runtime validation, update failures and task readiness behavior.
- Preserve the original native addon. Use the reviewed fixed guard/interposer/carrier and scoped original DP semantics; no owner-group fallback, replacement PEM authority or file-Keychain backend.
- Native runtime acceptance is external and explicit. Packaging, launching, health readiness, successful compilation and deny-all registration do not grant it. Request approval before operating on macOS Keychain material or OS grants.

## Evidence and delivery

Commit coherent slices to local main; do not push, use hosted Actions, Developer ID sign, notarize or release. Local ad hoc signing of copied candidates is allowed. Serialize native builds with `scripts/native-build.py`, preserve owner checkout changes and use disposable profiles with `--use-mock-keychain`.

Use actual preservation, compiled-artifact, signing and disposable behavior evidence. A source hash check or diagnostic does not establish functional/UI parity. AI acceptance uses only `vercel-ai-gateway/meta/muse-spark-1.3-contributor`, with test credentials removed afterward. Current achieved work and remaining gaps belong in [STATUS](../STATUS.md).
