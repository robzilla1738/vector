# Retire a selected-file owner only after original context is empty

Follow-up to `70073e84b`; apply after its callback-lifetime patch. Four files, nine count-checked replacements. No upload cancellation, token clearing, source-context consumption, sticky-flag reset or UI change.

The previous file selector remained blocked after any selection for its entire LocationBar lifetime. Clearing context did not reconstruct it. This proposal admits its inert source-tab/edit-model references only after the LocationBar has checked **all** original context owners:

- AIM popup hidden/renderer-reset generation acknowledged, live composebox idle, controller file records empty, uploaded/submitted tokens empty, persisted tab context and previous turns empty (`OmniboxPopupUI::CanRetireAimForAuxProfileSwitch`).
- Classic popup/presenter/WebUI idle and native omnibox input/autocomplete settled.
- The actual window's `SearchboxContextData` exists and has no pending context handoff. The new getter only observes the owned pointer; it never calls `TakePendingContext` or destroys context.
- Selector read/context-handoff callback count is zero, no dialog/blocker or weak callbacks remain, and no registered external chooser callbacks remain.

The selector check moves after the other LocationBar checks. Its explicit `context_owners_settled` argument defaults false for every other caller. Only that guarded LocationBar path supplies true. When true, selected source references may be destroyed normally by the existing BeginAuxProfileSwitch reset; those references are not work once the original owners above prove empty. Historical flags remain unchanged. Missing context owner, retained completed file records, any session history, open UI or pending callbacks still reject.

Original explicit DeleteContext/ClearFiles/clear-session paths own removal of files and context. This change does not force them to clear and does not promise every "close" is equivalent to clearing: preserve-context close and retained previous turns continue to block. It removes the unconditional selected-file dead-end once actual original ownership has been released.

Verification: generated exact before/after hashes; selector baseline is the prior proposal's output, other inputs match v607 (new context header matches upstream HEAD). Replayed the composed delta against isolated baseline copies and passed git apply --check; no shared native edit/build/runtime. Actual-app acceptance should select a disposable attachment, observe busy while reads/context are live, explicitly clear it and dismiss the popup, then switch profiles after existing renderer/native acknowledgment. Confirm retained attachment/context still refuses.
