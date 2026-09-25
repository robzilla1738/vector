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

### Profile isolation and startup recovery

- **[Verified]** Two disposable regular Profiles kept separate HttpOnly fixture account cookies and rejected each other's page IDs with target_detached. Assertions now check the structured error code.
- **[Partial]** Abrupt restart must wait for Chromium's session checkpoint; the original test terminated before its 2.5-second write-behind could save navigation. The harness now checks for the fixture URL and identity in the session journal before terminating. This is persisted-session recovery, not qualification of the native Quit menu.
- **[Failed]** With a persisted session, the runtime's first internal CDP connection timed out after 15 seconds and remained degraded. A 90-second diagnostic startup deadline did not recover it.
- **[Implemented, pending live verification]** Retain the managed driver after initial connection failure and retry connection setup with capped backoff. This retries no browser actions. Shutdown cancels timers and drains an in-flight handshake before disconnecting. Three lifecycle tests and the runtime TypeScript build pass.

### Native CDP attachment reset

- **[Verified]** The revised runtime attempts recovery after initial failure. Under the official-build workload, the persisted-session journey still timed out while connecting; repeated private WebSocket connections were observed in the fixture log. Isolation still passed.
- **[Verified]** The broker cleared JavaScript connection/session maps on disconnect but left native DevTools clients attached until the entire runtime channel closed. That retained enabled protocol-domain state across new Playwright clients.
- **[Implemented, pending native staging]** Patch 0038 adds an authenticated, argument-free native.cdpReset operation. The runtime serializes native resets and waits before accepting commands from each new CDP client. Ordinary disconnects release native attachments. These changes must be staged together after the active official build; the developer app still carries the prior runtime/native pair.
- **[Verified]** Broker tests cover reset ordering, stale-client isolation, private-socket Playwright connection and page/OOPIF routing. The runtime builds. Live restart recovery remains unqualified until patch 0038 is compiled and the updated runtime is staged.

### Deferred assistant panels and startup budget

The set-results panel and recent-conversation list now load when selected in the assistant rail. Both retain the shared recoverable loading/error boundary. The boundary accepts a container-specific close action, so Cancel, Escape and error Close dismiss the rail without changing the main browser mode. The browser chrome and both layout implementations are unchanged.

- **[Verified]** Chromium-targeted renderer build (`AUX_CHROMIUM_SHELL_BUILD=1`) and renderer TypeScript check pass.
- **[Verified]** The configured bundle gate passes: startup JavaScript **486 KB / 490 KB**, startup CSS **210 KB / 218 KB**, total JavaScript **1677 KB / 1800 KB**. Budgets were not raised. These are the existing manifest gate's measurements, not a presented-frame or full layout-interaction measurement.
- **[Verified]** Two deferred-surface tests pass: retry preserves surrounding draft DOM; embedded loading/failure Cancel, Escape and Close use the container's close action. Targeted lint has no errors; the two existing accessibility/effect warnings remain.
- **[Pending]** These renderer changes and the cookie-import cleanup have not been staged into the running native build. The official build remains on its frozen source, compiling without a reported failure at approximately 15,278 completed actions. Queued patches 37/38 and the matching runtime still require the subsequent native rebuild and live persisted-session recovery test.

Local logs: `/tmp/aux-deferred-panel-{types,build,budget,tests,lint}.log`. No hosted Actions, Linux VM, model calls or publishing were used for this batch.

### Development handoff scope and resumed integration

The owner revised the current scope on September 25: complete product features/native integration and hand over a working development build. Final DMG, release signing/notarization, full release qualification and takeover packaging are deferred. Migration code remains in scope; real data migration is not authorized.

- **[Verified]** Stopped the release-only `out/AuxRelease` Siso process with SIGINT. The live build handle ended; its log records **15,708 completed, 0 failed, 56,360 remaining, interrupted by signal**. No output/cache directories were removed.
- **[Verified]** Applied queued patches 37 and 38 to the native checkout and built the component app successfully: 20 actions, 1m46s. The app plist now reports `CrProductDirName=Aux`, and its staged runtime contains the matching native CDP reset protocol. This is implementation/build evidence; recovery still requires a live fixture run.
- **[Verified]** Fixed the tab-menu/overview `windows` bridge method by deriving other-window destinations from the existing Profile-scoped catalog, excluding popup and runtime-owned tabs from counts. Five bridge tests and renderer typecheck pass. The updated shell is staged for its native resource rebuild.

