# Agent panel alongside toolbar with vertical tabs

V520 confirmed that selecting `kToolbar` on the actual bundled Agent entry was insufficient: Chromium155 initializes `force_top_container_to_top` to true for every non-horizontal tabstrip. The panel consequently remained below the toolbar, contrary to the owner's supplied screenshot.

This followup permits the existing toolbar-height layout path only while the actual bundled Aux Agent entry is current and the tabstrip is vertical. It resolves the current entry through SidePanelUI's actual key, so unrelated extension/native panels retain their layout policy. The existing content-type and narrow-window width checks still apply. No geometry constants, replacement UI, account bypass or renderer changes are introduced.

Baseline pins include the staged v521 native-hidden-sidebar-visibility patch. Both prerequisite and this patch applied to disposable copies successfully. No native checkout modifications or compilation were performed. Integrator should verify normal width, narrow width, panel close/reopen, tab change and third-party panel behavior. Source basis is the supplied panel's observed toolbar-row placement; this is a Chromium155 layout adaptation, not original recovered C++.
