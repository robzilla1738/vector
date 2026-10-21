# Keep private native workspace caches out of Window menu

Pinned current native608 (packaged app609). Positive private cache windows are created with BrowserWindowInterface TYPE_NORMAL and a real titled NSWindow, retained to hold tabs and per-owner restore state. The native factory did not exclude this role from AppKit's automatic Window menu. The menu builder assigns NSApplication.windowsMenu and does not filter window entries. Local macOS SDK NSWindow.h exposes the existing excludedFromWindowsMenu property.

Set that property only during native creation for is_aux_profile_switch_cache. Real user windows, including all independently restored normal windows, are unchanged. No title-based matching, close/delete, tab movement or session mutation. Closing a cache merely to remove its menu item would discard its separate-recovery readiness state and could alter repeat-selection behavior; retaining it is intentional.

The actual609 Window menu showed two additional New Tab entries after separate recovery. Source supports hidden-cache leakage as a concrete defect, but menu text alone does not prove each observed item's identity. Root should verify the menu after integration and independently confirm the expected three genuine visible windows. This patch does not remove genuine empty user windows.

Validation: count-one replacement, preimage/output SHA256, isolated patch replay. No native/shared mutation, build, UI or profile access. Compile browser_native_widget_mac.mm; actual menu acceptance remains pending. This is a native platform integration correction, not a claimed decoded Aside selector override.

## Actual v610 bounded verification

The integrator initially observed five Window menu entries where three windows were expected. Subsequent read-only evidence establishes eight native browser owners: the two explicit-switch persistence lines report `windows=4 caches=2 tabs=3` and `windows=4 caches=1 tabs=6`, both with `service=1 saving=1 crash_ack_pending=0`. Thus there are **five non-cache windows plus three private caches**, matching the five menu entries without cache leakage. The actual separate-restoration result was enum4 (`kRestoredSeparately`). The integrator independently verified that the original source window's tabs remained intact; switching a recovered window uses that window's own profile workspace and does not take the original source's tabs.

A bounded session framing inspection read only file header, command IDs, SetTabWindow/SetWindowType integer associations and close-command integer removals; navigation/title payloads were skipped. Every retained Person1 cleartext file already represented three one-tab windows. Default's two older snapshots represented two windows and the newest three. These are unique surviving associations, not a count of validated restored navigations. Both profiles also have encrypted files, whose contents were not decrypted or inspected. See `actual-v610-count-evidence.json` for exact aggregate output and limitations.

This supports accepting the native Window menu exclusion: five genuine non-cache windows explain five entries. It does not justify removing any window based on New Tab title, nor establish how each older saved NTP window originated. No cleanup, native change or further build was performed during this inspection.
