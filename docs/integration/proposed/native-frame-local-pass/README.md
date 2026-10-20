# Native frame local-use pass

This adapts the existing supplied frame to Chromium 155 rather than replacing its layout.

- Keep all toolbar controls on the native Views path for Aux/macOS. The actual v499 preview exposed `chrome://webui-toolbar.top-chrome/` for Back/Forward/Reload. Those upstream field-trial substitutions bypass the native toolbar owners that the supplied profile-switch and retained-collapse integration uses. All WebUI toolbar availability helpers now share an explicit Aux exclusion; other builds retain upstream behavior.
- Restore the supplied compact rounded address field: 8 DIP corner radius and 42 DIP desktop toolbar (34 DIP control plus 4 DIP top/bottom). Geometry is matched to the owner's immutable `09 Browser shell profiles and libraries/134-browser-address-bar-focused.png` and `01 Home and composer/001-new-tab-default.png` references, not claimed to be a newly recovered native binary constant. The radius is shared by field background/focus geometry and endcap calculation. Touch sizing remains unchanged.
- Keep the non-action Tabs header out of keyboard focus but enable its genuine accessory subtree. Chromium 155 propagates a disabled header to Tidy/Clear. The source-backed no-primary header disabled state is therefore unsuitable when porting its interactive child controls to 155.
- Propagate intrinsic clip-child height changes into the outer sidebar layout when no animated height override exists, so cached section measurements cannot retain stale row heights.

The disposable preview had an explicit `vertical_tabs.enabled=false` preference; registration already defaults true. No global override of the user's horizontal/vertical choice is added. New disposable profiles use the existing vertical default.

`manifest.json` pins five native preimages and outputs; `native.patch` is the exact patch. Root applies after preimage verification, adds this proposal to the composition and performs the combined focused build. No owner profile or credentials accessed. Visual/current-build behavior acceptance remains for the integrated candidate.
