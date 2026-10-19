# Stable tab-menu, deletion-dialog and data-sharing profile bindings

Six-source current155 platform adaptation. No whole Features Init, replacement
models/widgets, automatic dialog close or fabricated cancellation is introduced.
All existing controller and user-data objects remain alive.

## BrowserTabMenuModelDelegate

The actual delegate caches a Profile pointer and TabGroupSyncService, while
retaining the same SessionID and app-controller pointer. GetOtherBrowserWindows
filters by that cached profile; keeping it stale permits the wrong move-to-window
menu scope after Browser identity changes.

`CanRebindForAuxProfileSwitch(browser)` verifies actual user-data owner, exact
SessionID, normal/regular window, no app controller, actual BrowserView/widget,
and **that widget's** active Views menu. It uses the public
`MenuController::GetForOwnerWidget` whose actual contract returns null when that
widget's menu has closed/canceled; no global menu is closed or inspected for
content. Cached TabMenuModel objects can outlive the visible menu, and the actual
TabMenuModel contract requires rebuilding them every time shown. Counting all
live cached models would therefore incorrectly block switching indefinitely.

`RebindForAuxProfileSwitch(browser, target_profile)` additionally verifies the
committed target identity and empty actual model, then gets the real target
TabGroupSyncService from its existing factory. SessionID, model/delegate callbacks
and app-controller identity remain unchanged. The owner must complete all other
actual tab-strip interaction guards before invoking the transaction; this exact
window menu check is not a substitute for drag/other interaction guards.

## tab_groups::DeletionDialogController

The controller retains a Profile ref for real preference/sync/identity choices,
the stable actual TabStripModel, optional DialogState (including destructive action
callbacks), widget pointer, and permanent weak-bound show callback.

`CanRebindForAuxProfileSwitch()` requires **no DialogState, no widget, and no
in-progress CreateDialogFromBrowser modal show**. The last flag wraps actual
ShowBrowserModal using AutoReset: its macOS nested run loop can otherwise permit
a switch before widget_ is assigned, even if a close callback cleared state.
It does not replace or cancel the native modal operation.

`RebindForAuxProfileSwitch(browser, target_profile)` verifies exact user-data owner,
actual normal Browser/target profile, same TabStripModel identity and empty model,
then changes only the profile reference. It deliberately preserves WeakPtrFactory,
show_dialog_model_fn_ (including test injection), model observation and callbacks.
Invalidating all weak pointers would silently break the permanent production show
callback because it captures one of those same WeakPtrs. Active dialogs are
refused; no success/cancel/destructive callback is run by profile rebinding.

## DataSharingBubbleController

The real controller creates actual profile-bound WebUIContentsWrapper/DataSharingUI
and widgets; it also retains pending share-link/join/close/error callbacks.
Existing Close consumes its terminal share/join/close results, disconnects the
actual WebUI delegate, clears group progress, and queues the owned widget into
DeleteSoon. Clearing bubble_widget_ alone does **not** establish a cold owner.

The proposal records actual retired Widget WeakPtrs before the existing DeleteSoon
release. Rebinding waits until no valid retiring widget remains, alongside no
current bubble/widget/WebUI, no substantive result callback and no group progress.
Multiple retirements are tracked, not just the latest widget. Normal widget
ownership, close callbacks and deletion scheduling are preserved.

Existing Close leaves an unused error handler of its completed flow behind. This
is distinct from a pending newly installed error handler. A flag is set at the
start of a real Close (before terminal callbacks) and cleared by a new error-handler
setter. Consequently a terminal callback that installs new work cannot disguise
it as completed. Can permits only the old completed flow's unused error closure;
Rebind retires that closure without calling it, inventing an outcome or changing
any collaboration operation. All pending share URL/result callbacks still block.

`RebindForAuxProfileSwitch(target_profile)` verifies normal committed Browser
identity, actual user-data owner, stable actual TabStripModel and empty model,
then updates only the profile ref after those cold checks. Future Show uses its
existing genuine target WebUI constructor and existing browser/profile scope.
No fake WebUI, no navigation into a foreign BrowserContext and no broad dialog
close is used. Abort can bind the actual restored source through the same path.

## Evidence and limits

These are necessary current155 owner adaptations, not assertions that the supplied
old transaction contained the same named classes/offsets. The original supplied
04559f80/04164b0c service preparation remains separately pinned by parent evidence.
Manifest pins six actual read-only input files and outputs; supplemental evidence
pins underlying menu and collaboration callback contracts. Patch checking,
temporary replay, exact output hashes and unchanged shared-input comparison pass.
No native compilation, target execution, real profile data or runtime acceptance.

Disposable integration must verify exact-window menu refusal, modal nested-show
refusal, no changed dialog outcomes, real target menu/pref/service scope, retiring
widget delay, pending share callback refusal, completed unused-error retirement,
new error work refusal, and same-controller abort restoration. Collaboration
service/provider lifetime outside this controller remains the full owner's scope.
