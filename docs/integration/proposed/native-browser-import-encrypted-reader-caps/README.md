# Original encrypted reader admission

Two-file immutable followup: migrator.cc follows8fe961c1f cookie-source output; source_crypto_mac.mm captures actual431 (only the one decoder guard changes). No new target or GN registration. Root owns focused migrator and source_crypto_mac object compilation.

The original complete cookie/password SELECT literals have no LIMIT, and their actual row loops collect all records until SQLite completion. They do not impose the inherited50000-row/32MiB decoded-category/1MiB encrypted-row caps. The common425cda0 decoder similarly has no inherited1MiB ciphertext cap. This proposal removes those particular admission limits, including the nested decoder limit which would otherwise silently retain the1MiB narrowing.

The encrypted reader now uses SQLite's actual string byte count instead of the independent Text() helper's8192-byte truncation. All native SQLite length/allocation failures, actual source-key gate, decrypt outcome aggregation, canonical-cookie admission and real destination policies remain. Other importers' helper and bounds are not changed by this slice.

## Remaining concrete admission differences

These are gaps, not original limits or readiness claims:

| Current boundary | Proven status / followup |
|---|---|
| Shared Snapshot256MiB file/page budget and4096-step backup budget | Original reads/copies a physical SQLite snapshot, not this bounded in-memory backup. Requires that real owner adaptation; not blindly removed here. |
| Shared JSON32MiB / bookmark recursion64,20000 / history200001 / source-profile128 | Independent boundaries outside this encrypted loop; no claim that they match original. L4 owns discovery/Bookmarks recovery. |
| UTF8-only private base::Value DTO | Native original uses byte strings and UTF8→UTF16 conversion, not this admission error. Removing the check alone would violate base::Value string DCHECK. Needs genuine private Blob/typed staging adaptation. |
| Password13-column DTO | Original SELECT27 retains additional persisted metadata. A source/destination projection port remains needed. |

The current source and decrypted metadata bounds are thus improved, not declared full importer parity. Real native allocation failures are not replaced with fabricated successful truncation.

## Proof

Original binary, complete reader ranges, common decoder and SELECT bytes are pinned in source-evidence.json. verify.py performs static pin checks and disposable two-file replay only. No actual source profile, source DB, credential, Keychain, destination write, native build or OS action was used. Root compilation/runtime acceptance remains separate.
