# Supplied Firefox cookie preparation and destination settlement

New-files-only native proposal. This ports the original Firefox cookie worker and its real destination side of the public full-import preparation hook. It does not mount a replacement Firefox importer, run a source reader, or claim runtime acceptance. The separate real Firefox owner must call this module; bookmarks-only does not call it.

## Integration interface

Include `chrome/browser/extensions/api/aux_browser_import/firefox_cookie_import.h`:

```cpp
aux::PrepareFirefoxCookies(
    profile->GetWeakPtr(), selected_source_profile_path,
    weak_actual_owner_running_predicate,
    std::move(actual_host_prelaunch_ack),
    std::move(actual_owner_cookie_settlement));
```

Exact signature: `(base::WeakPtr<Profile>, const base::FilePath&, base::RepeatingCallback<bool()>, base::OnceCallback<void(bool)> prepared, base::OnceCallback<void(bool)> settled)`. Entry/replies/native results run on UI; the copy/SQL worker runs on a MayBlock task. Only the already-selected real source path is used. The actual import owner supplies its weak running predicate and overall completion/cancellation, rather than a fabricated success adapter. This interface is agreed with the real Firefox owner proposal in the prefs_reuse lane.

Original4263f48 posts4260740 and replies4264114. Critically, **prelaunch acknowledgment is not destination completion**:

- Worker false: original writes complete=true/success=false, then acknowledges false. The port calls `settled(false)` before `prepared(false)`.
- Successful empty result (including absent cookies.sqlite): complete=true/success=true, then acknowledgment true. The port calls `settled(true)` before `prepared(true)`. Original checks this before needing a live destination manager.
- Nonempty rows with absent profile/storage partition/manager: actual failure, not success.
- Nonempty rows with actual manager: original42642e8 sets the total pending count, queues every real SetCanonicalCookie, and426438c acknowledges true immediately. The port preserves this order. Native callbacks42643d8 count actual Include status; the last callback sets cookie completion and success iff at least one cookie was included. The full owner separately joins cookie completion with host and password completion. Enqueueing itself never claims import success.
- Original running byte+2c guards reply/write effects. The port calls the actual weak running predicate; stopped reply acknowledges false and does not settle a stopped owner; native results after stop are ignored. It does not pretend to undo already dispatched cookie writes. Missing/disconnected native callbacks are not converted to success.

## Exact source worker

Original4260740, copied decompile and bounded complete assembly are pinned to the supplied arm64 framework SHA256. Only this Firefox callsite is used as evidence; it differs from the Chromium cookie/password snapshot.

Absent cookies.sqlite is a successful empty result. Otherwise a unique scoped_dir must be created and the database must be copied to it. Existing cookies.sqlite-wal and cookies.sqlite-journal must each copy successfully. There is no original-source fallback, SHM copy, in-memory SQLite backup, independent byte cap, or row LIMIT. The native SQL owner is `sql::Database("FirefoxImporter")` with actual default options and `Open`; the database closes before its owned temp directory is retired.

Required moz_cookies columns are name/value/host/path/expiry/lastAccessed/creationTime/isSecure/isHttpOnly. Optional sameSite/schemeMap/originAttributes/updateTime/inBrowserElement use literal defaults 256/0/''/creationTime/0. The exact dynamic SELECT order is preserved. Missing table/columns, failed Open/prepare and SQL iteration failure are real worker failures; iteration failure discards earlier rows. Absent DB alone is successful. Neither DB bytes nor cookie contents enter public job JSON or RPC: the worker transfers native CanonicalCookie/GURL objects directly.

The source skips expired/nonpositive-expiry and inBrowserElement rows. Empty origin attributes are ordinary cookies; nonempty attributes require a valid query containing exactly one partitionKey and no other/duplicate keys. The native QueryIterator's original unescape mask30 is retained through the matching155 method. Literal '+' is then replaced with ':'. Parenthesized tuples use KEEP_WHITESPACE/SPLIT_WANT_ALL; only http/https, nonempty host, optional valid1..65535 port and optional literal f are allowed. Actual CookiePartitionKey::FromStorage supplies native canonicalization. Invalid partition metadata, or partitioned nonsecure cookies, are skipped rather than laundered into unpartitioned rows.

Secure or schemeMap bit2 chooses HTTPS; otherwise bit1 chooses HTTP; no allowed source scheme skips the row. SameSite0..2 maps directly, all other values become UNSPECIFIED. Original priority1, source_port-1, source_type3 and FromStorage callsite5 correspond to actual155 MEDIUM/kOther/kCookieManager. Native FromStorage rejection skips a row. Source URL construction strips one leading host dot and uses actual scheme://host+path, then retries '/' only when invalid, just like637300 and its worker caller. Original times are Unix seconds for expiry and Unix microseconds for creation/access/update, using native saturating time arithmetic. Values remain native length-preserving strings.

## Root registration and verification

Add both new files to the existing `aux_browser_import` native target used by the real Firefox owner. Required dependencies are base, chrome Profile, content browser/storage partition, net cookies/url utilities, services/network public Mojo, and //sql; most are already dependencies of this importer. Root owns exact GN registration and the focused object compile. No schema/public route/category mask change is needed. This module alone is unmounted; pair it with the actual Firefox owner and host prelaunch hook.

`python3 verify.py` checks original binary/range/literal hashes, pinned155 API sources, immutable proposal output hashes, and replays the new-file patch in a disposable empty Git tree. It performs no native compilation or operation. No source profile/database, cookies, NSS, credentials, Keychain, browser, process or OS grant was accessed. Source integration and future focused compilation are not Firefox import acceptance.
