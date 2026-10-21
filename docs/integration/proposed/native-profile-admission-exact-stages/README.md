# Complete profile-admission stage diagnostics, v583

The actual v583 normal desktop profile switch passes the repaired tab-strip service admission and rejects the combined view/toolbar/location/private-services block. This proposal splits every remaining combined source/cache admission block in the binding provider, the final revalidation identity comparison, and immediate-rejection combined transaction-entry/workspace/revalidation guards. It also splits every top-level conjunction in the five readiness methods called by the current failing group.

149 fixed stages map to exact source predicates in stages.json. No runtime identity, path, tab data, pointer, URL, credentials, or owner state is logged. Successful admission is silent. Group splits retain expression order, short circuit behavior, null guards, and each original method call's count; source/target ownership and active-work requirements are unchanged. A subowner may emit its precise readiness rejection followed by the caller's group-member stage, so the first readiness line identifies the cause.

Current group mapping:
- .01–.07: missing BrowserView, toolbar, location, BrowserActions, focus controller, education, live-tab context.
- .08: BrowserView (six exact readiness stages).
- .09: BrowserActions (seven exact readiness stages).
- .10: LocationBarView (20 exact readiness stages).
- .11: toolbar-owned actions (17 exact readiness stages).
- .12: private services (10 exact readiness stages).

Use stages.json as authoritative for stage numbers and predicates; its mappings are generated from the exact expressions, including retained guarded OR subexpressions. Nested shared-tabgroup readiness calls are individually identified under their original nonnull guard. Rollback/body mutations are untouched.

## Substantive source audit: why no ownership waiver is safe yet

BrowserView owns a pref registrar that must still point to the actual source profile. BrowserActions owns its profile reference and root action item. Neither can be fixed by replacing identity checks with target acceptance before identity commit.

The LocationBar AIM presence guards are a credible real blocker: current omnibox_next_features.cc declares kWebUIOmniboxAimPopup ENABLED, and IsAimPopupFeatureEnabled reads it directly. A normal regular-window LocationBar creates an AIM presenter and file selector at Init unless that feature is overridden. Their presence is not proof of active user work, but hidden is not sufficient evidence of dormancy either:

- OmniboxPopupAimPresenter constructor creates OmniboxAimPopupWebUIContent. SetContentURL calls LoadContent immediately, owning a profile-specific WebUI wrapper. SetWebUIContent observes its WebContents and creates a real widget.
- ShowUI captures active-tab WebContents, consumes pending SearchboxContextData, and can get/create a contextual session. A cached hidden presenter can therefore retain context beyond the widget's visibility.
- The presenter owns permission observation, deferred visual-state callbacks, deactivation blockers and deferred-destruction widgets. A real safe retirement contract must cover those states and current callback execution, not just IsShown().
- OmniboxPopupFileSelector retains an OS file dialog, source tab weak pointer, edit-model pointer and deactivation blocker. After dialog closure it can still have ThreadPool file reads and upload callbacks. `file_dialog_ == nullptr` does not prove no active work.
- The address/context-menu implementation calls original OpenAiMode routes; no static proof establishes that the Chrome AIM owner is unreachable in Aux. Unlike unused stock TabSearch preloading, construction exclusion could remove reachable functionality.

Consequently this batch does not destroy, disable or falsely admit those owners. If LocationBar stage14/15 (see exact map) is the actual blocker, a follow-up must implement an explicit unused/cold-state contract covering retained session/context, permission, file work and callbacks, then retire only during Begin and reconstruct using the committed profile (or original profile on Abort). No mutation belongs in admission.

Toolbar admission preserves its required native child identities, parentage, feature configuration and running-menu guard; its existing transaction actually destroys/rebuilds the original extension and pinned-actions owners. Private services preserve Cast active-callback/dialog guards, extension focus-manager ownership, incognito dialog and default-search controller readiness. There is no evidence to relax these now.

## Verification

Seven exact v583 preimages/output hashes and source snapshots are included. Isolated git apply --check, replay and byte comparison passed. Each transformed boolean term is evaluated in its original order, once, with the same early return outcome; no getter is called solely to print a value. Added direct base/logging.h includes where needed. No shared checkout edit, build, runtime/profile read, OS action or credential operation occurred.

Integrator should compile the seven changed translation units, then make one normal scoped footer transition with the existing rejection-log capture. This diagnostic-only batch does not claim to fix the remaining profile switch.
