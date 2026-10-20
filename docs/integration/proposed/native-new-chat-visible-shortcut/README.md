# Original normal New Chat shortcut label

This one-file adaptation finishes the visible help supplied by `native-chats-shortcut-producer` (`569e0ad09`). It changes only the existing normal New Chat LabelButton. Original region37e220c..2254 calls the same `VerticalNewTabButton` base4242e5c / shortcut setter4244850 used by the genuine ordinary New Tab port; it does not supply shortcut help to the selected New Chat-tab row.

The original setter creates a real noninteractive Label child+638, copies the main label's actual font, disables automatic color readability, applies marginsTLBR(0,8,0,4), and initially hides it. The base state hook4243f74 shows it only for hovered or pressed states while expanded. The current normal New Chat base has no compact producer; it retains the original constructor's false compact state. No width heuristic, tooltip substitute, always-visible label or invented compact policy is added.

The source base installs a horizontal FlexLayout with child cross-center, ignored default main-axis margins, image right-margin8 and main label scale-to-zero/unbounded flex. The proposal restores that exact sibling layout so the genuine shortcut child participates in actual preferred-size/layout instead of overlaying hardcoded bounds. Existing New Chat text/glyph/font/border/height/callback/highlight and selected-row presentation are preserved. The shortcut color uses source role226 RGB with alpha0x99, dark99FAFAFA/light990A0A0A; actual Widget ColorMode supplies the original dark/light recipe. This is not a numeric155 ColorId substitution.

No GN, body, region, accelerator or shared-native changes are included. Root's already-reviewed producer hook passes `GetNewChatShortcutHelp()` to `AuxChatsController`; this label consumes that actual platform-formatted help and is absent if no shortcut exists.

`python3 verify.py` checks the pinned current source and independently replays the exact one-file patch. Native compile and disposable rendered hover/pressed/width observation remain root integration checks; no owner profile, runtime or network operation was performed.
