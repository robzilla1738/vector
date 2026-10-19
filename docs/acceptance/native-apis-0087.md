# Native private APIs — patch 0087

Independent build from `docs/spec/native/apis-core.md` A0–A4, `native/omnibox.md` O1–O4 and `native/platform.md` P1–P3. No reference implementation or artifact was consulted.

Implemented five namespaces: account (4 functions), browser preferences (33), notification (2), omnibox (29 functions, 19 declared events), mini popup (10). Permissions are component-only, nonoptional and restricted to the two independently generated Aux extension identities. The base native function also checks the active identity and BrowserContext.

Account context derives profile ID/path from ProfileManager and resolves only an exact persisted binding. Missing or invalid account security summary stays locked. Installation signing uses the native owner-only P256 authority, returning DER/SHA256 base64 in `{signedChallenge}`. Routes to locked profiles accept setup/unlock destinations only and require a registered, already loaded profile.

Preferences use native theme, vertical-tabs, zoom, content settings, language/spelling and search-engine services. Additional Aux UI choices are registered profile preferences. Default browser and Dock changes use upstream macOS integrations. Local sync/update replies explicitly describe the available local state. Keep-running maintains a real ScopedKeepAlive for the active session.

Omnibox sessions create a real AutocompleteController and native profile providers. Result revisions advance when results change. Selection/deletion/navigation reject stale revisions; open-tab activation retains the original tab identity. Native tab observers, search-engine queries, bounded in-memory file contexts and exact-profile tab metadata support the UI. Query offsets use UTF-16 positions. Native navigation uses the owning tab/window.

Popup uses a Views-owned extension WebContents, appwide global shortcut, separate options widget, focus/Escape dismissal, bounded work-area positioning, macOS material and a native directory chooser. Profile switching checks the same account security metadata.

Daemon launch environment additionally provides the live browser PID, embedding-model directory, computer-use helper executable, bundled tool/Python PATH and bundled Poppler font configuration.

## Verification performed

On 2026-10-19, `scripts/native-build.py` serialized the enabled native build in `out/AuxAside`. Schema JSON, private permission features and generated function registration succeeded. Exact compilation succeeded for all five API implementations, common capability boundary, both macOS helpers, generated API-registration object, actual `browser_prefs.cc` and daemon-supervisor object. This is component-build compilation evidence, not browser runtime acceptance or a noncomponent release build.

The consolidated patch was generated from owned new files and the three explicit shared integration patches only. Reverse application was checked in a scratch tree; the dirty shared checkout was never reset or used as a blanket diff.

## Remaining acceptance gaps

- Browser runtime, extension promise/callback calls, native notification prompt, shortcut/window/file-picker behavior and profile isolation still need disposable-profile observation after resources are staged.
- Omnibox EventRouter dispatch is restricted to exact BrowserContext and owning render process, with a session ID on every event. Separate authorized extension views in one process can still receive labelled events; strict per-frame event delivery needs a binding-level mechanism.
- Native keyboard selection events, thumbnail capture, visual search and non-URL action execution are not complete. Unsupported action/Lens/agent dispatch returns an explicit error. Agent-mode submit must connect to the authenticated daemon session API. Some declared capability events have no runtime producer yet.
- Aux custom presentation preferences require N-C live-window consumers. Persisted keep-running/shortcut registration restoration at cold startup remains unfinished.
- Popup security gate currently follows Vault configured/locked summary; the approved main-assistant-versus-Vault gating flow still needs integration validation. Security changes while a popup is open are not yet continuously observed.
- Account route loading of an unloaded profile is not implemented. Native first-run/profile binding/newtab onboarding orchestration and remaining Aux CDP methods remain N-A acceptance backlog.
- Adblock and browser import namespaces are reserved but are not implemented by this patch; patch 0088 is assigned to that scope.
