# Reload button interaction-metrics profile binding

This two-file current155 adaptation preserves the actual ReloadButton, menu model,
CommandUpdater pointer, permanent click callbacks, icons, timer state, mode-change
listeners and existing first-paint behavior. Only the owned interaction recorder
is replaced after the caller commits the real target Browser profile.

Actual constructor chain:

- ReloadButton(Profile*, CommandUpdater*, InitialWebUIWindowMetricsManager*)
  constructs `metrics_recorder_ = make_unique<WaapUIMetricsRecorder>(profile)`.
- WaapUIMetricsRecorder caches `WaapUIMetricsService::Get(profile)` and an optional
  last input timestamp/type. It has no external observer or flush-on-destruction.
- ButtonPressed calls OnButtonPressedStart; successful reload dispatch then calls
  DidExecuteReloadCommand. Thus leaving the recorder bound to the old service
  attributes target interactions to the wrong profile and could pair a retained
  source input with a later target action.

Concrete API:

1. The owner checks `CanRebindForAuxProfileSwitch()` before its synchronous cold
   transaction. A showing actual reload dropdown menu is rejected.
2. After committing and independently validating the Browser's target identity,
   call `RebindForAuxProfileSwitch(actual_target_profile)` on the same button.
   This verifies a nonnull regular target and the menu precondition, constructs
   the real target WaapUIMetricsRecorder, and destroys the source recorder/input
   pair. It does not synthesize an input, flush a metric, create a new button,
   rebuild the menu, change reload timing, or announce a delivery/success event.

ReloadButton has no Browser/profile-owner pointer to independently derive target
identity; that check remains the actual owner transaction's responsibility. This
native-only hook is not a new externally callable profile-selection API. Abort
can rebind to the actual restored source profile through the same method.

## Separate initial-window lifetime boundary

The button also retains its actual InitialWebUIWindowMetricsManager pointer.
That manager caches its birth profile's WaapUIMetricsService and first-window
classification, pending presentation/10s callbacks, and window creation timing.
This patch deliberately preserves those real initial-window metrics: a profile
switch is not a new window creation and must not fabricate startup/first-paint
signals or call SkipStartupForTesting. The source-profile keepalive must remain valid for this actual creation-provenance
manager and its pending callbacks. This is a retained birth-window owner, not a
missing current-interaction rebind: the same physical window and SessionID survive.
No first-paint callback was invoked, reassigned or suppressed by this proposal.

This is a source-grounded current155 owner adaptation. No identically named old
supplied reload-profile helper is claimed. Manifest pins the two source inputs
and exact outputs; evidence additionally pins recorder and initial-window manager
sources. Temporary patch check/application and output-hash/shared-input comparison
pass. No native compilation, target execution, profile data or runtime acceptance
occurred. Disposable acceptance still needs actual target interaction attribution,
no source input pairing, stable menu/callback behavior and abort restoration.
