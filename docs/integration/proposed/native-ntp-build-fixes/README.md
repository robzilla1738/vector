# Native build integration fixes

Actual v31 focused compilation completed with three failed objects. ContentsWebView included chrome/common buildflags, while ENABLE_AUX_BROWSER is emitted in chrome/browser/buildflags.h. Add that exact generated header and its public GN dependency. BrowserView’s existing generic WebView accessor has no transition method; call the same active concrete ContentsWebView through MultiContentsView before the existing null detach. Carrier and prerender service compiled successfully.

Three anchored source changes replay exactly from current v31 into v32. Full original replay matches all98 output sources; v32 GN/focused compilation remains the next actual gate. No behavior replacement or owner state access.
