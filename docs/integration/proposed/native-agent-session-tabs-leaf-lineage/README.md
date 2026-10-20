# Actual session-tabs leaf lineage and mount proof

This corrects provisional class labels from the first recovery. No UI replacement
or new mount is proposed by this evidence checkpoint.

Original412a6c0 is `TabView`, source
`chrome/browser/ui/views/tabs/common/tab_view.h`, not an Aside-specific class.
Primary vtablee5a5e50 slot58 reaches78ad6d0→78ad68c→78adf4c; literalda9bfc4
is `TabView` and da9bfcc is the full source path. Original411b300 is similarly
common `TabGroupHeaderView`, vtablee5a3b50 slot58→78a6b00→78a6ee8,
literalda9bcb1 and source pathda9bd30. Current155 has genuine implementations
of these classes. Reuse their actual model, controller, title/favicon/audio,
hovercard, accessibility and close behavior; do not invent new row widgets.

Original5d0 Refresh46272bc creates one actual `AgentSessionGroupView`, title
"Agent Tabs". Each represented real handle is passed to the required factory
stored at+340 (4627660..7690), which returns the actual tab model node. It then
constructs common TabView412a6c0 with third argument1. Surviving rows retain
their real handle/model identity; changed model pointers cause actual row
retirement/recreation. This is not permission to create fake model nodes.

That extra original mode lives at TabView+414 and must not be silently dropped
in a155 constructor adaptation. There are nine bounded reads in the supplied
class. They affect split presentation, keyboard reorder and drag paths, pointer-state
forwarding, and vertical-row layout. For example412c1e4..1fc forces split=false;
412f788 exits drag continuation;4133c58 selects a32px non-pinned row. Pinned
rows retain original metric58 (40px), read via the separate node+61→view+616
field. Positive SplitTabView metadata78a7a44→78a7ac0 (literalda9bd72) proves
the meaning of view+614; an earlier provisional pinned label was incorrect.
Mapping only these
three examples would be incomplete. The entire nine-read behavior needs a
narrow adaptation of the genuine common class.

The synthetic group’s header delegate is real, but differs from the current155
interface. Original GroupView+310 has vtablee722ac0;462a7c8 invokes its actual
collapse callback.462a860 formats the real tab count with string resource11483.
Some original delegate slots are deliberate shared no-op/false functions; do
not turn them into successful fake real TabGroup operations. The155 adaptation
must identify each corresponding interface slot before wiring hover/context
operations to a physical group that may not exist.

## Exact mount question, without an inferred constraint

At46272dc..ec x0 is still the5d0 view; no argument replacement occurs before
the call to4125380. The complete helper does more than its first metadata test:
it walks actual parents via+188; a matching TabStripView metadata78abd18 returns
that ancestor. A matching PinnedTabContainerView metadata789e0f0 additionally
loads its+570 and returns that value when non-null; otherwise the walk continues.
It returns null after exhausting parents. The complete body is pinned here.

The original region constructor also places5d0 under region+680. Therefore the
first branch alone does **not** prove that the new body must become a child of
the ordinary TabStripView. The remaining original hierarchy/collection-owner
resolution must be established before a mount constraint is asserted. No new
ancestor adapter or invented successful result is introduced here.

Bounded raw Ghidra extraction recovered actual Refresh46272bc and both common
constructors into lane `out/agent-session-tabs-recovery`; targets are closed.
This source-only checkpoint neither compiles nor exercises owner state.
