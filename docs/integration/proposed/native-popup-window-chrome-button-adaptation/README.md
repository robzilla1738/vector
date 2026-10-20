# Popup standard-button adaptation and non-popup behavior preservation

Immutable followup to `da292e49c`, **apply after** `native-popup-window-chrome`. One existing remote_cocoa implementation file; no native apply, build, UI/OS operation or runtime observation.

The original does **not** tolerate missing standard buttons: original4381324 branches to4381398 (`brk #0`) for a nil button;4381340 similarly rejects a different native button class. That is positively pinned by the parent's `frame-state.asm`. The initial proposal inherited the same assertion from current155. It would be wrong to describe the original as nil-safe.

The current AppKit SDK explicitly declares `-[NSWindow standardWindowButton:]` nullable. The source-defined0x8003 popup style excludes Miniaturizable and Resizable. We have not created a window to establish whether those buttons are absent on this host, and do not claim an observed crash. The followup explicitly adapts **only the new popup-state loop** to skip absent buttons. It neither manufactures replacements nor changes a button's identity. For existing buttons it preserves the original real-class check, alpha/hidden/enabled/reveal and layout behavior. This is a disclosed current-platform integration change, not purported original nil handling.

The pre-existing non-popup `maybeShowTrafficLights` branch is restored byte-for-byte after removing the single new explicit-popup dispatch prefix: it retains its original nil/type assertions and **only** alpha/reveal operations. It never calls the popup-only hidden/enabled/cell-update loop. The new layout hook updates only explicit popup state and therefore does not add a new normal-window layout effect. Current stock normal-window behavior is preserved while source popup state still survives real native layout/reveal.

No creation/style/auth policy changes here. Parent baselines and outputs are pinned; `verify.py` checks the original nil-failure assembly, SDK declaration/hash, byte-identical stock non-popup body and disposable single-file patch replay from the parent's exact staged output. Native compilation and actual AppKit popup behavior remain root-owned and unverified.
