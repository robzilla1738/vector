# Owned native browser participants

This migration-only browser UI entry point invokes the actual process-wide async-profile and extension-worker admission gates, the owned direct-helper quiesce API, and the loaded-profile session writer participant. It accepts no asserted receipts, authority tokens, profile paths or success flags from JavaScript. Normal startup, normal shutdown and all UI remain unchanged.

The owner marks both asynchronous observations pending before closing admission or invoking any callback. Reentrant requests join the same operation; there is no reopening, reset or timeout. It retains session results and pending callers in native process-owned state. Missing callbacks remain pending. Callback delivery occurs only after the two native callbacks are observed, and may still report failures, unresolved work or running workers.

Review found an unresolved lifecycle defect in this revision: `BrowserProcessImpl::profile_manager()` lazily creates its manager. The consumer therefore does not yet satisfy the intended non-creating inspection boundary. A separate pinned successor must use an actual non-creating accessor; the current build cannot establish that behavior. No execution of this migration entry point has occurred.

Inspection reads the real current async-profile and extension-worker observations. Once the direct-daemon callback has arrived, it reads fresh helper custody, so later carrier activity does not disappear behind the earlier daemon result. None of these observations is converted into an all-writers-stopped or migration-authorized Boolean.

The implementation belongs in the existing browser UI target. That target already depends on the platform, profile, session and extension layers; placing this consumer in `aux:platform` would introduce a platform→UI→platform dependency cycle. Root owns its exact source composition and GN registration.

This source does not initiate ordinary shutdown: SessionService teardown can still emit legitimate final writes later in that lifecycle. A genuine cold-migration owner must also stop upstream navigation/renderer/storage/independent-process work, handle unsupported sync/OTR creation and pending operations, bind exact scope, and consume the complete lifecycle before granting protected bootstrap. The unconditional state2 refusal is unchanged. No native activation, owner data, signing or OS operation is authorized by this API.

Implementation and focused native integration are still in progress. This document is not a successful build or runtime receipt.
