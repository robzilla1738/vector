# Mac CLI installation registration pairing

This source-pinned adapter fixes the actual original `getCliDeviceRegistration()` caller against the recovered Mac native dispatcher and current Aux cloud device schema. It changes no UI, startup, sign-in request fields or native code. No runtime addon, owner authority/state, cloud service, credential, Keychain or signing operation was used.

The pinned original CLI incorrectly requests `keys-status.keysInstalled` on macOS although that original native alias returns `{installed,scheme}`. It also labels all registrations P256. The recovered original `get-public-keys` response contains `{scheme,sig,kem}`; public signing bytes use P256 X9.63 or MLDSA65 raw representation.

On macOS the replacement requests `install-status`, requires `installed === true`, then requests `get-public-keys`. Both responses must agree on exactly `p256_v1` or `pq_v1`. Signing bytes must be canonical base64 with the actual expected layout: P25665-byte uncompressed, or MLDSA651952-byte raw. Unsupported, mismatched, malformed, missing and error responses return undefined under the original catch/cache semantics. It never requests init/destroy or generates authority.

P256 retains the original EC/P-256 JWK. PQ advertises `{kty:"RAW",alg:"ML-DSA-65",public_key_b64:...}` and `installationScheme:"pq_v1"`, matching the actual `services/aux-cloud/src/auth.ts` parser and fingerprint validator. Fingerprints continue to hash exactly the public bytes. `appVersion`, `deviceName`, `platform`, `ikSigPublicKeyJwk` and `ikSigKeyFingerprint` retain their original names and meaning.

Windows remains on `keys-status.keysInstalled` and `public-keys`, with original truthiness, P256 advertisement, EC/RAW-UNKNOWN behavior and failure handling. The Mac fix does not reinterpret the generic Windows native helper contract. Linux and other unsupported platforms still return undefined without a binding call.

## Integration

After the existing CLI transformations, call:

```js
const registration = applyAuxCliDeviceRegistration({
  component: 'cli', path: 'entry.mjs', text: code, original,
});
code = registration.text;
applied.push(...registration.anchors);
```

The original full CLI source SHA, exact function input/output hashes and count1 are pinned. The helper accepts the existing composed CLI because the reviewed function is otherwise unchanged; it rejects drift, repeated generation and a modified original source. Integration belongs to the next reviewed successor iteration; this commit edits no root staging, manifests, packaging or current accepted app.

## Focused evidence

`node --experimental-vm-modules --test vendor/provided/aux-cli-device-registration.test.mjs` passes four focused tests. They extract the actual pinned CLI SEA source, apply the real existing state2 composition and this exact function patch, parse both whole modules, and prove every byte outside that function is unchanged. The actual original/replacement function runs in an isolated VM with only synthetic platform/native responses. Tests cover real synthetic EC public bytes, PQ public-format fixture bytes (no PQ operation), scheme pairing/refusals/cache, unsupported platform and old-versus-new Windows equality. No real login, device registration or native authority availability is claimed.


## Root pipeline integration

The state2 CLI adapter now applies the reviewed function patch after provider/runtime identity transforms and before cold-entry refusal. Its helper, input pin, both exact function texts and the actual cloud auth schema are included in staging provenance. The four focused tests pass with the real integrated adapter (the repeated-generation check now expects the composed entry to reject a second application). State1 behavior is unchanged. This integration is newer than the CLI-prehome packaged candidate; a new stage/package remains required before claiming delivered device-registration behavior. No actual sign-in or authority was invoked.

## Successor package evidence

`out/provided-candidate-aux-cli-registration/Aux.app` now includes this exact registration replacement in its actual CLI SEA (one replacement, zero original function occurrences). Fresh staging and packaging completed with10,747 supplied resources/418 native leaves. `check-package.mjs` parsed the actual packaged code, verified cold refusal remains first and imports remain builtin-only, matched the pre-home wrapper to the preceding verified artifact, and matched the unchanged native framework to its build receipt. All135 visual assets/five stylesheets match the preceding candidate. Exact hashes/limits are in `package-evidence.json`.

The candidate remains unsigned and quarantined: no app execution, native authority, real sign-in or accepted-app replacement occurred. The source correction is delivered in this candidate, but cold-entry admission intentionally prevents runtime use until the independent identity/storage integration is accepted. No claim of actual registration/login acceptance is made.
