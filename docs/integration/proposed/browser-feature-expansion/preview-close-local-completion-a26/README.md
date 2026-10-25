# Peek dismissal through native unload handling

The actual A25 preview opens and promotes, but refuses Dismiss on a static fixture. The protection predicate for close additionally checks `NeedToFireBeforeUnloadOrUnloadEvents`; Chromium defines that as including ordinary pagehide/visibilitychange listeners. Presence of such a listener is not proof of unsaved work or an active dialog.

The one counted change retains actual agent ownership, blocked/split state, media/capture, DevTools, profile and download guards. It lets normal native Close/history navigation dispatch their original unload lifecycle. `BrowserView::OnWindowCloseRequested` still calls the actual `UnloadController::HandleBeforeClose` before hiding or destroying the window; the user can cancel a genuine beforeunload prompt. No forced renderer close or handler bypass is added. Promotion retains its existing loading guard and real-document transfer.

Exact source and unchanged native close consumers are pinned. Root must compile and actually verify ordinary dismissal plus a real synthetic beforeunload Cancel/Leave case before acceptance. No current app or UI resource was changed by this source proposal.
