# Original SQL options/open proof

Evidence-only followup to3c87170e6, with no native patch or API change. This establishes original modes from their actual callsites and consumers, rather than assuming that an unnamed wrapper/default is equivalent.

Both encrypted source readers call300f948 with the exact original `Test` tag. The constructor builds the options at its own stack and calls21f17a8 with that block.21f17d0..17e8 copies the first32 options bytes to Database+8 and options+20..23 to Database+28..2b.

| Original constructor/store | Original actual consumer / result |
|---|---|
| 300f958 MOVI.4H #1,300f95c STR S0 gives option bytes01,00,01,00; copied to DB+8..b | DB+8=1 at174fd1c skips the nonexclusive branch; that branch's actual literal0xdbd33bd is `PRAGMA locking_mode=NORMAL`. Thus this owner retains exclusive locking. |
| 300f974 MOVI.2S #1,300f978 STR S0 gives options+20..23 bytes01,00,00,00 | DB+29=0.174fb58 reads it,174fb5c..6c selects flags0x02040006; the nonzero alternative is0x02040001. Actual SQLite constants identify READWRITE|CREATE versus READONLY, plus shared PRIVATECACHE|EXRESCODE bits. |
| DB+b=0 from the first constructor block | 17500f0..175011c takes the actual literal0xdbd341b `PRAGMA journal_mode=TRUNCATE` rather than enabling WAL. |

The reader calls1561684 on its chosen copied-or-source path;156171c dispatches to the same174fa80 OpenInternal that consumes these options. There is no source fallback-specific read-only mutation or alternate OpenReadOnly call between the copy decision and that call. Hence using actual155 Database::Open with the corresponding defaults preserves the evidenced fallback mode; adding read-only or shared-lock overrides would change original behavior.

Current155 DatabaseOptions explicitly defaults exclusive_locking=true,wal_mode=false,read_only=false. Its OpenInternal uses the same READWRITE|CREATE vs READONLY flags, exclusive-locking selection and journal mode handling. These implementation/header/SQLite definitions and original raw instructions/literals are pinned in source-evidence.json. This does not assert identical internal ABI offsets across versions; the old consumer branches establish semantics and current typed fields supply the adaptation.

No native/query/runtime/profile/Keychain/OS operation or build occurred. verify.py checks static raw source pins only; actual compilation and import acceptance remain root-owned.
