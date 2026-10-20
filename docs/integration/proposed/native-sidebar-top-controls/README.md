# Restore supplied native top-container controls

Source-only follow-up against the exact frozen native inputs in `manifest.json`. Root applies it after the current native build/package. Four source files; no GN changes, shared checkout edits, build, launch, signing, account mutation or OS action.

## Delivered behavior

The actual `TabStripComboButton` remains mounted and controls its own visibility through its real profile support, action state and pinned-to-tabstrip preferences. The port no longer unconditionally hides that owner. It removes the independently added `AuxAgentPill` mount, layout, hit-test and running-state forwarding, together with the unsupported vertical agent-tabs mount. The two previously recovered genuine **horizontal** agent-tabs mounts and the genuine Agent session/body owner are untouched.

Collapse returns to the leading position in the expanded top row; the native combo stays trailing. Simply unhiding the combo without this correction would place it over the independently moved right-aligned Collapse button. Existing compact/retained presentation, caption exclusion, action invocation, context menu, native combo orientation and profile/preference rules remain intact. The old unmounted AuxAgentPill class remains in the legacy sidebar source; it is no longer instantiated by this top container. This proposal does not replace it with a new design or an inert state API.

## Actual supplied authority

All binary addresses refer to the pinned arm64 supplied framework SHA `64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c`. `source-evidence.json` retains exact byte ranges, hashes, metadata/vtable bytes and actual155 API snapshots.

- Region `037e0980..037e0a08` creates the real top container through `03555540`, stores it at `+590`; the previously retained full region-constructor evidence in root `out/native-integration/original-sidebar-region-constructor.asm` establishes the callsite.
- Complete constructor `03555540..03555b40` creates Collapse through action302 (`3555734..40`), the actual update-badge child (`3555948`, stored `+370`), optional Unfocus/action66 (`3555998..3555a14`), and the real combo `04241c00` (`3555a30..3555a98`, stored `+358`, orientation from real state). There is no independent activity pill or vertical agent-tabs child in this constructor. The native update-badge is a separate existing gap, not replaced here with a successful update service.
- Actual metadata names `VerticalTabStripTopContainer`; the `+310` LayoutDelegate address point at `e68d358` points to thunk `03479410`, which adjusts `this` and reaches `03479440`.
- Expanded leading Collapse emission at `0347a450..0347a53c` reads child `+360`, uses the leading sequence coordinate `w22` as its x (`347a498/347a4b0`), and emits its bounds. Trailing combo emission at `0347a1e0..0347a2b8` reads child `+358`, subtracts its preferred width from the trailing coordinate. The owner-supplied upstream top-container source independently retains `bounds(left_alignment, ...)` for this same native Collapse and the native trailing combo layout; it is pinned as upstream source, **not mislabeled shipped fork source**.
- Actual combo constructor `04241c00..04242398` retains actual profile/action support. Current155's unchanged combo implementation owns the profile eligibility and `kTabSearchPinnedToTabstrip` / `kEverythingMenuPinnedToTabstrip` observers. This proposal changes neither those rules nor their stored values. It adds no incognito override, fake account state or forced action visibility.

The brief bounded Ghidra recovery of the layout was snapshotted and closed in lane `out/top-mode-recovery`; its pseudocode has external/raw-range truncation limitations. The retained whole-image LLVM and exact raw instruction ranges above are the authority for the changed placement; no truncated branch is ported as a complete layout implementation.

## Bounded limits

Reference146 and v387 differ in profile/window state and cannot establish a Browser/Agent mode selector's incognito policy. The pictured monitor/pointer controls have **not** been positively identified as this combo or recovered as a separate mode owner. This delivery does not claim Browser/Agent mode parity or infer that incognito omission is correct. Original update badge, broader original top-row styling/geometry and any additional mode-owner path remain separate recovery/observation work. Unfocus/overflow policy is preserved from the current native port rather than claimed newly recovered end to end.

## Lean verification

Run `python3 docs/integration/proposed/native-sidebar-top-controls/verify.py`. It checks all 13 ordered anchor counts, six supplied binary-range listing pins, vtable/name data and actual API snapshots, then replays the four-file patch in a disposable directory and verifies every final output hash. Native compile and actual UI acceptance remain root work; no fixture result is labeled native acceptance.
