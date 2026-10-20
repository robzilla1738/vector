# Per-chat native Delete confirmation

Status: proposed only, not applied or compiled. This fixes a concrete presentation mismatch in the genuine Chats context action; it does not establish complete sidebar parity.

The supplied menu completion at original `0x463a968` calls `0x4216dfc`, whose wrapper calls the native confirmation primitive `0x41523f0`. Its UTF-16 labels are exactly **Delete chat?**, **This will permanently delete this chat and its messages.**, **Delete**, and **Cancel**. The warning type is1; no checkbox is requested. This is the same primitive already ported for Bookmark deletion and the Chats bulk confirmation.

Original completion `0x466f8d0` checks its real weak owner and compares the confirmation result to1 at `0x466f96c`. Only that result and a nonempty captured chat ID dispatch the real `delete` request. The patch preserves the current actual transport, menu teardown, captured ID, weak owner and profile-current guards. Cancel/Escape, owner retirement and a stale profile cannot dispatch deletion. Rename continues using its separate original DialogModel path.

The existing `ShowAuxNativeConfirmation` owns the actual NSAlert, parent-sheet/modal selection and one-shot completion. Its original native return1000 becomes the accepted boolean. This proposal does not change that primitive or invoke it during verification.

## Integration

Apply `native.patch` with the exact single-file baseline in `manifest.json` after the current v394 build finishes. The staged `source/` output is provided for exact replay comparison. No Body/Region changes, registration, new sources or GN dependencies are needed: the current `chrome/browser/ui/BUILD.gn` already lists both `aux_chat_actions.cc` and `aux_bookmark_confirmation_mac.mm` in the enabled Aux Mac source group. Root should compile the changed ChatActions object and observe the actual sheet later in the disposable candidate; no native build or UI interaction ran in this lane.

Run `python3 verify.py --native-root <read-only Chromium src>` for scoped baseline/patch/output/source evidence verification. It applies the patch only in a temporary directory. Assembly is retained from bounded LLVM reads of the pinned supplied arm64 binary; no target execution or owner state is involved.
