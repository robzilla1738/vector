# Original Chats focus boundary

Incremental delta on immutable bf037b426 output, not a replacement of its source inventory. Original row46718ac/b0 calls15377dc with1 (View FocusBehavior ALWAYS), while archive46726d4/d8 calls it with2 (ACCESSIBLE_ONLY). Preserve separate actual row and hover-action keyboard/a11y boundaries; do not conflate them. Source assembly is retained in native-chats-owner/row.asm.

13a0 was an in-place checkpoint and incorrectly conflated row and archive focus. Do not apply it. 0cddd restores the immutable foundation; this proposal now correctly replaces that packaging. No shared writes, build or runtime.

Root integration rebases the unchanged focus-only patch after the compiled155 timer receiver adaptation. Original proposal metadata is retained in original-manifest.json; exact current input/output snapshots are pinned separately. Foundation/API155 proposal bytes remain unchanged.
