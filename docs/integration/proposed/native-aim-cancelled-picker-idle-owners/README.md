# AIM canceled chooser and idle Drive owners — v603 proposal

Source-only, five files, eleven unique count-checked replacements. No native checkout mutation, build, runtime, profile access or UI change. `manifest.json` records exact before/after hashes and the v603 composition manifest hash. The three composition-tracked inputs match v603. The two newly touched original headers match native upstream HEAD byte for byte; their explicit baseline hashes extend the inventory.

## Fixes and ownership proof

1. A native file chooser that is opened then canceled retains `web_contents_` and `edit_model_` and permanently marks `aux_ever_started_work_`. The new cancellation proof releases only canceled dialog input references after original close/reset/reopen behavior. It requires the same chooser generation, no live dialog/blocker, and **no selection at any point in this selector's lifetime**. Every new chooser clears the proof. Every `MultiFilesSelected` call permanently disqualifies cancellation proof, including empty/rejected selection calls. No file read/upload callback is canceled or invalidated. Outstanding weak references and all registered callbacks still block retirement. Reentrant chooser opening during close/reopen callbacks cannot let the previous cancellation release new owners. The original popup/session live guards remain mandatory.
2. `GetDriveDisclaimerStatus` lazily retains `DriveDisclaimerController` after a status response, even when no picker opened. Its sole weak factory is captured by every `CheckDisclaimerStatusAsync` response. Admission now tests that actual pending callback owner instead of mere allocation. A pending response remains blocked through callback destruction; a cached idle controller is safe to destroy with its owning WebUI. Active picker, picker receiver, deactivation blocker and upload-reply callback still block independently.
3. A dismissed Composebox Drive sign-in promo leaves its controller allocated. `OnViewIsDeleting` clears the actual view pointer, and the view retains the controller's weak pointer through destruction. Admission requires both no view and no weak references. Active/closing views remain blocked, as do outstanding controller references. No sign-in is initiated or canceled by this proposal.

The predicate changes do not clear pending work or mutate native owners during admission. Root must continue using the renderer-clear generation acknowledgment **and** the independent live native-idle guard.

## Intentional remaining blockers

- Any selected attachment in this native selector's lifetime, including later completion or rejection. Safely lifting this needs actual ThreadPool read, upload/context handoff and edit-model context ownership acknowledgment, not a timer or a cleared busy flag.
- Preserved renderer context, draft text, selected tabs, uploaded/submitted tokens, previous turns and persisted tab context. These are retained user work, even when network activity is idle. Cross-profile destruction must not discard them; a future feature needs per-profile parking/restoration or an explicit user choice to close/discard.
- Active file/Drive pickers, Drive disclaimer requests, sign-in promo views, screen share, query contextualization, navigation, autocomplete, pending tab fetches and Mojo upload replies.
- OmniboxEverywhere registered chooser callbacks. This proposal does not detach owners it does not own.

## Verification and integration

`prepare.py` builds only proposal source copies and patch, asserts the three v603 pins and every replacement count, and records all five input/output hashes. `git apply --check native-aim-cancelled-picker-idle-owners.patch` passed against the unchanged native checkout. Both new upstream header baselines were compared with `git show HEAD:<path>` and match. No compile or actual-app evidence is claimed.

Integrator: add these five paths and eleven edits to the next pinned composition, preserving existing AIM renderer/live-owner checks. Build once with the other batch changes. Lean actual-app acceptance: open/cancel native chooser without selecting a file, close settled AIM, then switch disposable profiles; verify switching remains blocked with a real selected attachment or an open picker. Where the existing test profile can reach Drive UI without new account access, confirm a settled disclaimer response or dismissed promo stops blocking, while an open picker/promo still blocks. Otherwise record that Drive behavior remains source-verified only.
