# Original bookmark tab exclusion predicate

Port original4127744 as the exact combined rule: require actual tab and model, then exclude genuine retained-group WebContents userdata or an actual native agent-group feature. Ordinary groups, collapsed groups, pinned tabs, split tabs and matching URLs/titles are not this predicate.

Original d6e4f6c key is positively followed through its read, capture and removal. Capture45f4dcc..4eac creates96byte userdata holding its real WebContents, native GroupId and copied original TabGroupVisualData; deletion45f9410 destroys strings and its raw pointer only. Separately, native-agent-group-model pins that actual group+b8 is TabGroupFeatures and byte11 is its actual agent marker, not the group collapse flag. The helper uses the already ported real feature.

The155 adapter stores actual TabGroupId/TabGroupVisualData on the real WebContents with capture/read/clear APIs for that original producer. No fixture marker, URL heuristic or fabricated owner is introduced. As in the existing agent-group adaptation, the original unused extra visual string has no155 consumer; the real title/color/collapse/agent marker remain preserved. No consumer may synthesize group capture from this query.

This slice does not connect the original snapshot capture/restore owner. That remains an explicit integration prerequisite for its first branch to occur in genuine behavior. The real loaded native group-feature branch is complete. This exact query is provided for the full Bookmarks owner’s live-index/activation eligibility; actual browser observations remain outstanding.