Logs: `/tmp/aux-official-build-20260925.log`, `/tmp/aux-dev-build-38.log`, `/tmp/aux-dev-window-menu-build.log`, `/tmp/aux-window-menu-{tests,types,lint}.log`.

### Restored-session investigation after the development rebuild

- **[Verified]** Updated development app still passes two-Profile HttpOnly cookie/authority isolation. Saved-session recovery still fails: Playwright connects to the broker and discovers the restored page, but all page initialization requests remain unanswered (`Page.enable`, `Page.getFrameTree`, `Runtime.enable`, and related setup). Automatic retries and native attachment resets run but do not cure this first-attachment failure.
- **[Verified]** A trial `LoadIfNecessary()` call in Webium's active-tab handler compiled, but the same fixture still timed out. The trial was removed from source and from the patch series; it is not retained as a claimed fix.
- **[Investigating]** A temporary native broker diagnostic build is being used to distinguish unavailable renderer state from replies dropped by ownership/URL validation. Diagnostics emit only method names, sizes and Boolean state, never page payloads. They must be removed before the working development build is handed over.

Logs: `/tmp/aux-dev-profile-reset-journey.log`, `/tmp/aux-dev-profile-protocol-journey.log`, `/tmp/aux-dev-restored-tab-journey.log`. Protocol traces are local, owner-only fixture logs; they are not committed. No real profile was migrated.

### Asynchronous native API replies

Patch 39 replaces the worker's blocking API-response read loop with a bounded map of pending requests. Responses are matched by request ID; timeout/disconnect complete each request without replaying it. Callbacks return to the UI task runner. The worker remains free to send CDP notifications while the runtime prepares an API response.

- **[Verified]** Development app compiles (23 actions, 1m05s). Protocol tracing now shows every restored-page initialization request receiving its response, rather than leaving them all pending behind a browser API request.
- **[Still failing]** Restored `Page.getFrameTree` returns an empty frame URL; Playwright still waits for its first committed navigation and times out. Cookie/authority isolation continues to pass. The API deadlock fix is not a claim that saved-session recovery is complete.
- **[Verified]** Temporary native diagnostic logging and both unsuccessful load/visibility trials were removed. The retained native change is asynchronous API response handling, not a timing or reload workaround.
- **[Observed]** Launching the fresh branded default profile opened Chromium's sign-in window. Aux startup/onboarding integration remains a product issue to fix; no sign-in or real-data migration was performed.

Logs: `/tmp/aux-dev-async-rpc-build.log`, `/tmp/aux-dev-async-rpc-journey.log`, and owner-only fixture traces in `/tmp/aux-profile-logs-jIVBiG/`.

### Runtime startup ordering and restored-page attachment

- **[Verified]** A deterministic socket test reproduced `zap.snapshot` being rejected as `not_found` when it arrived in the handshake packet. Buffered delivery now runs after synchronous RPC handler registration. All five host-socket tests pass, including the new regression.
- **[Verified]** The development app now connects its runtime during saved-session startup and restores the web tab with its original native identity. The former empty-frame/CDP initialization failure no longer reproduces in this fixture.
- **[Verified]** Native protected pages were imposing a 40-second attach timeout before web tabs were registered. The managed driver now rejects those targets before attachment, preserving the broker's protected-document boundary. Unix-socket recovery also reuses the authenticated connection instead of attempting a second one. Four driver trust tests and 11 combined socket/broker/session tests pass.
- **[Partial]** The strengthened two-Profile journey has restored Work's tab identity, active selection and persisted HttpOnly account cookie. Its final Personal assertion raced registration; the harness now waits for Personal's restored identity as it already did for Work. A clean complete run remains required.
- **[Verified]** Abrupt-process cookie recovery now waits for the fixture cookie's SQLite checkpoint, as the harness already waited for Chromium's tab journal. Earlier `Account none` failures terminated before the cookie had reached disk. Only fixture cookie metadata is queried, never values or keys.

