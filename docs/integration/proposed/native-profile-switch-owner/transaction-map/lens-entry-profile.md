# Lens entry-point sources and region capture cold boundary

Four-source current155 adaptation; ColorProviderBrowserHelper is audited and
preserved unchanged. No Lens capture/search is executed, no alternative Lens UI
is added, and no whole Features reset or fabricated feature result is used.

## LensOverlayEntryPointController

The actual constructor registers stable window user-data. Actual Initialize
observes LocationBar, fullscreen callback source, current Profile PrefService and
TemplateURLService, and retains the current OptimizationGuideKeyedService decider.
Dynamic GetProfile reads do not fix those already-bound sources after a switch.

Concrete APIs on the same existing controller:

1. `CanRebindForAuxProfileSwitch()` verifies actual registered normal/regular
   window identity, requires every actual tab LensSearchController to be Off
   (including refusal while closing), and checks the actual window region capture
   controller's cold guard. Active overlay/result/capture WebUI is not silently
   closed or declared migrated by an entry-point-only hook.
2. `PrepareForAuxProfileSwitch()` records whether the controller was genuinely
   initialized (its real fullscreen subscription), retains the same actual
   LocationBar pointer, and resets old location-bar/fullscreen/DSE observations,
   PrefChangeRegistrar and optimization decider before identity changes.
3. After committed target Browser/empty model, same LocationBar/CommandUpdater
   profile migration, actual target BrowserActions, and current fullscreen owner
   are ready, call `RebindForAuxProfileSwitch(target_profile)`. It verifies exact
   current target/user-data scope, then calls the existing Initialize against
   real target preferences, DSE and optimization services with those same real
   view/delegate pointers. A globally disabled/uninitialized controller remains
   uninitialized; no feature enablement is invented.
4. After actual target tabs are inserted, refresh its public existing
   `UpdateEntryPointsState(true)` as part of the finish phase so actual target
   page actions/homework entry state reflect the inserted active tab.

Prepare suppresses public entry-state updates during the synchronous cold
interval. There is no new weak asynchronous operation: existing callbacks bind
this stable controller, and their actual subscription sources are removed before
migration. Rebind subscribes actual current sources. Target IsEnabledOnInit,
fullscreen, DSE, page-action and optimization eligibility are unchanged. Abort
can restore source identity and rebind actual source services using the same path.

## LensRegionSearchController

Actual source is `chrome/browser/lens/region_search/`, not `ui/lens/`. It caches
no Profile or BrowserWindowInterface. Start locates the actual browser through
its actual WebContents; the WebContentsObserver and ScreenshotFlow carry real tab
scope. Search completion uses the actual source CoreTabHelper. No invented
profile pointer or unnecessary rebind is added.

`CanReleaseForAuxProfileSwitch()` reports actual quiescence: no active capture,
ScreenshotFlow, instruction bubble, callback currently executing, or still-valid
retiring bubble Widget. Actual completion callbacks get an AutoReset scope flag;
this prevents a nested UI switch after CloseWithReason clears capture flags but
before completion dispatch finishes. Existing CloseWithReason records the actual
bubble WeakPtr before its existing asynchronous close; all pending retirements
are tracked, not only the latest. It neither initiates close/cancel nor changes
capture outcomes. Source tab/profile lifetime remains with its real cached tab
and existing window transaction. Completed historical source searches are not
re-attributed to the new profile.

Active Lens overlay/results and region capture remain explicit cold limits. The
hook does not claim their transient rendering/capture state is migrated. The user
must finish/close those actual flows through existing behavior before switching.

## ColorProviderBrowserHelper: preserve the actual helper

This helper stores only the stable TabStripModel and actual window Widget's
ColorProviderSource; it has no Profile, PrefService or keyed-service pointer.
On real kInserted changes it sets each actual WebContents' ColorProviderSource to
that actual window source. The profile transaction preserves the same model and
physical Widget, so the existing observation already binds moved/inserted contents
correctly. Parent's actual theme/Widget color-source refresh supplies target colors.
Resetting/recreating this helper or inventing a Profile setter would add an
unnecessary change. Its constructor explicitly requires an empty model, another
reason not to rerun Features initialization after tabs exist.

## Evidence and verification

These are current155 source-owner adaptations, not assertions that an identically
named old helper existed in supplied04559f80. Supplemental evidence pins the
actual original current source files, registrar reset behavior, feature-owner init,
and color-provider graph. Four-source patch check, temporary replay, output hashes
and unchanged shared inputs pass. No shared native writes, compilation, target
execution, owner profiles, capture, network search or runtime acceptance occurred.
Disposable acceptance still needs old DSE/pref notification isolation, real target
entry state, target disabled eligibility, active/closing Lens refusal, actual
retiring instruction bubble lifetime, source abort and unchanged physical Widget
color propagation on actual tab insertion.
