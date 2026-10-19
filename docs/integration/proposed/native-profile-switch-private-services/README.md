# Real private service phases

Six exact current native source files provide concrete private Features phases and two stable dialog-controller binding seams. No trigger or complete PreparedBindings provider is enabled by this patch.

`CanPrepareAuxPrivateProfileServices(target)` is cold. `BeginAuxPrivateProfileServices(target)` unregisters the actual source extension accelerators through their existing destructor. It preserves source Instant and extension-window owners for genuine source-tab detach events. On empty commit, `RebindAuxPrivateProfileServices()` retires those original private owners and invokes their actual constructors against the current target profile/window/model. `FinishAuxPrivateProfileServices()` refreshes target global accelerators with the physical window's actual IsActive value. This is necessary because same-window profile migration does not produce another OS activation event. Abort runs after actual source collections have been restored: it preserves the untouched source Instant/window/dialog owners and reconstructs only actual source accelerators.

The same IncognitoClearBrowsingDataDialogCoordinator userdata is preserved. This regular-to-regular path refuses a live or retiring tracked dialog; no private-mode transition or data clearing is invented. The same DefaultSearchExtensionControlledController userdata is preserved. Pending async parameter loading, active confirmation and nested result callbacks refuse cold. No callback is dropped or supplied a synthetic result. After real completion, its Profile reference can bind the actual empty target model.

Source anchors (Chromium 155):

- Features Init/InitPostWindowConstruction construct Instant, keybinding and extension-window controllers with the same constructor arguments used here.
- ExtensionKeybindingRegistryViews destructor unregisters actual FocusManager accelerators and clears only this source registry's active-window pointer. OnHostActivationChanged binds the actual profile's global registry.
- BrowserExtensionWindowController constructor retains base WindowController profile, actual model/SessionID and window userdata; original destructor/constructor notify WindowControllerList. Those real notifications are preserved.
- BrowserInstantController owns the profile-specific SearchEngineBaseURLTracker and InstantController. Its real constructor is recreated while empty, before genuine target insertion.
- Incognito coordinator IsShowing tests the actual ViewTracker, which remains non-null through retiring view lifetime.
- Default-search ShowConfirmationDialog sets its real global weak marker before async loading; DialogResolved clears it before invoking the real callback. Nested callback depth and WeakPtr protect that final interval and callback-driven destruction.

This is an Aux Chromium 155 integration of supplied owner behavior, not evidence that every newer optional Features service is migrated. The forthcoming complete provider must still cold-check all mandatory graph sources, perform these private phases, and order Actions/toolbar/side-panel/userdata bindings. No UI activation is added here.

Verification: six exact baseline/output SHA256 pins and independent disposable patch replay PASS. No native compile, shared writes, OS actions, owner data or runtime parity claim. Existing public header buildflags dependency is required; no new source registration.
