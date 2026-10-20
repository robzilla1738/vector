# Original Chats header context menu and native actions

Requires bdb8def36 bulk transport and L4 **44c82257e** generic native confirmation export. Four bounded deltas on actual333 common/Chats components plus two new native files; no shared source mutation, native build or runtime acceptance.

Original462fb38 creates exact commands2100 `Mark all as read`,2101 `Archive all chats`, separator,2102 `Show all chats` using SimpleMenuModel/MenuRunner flags9. Original463981c enables these independently of a per-chat selection. Original46398c8 first retires runner/model and then dispatches the chosen effect. The source labels and confirmation are pinned as exact UTF16 bytes.

`AuxChatsHeaderActions(browser, transport)` owns the real profile-scoped native menu, generation-checked posted teardown, and actual action paths. Mark all read invokes the existing private HTTP lifecycle. Archive all uses the **same original native NSAlert primitive** as Bookmark confirmation via ShowAuxNativeConfirmation, with exact original title/body/Archive/Cancel labels. Only actual accepted result triggers the real bulk POST. No new confirmation UI or checkbox is invented.

The header's Show all chats opens original canonical `main.html#/u/N/tasks` through the actual browser PageNavigator after installed-Agent verification. This differs intentionally from the separate row's Show all action, whose original route includes `?view=list&filter=all&order=desc` and reuses a matching tab.

The shared section header gains an explicit View+MouseEvent context setter so it preserves the actual source right-click anchor and position. Existing closure constructor consumers, including the genuine Bookmark wrapper (which has no secondary callback in source), stay compatible. Chats passes the real event to its new `Actions.section_context` signature. Its left-click expansion action remains unchanged.

Root GN: add aux_chats_header_actions.{h,cc} beside existing Chats components. Continuing genuine coordinator binds its ShowContext to the section and Retire to actual profile mutation/teardown; this proposal does not retire or replace the approximate body by itself. Pure temporary six-file replay and original source/literal pins pass.