Logs: `/tmp/aux-startup-rpc-{before,after,build}.log`, `/tmp/aux-startup-recovery-unit.log`, `/tmp/aux-native-profile-recovery-final.log`. No real data was migrated.

### Development UI follow-up

The owner reported soft/pixelated shell icons on September 25. This is a current development handoff requirement. Icons are inline Central SVG paths (24-unit viewbox, 1.5-unit strokes), displayed at 14/16/20 CSS pixels. The connected Dell display uses 3440×1440 at 1×; the built-in display is Retina. Live scale/compositing and optical stroke verification remain open; no icon fix is claimed yet. Preserve icon geometry, Aux branding and liquid glass.

### Aux startup instead of Chromium account onboarding

- **[Verified]** Patch 40 disables Chromium's account first-run gate only when `ENABLE_AUX_SHELL` is enabled. Non-Aux builds retain upstream behavior.
- **[Verified]** Native component build succeeds (2 actions, 23.37s). A normal CUA launch of AuxDev, without `--no-first-run`, opens branded Aux Home with its Search/Ask control and Recent work. No Chromium sign-in prompt appears.
- **[Open]** Icon optical-stroke correction is being staged. No live post-fix sharpness claim yet. The shell's actual `chrome://aux/` renderer was inspected through Chromium DevTools; no remote-debugging server or browser security override was enabled.

Log: `/tmp/aux-dev-first-run-build.log`.

### Recovery and core native journeys after startup fixes

- **[Verified]** The complete independent two-Profile restart fixture passes: Work and Personal restore their original page IDs and HttpOnly fixture accounts; cross-Profile observation stays denied. Log: `/tmp/aux-native-profile-recovery-complete.log`.
- **[Verified]** All six core native RPC journeys pass after allowing a trusted tab's empty, not-yet-committed URL to proceed through attachment. Protected internal URLs still reject immediately. The driver regression covers both committed and pending recovery. Evidence: `release/test-artifacts/native-journeys-2026-09-25T19-41-06-763Z/manifest.json`.
- **[Owner clarification]** The icon appearance was traced by the owner to their monitor. The unverified optical-stroke trial was removed before app installation; existing Central icon paths and weights are preserved.
- **[In progress]** The owner reported inconsistent corners. Page cards used circular 14px corners, horizontal toolbar 16px, and main surfaces the Aux squircle. The page card and toolbar now share the existing `--stage-radius` and `--squircle-factor`; redundant vertical-only radius override removed. Renderer build and existing bundle budgets pass. Native resource rebuild/live inspection remain pending; no claim of complete visual qualification.

### Continuous toolbar/page seam — correction after owner feedback

The first corner change unified the shape but retained a second rounded page card. The owner's live screenshot confirmed the resulting cutout remained. That was insufficient. The page card now delegates clipping to its enclosing content column/native window, and the extra horizontal page inset is removed. This makes the page meet the toolbar at a straight seam while preserving the enclosing Aux corners. The corrected native resource rebuild passed (12 actions, 51.36s; `/tmp/aux-dev-continuous-corner-build.log`). Live inspection in AuxDev confirmed a continuous horizontal toolbar/page seam. The owner subsequently confirmed the rounded corners work, and identified a remaining case with only the right assistant sidebar open.

### Right assistant sidebar with left sidebar hidden

The hidden-sidebar rule removed all content-column rounding even when the right assistant was open. The vertical hidden layout now preserves the content column’s two right corners while Ask Aux is visible. Clipping stays on the whole column, including its toolbar; no nested page-card radius is reintroduced. Settings and Tasks hide the assistant, so those overlays retain the flush layout. The first attempt in the components layer built but failed live inspection: the later refinements layer reset the column radius to zero. The correction now lives beside that reset in the refinements layer and also covers the collapsed navigation-rail variant. Renderer build and unchanged bundle budgets pass. The corrected native resource build passes (12 actions, 1m32.78s; `/tmp/aux-dev-right-rail-cascade-build.log`). CUA inspection of the rebuilt AuxDev shows both right content corners rounded on Aux Home with only Ask Aux open. The owner was actively changing the window during attempted webpage checks; embedded webpage verification remains pending. No complete layout or glass qualification is claimed.

