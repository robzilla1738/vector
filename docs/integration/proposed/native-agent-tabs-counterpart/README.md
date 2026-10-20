# Original agent-tabs button and bubble counterpart

A supplied native counterpart exists. It is **not** the task's session-tabs content panel and should not be replaced by an arbitrary Agent extension page. The complete original native layout/model/actions still need recovery; the retained independently implemented Aux bubble is not established faithful. This proposal fixes one exact interaction mismatch without altering its current layout or deleting functionality.

## Original implementation and entrypoints

Pinned original153 framework metadata identifies these real classes in `chrome/browser/ui/views/tabs/aside_agent_tabs_button.cc`:

| Original entry | Meaning |
| --- | --- |
| `0468727c` | AsideAgentTabsButton metadata |
| `04684340` | Button construction region; installs primary vptr `0e732ef0` |
| `0e732f48` | That vtable's +58 metadata thunk `04687378` → `0468727c` |
| `04684c18` | Button press path, bound during construction at `04684424` |
| `04689dd8` | AsideAgentTabsBubbleView metadata; derives the actual bubble metadata chain |
| `04688b08` | AgentTabsCommandRowView metadata |
| `046890d0` | AgentTabsRowView metadata |

Actual direct constructor calls occur at `045d78f0` and `045df220`. Both load the native browser, require its normal type, pass its actual TabStripModel (`Browser+88`) and BrowserWindowInterface subobject (`Browser+28`); one passes an additional native anchor, the other passes null. Their complete parent class identities/layout contexts are not inferred from addresses alone. The supplied button is therefore a real native browser/tab-model control, not an unmounted illustrative class.

The press path first loads its stored actual bubble Widget at button+558. If present, it immediately tail-calls the real close-with-reason path `02c1d388` with reason0 and returns, before any eligibility/model check or new bubble allocation. Otherwise it requires its actual eligibility byte+538 and model+508, creates the native bubble, installs its native row/command structure and observes its widget. The pinned instruction regions establish existence/ownership/control flow; their entire geometry/commands are not declared recovered from constants alone.

## Distinct task session-tabs surface

`04625d00` constructs AsideAgentSessionTabsView in `chrome/browser/ui/views/frame/aside_agent_session_tabs_view.cc`; the actual separate native mount is `037e3a74`. Its constructor stores BrowserView and TabStripModel and subscribes to real tab changes; Refresh/FinishPoll (`046271b0`, `046289c8`) schedule actual work, including a2s poll interval. That class is distinct from AsideAgentTabsBubbleView and is not proof that the toolbar should render the entire session panel.

Agent1852 also has a per-session composer query `sessions.tabs.list({sessionId,accountId})` in `assets/session-composer-Dc0LRfZA.js`. That is an additional existing supplied UI context, not a complete toolbar bubble entrypoint. No extension route was substituted here.

The actual background producer groups a created agent tab using serialized `$i(tabId)` work: query the actual tab's window for group title `Agent Tabs`, reuse/create that real group and update its title. `Aside.createAgentTab` calls that function after actual chrome.tabs.create. Its exact source SHA/anchors are included. This proves a real native group producer; the full original native button's group-membership/eligibility consumer has **not yet** been established, so this proposal does not reinterpret a matching group title as permission to close arbitrary user tabs or replace the existing daemon ownership scope.

## Narrow correction

Current Aux mounts one CreateAuxAgentTabsButton in VerticalTabStripTopContainer and stores real bubble/browser weak ownership records for profile-retirement safety. Its callback creates a new bubble on every press. The proposal first checks those actual records for the same browser, closes the existing real Widget with155 `ClosedReason::kUnspecified` (value0), and returns. The owner record remains until actual Widget destruction; a close/hide request never becomes a fake destruction receipt. Other windows are unaffected. The existing profile-retirement guard is unchanged.

This uses the currently installed one-button-per-browser seam. A future full original native class port should retain its own per-button widget field, as the original does; this is not a newly designed multi-anchor bubble manager. Closing even an already-closing recorded widget is idempotent in actual155 Widget::CloseWithReason and does not create another bubble while its owner remains live.

All present rows, styling,420px width, custom title, Refresh button, disabled cleanup-policy control, network feed projection, error text and actions remain unchanged. They are retained behavior, **not accepted original parity**. Full replacement must recover native row/command constructors, theme/geometry, visibility predicate, selection/activation and exact native group/model commands before changing them. No compilable drop-in original C++ source for those classes was found in the bounded supplied decompile inventory; binary/native source recovery is available, but incomplete. No guessed layout patch or behavior deletion is included.

`manifest.json` pins the current actual Aux source and the single proposed output. `source-evidence.json` pins the original framework/arm64 slice, bounded native regions/vtable, retained class decompiles and exact1852 JS anchors. `verify.py` checks original bytes, direct branch targets, class names, JS counts and exact one-file replay; it also proves the correction is limited to the callback's existing-widget branch. No shared native writes, builds, app launch, signing, owner profile or OS action occurred. Actual UI/native acceptance remains pending.
