# Additional visual component measurements

Status: **ready for the explicit intrinsic dimensions and CSS roles below**; full host layout, native material and screenshot baseline acceptance remain **draft**. Evidence IDs VM1–VM6 are in `../provenance.md`. This supplement refines the earlier chat/settings/Vault/utility specifications. It does not authorize copying reference code, art, fonts or wording.

## M1. Evidence scope

The inspected agent and Vault component manifests both identify version `1.26.1016.1852`. Their source hashes and measurement locations are indexed under gitignored `out/reference/visual/measurement-index.json`. The companion probe configuration/scripts are reference-team extraction material and must not be opened by build agents; build agents consume this original specification and approved screenshots only. This is separate from the older native bundle's version. None of these measurements comes from the older native app or historical screenshots.

For verification, the exact target stylesheets were applied to isolated generic DOM probes using only the classes found at the measured component sites. This ran in disposable upstream Chromium at scale 1, viewport 1280×800 and 420×800, in both light and dark. Root font size was 16px in all eight package/theme/viewport runs. Every request outside the ephemeral read-only static server was blocked. No reference JavaScript, daemon, account, API mock, owner browser profile, native reference app or Keychain operation was used.

The probes verify compiled style values, including theme selection and responsive rules. They do **not** reconstruct a reference screen. Intrinsic text wrapping, implicit widths/heights, containing-block layout, focus/hover styles, primitive defaults supplied by another component, inherited native preferences and final transparency depend on the real host. Text-sized bounds in the raw index are probe artifacts and must not be used as application measurements. All numbers below are explicit style constraints; they are not those synthetic text bounds.

## M2. Settings and import dialogs

Source VM1, verified against VM5.

| Component | Explicit measurement |
| --- | --- |
| Standard settings row | Minimum height 52px; 10px inset; 12px content gap |
| Standard row label block | 4px additional horizontal inset |
| Promotional row text column | 14px horizontal and 12px vertical padding |
| Settings row group | 16.8px corners; 14px outward side margin; light-mode dividers; dark-mode 1px row spacing |
| Embedded promotional illustration slot | 288×160px; 11.2px corners; non-shrinking |
| Settings browser-import dialog | 520px declared width; minimum height 320px; automatic header/footer around flexible body |
| Selected browser-source control | 48px height; 12px horizontal inset; 10px icon/text gap; 16.8px corners |
| Source chooser scroll region | Maximum height 240px; 6px inset; 2px spacing between options |
| Source option | 40px height; 8px content gap |
| Automatic tab-cleanup instruction editor | Fixed 128px height; manual resizing disabled |
| Appearance choice control | 176px declared width |
| Custom blocking-rule editor | Minimum height 160px; vertical resizing; 12px monospace text |
| Clear-browsing-data scroll body | Maximum height 336px; 24px side/20px vertical inset; 16px group spacing |
| Blocking-list menu scroll region | Maximum height 288px; 6px horizontal inset |
| Context timeline loading/empty region | Minimum height 200px; 12px internal gap in the loading variant |
| Context timeline row columns | 56px timestamp column, then flexible content; 12px column gap |
| Context source picker | 288px declared width; 12px inset |
| Excluded-app row | Minimum height 40px; 10px side/6px vertical inset; 8px content gap |

The 520px import-dialog width is an explicit target declaration, not proof that the entire modal remains inside a 420px host. Final dialog primitive constraints and native window sizing must be checked in the live importer. Do not infer narrow-screen behavior from the probe's lack of ancestors.

## M3. Chat navigation, queue and annotation

Source VM2, verified against VM5.

| Component | Explicit measurement |
| --- | --- |
| Floating bottom action region | Maximum width 896px; 8px stack gap; 16px horizontal inset below the large responsive breakpoint, 32px at the 1280px probe |
| Message edit body | Minimum height 80px, maximum 320px; 4px inset |
| Turn-navigation rail | Left offset 16px, vertically centered; scroll limit is the smaller of 70% viewport height and 640px |
| Turn-navigation pointer/keyboard target | 36×9px |
| Visible turn marker | 26px wide and 1.5px high; initial horizontal scale approximately 23.08%, expanding with proximity/current interaction |
| Turn-preview popover | 320px width, limited to viewport width minus 16px; 10px side/8px vertical inset; 16.8px corners; text 13px/18px |
| Transcript attachment card | 10px inset, 8px content gap, 16.8px corners |
| Queued-message scroll list | Maximum height 208px; 8px side/6px vertical inset; 2px row gap |
| Annotation editor shell | 320px width; 20px corners; left inset 12px, right/top/bottom inset 4px |
| Annotation text editor | Minimum height 28px, maximum 160px; 14px/20px text; 4px vertical inset |

The turn rail is conditional: its source omits it for fewer than four turn groups or when its visibility condition is false. Selecting a rail target navigates to the bound turn. Hover/focus shows a label and up to three lines of response preview; pointer scrubbing updates the target. The preview opens to the right without an entrance animation. It must not steal initial/final focus from the main conversation.

Marker expansion uses a 160ms transition; reduced motion removes it. The rail container's entrance is 150ms when animation is permitted. The light/dark role changes are specified in M6, not a separate layout. Exact rail visibility policy, hit testing with real transcript content and gesture behavior still require a live-host observation. The 896px bottom action region is **not evidence for a universal transcript/composer maximum width**.

## M4. Vault and autofill distinctions

Source VM3, verified against VM5. These are local component geometries; cloud-sharing dialogs are excluded from this specification.

