# Supplied Chromium source-profile popover

This immutable proposal ports the original native AppKit profile picker, not a replacement WebUI. Root owns the real Handler and target/new-profile lifecycle. The two proposed new files remain unmounted; no shared native or GN source was edited.

Public UI-thread API:

```cpp
aux_import::ShowChromiumSourceProfilePicker(
    content::WebContents*, const gfx::Rect& button_bounds,
    std::u16string browser_name, base::ListValue actual_profiles,
    base::OnceCallback<void(base::DictValue)> selected);
```

Rows must be the actual discovery projection, preserving its order/name/subtitle/id/nativePath. This widget performs no discovery or file reads. The callback receives a clone of the whole chosen row. `browser_name` must come from the original source-label mapping pinned below; it replaces the supplied native enum/display-name helper at the interface, not the displayed text. Root serializes GN and mounting this source into the existing Mac importer target.

The supplied framework SHA256 is `64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c`. Objective-C metadata identifies `AsideChromiumProfilePickerController`, class`0xed05aa8`, RO`0xecf9c38`, method list`0xdf732ac`. Complete range/literal/evidence hashes live in `source-evidence.json`. The bounded LLVM listing includes selector names resolved from original dispatch veneers and the original selector-reference strings. The view decompile is supporting evidence only; raw slicing leaves external AppKit types unresolved and its tail has a stack-check bad-instruction warning, so instructions/selector bytes determine geometry and lifecycle.

| Source | Preserved behavior |
| --- | --- |
| Constructor `0x4265d48..0x4265f80` | Store source, move actual profile vector/oncecallback, allocate checkbox array and initialize selected index to NSNotFound. No default profile selection. |
| `0x4265fd0..0x4266010`, bridge `0x4268118..0x4268150` | View and popover width320, height `min(320,max(1,count)*22+122)`. No added scroll container or count cap. |
| `0x426603c..0x42661ac` | Vertical NSStackView, leading alignment5, spacing12, edge insets top16/left16/bottom12/right16, all four anchors equal to root. |
| `0x4266230..0x4266310` | Title `Choose a %@ profile`, system13 semibold, custom spacing6 after title. |
| `0x4266314..0x4266468` | Description `Pick the %@ profile you want to import into Aside.`, system12, secondaryLabelColor, word-wrap0, maximum two lines, width288. Only `Aside` changes to `Aux`. |
| `0x4266470..0x42665f0` | Vertical row stack with leading alignment, spacing8,width288. Each NSButton switch3 starts off, uses system13, has index tag, and displays name or literal `name - subtitle` when subtitle is nonempty. Original vector order is retained. |
| `0x4266684..0x4266774` | Empty native discovery vector displays `No %@ profiles were found on this Mac.`, system12 secondaryLabelColor. It does not synthesize a profile. |
| `0x4266784..0x4266988` | Footer width288,height32. Continue is initially disabled, rounded bezel1, regular control size0, trailing-aligned and vertically centered. |
| Checkbox `0x4266a28..0x4266bac` | On chooses sender tag; off chooses NSNotFound. Clear every other checkbox, retain only the clicked on checkbox, enable Continue iff there is a selection. The sole checked row can be unchecked. |
| Confirm `0x4266bac..0x4266cdc` | Copy selected original metadata record, consume the oncecallback before closing the popover. No selection/callback still closes without a synthesized result. |
| Destruction `0x4266cfc..0x4266e24` | Release any unconsumed callback and actual vector on controller destruction. |
| Bridge `0x4267ec0..0x426831c` | Require actual WebContents native view and window. Close the previous associated popover; retain this popover on that same NSView with association policy1; set transient behavior1 and content controller. Show at original integer buttonbounds converted with `y=view.bounds.height-y-height`, preferred NSMinYEdge1. |

Original display-name helper `0x425fe90..0x42600fc`:0Arc,1Brave,2ChatGPT Atlas,3Chrome,4Comet,5Dia,6Microsoft Edge,7Helium; default Browser. Exact UTF16 literals and the branch listing are pinned. These are source browser names, not new product branding.

Outside dismissal does not invoke the selection callback. The supplied bridge retains the popover as an NSView associated object and provides no popover delegate to clear it. Its unconsumed callback therefore follows actual controller destruction/replacement/native-view destruction; the port preserves this, with no new cancel event or dismissal cleanup policy. Opening another picker closes the old one first. The original four-integer rectangle is preserved, rather than adding fractional retention.

Necessary155 adaptations are the actual `WebContents::GetNativeView().GetNativeNSView()` wrapper, the existing real `base::ListValue`/`DictValue` projection in place of the original80-byte metadata record, Aux class/product branding, and an ARC local popover reference across a callback that may close its page. The latter preserves callback-before-close order while keeping the presented object alive. Browser/source paths and metadata remain native; nothing is exposed to the page by this widget. The source has no icon or custom material to reconstruct.

`verification.json` records successful disposable apply-check/replay and all output hashes. No build, runtime, owner-profile read or OS operation ran, and the bounded REA session was snapshotted/closed. Actual compile, root Handler orchestration, native placement/selection/dismissal and complete import behavior remain unverified.
