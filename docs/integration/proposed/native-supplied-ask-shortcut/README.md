# Restore the supplied Ask Aux keyboard entrypoint

Actual native533 has no command34068 or Command–E accelerator. Root observed Command–E do nothing on the owned Aux webpage while the genuine extension action opened the supplied panel. This proposal restores the original native entrypoint, without changing the packaged UI or creating a session/account.

## Positive original producer and consumer

The exact supplied Mac accelerator row at `0xcef735c` is `148500001000000045000000`: command34068, modifier16 (`EF_COMMAND_DOWN`), key69 (`VKEY_E`). The following row is the already ported Command–Shift–E New Task34067. Both raw rows are pinned.

Original command dispatcher `4561570` subtracts34000 and indexes the signed-offset table at `d6e1844` relative to PC `4561644`. Slot68 is pinned and resolves exactly to `4562f10`. That branch obtains the actual active WebContents, copies the original Agent extension ID at `ce48949`, and calls `40df6a8(BrowserWindowInterface*, active_contents, extension_id)` at `4562f80`. The retained decompilation independently identifies case `0x8514`; raw instructions/table bytes are authoritative.

The helper first activates the supplied WebContents if it is different from the current active tab. The command's caller already supplies the current active contents, so that branch has no effect for this keyboard path. It then retrieves the actual window-owned interface through key `e85d7d0`; its pinned chained pointer names `SidePanelUI::kDataKeyImpl` at `da50a7d`. It constructs an extension entry key at `40df76c..778` (original entry kind23 plus actual extension ID) and invokes that interface at `40df7ac..7c0` with the typed key and trigger18. In actual155, `SidePanelOpenTrigger::kExtension` remains18. Original enum23 is adapted by name to `SidePanelEntryId::kExtension`, rather than assuming enum numeric compatibility.

The original interface method spelling is stripped. Root corroborated its exact behavior in the supplied Aside app: Command–E closes the existing panel; a second press reopens the same actual sidepanel route/context; a third closes it. The actual155 public `SidePanelUI::Toggle(SidePanelEntryKey, SidePanelOpenTrigger)` is the corresponding existing owner and lifecycle. The adapter uses that window's real `SidePanelUI`, Agent entry and supplied renderer; it does not execute an alternate extension action or navigate to a full-page chat route.

## Bounded port

Three files add the original command ID, actual Mac accelerator, command registration and handler. The handler is guarded by `ENABLE_AUX_BROWSER && IS_MAC`; the Mac accelerator is under the existing Aux-browser guard. It uses the real window's current panel registry. If no matching actual Agent entry exists, existing `Toggle` behavior controls availability; there is no manufactured entry, session, account, provider list or authorization. Other command/extension behavior is unchanged. No new sources or GN changes are required.

`manifest.json` pins exact533 baseline/output hashes and every replacement count; `native.patch` and complete proposed outputs are replayable. `source-evidence.json` pins bounded raw ranges and all retained disassembly/decompilation records against the already inventoried original thin binary SHA. `python3 verify.py` passes count/hash replay and disposable patch application only. No native/shared edits, build, staging, signing, browser execution, profiles, credentials or OS operations were performed by this lane.

Integrator checks: compile the command controller and Cocoa accelerator object; in a real normal profile on a webpage press Command–E twice, preserving actual current panel session/context and resize width across close/reopen. Command–Shift–E must still open the supplied New Task route; Alt–Shift–B must retain the original extension action behavior. Actual provider/model/project operations remain separate live acceptance.
