#377 actual155 const and member-order diagnostics

One exactcurrent coordinator file; no behavior, source-model, callback or lifecycle policy changes.

- Initialize preview_ before admission_, matching their actual declarations and fixing `-Wreorder-ctor`.
- Only mutable methods use mutable ViewTracker accessors. Remove the invalid const qualifiers from the four mutable leaf helpers.
- Read-only Current checks use const ViewTracker::view() directly. Read-only candidate lookup casts to **const** VerticalTabBookmarksView and calls its actual const FindNode. No const_cast or discarded qualifier.

Actual377 log, real ViewTracker const overload and exact baseline/output are pinned. Seven counted source anchors, one-file disposable replay passes. Original coordinator and previous weak-binding proposal remain immutable. Native apply/compile and runtime checks remain root-owned; no shared checkout writes/builds.
