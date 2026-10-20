# Preserve literal palette colors as SkColor

All35 extracted palette ternaries now use explicitly unsigned32-bit hexadecimal operands. SkColor is uint32_t; Chromium ColorRecipe distinguishes it from signed integer ColorId. Values with both alpha bytes below0x80 previously inferred int and selected a ColorId lookup, producing incorrect disabled colors and separators. Exact RGBA values remain unchanged. Actual current v515 native preimage is pinned. Root must compile and re-observe disabled toolbar icons and transparent separators.
