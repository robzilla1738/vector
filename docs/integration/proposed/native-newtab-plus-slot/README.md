# Preserve the NewTab image slot with the smaller visible glyph

Follow-up to native-newtab-plus-size: retain the original 16x16 layout slot while painting the 12px vector centered inside it. ImageView SetPreferredSize controls the slot; SetImageSize controls actual drawn dimensions. This avoids shifting the label four pixels left when fixing the oversized plus.

Evidence distinction: the original native-vertical-new-tab-button recovery explicitly records a 12px model in a 16x16 ImageView. The 12px render size is a Chromium155 visual adaptation based on the observed oversized current plus, not a claim that the original literal ImageView override was 12px. Its path, palette and 16px slot remain the supplied implementation. The prior proposal's implication that the original literal override was wrong is superseded by this clarification.

No additional row inset is added. Chromium155 FlexLayout with include_host_insets_in_layout=false still subtracts host insets at flex_layout.cc438 and starts children at the host leading inset at753. The existing recovered EmptyBorderVH(6,8) is respected. Any extra parent inset needs separate source evidence.

Pinned actual v532 preimage, patch dry-run checked. No shared native mutation or build. Integrator applies through normal serialized composition for v533 and compares visible plus and label position.
