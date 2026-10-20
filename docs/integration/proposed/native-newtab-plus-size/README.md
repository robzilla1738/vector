# Preserve the supplied 12px NewTab plus

The source-backed plus path has a 12-unit canvas and UpdateColors requests a 12px ImageModel. The constructor incorrectly overrides its ImageView size to 16px; ImageView::GetImageSize prefers that override, enlarging the actual glyph to 32 physical pixels at 2x. Set the override to the same supplied 12px size. No path, color, action, NewChat icon, or other layout policy changes.

Pinned against actual v531 native preimage. Patch dry-run checked; no native source mutation or build in this lane. Integrator applies with the regular composition path for v532.
