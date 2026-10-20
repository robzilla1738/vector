# Original Bookmarks submenu and primary glyphs

Source-only follow-up to82b5c927f. No native/shared source, browser/profile state, dialogs, signing, launch or build was touched. `verify.py` verifies original branch/immediate/literal pins, eleven new exact float32 glyph representations, nineteen counted input anchors and a two-file disposable replay. Compilation and disposable interaction observation remain pending.

## Complete source-positive subtree

Original primary4573594 binds kind1. The table atd6e3084 resolves it to4574630. That complete branch through457483c creates a **300px** menu with exactly two native rows:

1. `All bookmarks`, command40011 (`IDC_SHOW_BOOKMARK_MANAGER`), descriptor e82c2b0.
2. `Bookmark this tab`, command35000 (`IDC_BOOKMARK_THIS_TAB`), descriptor e82bd00.

No Bookmark All Tabs row or intervening separator exists in that branch. The current independent SimpleMenuModel had three differently ordered/named rows. The proposal replaces only this fully recovered subtree with the already source-backed AuxMenuRow primitive, retaining the original two commands, text, order, glyphs and fixed width. The child is anchored to its actual primary row and is owned/retired by the same real primary menu. Repeated motion over the same anchor retains the actual live child widget rather than recreating it.

Original457903c stores its bound456fae8 submenu closure at row+4b0. Actual457b49c calls ButtonController slot20 (OnMouseMoved), then invokes that closure with its actual row. Actual457b5a8 does the same after slot28 (OnMouseEntered).457b6b4 forwards slot30 (OnMouseExited). The corresponding real155 ButtonController order and Button forwarding definitions are pinned. A narrow row-owned callback now restores mouse-enter/move and pressed activation for Bookmarks. Other submenus still use their existing pressed path until their real dynamic models are ported; this is not a claim that those paths match the original.

Original4570ef8 first tears down the coordinator456e1c8, then dispatches the command. Primary commands now use the existing delegate-destruction/post-task boundary and actual weak browser before dispatch, so the real primary and owned child widgets are retired before commands run. Existing Aux settings-route integration remains intact. The previously introduced155 child deactivation pin remains a platform lifetime adapter, not an inferred original field.

## Exact primary leading glyphs

Nine additional original descriptors replace the unrelated stock glyph choices in the primary panel: New profile e82c020, Bookmarks e82bd50, Downloads e82be68, Extensions e9d4f88, History e82beb8, Developers e82be18, New Tab e82bd00, Incognito Window e82bf08, plus All bookmarks e82c2b0. Settings reuses the already exact e82bfa8 descriptor from the kind7 port. Every representation is retained in original order; eleven newly decoded representations are checked bit-for-bit against the pinned binary. Existing kind6 glyph bytes are unchanged. No CSS, dimensions, color recipes or typography were redesigned.

## Explicit remaining gaps

Original Downloads kind2 includes real dynamic download-state rows after its static command/separator. History and Extensions likewise need their actual dynamic models. Developers kind5 begins Performance40266, Task manager40006 and Developer tools40004 with its actual shortcut, followed by an Advanced section containing real controls. Replacing those with a smaller guessed static list would discard supplied behavior; this proposal leaves them visibly unaccepted rather than claiming partial lists are complete.

Primary avatar recovery also remains: non-current row4574144..457417c calls the real ProfileAttributesEntry avatar helper27433f4 with size20 and high-resolution=true, then resizes20×20. Current-row4573c2c..4573c98 can instead carry the coordinator's actual ImageModel override. The current port's independent AuxProfileIconImage override and16px fallback cannot establish parity. The exact current override producer and row ImageModel rendering branch need recovery before replacing that path; no profile/avatar substitution is introduced here. Original retained-row hover flags4b8/4b9 and mouse transition behavior beyond the recovered Bookmarks callback also need complete coordinator ownership verification.

## Integration

Apply `native.patch` after82b5c927f. Both existing output baselines are pinned in `manifest.json`: sidebar873f6822… and its new glyph includef6104a55…. This extends that same included file, so no additional GN dependency or new file registration is needed. All other source bytes are preserved except touched-range formatting. No runtime fidelity acceptance is claimed.
