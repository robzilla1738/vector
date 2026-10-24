# Navigation completion batch — 2026-10-24

This worker slice extends the existing supplied palette and fixes native command/preview handoff boundaries. It preserves default frame styling, geometry, toolbar/sidebar placement, materials, typography and original component class names. The shared Chromium checkout and accepted app are unchanged.

## Implemented

- Cmd+L receives the active view's actual visible URL, including a pending typed destination, rather than the previous committed URL or shared logical-tab metadata.
- Every palette invocation expires when its actual profile cookie epoch changes, profile restore is pending or its original target is destroyed (including an uncommitted target with navigation ID0). This does not require Aux sign-in or fabricate account/startup authority.
- Tab activation retains the chosen actual WebContents, then reacquires its index after palette dismissal. It refuses changed profile/window/active-source context, a removed tab or a stale index; it does not focus another window.
- Typed URL/search navigation rejects malformed UTF-8, rechecks the originating view/profile after dismissal and validates that Chromium accepted the actual target in that window/profile. Current-tab beforeunload remains Chromium-owned; a commit reply does not claim a finished network load.
- An explicit **New blank tab** action appears in the existing New Tab/Commands palette rows. Merely opening the palette still creates nothing. Choosing it calls native `chrome::NewTab` directly, preserving the current NTP/insertion behavior and avoiding the `IDC_NEW_TAB` interception that would reopen the palette. The backend accepts this kind only for the New Tab/Commands modes in a normal window. There is no new command ID, extension schema or replacement screen.
- A disabled/terminated Agent extension no longer intercepts Cmd+T into an unavailable extension page. The real enabled registry set decides whether the supplied command host is available; the existing browser fallback remains usable.
- Peek/Quick Window promotion now retains the exact source tab/view and weak destination before Space selection. It reacquires both owners and rechecks the same tab, active work, profile/epoch and chosen Space before moving the actual TabModel/WebContents/history. A changed destination cannot become a stale raw-pointer transfer. This does not replace the organization controller or clone/reopen the page.

## Source ownership and integration

Baseline worker HEAD is `e34540943`. Actual native inputs are the current files under `/private/tmp/aux-chromium-recovery-snapshot-20261023/src`; they are read-only to this worker. `source-plan.json` has exactly two native paths and twelve counted anchors, with original/final hashes and full projected sources. `native.patch` is their exact delta. The active replay receipt is `actual-replay-a4.json` (source-plan SHA256 `eade355627fe09c10e109a607284708dfbaae551fc93980ffcc12d35a5202908`). Exact disposable replay and reverse checking passed; original native bytes remain unchanged.

Earlier a1/a2/a3 source/replay records are historical and do not qualify the final source. Native API inspection corrected the global `NewTabTypes` qualifier before compilation and added the enabled-extension check. No failed native compilation is claimed. The initial UI check-runner import path failed before verification; it was corrected and the actual full-composition check then passed.

The worker also edits the existing `vendor/provided/aux-navigation-command-bar.mjs` adapter and its focused test. The integrator owns final staging fingerprints/revisions, full source composition, native compilation/GN/packaging, and global STATUS updates.

Affected existing native targets:

- `obj/chrome/browser/ui/ui/aux_tab_search_bubble.o`
- `obj/chrome/browser/ui/ui/aux_preview_controller.o`

No new native registration is required. The existing generic commit schema already carries the bounded native command kind; the real native implementation decides its permitted modes/behavior.

## Actual focused evidence

The seven existing/extended supplied-adapter tests passed in under one second. They exercise native commit ownership/error propagation, local-view logical identity, the new explicit blank action and real pinned supplied-asset adaptation/syntax/class preservation. `actual-focused-ui-a1.json` records the observed command and exact tested module hashes. It is not a native browser test.

`actual-ui-composition-a1.json` independently checks the three affected supplied assets through the complete current feature transform chain, including downstream Ask/context/theme/shortcut adapters: exact counted-anchor replay, syntax and every original component class name pass. No asset or stylesheet is changed by this slice. This is composition evidence, not a staged or observed app.

## Remaining

Root must merge the two native overlays and adapter with the other lanes, compile the affected units and make the coherent full candidate. Actual Cmd+T cancel/blank commit, pending-URL editing, profile/tab changes during dismissal, native beforeunload, disabled-extension fallback and Peek/Quick promotion journeys remain unobserved. Sidebar dock/hover/minimal/corner/fullscreen/narrow states, theme preview/cancel and shortcut remapping still require actual app verification; this source review does not attest their UI quality. No native object/full build, package, product/helper lifecycle, signing/release, OS grant, owner state or provider/cloud request occurred in this worker lane.
