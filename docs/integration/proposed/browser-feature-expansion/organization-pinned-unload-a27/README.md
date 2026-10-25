# Genuine native pin unload and dynamic pin height

This is the successor to `d69e7c2e8`. Controller input is that reviewed output, not the older actual native baseline. Its header and the region file use actual A25 bytes. Three files, nine exact anchors, with unchanged styles, tile geometry, timing and assets.

## Behavior

Explicit unload uses Chromium's real `TabLifecycleUnitExternal::DiscardTab(EXTERNAL)` instead of destroying the native tab. If selected, it activates an existing eligible user page in the same Space (global pins remain eligible); if none exists, the actual navigator opens a new tab first. It then rechecks the original native handle, logical identity, document and page ID before discarding. Existing loading/media/capture/beforeunload/devtools/runtime/download guards remain. Success describes Chromium's observed discarded state, never whole-process physical drain.

For Chromium's replacement-WebContents discard path, the actual `AboutToBeDiscarded` callback transfers the same view's PageIdentity, logical membership and pinned launch metadata before the replacement is published. Chromium's existing `CopyStateFrom` retains history. Its in-place discard path already retains the same native object. Reopening activates/reloads that retained view; it does not manufacture a PageIdentity or change draft keys. Shared archive/recovery close remains the existing destructive user action.

The real app additionally exposed a saved pin that existed in AX/model but had zero visible height. Grid `PreferredSizeChanged()` reached a plain intermediate View whose default child-size callbacks do nothing; the animated clip retained its cached empty height. A tiny wrapper now forwards actual child preferred-size/visibility changes. This clears the existing clip cache through its original callback. It changes no preferred-size computation, appearance or default layout.

## Evidence and app journey

`focused-source-check.json` binds the actual native discard interface, replacement callback order, tab/identity APIs, View's empty size callbacks and the clip's cache. Nine anchors replay independently and reproduce all three output hashes. No browser build, source projection, app lifecycle, signing or UI/runtime acceptance occurred in this lane. Root owns focused compilation and the following approved disposable journey:

1. Promote one visible page to a global pin. Its existing supplied tile must become visible immediately; verify in another Space. Add/remove another pin and resize the sidebar to confirm natural height is recalculated.
2. With history, an unsent draft and synthetic TXT chip on the pinned page, invoke its real close/unload menu while selected. Confirm another user view/newtab becomes active and the pin stays present. Reactivate it; verify the original history, draft and attachment remain. Repeat while already backgrounded.
3. An audible/captured/beforeunload/runtime-owned page must refuse unload. A shared archive is a distinct action and must preserve protected local recovery views.
4. Normal quit/restart should retain those same native session page identities. Existing A25 session-recovery acceptance is historical until repeated on the newly assembled package.

If any actual native lifecycle or identity check refuses, the operation returns false; there is no fallback to physical close or URL-based rematerialization. The current accepted app remains intact.
