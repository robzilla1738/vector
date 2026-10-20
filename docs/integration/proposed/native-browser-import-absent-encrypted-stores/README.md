# Encrypted readers: absent stores versus actual SQL failures

One-file immutable correction after3c87170e6 physical owner. No GN, API, source-key or destination change. It returns the original empty successful category for absent stores; it deliberately retains actual SQL failures.

| Original condition | Actual original result / port |
|---|---|
| Cookie Network/Cookies absent and fallback Cookies absent | 425a580..425a588 branches to425a480, which sets return1. Output was already cleared. Return cookies[] before opening, rather than creating an absent source via native Open. |
| Either Login Data store absent | 425b5cc PathExists false skips to425b5a4 next path. Both absent reaches425b78c with zero attempts and returns1. Return passwords[] when no paths exist. |
| Present DB selected but Open fails | Cookie425a6a8..425a6b4 and password425b514..425b524 return0. Preserve whole staged-source failure. |
| SQL prepare invalid | Cookie425a7fc→425a7bc and password425b2fc→425b2c0 return0. Preserve failure. |
| First/next step yields no row because SQLITE_DONE, with no decode attempts | Original statement success predicate admits SQLITE_DONE; zero attempts admits success. Current real Statement::Succeeded does the same. Empty valid DB stays successful. |
| SQL step/error after zero or more rows | Cookie425a788..425a7b8 +425b064 and password425b288..425b2b8 verify actual statement validity/status. Invalid/non-success returns0. Preserve failure, even after some decoded rows. |
| Individual decode failures, at least one successful decode | Keep original row skips and successful aggregate. |
| Encrypted attempts but zero successful decode | Keep original false aggregate, not successful truncation. |

The supplied worker4254b04/4254b20 consumes these bool results: false from either reader enters its error-result path4254b28. This differs from the void history reader and is not loosened to history semantics.

The actual full-owner key-required gate remains intact. Returning empty inside a reader neither manufactures a key nor changes the prior real key lookup when the full worker saw an existing encrypted database. This also preserves original behavior when a file disappears between staging's earlier existence check and the reader's own existence check. It does not invent race guarantees after a successful existence test; original source-fallback Open has its genuine semantics.

Public ReadAuthorizedCategory legacy preflight is unchanged; this addresses the original encrypted reader used by real full staging. Existing per-file SQL failures remain authoritative. Root may rebase these two disjoint path anchors onto its current Blob/Arc/discovery output.

Original raw condition/return/worker branches, provided full-worker decompile and current155 Statement::Succeeded implementation are pinned. verify.py performs static pin checking and a disposable patch replay only. No native build, SQLite/profile/DB/credential/Keychain/browser/OS execution occurred. Actual import acceptance remains root-owned.
