# Restore the supplied Agent toolbar action producer

Root observed actual Aux533 has no visible Ask Aux toolbar action, although Alt–Shift–B opens its real supplied panel. The original Aside toolbar has the real extension action with Ask Aside tooltip. This proposal restores its source-owned automatic pin and title using the existing native extension-action model/view; it adds no new independently rendered button, fake session or account.

## Original source

Original `02d25d20` first checks the owner's off-the-record flag, then matches the exact original Agent ID. It reads the real `extensions.pinned_extensions` list, searches for that ID, and only when missing appends it and writes the same preference. Its optional active-model branch invokes `07627030(model, extension_id, true)`. The subsequent separate Vault branch is not ported. Both raw instructions and retained supplied decompilation are pinned.

Original `041ef70c` is the toolbar-action state updater: it gets the actual active WebContents, reads the action's actual extension ID, and for Agent replaces the title with UTF16 `Ask Aside` and clears the ordinary status subtitle. The supplied action constructor `041ef9b4` likewise checks Agent and sets the explicit `Ask Aside` tooltip. This supports the narrow Aux title/accessible-name adaptation; it does not justify replacing the actual action image with a new icon.

## Actual155 integration

`ToolbarActionsModel`'s real action list is populated from enabled extension actions. The proposal appends the actual Aux Agent ID to the genuine pinned-extension preference only when the action exists and the profile is not off the record. This occurs during initial model population and an actual Agent extension-load notification. It preserves list order and existing pins; no duplicate is added, no Vault action is introduced, and unrelated extension loads do not repin it. Existing preference notifications update the real toolbar model, preserving Chromium's native lifetime/extension eligibility behavior. It does not force an entry into an off-the-record model or synthesize an installed action.

`ToolbarActionView::UpdateState` keeps the actual renderer, icon, controller and callbacks and supplies the source-owned Ask Aux accessible name/tooltip for that exact action only. Other extension names/tooltips are unchanged. The code is guarded by `ENABLE_AUX_BROWSER && IS_MAC`. No packaged resource bytes change, so this native-only correction does not require changing the signed resource cache.

The source-proven Command–E entrypoint is the separate `native-supplied-ask-shortcut` proposal. It toggles the actual Agent SidePanelUI key. This toolbar patch does not reroute the extension action through a fabricated command: its supplied background action handler remains the actual owner.

The original action's additional rounded renderer details and panel-open suppression are not claimed complete by this two-file producer slice. Root's actual observation that the reference action disappears while its panel is open remains a specific source/lifecycle comparison for the next bounded follow-up; no guessed visibility condition or side-panel observer is introduced here.

`manifest.json` binds the actual current native preimages (these two files unchanged from533), complete output hashes and counted replacements. `python3 verify.py` passes hash/count replay and disposable patch application. Root owns compilation and live toolbar presence/click/close/reopen observation. No shared-native edits, build, stage/package/signing/runtime/owner-profile or OS operations were performed in this lane.
