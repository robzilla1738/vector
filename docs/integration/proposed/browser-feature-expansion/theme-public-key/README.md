# Actual widget color-provider key access

The selected Chromium API keeps `ColorProviderSource::GetColorProviderKey` protected. Sidebar callers cannot invoke it through `views::Widget`, even though the browser widget implements it. The public mode/forced-color getters expose only part of the key, insufficient for the existing immutable custom-theme marker used by `aux_theme::SidebarForeground`.

This exact four-file overlay adds one public const snapshot accessor on `ColorProviderSource`, forwarding through its existing protected virtual method, and switches the four sidebar call sites to it. The returned key remains the real BrowserWidget/profile key, including inherited widget overrides; no OS-only reconstruction, test API or unsafe widget cast is used. The existing foreground resolver, color mode, opacity, geometry and theme logic are unchanged.

Baseline pins come from the current integrator theme proposal and selected native public header. Root owns projection and must explicitly add `ui/color/color_provider_source.h` to the allowed projection paths. Apply after the theme proposal; do not replace its broader source/manifest. This source proposal has not been compiled, run or visually accepted. No app/native tree mutation or tests were performed in this lane.

Separate audit observation: `BrowserWidget::GetColorProviderKey` currently overwrites `key.custom_theme` after ThemeService decoration. This overlay preserves that existing pipeline and does not claim to fix custom-supplier propagation.
