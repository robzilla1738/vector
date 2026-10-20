# Preserve original source bytes through private staging

Three-file immutable followup after19114b5b2 password metadata. It adds a private header and updates the native worker/UI transfer only. No RPC schema, public method, extension message or credential API is added.

## Original byte/text behavior

Original cookie reader425a8ac..425ad84 receives raw SQL strings through6d63b8, which copies the SQLite-provided pointer/byte length directly into std::string (including non-UTF8/NUL bytes). The decrypted cookie value also stays a native byte string through host-prefix stripping and CanonicalCookie::FromStorage. There is no whole-category UTF8 admission test.

Original password425b820..425be60 keeps raw realm/URL bytes, while user-facing persisted UTF16 fields use the native UTF8→UTF16 converter8e2310. Its dedup425b658..425b74c compares realm plus UTF8-converted actual UTF16 username/password and blocked flag. Invalid UTF8 thus follows that genuine conversion rather than making the whole category fail or using different raw-byte dedup keys.

Current155 base::Value string construction DCHECKs valid UTF8 (allowing noncharacters); simply deleting the inherited UTF8 check would be invalid. `encrypted_source_bytes.h` therefore stores byte values as Value::BlobStorage when they cannot be represented by the string alternative. Valid UTF8 remains a string. Retrieval returns a length-aware view of either representation, preserving embedded NUL and every byte without base64/text loss.

## Actual path

Only ReadChromiumMigrationSnapshot calls the encrypted reader's private-bytes mode. ReadAuthorizedCategory/legacy serial DTO behavior is not silently redefined. Private source fields and decoded secrets enter the real Job::snapshots worker→UI transfer, then only PrepareChromiumPassword/Cookie. Cookies receive the exact byte strings in the actual CanonicalCookie parser; native canonical filtering and callback outcomes remain unchanged. Password fields go through the original native UTF8→UTF16 or actual GURL/store types. Dedup now uses the actual converted UTF16 username/password identity.

Expected private field-type checks still fail genuinely malformed staging; missing keys are not invented empty values. Binary source input is a valid string-or-Blob representation, not a crash, error or skip workaround. Source key/decode/database failures and original aggregate outcomes remain unchanged.

Public result/event callers serialize only PublicJob(job.state); neither snapshots nor rows are members of that state. The byte helpers are included only by migrator.cc/import_service.cc, and the new mode is only selected inside the native worker. No binary credentials or source values are exposed to public RPC/status/extension messages or written to browser storage.

## Integration / verification

Add `encrypted_source_bytes.h` to existing `source_set("migrator").sources` in the importer BUILD.gn. It already has public base dependency; importer service already depends on :migrator. No new target/library/dependency is needed. Root owns that GN registration, two-object compilation and runtime evidence.

Manifest parents are exact19114b5b2 outputs; root may rebase disjoint original bookmark/extension owner changes. Original raw copy/conversion/reader ranges and current155 Value/UTF conversion/cookie type definitions are pinned. verify.py hashes these static sources and replays the two changed files plus /dev/null header in a disposable tree only. No native build, profile, source database, secret, Keychain, cookie operation or browser runtime was used. Snapshot/history/profile admission recovery remains separate.
