# Original Chromium cookie source outcomes

One immutable `migrator.cc` delta against the actual frozen431 input (baseline included and hashed). The430 service destination adaptation is unchanged. No GN changes/new target; root owns the existing migrator object compilation.

## Recovered reader

The complete original425a380..425b128 reader uses the exact20-column SELECT at0xdb1f55e, including has_expires/is_persistent, without querying the meta table. This proposal restores that query and its positional mapping. Password SELECT/metadata remains unchanged in this slice.

| Output | Original column |
|---|---:|
| created / host / partition / name / plaintext / encrypted | 0 / 1 / 2 / 3 / 4 / 5 |
| path / expires / secure / httpOnly / accessed | 6 / 7 / 8 / 9 / 10 |
| priority / sameSite / sourceScheme / sourcePort | 13 / 14 / 15 / 16 |
| updated / sourceType / crossSite | 17 / 18 / 19 |

Columns11/12 are selected by the original schema but are not consulted in its cookie constructor; this does not invent different session expiry rules.

Original425a8f4..425a918 first uses a nonempty plaintext value, even when encrypted_value is populated. Only empty plaintext plus nonempty encrypted bytes enters decoding. The shared425cda0 decoder copies non-v10 bytes unchanged or AES-decodes v10 using the real source key. Cookie decoding then ALWAYS verifies/strips SHA256(host), independent of database meta version (425a938..425aa54). A false decoder result or wrong/short digest skips that row. A plaintext-only row does not enter the counters.

Original x27 is attempted encrypted rows (425a84c), x28 successful prefix/decode rows (425aa54). End425a778..425a784 succeeds with zero attempts OR at least one success; thus partial failures are skipped, while an all-failed encrypted source still fails even if plaintext rows exist. The proposal preserves this distinction. Successful decoding of an empty password remains a success exactly as the prior password proof established; its counter behavior is unchanged.

The real full-owner source-key gate remains unchanged: a selected existing encrypted database still needs its actual source key before staging. Absent databases are still handled by the existing full-staging owner; present invalid SQL/snapshot/required-schema errors remain failures.430 retains native canonical-cookie filtering and real destination callback semantics.

## Verification and limits

`verify.py` hashes the complete original binary, bounded reader/shared-decoder/counter ranges and exact SQL literal, then replays the one-file patch against the captured frozen baseline in a disposable directory. No source-profile fixture, database from a user, native build, OS/credential/Keychain operation or destination write was run. Root compilation/runtime acceptance remains separate.

Current bounded size/text safeguards and read-only in-memory SQLite snapshot implementation remain prior adaptations. This slice does not claim every PasswordForm column, original physical-copy snapshot fallback, Arc augmentation or extension destination fidelity. Those are separate source-owner work; no category support or success is invented here.
