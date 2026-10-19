# Native profile bootstrap and new-tab preload — patch 0089

Built independently from `docs/spec/native/platform.md` P3/P5 and `native/apis-core.md` A1/A4.

The browser's Show and ShowInactive paths now deny ordinary-window visibility until the real profile has an exact durable account binding, valid configured/unlocked Vault security summary and positive account `onboardingCompletedAt`. A dedicated Views window loads the independently built extension's `#/onboarding` or `#/unlock` route. The gate polls metadata off the UI thread, hides normal windows when a gate becomes required, closes stale bootstrap content on extension reload, and cancels callbacks/content on profile destruction and shutdown. Successful completion shows the pending normal browser windows.

Before its first state read the gate authenticates `POST /accounts/profile-binding` with actual profile path/index. Profile IDs are now `aux-profile:` followed by uppercase hexadecimal SHA-256 of ProfileManager's registered absolute path with trailing separators removed. Account and popup APIs and the gate use the same exported helper. A same-path legacy basename binding remains locked with an explicit migration error; the reader never silently rewrites it.

The shared reader opens registry/security metadata through `O_NOFOLLOW`, requires a regular file owned by the current user with no group/other permissions, bounds file size and validates account/version/required fields. Missing, unsafe, malformed or mismatched state fails closed. Native private keys and tokens never enter metadata or logs.

An enabled native profile preference, `aux.browser.preload_new_tab` (Aux-selected default true), warms one hidden extension WebContents after the gate opens. This is a browser-owned extension preloader: upstream content Prerender2 rejects extension schemes. No speculative tab is added to the tab strip. A ready page is consumed only for clean new-tab navigation without opener, POST data or extra headers, then enters the normal TabModel insertion/focus path with the normal new-tab virtual URL. Locking, preference changes, extension reload, renderer loss, profile destruction and shutdown invalidate the cache. Full tab helpers are attached by actual tab insertion; initial extension IPC observation is initialized before the hidden load.

Daemon environment also gains the bundled password-importer executable path.

## Evidence

On 2026-10-19, enabled native compilation through the serialized build wrapper passed the profile gate, state reader, account/popup/preference changes, supervisor, BrowserView, chrome_browser_main and actual browser_navigator activation hook. The standalone native `profile_state_probe` linked and ran using its own temporary directory. It verified distinct IDs for two `Default` paths; missing/setup/unlocked-but-incomplete/completed/locked transitions; wrong-account rejection; world-readable metadata rejection; symlink rejection; and explicit legacy-binding refusal. Patch consolidation contains only owned additions and exact shared integration hunks, and reverse-checks in a scratch tree.

This is component-build compilation plus a focused metadata probe. No owner browser profile was launched or modified. Full browser linking, disposable-profile setup/recovery-key completion, unlock/relock, extension reload, prerender activation/pref disable and screenshot evidence remain runtime acceptance work. Windows are retained while gated and revealed on completion; replacing them with newly constructed ordinary windows, retry UX after a failed binding POST, account-binding deletion on actual profile removal, and remaining `Browser.ensureProfile`/download/viewport CDP methods remain open work.