### Owner confirmation and consistent native glass

- The owner confirmed the corrected right-assistant content corners: “looks right.”
- The owner selected the expanded left sidebar’s current native blur as the reference for both sides and layouts. The native host already installs one autoresizing `NSGlassEffectView` (or an older macOS `NSVisualEffectView` fallback) underneath the entire window. No per-sidebar native blur strength exists.
- Removed the horizontal layout’s additional 85% opaque veil from the chat sidebar and assistant. Docked navigation, chat sidebar, assistant and horizontal tab strip now use one `--window-glass-tint`, matching the expanded left sidebar’s existing setting. Content-area opacity remains separate. Reduce Transparency retains its opaque fallback. Different colors behind each side can still produce different colors through the same material.
- Renderer build and bundle budgets pass. Native resource rebuild passed (12 actions, 1m22.93s; `/tmp/aux-dev-shared-glass-build.log`). The update is in AuxDev/Aux.app. Relaunch verification was interrupted by concurrent owner interaction; no new live glass appearance claim.

### Native page controls and shutdown cleanup

- Patch 41 implements shell `hardReload`, `printPage`, and `devTools` with page/window ownership validation. Hard reload retains repost confirmation; DevTools respects native policy; printing checks active-page identity and Chromium policy/content restrictions before opening native preview. Native build passes (2 actions, 48.28s). Live command-palette Hard reload returns to Example Domain without an unsupported-method toast. Printing and DevTools qualification remain pending.
- A print-preview attempt ended with no Aux window available. The only available crash report was from an earlier normal shutdown (15:05), so it does not establish a print-specific crash. That report proves `AuxRuntimeHost` synchronously joined its worker thread on the restricted UI sequence.
- Patch 42 invalidates callbacks, queues worker destruction, and transfers the thread to a `MayBlock`/`BLOCK_SHUTDOWN` ThreadPool task for joining. This preserves shutdown completion without blocking the UI or suppressing its synchronization checks. Native build passes (4 actions, 46.68s); live normal-quit verification remains pending.

Logs: `/tmp/aux-dev-page-controls-build.log`, `/tmp/aux-dev-shutdown-build.log`. Both patches pass reverse application checks against the native checkout.

### Print preview geometry failure reproduced

A second live Print command reproduced termination. The local Crashpad diagnostic gives the exact failure: `constrained_window_views.cc:130: DCHECK failed: dialog_screen_bounds.Intersects(host_screen_bounds)`. No crash dumps or raw profile data were copied into the repository.

The upstream WebUI host reads content bounds from a tracked Webium DOM element that Aux does not register, returning an empty rectangle. Patch 43 obtains Aux’s active SurfaceEmbed guest bounds, clipped to the shell client area, and uses the client area for Home or a guest that has not rendered yet. The modal host now converts screen coordinates relative to the hosting client area rather than the outer window frame. Native build passes (3 actions, 25.48s; `/tmp/aux-dev-modal-bounds-build.log`). The repeated live preview check is pending.

### Live page-command results

- **Verified:** Aux’s command-palette Print opens native preview, finishes rendering a one-page Example Domain PDF, and Cancel returns to the browser. No job was sent to a printer. This confirms the modal geometry correction against the previously crashing path.
- **Verified:** The command-palette Developer tools action opens a DevTools window attached to `example.com/`; the Elements panel is accessible and closing it returns to Aux.
- **Open:** Command-K did not open the palette while the embedded page had focus; the sidebar Search button works. Native shortcut forwarding still needs completion.
- The first background-join trial still triggered the synchronization check because `MayBlock` does not authorize base synchronization waits. The cleanup task now also declares `WithBaseSyncPrimitives`; this permission is limited to the shutdown worker task, never the UI sequence. Build passes (2 actions, 49.37s; `/tmp/aux-dev-shutdown-sync-build.log`). Normal-quit retest passed after connected runtime startup: the Aux browser process exited and no new Crashpad dumps appeared. The prior failing quit produced two new dumps immediately.

### Shared native shortcut registry

