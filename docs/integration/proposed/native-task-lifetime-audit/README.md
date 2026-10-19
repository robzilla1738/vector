# Last-window task lifetime: bounded static review

No native correction is proposed by this slice. The remaining question requires disposable runtime evidence and tracing beyond the reviewed setting consumers; forcing a new persistent Aux client would invent policy.

## What is directly established

The supplied API's KeepTasks setting is browser Local State `background_mode.enabled`, with ordinary user-modifiable policy semantics (the preceding preference-consumer proposal corrects that API).

The supplied BackgroundModeManager's `042bb108` only iterates each profile's application-list count to determine any background client. Its profile keep-alive consumer `02b907c4..02b908d8` first checks persistent extension classification, then manager active/suspended state, validates the profile and constructs a profile keep-alive with origin2. The supplied classifier `032f7cc0` checks permission ID17 before following the standard extension/packaged-app/hosted-app background paths. Current155 names that permission `kBackground = 17`. These reviewed consumers contain no Aux-style extra profile setting or Agent identity special case.

The current Aux BackgroundModeManager adds `aux.keep_runtime_in_background` as another persistent-client source; its false default is independent of the supplied global API. That extra preference cannot be treated as an original gate that the supplied API must mirror. It is also insufficient evidence of lost browser-process persistence on macOS: the existing macOS AppController owns a separate `APP_CONTROLLER` keep-alive, explicitly created so the application remains alive after every browser window closes (`app_controller_mac.mm`, around834 and1405). That process keep-alive is separate from profile retention and the daemon's own task lifetime.

Both retained source and original application-list behavior require careful separation of process, profile, extension host and external daemon lifetime. A browser process that remains running is not proof that the task's profile/automation host remains usable. Current155 `ProfileManager` may unload a profile after its reference count reaches zero when `kDestroyProfileOnBrowserClose` is enabled; that feature defaults enabled on macOS. The supplied static Feature record at `0x0eb78778` references `DestroyProfileOnBrowserClose` (`0x0d8030ae`) and contains default-state1, but runtime feature overrides were not inspected.

## What remains unproved

- Whether closing the last window actually interrupts a task in the newly reused disposable Aux stack.
- Which original runtime or extension holds the task's profile/host while a task is active, including indirect/inlined keep-alive ownership and offscreen-document lifetime.
- How original daemon/browser reconnection behaves after profile destruction or explicit application quit.
- Whether the existing independent Aux persistent-client and power-activity methods are reachable from the supplied UI. Their existence alone does not justify redefining the supplied preference.

The bounded direct constructor scan is recorded with its coverage limit; it is not an exhaustive ownership analysis. No source changes, preference setters, global CFPreferences, target execution, owner profiles or Keychain operations occurred.

The next acceptance step should create a real task in a disposable Aux profile, close its final window without quitting the app, observe browser/daemon/profile/extension-host survival and task progress, and compare with the corresponding supplied behavior using authorized disposable state. A concrete failure can then guide the remaining narrow source tracing. Until then, no lifetime fidelity claim is made.
