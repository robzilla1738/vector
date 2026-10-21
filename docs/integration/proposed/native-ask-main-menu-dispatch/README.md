# Route Cmd+E through the actual Cocoa menu command

The integrator verified v560: clicking Ask Aux opens the real panel, while Cmd+E remains a no-op. Earlier non-menu registration and reserved-command handling were therefore insufficient; they did not remove the existing AppKit main-menu key equivalent. BuildEditMenu still bound Cmd+E to copyToFindPboard: (Use Selection for Find).

For Aux normal browser menus, keep Use Selection clickable but clear its key equivalent. Install Ask Aux in the actual View menu with the same commandDispatch: selector, IDC_AUX_ASK tag34068, and Cmd+E. MenuCommandForKeyEvent now resolves the actual main-menu item directly, and both AppKit's menu route and Chrome's reserved route reach the existing tested panel toggle. There is no event swallowing, new panel instance or second command implementation. PWA menus and non-Aux builds keep their former shortcut.

One source file pinned to actual v560. Disposable patch replay/output SHA passed. No shared native edits or build by this lane. Integrator must verify the real Cmd+E press opens and closes the panel; source registration alone is not accepted as runtime proof. Exact View-menu placement is the minimal native155 integration, not a claim of recovered Aside menu order.
