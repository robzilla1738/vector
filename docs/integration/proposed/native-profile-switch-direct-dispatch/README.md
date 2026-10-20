# Direct selector dispatch

Apply after `native-profile-switch-async-owner` (b78b7cc01). This extracts the original common load-and-switch helper from the preview owner's stateful `Start` wrapper. `ProfileSwitchRequest::Dispatch(weakSender, ownedPath, optionalCompletion)` has no pending/loading state; the direct menu passes no completion, exactly as original04572824→040fe7a4. Consequently a null-load callback dropped by actual `LoadProfileAsync` cannot permanently disable future direct selections.

The existing preview `Start` still requires its real completion, restores actual borrowed views and retains the original pending/loading behavior. Its loaded callback remains independent of preview lifetime. Successful dispatch runs the actual same-Browser core and activates that window; neither a loaded Profile nor a missing completion is treated as success.

Evidence: `native-profile-switch-owner/transaction-map/profile-menu-dispatch.md and its pinned profile-menu-*-original.txt excerpts` from c5e8bd47e; original direct row dispatch04572898, null-sender tail45728d8 and preview4658510 all use common040fe7a4. The record preserves the supplied static binary hash and bounded instruction excerpts.

Verification: exact patch replay against the two pinned b78 outputs in a disposable tree. No shared source writes, native compile, app execution or runtime acceptance. No new GN entries; the original request module registration is reused.
