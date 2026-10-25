# Organization local completion A26

Three native source successors, ten counted anchors, based on the actual A25 source composition. Native source tree, current app, styles and assets remain unchanged by this source commit.

## Confirmed defects fixed

1. Space create/edit, top-level folder create, nested folder create and entry rename dialogs retained a pre-dialog revision. Genuine native tab activity/title changes advance that revision during typing, so Save refused even though the target was unchanged. An actual pure-model fixture reproduces that stale failure and demonstrates current-revision success preserving the intervening activity. Dialog Save now captures the actual current revision under the original profile/owner epoch, and refuses changed Space fields or renamed/moved/archived target entries. The real model retains all revision and destination validation. Menus, destructive operations and drag contexts keep their strict stale semantics.
2. The asynchronous save-before-close callback checked only URL. A same-URL new document arriving during the physical save could therefore be closed by an older action. The callback now joins the actual live native profile/owner generation, tab handle, logical identity and document identity before closing.
3. A posted retained-pin close captured one exact native tab, then looked up the first tab with the same logical ID. It now passes the exact captured handle into the existing saved-close path.

A busy or changed-profile Save still refuses truthfully and retains previous state; this does not add a blind revision retry or bypass writer admission. Existing tooltip/status surfaces carry the error, preserving the default presentation.

## Focused evidence

`check-dialog-revision.cc` compiles directly with the actual pure `organization_model.cc`. The fixture reproduces the prior stale Space-save behavior, then checks current-revision creation preserves native activity, nested folders still reject cycles, foreign-profile writes refuse, and nested pins remain protected. `focused-check.json` binds exact model/fixture/source-plan hashes. Independent patch application replays all ten anchors and reproduces all three output hashes. This is source evidence, not native UI/runtime acceptance; root owns actual object compilation and app checks.

## Prioritized actual-app journeys

Use only the approved disposable profile and preserve the accepted UI:

1. Create a Space with Name and Icon via +; confirm the menu and selected Space. Repeat while another same-profile window performs a native tab/title/activity change during the open dialog. Create a top-level folder and a nested folder the same way. Rename an unchanged target; a concurrent real rename should refuse without overwriting it.
2. Move that folder to Pins and switch Spaces. Check its nested entries remain visible and collapsible; move it back to a Space and preserve names/order/URLs. Do not mistake source fixtures for completed actual drag/menu acceptance.
3. Open one logical tab in two windows, navigate each independently, then close everywhere. Protected/divergent work must remain in its local recovery row; no implicit remote navigation. Retained-pin close must address the selected native view.
4. Native save/close observation should confirm a newer document is retained if it replaces the captured document during the save. The new callback fences can be compiled independently; avoid artificial owner-state edits or a broad timing stress suite.

## Separate remaining pin-unload fix

The current physical close used for retained pins still destroys the view. Reopening its surviving logical row creates a fresh PageIdentity and loses access to the old draft/history. The parent explicitly assigned genuine Chromium discard as the next independent slice. It is not fixed or accepted here. Automatic age cleanup likewise has conservative source protection/compensation but no new timed actual-app acceptance in this slice; do not mutate stored timestamps merely to label it tested.

## Historical fixture toolchain disclosure

The pure-model fixture used `clang++` to produce a temporary host executable, which receives the platform linker’s default ad hoc signature. This did not sign the browser or use a developer identity; nevertheless it was outside the narrow build-tool exception. No further executable fixture is generated. Original receipts remain historical; upcoming checks use existing interpreters or no-output type checking.
