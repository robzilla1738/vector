# Window-owned mandatory binding provider

This is concrete orchestration of the real in-place transaction and delivered service seams. It adds one private provider translation unit and a narrow Features header declaration. The window owns its transaction/rebuild lifetime. An out-of-line custom deleter keeps the public Features interface independent of Views headers and cancels transaction weak work before profile-service field teardown. It does not call whole Features Init/TearDown, replace the window/model, or register a UI/extension activation trigger.

The internal RunAuxProfileSwitch returns true only for the actual core's switched/no-change result. Real security-not-ready/rejected results return false; no target state is synthesized. Prepare is cold, before core cache/security/tab effects. It checks real window/service/view readiness and constructs the mandatory begin/commit/finish/abort callbacks only when the supported graph is ready.

## Real order

1. Pause existing BrowserView, Actions, location bar and vertical sidebar sources using their generation APIs. Preserve actual source editing through genuine tab SaveStateToContents calls. Stop Download private owners, pin observations, old extension/stock entry views, old bookmarks IPC and registry observations before identity. Pause real profile/dialog observers, media/avatar, and retire only the native extension/pinned toolbar subtrees. Retain the outer controls and old private Cookie/Instant/window sources through source detach.
2. Once core commits the actual Browser/model profile while empty: bind target view prefs and **Actions before toolbar/entries**; rebind the same location bar; rebuild actual target pinned/extension subtrees and refresh Features' real pinned alias. Retire/reconstruct the original private Instant/window/keybinding and cookie settings owners with existing constructors. Rebind actual focus/live context/dialogs/IPC/registry sources, target media/avatar/education/Lens sources and real lazy side-panel registrations. Rebind target download services and same sidebar.
3. After genuine target insertion, finish actual active accelerator state, Actions policies, location-bar state, sidebar and window policies. Refresh genuine Lens entry state. Core owns the final theme/session/vertical transaction settlement and real rebuild timer.
4. Pre-identity abort runs **after core restores source tabs**: restore source Actions listener/policies and original source toolbar subtrees; reconstruct actual source accelerators/download; restore same source location-bar, registries/IPC, media/avatar/education/Lens, lazy entries, sidebar and view policy. It does not invoke target-empty commit methods on a populated source model. Source cookie/Instant/window/dialog identities were never changed.

## Required proposal order

Baseline header is exact f970432b4 private-service output. Other supplied prerequisites are already applied through v95 or later, except these explicit follow-ups which must precede this source:

- 0a7a55758: real ExtensionBrowserWindowHelper source abort.
- 8c3fda0d3: real Lens source abort.
- 70cabaa10 then 915316333: Download actual private owners + validated source rollback for Download/Toolbar/ExtensionSidePanelManager.
- 6e0a02c2a: cookie bubble real lifetime/private settings retirement.
- Root Actions source-abort follow-up: restore only original source preference listener/policies, preserving untouched ActionItem cue/transient state.

GN: add `browser_window_features_aux_profile_switch.cc` beside `browser_window_features.cc` in `chrome/browser/ui/browser_window/internal/BUILD.gn`'s non-Android Features implementation source list, for Aux Mac. It needs the same actual private service deps as the existing Features implementation and the current Aux transaction source target. Root owns registration. Do not add a public Features -> Views dependency: the private provider deliberately avoids that cycle.

## Actual remaining limits

The explicit cold guard still rejects existing unported newer owners: breadcrumbs, comments/contextual tasks/ContextHighlight, Glic, shared-tab stores/session observer/organizer, actor/AI overlay/AI-mode/data protection/newtab footer, cast/mobile/ChromeLabs, shared-feedback/recent activity and a created FindBarController. ContextHighlight is currently constructed unconditionally, so the ordinary production graph **still refuses before effects** until its real source lifetime is audited/ported. This is intentional truthful incompleteness, not an enabled switch or final parity claim. Removing a guard requires the actual old-service teardown, target binding, and source abort proof, not a fabricated successful plan. Other browser-owned transient WebContents/widgets (including independently authored AuxAgentTabsBubble) remain a mandatory settlement audit before any trigger is enabled. Root is handling that bubble's real ownership.

Verification: exact parent header SHA and new-file output SHA; independent disposable unified-patch replay PASS. Tiny standalone C++ language check confirmed a nested Features provider has the enclosing friend's PreparedBindings access. No native compile, shared source write, builds, owner state or runtime/UI acceptance.
