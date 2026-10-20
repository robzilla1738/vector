# Original profile input and ordered selection

Bounded source recovery only. Adjacent raw excerpts pin the supplied thin SHA, instructions, exact float32 constants and actual current155 API anchors. No native edits/build, target launch, profiles or OS access.

## Actual event route and guards

Original `0464c418` receives a real located ScrollEvent through a parent handler whose region owner is at +0x28. It calls eligibility `0464c540`, converts event coordinates into the region's local coordinates, and requires containment in actual region bounds while idle. An active gesture (+0xa18) or committing switch (+0xa19) bypasses containment so the ongoing interaction receives its end event. Successful handling consumes the real cancelable event (original result OR3 = current handled|consumed); it does not manufacture an event.

`0464c540` first requires owner visibility (+0x1c8), nonnull widget (+0x188) and its real virtual query at +0xa8; exact widget-query name is not independently proved here. It checks actual feature records VerticalTabs or VerticalTabsLaunch, state owner +0x848 enabled byte +0x1e0, a real Browser/Profile, non-OTR, and event type35 (current `ui::EventType::kScroll`). There are additional real owner-state/geometry gates: state+0x90 and owner+0xa08/+0xa0c/+0xce0/+0xf78, a derived-width floor of151 in branched cases, and special child+0x5b0 fields+0x4ac/+0x4a0 restricting phases. Their raw branches are pinned; do not drop them or invent semantic field labels. Full input enablement needs the concrete current-owner equivalent of these guards.

After those guards, already-active/committing input is eligible. Idle admission uses actual momentum/scroll phases (below) and strict horizontal dominance.

## Delta, threshold, phase and progress algorithm

The real ScrollEvent layout agrees with current155's public fields: original +0xe0/+0xe4 are accelerated x/y, +0xe8/+0xec ordinal x/y, +0xf4 momentum enum, +0xf8 scroll phase. Each axis independently uses accelerated offset unless zero, then ordinal. No finger-count test is present in this recovered path.

- Idle start requires `abs(dx) > max(1, 1.5 * abs(dy))`.
- New-start branch is scroll phase Began, or phase None with momentum MAY_BEGIN. It stops relevant current animation work and restores affected visual state before accumulating the new interaction. Do not replace these real visual-owner effects with fake completion.
- Active samples accumulate dx and dy in owner+0xa10/+0xa14. If accumulated horizontal dominance is lost (`abs(sumDx) <= max(1,1.5*abs(sumDy))`), the real preview is cancelled, accumulators/active flag cleared, and the event is unhandled.
- Progress is `clamp(-sumDx / max(1, owner.width()), -1, +1)`. Width is the genuine OWNER VIEW bounds width at +0x1c0, not a separately inferred top-level window width.
- If the adjacent profile does not exist, apply real edge resistance `clamp(progress * 0.28, -0.16, +0.16)` before existing visual update `04649d80`.
- An active zero-offset phase-None event ends the interaction. A phase-End sample ends after its real update; non-start momentum also settles an active interaction. Committing input is consumed without starting a second selection.
- Finish `04657570` commits iff active, `abs(sumDx) >= 0.5*max(1, owner.width())`, AND `abs(sumDx) > max(1,1.5*abs(sumDy))`. Positive sumDx selects direction -1, negative selects +1. It clears real drag accumulation, verifies an actual adjacent path, then routes through `046579c4 ->04655e40`. Otherwise it invokes real cancellation `04657660`.

Idle phase eligibility specifically permits momentum NONE with phase None/Began/Update; for nonzero momentum it permits phase Began, or phase None with MAY_BEGIN. Already-active eligibility permits end processing instead of applying idle rejection rules.

## Real profile order and edge behavior

`046518d8` maintains the gesture roster at owner+0x820/+0x828, valid bit+0x838. It rebuilds through the already recovered `040fd7f4` order (real registry + isolated `aside.vertical_tabs.profile_order`), then resolves actual registry entries and excludes the omitted-entry bit+0x60 (matches current actual ProfileAttributesEntry IsOmitted member layout/accessor). It is not sorted profileIndex, current global active Browser order, or a list of paths introduced by arbitrary preferences.

The roster is frozen while a gesture is active (+0xa18), committing (+0xa19), animation is active (+0xd68), or `abs(actualProgress+0xa1c) > .001`. When idle at rest it invalidates and rebuilds; while frozen it reuses the cached roster once valid. Missing/OTR source clears it. The current shared `HorizontalProfileOrder` supplies the base order; actual gesture owner still needs this omitted-entry filter and lifetime/freeze behavior.

Adjacent helper `04657810` requires nonzero direction and roster size>1, finds the SAME Browser's current original-profile path, then chooses index-1 for negative or index+1 for positive. Out-of-range means no adjacent path: there is NO wraparound. `046579c4` cancels on missing adjacent result; otherwise it moves that actual path and direction into `04655e40`.

## Explicit selection and mouse buttons

Explicit profile-cell callback `046520e4` is bound at `04631ae4`, with raw region receiver and OWNED selected FilePath copy. A paired callback at `04631b50` is the cell's other action. The concrete cell class name is not claimed without further constructor metadata. It ignores empty/current path, obtains this same roster and derives direction -1 if target precedes current, +1 if after; its default is +1 when an index comparison cannot be established. It then moves the selected path to `04655e40`. This is a visual selection path distinct from direct profile-menu `04572824 ->040fe7a4`; routing every cell directly to load would omit original preview behavior.

Original `0464c280` is BACK/FORWARD MOUSE input, not ScrollEvent: accepts pressed/released types1/3, changed-button masks0x4000/0x8000 (matches current EF_BACK_MOUSE_BUTTON/EF_FORWARD_MOUSE_BUTTON), requires local region containment and real visible/widget state, and consumes the press. On release, with actual Browser/non-OTR, !committing, and roster>=2, it calls adjacent selection direction -1 for back, +1 for forward. No generic history navigation fallback is substituted by this proof.

Selection `04655e40` additionally rejects missing Browser/Profile, OTR or empty path through real cancellation, and ignores selection while +0xa19 committing. Parent owns its genuine borrowed-view/transform/settlement port. This evidence does not install a gesture, build a new UI or invent unavailable owner-state guards.
