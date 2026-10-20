# Actual importer window controls and profile loader

Two new source files, no existing native edits. They provide callable source-backed operations for the WebUI owner rather than invented successful lifecycle callbacks.

* `CaptureImportWindowControls(*web_contents)` captures the initiating **weak** `gfx::NativeWindow` immediately; the returned repeating callback updates native standard buttons 0/1/2 only. This is `458cf98`, called with false after Firefox discovery (`426304c`) and true on the real failure path. It does not resolve a later selected tab or replacement profile/window.
* `LoadImportedProfile(target_path, required_ready_callback)` uses actual `profiles::SwitchToProfile(path, false, callback, false)`. This is positively mapped, not a generic substitute: `7acaadc` binds `7aca824` with the callback, false `always_create`, false `is_new_profile`, false command-line URLs; `7acaa9c` forwards a non-null loaded Profile; the loader calls actual ProfileManager `CreateProfileAsync`. Original `7aca824` checks signin-required attributes, reuses/activates an existing profile browser, otherwise installs a browser-added observer and opens a real window. Current155 `profile_window.cc` has the matching entire sequence. The required callback receives the actual BrowserWindowInterface or null, retaining normal profile-lock/error behavior.

## Concrete remaining lifecycle prerequisites

Do **not** bind generic window activation as the original completion callback. Original `458d2f0` takes the returned Browser's actual Profile (+40), resolves the profile-scoped owner through `2e84c48/52d94(..., true)`, and invokes `417c4ec`. The latter checks `aside.onboarding_completed`, owner/window conditions and starts a separate coordinator. That exact owner/type/155 integration is not yet recovered. The loader itself already activates reused windows. This patch intentionally requires the real caller callback, rather than silently removing those source gates or manufacturing onboarding completion.

Do **not** claim `2959bb0` is ordinary `BrowserWindow::Close()`. It immediately marks the Browser owner at +228, releases pending state at +2b0/+2b8, dispatches actual close notifications, then invokes the widget closure through a valid weak backing. In155 `UnloadController::OnWindowCloseComplete` publishes did-close and posts BrowserManager destruction; it has an already-empty-tab lifecycle prerequisite, unlike a generic close request. A direct call with the importer WebContents still parented would violate current Browser destructor's empty-tab invariant. Exact original owner-retirement entry semantics and the proper155 importer-tab settlement remain a concrete prerequisite. No surrogate close helper is shipped.

The weak-native-window fallback in both `458d5b0/458d718` is positively `orderOut:nil` then `close` when no Browser owner resolves. It must not be used to sidestep the real Browser's tab/owner teardown. Original selector trampolines and the complete bounded retirement body are pinned here for the next implementation.

## Integration

Root adds the `.mm` to the importer WebUI target, with its existing AppKit and profile-window/UI dependencies. The header avoids depending on FirefoxImport, so Firefox, Chromium and Safari can reuse the same real operations. Bind the controls callback while the initiating WebContents still exists. Do not consider the lifecycle complete until the owner-retirement and real post-load coordinator are supplied. Existing Firefox `WebUILifecycle` continues requiring its actual `retire_owner` and `open_profile` callbacks; this patch does not bypass those checks.

`python3 verify.py` checks the original thin whole hash, six exact code ranges, four selector stubs, original onboarding key, two new output hashes and patch replay. No native build, dialog, profile load, window action or owner data access was performed.
