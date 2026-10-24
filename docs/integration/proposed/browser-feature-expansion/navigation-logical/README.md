# Shared logical tabs and Spaces in the supplied command bar

This is a narrow overlay on root's composed native search owner and preference API.
Apply `shared-edits.json` in order with exact count/before-image checking; do not
replace root shared files wholesale. `baseline/` and `source/` pin the three
native files. No schema extension or new native command ID is needed: existing
commitCommand's request is an object with additional properties.

The current native owner returns profile-local logical tabs, Spaces, model
revision, owner generation and this window's native tab IDs. Loaded local rows
use the actual local URL/title, even when canonical shared metadata has changed.
The supplied existing result sections, rows, typography, styles and input remain.
Two different logical IDs with the same URL remain two rows. Existing native
rows represented by a logical ID are removed by exact native ID only; unrelated
local native tabs remain. Foreign native-only rows are omitted rather than offered
as an action that could focus another window.

New commit kinds `activate-logical-tab` and `select-space` carry stable `id`,
`organizationOwner` and decimal `organizationRevision`, plus the existing search
`generation`. The native handler derives profile/window from the actual installed
search owner, checks admission, current model owner/revision, membership and live
window projection, and consumes the search generation before dispatch. A changed
model refuses and asks the user to reopen; it never adopts a new owner silently.

Space selection calls the existing actual-window controller. Opening a logical
tab selects its owning Space when applicable and calls `OpenLogicalTab`, which
reuses this window's exact view or creates a distinct view here. It never moves,
activates, deduplicates by URL, or navigates an existing view in another window.
Global pins retain the current Space. Archived/folder/foreign IDs are refused.
The callback path handles reentrant window/profile changes after Space selection
and validates owner/admission again before acknowledging success. The existing
native-tab and navigation paths are unchanged. `CommitAuxCommandAsync` uses the
actual controller completion rather than optimistic success or a stack callback.

Focused evidence: six navigation checks passed, including actual pinned supplied
asset transforms/parsing, preserved class names, stale errors, native-ID behavior,
stable-ID duplicate-URL separation, current-window row filtering, and exact Space
and logical-tab request shapes. Counted native overlay replay and diff checks pass.
Native compile and two disposable-window journeys remain integrator acceptance:
open a shared entry with no local view; open an already loaded local view with a
different canonical URL; select a Space; refuse a stale model/profile generation.
No app, account, provider, owner files, signing or restart was used.
