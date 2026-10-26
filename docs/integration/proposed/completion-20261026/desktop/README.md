# Desktop completion batch — October 26

The integrator reproduced a retained pin close failure in the actual A38 app: pin settled `https://example.com/?aux-review=one`, focus the page, press Cmd+W; the pin and its loaded active page stay unchanged, without a dialog or outcome. Repeating after explicit page focus produced the same result. This is distinct from CUA's accessibility menu selection, which did not invoke some menu commands; actual pointer invocation creates Space/folder dialogs successfully.

The existing close controller delegates real native unload dispatch only for ordinary unretained tabs. Pinned and retained pages instead enter its posted continuation, where the supplied visibility listener's unload obligation is correctly refused without an accepted native acknowledgement. The row unload command similarly calls its protected save/discard path directly and refuses before dispatching beforeunload.

The counted three-file successor routes both person actions through Chromium's original close/beforeunload path. Cmd+W on pins/retained entries now receives the same genuine dispatch as ordinary entries. The row command carries a one-use exact WeakDocumentPtr and terminal callback through that same dispatch, then uses the existing native save/discard implementation rather than shared archive. A real Cancel, document replacement, policy refusal, removal or owner retirement reports failure. An accepted unchanged request waits for genuine storage settlement and revalidates its original native/profile/document identities before saving and discarding. The terminal callback leaves the request map before discard, so synchronous replacement notifications cannot falsely cancel a successful operation.

No `Protected` condition, unsaved-work guard, lifecycle owner, archive, automatic-cleanup logic, discard implementation, UI/style value or GN file changes. There is no timeout or simulated acknowledgement. The accepted app and native source tree remain untouched by this lane.

`source-plan.json` pins exact input and output bytes and every replacement count. `native.patch` and complete successor sources are included. `prepare.py` regenerates only this owned overlay and refuses changed anchors. Counted replay and patch applicability pass; compilation and actual beforeunload/retained-discard acceptance remain integrator gates. No source assertion is presented as functional acceptance.

## Focused successor check

1. Ordinary settled pinned page: Cmd+W unloads its live view while retaining the global pin; select the pin again and check original navigation history.
2. Repeat through the row menu's **Close this view (unload)**. A normal non-pinned row must also retain its logical membership on this explicit action.
3. On an unsaved fixture page, row unload and Cmd+W each offer the actual Cancel/Leave dialog. Cancel retains page/content/membership; Leave reaches the correct save/discard action without archiving a retained pin.
4. Change the document or retire the owner during a pending request once; the exact request must refuse. No broad rerun or unchanged restore drill is needed.

## Existing advanced behavior, reconciled

The current source already contains global pinned folders/nested folders, move/cycle checks, persisted collapse, recoverable archiving/Undo, guarded inactive cleanup, shared-window organization with local document protection, recursive mixed-axis splits, Peek/Quick promotion, profile theme preview/Cancel/Apply/presets/import/export and validated shortcut profiles. These are not newly implemented by this batch and require actual final-app observation before acceptance.

The integrator has actually observed Space + root/nested folder creation, Move to nested folder and keyboard Left/Right collapse/expand in A38 during this batch. Exact app results belong to the integrator's live ledger.

Controls for bounded acceptance: Space selector → New folder / New pinned folder; folder row context menu → New folder inside / Remove folder, keep contents; tab row → Move to / Pin to all Spaces / Close this view; row context menu → Undo organization change / archived restore. Drag tab onto another tab's left/right/top/bottom quarter for directional split (center only reorders); add a third/fourth tab to a pane, then use divider controls. Cmd+K → Quick window; link context menu → Peek. Use genuine pointer menu activation where AX selects rather than invokes.
