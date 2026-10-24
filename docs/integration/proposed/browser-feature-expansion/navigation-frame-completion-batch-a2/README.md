# Frame and theme completion batch A2

Implementation overlay against the frozen, actual native inputs at detached
`12fa305ef`. This extends the integrated A1 command/Peek work. It preserves the
accepted default design and uses the existing actual frame/controller owners.

## Implemented

- A retained sidebar keeps checking pointer/focus/menu/drag ownership after the
  original retaining one-shot timer fires. The timer previously stopped itself
  before the callback, and active-owner/inside-pointer returns never rearmed it.
- A force-collapsed edge latch can reacquire on a later eligible native event.
  Force-collapse still owns its original priority and edge producer eligibility.
- Retained width/insets stay intact through the existing hide motion. The real
  `kCollapseOnHover` completion retires the retained surface afterward. Clearing
  it at hide start would change slide-out geometry and cause the corner jump.
- Opt-in sidebar URL placement now has a distinct navigation-retention request.
  It acquires the same retained/floating geometry while the actual native toolbar
  has deferred relocation. Releasing URL ownership does not clear browser/edge
  requests or menu/drag locks. Pending release callbacks recheck current owners.
- The placement request retires without callbacks at widget removal, tab-model
  teardown, and the source-profile pause boundary. Actual focus/placement updates
  release it normally. The request is absent from public menu-lock inputs, so it
  cannot make its own relocation deferral self-sustaining.
- Native theme preview/apply/reset/preset completions use weak editor lifetime
  checks after callback-producing theme/pref operations. Reentrant mutations
  cannot enter a write already in progress. Cancel revokes the caller's existing
  preview even if policy/accessibility changes make editing unavailable; it does
  not create a new editor for revocation.

No new preferences, protocols, timers, motion curves, widths, insets, radius,
colors, opacity, material, typography, assets, GN targets or registrations are
introduced. Navigation-retention behavior is exercised only by the existing
opt-in sidebar URL placement producer. Theme visual consumer code remains exact.

## Integration

`source-plan.json` is the complete six-file manifest. Every file records the
actual input SHA-256, absolute projected output, output SHA-256, and ordered
single-occurrence replacement anchors. `native.patch` is the matching exact
patch. Do not regenerate against a changed native input without review.

Paired producers/consumers:

1. Existing `BrowserView::UpdateAuxFramePresentation` supplies the actual
   collapsed/deferred sidebar-navigation hold.
2. `VerticalTabStripRegionView::SetAuxNavigationPlacementHold` forwards that
   lifetime to `ProfilePreviewAdmission::SetNavigationRetention`.
3. Admission retains existing frame geometry, independently of pointer owners.
4. Actual hide completion flows from `OnAnimationProgressed` to
   `HoverCollapseSettled`, after the native controller's ended notification.
5. Widget/tab teardown and `BeginAuxProfileSwitch` revoke the placement request
   without altering original pause/rebind ordering or scheduling teardown layout.

The narrow `browser_view.cc` change is only the approved source-profile hold
release in `BeginAuxProfileSwitch`. No registration/packaging/global composition
files are included. The active native tree remains unchanged.

Parent integration should compile the affected translation units together:

- `chrome/browser/ui/views/frame/aux_profile_preview_admission.cc`
- `chrome/browser/ui/views/frame/vertical_tab_strip_region_view.cc`
- `chrome/browser/ui/views/frame/browser_view.cc`
- `chrome/browser/themes/aux_theme_editor.cc`

Existing integration receipts identify the latter three object targets as
`obj/chrome/browser/ui/ui/vertical_tab_strip_region_view.o`,
`obj/chrome/browser/ui/ui/browser_view.o`, and
`obj/chrome/browser/themes/themes/aux_theme_editor.o`. Admission is also changed
and must be included rather than relying only on those historical targets.

## Focused evidence and remaining acceptance

`python3 check.py` passed exact apply/reverse-check in a fresh disposable scratch
tree, all six output hashes, all 32 replacement counts, unchanged native inputs,
identical animation duration/tween expressions, and identical theme visual
consumers. `actual-replay-a1.json` pins the reviewed real timer, animation, native
retention, placement and layout contracts. Actual retaining one-shot behavior is
`Stop(); task.Run();`; the native controller notifies `kEnded` before clearing
its current motion, so the completion test observes the genuine hide motion.

This worker did not compile or execute the product. Source replay is not runtime
acceptance. Parent must still build and observe a small real-app pass: pointer
enter/leave through a full hide, focus/menu/drag retention, docked/hover/sidebar
URL modes, both-sidebars/corners, and theme preview/apply/cancel across a profile
switch. Default geometry/material fidelity and remaining fullscreen/narrow-window
states require actual app comparison; this patch does not claim those accepted.
No new provider, owner-state, helper lifecycle, signing or release operations were
performed.
