# Original bookmark admission and untruncated source rows

Source-only follow-up after e3a0806b5. This explicitly supersedes that proposal's statement that a javascript restriction should remain: the supplied implementation, not inherited independent narrowing, determines bookmark admission. Two files/six count-one anchors; no metadata, crypto, availability, GN or native checkout changes.

## Positive original rules

425c084 admits valid GURL and excludes exactly chrome, chrome-extension and devtools. It accepts valid javascript bookmarklets. It does not truncate title/root-label text, impose64 folder levels or20,000 bookmark rows, require every child to be a valid record, or fail an entire import because a node has unsupported/missing type/URL. Malformed/unsupported records are skipped. Named folders are emitted before recursion; unnamed folders are omitted as rows/path components but their real children are still traversed. Source URL titles fall back to URL spec when missing/empty. date_added is used only when StringToInt64 succeeds and yields positive Windows microseconds; otherwise original Time::Now is stored. Duplicate URLs remain distinct.

The original4253e58 source reader skips missing/unreadable/invalid Bookmarks data and missing root lists. It reads the file without a source byte limit, parses with options0 and explicit max depth200 (42540xx/JSON call1bc1f3c), and traverses the three actual root lists.425bf70 uses nonempty full root names or its exact default strings. The proposal ports these rules into actual ReadCategory/BookmarkTree rather than treating inherited limits as a smaller completion target.

The same unsupported javascript exclusion is removed from the remaining generic bookmark destination branch. Real valid bookmarklets are inserted through actual BookmarkModel::AddURL; no alternative URL execution or scripting mechanism is added. Current mode1 imported-folder source semantics from e3a0806b5 remain unchanged. Source root/path/name text is not clipped. Other history/SQLite/password/Firefox/Safari-specific limits are outside this bounded source-positive slice and are not silently removed or claimed faithful.

## Validation

Original whole-image/raw function/literal pins and derived writer/flatten evidence are retained from the parent. `python3 verify.py` passes all pins and exact six-anchor/two-file replay. No native build, source-profile enumeration/import, browser launch, owner data/Keychain/OS operation or signing occurred. Actual compile and model/runtime acceptance remain integrator work.
