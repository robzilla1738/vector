# Restore both supplied sidebar section dividers

The supplied constructor mounts Bookmarks (+0x668), its divider (+0x6d0), Chats (+0x5c8), its divider (+0x5d8), then Tabs. Both divider instances use the same original class vtable `PTR_LAB_0e726ab0`. Aux currently mounts only one divider after Chats and incorrectly drives it from populated-Bookmarks visibility.

This two-file patch restores the original ordering and independent visibility. The first divider uses the existing populated-Bookmarks presentation condition. The second uses Chats visibility, exactly matching both calls in `0464a8c0.c`. Existing source-backed separator paint and section geometry are retained. Both pointers are cleared during body retirement.

`source-evidence.json` pins complete owner-supplied decompilation files and line ranges. The excerpts retain original line numbers. `manifest.json` pins the current native baseline and output. `verify.py` independently replays the patch in temporary files and checks hashes; it does not apply to the Chromium checkout or launch/build anything.

The empty Bookmarks wrapper is deliberately unchanged: its 1×58 preferred empty-state size is already recovered from the supplied implementation. The reference screenshot contains actual bookmarks; that population difference is not a license to invent owner data or shrink the empty state.

Validation: patch replay and exact output hashes only. Native compilation and live appearance remain integrator acceptance work.
