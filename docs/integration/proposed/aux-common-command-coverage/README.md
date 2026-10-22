# Common-addon consumer coverage — static snapshot

At source commit `d3b72ce4b`, every ordinary macOS command name consumed by the supplied daemon and the **composed state2 CLI** has a corresponding Aux source route. This does **not** mean the original common addon can be removed from the running product: fresh installation, destruction, existing credential migration, native loading and real host admission remain distinct gaps. No UI, runtime state, native core or caller was changed by this audit; no addon/Keychain/OS/cloud operation or new runtime test ran.

`coverage.json` pins both frozen1852 JavaScript inputs, the actual caller adapters/replacement, recovered native-alias evidence and current Swift routes. It records exact UTF-8 byte offsets for literal named calls, all four direct `.run(...)` forwarding seams and the reviewed dynamic selectors. This is bounded static coverage of these known wrappers, not a universal proof about arbitrary future dynamically constructed commands.

| macOS consumer command | Required caller-visible JSON | Current Aux source |
| --- | --- | --- |
| `install-status` | `installed` Boolean, `scheme` when installed | Installation core; absence is explicit context, blocked/unconfigured is an error. |
| `get-public-keys` | `scheme`, base64 `sig`, `kem` | Validated captured authority; composed CLI also validates scheme equality and public layout. |
| `install-init` | `scheme`, `sig_pub`, `kem_pub` | Existing authority returns its unchanged public keys. Absent installation refuses: **fresh coordinator missing from this command path**. |
| `cdp-sign` | base64 `signature` from base64 `challenge` input | Recovered existing-authority signing ports; software fixture evidence and hardware compile-only limits remain as previously recorded. |
| `dk-unwrap` | base64 `dk` | Strict Aux-v2 envelope and existing authority import/open. No legacy fallback or replacement root. |
| `install-destroy` | Success/error of explicit installation destruction | Always coordinator-unavailable error. **No destroy/reset implementation is supplied by the new core**. |
| `secure-save`, `secure-clear` | `{success:true}` or error | Scoped secure core, finite reviewed exact-key policy and Aux-only hashed selectors. |
| `secure-read` | `{data:string|null}` or error | Null only for actual missing item; inaccessible/invalid state remains error. |
| `generate-thumbnail` | `thumbnailGenerated`, `iconGenerated`, `success` | Utility core; HEIC reader checks thumbnail flag, preview path checks actual output. |
| `app-icons` | `icons` map of bundle ID to PNG path | Utility core and actual AppKit boundary source. |
| `list-open-apps` | `apps[]` with `appName`, `appPath`, optional `default`, `iconPath` | Utility core; default-first/name ordering and duplicate removal. |
| `copy-file`, `open-with` | `{success:true}` or error | Utility core, actual boundary and retained async custody/drain source. |

These are **14 distinct macOS command names**. The owned dispatcher sends the three credential commands to its scoped credential capability, then the five OS commands to its attached utility core, then installation commands to the installation core. The reviewed signed-development producer now constructs that utility core on the same scoped owner. Source attachment and compilation are separate from approved signing, bootstrap and runtime acceptance.

## Preserve the actual Mac aliases

The recovered original macOS dispatcher intentionally aliases `keys-status` to `install-status` (`installed`, not `keysInstalled`), `public-keys` to `get-public-keys`, and `init-keys` to `install-init` (`sig_pub`/`kem_pub`, not `sig`/`kem`). Changing those native aliases to the generic Windows shapes would silently depart from the supplied Mac implementation.

The frozen CLI has the known `keys-status.keysInstalled` mismatch and P256-only advertisement. This is **already fixed in the actual composed caller**: `cli-adapter.mjs` applies `applyAuxCliDeviceRegistration` in state2, whose exact replacement requests macOS `install-status.installed` and `get-public-keys`, requires matching actual P256/PQ scheme and preserves the existing cloud device field names. Windows deliberately retains `keys-status.keysInstalled` and `public-keys`. An initial audit suspicion that the native aliases needed changing was resolved by inspecting this already-integrated pairing; **no native alias fix is needed**.

## Excluded or separate surfaces

- `ecdh-secret` is a generic **Windows-only** installation consumer (`peerPublicKey` → `sharedSecret`); it is absent from the reviewed Mac dispatcher/core. Do not approximate it with Mac root unwrap or change Mac response shapes to support that path.
- `pick-directory`, dynamic `open-path`/`reveal-path`, `focus-explorer-path` and `install-crash-handler` are Windows helper consumers. Mac directory picking/system opening use their existing AppleScript/`open` paths; they do not require missing Mac common-addon commands.
- `status`, `enroll`, `unlock`, `unlock-batch`, `verify`, `remove` belong to the excluded built-in Vault biometric module (`PwmAccountRegistry`/password-manager session storage). Their frozen functions remain visible in source, but the actual product router/skills exclusion removes that product surface. Do not reintroduce them to claim parity. External password-manager integration retains installation encryption/secure-storage consumers; it is not permission to reactivate Vault.
- The seven PDF methods are a separate typed export surface, **not** `.run` command names. The actual daemon adapter now routes them to `aux-pdf.cjs`; no actual CLI PDF caller was found beyond its bundled unused wrapper declaration. Their separate module/build/package evidence is outside this common-command source coverage.

## What still prevents retiring the original common addon

1. A real trusted host bootstrap must load/attach the owned runtime and consume the actual policy, entitlement and authority admission. `aux-native.cjs` still deliberately loads its guarded pinned original common addon; source classes/compile receipts do not replace that loader or admit a profile.
2. Fresh empty-scope initialization needs the real reviewed four-row coordinator and authenticated selection/readmission. Calling `install-init` against an existing context works; it cannot invent a missing installation. Destruction/repair remains explicitly refused rather than silently deleting/reinitializing keys.
3. Existing protected application credentials need explicit copy-only migration to the Aux hashed selectors and a concrete trusted producer of allowed logical keys for actual account/MCP/channel/bootstrap consumers. The finite policy cannot infer permission from arbitrary JS keys, and a new namespace cannot automatically read old rows.
4. Same-profile/authority all-writer exclusion, coherent capture, actual signed execution and runtime acceptance remain external. Distinct worker generations or successful source routing do not prove them. Current startup/readmission gates must stay closed until those conditions are satisfied.
5. Source limits remain explicit: NAPI/core inputs are bounded16KiB and credential keys use a finite exact set. Large/unknown payload variants and a future Windows product are not certified by this Mac coverage.

The code-map finding is therefore **no missing ordinary Mac command name, with lifecycle/credential/admission integration still unfinished**, rather than "the replacement common addon is ready." Preserve the current accepted app and UI while those boundaries are completed.
