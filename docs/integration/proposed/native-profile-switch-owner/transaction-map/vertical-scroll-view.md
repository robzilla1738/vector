# Supplied VerticalTabStripScrollView on Chromium155

`vertical-scroll-view.patch` restores the real custom scroll view from the supplied native class. It creates the two class files and adds them to the current vertical tab-strip GN targets. No region/tab-strip owner is changed here: the parent owns the real preview owner and must instantiate this class in that actual owner. The patch is staged, independently replayed and SHA checked; it has not been applied, compiled or run.

## Public owner contract

```cpp
VerticalTabStripScrollView::Axis axis_lock() const;
bool scroll_sequence_active() const;
void ResetScrollSequence();
```

The actual enum is undecided0, **vertical1**, horizontal2. This corrects the inverted initial checkpoint prose in ac943c34f. Original `4246048..6054` uses `csinc`: horizontal dominance stores2, otherwise1. The region's outer admission protects an existing **vertical** sequence from swipe takeover, except a fresh Begin or None+MAY_BEGIN. The parent must query this actual instance, not mirror these flags in an unrelated observer.

## Preserved effects

- Base `views::ScrollView(ScrollWithLayers::kEnabled)` remains responsible for genuine contents, viewport, scrollbars, layout, physical scroll and the explicit momentum-END-with-deltas fallback. Other custom scroll events are consumed with both handled and propagation-stopped, as in the original.
- The actual ordinal deltas determine axis ownership. The undecided stream accumulates until a component reaches6px (or a terminal event carries nonzero accumulated motion), then locks by `absX > max(1,1.5*absY)`. Importantly, an undecided but currently vertical-dominant event already scrolls vertically before the6px lock threshold; it is not delayed into a synthetic dead zone.
- Actual scroll offset is clamped against real contents height minus viewport height. The original `CurrentOffset`/`ScrollToOffset` calls remain real and preserve X. Excess vertical motion drives the original elastic transform rather than a screenshot or fake position.
- Elastic radius is `max(1,viewportHeight*.1)*1.5`. The original forward/inverse elastic functions preserve18,1.5 and `nextafterf(radius,0)` bounds. A reversed gesture first unwinds actual elastic displacement. Velocity derives from real event timestamps and presented displacement.
- The actual compositor animation observer applies the recovered critically damped expression `(start+(velocity+start*11.25)*t)*exp(-11.25*t)`, the .31 initial velocity factor,80ms stale-velocity cutoff, and .1px terminal epsilon. No timer substitutes for frame callbacks. Shutdown and removal release the actual observer.
- Both explicit reduced-motion command-line switches bypass this particular supplied elastic effect; the source independently checks both, then the real platform animation preference. The general override order in `gfx::Animation` is preserved elsewhere.
- Genuine external content scroll changes (beyond .01px), viewport/content size changes, invisible/detached state, mouse pressed/dragged, key pressed and mouse wheel reset the source sequence/elastic effect. Own physical writes are distinguished from external scroll callbacks. Existing lists and callbacks remain owned by the same real view.

## Source-backed155 adaptations

The supplied153 class is absent in current155. It is restored as a real ScrollView subclass with the real `ui::CompositorAnimationObserver`, event handler, `AddContentsScrolledCallback`, public layout/input/visibility hooks and metadata macros. The owner integrates it with actual tab contents. No old Browser/Profile pointer or profile service is added.

The original member AutoReset-like bool around self-scroll would write a deleted owner if a current155 observer synchronously destroys the window. This port uses a WeakPtr check after each external UI effect before subsequent member access; permanent callbacks are not invalidated to simulate safety. Its constructor callback is weak-bound and its destructor removes only its own handler/observer/subscription.

## Evidence and limits

The original class constructor is `42455c0`, reset/bounds callback `42457fc`/`4245d8c`, scroll handler `4245ec0`, spring start `4246640`, compositor frame step `424695c`, wheel `4246ba8`, layout `4246bd4`, hidden-state callback `4246c8c`, and input reset callbacks `4246cc8`/`4246ce8`. Bounded raw artifacts and focused raw-fragment Ghidra results are pinned in the recovery JSON. Decompiler output is not original compilable C++; raw instruction branches and real upstream APIs establish the adapter. Some decompiler external-tailcall/entry boundaries are explicitly incomplete, so these are not accepted as invented full functions.

The parent still owns exact region hover/collapse animation writers, width151 admission, real preview/gesture selection and UI settlement. This class by itself does not enable a gesture or claim profile-switch parity. No shared native source write, native build, target execution, user preference/profile read, OS grant, Keychain or network operation occurred.

## Additional inherited layout dependency remains explicit

The original constructor also sets an inherited ScrollView bool at `+3a9`. This is not `UseContentsPreferredSize`: the original property metadata literal at `dd448a5` selects the descriptor at `e350a20`, whose getter/setter `a6a8c78/a6a8ca4` access `+3a8`. The distinct `+3a9` enables an original initial preferred-size layout path (`43e9e14..9f88`). With the real preferred-size/layer/content conditions satisfied, it calculates a nonempty preferred size once, skips provisional viewport/content layouts, and reuses the size for bar visibility and final layer sizing. Current155 lacks that inherited switch and path. This proposal does not reinterpret it as the existing preferred-size setting, nor enable that existing setting on behalf of the caller.

The class's actual event/axis/elastic lifecycle is restored here; full original layout fidelity also requires a separate source-backed base ScrollView adaptation before claiming the whole class behavior accepted. Parent has been notified. The constructor includes this limitation at the integration seam. No guessed replacement flag or layout-success stub was added.
