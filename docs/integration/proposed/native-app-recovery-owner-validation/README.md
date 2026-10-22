# App-recovery owner validation followup

Preimage is exactly native-app-profile-recovery's session_restore.cc output (root integration ff4ef8d53); one file, count-checked, pinned and replayed.

Second review confirms `read_error_` is sticky across both callbacks: only assigned when previously false. Browser success cannot clear an app read error. The original restorer retains process/profile keepalives; cache-close cancellation deletes it and weak read/registry callbacks become inert. The added initial shutdown guard and existing post-read request admission avoid new recovery during Quit. No additional changes are justified there.

Concrete corrected gap: a nonempty serialized app_name may decode to no app ID or refer to an uninstalled application. `MaybeCreateAppBrowserController` then finds neither a surfaceable WebApp nor hosted-app owner, yet the generic CreateRestoredBrowser path still creates a trusted TYPE_APP window. The followup validates that same native controller-owner predicate after registry readiness and before any windows are created: real surfaceable WebApp, or actual hosted extension under ENABLE_HOSTED_APPS. It does not recreate registrations, install apps, assign an arbitrary identity or silently discard stale records. A missing owner refuses the entire recovery through the existing preserved-session feedback path. Native regular popup/browser restoration remains unchanged.

Hosted-app lookup intentionally matches the existing native controller factory's registry selection; no new extension enablement/trust rule is introduced. This is admission validation for this Aux path, not a modification of global Chromium app restoration.

Focused isolated patch replay passes. No native build, runtime, GUI, server, installation, owner-data or credential operation. Actual removed-app failure and installed-app success remain runtime acceptance work.
