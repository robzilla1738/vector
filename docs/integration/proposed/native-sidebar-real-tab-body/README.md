# Retire the independent sidebar body; retain actual native rows

Five-file source-only proposal against actual268 (including prior independent-footer retirement). Pending269 FilterService change is disjoint. No GN/new native source registration.

## Supplied ownership and observed deviation

Original region constructor37e0cd4..37e0e00 creates its custom `VerticalTabStripScrollView` at+5b0 and installs the actual native strip built by7fb6840; that vertical subclass invokes common strip constructor7fb4934. The complete supplied region decompile pins the separate header, saved-entry and bottom child owners. It does not justify an additional independent task-feed/bookmark body above the live tabs.

Current region inserts `AuxSidebarView` as an extra child before the actual model-owned `TabStripView`. Its `Rebuild` creates the exact extra UI observed by the parent: Bookmarks/Open bookmarks/No saved pages yet, Chats/New Chat/Show all and Tabs/New Tab. Those are independently authored projections. They are not the actual tab collection or the supplied saved-pin model. This patch retires the extra mounted child and its feed/drag/collapse coupling. Its old class remains recoverable, uninstantiated by the region; profile-menu implementations in the same source file are preserved.

Actual155 already owns live rows through `BaseTabStripRegionView::InitializeTabStrip` → `RootTabCollectionNode(actual TabStripModel)` → `TabStripCollectionController` → the same `TabStripView` and real pinned/unpinned containers. The restored source-based custom scroll is the actual unpinned scroll under that strip. The patch retains those owners, their row/action/drag/selection callbacks and custom scrolling; it neither creates a generic sidebar nor fabricates task rows. The real strip is ordered after the actual saved-entry leaf in155's region hierarchy, replacing its previous ordering after the extra independent child.

## Transaction and menu effects

The saved-entry leaf remains genuinely paused before transfer and rebound after matching commit/abort settlement. Region generation is owned by that real lifecycle instead of being borrowed from the retired task-feed view; duplicate active transfer is refused, stale finish tokens do not resume observations. Target's actual regular-profile/pinned-pref and resize checks remain. Header refresh and actual120ms preview capture remain at matching finish.

The old region `RebindAuxProfileSwitch` existed solely to replace the independent body's bookmark/pref/taskfeed sources. Remove that method and its two provider invocations rather than implement a successful no-op. Actual live tab collection migration remains controlled by the existing native transaction, and the real saved-pin/header finish remains in place.

A tiny public `CloseAuxProfileMenu` wrapper calls the existing real `RetireAuxProfileMenu`. Region invokes it at genuine Begin/mutation before identity changes, preserving the actual menu retirement effect previously performed by the old body Begin. Admission preflight does not close UI. Primary/kind7/kind8 menu implementations, actions and layout are untouched. Normal native close deferral and provider weak-boundary behavior remain unchanged; this does not claim forced CloseNow safety.

## Fidelity limits

This corrects a source-proven extra body, not every153→155 row difference. Full original row factory/model extensions, tab/group leaf paint/typography, bookmark-specific body ownership and detailed layout need further bounded recovery before a full body parity claim. The patch preserves existing actual155 tab rows instead of guessing those details. Source geometry already recovered for header/pager/saved entries/scroll remains intact. No claim that the parent screenshot is an accepted final appearance.

`python3 verify.py` checks source/ASM pins and independently replays all five outputs, verifies the removed body does not survive as an empty phase and confirms real pin/menu effects remain. Root should compile region, provider and sidebar wrapper, then observe the disposable native frame. No shared native writes/builds, target execution, owner profile, credentials, Keychain, OS grants or network calls were performed.
