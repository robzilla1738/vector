# Captured legacy inbox read handoff

New source-only, inactive pure consumer. It does **not** perform `SecItemCopyMatching`, introduce a selector authority constructor or expose a native/JS endpoint. No native compilation, fixture execution, Keychain operation, owner-data access or shared-source modification occurred for this proposal.

## Authoritative lookup remains unavailable

The actual fresh/resumed owner retains a new Aux-v2 home and authenticated policy selecting DP installation rows in that scope. It cannot authorize a legacy notification item. The current signed selected runtime policy likewise authenticates four exact DP installation targets; its captured runtime consistency is not provenance for an omitted-group non-DP query. Existing-migration `CapturedTerminalCommandContext` and `CapturedHistoricalAuxCredentialBinding` explicitly describe external captures/review candidates, not authenticated historical keychain/search-list custody. The old mapper only changes service/account strings. No actual retained native owner in these paths authenticates the historical default keychain location, source row ownership or permission to read it.

Consequently this proposal does not guess an access group, reuse the DP group, probe an owner's original namespace, add `kSecUseDataProtectionKeychain`, omit a group as a broad fallback, or call the existing create-on-not-found helper. A future real historical producer needs authenticated historical keychain/search-list/selector provenance and explicit read authority, plus actual profile/writer ownership. Signed policy/checksums, successful new-v2 authority import and physical home FD alone are insufficient.

## Concrete handoff

`DecodeLegacyInboxFromCapturedKeyRead` accepts explicitly **caller-constructible captured observations**, never calling them native authority. It classifies framing using the actual legacy codec, preserves not-found separately from every unavailable OSStatus, requires explicitly captured Data-kind/canonical 44-byte Base64 encoding of exactly32 bytes, and passes only that decoded historical key to the real legacy decoder. Wrong key/authentication, malformed key and malformed framing remain distinct; no DK/new-purpose fallback or random key is used. Temporary decoded-key copies receive volatile zero stores, but caller-owned encoded bytes and crypto internals are not claimed erased. There is no disk/log/receipt write.

The actual reader caller is missing, so no production callsite is silently rewired. The pure C++ API is the exact available byte/result integration seam for that future read-only producer. A transient locked observation defers that call; a later independently captured successful observation can decode without resetting any authority.

`source/chrome/browser/aux/legacy_inbox_captured_fixture/main.cc` is a focused synthetic captured-read fixture source, not executed. It covers missing, locked→available, malformed type/base64, independent wrong key, explicit version/framing refusal and actual legacy decode. It imports only Security status constants, never calls Security. The optional unregistered GN target links these sources plus existing real codecs through production `//base` and `//crypto`; no manual dependency list or broad provider graph is proposed here. It has not been applied, built or queued.
