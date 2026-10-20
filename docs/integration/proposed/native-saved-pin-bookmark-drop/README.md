# Original saved-pin → Bookmarks owner and conversion

This proposal implements the actual inner Bookmarks insertion projection and
saved-pin finish mutation. It changes no shared checkout, GN or region mount.
The six-output patch applies after actual343 (owner330+328 correction,
saved-pin leaf336). `manifest.json` pins every exact baseline/output; new
files have a null native baseline. No supplied web component/CSS changes.

## Callback identity correction

The region constructor `037dfc80.c` lines977–1018 and raw
`37e0bd8..37e0cd4` bind **462b5c0 / 462ba98 / 462beac** to real saved leaf6a8
through4606ee0. These are the saved-pin530/538/540 callbacks.

**462d99c / 462e4bc / 462e9d8 are Chats callbacks**, bound to another child.
They must not be installed on saved pins. This corrects the initial assignment's
address mix-up, rather than treating task IDs as bookmark identities.

## Implemented source contract

- `UpdateExternalBookmarkInsertion(url,title,SCREENpoint)` returns the actual
  optional SCREEN insertion rect. Invalid URL, unavailable/unloaded model,
  hidden inner view or pointer outside its real screen bounds clears projection
  and rejects. It completes existing bounds animation once, captures original
  row bounds, and never hit-tests moving animation bounds. The supplied title
  parameter is retained for callback compatibility; original4612384 does not
  read it.
- First midpoint after the pointer selects the insertion gap. A pointer inside
  a folder's entire frozen rect targets child0 and highlights that folder;
  its visible gap is immediately after the folder row. No invented horizontal
  indentation threshold is applied. Nonfolder targets preserve actual parent
  and child order. Empty content uses the original first-visible permanent root
  order (local bar/other/mobile, account bar/other/mobile), then first nonnull
  root in the same order.155's account-root getters enforce the transport
  feature invariant themselves (`BookmarkModel` API snapshot).
- A moved gap updates only the affected rows with the source36px displacement
  (32px row +4px spacing), preserving real BoundsAnimator clocks. Returned
  rectangles use frozen row bounds; the after-last target is bottom+4. Empty
  content uses `(8,1,max(0,width-16),32)`; an actual target parent's depth adds
  the source14px indentation. No new popup, ghost or contents-height/layout
  minimum is introduced.
- `ClearExternalBookmarkInsertion(animate)` clears target/gap/folder, restores
  row bounds through the actual animator or direct bounds, and clears source
  indicators. Actual model rebuild/retirement also clears the separate external
  state. The155 extensive-model-transaction boundary clears it before nodes
  can be removed without immediate row rebuild.
- `CommitExternalBookmark(url,title)` snapshots the real target, clears
  projection **before mutation**, calls the real loaded BookmarkModel's AddURL,
  falls back to the same default root only without a valid explicit target,
  clamps the exact child index, and uses host/spec only for an empty title.
  Success queues the existing actual pending-navigation representation and
  invokes the existing activated callback.155 weak-owner/reacquisition checks
  prevent returning a retired/replaced node after notifying callbacks.
- `ConvertSavedPinToBookmark` implements462ba98: genuine AddURL success must
  precede exact optional TabHandle unpin and first exact saved-pref removal.
  Failed AddURL leaves the saved pin and live pinned tab intact. The actual
  remove-only6c0 branch adds no bookmark and returns **real saved URL absence**,
  including false if a duplicate survives first-match removal. Neither branch
  closes tabs or infers tab identity from URL. Existing real model/profile/
  WebContents checks are revalidated across notifying mutations.
- Source finish explicitly refreshes the real saved leaf. The narrow public
  `RefreshAfterSavedEntryChange()` forwards its existing private Refresh;
  this does not abuse profile rebind. No other leaf behavior changes.

## Required genuine region wiring (integrator-owned)

New inputs: `frame/aux_saved_pin_bookmark_conversion.{h,cc}` in main UI target.
Existing dependency families are already used by the opposite conversion helper.

Update callback must preserve original462b5c0's **actual** outer section
visibility/expanded state, genuine admission owner and screen bounds. While
inside the real outer section call the new inner insertion API. If engaged,
clear an active remove hint; feed the real cross-section preview the original
screen tile/image/display title, preserving its vertical grab fraction
`height<1 ? .5 : clamp((pointer.y-tile.y)/tile.height,0,1)` and target row Y
`pointer.y - trunc(fraction*target.height)`. Return the engaged source row rect.
The region owns preview presentation, actual expansion-hover lock and its
cleanup; this proposal does not substitute a new widget/lock.

When rejected/outside, clear inner insertion(animated), hide the real preview
and release its real lock. Source only enters remove-only6c0 when the pointer
is **more than12px below actual saved leaf's screen bottom**. It then uses the
real original Remove bookmark hint and returns engaged empty Rect; otherwise
clear that hint/state and return nullopt. Nullopt versus engaged-empty must
remain distinguishable by the saved leaf.

Finish callback:

```cpp
aux::ConvertSavedPinToBookmark(
    *browser, *saved_pins, *bookmarks,
    aux::PinnedTabEntry{data.saved.url, data.title},
    data.live_tab, actual_remove_without_insertion_state);
```

Use `data.title` (actual displayed title supplied by the original callback),
not a fabricated title or ownership inferred from URL. On success preserve the
original region refresh/layout callbacks462c188/4645400/630474(false); the
conversion helper owns only model/pref effects, not region geometry.

Cleanup462beac always calls inner clear(animated), stops/hides the actual
preview, releases the actual expansion lock, clears6c0, and retires a real
remove-hint widget if present. Leaf release already snapshots its data and
resets its own capture/drag state before invoking finish; keep its weak checks.
The region must also invoke cleanup on cancellation/profile retirement.

## Evidence and limits

Four source ranges include complete update/default/commit/clear/AddURL and
saved-pin callbacks. Raw LLVM is authoritative where bounded Ghidra marks
external SchedulePaint tailcalls as bad instructions; the first truncated
4612384 attempt is deliberately not used. The retained full4612384 slice is
complete. Native API snapshots and original constructor evidence are pinned.
`python3 verify.py` validates exact original bytes/data, API snapshots,
source ordering invariants, and disposable patch replay to all six output hashes.

No native compile, actual drag observation or UI parity acceptance is claimed.
The real region mount/effects remain integrator-owned and required. Existing
independent body retirement is still held until genuine complete owners mount.
