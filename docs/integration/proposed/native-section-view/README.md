# Supplied native section base and header

New source-only `aux::AuxSectionView` ports original AsideSectionView4662010 and AsideSectionHeaderButton (metadata46665b04). It is the actual shared base used by original Bookmarks and Chats, not a redesigned generic sidebar. Original callers retain responsibility for genuine model rows, expansion/persistence and actions. No existing region/body is replaced by this dependency; held retirement270 must remain unapplied until the whole supplied body is mounted.

The constructor preserves native View → header Button + contents View topology. The header has its source28px height,13px medium fade-tail title/role226, inner4/8 insets, outer0/8 margins, flexible spacer and controls container. Controls preserve the supplied state rules: optional accessory is visible while nonnormal or explicitly retained; disclosure appears only hovered/pressed. Hover paints original role247 with source8px radius. Primary press uses the genuine callback; exact right-mouse-only press invokes the separate callback when present. Missing primary disables the real header.

The header's original TabExpandChevronView was removed upstream in155, so the shared `aux::AuxTabExpandChevronView` port retains16px exact53-element disclosure path, left4px margin, genuine gfx::SlideAnimation,180ms/reduced0 duration, centered180° rotation and repaint callback. SetDisclosureOpen drives the real animation; no asynchronous operation is reported successful. Native ImageView/Button/Label/Layout remain the actual actors.

Full bounded original section constructor, header methods, chevron constructor/paint and constants are committed. Radius is independently decoded from5038c0 jump-table slot56 (ced81c8+224 contains16;503914+16→503924 returns8). Color roles222/226/247 reuse the already byte-decoded original native palette. Bookmarks caller37e1274 passes packed section InsetsTLBR(4,0,8,0), not VH(4,8); content top margin4. Tooltip, loaded-profile settings and actual model data are supplied by their owners, not inferred by this base.

## Public owner interface

Header `chrome/browser/ui/views/frame/aux_section_view.h`:

```cpp
AuxSectionView(std::u16string title, bool disclosure,
               base::RepeatingClosure primary, gfx::Insets section_insets,
               base::RepeatingClosure secondary = {},
               std::unique_ptr<views::View> accessory = {},
               int content_top_margin = 4);
views::Button* header_button() const;
views::View* contents() const;
void SetDisclosureOpen(bool open);
void SetHeaderAlwaysShowAccessory(bool always_show);
```

The actual derived Bookmarks/Chats view adds its real content under `contents()` and controls its own source animation/visibility. This base does not invent collapsed preferences, row selection, generic empty states or model services.

Shared header `chrome/browser/ui/views/frame/aux_tab_expand_chevron_view.h` exposes `AuxTabExpandChevronView(bool expanded = true, Foreground = Foreground::kSecondary)` and `SetExpanded(bool)`. Foreground::kSecondary is original role222; section headers pass kMuted (226), matching the original immediate image override. Bookmark rows can reuse the same genuine control after their own source call is established.

## Root integration

Add both .h/.cc pairs to the existing enabledMac Aux view sources; stage the included `.inc` at the same fixed frame path. Existing deps are base, views, gfx/animation/geometry, ui::ImageModel/color, cc paint. No existing source/GN files were changed here. Root owns registration and focused compilation after the live full build.

`python3 verify.py` validates original artifact/ranges, exact float32 icon re-encoding, independently derived radius/rotation constants and five-new-file patch replay. The bounded REA snapshot is retained at the path/hash in source-evidence; external literal/tailcall limitations are explicit and fullLLVM remains authority. No native compile/runtime/UI acceptance, owner state, private APIs, credentials, OS grants, Keychain or network operation was performed.
