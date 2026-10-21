# Avoid the unused stock TabSearch preload in Aux

Pinned to actual v582. The normal desktop run rejected `bindings.source-interaction-tab-strip-service` before any explicit Search or panel interaction. That establishes this owner, not the particular client category.

## Concrete integration repair

Aux `TabSearchBubbleHost::ShowTabSearchBubble` returns through the supplied native search surface under `ENABLE_AUX_BROWSER`. However Chromium155's global WebUIContentsPreloadManager independently warms normal windows and its default selector preloads chrome://tab-search. The loaded stock TabSearchPageHandler constructs a profile-scoped TabStripServiceAggregator immediately. Creating that unused stock owner is unnecessary for the native Aux search implementation and can block profile admission even though no bubble was opened.

Exclude only the stock TabSearch origin from the speculative candidate list in Aux builds and from the final selected candidate (covering fixed/default and alternative selectors). Smart selectors retain other eligible URLs. Explicit user navigation and explicit Request remain intact; no WebUI data is destroyed, no receiver is reset, and no feature switch is globally disabled. This is a Chromium155 integration adaptation for the existing supplied native search owner, not a recovered original preload implementation.

Keep the entire tab-service admission predicate. A rejected query now logs only counts for regular Mojo clients, experimental Mojo clients, Mojo observers, native nonself observers, and the active-session boolean. It emits no identifiers, pointers, profile/tab information, URLs or credentials, and only runs when explicit profile-transition admission asks the service. This makes any remaining blocker diagnosable in the same build.

## Actual registration inventory

Static search of chrome/browser and components/browser_apis for service getters, observer implementations and registration sites found:

- TabStripServiceImpl constructor registers itself for Mojo forwarding. It is excluded from `native_external`.
- TabStripServiceAggregator::OnServiceAdded registers the aggregator on each tracked service; OnServiceRemoved and destructor unregister. This is the sole production nonself direct registration identified for this interface. TabSearchPageHandler owns that aggregator and implements the same observer interface only as the aggregator callback recipient; it does not separately register itself.
- BrowserTabStripServiceTracker observes the profile's BrowserCollection, calls added/removed on browser create/close, and enumerates existing services. TransferForAuxProfileSwitch deliberately emits no create/close notifications, so waiving the aggregator guard would retain old-profile observation. This proposal does not waive it or invent browser-close events.
- Other direct registrations found are tab-strip API browser/unit tests. TabStripInternalsObserver's similarly named `service_->AddObserver` is a sessions::TabRestoreService, not this service.
- WebUIBrowserUI::BindInterface routes the regular and experimental Mojo interfaces through TabStripServiceFeature::Accept/AcceptExperimental. The desktop broker exposes those interfaces for WebUIBrowserUI when that owner is enabled. Each corresponding receiver set is counted separately.
- TabStripServiceImpl::GetTabs creates the Mojo TabsObserver stream. GetTabsWithoutObservation, used by TabSearchPageHandler's snapshot path, does not. Streams are counted separately from both receiver sets.
- Active session covers API execution and its recorded-event playback; it remains a rejection. Counts identify the category without claiming a specific runtime Mojo requester.

The evidence.json hashes pin the relevant current source owners. A remaining `native_external>0` should be investigated as a genuine user-opened/cached stock TabSearch owner or another newly identified caller, not automatically allowed. Any Mojo counts still require their actual binding owner's lifecycle. The preload repair does not claim the observed runtime category is proven before the retry.

## Lean verification

Count-checked replacements and isolated git-apply/output-hash replay passed for both files. ReceiverSet/RemoteSet size() APIs are present in current155 headers. No shared native changes, builds, browser/profile operations or credentials were accessed in this lane.

Integrator focused object targets:
- obj/components/browser_apis/tab_strip/service/tab_strip_service_impl.o
- obj/chrome/browser/ui/webui/top_chrome/impl/webui_contents_preload_manager.o

Then use the same approved normal desktop profile transition once with the existing logging-only launch. Confirm native Search still opens, and actual footer switch succeeds or yields the bounded remaining category. No broad test suite is required.
