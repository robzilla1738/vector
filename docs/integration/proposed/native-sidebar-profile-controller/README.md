# Supplied sidebar profile-button state owner

This ports the actual state-producing half of `VerticalTabSidebarProfileButton` (constructor465c5f0, class metadata465e674), alongside the separate root-authored renderer. It does not read a Widget window icon or choose a replacement profile avatar. The actual source is `BrowserView::toolbar()->avatar_toolbar_button()` and its **normal LabelButton image model**. The GetWidget call only checks attachment: original465f038 returns x0, checks x0 at465f03c, and465f130 stores x20 (the AvatarToolbarButton) to header+4f8. The pinned diagnostic string is `ScheduleSyncFromAvatarToolbarButton` atdecbfaa.

## Exact state

* Normal profile name is its original-profile attributes entry `GetName()`, with an empty result when absent. OTR/guest uses the actual source button text if nonempty; otherwise it calls the actual `profiles::GetAvatarNameForProfile(originalProfile->GetPath())`. This is not a path basename or independently formatted profile label. The original helper220801c matches the actual155 `profiles_state.cc` guest-path/default-name/GAIA/email selection.
* The paused bit is the actual registered `aside.account_auth_paused` boolean. Missing registration is false, exactly the original name updater's guarded read. It is not synthesized from account, Vault, Sync, local-only or cloud availability. This proposal registers no preference and writes no profile data. Pref observation is skipped for OTR, matching465df60. Aux isolation is the real profile location; this original internal key is retained.
* A nonempty source normal image is a20px profile image. The actual profile entry's selected/present GAIA picture suppresses monogram mode; otherwise index26 chooses the original monogram. Source image bytes remain authoritative. Resize only when needed, square20px, `RESIZE_BEST` (the original7ad311c passes enum2). No corner crop, substitute avatar fetch or new image producer is introduced.
* A source vector icon is rebuilt at22px with actual semantic role221. Unsupported/empty source models use the recovered account/guest/incognito22px glyph, reusing root's exact original vector paths. Current actual Widget color mode selects the independently pinned original221 recipe (`d9fafafa` dark/`d90a0a0a` light); no global theme heuristic. The root renderer owns the actual label, Paused badge, arrow and their painting.

## Original observation and lifetime

Original avatar observer e724658 has source-invalidating callback+10→465ee6c, icon+30 and text+38→465ef10 (direct updater). Slot+10 is emitted before BOTH real destructor member teardown (2fdc5f8..604) and original profile rebinding (423f6d4..6e0). Text emission is3613c08..c14; icon emission423faa4..ab0. The155 interface lacks source-invalidating and text callbacks. This bounded adapter restores those two notifications through the existing StateManager observer list; source invalidation happens while that list is alive. A late base View deletion notification alone would be unsafe because the actual AvatarToolbarButtonStateManager member would already have been destroyed.

The real source View observer e508e10 only overrides removed-from-Widget(+58) and deleting(+70), both465f4a8: detach the actual avatar and View observations, clear the source and weak-schedule a refresh if the sidebar itself still has a Widget. The original profile attributes observer e7246b0 overrides only name/auth/avatar/highres (+28/+30/+38/+40), filters the actual original-profile path and schedules a sync. The controller preserves these four events and the actual auth-paused pref observation. ScheduleSync465f620 coalesces with a pending bit and posts one zero-delay weak task;465f738 clears pending and requires the real sidebar Widget before updating. Direct icon/text updates remain synchronous. Destruction invalidates weak tasks and retires all observations first.

The155 binding adds observation of the actual renderer's attachment/theme/deletion to connect these recovered operations without adding virtual hooks to the root renderer. Those are explicit mounting/lifetime adaptations, not claims that original source had a separate controller class.

## Integrator seam

Register just these two new sources in browser UI:

```
chrome/browser/ui/views/frame/aux_vertical_sidebar_profile_button_controller.h
chrome/browser/ui/views/frame/aux_vertical_sidebar_profile_button_controller.cc
```

Create `VerticalTabSidebarProfileButtonController(browser_view, actual_button, callback)` after creating the genuine header. The state callback maps directly to:

```
button->SetDisplayName(state.display_name, state.auth_paused);
button->SetAvatarImage(state.avatar_image, state.avatar_diameter,
                       state.show_monogram, state.profile_image);
```

The actual owner calls `RefreshNow()` after genuine toolbar/header attachment and after completed profile/toolbar rebind. `ScheduleSync()` is the coalesced variant. The controller rebinds preference subscriptions to the actual BrowserView profile; it never loads or chooses a profile. An invalidating source callback only detaches the old source, as the original does. Real transaction completion re-admits the new source. Destroy the controller with the owner; actual renderer deletion also retires it safely.

The four producer baselines are the current read-only native201 actual files. All additions are ENABLE_AUX_BROWSER && IS_MAC guarded. The two new controller files depend on root's exact glyph/renderer header (pinned in source-evidence.json). No region, renderer, menu callback, account API, profile-switch core, build registration or shared-native file is edited by this proposal.

## Verification and limits

`python3 verify.py` verifies the exact full arm64 SHA, all ten bounded instruction slices, vtable and notification targets, original strings, actual155 API source hashes, all six source outputs, and a disposable full patch replay. Source checks reject a Widget window-icon/profile-avatar substitute or a pref write. This is static proof and replay only. Actual C++ compilation, mounting and visible behavior remain integrator work. The original registered auth-paused producer is not yet established in the current Aux native profile; this code truthfully leaves absent state false. No native build, app launch, owner profile, OS grant, credential or signing action occurred.
