# Browser Retry visible-owner fixture

One authorized test leaf only. Original focused failure reproduced deterministically before fix; registered Retry had empty jsdom getClientRects and therefore failed the real scoped visibility gate before the second autocomplete request. This was not async settling. Original last-called-with-alpha assertion inspected the first failed request and did not prove Retry dispatch.

Adds positive geometry only to exact mounted Retry element (spy automatically restored by original afterEach), verifies genuine registered data-command-id and actual request count1 before click/count2 after. All original failed-presentation, raw error suppression, kept query, recovered history and removed error assertions retained. No sleep/timeout/assertion or production change. Actual six original tests PASS and scoped zero-warning lint PASS; full source/types remain root gates.
