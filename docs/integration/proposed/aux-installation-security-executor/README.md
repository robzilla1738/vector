# External installation Security executor source

This adds concrete, reusable Swift source for **explicit selector-bound reads and create-only adds**. It complements the captured-result transaction without activating it. No Security, Keychain, enclave, PQ or original-addon operation was executed. No entitlements, signing, provisioning, runtime dispatcher, root manifests or UI files changed.

`ReviewedInstallationSelectorBindings` requires all four ordered role bindings, an explicit review UUID and the expected SHA-256 of sorted-key JSON-encoded bindings. Every original service/account/access group is supplied explicitly. There is no guessed original namespace, global mapping, omitted/default group, HOME lookup, item enumeration or standard/login/file-Keychain fallback. All targets must be Aux-only, unique and disjoint from originals. The review value is a caller assertion binding exact selectors, **not proof of human approval, entitlement, capture provenance or authority ownership**.

## Operations

- `captureOriginals(review)` and `captureTargets(review)` query exactly their four reviewed selectors through `SecItemCopyMatching`. Queries reuse the recovered generic-password class/service/account/access-group/**Data Protection=true** builder, plus return-data and match-limit-one. The explicit migration adaptation adds `kSecUseAuthenticationUIFail` for unattended reads; it is not an original query attribute.
- `capturedResult(status:result:)` preserves item-not-found separately from every other OSStatus. Success must have exact CFData type identity, then a length of at most 16 KiB before bytes are copied. Nil, wrong type or oversize success becomes `invalidSuccessResult`; zero-length Data is preserved for the cohort inspector to reject. Failures never become “missing.” Payloads and Security error text are not logged.
- `addOnly(request,review)` requires the request role/selector to match that review's Aux target, validates its bounded payload and intent-hash shape, then performs **one `SecItemAdd`**. It reuses recovered DP/access-group/class/service/account/value-data/AfterFirstUnlockThisDeviceOnly attributes. It does not attach a new item ACL or regenerate an enclave authority. Duplicate and every other returned OSStatus are returned unchanged. There is no delete, update, overwrite, replace, initialization, automatic retry or fallback.

The executor does not own transaction state, retain a candidate, verify durable current revision or interpret a checkpoint string as commit authorization. The separately reviewed caller must obtain the request from the candidate-bound reducer after persisting its exact intent, preserve original rows, and record actual returned status and fresh readback before any next step. A successful add is not a completed migration. Existing dictionary/intent constructors are not a security capability against an untrusted caller within the same process.

**Current scoped legacy artifacts are not directly supported by guessing the original group.** Their mapper removes the original access-group attribute and prefixes service/account with `aux.<scope>.<old logical name>`. A raw query with the original product's group is not equivalent. This executor deliberately requires an explicit nonempty group and therefore cannot represent that historical omitted-group binding until its actual effective entitlement/group is reviewed. It supplies no omitted/default-group escape hatch, alternate query retry or automatic mapper. Buildable source here does not establish usable capture/migration for the current artifacts.

## Focused static/compile checks

`source-pins.json` records this executor and the exact existing query, captured-row and terminal-blocked transaction source/evidence dependencies. `verify-executor.py` checks those pins, recovered attribute recipes, distinct missing/failure/type handling, and the sole read/add Security call sites. It rejects update/delete/private-authority factories or filesystem fallback code.

```sh
python3 docs/integration/proposed/aux-installation-security-executor/verify-executor.py
xcrun swiftc -typecheck -target arm64-apple-macos13.0 docs/integration/proposed/aux-native-p256-envelope-port/source/*.swift docs/integration/proposed/aux-native-pq-continuation/source/*.swift docs/integration/proposed/aux-native-signing-port/source/*.swift docs/integration/proposed/aux-native-install-storage-port/source/*.swift docs/integration/proposed/aux-native-four-row-preparation/source/*.swift docs/integration/proposed/aux-installation-additive-transaction/source/*.swift docs/integration/proposed/aux-installation-security-executor/source/*.swift
```

Both passed. SDK typecheck emitted the expected macOS-11 deprecation warning for `kSecUseAuthenticationUIFail`, which matches the existing interposer's interaction-fail adaptation. Moving to an LAContext-based policy would be a separate behavior change requiring review and runtime verification. No runtime fixture or success claim substitutes for actual Security acceptance.

## Missing real integration

Runtime approval and actual capture/entitlement binding are still missing. This source does not prove that approved Aux helpers share an accepted access group, that imported existing enclave representations remain usable there, or that a read result came from a genuine stopped/exclusive disposable installation. The caller still needs trustworthy expected-public continuity, private durable CAS/fsync journal storage, writer exclusion, actual status/readback linkage to each selector and revision, authenticated same-DK/signature acceptance of target rows, and durable selector selection/restart/rollback. The add path retains original attribute behavior; no claim is made that every Security operation is noninteractive or will succeed under future entitlements. Keep accepted originals until those checks pass. No invocation entry point is provided here.
