# Organization row theme and selection polish

Apply this one-file overlay **after** `6a41685ad` (`organization-window-recovery`). It targets `chrome/browser/ui/views/frame/aux_organization_tree_view.cc`; no new source registration is required.

Active/inactive labels and fallback folder/page glyphs now use `aux_theme::SidebarForeground` with the actual widget's public `GetCurrentColorProviderKey()` and actual color provider. Hover/pressed/active fills and directional drop feedback use that same contrast result. A theme-remapped active fill remains translucent rather than converting the light-mode opaque white fill into opaque black beneath black text. When the helper leaves the supplied foreground unchanged, original default fill colors are preserved exactly. Favicons retain their original artwork.

Active rows use the existing supplied pinned-row `gfx::CreateShadowDrawLooper` primitive: 2px downward offset, 5px blur, low-opacity black. Row bounds, padding, radius, ordering and layout are unchanged. Changing the selected ID gives the newly selected row a 2px, 140ms native transform settle using the existing native easing pattern. Initial construction and unrelated refreshes do not animate selection. Reduced-motion settings skip animation and immediately end an in-progress animation; completion/cancellation restores identity transform. No model reorder or tab move is involved.

## Shared helper mapping request

The integrator/frame owner should also update the already registered `chrome/browser/ui/views/frame/aux_tab_expand_chevron_view.cc` (outside this overlay's ownership):

- Include `chrome/browser/themes/aux_theme_editor.h`.
- In `UpdateImage`, wrap the final existing `color` argument to `FromVectorIcon` with `aux_theme::SidebarForeground(GetWidget()->GetCurrentColorProviderKey(), GetColorProvider(), color)`.

This makes the existing folder chevron match its row foreground while preserving its supplied icon/rotation/roles. Do not add a replacement icon component or new GN target.

## Evidence and remaining acceptance

The patch passes exact byte replay and whitespace-error checks. Actual selected APIs inspected: `gfx::LinearAnimation`, `gfx::Animation::ShouldRenderRichAnimation/PrefersReducedMotion`, native `View::SetTransform`/`AddedToWidget`, and the supplied pinned row shadow implementation. The existing theme helper's public widget-key usage was matched.

No extra native compile, app launch, screenshot, provider call, owner access or signing occurred. Native compile and a small visual check of default dark/light, pale-background custom dark theme, selected/pressed rows and reduced motion remain integrator acceptance work. No visual-fidelity pass is claimed here.
