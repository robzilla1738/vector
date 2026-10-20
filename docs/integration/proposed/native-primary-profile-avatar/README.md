# Original primary-menu avatar capture

Source-only follow-up tobc1d43975/root264. Three native outputs: the existing primary sidebar source and the actual existing header renderer h/cc. No shared native writes, build, signing, launch, profile reads or dialogs were performed. Source pins, nine counted edits and three-file disposable replay pass; compilation and observed visual/interaction fidelity remain pending.

## Actual current-image producer

Original header press465d7e0 first reads its actual monogram child's own visibility (+510→View+1c8). Only when that child is not visible and its actual ImageView(+508) is visible does465d8f4..465d908 copy the ImageView's actual ImageModel(+348). This ImageModel and the monogram bit become the real menu-parameter fields+0/+28, copied through coordinator456e680(+130/+158) and content4572dec(+320/+348). No profile-image lookup substitutes for that source.

The narrow read-only renderer method `CaptureMenuAvatarPresentation()` copies precisely those existing visible children. The primary menu consumes it only if its actual anchor is the real `VerticalTabSidebarProfileButton`, checked with the existing metadata `AsViewClass` mechanism. Only the actual current path receives that captured image/monogram state. Copied vector images retain their actual source color/model rather than being recolored as an unrelated generic leading glyph.

Original source4579dec constructs the actual `ProfileMonogramAvatarView` for that real monogram flag, from the actual row label. Its diameter comes from the row descriptor16 at4573d54; font12 is written at4579e84. The constantdf478b0 selects original262 foreground and222 circle, exactly the existing source-backed monogram class defaults. The proposed primary row uses that same actual class at16/12 and the original8px leading gap, rather than a stock avatar or improvised letter label.

## Other real registry images

Original4574144..457417c obtains the real entry image through27433f4 with size20/high-resolution=true, then crops/resizes20×20 using shape0(circle). The explicit parameter blocksd6e30ac/d6e30b8 are both `00 01 00 00 00 00 00 00 00 00 00 00`: `has_padding=false`, `has_background=true`, no visibility override. The previous port called GetAvatarIcon32 and allowed an independently selected Aux icon override. This proposal removes that override from primary rows and uses the exact image20 parameters. The native row still displays the source model in its original16px image slot; no row/layout dimensions are redesigned.

## Caller audit and limits

Actual region constructor line174 passes `aux_profile_header_->profile_button()` to `ShowAuxProfileMenu`, so this genuine header anchor supplies the presentation. The old independent `AuxProfileButton` still calls `AuxProfileMenu::Show` directly from `AuxSidebarFooter`, and the actual region still mounts/shows that footer when expanded. That caller is **not** treated as a source of header presentation. It gets no synthesized toolbar/header/stock image override; ordinary real registry image behavior remains. This is an explicit independent-footer fidelity gap, not an accepted permanent fallback. Original footer/topology recovery is separate from this bounded avatar capture.

The existing source-backed primary ordering, label formatting, kind6/kind7 separation, mutation/dispatch teardown, Bookmarks content and actual owner retirement remain unchanged. Avatar observer/refresh timing beyond the already ported actual header controller and the old footer's provenance are not certified by static checks.

## Verification

`python3 docs/integration/proposed/native-primary-profile-avatar/verify.py` hashes the exact supplied arm64 image/functions, decodes the press-time visibility/model-copy instructions, both original placeholder parameter blocks, image sizes/shape and monogram colors/font, verifies pinned155 image/profile APIs and real region caller, then replays the three-file patch in a disposable tree. No target code or OS behavior is executed.

The containing target already owns the real header and monogram classes, so no new dependency or GN path is introduced. Exact original/current baseline and output hashes are in `manifest.json`.
