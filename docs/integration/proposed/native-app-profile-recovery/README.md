# App-session integration for profile recovery

Pinned native v611; proposal prepared in isolated worktree rooted at 714fcd022. Four native files, no shared source/build/runtime changes. Existing UI and native layouts are unchanged.

## Completed implementation

The Aux workspace recovery now requests both actual SessionService and AppSessionService through the existing SessionRestoreImpl. Both use the previously implemented preserving-file read during admission. The original asynchronous `got_browser_windows`, `got_app_windows` and `WebAppProvider::on_registry_ready` barrier must all settle before any restored window is created. A missing app provider/service fails closed with a fixed diagnostic instead of silently dropping saved apps or creating a substitute host. Initial shutdown checks prevent this entry point from resurrecting session services after Quit starts.

Before merging the two result vectors, the adapter validates their provenance: browser-service records must be NORMAL or POPUP; app-service records must be APP or APP_POPUP with a nonempty actual app identity. Invalid provenance is rejected before even the empty-session fallback. App records are admitted only when the app restoration path and registry readiness are both true. This prevents merely relabeling browser-session records as trusted apps.

Native `CreateRestoredBrowser` retains the original `CreateForApp` / `CreateForAppPopup` paths and trusted-source semantics for the actual app-service input. Existing tab history, selected tab, native type, bounds, workspace and metadata restoration is reused. An app-containing session always restores in separate actual target-profile windows; it never reparents a live task or converts an app into the source normal browser. The original browser-active-window priority remains unchanged. App-only recovery does not create an NTP: `always_create_tabbed_browser` remains false.

Current and repeated request completion can focus genuine restored app/app-popup windows, and those windows count as live recovered workspaces. This prevents a repeated selection from creating an empty normal workspace while only restored apps remain open. Once recovered windows have actually closed, the existing new-workspace behavior remains available.

## Evidence and boundaries

Native source owners are `AppSessionServiceFactory::GetForProfileForSessionRestore`, `AppSessionService::ShouldRestoreWindowOfType` (APP/APP_POPUP), `SessionRestoreImpl::Restore` (separate app read and registry barrier), `OnGotSession` (combined completion and read-error accumulation), and `CreateRestoredBrowser` (native trusted app construction). These are reused rather than approximated. The supplied recovered session/workspace anchors provide reuse context but do not prove this exact custom Aux admission policy; this is an explicitly attributed Chromium155 integration adaptation.

Installed app behavior still follows Chromium's existing registry/app-controller logic; this proposal does not synthesize app registration, install an app, bypass profile locks or admit DevTools/unknown types. If app infrastructure is unavailable, recovery is refused rather than claimed successful. Actual installed-app/app-popup runtime acceptance is still pending.

Safe detach/return and active-task migration are different operations. Existing native guards still protect contextual tasks, actor owners, active tab-strip invocations, pending file reads and unported live state. Dormant saved app windows can be restored; an active agent execution, approval, upload or browser-bound task cannot be transferred to another profile by replaying its session window. This slice does not waive those guards or claim running-task migration. Existing safe same-profile caches/return behavior remains under its original owners.

No window is deleted based on title, NTP contents or apparent emptiness. The v610 bounded evidence showed real saved additional windows, not leaking private caches. The existing session parser owns truly invalid/no-tab records; no new cleanup is introduced.

## Focused verification

Count-checked replacements and exact four-file preimage/output SHA256 pins pass isolated patch replay. Only the changed boundary was inspected; no native builds, GUI automation, credentials, signing, provider calls or owner data were used. Integrator should compile session_restore, aux_profile_switch_request and aux_profile_switch_workspaces and perform one disposable normal+installed-app recovery, verifying separate native types, source ownership and repeat selection without duplicate NTP windows. A source review does not replace that acceptance.
