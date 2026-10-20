# Supplied native Tabs section and header action buttons

Three new files implement original region670's genuine `Tabs` section and
`TabsHeaderActionButton`466afb0 (metadata466bc8c, literaldecc089). No region,
backend, shared native file or GN is changed. `manifest.json` has null baselines
for all three new paths; root registers the `.h/.cc` in main UI and packages the
functional glyph include with them. Actual shared AuxSectionView is required.

## Assembly contract

```cpp
auto section = std::make_unique<aux::AuxTabsSection>(
    aux::AuxTabsSection::Actions{actual_tidy_callback, actual_clear_callback});
```

Both callbacks are required, without placeholder fallbacks. Root owns original
4630098 Tidy /4630b48 Clear consumers, confirmation and subsequent state. Pressing
one of these controls **only calls that actual callback**; the view does not
manufacture an operation/result, change tab ownership or show invented progress.
The region inserts real content into inherited `contents()` and retains the
actual section/header pointers, rather than reconstructing a tab list here.
Getters `tidy_button()` and `clear_button()` expose real actors for genuine
existing enabled/visibility consumers. `SetTidyBusy(bool)` is presentation only.

Constructor037dfc80 lines2605–2768/raw37e3034..34f0 proves the non-disclosing
Tabs header with absent primary/secondary, outerTLBR(4,0,0,0), contents top4,
actual horizontal accessory containing Tidy then Clear. It preserves the shared
header's original disabled/no-action behavior: child action buttons remain
separate real actors. No new section toggle or header context menu is invented.

## Exact action rendering

- Clone the actual Tidy e9d5618 and Clear e9d49d8 vector descriptors: all305
  PathElements across both paths re-encode bit-for-bit against the original
  float32 bytes. No stock icon substitutes, raster redraw or new artwork.
- Actual12×12 icon and ordinary12px views::Throbber, and label context5/style4096
  (`CONTEXT_LABEL`/`STYLE_PRIMARY` in155), derived12px medium500. Source label
  alignment3 is ALIGN_TO_HEAD and elide4 is **ELIDE_TAIL**, not FADE_TAIL6.
  Child input is disabled; the actual button receives the event.
- Original2a105d0 is positively **FlexLayout**, not a BoxLayout assumption:
  metadataa6d2710/2794 names FlexLayout and the actual source header
  `../../ui/views/layout/flex_layout.h`. Layout is horizontal, cross-center,
  interiorVH(2,6), collapsed margins, default child marginsTLBR(0,0,0,4).
  That default also applies to the label and spinner. The accessory's separate
  horizontal FlexLayout defaults right4, with Clear explicitly overriding its
  own final margin tozero. There is no guessed constant total width.
- Cached preferred size is the base unconstrained width and literal24px height
  (466bd88). Genuine child preferred-size changes invalidate it; SetBusy also
  resets it. Original4f0/4f8 are this optional size cache, **not** a busy flag.
- State paint466be54 uses radius8 on full bounds, role247 hovered, role269
  pressed, and no normal/disabled fill. Focus highlight path is also8. Source
  native left-button/on-release semantics, always-focusable behavior, no
  animation-on-state-change and disabled ink-drop action are retained.
- Actual private recipes: role226 SidebarMutedForeground dark73FAFAFA /
  light730A0A0A;247 SidebarItemBackgroundHover aliases220 dark14FAFAFA /
  light140A0A0A;269 ControlPressedOnSubtle reuses saved215 SurfaceBorder recipe
  dark26FAFAFA /light1A0A0A0A.269's saved recipe is written35e6e7c, read35e988c
  and installed35e9904. Current actual widget GetColorMode selects variants;
  old numeric IDs are never reinterpreted as unrelated155 ColorIds.

## Busy and accessibility correction

Actual464d4b0 shows/starts or hides/stops the real spinner, inversely shows the
icon, sets Tidy enabled=!busy, invalidates optional preferred size, and sets the
header always-accessory flag tobusy using shared SetHeaderAlwaysShowAccessory.
It does not change the label or synthesize backend completion.

**The busy string target is ViewAccessibility, not TooltipText.**464d520 reads
button+2c8, and464d5b0 calls116d8d8 on that object. This is the same object/call
as the constructor's separate accessible-name initialization466b1dc..28c.
Busy AX name is the exact15-unit `Organizing tabs` atdf87fee; nonbusy restores
the current real tooltip string. Hover tooltip stays `Organize tabs with AI`
(df87a0a,21 units). Initial AX name is Tidy; Clear retains Clear. This fixes the
initial recovery note's tooltip interpretation before shipping it.

Chromium155 adaptation: its ordinary Throbber accepts only public ColorId and
keeps its paint epoch private. A subclass retains the real native base timer,
Start/Stop/IsRunning and public spinning painter, while mirroring the start
instant for exact recovered role226 RGB/alpha paint. It introduces no fake
progress, replacement timer, smoothing delay or new reduction-motion policy.
The mirrored epoch is recorded just before base Start's private epoch; their
subcall-scale timing difference is a platform adaptation, not claimed frame-
phase equivalence. Actual widget observation remains required.

## Evidence and limits

Fourteen bounded original code ranges, original metadata/vtable/data/name-map,
UTF16 strings, exact icon descriptors/path bytes and current155 API snapshots
are pinned. `python3 verify.py` checks their hashes, both bit-identical glyphs,
fixed semantic mappings/source ordering and disposable three-file patch replay.
Raw LLVM remains authoritative; only constructor/callback decompiles were
accepted because Ghidra did not automatically admit every virtual leaf in the
bounded image. REA session was snapshotted and closed, no target execution.

No C++ compile, region mount, live backend action or visual/runtime acceptance
is claimed. Root must wire real backend busy/enabled/content effects before
claiming this surface works in a browser. No native/shared writes, owner data,
OS actions, build, signing or release occurred.
