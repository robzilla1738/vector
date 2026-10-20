# Reuse genuine common TabView for session rows

Original5d0 Refresh46272bc constructs common TabView412a6c0 with its real node
factory result and third argument1. This stages the missing mode in current155
common TabView; it does not create a replacement row or replace tab models.
Normal callers retain their existing constructor and behavior through the
defaultfalse argument.

The required boolean is `is_agent_session_tab`. It retains the actual node,
controller, data observer, favicon/title/audio/loading, real close/menu actions,
hovercards and accessibility. The source mode suppresses split presentation
while retaining actual pinned state, disables keyboard reordering after the
normal activation path, and avoids press/gesture drag initialization,
continuation and release forwarding. Current155’s pointer hover paths already
stay local when split=false; the original additional parent/split forwarding
guards do not need a fabricated parent or extra callback in this adaptation.

Original+414 is read at nine pinned sites. The important state mapping is
node+78→view+614 = split presentation (proven via SplitTabView metadata), while
node+61→view+616 remains pinned. The earlier provisional “forcesunpinned” label
was wrong and is corrected in the prerequisite lineage followup3e2a9c3e2.

The session-row layout uses original32px height, or40px when actually pinned
(original metric58, not155’s numeric enum value). It insets the actual View
border/insets, then8px horizontally, matching4133d00..2c. It does not reuse the
different current stock tab style’s12px contents-inset calculation for this
mode. Ordinary tab geometry is untouched.

## Integration

The genuine owner must obtain each real existing TabCollectionNode from its
required factory and construct `TabView(node, true)`. It must not clone a fake
node or mutate the root collection to make a row appear. This proposal does
not alter the original4125380 null-parent result or force its admission true.
Root still owns that region/coordinator mounting.

The owner/AgentSessionGroupView and genuine common header delegate adaptation
remain separate work. This constructor mode is not a completed5d0 view. Source
pins and independent patch replay pass; actual155 compilation and UI observation
remain integrator verification. No shared native file was modified.
