# Organization row: direct Skia geometry declaration

Actual focused a15 compilation reports `gfx::RectFToSkRect` undeclared in the Tree translation unit. The method exists at selected `ui/gfx/geometry/skia_conversions.h:41`; `ui/gfx/skia_util.h` declares only bitmap/scalar helpers.

This one-anchor overlay replaces the unused skia_util include with the actual geometry conversion header. It applies after `90835845a` (multiselect). Function call, floating-point bounds, radii and painting are unchanged. No new target or source registration is required; the existing native UI target already uses the geometry conversion dependency.

Only source/API inspection and exact replacement counting were performed. No additional tests, build, app execution or root/native mutation. Root will compile the failed object.
