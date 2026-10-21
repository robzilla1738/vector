# Browser popup and mixed-window profile recovery

Pinned native v610. Four-file integration adaptation reusing the existing native SessionRestore implementation. No independent UI or synthetic window/tab model.

## Supported owner and exact boundary

`SessionService::IsRelevantWindowType` explicitly accepts saved TYPE_NORMAL and TYPE_POPUP. `BrowserTypeForWindowType` maps the latter to a genuine native TYPE_POPUP. `SessionRestoreImpl::CreateRestoredBrowser` and `RestoreTabsToBrowser` already restore its bounds, native show state, target profile, actual navigation history, tab selection and metadata. The Aux admission guard previously restricted this existing owner to TYPE_NORMAL only.

Admission now uses that exact browser-service predicate. One normal window still adopts the existing hidden normal cache. A single popup or any supported mixed/multiple set uses the separate-window path, retaining each native type and leaving the source window/profile unchanged. Neither a popup nor its contents are converted into a normal tabbed window. The current request and repeated selections can focus a recovered popup; keeping only popups open no longer makes the separate-recovery state look empty. The one-time explanation describes separate recovery without incorrectly claiming every session had multiple windows.

The asynchronous source/generation, target lock/live-window race, closing, shutdown, read-error and private-cache guards remain unchanged. The auxiliary restorer is still constructed with `always_create_tabbed_browser=false`, so popup-only restoration does not synthesize an additional NTP window. Original active saved window selection and native restorer callbacks remain in place.

App and app-popup restore remains outside this browser-session operation: `AppSessionService::ShouldRestoreWindowOfType` owns those types; SessionRestore's `restore_apps` branch reads the separate app service and waits for WebAppProvider registry readiness. CreateRestoredBrowser also applies trusted app creation semantics there. Merely admitting app enums from the browser session would skip that ownership/readiness boundary. DevTools and invalid/incomplete windows remain refused with accurate guidance. No feature or trust guard is disabled.

The supplied recovered native session-restore anchors and profile workspace code establish reuse context, but do not prove an exact custom popup admission rule. This proposal is explicitly the minimal Chromium155 integration of its existing browser-session popup contract, not a claim of decoded Aside-specific behavior.

## Empty-window policy and verification

No window is deleted or filtered because it is titled New Tab or contains only an NTP. Actual v610 evidence established five genuine normal windows and three private caches, consistent with five menu entries; older session snapshots already contained extra one-tab windows. Their origin cannot safely be inferred from title. The existing session parser alone handles records with no valid tabs/constrained state; this patch adds no cleanup.

Count-checked edits and isolated four-file patch/SHA replay passed. No shared native mutation, build, UI/runtime or profile/credential access. Integrator should compile the three changed translation units and use one disposable saved popup + normal-window recovery, verifying native types, selection, source ownership, and repeat selection without duplicate windows. App-session support and actual runtime popup acceptance remain explicitly unverified.
