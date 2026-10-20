# Remaining original swipe admission state

Static checkpoint for `464c540`, extending `profile-scroll-admission.md`. No input activation or native source changes.

- Region `+a08` is the actual `is_expanded_on_hover_` intent. Original `4650a04` writes its bool argument there, records the exact `VerticalTabs_ExpandOnHover_Show`/`VerticalTabs_ExpandOnHover_Hide` actions and `Tabs.VerticalTabs.ExpandOnHover.ShowDuration`, then starts the actual expand/collapse-on-hover motion. This matches the supplied upstream `AnimateExpandOnHover(bool)` effect chain.
- `+a0c` is a **distinct retained hover-layout latch**, a descriptive name rather than a recovered original C++ identifier. It is set before hover/focus expansion (`46505a4`, `465ac00`), participates in expanded layout sizing, and remains set after the intent turns false until `4650970` settles it. Actual full uncollapse clears it with the hover timers and intent (`4649614..9634`). The two flags cannot be folded together.
- `+ce0` is the embedded `gfx::SlideAnimation` at `+cd0`'s actual `Animation::is_animating_`. The direction optional at `+d24/+d28` and current value at `+d40` match `SlideAnimation::IsShowing()` exactly: present direction zero, or absent direction and current value exactly one. These are genuine animation state, not a fabricated transition boolean.
- `+f78` is an uncollapse transition latch. The state callback `46492a0` reads the old persisted collapsed bool from `+8c4`, stores the new state, and sets this flag only for old collapsed to new expanded. The actual completion/cancellation path clears it. Its original member name is unproven.

## Width branch

With controller collapsed and either hover intent or hover-layout latch set, admission skips the collapsed/width rejection. Otherwise, if neither size animation nor uncollapse latch is active, a collapsed controller rejects and an expanded controller continues. When a transition is active, derive the actual presented width:

1. With the uncollapse latch set, use the region's current `width()`.
2. Otherwise, multiply the real collapse SlideAnimation value by `target_collapse_state_.uncollapsed_width` (`+8c8`). Round with the original showing-versus-hiding direction choice; do not replace this with intended final width.
3. Clamp to region width when positive; require at least151px. The same calculation occurs in the original actual layout (`04648080`) and color/layout update (`0464a8c0`), independently of swipe input.

Current155 uses `BrowserAnimationController` for vertical strip motion instead of this supplied embedded collapse SlideAnimation. The stock `IsAnimatingSize()` is available, but its presence alone is not a source-backed substitute for the retained hover latch or exact animated-width calculation. The parent region port must carry real writers and presented geometry when adapting this state.

## Real custom scroll owner

Region `+5b0` is the supplied **VerticalTabStripScrollView**, not a generic `ScrollView::is_scrolling()` result. Constructor `42455c0` passes the literal class/source name to its location metadata and calls the real base ScrollView constructor. It owns:

| Offset | Source-proven meaning |
| --- | --- |
| `+4a0` | Axis decision: zero undecided, one vertical, two horizontal |
| `+4a4/+4a8` | Accumulated ordinal X/Y offsets while deciding |
| `+4ac` | Active actual scroll sequence |
| `+4ad` | Post-reset/end handling latch; full semantics belong to the real custom handler, not a generic inertia label |

`4245ec0` starts a real sequence by clearing axis/sums and writing `+4ac=true,+4ad=false` together (`4246170..617c`). Axis selection waits until a cumulative component reaches6px, then chooses horizontal iff `absX > max(1, 1.5*absY)`; otherwise vertical. The handler also owns genuine overscroll/animation/consumption behavior, so these fields must not be maintained by an unrelated observer pretending the full scroll view exists.

The outer region's `464c668..69c` protects an already active vertical custom-scroll sequence: it only admits a fresh `ScrollEventPhase::kBegan`, or phase-none with `MomentumPhase::MAY_BEGIN`. This preserves sequence ownership rather than stealing in-progress events.

Current155 has no class named `VerticalTabStripScrollView`. A faithful custom-class port is the next dependency, with original vertical delegation, phase/direction locking, overscroll and event consumption preserved. This checkpoint is not that implementation or a claim of gesture parity. Bounded raw writers/handler are pinned in `profile-scroll-remaining-guards-evidence.json` for that continuation.

Correction from exact `4246048..6054` csinc and focused handler decompile: the axis enum was inverted in the initial checkpoint. Horizontal dominance stores2; otherwise it stores1 (vertical). The region therefore protects a vertical sequence from horizontal profile-swipe takeover.
