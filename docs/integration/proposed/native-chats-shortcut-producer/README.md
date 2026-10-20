# Genuine Chats shortcut producer

Original region `37e220c..2254` looks up command `0x8513` (34067), formats its actual native accelerator, and passes that help to the normal New Chat button. The supplied Mac `AcceleratorsCocoa` table contains the exact 12-byte entry at `0xcef7368`: `138500001200000045000000`, or `{34067, 0x12, 0x45}`. Its constructor reads that table at `1c6c134..144` / `1c6c1f4..f8`. Those fields are **Shift–Command–E**, using actual `ui::EF_COMMAND_DOWN | ui::EF_SHIFT_DOWN` and `ui::VKEY_E` in155.

Current Aux already preserves `IDC_AUX_OPEN_NEW_CHAT ==34067` and its actual command handler. It is absent from the current Mac accelerator table. This patch restores that native mapping under `ENABLE_AUX_BROWSER`, and exposes `aux::GetNewChatShortcutHelp()` in the existing Chats controller files. The helper uses the actual155 default accelerator lookup and `ui::Accelerator::GetShortcutText()`. No hardcoded translated/platform-specific label or fallback chord is invented; a missing platform mapping produces no help, like the original caller.

Root-owned integration: in `AuxSidebarBody::Build`, replace the `std::u16string()` constructor argument for `AuxChatsController` with `GetNewChatShortcutHelp()`. The body already includes `aux_chats_controller.h`; no GN change is needed. Root owns that source and it is deliberately absent from this proposal.

**Visible presentation remains a separate concrete gap:** original `4244850..4a44` creates a noninteractive Label at normalbutton+638, copies the actual main-label font and applies role226 RGB with alpha0x99. The current `AuxNewChatNormalButton` only stores help in its accessibility description. Supplying this help fixes the actual producer but does not claim the missing visible Label/layout is complete. The selected New Chat tab-row does not receive this original setter call.

`python3 verify.py` verifies the pinned actual385 source baselines and independently replays the three-file patch. No native build, shared-native mutation, runtime input, owner data or network operation was performed.
