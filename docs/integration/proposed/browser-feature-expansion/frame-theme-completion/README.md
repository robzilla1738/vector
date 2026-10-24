# Minimal presentation and inherited accent completion

This inactive, four-file overlay is pinned to the current selected BrowserView/Toolbar source and the integrated Aux theme editor. It does not modify the root checkout, native tree, current build, supplied asset adapters or staged resources.

## Minimal mode

Opting into minimal mode now requests the existing actual ToolbarView in a docked vertical sidebar, even when the separate sidebar-navigation preference is off. Existing sidebar hosting removes the top toolbar's reserved page height and supplies the already-integrated page/window/chat corner calculations. No new geometry or material painter is introduced. The same focus/menu/drag/animation locks, native minimum-width refusal, fullscreen restrictions and collapsed/hover behavior remain authoritative.

With the sidebar collapsed (or docking unsupported), the trusted native location/navigation/permission UI stays at the top. Minimal mode removes only its redundant vertical interior padding (8 DIP in the selected non-touch Aux desktop constants), retaining native control minimum sizes, horizontal inset, extension/profile/chat access and responsive overflow. Existing bookmark suppression remains. Turning minimal mode off restores exact default margins and the independently selected navigation placement. The existing settings switch and native command/shortcut are the single toggle; no new preference or shortcut is required. Always-show-full-URL remains the actual omnibox preference and is never overridden.

Only BrowserView and ToolbarView require shared adapters. The current native layout already keys page height and corners off `IsAuxSidebarNavigationHosted()`, so no layout-file edit is needed. Root must compose these exact counted edits after its current shared frame integration and add the four final source hashes to the successor frozen input manifest. No GN/schema/registration additions are needed.

## Accent inheritance

The previous editor applied a custom accent by calling `ThemeService::SetUserColor`, which clears native theme data. Its Inherit action later removed the Aux token without undoing that write. This successor makes Aux accent a persistent, optional ColorProvider overlay exclusively: neither preview nor Apply writes the native user color or removes the underlying extension theme. Preview without an accent immediately exposes the underlying profile theme; Cancel restores the saved overlay; Apply without the token preserves the underlying theme across restart. The existing immutable supplier forwards the underlying supplier and keeps native/policy/contrast restrictions.

A subsequent explicit choice through native theme/accent controls retires only the Aux accent token. Other Aux background/material tokens and all native theme preferences remain intact. The existing explicit Reset-to-default action retains its documented default-theme behavior. Presets/export/import continue carrying only public validated tokens, with no copied native theme state or arbitrary theme-ID restoration.

This cannot reconstruct a theme already destroyed by an older `SetUserColor` call: no guessed migration or owner-profile read is performed. This feature successor has not been accepted/executed, so the fix prevents that destructive mutation in the new implementation rather than claiming recovery of historical user choices.

## Verification boundary

One inert source check replays each one-count edit against its pinned baseline, verifies all result hashes and patch hash, and checks the current read-only integration inputs still match those baselines. This is not a native compile or runtime acceptance. Root owns the next focused compile/full unsigned build and actual disposable UI observation. The current default UI and accepted app remain untouched.
