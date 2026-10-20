# Supplied agent-tabs palette, painting and preferred geometry

One-source incremental follow-up to native-agent-tabs-native-ui/1a23513fa (root integration54549077c). Parent's vertical visibility154 is disjoint. Baseline/output hashes are in manifest.json. No GN/new source registration or shared checkout write is required by this proposal. It remains uncompiled and unobserved in an actual browser.

## Corrected exact geometry

The actual original button primary-vtable slot2e8 points to04686480, which returns packed gfx::Size(126,28). Both row and command primary-vtable slot2e8 point to04688c04, returning gfx::Size(217,32). These become actual preferred-size overrides, not minimums or independently chosen dimensions.

The earlier README interpretation of the original bubble's +4c8 literal225 as a color was wrong. Its actual DialogDelegate subobject begins+310, and DialogClientView's recovered GetDialogDelegate/CalculatePreferredSize chain reads delegate+1b8 (absolute+4c8), subtracts horizontal content margins and lays out content at the resulting width. Its GetMinimumSize uses that same width. Metadata a6ec050 positively names DialogClientView. Thus this slice restores `set_fixed_width(225)`. The three16-byte FrameMargins precede this member, followed by Params and its optional10px corner radius. It does **not** apply SidebarInactiveForeground225 as the bubble background. This corrects a static recovery error before it reached the shared implementation.

## Authoritative color definitions

Actual fixed-flat map entries in the pinned original153 framework associate numeric IDs with semantic names; verification checks the actual `(id,name pointer)` pairs, not string order. Actual mixer035e6d40 binds those roles to explicit ARGB constants. Both recovered callers0367f9c0 and0370c240 read ColorProviderKey's first word, compare it with1 (dark), then pass that boolean to the mixer. Verification decodes only the pinned MOVZ/MOVK/CMP/CSEL/CSINV constant expressions mathematically for both inputs; no original machine code is executed.

| Original role/ID | Light ARGB | Dark ARGB |
|---|---|---|
| SurfacePrimary214 | FFFFFFFF | 14FAFAFA |
| SurfaceBorder215 | 1A0A0A0A | 26FAFAFA |
| SurfaceBorderStrong216 | 260A0A0A | 33FAFAFA |
| SurfacePrimaryForeground221 | D90A0A0A | D9FAFAFA |
| SurfaceSecondaryForeground222 | 8C0A0A0A | 8CFAFAFA |
| SidebarMutedForeground226 | 730A0A0A | 73FAFAFA |
| SidebarItemBackgroundHover247 | 140A0A0A | 14FAFAFA |
| MenuItemBackgroundHover248 | 140A0A0A | 1AFAFAFA |

247 is a real alias to SurfaceQuarternary220: mixer+35e97d0 binds ID220 through its color-reference invocation3a8ba98, then installs that recipe at247. The constant-return invocation2468740 is separate. The supplied 06-chrome-tokens.css is an earlier static live extraction, **not the native definition or authority for this patch**; its matching values were corroboration during discovery. No new capture, owner state or browser launch was used.

The155 adapter resolves this bounded private palette using the actual widget's public ColorProviderSource::GetColorMode, so profile/window light/dark preferences drive it. It neither reuses original numeric IDs in155 nor selects a global OS theme. Native ThemeChanged updates label and vector-icon colors. Button title/icon and row fallback/close icons use222; count/subtitle use226; bubble title/row/command text use221; separators use215. Separator retains155's inset-aware device-pixel alignment with the recovered color.

## Original paint states

Button0468648c draws radius10 fill247 while hovered or Button::STATE_PRESSED. Otherwise light mode draws SurfacePrimary RGB with forced alpha0x4d; dark mode skips this fill. Every path then draws BorderStrong216 at inset0.5, radius10 and stroke1. The original NativeTheme+5c==2 check was theme state, not focus state; the adapter intentionally uses the real per-window key for the same light/dark branch.

Row04689690 paints full bounds with radius8/MenuHover248 while hovered or its actual focus manager's focused view is the row or a descendant. Command04688c10 uses the same radius/color for pointer hover or own focus. Row enter/exit/focus updates now schedule native repaint as well as close-control visibility; command focus/blur schedule repaint. The recovered paint methods retain their missing-color-provider early return. No independently designed ripple, selected state or animation was added.

## Checks and limits

Run `python3 verify.py`. It pins the original framework/arm64/function/name-map bytes, mathematically decodes both palette variants, verifies size leaves and source adaptation anchors, and replays the one-file patch in an isolated temporary tree. The four-source previous UI proposal also remains a prerequisite. No C++ compile, native write, signing, app launch, network, owner profile/Keychain access or OS action occurred here.

Actual packaged layout/hover/focus, per-window theme switching and pixel appearance remain unverified. The original generic bubble background/default shadow/provider overrides and high-contrast/forced-color transforms have not been separately recovered in this slice; the current platform bubble defaults remain, rather than applying an unsupported private foreground as background. Original secure AI-tabs creation/takeover and disk-session restoration remain separate behavior gaps. This is concrete recovered paint/geometry, not a full parity acceptance claim.
