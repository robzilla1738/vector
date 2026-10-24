# Navigation and shortcut completion batch A3

Four-file counted overlay against the frozen actual native inputs, worker base
`d11d6108b`. A2 frame/theme outputs remain the next integration input for their
separate paths; this batch changes no A2 path. The existing accepted frame,
material, typography, colors, corner geometry and popup dimensions are preserved.

## Implemented through actual owners

### One shortcut validation/publication path

The supplied per-row Settings API already calls `SetKeyboardShortcut` and
`ResetKeyboardShortcut`. Those paths previously bypassed the bulk profile
editor's macOS symbolic-hotkey reservations and startup/profile/CAS checks;
reset performed a second independent preference mutation. In-app edits now
submit the prospective native table through existing `ImportShortcutProfile`.
Its existing validation, one-write normalization, managed-pref refusal and owner
checks remain authoritative. A reset removes its default override during that
single publication. Existing unknown/invalid entries are not silently repaired
by an unrelated row edit. Equivalent modifier-order spellings of the command's
own default compare as accelerators, preserving intentional supplied default
menu displacement. The global Mini popup still uses its existing separate
registration owner and is excluded from in-app profile import/reset.

The atomic publisher retains a weak profile across synchronous preference/menu
observers and refuses completion if that profile disappears or changes. Native
startup/authorization predicates and the prospective validator are byte-exact;
this batch does not enable COLD or relax admission.

### Real remapped search-popup shortcut

The actual search popup listened for hardcoded Command+Shift+A through three
native input paths even after that command was remapped or cleared. Its Cocoa/
WebContents/application-monitor paths now query `IDC_TAB_SEARCH` in the existing
profile registry. All four shortcut modifiers are compared exactly, so extra
Control/Option no longer masquerade as the original chord. The actual view
accelerator refreshes on each invocation; a stale registered accelerator cannot
close the popup after a remap. Escape and supplied animations remain unchanged.

### Peek and Quick Window native callback boundaries

Creation retains the exact source WebContents/document and rechecks that it is
still the source window's selected local view after window creation/decoration,
before starting the requested navigation. Genuine subframe context-menu sources
remain valid; ownership is checked with `FromRenderFrameHost`, not a forced
primary-frame restriction. The new native popup must still own its exact blank
tab when decoration returns, and Chromium's navigation output must identify that
same real tab. There is no clone, replacement-page fallback or speculative load.

Showing, activating and focusing a newly created popup recheck its weak actual
owner before continuing. Promotion captures an explicit destination before
notifying observers, and refuses a destroyed destination rather than choosing
another one. Actual tab/history transfer is revalidated through Show/Activate,
including the unchanged native generation/profile/protected-work boundary.
Restriction/close/promotion UI callbacks check their weak controls after native
notifications before refreshing, so a synchronous close cannot refresh retired
controls.

## Audit that did not justify another source change

- Cmd+K/T/L and explicit blank-tab commit were already connected in A1.
- Full URL uses Chromium's actual preference, visible/pending location, and the
  native split toolbar observer. Password/userinfo omission remains intentional.
- Minimal/sidebar placement reuses the actual native toolbar and defers trusted
  controls across focus/menu/drag/animation. A2 adds its distinct retained-panel
  lifetime. No extra Boolean owner or replacement navigation UI is introduced.
- Existing Peek protocol/download/POST and active-work refusals remain intact.

These findings describe source wiring, not observed product acceptance.

## Exact integration and evidence

`source-plan.json` contains four native-relative paths, input/output SHA-256,
absolute projected sources, and 29 ordered single-occurrence anchor edits.
`native.patch` is their exact delta. `check.py` passed apply/reverse-check in a
fresh private scratch tree, every output/input hash, all anchor counts, unchanged
popup geometry/native decoration and unchanged startup/protected-work predicates.
`actual-replay-a1.json` pins the real API contracts reviewed: `IDC_TAB_SEARCH`,
`View::RemoveAccelerator`, and NavigateParams' raw-pointer output type, along with
the actual Settings endpoint, parser, placement and full-URL consumers.

Root should compose and compile these actual translation units together:

- `chrome/browser/ui/aux_keyboard_shortcuts.mm`
- `chrome/browser/ui/views/frame/aux_tab_search_bubble.cc`
- `chrome/browser/ui/aux_preview/aux_preview_controller.cc`
- `chrome/browser/ui/aux_preview/aux_preview_controls.cc`

No GN/registration, root composition, packaging or global status file is changed.
The shared native root remains untouched by this worker. No native build, app or
helper lifecycle, signing, provider, permission, credential or owner-state action
was performed.

## Still needing integrated acceptance

One short disposable real-app journey should cover a per-row remap/reset,
reserved-conflict refusal, effective search-popup toggle/cleared old chord,
Cmd+T/Escape, current-location editing, and Peek/Quick creation/promotion. Observe
the existing UI against the accepted/supplied reference after root's coherent
build. COLD/admission refusal remains a real prerequisite for those operations;
source or compile success must not be reported as runtime acceptance. Full-URL,
minimal, both-sidebars/corners and theme states still require that app check.