| Component | Explicit measurement |
| --- | --- |
| Unlock column | 320px width; 36px top inset; 40px vertical gap |
| Unlock decorative slot | 112×112px; 8px border; 33.6px corners; independent Aux artwork required |
| Initial password/recovery setup column | Maximum width 448px; 32px vertical inset; 24px gap |
| Item-list column | Minimum width 250px, maximum 384px |
| Item row | 4px inset, 10px icon/text gap, **11.2px corners**; content determines height |
| List group heading | 28px height; 8px horizontal inset; 12px medium text |
| Detail pane | **16.8px corners**, 0.5px outline; flexible width and clipped overflow |
| Account/Vault chooser | 224px width; viewport-width-minus-16px maximum; maximum height is the smaller of 75% viewport height and 512px |
| Additional item-type submenu | 240px width; maximum height 60% viewport height |
| Vault icon picker | 272px width; maximum height is the smaller of 70% viewport height and 320px; 16.8px corners |
| Create-Vault popover | 320px width, limited to viewport width minus 32px; 8px inset/vertical spacing; 16.8px corners |
| Vault-management dialog | Maximum width 384px; maximum height is the smaller of 85% viewport height and 512px |
| Item-history dialog | Maximum width 448px; maximum height is the smaller of 85% viewport height and 640px |
| Explicit export dialog | Maximum width 448px |
| Generator dialog | Maximum width 384px |
| Generator length input | 64×28px; 12px text |
| Generator length slider | 160px width |
| Autofill suggestion panel | Declared outer width 308px; 24px side/bottom inset and zero top inset, leaving a nominal 260px content width |
| Autofill result scroll region | Maximum height 240px |
| Autofill option | 8px side/6px vertical inset; 10px content gap; 16.8px corners; height follows content |

This distinguishes the earlier Vault specification's list-row corners from its detail pane: the measured detail-pane declaration is 16.8px, not 11.2px. It also distinguishes a 600×432px extension popup from separate dialogs/popovers that may be hosted in it. Maximum widths are limits, not forced widths; do not apply 448px/384px to every popup.

The passkey flow, Touch ID dialog, recovery word layout and actual native save/update prompt placement have no valid new measurement or baseline in this lane. No authenticator, password setup or OS prompt was invoked.

## M5. Utility overlay constraints

Source VM4, verified against VM5. Geometry below is shared across both measured appearances.

| Component | Explicit measurement |
| --- | --- |
| Lasso outer region | Width 336px; 8px outer inset |
| Lasso inner card | 8px inset; 33.6px corners |
| Lasso transcript variant | Height 280px |
| Lasso follow-up input | Height 28px; 4px side inset; 14px/20px text |
| Capture toolbar external breathing room | 32px side/24px top/64px bottom |
| Capture mode control | 72×44px |
| Capture result external inset | 16px top/left, 20px right, 28px bottom |
| Capture result action strip | 2px inset and control gap; fully rounded; opaque white fill in both themes |
| Translation status card | 8px top/right/bottom, 10px left inset; fully rounded |
| Translation language menu | 224px width and maximum height; maximum width is viewport minus 16px |

A menu's pre-positioning hidden state must remain hidden until its anchor is positioned. The language menu disables its entrance/exit animation to avoid moving from an incorrect initial position. No CSS probe establishes an overlay's screen position, host window size, native glass backdrop or capture/translation outcome.

## M6. Theme and compositing evidence

Source VM5. `N` means OKLCH zero-chroma neutral lightness, as in `tokens.md`. The values are computed role declarations before compositing, not sampled final screen pixels.

| Measured component role | Light | Dark |
| --- | --- | --- |
| Primary raised fill used by selected browser source / transcript attachment | N100 | N98.5 at 8% alpha |
| Glass annotation / translation fill | Approximately N100 at 80% alpha | N26.9 at 80% alpha |
| Lasso inner fill | Approximately N100 at 95% alpha | N26.9 at 95% alpha |
| Glass foreground | N14.5 at 85% alpha | N98.5 at 85% alpha |
| Muted Vault group text | N14.5 at 55% alpha | N98.5 at 55% alpha |
| Capture result action strip | Opaque white | Opaque white |

The light glass role serializes as a near-neutral color conversion with tiny nonzero chromatic coordinates; this is not evidence for a perceptible colored tint. Preserve semantic neutral roles instead of copying browser-specific serialized decimals. Native background/material and neighboring content determine the final pixel color. Some sidebar role backgrounds depend on host-provided variables and remained unresolved in the generic probe; no flat fill is inferred for them.

All explicit nonfluid dimensions above were unchanged between light/dark at both widths. At 420px the chat bottom actions used 16px side padding versus 32px at 1280px. Viewport-constrained menu maximums changed as expected. Fixed-width controls did not acquire an unsupported automatic narrow-screen transformation.

## M7. Baseline and manifest audit

The existing visual manifest contains 130 surface/state rows and 260 theme comparisons. None is closed by these measurements. The previous 14 unhosted diagnostic screenshots remain their original evidence class; no new application screenshot was captured here.

The manifest's broad rows must account for these distinct variants before acceptance, by recording additional captures or adding explicit rows:

- Settings browser-import modal, source menu and live import progress; the onboarding import image alone does not show the settings modal host.
- Custom blocking-rule editor, browsing-data confirmation and context-history expanded detail.
- Chat turn rail with at least four groups, current/hover/focus/scrub state and its turn-preview popover.
- Vault account/Vault selector, additional item-type submenu, icon picker, create-Vault popover, management dialog and item-history dialog.
- Overlay anchor placement and language-menu positioned state, independently from their body geometry.

Precise remaining isolation proof: the native app's component selection/version pairing must be verified under a fresh profile; its daemon port and state-home override must be shown to propagate before startup; and installation auth/Keychain behavior must be proven confined to disposable material. The current older installed native bundle plus updated web packages does not by itself prove that configuration. Until those conditions are established without an owner profile, native reference launch remains unavailable. No native reference screenshot, baseline pixel threshold or parity pass is claimed.
