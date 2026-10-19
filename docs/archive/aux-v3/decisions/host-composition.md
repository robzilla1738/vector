# Aux host composition decision

Decision date: September 24, 2026. Status: **W selected for implementation; acceptance pending**.

Use Chromium's Webium window and SurfaceEmbed page surfaces for the Aux shell. Keep Aux's branded React shell, horizontal layout, vertical liquid glass Aside layout, and tab organization. Webium already puts browser pages and the shell in one composited window; its page embedding API gives Aux a direct route to glass, pointer hit testing, and two placed pages without injecting material into sites. The current BrowserView proof relies on opacity-hidden stock chrome, synthetic pointer forwarding and page DOM injection. Those proof mechanisms have no place in the deliverable.

## Zero-build evidence

The existing `156.0.8074.0` Aux Host Proof binary was launched with `--enable-features=Webium` and an empty disposable Profile. No native rebuild was made. The source checkout is `b151276ea2110e74b063c6964bd0a5c14dc42f52` plus the existing proof modifications. This tests upstream Webium's UI, not an Aux Webium implementation.

| Gate | Observation | Status |
| --- | --- | --- |
| Shell and live page | Accessibility tree identified `chrome://webui-browser/`; a local fixture loaded under it. Clicking the fixture button advanced its counter from 0 to 1. | Pass for basic page input |
| Tabs and address box | New tab appeared in Webium's tab strip; typing the local fixture URL navigated successfully. | Pass for basic navigation |
| Context menu and selection | Right-click on fixture text opened the native context menu and selected the word. | Pass for basic context menu |
| Window fullscreen | The macOS fullscreen shortcut entered a full-window page view and exited again. | Pass for window fullscreen |
| Stock split command | “Add Tab to New Split View” opened Chromium's “Choose a tab” picker, but after choosing the other tab the window showed a black page area rather than a usable two-page split. | **Fail in stock Webium** |
| IME, drag and drop, trackpad gestures, VoiceOver, extension popup, permission prompt, password bubble, video fullscreen | Not exercised in this short spike. The repository's Webium window includes extension and permission dashboard hooks, but their presence is not a passing journey. | Open |

The split failure does not establish that SurfaceEmbed cannot show two pages: Webium's browser UI owns page embedding and Aux must supply its own split placement. It does make the stock split command unusable as the implementation. The full B2 acceptance matrix, including the failed split case, remains a gate before W is complete. If native integration proves a critical failure intrinsic to SurfaceEmbed rather than an unimplemented Webium host path, revisit V with recorded evidence.

The candidate's Webium log reached unimplemented window methods including `GetWorkspace`, `GetStatusBubbles`, `UpdateToolbar`, and `LinkOpeningFromGesture`. The source checkout has further `NOTIMPLEMENTED_LOG_ONCE` paths. Each used path must be implemented or ruled out by the native journey matrix; the roadmap's earlier stub count is not a completion claim.
