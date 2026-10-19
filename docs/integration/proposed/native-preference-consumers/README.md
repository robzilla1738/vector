# Remaining exposed preference consumer audit

This is a narrow proposal against frozen native v24. It does not apply or compile native changes.

| Setting | Supplied implementation | Current Aux consumer and proposal |
| --- | --- | --- |
| Tab switcher MRU | Profile boolean, default true (`034e3f1c`); getter `0814bdac`; setter `04296078` writes profile directly without a custom managed rejection. Appearance JS calls the public API. | Existing native switcher reads `aux.browser.tab_switcher_mru` when a gesture starts and sorts by last active time. Keep storage/default/consumer; remove the extra API rejection. The full supplied switcher presentation and algorithm have not been accepted by this audit. |
| Vertical bookmarks section | Profile boolean, default true; getter `0814c428`; setter `042974xx` writes profile directly. Supplied sidebar `04633e10` observes the profile preference. Appearance JS calls the public API. | Existing sidebar observes `aux.browser.sidebar_bookmarks` and gates actual bookmark rows. Keep that profile storage/default/consumer; remove the extra API rejection. This does not verify full sidebar rendering fidelity. |
| Keep tasks running | `04296b68` reads browser Local State `background_mode.enabled`, returns supported/enabled/canSet/policyDisabled. Setter `04296de0` requires a boolean and user-modifiable global preference, then writes it. | Replace the independent profile boolean and temporary `ScopedKeepAlive` with the supplied global API contract. Existing Chromium BackgroundModeManager observes that global preference. See the unresolved lifetime gap below. |
| New tab preloading | Native user-setting eligibility `08262c40/70` calls `039c4f44`, which reads profile `net.network_prediction_options`. Values 0,1,3 allow preloading; 2 and unknown values disable it. The supplied dedicated service is `042b1c64`/`042b26d8`. This is not an exposed asideBrowserPreferences boolean method. | Existing Aux ProfileGate used an independently invented `aux.browser.preload_new_tab` toggle. Replace its observer and guard with Chromium155 `prefetch::GetPreloadPagesState` and remove the obsolete registration. Keep its existing extension WebContents integration pending full pipeline reuse. |

The preload enum numbers changed between supplied and current Chromium. Using the155 semantic helper preserves the demonstrated allowed/disabled behavior without copying obsolete enum values. No new preference is introduced.

## Remaining concrete gaps

The existing BackgroundModeManager has a second Aux runtime-client gate, `aux.keep_runtime_in_background`, registered false. The supplied KeepTasks API never writes that profile preference, and the supplied Agent extension has no `background` permission. Correct global storage and a real manager observer therefore do not yet prove tasks survive the last window closing. This proposal deliberately does not invent a mirrored profile setting or redefine persistent-client policy. Static investigation of the original runtime-client lifetime and a disposable last-window observation remain required.

The existing ProfileGate hidden-WebContents preloader is still independently implemented; changing its eligibility setting does not establish reuse of the supplied prerender pipeline or activation behavior. The supplied dedicated service also has feature/profile/extension/page guards beyond the isolated user-setting check. These must be reviewed before claiming preload fidelity.

Bounded instruction extracts and pinned supplied decompilations distinguish directly observed storage behavior from current integration. `validation.json` records a disposable check/apply with exact input/output hashes for all three changed files. No global preferences, target process, owner state or shared native source were touched. Compilation and UI/runtime acceptance are pending.
