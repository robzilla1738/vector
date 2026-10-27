# Sidebar popup lifetime fix: rebase onto the 2026-10-23 recovery snapshot

## Result: no source change required

Checked again on 2026-10-27. SHA256 `1fd991f83b88158b2df5424644efd5252267ba189b45a2e1791780afd0fa38e5` matched the durable checkout, the legacy `/private/tmp` tree, and `source/chrome/browser/ui/views/frame/aux_sidebar_view.cc` in this directory. No product source was changed. The real-app steps at the bottom were not run.

- Base file: `chrome/browser/ui/views/frame/aux_sidebar_view.cc` in `/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src`, SHA256 `1fd991f83b88158b2df5424644efd5252267ba189b45a2e1791780afd0fa38e5` (3049 lines). The same hash was present at `/private/tmp/aux-chromium-recovery-snapshot-20261023/src` on 2026-10-27.
- Successor output: `source/chrome/browser/ui/views/frame/aux_sidebar_view.cc`, SHA256 `1fd991f83b88158b2df5424644efd5252267ba189b45a2e1791780afd0fa38e5`. It is byte-identical to the base (verified with `cmp`).
- Header: `aux_sidebar_view.h` is unchanged and is not included here.
- Previous fix: `../../../browser-feature-expansion/organization-popup-lifetime-a32/`. Its original base SHA256 was `7e47702c3a4df0aa6fa4e981fe79c50f2f58632e1da7fc6f65a514fb12a88dcc` and its output SHA256 is `53e7dfc78d5eee6367e9825bf36cdcecf7c7ac6d11850c19b64fd48d945e2ed8`.

The current snapshot already contains every A32 hunk. `diff -u` between the A32 output and the current file shows exactly one changed line. In `AuxProfileMenu::OnOrdinaryWindowClosing`, A32 called `DestroyAuxProfilePopup(profile_actions.get())`; the current file calls `RetireAuxProfilePopup(profile_actions.get())`. The current version is kept because it is the safer form, for the reason below.

## Status of each site in the current file

| Site | Current file | Status |
| --- | --- | --- |
| Top-level menu retirement (`RetireAuxProfileMenu`) | Ordinary builds call `widget->Close()`, so the callback installed by `MakeCloseSynchronous` runs. Other builds keep `CloseNow()`. | Already fixed |
| Primary menu (`AuxProfileMenu::Show`) | `CreateOwnedPrimaryProfileMenu` | Already fixed (supplied) |
| Bookmark child (`ShowBookmarksSubmenu`) | `CreateOwnedAuxProfilePopup`; rows bind `weak_factory_.GetWeakPtr()` | Already fixed |
| Profile-actions child (`ShowProfileActions`) | `CreateOwnedAuxProfilePopup`; Edit/Delete rows bind a WeakPtr | Already fixed |
| Indicator menu (`AuxProfileIndicatorMenu::Show`) | `CreateOwnedPrimaryProfileMenu`, so the destructor continuation `pending_` runs | Already fixed |
| Icon popup (`OpenIcons`) | `CreateOwnedAuxProfilePopup`; the grid binds a WeakPtr | Already fixed |
| Parent teardown | `~AuxProfileMenu` and `~AuxProfileIndicatorMenu` invalidate their WeakPtrs and then call `DestroyAuxProfilePopup` | Already fixed |
| Parent native close | `OnOrdinaryWindowClosing` calls `RetireAuxProfilePopup`, which disables and hides the child and defers its deletion | Already fixed (refined beyond A32) |

The remaining `CreateBubbleDeprecated` and `CloseNow` calls appear only in the branches compiled when `AUX_BROWSER_ONLY_NATIVE_STARTUP` is not defined. Those builds keep the original native-owned paths on purpose.

The profile/source-cookie-epoch fences (`IsCurrentProfileMenuSource`, `RunProfileMenuAction(sender/browser, source, epoch, ...)`) and the posted-action logging are unchanged. No style, value, layout, icon or text line was touched.

## Ownership facts confirmed in the snapshot's upstream views code

- `bubble_dialog_delegate_view.cc` lines 576-580: the `unique_ptr` overload of `CreateBubbleDeprecated` calls `.release()`. Lines 583-588: `CreateBubble` creates a `CLIENT_OWNS_WIDGET` widget.
- `widget.cc` lines 1015-1024: when `override_close_` is set, `CloseWithReason` runs it and returns early. Lines 1087-1094: `CloseNow()` never consults `override_close_`.
- `widget.cc` lines 2168-2184: if a parent or the platform destroys the native widget, `OnNativeWidgetDestroyed` still runs `override_close_`, so a child's retire callback also fires when its parent goes away.
- `widget.cc` lines 304-340 and 3080-3096: in `~Widget` for `CLIENT_OWNS_WIDGET`, `HandleWidgetDestroying` calls `WindowClosing`, which runs `OnOrdinaryWindowClosing` and the deactivation-pin closing callbacks, while the delegate is still alive. This happens because `OwnedPrimaryProfileMenu` resets the widget before the delegate.
- Why `RetireAuxProfilePopup` is correct inside `OnOrdinaryWindowClosing`: that callback runs inside the parent's `~Widget` (under its call-stack lock). Deferring the child's deletion avoids destroying the child synchronously in that frame. `Widget::Hide` returns early when there is no native widget, and the root view lives until `~Widget`, so `RetireOwnedAuxProfilePopup` is safe even after the native widget is gone.

## Residual risks (existing behavior, not changed here)

- A retired top-level menu (primary or indicator) stays visible until its `DeleteSoon` task runs. The indicator does not disable its rows during that window, so a second click can overwrite `pending_` before the delegate is destroyed. The epoch/source fences still apply when the action runs. Changing this would alter behavior, so it is left alone.
- No compiler or runtime check was performed. Root owns compilation.

## Focused real-app verification (ordinary Aux build, disposable profile)

1. Open the primary menu. Open the Bookmarks child, then close it by deactivating it. Reopen it and choose "All bookmarks", then "Bookmark this tab". Each command should run once, after the menu closes.
2. Open the profile-actions child for a profile row. Choose Edit and save a name. Reopen it and choose Delete, which should be enabled only when removal is allowed.
3. While a child is open, retire the parent: press Escape, click outside, or open the indicator menu. The child should disappear with no crash and no stale action.
4. Open the indicator menu. Open Change Icon and select an icon; the icon should update after both popups close. Open Change Icon again and dismiss the parent while the grid is open.
5. From the indicator menu, choose Settings; it should switch to the profile and open `/settings/general`. Choose Sign Out; the removal confirmation should appear.
6. Switch profile or account binding while a menu or modal is open, then act on it. The stale action should be refused.
7. Optional: watch `LOG(ERROR)` for "Aux primary profile menu: destroying" and "closed_action_posted". These show that delegates are destroyed and actions are posted.
