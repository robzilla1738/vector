# Complete the recovered sidebar motion lifecycle

The v522 empty 280-DIP sidebar is a lifecycle failure: recovered hover dispatch writes persistent controller hover width 1, but the earlier collapse port omitted the supplied controller's normal collapse/expand dispatch and its retained-to-docked clear. Admission can then settle collapsed and hide its body while layout still expands an empty overlay from the stale hover value. Changing only endpoint geometry cannot fix that cycle.

The already pinned `../native-profile-preview-admission/collapse-change.asm` supplies the missing instructions:

- 46494e0..46494e8 selects the region SlideAnimation transition. Immediately afterward, 46494ec..4649584 resolves the browser animation controller, 4649588..46495a4 selects e87b298/e87b2a0 (Expand/Collapse), and 46495b0..46495c4 starts it in group e87b290. The source uses BOTH owners, for distinct effects.
- Retained promotion clears flags at 4649624..464962c and hover timers at 4649634. At 46496f0..4649704 it gets group e87b290 and invokes group cancellation with clear=true (w1=1), BEFORE resetting the region slide to 1 at 4649710..4649714. The typed equivalent is `Clear(group)`, not `Reset(group)`: Reset would snap/persist the very hover values that need discarding.
- The motion identifiers and binary provenance are pinned independently in `../native-hover-timing-audit/README.md`. Original binary SHA-256 is 64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c.

The proposal restores these two effects through the region's actual controller delegate. Admission weak-pointer checks cover synchronous callbacks from both operations. The existing typed initial Reset is no longer skipped for Aux, so the controller begins in the actual initial target state. The observer continues invalidating the frame but leaves admission's real SlideAnimation responsible for collapse state and completion. No new animation, timer, duration, curve, or source state is introduced.

The layout adapter additionally admits persisted hover values only while retention, hover expansion, or a real hover motion is present. This is an integration guard, not a newly decoded instruction. It prevents persisted values from manufacturing an overlay after its actual source owner has cleared. Active collapse geometry and all retained reveal/retraction interpolation remain unchanged.

The earlier native-profile-preview-admission advice to remove the browser controller as a second oracle was too broad; its state callback must not supersede admission, but the source's companion frame motion is required. The earlier retained-hover-motion description also omitted the normal collapse controller dispatch; this evidence corrects it.

Five exact v522 preimages/outputs are recorded in files.json. Patch replay and output hashes were checked in disposable files only. No native checkout, build, app, profile, signing, or credentials were changed. Integrator should compile and observe repeated expanded → collapsed → hover reveal → dock → collapsed cycles, including mid-animation reversal. Actual pointer movement is required for hover observation: edge-click failed to reveal the supplied Aside app too, and is not a valid hover test. Hidden AX descendants are likewise not a parity criterion.
