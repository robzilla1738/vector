# Conditional retained-palette recovery

One native owner / one counted anchor; unprojected and uncompiled. Current source baseline contains the retained-document private-event correction.

WebContents::WasShown changes visibility and calls NavigationController::SetActive; that only invokes LoadIfNecessary when needs_reload_ was explicitly set. Renderer crash handling notifies observers, and WebView updates its crash overlay/focus; neither automatically navigates this Aux owner. Its retained document would therefore stay unusable after a crash.

BeginInvocation still rotates authority first. It loads the exact trusted SearchURL only when there is no current load/pending navigation and the existing document is crashed, dead, failed, or committed to the wrong URL. A healthy document and an unfinished initial load are left untouched. Replacement mount reads the current binding via existing getCommandContext and gets a new document identity. No generic crash observer, retry timer, state reset, or renderer resource change.

Static source inspection and counted replay only; no induced crash, app operation, projection or build.
