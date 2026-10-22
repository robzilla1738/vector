# Notification target close/profile-transfer race, native613 resources

The prior exact-hint check can pass, then the real window closes or changes
profile while the original tabs.query/update/create or windows.update promise is
pending. Chromium's profile filtering correctly rejects the now-inaccessible
target, but the supplied helper only logs failure after the notification is
cleared. This followup retains the exact source window ID (including the original
reused tab's window for a no-hint click) and, on an operation failure, obtains a
fresh current-extension-profile window list. Only confirmed absence of that exact
window permits one new normal-window creation in the original caller profile.

No blanket retry: a surviving target's policy/permission/tab error propagates.
Unknown window ownership propagates the error. Failure obtaining the proof or
creating the replacement also propagates. Initial already-stale recovery remains
outside the catch, so a failed replacement is never retried. A later failure on a
still-present window cannot create a duplicate notification target. No substitute
cache, foreign window, account or profile path is selected.

`patch.json` in the prior proposal is updated because production already reads
that exact transform. Its frozen input/count-one anchor is unchanged and output
hash is updated. Preparation reconstructs the prior reviewed patch from pinned
repository commit e03aef448, then applies this followup; both prepare entry points
now generate the same result. No signed daemon or native source is modified.

Focused tests execute the actual transformed function with controlled Chrome API
boundaries: close after query, profile transfer during tab update, transfer before
focus, reused no-hint tab ownership, and policy refusal on a surviving target.
Prior stale/valid/no-window/cache-avoidance checks still pass; full output syntax
passes. These are source fixtures, not real app or OS notification acceptance.

Native queue review found no new mutation needed: NotificationInbox captures
profile_->GetPath() by value for the worker write, binds DidSave to its own weak
pointer, and dispatches through its still-live original weak Profile. Shutdown
invalidates replies and clears that profile. A browser-window profile switch does
not reassign an inbox's profile or route a reply through the active window. This
is source ownership evidence, not proof that an OS click has been delivered.

See actual-app-exercise.md for the existing supplied message route that exercises
the real background handler without creating fake notifications or granting OS
notification permission. Root owns actual UI/profile actions and evidence.
