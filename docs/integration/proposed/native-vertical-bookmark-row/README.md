# Genuine vertical bookmark row

This ports `VerticalBookmarkRowView` (constructor4624100) as a real Views leaf, with its actual child topology, input routing, paint and native hover-card anchor. It is not a replacement bookmark grid. The view requires a `VerticalBookmarkRowOwner` implementing every real owning callback. No default action, fake tab association or successful no-op is supplied. It stays unmounted until the coherent original BookmarksView owner/model/drag lifecycle is delivered.

Three new files contain the row and the exact supplied folder/globe PathElement data. The two existing common-chevron files receive a bounded `kPrimary`221 setter, authorized and coordinated with the Chats/common-component lane. Its existing222/226 paths, expansion animation and other users are preserved. Their baselines are the common leaf applied283, unchanged through285. Root owns registration and compilation; this proposal changes no shared checkout/GN.

## Recovered presentation

* Horizontal BoxLayout, collapsed margins, centered cross-axis; normal padding TLBR(6,8+14*depth,6,8), compact padding(6,8,6,8) and centered main axis. No guessed row height or width: actual child preferred sizes determine them.
* Image16x16, normal right margin8/compact0. The actual label uses CONTEXT_LABEL5/STYLE_PRIMARY4096, ALIGN_TO_HEAD3, FADE_TAIL6, default font size+2 and weight400. Explicit context prevents Chromium155's default Label constructor (CONTEXT_CONTROL_LABEL) from silently changing it. No subpixel rendering/readability adjustment; opacity check skipped as in source. Empty folder titles stay empty; empty URL titles use real host or URL spec, UTF8→UTF16.
* Shared original chevron4119804; actual TabCloseButton35956f4. Chevron visible only noncompact folders; close visible only noncompact hovered URL rows with a genuine associated tab. URL label trailing margin4 when close is absent; close leading margin4. Source `Layout` positions the close hit target using the real tab-close layout constant and right8/vertical centering.
* Exact original folder icon101elements and globe302elements, all float32 bits preserved. Source4623fe4 applies221 active/222 inactive to folder and chevron; URL favicon is retained when the owner's genuine favicon flag442 is set, otherwise the original globe is used. The common-chevron setter preserves that role on theme changes.
* Label colors:228 active (darkfffafafa/lightff0a0a0a),225 inactive (darka6fafafa/lightb80a0a0a). Active/drag-selected fill214; hover fill247; drop target fill219 plus inset1/stroke1.5 border216, radius10. Raw private mixer constants are independently decoded; no numeric155 color IDs or CSS palette substitutions.
* Transparent source clear; real clip path radius10; background blur and backdrop quality zero; actual compositor corner radius10 only active/drag-selected, otherwise0. Uses supported155 View/Layer APIs for the original private-field operations. Widget::ShouldPaintAsActive, not dark mode, feeds the native TabStyle close-button colors. Per-window actual color mode resolves private palette constants.

## Actual input and ownership

The row preserves exact mouse-button masks: right-click delegates context, left captures and presses, middle is accepted only on URL nodes. Drag only follows an active left press. Release clears pressed state and capture, invokes the genuine release callback, then uses the original weak-lifetime and hit-test gates before activation. Enter/Space invoke the same actual bookmark activation callback. Close forwards the original event, never a folder.

Hover enter updates visual state and requests actual live-tab hover data; failure supplies a null target to the real controller. Hover exit only updates appearance (it does not invent a new controller hide). Validity is URL + not suppressed + actual associated live tab. Thumbnail suppression belongs to the real owner's active dragged bookmark. Capture loss delegates the original parent cleanup only for pressed + drag-selected; the owning callback must implement the actual matching-row/detach cleanup recovered at4620af0, not a generic reset.

The original anchor is the actual row, and its arrow is constant4/LEFT_TOP, including compact mode. The complete independently recovered original ten-entry secondary-vtable/bubble-consumer proof is `native-bookmark-hover-anchor` (root commitsc8c520178/2599f713f). The earlier five-entry interpretation was incomplete and is not used. This proposal pins the same secondary slot+48 and actual constant-return body3f512c0.

## Remaining integration

This is a complete source-backed row leaf with **required** owner methods, not a completed BookmarksView. Original drag begin/update/drop/detach/cancel, model/coalesced row reuse and animation, association cache, actual live AddTabExtraData calls, native context-menu dispatch and final body mount remain in the owning component slice. The source-only proposal cannot be mounted with an empty controller. No existing body is retired here.

Static checks pin the original image/instructions, API inputs, colors, glyphs and replay all five files and six anchors. No native build, launch, owner profile, credential, signing or OS action was performed. Actual integrated compile and UI/behavior observation remain separate.
