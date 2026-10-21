# Genuine action-backed Aux command routes

The actual574 diagnostic reported `route=window browser=1 supports=0 enabled=0 actions=1` for Ask. The active155 `CommandActionUpdater` supports only command IDs declared in the shared action-ID macros, finds their real per-window ActionItems, and applies enabled state/execution to those items. Existing Aux legacy initialization attempted to update34068/34067, but neither had a mapping or an ActionItem. Those updates therefore had no effect. This proposal corrects that actual integration rather than overriding validation or disabling the action feature.

## Bounded command audit

| Supplied browser shortcut | Actual command | Before / correction |
| --- | --- | --- |
| Toggle Sidebar |34061 | Existing mapped and registered collapse action; unchanged. |
| Search tabs |52500 | Existing mapped/registered TabSearch action and real normal-window update; unchanged. |
| Ask Aux |34068 | Adds normal `kActionAuxAsk` mapping and per-window ActionItem. Callback uses the same real Agent extension SidePanelUI Toggle/key/trigger as the existing legacy command. |
| New Task |34067 | Adds normal `kActionAuxOpenNewChat` mapping and ActionItem. Callback invokes existing `aux::OpenNewChat`, which checks actual normal-window/Agent eligibility and resolves the account through the authenticated supplied daemon. |
| Copy URL |34071 | Existing mapped and registered native CopyURL action; unchanged. |
| Split side by side |34057 | Existing mapped/registered native NewSplitTab action; unchanged. |
| Split stacked |34066 | Existing mapping, but ActionItem and legacy execution were gated only by ENABLE_AUX_SHELL. Adds an Aux-browser-only real native Stacked split action/legacy case using155 NewSplitTab(kStacked), with the same normal-window/tab state and active-unsplit-tab checks as side-by-side. The old shell path remains exclusive/unchanged. |

MiniPopup34069 is deliberately not a browser action; the existing real global owner remains authoritative.

The supplied1852 shortcut hook is authority for command IDs/defaults. This is an actual155 action-framework integration, not a claim that the new native ActionItems or stacked155 adapter are recovered original C++.

## State, execution and lifetime

- New ActionItems begin disabled. The existing BrowserCommandController initialization/update owners now use its established UpdateCommandAndActionEnabled helper, mirroring the same previous Ask/NewTask state in both legacy/action modes. No new unconditional enabled override or SupportsCommand fallback is introduced. The existing `IsCommandEnabled(IDC_AUX_OPEN_NEW_CHAT)` eligibility check remains intact.
- Stacked split state is updated beside the existing real side-by-side state, after the same lock/no-active-tab early returns. Invocation rechecks actual normal browser type and live active unsplit tab. It creates a genuine native split, not a successful-looking stub.
- Callbacks bind only the stable browser interface owned by the existing per-window action graph. They look up current profile/panel/tab state at invocation; no account or profile snapshot is fabricated. New Task retains its existing authenticated-account failure behavior.
- Action callbacks invoke concrete consumers directly, avoiding recursive ExecuteCommand→ActionItem→ExecuteCommand dispatch. The actual CommandActionUpdater/BrowserCommandController execution checks remain before invocation.
- The new action IDs follow the standard shared macro migration path; the generated command map automatically receives them. There is no hand-written second mapping registry. No menu/widget/pin/tooltip styling is changed and no new menu item is inserted. Existing Ask diagnostics are preserved for final actual confirmation.

## Files and integration

Four actual576-pinned outputs: chrome_action_id.h, browser_actions.cc, browser_command_controller.cc and UI BUILD.gn. browser_actions_impl gains only a Mac+Aux direct dependency on the existing aux:platform interface for the real Agent ID header. Its existing :ui dependency already owns aux_chat_navigation.h and the actual navigation implementation. No new source target, public API or startup registration is needed.

Focused objects: browser_actions, browser_command_controller and command_action_updater (the shared action-ID header affects its generated map), then the normal native relink. The public action-ID header may invalidate other standard consumers; no extra broad test suite is requested.

## Verification

`python3 verify.py` checks exact input/output hashes, unique counted anchors, complete patch replay, and all seven supplied browser IDs' standard mappings/action registrations. Supporting current owner declarations are pinned in source-evidence.json. No native build, app/menu operation, AI request, profile/credential/OS access, feature disable or shared checkout edit was performed. Root should verify the preserved diagnostic becomes supported and that actual CmdE/View→Ask toggles the existing supplied panel; New Task and split behavior still require their genuine profile/tab/account conditions.
