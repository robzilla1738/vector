# Supplied profile indicator icon selector

Original helpers 456d980 and 456da74 read the actual ProfileAttributesEntry string `aside_profile_indicator_icon`, validate it against the 48-entry table at ead4c58, and return its exact vector icon or null. The pager uses that pointer directly. This proposal ports that read-only behavior and all 6530 original PathElements, preserving float32 values and every command. All 48 original names remain unchanged; the icon object's diagnostic branding alone uses Aux.

This is different from the retained independently created Aux icon picker. That picker has 16 options, approximate glyphs, a separate `aux.profile_icons` dictionary and circular raster composition. Its image cannot replace the actual pager icon pointer. This proposal does not migrate that dictionary, invent selections or silently use it as a fallback. Absent, malformed and unknown original attributes produce the original iconless dot.

The 155 adaptation adds one narrow public getter to ProfileAttributesEntry, implemented with its actual existing private `GetString` accessor. This preserves the original profile attribute storage and malformed/missing-value semantics without reading a parallel global preference dictionary or loading a profile. It adds no writes, notifications, preferences or ownership state. The supplied key is intentionally preserved inside the isolated Aux profile store.

## Integration

Apply `native.patch` after the actual 228 profile-attribute sources pinned in `manifest.json`. Register the three new profiles UI files in browser UI; the existing profile attributes implementation remains in its existing target. This changes a widely included profile header, so the integrator should account for its dependent rebuild. The genuine pager owner calls `aux::ProfileIndicatorIcon(entry)`, supplies the pointer to the new pager leaf and chooses its original foreground color. The source table itself adds no current UI mount.

Run `python3 verify.py`. It verifies the exact supplied image, the two original helpers, table pointer bindings and selected key, every encoded PathElement and all five disposable patch outputs. All 48 vector representations contain one original path representation. No target was run, no current native source was modified and no compile or visual acceptance is claimed.

Remaining: original profile icon editor/writer and its precise notification flow; actual pager owner and header mount. Do not wire the old 16-icon picker into the new reader as a substitute.
