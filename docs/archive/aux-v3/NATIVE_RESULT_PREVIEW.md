# Native result HTML isolation

Patch `0030-aux-result-isolation.patch` makes interactive saved HTML previews work in the Chromium Aux shell. The packaged shell already allows `frame-src aux-result:` and renders previews in an iframe with `sandbox="allow-scripts"`. The native shell bridge now supports `createResultPreview` and `releaseResultPreview` for the committed `chrome://aux/` document only.

Each preview has a 192-bit random token, a 10-minute lifetime, a 256 KiB HTML limit, and an in-memory store owned by one shell `WebContents`. Another window or Profile cannot load the token. The browser serves it only as a GET iframe navigation initiated by `chrome://aux/`; there is no subresource or worker loader. The scheme is secure and standard for navigation, but registered as no-access so every document has an opaque origin. It is not registered for web storage, service workers, CORS, or CSP bypass. Private windows cannot create previews.

The browser response sends `Content-Security-Policy: sandbox allow-scripts; default-src 'none'` with inline scripts and styles for local interaction, data-only images and fonts, and explicit network, form, frame, object, and base restrictions. It also sends `no-store`, `nosniff`, `no-referrer`, and a restrictive Permissions Policy. A navigation throttle blocks the result frame from navigating to another destination before an outbound request starts. A preview iframe has no Aux Mojo bridge or access to its parent shell.

`result_preview_unittests` covers canonical URLs, owner isolation, release, navigation invalidation, size limits, and capacity. `ResultPreviewBrowserTest.ScriptRunsButCannotReachBridgeStorageOrNetwork` exercises the real shell bridge, opaque origin, inline interaction, denied parent bridge and local storage, blocked fetch, and a blocked link escape. These tests must run after patch 0030 is rebased on 0028 and 0029 and the native build completes:

```sh
autoninja -C out/AuxDev result_preview_unittests browser_tests
out/AuxDev/result_preview_unittests
out/AuxDev/browser_tests --gtest_filter=ResultPreviewBrowserTest.*
```

This patch was exported from isolated Chromium source commit `83f884c4002badc07643e22d49ea376151dd7ec6`, based on the series through 0027 (`a74edba865ab3643c704ef9964cab63f4b5efb9c`). It has not been compiled or run against an Aux binary yet. No personal Profile or generated result was used.
