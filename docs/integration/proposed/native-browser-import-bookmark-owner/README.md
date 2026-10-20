# Supplied mode1 current-profile bookmark destination

Source-only incremental two-file proposal. Migrator parent is actual429; destination parent is L2's exact `66b295a59` availability/skip output f9b70ff4. No availability, crypto, history, password, cookie, extension-selection or public descriptor block changes. Root owns composition/native/GN/build. This is the first concrete slice of the assigned bookmark+Arc work; Arc augmentation is not yet claimed complete.

## Source-owned behavior restored

Actual extension job uses mode1, which reaches4258618. Its loaded-bookmark-model branch passes source result+98 to41076f0 with the actual UTF16 label `Imported from ` plus425fe90(source). Those labels are Arc/Brave/Chrome/Comet/Dia/Helium/ChatGPT Atlas/Microsoft Edge, with Browser fallback. Public chooser labels differ (for example Google Chrome) and are not reused as destination folder labels.

Original41076f0 is **not equivalent to current155 stock ProfileWriter::AddBookmarks**. For a nonempty admitted vector it selects real account bookmark-bar when present, otherwise local bar; begins extensive changes; calls41073c4 for a unique imported-folder name; creates that folder immediately; then processes every entry under that folder. It does not flatten an empty destination bookmark bar or distribute imported roots among local/other/mobile nodes.41073c4 resolves existing folder-only title collisions by the same UTF16 ` (n)` suffix, starting1. URLs with matching title are not treated as folder collisions. No bookmark URL dedup is added.

Within the import folder,41076f0 walks each source path and reuses actual matching folder children (folder type + exact title), appending missing folders and actual rows in source order. It resets modified timestamps for all destination parents it added to (including the import root), ends extensive changes, and enables real bookmark-bar preference iff an accepted source toolbar entry existed. Folder creation uses new destination time; URL creation retains the source timestamp. Original reader425c084 supplies current time if date_added is absent/unparseable/nonpositive, and falls back to URL spec when a URL title is empty.

4253e58 traverses root children in bookmark_bar/other/synced order. Each path begins with the **actual source root name**, obtained by425bf70 from nonempty root.name or exact defaults Bookmarks Bar/Other Bookmarks/Mobile Bookmarks. Current adapter dropped these names and directly wrote each root to unrelated destination permanent nodes. The reader now retains sourceRootName alongside existing private row metadata; only the actual staged Chromium mode1 destination consumes it. Native WebUI, Safari and Firefox keep their existing destination paths.

Original425c084 emits named folder records before recursion, omits unnamed folder records/path segments, rejects invalid URLs and chrome/chrome-extension/devtools schemes, and preserves duplicate real URLs. Filtering occurs before the writer vector exists, so the new adapter checks admission before creating the import folder; entirely filtered inputs do not create an invented empty folder. The existing Aux javascript restriction, path/title/row bounds and real destination policy/availability gates remain explicit integration boundaries. No success or account state is fabricated.

## Bounded gaps

Arc source4259984 reads StorableSidebar.json from the parent of the actual Arc User Data root, and source4253e58 calls426be60 to augment the same bookmark vector. Parser426b4b0 and augmentation426be60 are positive owners; the parser has container-version paths, selected-profile filtering and pinned-container traversal. That additional implementation is still being recovered separately. This slice neither fabricates Arc entries nor labels existing ordinary Bookmarks input as the sidebar. Root can compile this concrete mode1 destination while the Arc parser/augmentation slice proceeds.

Original malformed/missing-source parsing behavior and every BookmarkTree field/time conversion are not claimed universally identical. This slice restores the proven destination placement, source-root naming, current source labels, title/time fallbacks and folder treatment using actual models. Full import—including autofill and extensions—remains unfinished and separately owned.

## Evidence and lean checks

Pinned whole thin image64c6c8a…, LLVM ranges for mode1 callback, root calls (toolbar argument1 vs other/synced0), writer, unique-name helper, root-name helper, flatten and source-label helper; exact UTF16 source labels/suffix bytes. Derived bounded writer/flatten pseudocode is retained for review; unresolved outside-raw callees and bad-instruction warnings mean decoded original LLVM/register evidence remains authoritative.

`python3 verify.py` passes original raw/range/literal pins and four count-one anchors/two-file patch replay in a fresh temporary tree. No native compile, browser/migrator/discovery run, profile/Keychain access, permission or signing operation occurred. No shared native changes. Actual native compile/model/chooser observation remains integrator work.
