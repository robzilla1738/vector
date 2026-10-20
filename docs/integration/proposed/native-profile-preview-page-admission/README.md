# Exact preview event admission

Followup to renderer5e548e42d, disjoint from data65cbba191 headeralias. The original factory at46536b0..36c4 clears View+1a9 (CanProcessEventsWithinSubtree) for the WHOLE page; preview controls and actual borrowed live tabs are not interactive before activation. It also clears the same event property on Label4653e48..3e60. That does not hide the label. This corrects the extra initial name-hide introduced in the first renderer adaptation and restores whole-page event suppression.

Actual live host/fallback/page visibility changes are distinct virtual+a0 calls, retained unchanged. Original InvalidateLayout at630474 was not used as visibility proof. Pinned original factory extract/hash is retained in sibling native-profile-preview-page/source-evidence.json; no new target or source execution. Exact one-file patch replay verified; not compiled or UI-accepted.
