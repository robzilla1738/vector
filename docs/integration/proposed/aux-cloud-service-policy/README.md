# Opt-in Aux cloud service origin policy

New source-only module: `vendor/provided/cloud-service-policy.mjs`. No shared adapter/stager was changed and no app was built, signed or launched by this proposal. Existing local builds remain byte-identical unless the integrator explicitly supplies `{enableCloud:true,profile:'production'}`.

## Compose after the existing pinned adapters

```js
import { transformReviewedCloudServicePolicy } from './cloud-service-policy.mjs';
// Within adaptDaemonCode, after all existing transformations:
const cloud = transformReviewedCloudServicePolicy(
  {component:'daemon',path:'entry.mjs',text:code}, cloudOptions);
code = cloud.text;
applied.push(...cloud.anchors);
// Compute the adapted code SHA from these final bytes. Pass cloudOptions through
// adaptDaemonBinary/readPinnedDaemon. Preserve all original input hash checks.
```

Do the equivalent in the CLI with `component:'cli'`. In `transformProvidedUiBoundary`, compose the policy after the existing local boundary for **Agent** only, passing the real asset path and appending its anchors. Preserve the stage's historical Vault input as local-only and exclude Vault from the shipping app as already required. Do not enable Vault cloud endpoints.

Read `AUX_ENABLE_CLOUD=1` and `AUX_CLOUD_PROFILE=production` only in the build/stage CLI through `cloudBuildOptionsFromEnvironment(environment)`, then pass the resulting validated options explicitly. Never call this helper in a shipped browser/daemon. No arbitrary URL, path-prefixed endpoint or preview origin is accepted. The reviewed origins are exact HTTPS origins `https://api.getaux.co` and `https://share.getaux.co`. Enabled builds remove the original daemon/CLI runtime `AUX_API_URL` override using an additional count-one initializer patch.

Persist the resolved policy and final code/resource SHA256 values in the build/stage receipt. The supplied original hashes remain unchanged source pins; adapted hashes change. Cloud mode is an integration change requiring a fresh candidate/acceptance record. A configuration flag is not evidence that the deployed backend or native sign-in works.

## Counted coverage

After current local adaptation, the daemon has exactly eight API boundary occurrences, one legacy API occurrence, one share origin and one API initializer. CLI has one API boundary and one initializer. Agent has one API base each in `background.js` and `assets/strip-markdown-DRcmtuJc.js`. API routes are served at the origin root: original `new URL('/auth/...', base)` callers discard any base path.

Docs, channel guide boundaries, release/installer URLs, telemetry defaults, original wire names and cryptographic derivation labels remain unchanged. There is no network operation, mock response, fabricated entitlement or account migration in this policy.

## Device fingerprint audit

Pinned daemon `out/provided-source-audit/daemon-original.mjs` function `createInstallationFingerprint` hashes `Buffer.from(publicKeyBase64,'base64')` bytes. Its P-256 JWK conversion splits the uncompressed point into x/y; PQ uses the original raw ML-DSA-65 bytes. Pinned CLI `cli-original.mjs` hashes the decoded `publicKey` buffer directly. Therefore the cloud auth module correctly computes `SHA256(0x04 || x || y)` for P-256 and `SHA256(rawPublicKey)` for PQ. It does **not** hash JSON, JWK serialization, SPKI DER or the base64 text.

## Evidence

`node --test vendor/provided/cloud-service-policy.test.mjs` passed all four tests, no skips: explicit opt-in/host validation; actual hash-pinned daemon/CLI transformation and JavaScript parse/replay; actual hash-pinned Agent consumers; release/installer/wire/crypto preservation. No supplied code was imported/executed and no owner profiles or credentials were accessed.

## Explicit development profile — 2026-10-22

The reviewed policy now also accepts `{enableCloud:true,profile:'development'}`. Both its API and share origins are fixed to `https://dev-cloud.getaux.co`; arbitrary URLs, extra option keys, inherited profiles and runtime origin overrides remain rejected. Production still uses `https://api.getaux.co` and `https://share.getaux.co`.

The build-only environment helper accepts development solely with `AUX_ENABLE_CLOUD=1` and `AUX_CLOUD_PROFILE=development`. A profile variable alone, an absent flag or flag0 does not activate cloud behavior. No helper reads the ambient process environment itself or changes a shipped process configuration.

The daemon/CLI fixed-configuration anchors now interpolate the selected reviewed constant rather than hardcoding production in the second adaptation step. Default/no-option transformations remain byte-identical to their existing local-only input. Shared adapters, stagers, candidate apps, signing and external resources remain unchanged by this module edit.

`node --test vendor/provided/cloud-service-policy.test.mjs` passed7 tests with no skips: explicit flags/profile validation; actual pinned daemon and CLI transformations for production and development, count-checked replay and JavaScript parsing; actual pinned Agent consumers; and release/installer/wire/crypto preservation. This is static source-policy evidence, not deployment or native runtime acceptance.
