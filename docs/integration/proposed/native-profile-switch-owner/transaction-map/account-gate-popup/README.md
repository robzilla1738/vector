# Original account-password bootstrap: first UI correction

This source-only three-file proposal replaces the independent 1040×760 `Widget`/`WebView` wrapper with the supplied native app-popup mechanism. It is an incremental UI checkpoint, **not the final admission policy**. The still-existing independent `state.allows_browsing()` predicate and 500ms polling are recorded below as remaining differences; they must not be accepted as original behavior.

## Recovered original UI

Pinned supplied arm64 SHA `64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c`:

- `0x417bb1c`: rejects null/off-the-record/guest profiles, already-completed global onboarding, missing actual Agent registry; checks its actual global pending/browser state to avoid duplicate popup creation.
- `0x417bd58..0x417bd88`: real Browser creation parameters, type4 (`TYPE_APP_POPUP`), user gesture true; `app_name="aside-account-password-popup"`; trusted source and omit-session-restore flags enabled. Proposal changes only that app identity to `aux-account-password-popup`.
- `0x417f37c`: chooses active same-profile nonclosing window, otherwise first encountered same-profile nonclosing window. `0x417bb1c` uses its actual native display, otherwise primary display; centers 900×560 and applies real `gfx::Rect::AdjustToFit(work_area)`.
- URL table at `0xe8944a0` contains exactly three string_views: `chrome-extension://` (19), original Agent ID `fjdhphbdlfjogobdofoaagnlnkoibdge` (32), `/main.html#/onboarding/splash` (29). The popup adds the real tab, then calls its real browser window `Show()`. Native does not select Vault setup/authentication routes.
- Original `OnBrowserRemoved` (`0x417e330`) updates bootstrap ownership/state and schedules native continuation. It does not unconditionally call app-wide `AttemptUserExit` when an owned wrapper closes.

The proposal changes `CanShowBrowser` to receive the real `BrowserWindowInterface*`. Its only pre-admission exception is the exact weakly tracked popup created by this gate, with the same actual Profile, app-popup type and nonclosing state. Merely supplying an app name cannot bypass admission. Actual browser tab creation installs extension WebContents lifecycle observers; the old bare WebView initializer is no longer needed for this popup. Cached workspace windows are excluded from display anchor selection.

## Original state/admission, to port next

`RefreshBootstrapState` (`0x417ad48`) reads real accounts state off-thread; it does not fetch password-manager auth or infer gate state from Vault lock status. Inputs are actual profile preference `aside.profile_id`, real profile path and optional `aside.account_user_id` (`0x410347c`, `0x410374c`). The worker `0x417b944` calls the supplied accounts JSON reader `0x4100b88`; unreadable/malformed input yields an absent optional result.

`OnBootstrapStateLoaded` (`0x417cb38`) accepts actual global `aside.onboarding_completed` or actual successful bootstrap resolution, otherwise records known state and uses only existing profile `aside.bootstrap_complete` when the result is absent. Absent results schedule another refresh after **1 second**. No successful bootstrap is synthesized from an unknown state. Original `IsBootstrapWindowRequired` (`0x417b2a0`) separately checks null/OTR/global onboarding/`aside.automatic_password_gate_suppressed`/guest criteria and performs the real reader query. `0x417a8d8` may clear suppression for a real non-omitted profile entry; this is not an anonymous-account shortcut.

The bounded REA recovery of evaluator `0x41007c4` is retained verbatim. It calls `0x4100468`, tries actual profile-local binding/account optional `onboardingCompletedAt`, normalizes real profile paths, and inspects only real alternate binding entries. The older fallback `0x40fff68` is pinned raw; complete field-to-state mapping and exact state enum helper `0x40ffa68` remain the next recovery step. The caller's `optional<bool>` high byte is explicit in raw `0x417b944`: no accounts-state object => absent; valid object => engaged result. **Valid accounts JSON saying incomplete differs from unavailable daemon authentication.**

## Current remaining differences / readiness

This checkpoint retains current native account binding/security plumbing temporarily and therefore does not establish faithful admission. It must be followed by the original bootstrap reader/pref/suppression/guest policy port. In particular, current `local_anonymous` onboarding substitution, configured/unlocked Vault requirement, auth-token change behavior and 500ms polling are independent behavior and are not source-fidelity evidence. Other original popup marker-specific browser chrome consumers also require an explicit audit; app-popup creation alone does not prove their parity.

No setup/unlock success, onboarding completion, configured state or permission is fabricated. Actual supplied Agent UI handles its own actual authentication/onboarding/Vault flow and errors. No shared Chromium source, GN/registration, profile data, OS authority or runtime state was touched.

Three-file patch replay and every baseline/output SHA pass in a disposable filesystem tree. Compilation/native UI observation remain pending integrator serialization; `manifest.json` pins actual read-only native189 source. The complete source/decompile/raw-disassembly evidence inventory is in `source-evidence.json`.
