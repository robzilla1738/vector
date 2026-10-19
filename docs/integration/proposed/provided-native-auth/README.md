# Proposed shared supplied-native authentication integration

Status: staged review copies only. No shared Chromium file has been edited. No compilation or carrier crypto execution is claimed. `source-sha256.json` pins the exact current source inputs; `provided-native-auth.patch` is generated from these snapshots. Integrator must compare hashes/current changes before applying.

## Proposed behavior

- Replace installation PEM reads/signing with calls to the exact supplied native C carrier. No PEM hybrid: public-key scheme and raw point/ML-DSA key come from `get-public-keys`; HTTP signing comes from original `cdp-sign` over the explicit HTTP domain plus challenge.
- Keep `LoadInstallationPrivateKey` present for existing credential-broker callers but always return nullopt without opening any private-key file. Existing independent passkey/credential broker remains fail-closed; this does not integrate the actual supplied Vault proxy.
- Parse only `p256_v1` raw65/uncompressed or `pq_v1` raw1952 ML-DSA65. Use existing upstream Chromium keypair/sign APIs. Unknown/malformed scheme/key input is refused.
- Keep HTTP verification prefix `Aux Daemon Auth v1\0`; add `VerifyCdpChallenge` for exactly raw32 bytes. Change only the owned CDP authority call site to the latter. Host/origin, one-use challenges, capacity and session checks stay in place.
- BrowserPlatform already loads the public key on a MayBlock worker after daemon readiness. Existing API signatures keep that call site valid; no BrowserPlatform edit is proposed.

## Fixed package seams

All paths are derived from the current browser executable's canonical Aux bundle root:

- `Contents/Resources/aux/native/aux-native-carrier`
- `Contents/Resources/aux/native/libaux-native-boundary.dylib`
- `Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/native/provided-native.node`

Canonical descendants must stay within that root and not be group/other writable. There are no executable/binding/library path overrides. Carrier additionally pins the unchanged original binding hash. Root packaging must stage these exact paths; no source checkout fallback is added.

Runtime activation stays blocked: calls refuse unless the browser inherited `AUX_ENABLE_PROVIDED_NATIVE_CARRIER=1` from an explicitly accepted launch. The proposal does not set that flag as an approval. The minimal child environment forwards it only after checking its actual inherited value; HOME/AUX_HOME are the canonical isolated state home and DYLD library is the fixed owned bundle file.

## Bounded process boundary

Worker-only carrier invocation uses a Unix socket for stdin/stdout, nonblocking bounded I/O, no shell, half-close after JSON input, 4096-byte input and 32768-byte output limits, a five-second I/O/exit deadline, stderr `/dev/null`, and only its launched process for timeout termination/cleanup. SO_NOSIGPIPE prevents a failed child write from signaling the browser. Only valid JSON without an error and exit0 succeeds. One signing operation makes one carrier invocation and preserves its actual signature; the actual daemon verifies it. No token, key, signature, credential or native stderr is logged.

This review is still required for Chromium process-launch/cleanup behavior, code-signing/DYLD packaging, any framework-internal security query coverage, and carrier activation. Five seconds bounds worker I/O/exit, not filesystem canonicalization or synchronous upstream LaunchProcess internals.

## Proposed focused generated-key probe

`after/chrome/browser/aux/auth_scheme_probe.cc` creates ephemeral P256 and ML-DSA65 keys with existing upstream APIs. It imports exact original raw formats, tests HTTP/CDP domain separation, malformed challenge/key scheme, signature/message tamper, and real CdpAuthority challenge/session/replay behavior for both schemes. It never launches the carrier, loads supplied native code, reads PEMs or calls Keychain.

Integrator-owned GN addition (do not blindly replace the old probe):

```gn
executable("auth_scheme_probe") {
  testonly = true
  sources = [ "auth_scheme_probe.cc" ]
  deps = [ ":platform", "//base", "//crypto", "//net" ]
}
```

Compile after the current full Chromium lock clears. Existing auth_probe assumes independent PEM signing and must not be cited as evidence for this proposal; keep it historical or update it explicitly. The real carrier deny-all load probe is independently queued in session31341 and remains pending. Production native signing and actual scheme selection remain unexecuted.
