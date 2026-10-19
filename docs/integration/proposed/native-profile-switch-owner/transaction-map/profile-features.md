# Remaining private profile-source migration

`profile-features.patch` supplies six-source internal hooks for ExtensionBrowserWindowHelper, SessionServiceTabGroupSyncObserver and MostRecentSharedTabUpdateStore. `cookie-page-action.patch` separately fixes the real per-tab cookie action's window-owned callback source. All manifests pin actual appliedv32 inputs/outputs. BrowserWindowFeatures files and shared GN/native source are untouched.

These are current155 platform adaptations required by the recovered same-window owner algorithm, not claims of identically named original helper methods. All ordinary constructors remain real service constructors; no stub feature or successful fake data is introduced.

## Extension registry: stable helper, actual target observation

Call ExtensionBrowserWindowHelper::PrepareForAuxProfileSwitch before identity/tab transfer. It resets the old ExtensionRegistry observation. Call RebindForAuxProfileSwitch(target_profile) only after actual Browser identity points to that regular profile and its TabList is empty. It observes the actual target registry on the SAME helper. Mac+Aux unload notifications additionally require the currently observed context to equal the real Browser profile.

The original cleanup rules are unchanged: extension-origin/hosted-app/MIME-owned tabs close or the final tab navigates to the real NTP; other tabs are unmuted only if muted by that extension. The source registry must be detached before any target tabs appear, because extension IDs can match across profiles and old-context unload callbacks must not act on target tabs. No UI holds a helper callback list or target service pointer outside this object.

## Saved-group session writes: preserve observer identity, pause real effects

SessionServiceTabGroupSyncObserver::BeginAuxProfileSwitch removes its actual old sync-service observation, pauses session metadata writes and returns a generation. RebindAuxProfileSwitch(target_profile) requires regular actual target model/profile agreement and an empty model, then attaches to the real target TabGroupSyncService. EndAuxProfileSwitch(generation) ignores stale completions and resumes writes after the owner has settled the real collections.

The same model and real window SessionID are preserved. Every existing local group add/remove/migrate/local-ID event flows through UpdateTabGroupSessionMetadata, which skips while paused. There is no profile-wide saving toggle. Real metadata is rebuilt by the recovered touched-profile500ms session reset, with the separately source-proved cached-workspace eligibility exception.

Preserve the exact existing BrowserWindowFeatures eligibility predicate: regular target profile, SupportsTabGroups and nonnull actual TabGroupSyncService. If the target is ineligible, destroy the prepared optional observer rather than call Rebind or fabricate a service. Its destructor now safely removes an observation only if one exists; the ordinary constructor retains its original nonnull-service CHECK.

## Shared-tab promo data: stable userdata, no foreign anchors

MostRecentSharedTabUpdateStore owns only window userdata and transient local group/tab IDs, not a profile service. BeginAuxProfileSwitch pauses new updates, clears the old profile's IDs and returns a generation; EndAuxProfileSwitch validates actual model/profile agreement and resumes after the latest migration. It does not copy unproven cached promo state or invent a target update. The owner can retain this store under the existing eligibility predicate, or destroy/recreate it only if all pending UI references are safely cancelled; stable retention avoids duplicate userdata registration.

Old pending promo requests now receive no anchor when the update was cleared/migration is active. Actual anchor resolution checks the supplied BrowserView is the SAME window, its real model contains that group, and a resolved tab belongs to that exact BrowserWindowInterface. This prevents the global group-tab helper from resolving an old ID into a foreign window/profile. Existing genuine target updates still trigger the real promo path; no success or notification result is fabricated.

## BrowserInstantController: exact safe recreation order

No rebind method is needed. BrowserWindowFeatures owns BrowserInstantController privately and exposes no stable view reference to it. Its profile pointer and contained InstantController are const-bound to the old profile; the base TabStripModelObserver destructor removes its real model observation, the contained TabObserver destructor detaches its actual WebContents observation, and the SearchEngineBaseURLTracker destructor removes the old search source.

Reset instant_controller_ BEFORE detaching/transferring source tabs. AFTER Browser and model profile identity commit while the model is EMPTY, recreate `std::make_unique<BrowserInstantController>(target_profile, browser->GetTabStripModel())` only under the existing search::IsInstantExtendedAPIEnabled predicate. Recreate BEFORE target insertion: the contained InstantController constructor only observes the model; it starts watching/updating actual NTP theme and most-visited data when the subsequent genuine target selection event runs. Recreating after insertion could miss that activation. Do not manually synthesize an Instant event or navigate/reopen target tabs.

## Private cookie controls: real controller replacement and a per-tab fix

CookieControlsController is profile-bound through actual CookieSettings/original settings/HostContentSettingsMap and its current TabObserver. The page-action controller is owned by the actual TabInterface, derives BrowserWindowInterface dynamically and observes the window CookieControlsController only while activated. Its real WillDeactivate/WillDetach path calls OnBubbleCloseTriggered and resets the controller observation. The bubble view controller's CloseBubble resets its observation and invalidates its own weak callbacks before the widget closes asynchronously.

Owner order: before changing identity, call the old controller's existing OnBubbleCloseTriggered to begin real bubble closure; detach BOTH source/target-cache active tabs using real model detach so their actual per-tab controller observations reset. While the models are empty, reset the old window cookie_controls_controller_ (removing its old cookie/tab observers and invalidating weak references), THEN construct the actual target CookieControlsController on the SAME Browser userdata host using the exact existing BrowserWindowFeatures constructor/factories. Old instance destruction must precede new scoped-userdata registration. Preserve actual original-cookie-settings/incognito arguments; normal regular profile switches naturally pass no original settings/false. Do not invent an incognito/regular bridge.

Do not call OnUiClosing merely to force an extra reload: existing real tab deactivation closes the bubble through OnBubbleCloseTriggered, not that reload helper. Pending old bubble callbacks are invalidated by their actual CloseBubble path. Target real TabInterface activation observes the new controller and calls Update(actual_target_contents), obtaining genuine cookie state. A service-less successful stand-in is not allowed.

One concrete per-tab migration gap required code: CookieControlsPageActionController::Init registered its bubble-close subscription only against the original window's coordinator. The real TabModel can move to/from a cached window. cookie-page-action.patch makes OnDidActivate re-register that callback against the CURRENT actual BubbleDelegate coordinator, and reset/reobserve the actual controller if its observed source differs. The same per-tab view, actions and delegate persist; this is not a renderer replacement or generic cookie-controller proxy. Other usual activation behavior stays unchanged.

The coordinator itself has no Profile field and can remain; its existing observer/action callback lists survive. Its asynchronous closing bubble can finish through the real stock lifecycle while the source profile remains held by the cache keepalive. Do not replace the coordinator while outstanding bubbles retain its raw OnViewIsDeleting callback.

## Integration and limits

Root/parent owns the BrowserWindowFeatures owner methods and member reset/order. No call site is installed by these patches. Actual feature objects not yet included here (data sharing, side panels, signin, profile customization and others) still require their own concrete profile-source audit. These private source hooks alone do not complete the whole switch.

The new public Chrome headers require their corresponding headers targets to expose //chrome/browser:buildflags if not already exported by the composing graph. No new source files, runtime packages or dependency cycles are introduced. The cookie page-action change uses existing includes/dependencies only.

Six-source feature hook replay and one-source cookie activation replay match every pinned final SHA in disposable temporary trees. Source/constructor/destructor/callback evidence is recorded by SHA in source-evidence.json. No shared native writes/build, actual browser/runtime execution, owner data/preferences/history, clipboard, Keychain, OS grants or network. Native compilation and real UI/behavior acceptance remain pending.
