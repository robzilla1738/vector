# Prepared disposable four-row selector bindings, version 2

This is an **external, review-only selector proposal**, not runtime authorization, migration acceptance, a signing plan or a claim that rows currently exist. It contains no keys, record values, ciphertext, persistent references or owner data. No Security API, Keychain access, signed helper, current authority, profile, signing/provisioning or runtime host validation was used.

Review UUID: `3f3618fe-fae2-4772-a83f-f81bf3b30b9c`.

Canonical bindings SHA-256: `0683ad79bf18599c9f723ec58e37dbfb9cea55b0911811ae014d39d8958a7db1`.

`review.json` contains the eight exact explicit selector triples. `bindings.canonical.json` contains **only** the ordered four binding objects, UTF-8, sorted JSON keys, compact separators, no escaped slashes and **no trailing newline**. Its SHA is compatible with the actual `ReviewedInstallationSelectorBindings` Swift encoder (`.sortedKeys`, `.withoutEscapingSlashes`). The UUID is a document identity, not proof of consent, host entitlement or custody.

## Exact scope and selectors

The fixed historical disposable scope is:

```
dbca8cbbce80cb5eb3f2f89043330556fdbf2350f3c057a69d6e10e6b3d11476
```

Every source and target triple explicitly uses the same already-Aux group evidenced by the prior public artifact review:

```
9F2JXY8TCK.dev.aux.dp.dbca8cbbce80cb5eb3f2f89043330556fdbf2350f3c057a69d6e10e6b3d11476
```

This proposes **no new or production access group**. Let `P` be the exact prefix `aux.dbca8cbbce80cb5eb3f2f89043330556fdbf2350f3c057a69d6e10e6b3d11476.`. The exact fully expanded strings are in `review.json`; the table uses concatenation only for readability:

| Role | Original service | Original account | Proposed Aux-v2 service | Proposed Aux-v2 account |
| --- | --- | --- | --- | --- |
| metadata | `P + aside.install` | `P + aside.install.meta` | `P + installation.v2` | `P + installation.v2.meta` |
| signing | `P + aside.install` | `P + aside.install.sig` | `P + installation.v2` | `P + installation.v2.sig` |
| kem | `P + aside.install` | `P + aside.install.kem` | `P + installation.v2` | `P + installation.v2.kem` |
| wrappedRoot | `P + aside.install` | `P + aside.dk` | `P + installation.v2` | `P + installation.v2.dk` |

All are proposed generic-password Data Protection selectors. Each query must explicitly include all three string selectors plus the class/Data Protection attributes; an omitted-group search, guessed app group or target-to-source retry is not part of this proposal. All four source triples are distinct, all four targets are distinct, and source/target sets are disjoint even though the group is the same. No target selector contains the old product name. The legacy logical suffixes in source lookups are historical evidence, not the desired delivered identity.

## Public evidence and limits

`source-pins.json` pins the previous `aux-dp-access-group-review`, its public artifact snapshot, the fixed scope policy/helper/mapper source and the current Swift value types/constructor. The historical mapper removes the original supplied explicit group and prefixes the full service/account suffix with `P`. The fixed helper source declares this disposable Aux group and exactly these four original accounts. The public artifact snapshot declares the same group for historical daemon, CLI and carrier hosts; its `signatureVerified:false` fields remain false.

These facts make the selectors concrete candidates for **that historical disposable scope only**. They do not prove current row existence, current signer/provisioning-group validity, ownership of matching records, possession of unchanged installation authority, absence of competing writers, durable transaction custody or permission to capture/migrate. The same-group target does not inherit those proofs. No interpretation of this review may silently reset or initialize missing, inaccessible, malformed or partial state.

## Pure verification

```
python3 docs/integration/proposed/aux-disposable-selector-bindings-v2/verify.py
```

The check authenticates public source pins, canonical JSON and reviewed file bytes, exact scope-derived triples and same-group public evidence. It extracts the **actual production pure Swift initializer/value types unchanged** into a temporary standalone program with Foundation/CryptoKit only. It does not compile the enclosing Security executor or import Security. The real constructor accepts the canonical binding SHA and rejects wrong hash, reversed roles, source/target overlap and a target with the old product name. Temporary compilation is not a signed-helper execution or Keychain test.

For later exact-byte review, pass `reviewId`, ordered decoded `bindings` and `bindingsSha256` to `ReviewedInstallationSelectorBindings`. Keep the canonical SHA separate from the full `review.json` file SHA (both are pinned). A future runtime review must additionally bind exact executable bytes, validate actual authorized host/group/provisioning, establish stopped-writer custody, capture exact source and target rows without fallback and define restore/readback/terminal receipt handling. This document supplies none of those authorizations and activates nothing.
