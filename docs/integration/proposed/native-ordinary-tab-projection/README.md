# Original recursive ordinary-tab projection

This proposal ports the actual visibility writer **4642670**, not the earlier
active-row refresh **4641cd4**. The latter checks existing visibility and paints
eligible TabView descendants; it is not evidence for a flat visibility writer.
That correction matters: setting all nonrepresented rows visible would break
native collapsed group behavior.

The original recursion is preserved on the actual common TabCollectionNode:

- TAB leaves exclude genuine saved-pin representation, represented NewChat,
  bookmark cache association, eligible task association, then actual 5d0 Agent
  representation, in source order. No title/URL classifier invents task or
  bookmark membership. Explicit1090 and split10d8 sets come from AuxChatTabOwner.
- A leaf's actual group collapse is preserved, with the exact active-tab and
  active split-sibling exceptions. Excluded rows do not bypass exclusions merely
  because they are active. The method returns **eligibility**, separately from
  final visible state, so a collapsed group can retain its real header.
- Group/Split recursively OR child eligibility. Group visibility additionally
  excludes the real TabGroupFeatures.is_agent_group marker (4127680); this helper
  does **not** mean group collapse. Strip/Pinned/Unpinned container visibility is
  untouched. Only actual changed Views are updated. Hidden tab rows retire the
  real hovercard with the original reason4 / native kTabRemoved.

The saved-entry leaf gains `RepresentsTab(const TabInterface&)`: original4606510
requires an actual pinned live tab, a valid saved entry and exact remembered URL
(or the real visible-navigation URL) equality. This is visual representation,
not ownership and never authorizes closing a tab. It reads the actual leaf's
current entries, including its genuine order/drag state, rather than rereading a
possibly older pref or reserving only the active matching tab.

`TabStripView::collection_node()` exposes the actual retained common collection
already owned by that View. No production testing accessor or copied collection
is used. Mount integration constructs `AuxOrdinaryTabProjection` with the real
browser, Chats controller, bookmark cache, saved-entry leaf, hovercard and actual
AgentSessionTabsView's readonly RepresentsTab callback. The callback is mandatory;
an unimplemented view is not a false-returning substitute. Reconcile genuine
associations first, call Update on this actual node, then perform the region's
normal changed-layout effects if true. Retire this projection before its source
owners or actual profile identity are changed.

This adds no row, section, controls or approximate body. Three existing files
receive narrow seams; two new files contain the port. GN must register the new
files beside the other AuxMac UI components with common native tab collection,
Chats, bookmark, saved-pin and hovercard deps. Baselines are actual350/351 (the
controller destructor override is unrelated), following L4's compiled saved-entry
refresh adapter. Root owns GN/mount/application/compiler checks.

Remaining body integration dependencies are explicit: genuine 5d0 owner and its
source ancestry behavior, root's Tabs wrapper/actions, source bookmark snapshot
suppression/fb0 producer, and outgoing task drag. This proposal does not retire
the independent body or claim the complete sidebar is mounted/accepted. Source
ancestor4125380 still has its original null return; no invented parent adapter
is introduced to force it positive.

Only disposable filesystem patch replay and source hashes were verified. No
native write/build, browser or daemon request, profile/Keychain/OS access or
signing occurred. Uncompiled, unmounted and no runtime acceptance claimed.
