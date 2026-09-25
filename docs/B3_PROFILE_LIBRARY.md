# Chromium Profile library authority

Patch `0023-profile-library.patch` connects Aux Library to the regular Chromium Profile. The native host rejects off-the-record Profiles before constructing the adapter. HistoryService owns visits and BookmarkModel owns the bookmark tree and reading-list metadata. Runtime SQLite holds a disposable history search projection and offline article bodies only.

## History projection

- The first authenticated browser API response starts a full HistoryService query. The adapter sends visits to `history.projectSnapshot` in batches of at most 1,000. Runtime stages batches and replaces its history table in one transaction after the final batch.
- HistoryService observers send ordered `history.projectDelta` visits and title updates. Events received during a snapshot are queued and replayed after commit. Deletions trigger a new snapshot because Chromium can report visit IDs without the timestamps needed by the derived index.
- Each snapshot uses a fresh source generation. Runtime rejects foreign Profile IDs, gaps, and stale sequences. A runtime restart hides the prior projection until a fresh snapshot commits. Chromium navigation cannot write runtime history even before that first commit.
- `history.clear` and `history.remove` call HistoryService; observer changes update the derived index. Runtime never deletes a Chromium visit directly.

## Bookmarks

- `native.bookmarksInvoke` serves the existing `bookmarks.*` API from BookmarkModel. Model observers send a coalesced `native.bookmarksChanged` note so the renderer refreshes Library and command-bar candidates after edits from any browser window or sync.
- Library carries `nodeId` for exact edits, moves, reading-list actions, and removal when several Chromium bookmarks share a URL. Existing URL-only callers still resolve to the most recently added user bookmark. Undo removal creates a new node rather than changing another duplicate.
- Browser permanent roots appear as folders. Their display names gain a numbered suffix if a user folder already has that name, so each folder path resolves to one node. Reading-list and read-progress flags live in BookmarkModel node metadata. Offline article bodies remain in the runtime cache and are removed when no saved reading-list copy remains for the URL.

The runtime bridge invokes only the Profile-owned native host over the authenticated channel. The generic bookmark method is validated against the API contract before dispatch, and the native adapter has a closed method allowlist. The private Profile does not receive this adapter or its notifications.

## Verification

- `tests/unit/history-projection.test.ts` covers atomic replacement, ordered deltas, title changes, pre-snapshot read-only behavior, and Profile isolation.
- `tests/unit/handler-results.test.ts` covers native bookmark routing without SQLite writes and fresh-session history reads.
- The new native `profile_library.cc` syntax compiles against pinned Chromium 154 headers after a temporary local `base::Value::Dict/List` to `base::DictValue/ListValue` substitution. That repository-wide API migration belongs to the ordered native patch replay; it is not embedded in patch 0023.
