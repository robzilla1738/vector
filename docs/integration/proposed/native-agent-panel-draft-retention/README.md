# Agent panel draft retention — native integration proposal

Base: current native composition587. Three exact-hash source files, no UI assets/CSS/signed daemon changes. No shared checkout writes or native build in this lane.

## Observed failure and supplied contract

Root observed a real typed harmless new-session draft in586, closed the supplied panel button and reopened with Command-E; draft was gone. The initial AX setValue attempt was ignored and is not evidence.

Pinned1852 `draft-storage-ixLojjZ5.js` writes drafts to **window.sessionStorage** and removes migrated localStorage values. Sidepanel new-session scope is `sidepanel-target:<targetId>`, and draft model/permission/project state also uses sessionStorage. The source thus preserves state within the document browsing context; it does not promise persistence after destroying that context. This is an integration mismatch with Chromium155 close behavior, not a missing storage write or a reason to change supplied JS to localStorage.

Current native `SidePanelCoordinator::OnViewVisibilityChanged` closes by clearing caches and deleting the current view. `ExtensionSidePanelCoordinator::OnViewDestroyed` resets the ExtensionViewHost, destroying its WebContents/sessionStorage namespace. `SidePanelEntry::GetContent` already reuses a cached view, and `CacheView` already owns it. The proposal uses this existing ownership mechanism after a normal Aux Agent hide.

No recovered Aside native close implementation was identified by the bounded symbol-index audit; this is a minimal platform adaptation based on original JS storage semantics and actual observed loss, not a claim to have copied the exact original native code. Actual Aside draft close/reopen comparison remains desirable once integrated.

## Lifetime

Only the global Aux Agent extension entry is retained. The decision captures its weak entry identity and source profile before hide observers. After observers/caches run, the exact registered entry and unchanged profile must still match and no reentrant new panel may be showing. Otherwise ordinary destruction occurs. The view stays owned by its existing SidePanelEntry; no global map, sessionStorage copy, cross-window transfer or new persistence file exists.

The extension's original onClosed dispatch is triggered on normal Aux Agent hide, even though its host now remains alive. Its existing is_panel_active_ flag prevents duplicate dispatch when the retained view is later destroyed; OnEntryShown restores normal opened events.

- Profile switching: existing ExtensionSidePanelManager::PrepareForAuxProfileSwitch first empties the manager, stops service observers and calls DeregisterEntry for every source coordinator. Registry deregistration destroys the entry/cache. No retained WebContents reaches a target profile. Abort reconstructs original owners as before; no old document transfer is introduced.
- Window teardown: sets teardown flag before synchronous Close and explicitly clears all caches, including previously hidden Agent views.
- Extension unload/reload, disable or entry deregistration: existing coordinator/registry ownership destroys the retained view.
- Panel path/options changes: existing OnPanelOptionsChanged clears an inactive cached view; live changes navigate the existing original host.
- Actual page/tab selection: original global Agent receives binding updates and scopes drafts by target. A tab-scoped panel is never eligible for this retention.
- Closing another panel continues original cache cleanup; this proposal guarantees the observed direct Agent hide/reopen case, not indefinite document preservation after unrelated cache invalidation.

Supplied draft callbacks, debounce/unmount behavior, model controls and CSS are untouched. Retaining a hidden extension document has the same bounded ownership pattern as native panel replacement caching. No proof of successful runtime behavior is claimed until integrated.

## Lean acceptance

Integrate with the pending native batch. One actual harmless typed draft, close/reopen and unsent-draft observation; one genuine profile switch verifying no source draft appears in target; normal window close/reopen. Existing profile guards and extension invalidation remain authoritative. Do not repeat paid AI or broad styling tests.
