# AIM close proof separated from live native work

Source-only v594 follow-up. Three files/seven count-checked edit anchors. No shared source edits, runtime or build. Patch applicability and exact before/after hashes checked. UI/CSS/Mojo signatures remain unchanged.

## Fixed static failure

The prior close callback cached the conjunction of renderer reset and native idle. A legitimate native query/navigation/upload still completing at close made that one response false forever, even after the owner settled. It required a redundant open/close to retry.

The renderer now uses the existing searchbox reply strictly as an ordering acknowledgment behind the original clearFiles/stopAutocomplete messages. Its response proves only renderer reset: no pending context actions, submission, voice/context menu, text, attachments or uploads. The AIM caller still validates closed generation and rejects intentional preserve-context state. The transient native-idle value is deliberately not cached as renderer proof.

The four existing renderer async action counters now notify actual completion waiters. The close-proof request waits for their real completion and then rechecks after the same-pipe acknowledgment; no polling, timeout success, forced cancellation or ignored pending work. If an action adds retained context, the final empty-context predicate rejects. Reopen/new-context generations remain rejected by the existing AIM generation check.

C++ records `aux_renderer_reset_complete_` after source draft restoration and the matching hidden generation. It releases only the clear callback's source-tab weak reference. Native requests retain their existing owners/source lifetimes. Admission STILL requires `ui->CanRetireAimForAuxProfileSwitch()` freshly on every check, plus all original pending callbacks and presenter/LocationBar/file-selector guards. Thus native work can settle later without permanently losing renderer proof, while genuinely active work continues to reject switching. Show/Clear invalidates the proof as before.

Unchanged conservative boundaries: intentionally preserved sessions, nonempty previous turns/persisted tabs, file selector's cold-only lifecycle, Drive object-presence guards, and native pending query/navigation/upload/picker/permissions. This patch does not claim these other cases are accepted.

## Required integrator check

Compile the changed native and TypeScript targets in the normal combined build. One bounded actual close-then-switch check is sufficient absent an observed failure; ideally include a transient native completion between close and switch to exercise the fixed state distinction. No paid inference or broad UI retesting is warranted. Current evidence is source-only, not runtime success.
