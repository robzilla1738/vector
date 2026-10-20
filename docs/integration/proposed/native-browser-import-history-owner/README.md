# Original live import history summaries and destination owner

Incremental source-only proposal after `native-browser-import-full-staging` (`d2c144467`). Two files, no GN/new dependency. No source-profile, credential, Keychain, runtime, OS, build or shared native operations were performed; not compiled/runtime accepted.

Original mode1 Chromium worker4253e58 reads `SELECT url, title, visit_count, typed_count, last_visit_time, hidden FROM urls`. It creates actual history URLRows, excludes invalid URLs and the chrome/chrome-extension/devtools schemes, and retains title/counts/time/hidden. Destination4258618 calls native ProfileWriter::AddHistoryPage with source1 at4258974; real original ProfileWriter7822c94 forwards that URLRows batch to HistoryService. Current155 ProfileWriter preserves that same implementation by calling `AddPagesWithDetails`.

Current independent native reads visits JOIN urls, replays a synthetic AddPage per visit, and discards original URL-row hidden state/counts. A URL row with no visits is omitted; visit/typed counts can be changed by replay. This is materially different from the actual owner.

The port reads the original six URL columns, marks native-only Chromium summary rows, and sends the actual URLRows batch through the same real `HistoryService::AddPagesWithDetails(..., SOURCE_BROWSED)` primitive as supplied ProfileWriter. That is one native batch, not a model/API simulation. It preserves original valid-URL/three-excluded-scheme filtering and all six fields. The existing genuine history policy/service checks remain before destination effects. Firefox and Safari paths retain their separate current handling.

The real source-batch-before-destination gate from d2c144467 remains in force, so this history write is never reached if whole-source staging failed. This does not complete bookmarks/Arc augmentation/extensions or the original password/cookie completion barrier; those remain explicit full-owner work.

## Evidence / integration

`history-query-and-filter.asm` pins SQL preparation; `history-row-fields.asm` includes source scheme literals/register setup and URLRow construction/field assignments; `history-destination.asm` pins the actual ProfileWriter call and immediate1; `native-profile-writer.asm` pins its native forwarding body. Current Chromium profile_writer.cc, url_row.h and stable VisitSource enum are hashed; exact original query bytes are pinned.

Both baselines are exact d2c144467 outputs. Root should rebase only these ReadCategory/ApplyHistory hunks after its staged L4 discovery/current owner changes; do not overwrite other file contents. Existing migrator/service objects only. `verify.py` hashes original evidence and replays both patches in a disposable tree seeded from the explicit parent proposal.
