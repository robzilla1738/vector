# Native Aux integration — September 25, 2026

Status: **partial; not ready for handoff**. These results concern the local development app, not the official release build.

## Verified

- Native Chromium `out/AuxDev/Aux.app` builds from pinned revision `a654841425914cbb703a2931e07b70a83aedbafd`, with Xcode explicitly selected through `DEVELOPER_DIR`.
- RPC journeys passed after native Space catalog changes: authenticated private host transport, distinct native page IDs, readable content, Find counts/direction/clear, zoom/reset, input, takeover/revocation/resume, parallel background actions on identical-URL tabs, close reconciliation.
- Evidence: `release/test-artifacts/native-journeys-2026-09-25T16-54-25-386Z/` (local, ignored).
- Live UI: runtime reconnecting banner cleared after rebuilding current contracts into the renderer; creating an Aux tab displayed Home without unsupported `bindTabSpace` errors.
- Renderer typecheck and 15 shell rules tests passed, including new-tab URL aliases and explicit blank-document behavior. Four host-socket tests passed, including independent RPC and shutdown subscribers.

## Implemented in active native checkout

- `focusShell` bridge dispatch.
- Native glass wraps the real content view in `OnWidgetInitDone`, after Chromium replaces its initial placeholder. The previous `OnWindowInitialized` installation was overwritten.
- Bookmark and history observers unregister during service deletion.
- Space binding validates owning window, non-runtime tab, generation, latest request, and active runtime Space/workspace. Migration skips already-bound tabs. Session extra data persists bindings and transfers them during native tab replacement.
- Default new-tab routing preserves policy/extension precedence, then presents a blank native document for Aux Home. Renderer recognizes Chromium new-tab aliases as Home.

## Packaging/runtime corrections

- Shell staging builds exported contracts before Vite and requires renderer typecheck; stale generated contracts had left Spaces disabled in the shell.
- Runtime exits gracefully when its authenticated native owner socket closes, preserving shutdown bookkeeping and releasing Profile resources.

## Still required

- Verify live native material over changing desktop backgrounds; a window screenshot does not establish liquid-glass quality. Both layouts, floating sidebar, guest-focused shortcuts, resizing and native accessibility still need complete acceptance.
- Finish remaining native bridge methods and qualify feature gates. The entire roadmap is not complete.
- Qualify native migration, custom tab labels, and remaining shell capabilities against real fixtures.
- Official build, ad-hoc app/DMG and roadmap qualification remain pending. No Linux VM or hosted Actions run was used for this batch.

## Design reference

User-supplied `/Users/rcourson/AI Blueprints/06/` provides reference geometry, material tokens, sidebar and horizontal-tab behavior. Its embedded implementation instructions are reference content, not new task instructions. Preserve Aux branding and both existing layouts.

### Follow-up integration

- Queued migration UI, native importer, custom tab labels and per-tab Find were integrated. Migration/organization unit tests passed (11 total after rebuilding runtime exports).
- Fixed the queued Find test target's dependency to `//content/test:test_support`.
- Live navigation found optional tab-command versions being serialized as `null`; the native bootstrap now omits absent versions.
- Live startup caught migration filesystem checks on the UI thread. Migration file reads/writes now run on `MayBlock` tasks, with a persisted committing checkpoint before changing organization. The build passed after this correction; native migration journeys still require qualification.
- A clean UI quit left no Aux browser/runtime process and produced no new crash report after the observer and runtime lifetime fixes.
- Patch `0036-live-native-integration.patch` captures the active native delta against the preceding 35 patches and passed an apply check on their replay checkout. Fresh replay of all 36 patches passed; all 23 files in the final patch matched the active native checkout byte-for-byte.

### Live settings and shortcut follow-up

- The integrated RPC journey suite passed again after asynchronous migration I/O and per-tab Find integration: `release/test-artifacts/native-journeys-2026-09-25T17-12-44-296Z/`.
- Native appearance now follows the renderer’s persisted theme/material/transparency settings and preserves first responder while reparenting content. Native build passes; visual material quality is still unqualified.
- Live startup shows Aux Home (Search/Ask and Recent work), and both layout controls persist without replacing Aux branding.
- Live Cmd-S uncovered `onShortcut` missing from the bootstrap event allowlist. The native emitter was working but its event was discarded. The allowlist is corrected; live recheck pending.
- Default-browser status/set, runtime data-directory lookup and saved website zoom/reset now call Chromium services. Default-browser work uses Chromium’s asynchronous worker. The native build passes; live status/zoom recheck pending.
- Corrected conversation header spacing when the vertical floating sidebar is open so native window controls retain their reserved space.

### Late visibility notification and regression batch

