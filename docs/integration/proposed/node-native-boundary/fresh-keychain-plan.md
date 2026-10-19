# Fresh Keychain targeting: static plan and refusal boundary

No Keychain has been created, opened, searched, unlocked, modified or deleted. No OS grant was requested. Current interposer `isolated_keychain` is null and cannot be set through arbitrary external path/handle input. `AuxNativeBoundaryHasIsolatedKeychain()` therefore reports false; production Node guard/carrier refuse before original commands. The source seam is not a finished Keychain implementation.

## Established API facts

Local Xcode SDK Security headers provide these contracts:

- SecItem.h `kSecUseKeychain` selects the SecKeychainRef **to which SecItemAdd adds items**.
- `kSecMatchSearchList` restricts searches to the listed SecKeychainRef values.
- `kSecUseDataProtectionKeychain=true` enables access-group/accessibility semantics in the Data Protection keychain.
- `kSecUseNoAuthenticationUI` is documented as applying only to DP keychain items; legacy items may still activate UI.
- SecKeychainCreate accepts an explicit path, canonical UTF8 password, `promptUser` and returns a retained handle.
- SecKeychainDelete removes its target from search lists and deletes file-based storage.
- Header contracts do not establish that creating a Keychain never mutates the user's search-list preferences. This remains unproven; do not infer isolation from an alternate HOME or an opaque handle.

Supplied native installBaseQuery/secureStorageBaseQuery explicitly set DP=true. A file-keychain handle alone cannot be called faithful DP/enclave isolation. The current target layer rejects DP=true rather than silently dropping it or routing to default storage. That refusal must remain until an explicit storage adaptation is reviewed and accurately labeled.

## Required internal factory before any actual crypto probe

1. Use a disposable AUX_HOME only. Create a new unpredictable directory internally (mkdtemp), owner0700, under that home. Retain its directory FD; verify UID, mode, canonical parent and absence of symlinks. Accept no caller-supplied existing Keychain or arbitrary SecKeychainRef.
2. Choose a fixed new filename inside that fresh directory and require ENOENT using the retained directory handle. Generate a UTF8-safe random password in memory; never return/log/serialize it or put it in argv. It belongs only to that newly created fixture Keychain.
3. Before invoking SecKeychainCreate, establish from actual implementation evidence or a separately isolated test environment that creation cannot change the owner's default/search-list domain. The current SDK declarations are insufficient. Do not “save and restore” the owner's search list as a workaround; reading it is outside this task's authorization.
4. If creation is approved, use promptUser=false; receive the handle only from this exact fresh creation. Validate the returned path against the new expected path (never inspect a caller-provided owner handle), owner/mode and parent identity. Keep handle and expected path private inside the boundary. Expose only boolean ready/status to JS.
5. Apply query identity mapping first. Then SecItemAdd receives only internal `kSecUseKeychain=<fresh handle>`; read/delete/update selector queries receive only internal `kSecMatchSearchList=[fresh handle]`. Caller-supplied keychain/search-list/item refs remain refused. Keep attributes for update separate from selector targeting. Current generic target code is staged, unreachable while handle is null, and must be refined by operation before enabling.
6. DP=true, synchronizable/user-independent storage and unclassified CryptoKit queries remain explicit errors. A fixture-only legacy backend adaptation would need separate review and must be described as such; it cannot establish production DP/enclave fidelity. Do not force original hardware capability detection to a software/P256 path and call that original behavior.
7. Block interaction for the fixture process before original native commands; do not trust only kSecUseNoAuthenticationUI for a legacy target. Biometrics/access-control paths must honestly refuse when they require a grant. Preserve original access-control/key/envelope bytes and do not bypass user verification.
8. Once complete, execute only original install/public/sign operations needed for the fixture. Observe actual scheme and formats; do not substitute key material. Verify round-trip/wrapped-key persistence and cross-home refusal. Never include original owner accounts or credential material.
9. Close and delete only the handle/path created by this factory. Prove cleanup's preference/search-list effects are confined before calling its API; stop on uncertainty. Record any files left inside the disposable fixture directory rather than widening deletion.

## Production versus fixture acceptance

A fresh file Keychain fixture can at most prove behavior against that explicit backend. It does not automatically prove original Data Protection Keychain accessibility, Secure Enclave hardware, biometric behavior or unsigned-app entitlement compatibility. Production authority still requires an approved Aux storage identity/backend and actual behavior evidence. Mock Chromium Keychain does not satisfy this helper boundary.

The current fail-closed readiness result is intentional and truthful. No code or test turns a boolean env flag into proof that a fresh Keychain was provisioned.