- **Verified:** Patch 44 registers the renderer's effective intercept chords with Chromium's Mac focus manager. Saved rebinding and disabled defaults are sent through the same native bridge; default chords are reserved so AppKit does not reinterpret a disabled Aux command. The development app built successfully (31 actions, 1m15s; `/tmp/aux-dev-shortcuts-build.log`). Six focused bridge tests and renderer typechecking passed; the shell bundle remained within its existing budgets.
- **Verified in AuxDev:** With Example Domain itself focused, ⌘K opens the Aux command palette, ⌘⇧A opens Ask Aux, and ⌘S hides the sidebar. These were previously unresponsive or limited to shell focus. A normal quit and relaunch loaded the new app before testing.
- **Still open:** Live testing of a user-rebound chord and the remaining page-focused commands. This does not qualify every command action or complete the roadmap's native bridge matrix.

### Floating assistant material at narrow widths

The responsive Ask Aux panel used an opaque `--bg-1` fill below 820 CSS px while the floating left sidebar used a translucent tint plus a 28 px saturated backdrop blur. Both floating panels now use the same tint and filter variables; docked panels continue to share the window's native glass underlay. The Chromium shell asset capture, bundle budget gate and local AuxDev resource build passed (12 actions, 1m20s; `/tmp/aux-floating-glass-build.log`). A normal relaunch loaded the updated `chrome://aux/` shell. The material's perceptual match across displays and widths still needs live owner observation; a screenshot alone is insufficient evidence of native blur quality.

### Native Open File and window command

- Patch 45 adds a Chromium `SelectFileDialog` bridge for Aux's Open File action. It returns only the user-selected local path to the shell, which then opens the document through its existing tab workflow. An outstanding picker is rejected instead of opening a second dialog, and the listener is detached during teardown. Close Window now calls Chromium's window command after replying to the shell.
- **Verified:** The local development app builds (9 actions, 1m22s; `/tmp/aux-native-file-dialog-build.log`). In AuxDev, ⌘O opened the macOS picker. Selecting the local `/tmp/aux-native-open-fixture.html` fixture opened an Aux tab showing “Aux file picker verified” at its `file:///private/tmp/...` URL. No real user file was selected.
- **Partial:** ⌘⇧W from the fixture page removed its window and a new Aux Home window became visible. The final-window lifecycle and multi-window command behavior remain to be qualified with a dedicated fixture.

### Native PDF export

- Patch 46 routes `savePagePdf` through Chromium's page renderer and a native Save dialog. It rechecks page identity after the dialog, renders the selected page to PDF, and writes the document atomically on a blocking worker rather than the browser UI sequence. The suggested filename comes from Chromium's sanitized page-title naming path. Printing-disabled builds return a direct unavailable error.
- **Verified in AuxDev:** With the local HTML fixture focused, ⌘⇧P opened the macOS Save panel. Saving to `/tmp/aux-native-pdf-fixture.pdf` produced a 10,768-byte PDF 1.4 document with one page and the fixture document title; the file had owner-only permissions. Reopening the dialog and Cancel returned to the page with “PDF export canceled.” The shared Open File picker still opened the same fixture after this change.
- **Verified after filename refinement:** The local native rebuild passed, and the Save panel suggested “Aux native open fixture” instead of a generic “Page.” The final incremental build after the printing-disabled guard also passed (2 actions, 2m02s). No real document was exported.

Logs: `/tmp/aux-native-pdf-build.log`, `/tmp/aux-native-pdf-refine-build.log`, `/tmp/aux-native-pdf-final-build.log`.

### Rebound shortcut verification and development landing state

- **Verified in AuxDev:** Rebound Command Palette from ⌘K to ⌘⇧K in Settings. The new chord opened the palette over the local fixture page, while ⌘K no longer opened it. Reset restored the original ⌘K binding; no custom binding was left in the development Profile.
- **Verified:** Patch 46 is the latest committed native integration. The attempted Profiles bridge was exploratory only and was removed before staging or building; the native checkout still contains the committed patch series with no new partial feature. AuxDev remains running on the local fixture page. Quick Ask and native Profiles remain gated off, and the development handoff is not yet complete.
