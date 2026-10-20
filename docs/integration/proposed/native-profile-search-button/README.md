# Supplied ProfileSearchButton

This ports the real small profile search button required by the original preview fallback. It is **not** a New Chat row. Constructor4630f80 writes vtablee7298d0; slot58 points466c52c, whose metadata name literaldecc0a0 is `ProfileSearchButton`. The real fallback factory465420c constructs it and retains it at page368. Earlier partial notes describing that child as NewChat were incorrect.

The actual constructor uses the native Button base and transferred callback, disables state animation, triggers only left-button release, and tracks child enter/exit. Its centered BoxLayout owns one16×16 ImageView. It sets accessible name `Search`, installs10px rounded highlight/focus paths, and the preferred-size override466c628 returns28×28. The supplied callback remains caller-owned; this component invents no search action, destination, results or success.

Paint466c640 fills only HOVERED/PRESSED backgrounds, using actual allocated bounds and10px corners. The ordinary state has no filled background. Original247 aliases220 (hover light140A0A0A/dark14FAFAFA); original269 uses the saved215 constant (pressed light1A0A0A0A/dark26FAFAFA). Icon foreground uses enabled226 (light730A0A0A/dark73FAFAFA); disabled266 aliases222 (light8C0A0A0A/dark8CFAFAFA). The source uses the actual widget's ColorProviderKey mode. Full forced/high-contrast mixer override parity remains unverified.

The icon is the supplied `kAsideMagnifyingGlassStrokeIcon` definitione9d52d0, representatione9d52c0 and exact93 PathElements atd3dff60. The port preserves every original float32 bit, rather than substituting a generic Chromium search glyph. Only the internal debug icon name is Aux-branded.

The original uses deferred native ColorVariants, while this155 adapter materializes the independently recovered palette. `AddedToWidget`/theme/enable refreshes retain that actual window mode. Original input delivery and the real Button base remain in use. The component is not wired to the region, menu or preview page, and does not install a gesture.

Integrator: add the new `aux_profile_search_button.{h,cc}` to the existing enabledAuxMac UI source list. Normal Views/Gfx/Color dependencies suffice; no new source registration outside that list is proposed. The original preview owner/fallback factory will supply its actual callback and page geometry later. Never replace unrelated current sidebar controls solely because this dependency exists.

`python3 docs/integration/proposed/native-profile-search-button/verify.py` passes original binary/extract/name-map pins, arithmetic palette decoding, exact path re-encoding and independent two-new-file replay. No native compile, target execution, owner data/preferences, network or UI/runtime acceptance.
