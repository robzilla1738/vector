# Observe one failed logical-row split gesture

The integrator observed a working two-pane native split, but two attempted Gamma-to-Alpha drags produced no third pane. The full-width logical row already reaches `BeginDrag` → directional edge detection → `SplitLogicalTabs` → `JoinNativeSplit`; no absent bridge was found. The retained half-width native pair row belongs to another drop surface. Current source intentionally retains that pair representation alongside the logical rows.

This proposal changes no behavior. Two existing owner files, thirteen counted anchors, emit only fixed event names, booleans and edge enums to the existing stderr stream. No titles, URLs, profile/Space/tab IDs, coordinates, credentials or file paths are logged. No projection/build/app operation occurred here.

For one gesture on full-width rows, read these events:

- `begin context=1`, then `motion target=1 edge=...`: the row received and classified the input. Edge enum is 0 none, 1 left, 2 right, 3 top, 4 bottom. A center drop reorders.
- `refresh-cancel`: an organization/window refresh destroyed the captured row before release. Existing stale-revision checks remain enforced.
- `release retained=... moved=... target=... edge=...`, then `stale-context` if the captured profile/generation/revision ceased matching.
- `target-open`, `source-open`: the existing controller could obtain actual native views. A refusal is still a refusal.
- `native-result ... joined=...`, `completed success=...`: actual native join and returned result. Source must be unsplit; target can already belong to a pair.

No visual redesign, new drag owner, retry/polling, authority bypass or speculative admission change. The next correction must follow this evidence. Remove these diagnostic statements when the actual cause is repaired. Root compiles the two affected objects under the existing build lock and includes them only in a meaningful grouped candidate.
