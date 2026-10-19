# Web design tokens

Status: **ready** for token implementation. Sources: SP2-T1 to T3 in `../provenance.md`. Static measurements from target component version; no runtime pixel sampling.

## Palette

Use Aux-owned token names. `N` means an OKLCH neutral with zero chroma: N14.5 = lightness 14.5%, N98.5 = lightness 98.5%. Alpha percentages follow `/`. Resolve translucent fills over the active background; OKLCH lightness is not an sRGB percentage.

| Role | Light | Dark |
| --- | --- | --- |
| Page base | white | N20.5 |
| Main text | N14.5 | N98.5 |
| Translucent content | page base / 80% | page base / 80% |
| Popover | page base | N26.9 |
| Popover text | main text | N98.5 |
| Primary fill | N14.5 / 95% | N98.5 / 85% |
| Primary text | N98.5 / 95% | N14.5 / 85% |
| Secondary fill | N14.5 / 8% | N98.5 / 8% |
| Secondary text | N14.5 / 55% | N98.5 / 55% |
| Muted fill | N14.5 / 5% | N98.5 / 15% |
| Muted text | N14.5 / 55% | N98.5 / 55% |
| Accent fill | N14.5 / 10% | N98.5 / 10% |
| Accent text | N14.5 / 85% | N98.5 / 85% |
| Border | N14.5 / 10% | N98.5 / 10% |
| Surface boundary | N14.5 / 10% | N98.5 / 15% |
| Strong boundary | N14.5 / 15% | N98.5 / 20% |
| Input boundary | N14.5 / 10% | N98.5 / 10% |
| Focus wash | N14.5 / 8% | N98.5 / 8% |
| Raised surface 1 | white | N98.5 / 8% |
| Raised surface 2 | white / 85% | N98.5 / 6% |
| Raised surface 3 | white / 55% | N98.5 / 4% |
| Surface text 1 | N14.5 / 85% | N98.5 / 85% |
| Surface text 2 | N14.5 / 55% | N98.5 / 55% |
| Surface text 3 | N14.5 / 25% | N98.5 / 25% |
| Brand | OKLCH 68.5%, .169, 237.323 | OKLCH 74.6%, .160, 232.661 |
| Brand content | OKLCH 58.8%, .158, 241.966 | dark brand |
| Destructive | OKLCH 57.7%, .245, 27.325 | OKLCH 70.4%, .191, 22.216 |
| Destructive text | OKLCH 97.1%, .013, 17.380 | same |
| Success | OKLCH 69.6%, .170, 162.480 | OKLCH 76.5%, .177, 163.223 |

Chart ramp in both modes: OKLCH (80.9%, .105, 251.813), (62.3%, .214, 259.815), (54.6%, .245, 262.881), (48.8%, .243, 264.376), (42.4%, .199, 265.638).

Use public upstream Tailwind v4 color scales for red, orange, amber, yellow, lime, green, emerald, cyan, sky, blue, indigo, violet, fuchsia, pink, rose, slate, zinc, neutral and mist. Acquire the upstream package independently, rather than transcribing the reference stylesheet. The semantic measurements above override defaults. Stable subagent identity colors draw from orange, yellow, green, sky, indigo, violet, pink and red.

## Typography and spacing

Acquire **Geist** for interface text and **Geist Mono** for code independently from upstream with OFL notices. Aux's display-font choice is **DM Sans**, also OFL, acquired from Google Fonts. This is an original design substitution for onboarding/display headings; its glyph metrics are not identical to the reference. Do not ship proprietary fallback fonts or font-family names.

| Scale | Size / line height, px |
| --- | --- |
| Caption | 12 / 16 |
| Small | 14 / 20 |
| Body | 16 / 24 |
| Large | 18 / 28 |
| Heading 1 | 20 / 28 |
| Heading 2 | 24 / 32 |
| Heading 3 | 30 / 36 |
| Display | 36 / 40 |

Weights: 400, 500, 600, 700. Paragraph leading 1.5; editor/prose 1.625; compact 1.375; tight 1.25. Tracking variants .025em, .05em, .1em. Use tabular figures for counts, durations and usage. Keycaps may use system font.

Spacing grid: 4px, with 2px half-steps. Container widths: 320, 384, 448, 512, 576, 672, 768, 896, 1024px. Breakpoints inspected: 640, 768, 1280px. Blur steps: 4, 8, 12, 16, 24, 64px.

## Corners, depth and motion

Radii in px: extra-small 2, medium 8.4, large 11.2, extra-large 16.8, two-extra-large 22.4, three-extra-large 33.6. The latter five use a curve factor of 1.4 over base values 6,8,12,16,24. Continuous superellipse corners are preferred, normal rounded corners are fallback. A generic primitive base is 10px. Hairlines are 0.5px. The target newtab card uses ordinary 22.4px corners, not continuous corners.

Transition default 150ms, cubic-bezier (.4,0,.2,1); settling curve (0,0,.2,1). Loading rotation 1s linear; pulse 2s with (.4,0,.6,1). Respect reduced motion. Perspective helpers: 300/1200px. Scroll-fade edges default to 24px bottom/right and zero top/left, updated with scrolling.

Small drop shadow: offset 0,1px, blur 2px, black alpha 15%; medium: 0,3px, blur 3px, alpha 12%. Newtab shadows are in `newtab.md`. Glass can independently combine blurred backdrop, neutral translucent fill, perimeter highlight and inset reflection. Exact glass compositing remains draft until screenshots.

## Primitives

Provide Button, Menu, Dialog, Popover, Tooltip, Toggle, Tabs, ListRow, Composer, field/select/checkbox, ScrollArea, Avatar, Keycap, loading/error/empty states. Visible focus, roving menu focus, Escape dismissal, focus trap/return for dialogs, disabled submission while pending. Decorative icons are hidden from assistive technology; action icons have accessible names. Use original Aux art or Lucide (ISC). Failed persistence must not silently discard the prior value.

## Remaining evidence

No screenshot baseline collected. Native colors are owned by the native spec. Exact glass appearance, display-font metric tuning and OS-dependent scrollbar behavior require visual acceptance; measured semantic tokens are ready.
