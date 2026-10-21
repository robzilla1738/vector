# Genuine Agent toolbar text renderer

Three-file incremental proposal against actual native550; no GN/registration/new native files. Root551 is compiling disjoint objects. The real extension ToolbarActionView remains the owner: button dispatch, popup handling, context menu, focus, accessibility, controller and pin preference remain genuine. No resources or packaged Agent code change.

## Positive supplied implementation

Original041ef9b4 compares the actual extension ID with original Agent ID atce48949 and installs specialized rendering only for that action. At041efd28 onward it gives the action pill radius999 (float4479c000), installs041f000c's border and calls041f01f8. The latter sets visible UTF16 `Ask Aside`, derives font size14 and weight500, applies actual text colors, and sets each of the four state images to an empty ImageModel. This proposal changes the visible brand to `Ask Aux`, with no replacement icon or independent click handler.

The original primary vtablee5ff8d0 slot470 is041f000c: it returns Insets(4,10,4,10) for the genuine Agent, zero for other extensions; exact packed ints are atdf40740. Preferred-size slot2e8 points041f0e00, which invokes LabelButton's natural preferred size atb85d80 for Agent, and the existing delegate's toolbar square for all other actions. This removes the current155 forced-square truncation of a genuine text action.

Theme-change slot3b0 points041f0130, which calls the base then041f01f8 for Agent. Its state text recipes resolve actual original ColorId names (pinned fixed-map entries, not matching numeric155 IDs): normal ToolbarButtonIcon, hovered ToolbarButtonIconHovered, pressed ToolbarButtonIconPressed, disabled ToolbarButtonIconInactive. For the normal closed-panel pill,041f06ac reads Toolbar;041f06d8 reads ToolbarButtonIcon;041f070c loads exactfloat32 `26/255`;041f0718 calls original AlphaBlend(dc ec40), and041f0738 uses radius999 for the rounded background. The155 adapter uses actual per-window ColorProvider and preserves theme refresh. Supplied custom BrowserView color overrides (original optional-color virtuals420/428) are not separately ported here; the actual155 window ColorProvider remains authority. No global theme heuristic or new private numeric ColorId is introduced.

## Explicit observed-reference ordering adaptation

Root's controlled actual Aside comparison establishes Extensions followed by the Ask text action. Current155 always arranges pinned actions before Extensions. The container hunk reserves only the actual pinned Agent action immediately after Extensions and before stock panel-close (if applicable). All other extension order and actual pin preferences are preserved. This hunk is an observed integration adaptation, not a recovered original153 container ordering implementation.

## Bounded remaining visibility gap

The original041f0808 helper positively detects the original Agent extension origin through several real navigation-entry paths;041f0c1c/041f0d20 combine it with actual panel state. Exact153 entry fields/public155 getter equivalence is not established by this bounded port. Therefore this proposal preserves existing actual550 panel-open suppression and does not invent a URL-only NTP condition. Ask visibility on NTP versus external pages still needs that precise owner mapping. It is not declared complete by the renderer correction.

## Verification

`python3 verify.py` checks each exact baseline/output hash, counted anchors, three-file patch replay and supplied static range/name-map pins. No shared native changes, native compile, app launch, profile access, Keychain, signing or network occurred in this lane. Root must compile and observe the genuine action in the packaged UI before accepting visual behavior.
