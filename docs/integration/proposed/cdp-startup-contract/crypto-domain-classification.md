# Supplied DK labels are crypto formats

The four `aside.dk.` matches in the pinned supplied daemon are:

1. DK_SUBKEY_INFO_PREFIX=`aside.dk.` used to build `${prefix}${purpose}.v1` passed as HKDF-SHA256 info for DK-derived subkeys (including local daemon auth token signing).
2. `hkdfSha256(auk, 'aside.dk.pwm.v1')` produces PMK.
3. `hkdfSha256(auk, 'aside.dk.sync.v1')` produces CSK.
4. Recovery derivation calls the same `aside.dk.sync.v1` HKDF label before existing-account/sync-generation checks.

They are cryptographic domain-separation inputs, not native Keychain selectors or filesystem state names. Renaming changes derived keys and encrypted-format compatibility and is unnecessary for platform isolation. Removed that edit; all four remain original. Original DK_WRAP_INFO=`aside.wrap.dk.v1` was already preserved. Aux home/immutable native-query scope still isolate installation storage, and the explicit platform storage selector prefix remains separately adapted. No actual key derivation, secret read or native crypto operation was performed in this audit.

Three focused daemon tests pass including four original-label count/no aux.dk assertion. Current adapted code SHA7344e4e4f4cea4df9722056bfe6ee5ccb56097b4372e9105ab5ef1425215609d;83 edit records. Startup hook and supplied wire preservation remain unchanged.
