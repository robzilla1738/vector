# Separate-window profile session recovery

Pinned native v607. This is an explicit Chromium155 integration adaptation using the existing SessionRestore owner. It does not claim that the supplied stripped binary proves this exact multiwindow disposition.

## Evidence and behavior

The supplied recovered inventory attributes 04559f80 to `SwitchProfileInPlaceForAside`, `ScheduleSessionRebuildAfterAsideProfileSwitch`, and stash/restore fallback; its actual decompiled function calls the workspace constructor 0455cfec. It establishes distinct profile workspace ownership, not permission to flatten several saved windows into one. The recovered session-restore unit anchors (031cbd80 and 03417c64) do not establish an exact custom multiwindow admission policy. Current155 `SessionRestoreImpl::ProcessSessionWindows`, `CreateRestoredBrowser`, and `RestoreTabsToBrowser` already preserve each saved window's profile, tab order, selected tab, pinned state, groups, splits, bounds, workspace, title and native show state. This proposal reuses that machinery.

One saved normal window continues to restore into the exact hidden cache for the existing in-place transaction. Multiple saved normal windows instead restore into separate real windows under the selected target profile. The hidden cache remains empty; the source window retains its profile and actual tabs. The original saved active window is activated by the restorer, and request completion focuses the most recently active genuine recovered target window. A one-time native message explains why separate windows appeared. No tabs are merged, stolen from a live target window, or transplanted into the source.

Repeated selection from the same source focuses an existing recovered target window rather than creating another NTP or repeating recovery. Once the user has closed those windows, the normal new-workspace path is available. A direct transaction cannot consume the separately-restored state. Popup/app mixtures and malformed nonempty session groups remain refused with precise recovery guidance; original session files are preserved by the existing admission read until actual accepted restoration begins. This does not expand the underlying encrypted-backend cleanup guarantee.

## Async and recovery safety

Before the asynchronous read can create any tabs or windows, a once-only admission callback rechecks the source window/profile/generation, shutdown/close state, target lock, and whether another nonempty target window appeared during the read. Superseded or interrupted requests return cancelled, reset the empty cache to not-started, and never display stale request feedback. Read errors remain blocked rather than overwritten. Normal restorer lifetime, profile keepalive, completion delivery and native window creation remain unchanged. Activation callers re-resolve weak destination identity before touching its view; source close guards apply to separate-window completion.

Crash-ack/save policy is unchanged. The existing restorer's completion notification and native window/tab observation decide when recovery permits saving. This is multiple-window recovery, not adoption of several workspaces by one source window.

## Validation

All replacements count-checked; exact baseline/output SHA256 pins; seven-file patch replays in an isolated temporary tree. Bounded independent review caught an activation callback lifetime hazard, corrected by consuming the notification flag before activation and re-resolving the destination afterwards. No native/shared mutation, build, runtime, owner profile or credential access occurred in this lane.

Integrator: focused compilation of session_restore, aux_profile_switch_workspaces, request and transaction; then one disposable two-window recovery with different selected tabs. Confirm source window unchanged, two target windows with separate tabs/selections, repeat selection produces no duplicate window, and normal quit/relaunch retains them. Include one cancellation during async preparation if observable without a broad test suite. Actual application acceptance remains pending.
