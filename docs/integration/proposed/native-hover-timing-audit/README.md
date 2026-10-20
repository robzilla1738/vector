# Original hover timing audit: current constants match

Read-only static audit after restoration of the missing hover-controller dispatch. No new native patch or build is needed: the supplied generator uses the same hover duration and tween selectors as the current Chromium155 generator.

Pinned original framework SHA-256: `64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c`.

| Transition | Original instructions and values | Current155 |
|---|---|---|
| Hover reveal | `7704a2c..7704a58`, motion e87b2a8; x1 = 0x3d090 =250000 microseconds; w2=8 | 250ms, EASE_IN_OUT_EMPHASIZED=8 |
| Hover retract | `7704b0c..7704b38`, motion e87b2b0; x1 =0x30d40 =200000 microseconds; w2=8 | 200ms, EASE_IN_OUT_EMPHASIZED=8 |
| Opacity fade-in | `77049ec..7704a10`, segment starts0, ends0x186a0=100000 microseconds; tween1 | First100ms, EASE_OUT=1 |
| Opacity fade-out | `7704acc..7704af0`, starts0x186a0=100000us, ends0x30d40=200000us; w27=16 from7704804 | Last100ms, FAST_OUT_LINEAR_IN=16 |

The original motion names are independently pinned by the provider constructor: `2a70dbc..2a70dd4` attaches original string da870de (`ExpandOnHover`) to e87b2a8; `2a70dd8..2a70df0` attaches da870ec (`CollapseOnHover`) to e87b2b0. The adjacent group e87b290 is registered as `TabStrip.Vertical`. This matches the actual region dispatch at4650c50..4650c8c and frame consumers previously recovered.

Current source comparison: `chrome/browser/ui/views/animations/tab_strip_animations.cc::GenerateAnimations()` and `ui/gfx/animation/tween.h::Type`. The original generator range and comparison snapshots are hashed in `source-evidence.json`.

## Limits

The original curve selector numbers and durations are directly decoded, and they match current enum values. The original cubic evaluator's control points were not independently disassembled in this bounded check, so this is not a claim of bit-for-bit evaluator identity. It also does not establish every interruption, opacity composition or retained-lifetime effect; those require the restored real path's live observation. No difference in the decoded constants justifies another timing patch.

Only static files and the supplied binary were read. No target execution, native checkout mutation, build, profile access, signing or release occurred.
