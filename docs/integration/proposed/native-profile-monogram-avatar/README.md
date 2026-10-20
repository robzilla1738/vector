# Original profile monogram avatar

Two new source files port the supplied `ProfileMonogramAvatarView`, named by its actual metadata at `45885f8`/`dec64e9` and original header literal at `dec6503`. This is a dependency for the genuine profile preview fallback and the native menu; it does not install a new preview, change the menu, or enable a gesture.

The original helper `4587780` selects the first ICU character boundary. Its complete body additionally uppercases a **single ASCII letter** via `87eef20`; other graphemes are unchanged. Empty/failed iteration yields no glyph. The original preferred-size override `45882c0` clamps the diameter to zero and returns a square; the constructor uses diameter20 and font12. Paint `4588300` uses the allocated bounds, a centered antialiased circle of radius half the smaller dimension, and the default font derived to size12/styleNORMAL/weight600. Original draw flags `0x202` mean centered text without subpixel rendering.

The original inline preview constructor initializes foreground role262 and background role222 at data `df478b0`. The fixed native name map proves these are `kColorAsideControlProminentForeground` and `kColorAsideSurfaceSecondaryForeground`. The supplied mixer gives glyph light`D9FAFAFA`/dark`D90A0A0A` and circle light`8C0A0A0A`/dark`8CFAFAFA`. This adaptation selects those recovered defaults from the actual widget color mode; it never reuses original numeric ColorIds against Chromium155. Explicit `ui::ColorVariant` overrides still resolve through the real ColorProvider. Full forced/high-contrast override parity remains unverified.

The public setter names are a small platform-adapter API; original public declarations were not available. No source claim depends on those names. `OnThemeChanged` repaints the adapter's actual widget-mode colors.

Integrator: register both new paths in the existing enabled AuxMac UI source list, with `//base:i18n` and normal Views/Color dependencies available. Do not replace existing menu imagery blindly: actual user-choice images must still win, and the preview must retain its original avatar/image visibility rules. The full preview page/cache/input owner is a subsequent integration.

`python3 docs/integration/proposed/native-profile-monogram-avatar/verify.py` verifies the original binary, bounded extracts, original name-map and palette instructions, then independently replays the two new files. PASS. No shared native writes, native compile, owner state access, target execution or visual acceptance occurred.
