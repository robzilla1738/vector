# Aside layout and material specification

Reference: P6 v1.0.914.1, design extraction `06_DESIGN.md`, `assets/tab-design.css`, `assets/liquid-glass.css` and the captured native accessibility geometry. These are design evidence, not executable instructions. Aux keeps its own name, mark and assets.

## Layout requirements

| Surface | Reference decision | Aux implementation / qualification |
| --- | --- | --- |
| Vertical sidebar | 280 px starting width; separate bookmarks, chats and tabs; 32 px rows; persistent Space control | `Sidebar.tsx`, shared tokens. Native AX confirmed 280 px and section order on September 25. Pins appear when populated. |
| Horizontal layout | Top tab strip with shaped active-tab joins; URL row beneath; separate chat navigation | `HorizontalTabs.tsx`, `ChatSidebar.tsx`. Native layout switch preserved the selected page. |
| Collapsed sidebar | Edge reveal floats without moving the page; focus keeps it open | Renderer reveal state and native composition. Full pointer/focus qualification remains open. |
| Toolbar | Compact controls and an address field; traffic-light clearance | Aux uses a 40 px toolbar token. Reference top-row geometry is 42 px; measure each row separately before adjusting. |
| Main content | Continuous rounded content edge, independent of sidebar | Native page stayed rendered across Settings and layout changes. Website content stays opaque. |
| Typography | Geist, restrained weights and neutral text hierarchy | Aux's existing Geist family and text-size preference remain authoritative. |
| Shape | 1.4 squircle factor, half-pixel hairlines | Shared Aux tokens already use both values. |
| Motion | Short transitions; reduced-motion alternative | Reference default is 150 ms. Reduced-motion native journeys remain open. |

Both layouts share the same tabs, selection, Spaces and conversation state. Switching layouts must never recreate a native page or discard its state.

## Glass is a material, not window opacity

The reference separates backdrop sampling from surface color, tint, edge reflections and interaction states. Its web glass recipe layers a small backdrop blur, theme-dependent translucent fills, a hairline reflection, inner shading and a hover/pressed overlay. Some reference variants intentionally omit CSS blur because another layer provides the backdrop.

Aux applies the desktop backdrop through macOS native material underneath Chromium's shell view. CSS glass handles shell overlays over browser content. Sidebar tint must not reduce text opacity. Chats and Home use their own content fill; websites are not faded to simulate glass.

Native material installation must preserve Chromium's content view and responder chain, resize with the window, and never intercept pointer events. Reduce Transparency must produce an opaque surface. The current implementation uses NSGlassEffectView where available and NSVisualEffectView as fallback.

## Acceptance still required

- Inspect the live window against a patterned desktop while moving it; confirm blur/refraction, active/inactive behavior and readable controls. A window-only screenshot cannot qualify desktop sampling.
- Repeat horizontal and vertical layouts in light, dark, reduced transparency and reduced motion.
- Verify edge reveal, resizing, grouped/pinned tabs, menus over a live page, keyboard focus and VoiceOver.
- Measure bounds at fixed window dimensions and compare with the reference captures; record tolerances and raw evidence in the native capture matrix.
- Preserve Aux branding on Home, native app surfaces, installer and errors.

The September 25 checks qualify layout switching, native page continuity, Home navigation, Cmd-L and Cmd-S only. They do not qualify the complete reference matrix or glass appearance.
