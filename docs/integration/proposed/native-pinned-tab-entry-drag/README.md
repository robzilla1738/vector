# Original saved-entry outgoing drag and capture lifecycle

Incremental source-only proposal on `native-pinned-tab-entry-drop`73506be4f. Exactly the same two leaf files are changed; root owns region callbacks, preview presentation, native source application and GN. Ten original ARM64 pins plus two-file patch replay are checked by `python3 verify.py`. There has been no native compilation, target launch, signing, profile/Keychain access or drag observation for this proposal.

## Source behavior retained

The original class remains `VerticalPinnedTabEntriesView` with genuine `pinned_tabs` pref lineage documented in73506be4f. No BookmarkModel is substituted for that saved-entry model.

Original press460a9e8 records the real local grab offset and leaf press position, sets the actual mouse handler/capture and allocates a hidden noninteractive clone in a TYPE_DRAG Widget. Original drag460aec0 requires a held left-only press and strict movement greater than8px on either axis. The port uses those exact conditions rather than inventing a platform-dependent threshold. The same existing EntryView renderer provides the real ghost; no screenshot or substitute drag tile is introduced.

Each drag update snapshots the actual saved URL/title, displayed title/image and associated actual TabHandle. Its screen tile rectangle preserves the initial grab offset; screen pointer and bounds go to the region callback530. A null optional result keeps intra-leaf dragging. An engaged empty rectangle is a genuine detach route and keeps the leaf ghost. An engaged nonempty rectangle means the region owns presentation and the leaf ghost hides. In both ghost paths the actual source child remains opacity0. The region must perform its original admission and actual model actions; the leaf does not manufacture a bookmark node or OS drag event.

Intra-leaf reorder follows460b42c–460be20: choose the nearest existing tile to the dragged rectangle's centre by Manhattan distance (earlier wins ties), move the same real EntryView and corresponding entry record, update actual child indices, mark dirty, and animate the other real children with the existing source-derived140ms/60Hz semantic FAST_OUT_SLOW_IN curve. That curve is confirmed by root's original signed-table index11→21d005c and actual(.4,0,.2,1) constants; the port never casts an original numeric enum to155.

Release460c4a8 clears pressed/dragged flags, releases actual capture and restores source transforms/opacity. Ordinary dirty reorder posts a weak real pref write with the captured ordered records. A routed release invokes finish538 with the genuine last payload then cleanup540; failed completion refreshes the actual pref model. CaptureLost460ce54 posts weak460f1f8 cleanup without persisting reorder. Cancel therefore clears capture/presentation/callback ownership, not a fabricated successful drop. Source profile/model retirement cancels and destroys the old clone before rebind.

## Region API contract

```cpp
struct EntryDragData {
  aux::PinnedTabEntry saved;
  std::u16string title;
  ui::ImageModel image;
  std::optional<tabs::TabHandle> live_tab;
};
using EntryDragUpdate = base::RepeatingCallback<std::optional<gfx::Rect>(
    const EntryDragData&, const gfx::Rect& screen_tile,
    const gfx::Point& screen_pointer)>;
using EntryDragFinish = base::RepeatingCallback<bool(const EntryDragData&)>;
void SetEntryDragCallbacks(EntryDragUpdate, EntryDragFinish,
                           base::RepeatingClosure cleanup);
void CancelEntryDrag();
bool IsEntryDragInProgress() const;
```

`title` is the real displayed drag title; `saved` retains the persistent identity/title. Root's region binds original530/538/540 behavior, revalidates the actual TabHandle against its profile/model and owns bookmark creation/unpin/source-row removal. L4 owns the genuine bookmark-source row payload. These callbacks do not report success when unbound; local reorder remains a real independent original path, while finish without a real region handler returns false and reloads persisted state.

##155 adaptations and remaining integration

The drag Widget has explicit client ownership rather than the original bespoke owning holder. It uses actual TYPE_DRAG, translucent/noevents/nonactivatable parameters, existing EntryView painting and Widget colour mode. The prior original numeric live-tab ID becomes the actual stable TabHandle; no new ID is inferred. Current155 refresh defers during actual captured dragging to keep the same real child/press state while the vector moves. Weak checks protect synchronous UI callbacks and profile-bound queued writes.

Current leaf has no source for the original optional customRGB accent; none is fabricated. Broader hover-card/private-controller behavior remains the prior explicit gap. Root must bind region admission/update/finish/cleanup and real cross-section presentation; native compile and disposable drag observation remain required. A successful source replay proves the proposal's pins and output, not packaged UI parity.
