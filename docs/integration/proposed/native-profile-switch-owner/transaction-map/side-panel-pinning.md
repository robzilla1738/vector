# Stable side-panel toolbar pinning observations

This companion platform adaptation preserves the same SidePanelCoordinator,
SidePanelToolbarPinningController, existing view observers, user-data registration,
and registered callbacks while detaching the old profile's actual model observations.

Current 155 `SidePanelToolbarPinningController` observes both
`PinnedToolbarActionsModel::Get(profile)` and `ToolbarActionsModel::Get(profile)`
in its constructor. Its reads and mutations resolve the browser's current profile
dynamically. Merely changing Browser identity therefore leaves notifications
attached to the old profile while reads/writes target the new one. Destroying the
controller would also invalidate the header views' checked-observer relationship.

The four-file patch adds window transaction forwarding methods:

- `SidePanelCoordinator::From(browser)->PreparePinningForAuxProfileSwitch()`
  before identity changes, alongside extension manager preparation. This keeps
  all objects/listeners intact and resets only the two model observations.
- `RebindPinningForAuxProfileSwitch(target_profile)` after actual target identity
  and target action/service owners are committed, and old-profile panels have
  been retired through their respective actual owners. This verifies the regular
  target identity, observes the real target models, and invokes existing
  `OnActionsChanged()` to refresh existing observers and toolbar state.

The prepared flag suppresses stale callback refresh during the synchronous
transaction. No pin preference is changed, no entry is created, no panel is opened,
and no whole SidePanelUI is reset. Non-extension profile-bound entries and native
Agent provider state remain separate transaction work. The pinning controller must
not be rebound before those old profile views are retired.

This is a necessary Chromium155 service-observation adaptation. The original
`04559f80` early Agent-only close and `04164b0c` narrow feature refresh are pinned
by the companion side-panel evidence; this proposal does not assert that those
routines contained an identically named controller or the same 155 layout.

The manifest pins all four actual read-only source inputs and generated outputs.
Temporary-copy patch check/application, exact output comparison and unchanged
shared-input comparison pass. No shared native edits, builds, profile access or
runtime acceptance occurred. A disposable integration test must verify that old
profile pin changes no longer notify the switched window and target pin changes
refresh its existing header without changing either profile's preferences.