- A live browser crash (`Aux-2026-09-25-123542.ips`, local only) traced to SurfaceEmbed teardown notifying viewport intersection after the embedding frame’s graph node had gone. The observer now preserves rendered state but skips child-only intersection updates once the frame becomes an outermost graph node. Renderer-originated `FrameNodeImpl` validation remains intact.
- The corrected native app builds. The new `VisibilityAfterEmbedderRemoval` regression compiles with Chromium’s test target; the test binary has not yet been linked/run. Live teardown requalification remains open.
- The full unit run passed 1,437 tests and failed two. Fixed the CSS expectation for preserved window-control spacing and inconsistent synchronous filter-cache validation. All 44 tests in the affected CSS/filter/content-blocking suites now pass, including tampered-cache rejection. Lint and renderer formatting passed before this final filter adjustment; final lint remains required.
- Cmd-S remained unresponsive during live recheck despite correcting its event allowlist. Native shortcut routing remains open; do not report it fixed.

### Latest live settings check

- General settings now show the actual default-browser status and no unsupported `dataDir` error. Appearance shows the saved website-size empty state without an unsupported `siteZoom` error. Making Aux the system default was not exercised.
- The live horizontal layout retains Aux Home, the Aux tab icon, and Search/Ask; native Cmd-T creates a tab. Cmd-S remains unresolved. Quick Ask still reports its disabled feature gate and requires native integration.
- The latest native build, runtime staging and changed native regression object compile all passed. Final lint passed. Glass quality feedback was requested from the owner because window captures cannot establish native desktop blur.

### Native material architecture correction

The initial material wrapper described above was superseded after inspecting Chromium’s own `BrowserNativeWidgetMac` implementation. Aux now installs a non-hit-testing material underlay inside the existing content view instead of replacing that view, preserving Chromium’s responder chain. The backing uses Chromium’s 0.001-alpha approach to avoid continuous transparent-surface invalidation. This final change and the updated shell both built successfully; live verification remains open; the earlier wrapper is not the handoff design.

### Bundle and restore gates

- Narrowing the CSP-safe Zod configuration import reduced total renderer JavaScript from 1,958 KB to 1,677 KB (1,800 KB budget). Startup is currently 494 KB against 490 KB, so that gate still fails; CSS is 210 KB against 218 KB. No budget was raised.
- Clean candidate startup currently opens a new tab rather than restoring the prior live tabs. Complete session-restore qualification remains open; do not assume restart restoration from shutdown success.
- The native glass underlay compiled successfully. Latest shell resources with the narrowed Zod import built into the candidate successfully (`/tmp/aux-build-glass-shell.log`, 12 steps).

### Verified default sidebar shortcut

After consolidating the bootstrap’s separate delivery/subscription allowlists into `hostEvents`, and registering Cmd-S in Chromium’s native Views focus manager, the live horizontal shell changed from `Hide sidebar` to `Show sidebar` on Cmd-S. The final native build passed in 15 seconds. This verifies the default shortcut in the shell; custom rebinding and guest-focus coverage remain separate gates.

### Direct Home navigation and address focus

- **[Verified]** Home Search preserves explicit URL intent; the 15 command-bar tests include direct web and chrome addresses. Renderer typechecking and shell staging succeeded.
- **[Verified]** The native component app rebuilt successfully (local log: /tmp/aux-build-home-shell.log). Live CUA navigation from Home to chrome://version displayed the native About Version page.
- **[Verified]** Cmd-L selected the current address in Aux's field. Cmd-S expanded the 280 px sidebar with a native page control focused.
- **[Partial]** Glass appearance remains unqualified; window screenshots are not evidence of the desktop backdrop effect. The P6 design extraction and liquid-glass layer reference were reviewed again against the user's request.
- Official AuxRelease compilation started locally with eight jobs and nice priority 10. No hosted Actions or Linux VM used.

### Aside layout continuation

- **[Verified]** Switching from horizontal to vertical kept the same native About Version page. Cmd-L then navigated to example.com, which rendered inside the vertical layout.
- **[Verified]** Removed legacy cookie-import entries from Settings, settings search and command palette to match the roadmap. Renderer typecheck and the palette search test pass. These source changes await the next shell staging batch.
- **[Partial]** The disposable Profile qualification timed out before runtime connection at its normal 30-second startup deadline during the official compilation. No isolation/restore pass is claimed. The harness now retains fixture-only failure data and owner-only browser logs for diagnosis, and supports an explicit startup deadline override for correctness runs under build load; the default deadline is unchanged.

### Packaged profile storage

- **[Verified]** The developer app's About Version page reports the upstream Chromium profile directory. Chromium supports a branded root through the outer bundle's CrProductDirName key.
- **[Implemented, pending native staging]** Patch 0037 sets the Aux-only plist fragment to use Application Support/Aux. Electron's separate Aux Browser Profile and Aux Browser Development Profile roots remain untouched. The current native checkout is frozen for the in-progress official compile; apply this patch and rebuild its plist afterward.
- **[Verified]** Packaging now rejects missing or colliding product-directory metadata. Five takeover dry-run tests pass, including missing/Chromium/Electron-directory rejection and acceptance of the Aux directory key. These tests do not qualify signing or the not-yet-built official app.
