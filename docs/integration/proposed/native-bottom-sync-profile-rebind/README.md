# Same-window sync-owner rebinding

The newly recovered bottom container must follow the actual same-window profile transfer. Its source service is profile-scoped: the supplied constructor resolves `SyncService` through the window's real profile, as pinned in `native-bottom-sync-owner`. The155 retained region and bottom container survive a transfer; constructor-only observation would therefore remain attached to the old profile. This proposal fixes that lifecycle adaptation, without changing the original hidden sync behavior.

It layers the bottom files on `e99d6aacd` and the region on actual native268. Root staged271/272 contain the same bottom outputs. The held body-retirement proposal is not a prerequisite and is not included.

## Real transaction boundaries

`ProfileSwitchTransaction::Complete` runs the genuine `finish_` branch for a commit or `abort_` for a started rollback before calling the region's `EndAuxProfileSwitch` with its saved generation. The existing region end checks that generation before resuming persistent pins and refreshing the real profile header. Both sides therefore have settled actual profile identity before the new bottom rebind runs. No guessed target or cached profile substitution is needed.

The three region changes are narrow: require the existing bottom owner in `CanRebind`; pause its observer in the actual Begin path; resume only inside the existing matching-generation End branch. The existing sidebar generation, pinned-owner pause/rebind, header refresh and preview capture remain intact. The two method calls use the same Aux/macOS guard as the recovered sync owner.

`PauseForAuxProfileSwitch` resets actual ScopedObservation before clearing its service pointer. It deliberately does not clear the pending datatype cache, edit the label, query a service or emit a synthetic sync update. The card and row remain hidden through their recovered behavior. `RebindAfterAuxProfileSwitch` resolves the actual `browser_->GetProfile()` service, observes that real instance and reads its genuine pending-initial-sync set. Constructor and resume share this same binding method. Commit binds the real target; rollback binds the restored real source. A missing service follows the already recovered null-service behavior only when a settled real profile is bound.

The bottom owner has an explicit paused invariant, while the existing region generation remains the authority for transaction completion. No new generation registry, profile load, fake sync state, observer event, network test or cross-window source is introduced. Shutdown and destruction still use the recovered reset behavior.

## Integration and checks

`manifest.json` records three exact baseline/output hashes and nine counted anchors. `source-evidence.json` pins the actual155 transaction, region, BrowserView and ScopedObservation sources. Run `python3 docs/integration/proposed/native-bottom-sync-profile-rebind/verify.py` for static commit/rollback ordering, detach-before-clear/bind-before-query assertions and three-file disposable patch replay.

No shared native file, build, app/profile or service was touched. Native compilation and actual profile-switch observation remain pending. The hidden stopped-throbber color registration limit from the original owner proposal remains unchanged.

The actual build owner is `//chrome/browser/ui/views/tabs/vertical:impl`. The integrator owns the separate GN adaptation: the public header target `:vertical` needs conditional sync base/service public dependencies, and `:impl` needs `//chrome/browser/sync`. The production sync target has an existing `//chrome/browser/ui:ui_features` edge but no production views/vertical edge in the inspected BUILD; full GN cycle validation remains with the integrator.
