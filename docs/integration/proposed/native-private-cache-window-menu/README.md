# Keep private native workspace caches out of Window menu

Pinned current native608 (packaged app609). Positive private cache windows are created with BrowserWindowInterface TYPE_NORMAL and a real titled NSWindow, retained to hold tabs and per-owner restore state. The native factory did not exclude this role from AppKit's automatic Window menu. The menu builder assigns NSApplication.windowsMenu and does not filter window entries. Local macOS SDK NSWindow.h exposes the existing excludedFromWindowsMenu property.

Set that property only during native creation for is_aux_profile_switch_cache. Real user windows, including all independently restored normal windows, are unchanged. No title-based matching, close/delete, tab movement or session mutation. Closing a cache merely to remove its menu item would discard its separate-recovery readiness state and could alter repeat-selection behavior; retaining it is intentional.

The actual609 Window menu showed two additional New Tab entries after separate recovery. Source supports hidden-cache leakage as a concrete defect, but menu text alone does not prove each observed item's identity. Root should verify the menu after integration and independently confirm the expected three genuine visible windows. This patch does not remove genuine empty user windows.

Validation: count-one replacement, preimage/output SHA256, isolated patch replay. No native/shared mutation, build, UI or profile access. Compile browser_native_widget_mac.mm; actual menu acceptance remains pending. This is a native platform integration correction, not a claimed decoded Aside selector override.
