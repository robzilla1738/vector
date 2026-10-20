# Current account/provider authority boundary

Read-only conclusion: there is no source-supported drop-in unsigned replacement for the supplied macOS installation authority. Current Node-host startup fails `SecItemAdd -34018` before the UI can resolve an actual profile account. Merely retaining the toolbar cannot make models/projects/send functional. No account, successful connection, model catalog, plaintext key, fake unlock or bypass is proposed.

## Why existing signed bytes cannot simply be reused

The historical v498 signed daemon's SEA code is SHA256 `6549409a85a872cf0a5cf2ef22d3c75fdd1b47a0fc988ddf85c1d53894e763b5`; current staged SEA code is `93084eb7eebf911b473d791e796f5d8ad740bc8befa5527a8adb0205d42a9dd0`. Pure static SEA parsing identifies four differences: current code disables `useBuiltinPasswordManager` both in the default and settings merge, removes `new PasswordManagerRepl(...)`, and excludes the built-in password-manager skill. Reusing the old executable reverses the owner's scope exception even if its UI is hidden.

The signed v498 `Contents/_CodeSignature/CodeResources` also seals eight leaves under `Applications/Aux Password Importer.app`. Current assembly explicitly verifies then excludes that product. Removing those leaves or replacing the old SEA with current bytes changes the sealed app. Retaining just the old signed Mach-O in a differently assembled bundle is not evidence that the original app's resource/profile/signature validation remains valid; this investigation does not propose relying on a knowingly broken bundle seal. Running the old bundle externally still executes the old password-manager-enabled implementation.

The retained signed native carrier's command allowlist includes installation status/init/public keys/signing and separately gated inbox-key access, **not `dk-unwrap`**. The supplied daemon actually calls `dk-unwrap` before its DK manager can encrypt/decrypt provider secrets. Its `aux-native.cjs` loads the original native addon inside the daemon process. A signed carrier/guard/library does not change unchanged Node's process entitlement identity. Delegating only signature operations cannot satisfy provider-credential behavior; adding a new sensitive-key broker/transport would require a new signed implementation and is not a no-signing solution. No `NODE_OPTIONS`/preload trick or generic signed-host arbitrary-code runner is proposed.

## Concrete minimal repair if the owner authorizes a new exception

Current packaging already exposes the correct role topology via `--development-dp-layout`: `providedDevelopmentAuthority()` selects **`provided-sea`**, not unchanged runtime Node, and creates the profile-bundle carrier layout. It preserves the current no-importer assembly exclusions. An exact current copied candidate can therefore receive the existing public profile and local development signature without changing native cryptography or bringing back Vault.

The three actual authority roles, relative to a NEW copied `Aux.app/Contents/Resources/aux`, are:

| Role | Bundle/main executable | Existing identity |
| --- | --- | --- |
| Daemon | `apps/daemon/Aux Daemon.app/Contents/MacOS/aux-daemon` | `dev.aux.browser.daemon` |
| CLI | `apps/cli/Aux CLI.app/Contents/MacOS/aux-cli-sea` (wrapper remains separately pinned) | `dev.aux.browser.cli` |
| Native carrier | `native/Aux Native Carrier.app/Contents/MacOS/aux-native-carrier` | `dev.aux.browser.native-carrier` |

Use the **current pinned implementation** for each role, not historical bundle copies. Public existing profile SHA256 is `faa4760e2746dcea329ad272390a33d9960c3419bb8b991654a35ac5b7ee1a6d`; its statically decoded claims admit OSX/team `9F2JXY8TCK.*`, expire 2027-10-19, and include the historical reviewed certificate. Historical v498 CMS/device/certificate receipts passed. These bytes can be embedded unchanged; no new provisioning, account creation, profile generation, portal operation or release workflow is necessary in principle. Certificate private-key availability and fresh trust/device/profile validity were **not** inspected in this lane and remain integrator checks if authorization is granted.

The exact host entitlements should remain the reviewed ones: each real role's matching team-qualified application identifier, team `9F2JXY8TCK`, and exactly the existing approved disposable Aux group `9F2JXY8TCK.dev.aux.dp.dbca8cbbce80cb5eb3f2f89043330556fdbf2350f3c057a69d6e10e6b3d11476`. Daemon/CLI preserve the reviewed JIT/unsigned-executable-memory/library-validation/DYLD boundary capabilities; carrier does not acquire them. Necessary changed nested/outer code/resource seals require the explicit existing inside-out policy; never blanket `--deep`. Original `provided-native.node` and runtime/memory bytes/signatures remain immutable. The number of signatures must be derived from the actual current candidate, not copied from v498's eleven-target list containing the now-removed importer/provider.

Only the same previously approved disposable home/scope is evidenced; this is not authority for a new real owner home/group. No key reset, key deletion or new authority is required for a verify/reuse attempt. Even successful account startup would not prove that an AI provider is configured or a model usable: inspect the actual resulting provider inventory, configure only through the supplied credential API if separately authorized, and test an actual request before claiming working AI options.

## Rule conflict and evidence limits

The current user instructions explicitly say **“Do not run signing, provisioning or release preparation as part of this work”** and **“Never ... sign ... during current development.”** A general request for working UI does not identify a new exception to those explicit constraints. The earlier v498 authorization and its historical receipts do not automatically authorize signing a new current artifact. The integrator should explain the exact conflict and obtain an explicit local-only exception covering the copied current three helpers and necessary seals, existing public profile/certificate, same disposable Aux scope, and bounded authority/provider verification. It should not ask for provisioning or release approval.

This commit performs no signing/preparation script, runtime execution, profile-state access, Keychain operation, OS grant, candidate mutation or owner-data read. `evidence.json` contains hashes and public static claims only. SEA code was parsed, never executed. Historical successes remain historical; fresh authority behavior is unverified.
