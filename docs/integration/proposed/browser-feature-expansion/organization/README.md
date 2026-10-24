# Native organization domain — first execution slice

Native C++ implementation proposal for FX-CONTRACT/FX-ORG. The core is new feature behavior integrated through existing profile/pin owners, not the retired independent shell. Existing native UI geometry and assets are untouched.

Implemented source: stable per-profile UUID records; ordered Spaces; nested tab folders; profile-global pins with unload close policy; revision/CAS and exact persistent operation replay; typed mutations; archived subtrees with independent archive-batch preservation; section/folder collapse; current versus launch URL; revisioned deltas; bounded, generation-local Undo. Legacy pin import retains duplicate URLs, refuses malformed/unknown input, and never removes the original preference. Decoder rejects unknown fields and unsupported versions, and all uint64 wire values use canonical decimal strings.

The service serializes writes and publishes only after the exact native storage tuple succeeds. Owner change, uncertain result or write failure blocks publication and further mutation until native reconciliation. A queued preference write or timeout is not success. The root integrator supplies the dedicated single authoritative snapshot storage, loaded-profile coordinator and factory; no second writable preference model is registered here.

Core files are under `source/chrome/browser/aux/organization/`. `organization_model.cc` is compiled as real native C++20 with strict warnings for its focused syntax check. Chromium gtest sources describe meaningful model boundaries; they are not reported as runtime-passed until executed through an authorized harness. The codec/service depend on Chromium headers and require selected-graph object compilation/integration.

This first slice does not implement the full Space switcher or nested-folder Views, bind every native close command, certify isolation/drain, execute owner migration, launch the app or claim current-app acceptance. These remain explicit consumer/integrator work. No product signing, restart, cloud or provider access.

## Pin consumer integration slice

The existing pin grid, native pin observer, bookmark conversion, and cross-section drag owners now use stable logical IDs and actual asynchronous organization commit results. Native pin mutations are deferred outside TabStripModel observer reentrancy, failed mutations revert the native pin state, and bookmark-to-pin conversion deletes only the unchanged source bookmark after successful persistence. Pin identity is carried through WebContents replacement and SessionService extra data; the root integrator must install the matching tab-restore reader. URL matching remains only for importing legacy pin views without IDs; it never merges logical records or finds a different logical pin by URL. Existing geometry, typography, colors, and asset calls are unchanged.

`pin-consumers.patch` contains exactly 15 modified selected-source files and two new adapter files. `baseline/` hashes match the selected recovery snapshot; `manifest.json` pins both baseline and result bytes. The patch parses and applies in check-only mode to the pinned baseline. No Chromium object build or app observation has yet passed for this slice. Standalone codec compilation lacks the selected generated partition allocator include environment; it is not reported as a passing check.

Integration requests: register `chrome/browser/ui/tabs/aux_organization_pin_adapter.cc`; provide the root-owned organization profile coordinator/factory and storage; read `aux_organization_tab_id` from SessionRestore extra data into `RememberPinnedTabEntryId` before adding the restored tab. The existing full profile drain/startup gates remain required. Native unpin currently targets the first ordered Space until the window-owned active-Space contract is wired. Full Spaces/folder Views, nested-folder pin tiles, active-Space selection, shared-tab projections and end-to-end pin close/unload remain further work, not completed acceptance.

## Spaces and nested-folder Views slice

New native Views expose a compact Space selector/+ inside the existing Tabs header, name/icon dialogs, local mouse-wheel/horizontal-swipe stepping with threshold and one transition per gesture, and explicit end-of-list creation affordance. Logical folders reuse the supplied bookmark glyph geometry, row metrics, text treatment, chevron and native dialog pattern; they support nesting/collapse, rename, drag moves, keyboard traversal/reorder, global pin moves and context operations. New Pins and existing Bookmarks wrappers persist collapse through the single organization service and reuse the 180ms clip animation/reduced-motion path. No fake BookmarkNodes are created.

The exact selected-source changes now number 19, plus 11 new consumer/Views files. The root integration must mount these Views and provide the real window delegate. The concrete controller is the next slice. The tree’s Archive action intentionally delegates all live-view protection and close decisions to that controller; it does not issue a metadata-only archive directly. This slice has not yet passed Chromium compilation, actual-app interaction, nested-folder deletion/keep-contents UX, full favicon integration, or runtime visual comparison. Those remain explicit work rather than accepted behavior.

### Native window controller proposal

The controller now observes actual per-window TabStripModel/WebContents instances,
registers ordinary tabs atomically without URL deduplication, persists logical IDs
and active Space through SessionService extra data, and projects the shared list
only after existing ordinary tabs are represented durably. Each window retains
independent selected/loaded views. Remote URL updates become pending proposals;
they never navigate existing pages implicitly. Explicit application rechecks the
actual document, native ownership generation and live-work protections. The
retired independent Egress service is not linked or used. Selected protections
include real Agent groups/retained group markers, Actor tab state, attached
DevTools clients, runtime-owned identities, beforeunload, capture, split and
download state. This is not a fabricated daemon lease receipt.

Pin close unloads the native view while retaining its record; ordinary archive
checks all matching same-profile views and existing native protections. Browser
close-all is distinct and retains the shared list. Last-view/window destruction
can conservatively retain the logical record rather than claim archive success.
The parent integrator owns BrowserWindowFeatures lifetime, close/restore gates,
sidebar mounts and GN registration. This source has not yet passed native compile
or real multi-window acceptance; no app was launched or altered by this lane.

Compile-driven follow-up: fixed current Chromium accessibility name ownership,
LabelButton font API, menu enum include and local shadow errors. Unpin now uses
the initiating native window's actual active Space. Logical rows reuse the real
profile favicon service; pending remote URLs have a subtle marker and explicit
context action. These remain source changes pending the integrator's compile
and actual runtime checks.

### Retention and opt-in startup cleanup source

Space-local retention is separate from global pins and inherited by folder
children. Folder dissolution moves all children (including separately archived
children) without deleting or reviving them. Explicit folder-and-contents archive
uses the native all-window guards; pinned folders move into the initiating Space
and archive in one model commit. Archived records can be restored in the tree.

Cleanup is off by default. Its persisted `cleanup` object has `enabled` and
canonical-decimal `inactivityDays` (1–3650). The additive entry field
`lastActiveUnixMs` defaults to unknown/zero for older snapshots; unknown and future
activity dates are never old-tab candidates. Native user selection, explicit row
open and actual window activation supply timestamps. Maintenance writes retain
Undo history without adding activation entries; Undo never rewinds newer actual
activation timestamps. The profile service grants one startup cleanup pass only
after the real session restore and ordinary classification settle. Each archive
rechecks the actual selected model and every same-profile live view; active,
split, retained, pinned, loading, beforeunload, capturing, audible, downloading,
Agent-marked, runtime-owned, Actor-busy, attached-debugger and pending-navigation
views are skipped. Metadata stays recoverable; no permanent deletion occurs.

The parent owns settings/private-API exposure. Only native code may submit
`kMarkTabActive`; renderer claims are not user activity. New APIs are
`RecordActivity`, `TryClaimStartupCleanup`, and `LastUndoToken`. New actions append
to the original enum so existing replay fingerprints retain meaning. The codec
accepts older missing additive fields with explicit safe defaults and refuses
malformed present values. Pure model syntax was checked; model test cases for
retention/dissolution and monotonic activation/Undo are supplied but have not been
executed here. Native compilation, profile integration and runtime acceptance
remain the integrator's checks.
