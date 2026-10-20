# Retained collapse visibility

The supplied expanded reference (001-new-tab-default.png) has the collapse control in the sidebar header; its collapsed focused-address reference (134-browser-address-bar-focused.png) has that control in the toolbar. The actual v499 preview exposes both simultaneously because the toolbar action adapter only applies the globally visible action state.

Project the actual vertical mode and collapse state into the toolbar copy after each existing native action update. Expanded mode keeps the real sidebar-header control; collapsed/collapsing mode retains the existing toolbar action and its pointer-retention callbacks. Horizontal mode has no disabled sidebar button in the toolbar. No new observer, duplicated action, preference override or owner-profile operation. Root combines and compiles this one-file preimage-pinned patch.
