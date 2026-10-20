# Correction: the purported task-drag callbacks are existing row actions

The earlier classification of `462d99c / 462e4bc / 462e9d8` as task-drag
callbacks was incorrect. Do not add a drag API or retain a readiness blocker on
that evidence. Exact original callback/data routing is:

- `462d99c` receives the Chat ID string, finds/selects or navigates its real
  document and saves the source `13d0` first-click/previous-selection tuple.
  This is the **Select** implementation already pinned by
  `native-chat-tab-owner/select.asm` and ported in `AuxChatTabOwner::Select`.
- `462e4bc` compares that tuple, settles the prior first selection and calls
  the actual rename path `4638cc8`. This is **Rename settlement**, already
  pinned/ported in `AuxChatTabOwner::SettleForRename` plus `AuxChatActions`.
- `462e9d8` moves the Chat ID string and calls `4638a40`, the actual **Archive**
  request path. It has no pointer, row geometry, drag payload or drop result.

The region constructor allocates a separate bare View, patches its vtable to
`e726ab0`, adds it to the real body and stores it at `region+6d0`; it explicitly
starts hidden. The primary metadata slot `e726ab0+58` points to `4667274`, whose
constructor stores exact literal `decc02d` **AsideSectionDivider**, length19.
Thus 6d0 is the divider, not a draggable Chats owner. Its only class-specific
nonmetadata override in the primary table is paint4667374; it draws a centered
0.5px horizontal line with source role229.

The three callback objects are produced **after** this divider allocation, for
the subsequent real Chats section construction (5c8). Their adjacency to the
6d0 assignment does not make 6d0 their recipient. Current actual
`AuxChatsController` binds these real Select/Rename/Archive paths; no additional
source task-drag behavior is established by these addresses.

This correction does not prove there is no task dragging anywhere in the entire
product. It withdraws the specific false gap/producer attribution; another drag
implementation would require its own positive source evidence. The divider's
real visibility/geometry remains a separate original body-layout effect; this
proof introduces no guessed height or always-visible separator. No native files
are changed here. Static source pin verification only; no build/runtime/profile
or OS access.
