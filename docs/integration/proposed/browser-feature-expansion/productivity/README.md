# Reviewed Tidy Tabs integration

This slice replaces the supplied Tidy action's immediate duplicate closing and cross-window regrouping with a current-Space proposal. Existing supplied search rows, typography, glass, dimensions and animations render the review; no replacement screen or CSS is introduced. Duplicate URLs remain separate logical tabs. Pinned, protected, other-Space and non-web entries are excluded.

## Live integration owners

- `vendor/provided/aux-productivity-integration.mjs`: count-checked background `Yw` replacement, authenticated `D.models.productivityPlan` / `productivityCancel`, supplied centered search row adapters, and actual daemon `modelsRouter` accountProcedure additions.
- `vendor/provided/aux-productivity-proposals.mjs`: shared validation and review projection; injected into those actual source owners, not a separate product backend.
- `navigation/source/chrome/browser/ui/views/frame/aux_tab_search_bubble.{cc,h}`: retained native proposal, only retrievable from its live search WebContents; close, profile/active-target change or a new invocation invalidates it.

Run the UI adapter **after branding and after the navigation adapter**. Apply `transformAuxProductivityDaemon` to both paired source entries before packaging. The helpers use the existing account ModelsManager and modelRuntime. They never read raw credentials outside that manager, select a different provider, or use the retired hosted planner. The configured fast model, or configured default when no fast override exists, must resolve exactly to its explicit non-hosted provider/model. Missing configuration is an actionable error. No payments surface is added.

Only titles and origins of at most 128 eligible tabs plus the user's existing Tidy prompt go to that model. No page contents, URL paths, query strings, history or other profile data is included. One in-flight call per account is held by the existing broker pending-work boundary through actual completion. Explicit profile/context cancellation, shutdown and a 60-second deadline abort the provider signal; cancellation does not falsely acknowledge completed drain. Provider resolution itself remains awaited if its existing implementation cannot be cancelled.

## Integrator native API contract

Parent-owned native API registration must validate the actual sender and current native profile/window/Space. Snapshot fields: `success`, optional `error`, `accountId`, `ownerGeneration`, decimal-string `revision`, `spaceId`, `tabs`. Each tab has stable `id`, `spaceId`, title/url, pinned/protected flags. An absent account is unavailable, never substituted.

`showOrganizationProposal({proposal})` validates the complete proposal against the current snapshot and passes its canonical form into `ShowAuxOrganizationProposal`. Proposal fields: UUID `proposalId` and `operationId`; accountId; ownerGeneration; expectedRevision; spaceId; `createFolders:[{id,title,parentId,spaceId}]`; `moves:[{tabId,folderId,spaceId,index}]`; `summaryRows:[{id,title,folderTitle}]`. Parent must derive/validate summaries from canonical native titles and proposed folder names, rather than permit misleading renderer summaries.

`applyOrganizationProposal({proposalId})` retrieves the retained native proposal using `GetAuxOrganizationProposal`, validates revision/owner again, and submits one atomic native ExecuteBatch. No partial moves, deletion, closing or deduplication. Consume through `ConsumeAuxOrganizationProposal` only after success; native operationId supplies replay protection. Return `{success,revision,undoToken,error?}`.

`undoOrganization({ownerGeneration,undoToken,expectedRevision,operationId})` uses the same actual profile/window and native CAS/Undo service. The review stays open after Apply so Undo remains immediately available. Later changes cause refusal rather than overwriting them.

## Focused evidence and remaining verification

`node --test vendor/provided/aux-productivity-integration.test.mjs`: 5 passing checks cover protected scope, duplicate identity preservation, stale account/revision refusal, redacted provider metadata, explicit-provider-only behavior, cancellation, malformed model output, retained-ID Apply, CAS Undo, actual supplied transform anchors/syntax, and unchanged search CSS classes.

No provider call, app launch, native build, owner-profile access or signing was performed in this lane. Native API compilation, integrated staging, actual provider configuration and one approved runtime review/Apply/Undo remain integrator acceptance work. Fixture success is not a claim that the packaged app is ready.


## Document-bound tab references

The additional `aux-productivity-tab-context.mjs` adapter captures native document capabilities when the user selects a tab/group in the existing mention picker and when the existing browser binding attaches the current tab. The supplied Tiptap attribute/parser/attachment pipeline carries that capability unchanged. Composer submission validates it before preparing the message and again after an awaited user confirmation; errors keep the draft and use the existing toast UI. A cached target ID plus URL is never enough, and a restored draft cannot silently acquire a new document identity.

New native source `productivity/source/chrome/browser/ui/aux_tab_reference_context.{cc,h}` implements `CaptureAuxTabReferences(sender,references)` and `ValidateAuxTabReferences(sender,references)`. Register installed-Agent-only `auxBrowserPreferences.captureTabReferences({references})` and `validateTabReferences({references})` wrappers in the parent-owned private API. Each returns `{success,references:[{targetId,url,documentCapability}],error?}`. Inputs have targetId/url; Validate additionally requires documentCapability. Maximum 64 references per call; at most 256 live document capabilities per sender document, with reuse and expired-document pruning.

Target resolution requires an existing DevTools target, actual native TabStripModel membership, exact sender Profile, HTTP(S), no pending navigation and the expected committed URL. Both sender and target use Chromium's public `RenderFrameHost::GetWeakDocumentPtr()`: a same-URL document reload invalidates the reference even when WebContents and target ID remain unchanged. The helper also checks the current primary frame, so BFCache restoration cannot authorize a different active document. Off-the-record senders are refused by this boundary.

Three focused JavaScript tests cover capture identity matching, failure without modifying a draft, the five actual supplied transforms, syntax and unchanged existing CSS classes. Native behavior is source-implemented, not runtime-verified in this lane; parent must compile and exercise a disposable same-URL reload/profile mismatch.

## Dequeue and actual content reads

`aux-productivity-context-read.mjs` now adapts the supplied daemon and authenticated extension bridge. Message admission validates before attachment preparation. The existing low-level steering/follow-up queues peek and validate before draining; cancellation, changed queue contents, stale references and changed profile bindings preserve the queued messages. The actual metadata schema is passthrough and `prepareAttachments` preserves tab fields. Session-tab records retain the captured capability and original document URL; a restart cannot silently bind a stale attachment to a new document.

The adapter wraps the existing `AuxBrowser` CdpClient and SessionManager, retaining the original renderer session, execution context and DOM node IDs. Target attachment validates through the authenticated profile-routed extension command. Commands for selected attachments carry the opaque capability on the same existing CDP connection, including child frame sessions. Unselected tabs and ordinary unmarked CDP calls retain their original path. Missing capability on a restored attachment fails closed.

`native-cdp-hooks.json` pins six counted native source changes. An optional top-level `auxDocumentCapability` is stripped before Chromium's strict CDP parser and accepted only from an authenticated remote-debugging client. Chrome resolves it to the original native composer and target `WeakDocumentPtr`, same real Profile, tab membership and actual agent target. DevToolsSession checks the retained callback at browser dispatch, actual renderer dispatch (including deferred/replayed commands) and before responses. Stale selected-context notifications are dropped. Once bound, a session cannot bypass its guard by omitting metadata. A new explicit valid selection can replace the session guard; in-flight old calls keep their own guard.

The installed-Agent-only `validateTabReferences` wrapper additionally needs `ValidateAuxTabReferencesForProfile(Profile*, refs)` for the authenticated background extension, whose original composer lives in a different WebContents. Tokens resolve to their original sender; this does not allow renderer-supplied profile identity. The existing page sender path continues using `ValidateAuxTabReferences`.

Focused checks: `node --test vendor/provided/aux-productivity-context-read.test.mjs` passes five tests covering queue retention/cancellation/edit races, real-route binding, original CDP sessions/frame mapping, refusal before attach, unchanged unprotected options, and counted transformation/syntax of both actual daemon entries and background dispatch. No UI classes are changed by this adapter. Native compilation and disposable navigation-during-delayed-read observation remain integrator checks. No provider call or live browser was used in this lane; these results are not a runtime readiness claim.

## Download names and recent downloads

`aux-productivity-files.mjs` reuses the current supplied command-search rows and input. In Commands, Recent files lists the current profile's completed downloads. Selecting a row prepares an opaque native rename capability; the existing input edits the stem while native code preserves the extension. Suggest a name is an explicit separate action using the authenticated account's selected existing ModelRuntime provider. Only filename, MIME and source domain are sent. The suggestion remains editable until Apply. Results expose native Undo. File rows use the actual native download drag implementation and preserve existing CSS classes.

New native source `aux_recent_files_service.{h,cc}` and `aux_recent_files_move_mac.mm` reuses DownloadManager's actual GUID lookup, `DownloadItem::RenameWithMove`, native history update, and supplied same-directory fingerprint + `RENAME_EXCL` primitive. Renderer paths are never accepted. Candidates expire after ten minutes and a native owner epoch prevents an asynchronous preparation from being rebound to a new owner. Collisions try numbered suffixes, without replacing existing files; Undo refuses collisions. Symlinks/non-regular files and changed fingerprints refuse. File bytes are never rewritten.

Durability is an explicit integrator seam, not PrefService fake completion. Install `aux::files::SetWriteOwner(Profile*, current, persist, restored_receipts)`. `current` is a native `RepeatingCallback<bool()>` for the admitted profile owner. `persist` is `RepeatingCallback<void(DictValue whole_namespace, OnceCallback<void(bool durable)>)>`. Restored namespace is a dictionary keyed receipt UUID, each with `downloadGuid`, `originalName`, `sourceName`, `filename`, `fingerprint` (device/inode/size/modifiedSeconds/modifiedNanos strings), `phase` (planned/complete/undo-planned/undone/failed/needs-review), and `expiresAt` milliseconds. Before moving, the planned receipt must be durable; after actual native completion, the result receipt must be durable before reporting success. `HasPendingWrite` and `ObserveSettled` stay pending through physical task completion and journal completion. The physical task reports independently of DownloadItem's weak reply, including item destruction. Without an installed owner, rename reports unavailable; listing and native drag remain ordinary DownloadManager operations.

Private API wrapper requests: `listRecentFiles({generation})`, `prepareDownloadRename({generation,downloadId})`, `applyDownloadRename({generation,capability,stem})`, `undoDownloadRename({generation,receiptId})`, `dragRecentFile({generation,downloadId})`. Require the installed supplied search owner, current native command generation and sender-derived Profile. Prepare returns `success`, `downloadId`, `filename`, `extension`, `mime`, `sourceHost`, `capability`; integrator adds `accountId` only from actual profile binding (absence disables AI). Drag uses the actual sender native view, requires a genuine user gesture, and resolves the GUID from that Profile. Compose `transformAuxFilesUi` after NAV and Tidy; compose `transformAuxFilesDaemon` into both paired entries after the productivity route.

Four focused fixtures pass: filename/path/control/provider rejection; no implicit rename from AI; generation/capability apply; actual UI/paired daemon transform composition and syntax with unchanged classes. These do not establish native runtime behavior. Remaining within FX-FILES: integrate the admitted durable owner and private APIs; add the same rows to the actual native sidebar owner; include files explicitly picked/attached in Aux (current list deliberately includes only Aux downloads). Native rename/collision/Undo/drag require disposable integration acceptance, not owner-file access.

## Native video picture-in-picture command

`aux_media_commands.{cc,h}` reads the actual selected WebContents' existing MediaSession actions, and dispatches Enter/ExitPictureInPicture through that owner. No DOM injection, extra player, automatic popup or permission bypass. `GetAuxVideoPictureInPictureState(contents)` returns `{available,active}`; add this as `pictureInPicture` in native command context. Register installed-search-owner-only `togglePictureInPicture({generation})`, validate native generation and user gesture, resolve the exact active pane, and call `ToggleAuxVideoPictureInPicture`. The response confirms dispatch rather than claiming a renderer-created window exists.

`transformAuxMediaUi` composes after NAV/Tidy/files and adds the available PiP action to existing command rows. Actual composed supplied source parses; public MediaSession methods are verified in selected Chromium headers. Real synthetic-video open/control/return acceptance remains pending in the integrator's built app.

### Interrupted rename reconciliation

Installing the admitted owner now reconciles planned/undo-planned receipts before accepting a new rename. It inspects only the tracked DownloadManager GUID and the two journaled names in its actual current directory. If the original file remains, the request did not complete. If the exclusive move completed, the native item/history is repaired through its normal RenameWithMove completion using a verified no-move callback. Conflicting, removed or externally changed files receive needs-review status without moving anything. `sourceName` records the pre-operation name, including Undo; older planned receipts fall back to originalName, while an ambiguous interrupted Undo is refused. A failed durable write leaves rename disabled until the owner is reloaded. Pending covers background inspection, any metadata repair task and actual journal persistence. Native crash/recovery acceptance remains an integration test, not established by JavaScript fixtures.

### Native sidebar recent files

`aux_recent_files_section.{h,cc}` is mounted by the root sidebar owner after
Chats and before Tabs. Register `AuxRecentFilesSection::RegisterPrefs`, construct
with the actual `BrowserWindowInterface&`, and call `PauseProfileObservation`
when the owner retires, then `BindBrowser` only with its actual replacement.
An empty or private profile produces no header. Up to five safe completed native
downloads use the supplied section/header, clip animation, row typography,
spacing, icons and hover colors. Native DownloadManager/DownloadItem observers
refresh asynchronously, so completion/rename/removal updates the displayed list.
The header uses the ordinary per-profile UI expansion preference (not an
operation-completion receipt). Clicking reveals the file; dragging uses the
existing OS file-drag implementation. This source still requires the integrator's
native compilation and disposable actual-app drag/collapse acceptance.

### File-task lifetime and drain

The actual-profile-path file operation registry outlives Profile user data.
`HasPendingWrite` and `ObserveSettled` now consult that registry, so loss of a
Profile receiver cannot falsely settle an in-flight native task or journal write.
A rebuilt Profile at the same native path observes the same pending fence.
Owner destruction/replacement revokes a shared atomic lease; download workers
check that lease at dispatch and immediately before the physical rename after
fingerprint comparison. Worker code never calls a Profile or UI authorization
callback. Revocation cannot undo a syscall already in progress, and these guards
do not claim whole filesystem namespace custody against external races.
The integrator must include `aux_file_operation_lifetime.cc` in its native target.

### Explicitly chosen files

`aux_chosen_files_service.{h,cc}` and `aux_chosen_files_drag_mac.mm` index only
regular files returned by the real native file chooser for the installed Agent
extension. `transformAuxFileChooser` applies five counted edits to the selected
`chrome/browser/file_select_helper.{h,cc}`: capture the starting WeakDocumentPtr,
and register policy-accepted kOpen/kOpenMultiple results before delivery. The
service independently verifies that exact document, installed extension and
actual profile at entry and after asynchronous stat collection. Other websites,
folder selection, renderer-supplied paths and private profiles do not enter the
index. Fingerprints contain metadata, not file contents.

The integrator installs `SetChosenFilesWriteOwner` using the same admitted durable
journal callback, separately namespaced as `chosenFiles`. It is a maximum-50
dictionary keyed native UUID, each containing `path` (private absolute path),
`fingerprint` (five string fields from the rename namespace), and `selectedAt`
(number, epoch milliseconds). Restore validates each record; renderer listings
expose only `chosen:<uuid>`, basename, source and timestamp. The actual-profile-path
pending registry is shared with download writes. Owner loss does not clear its
pending fence, and persistence failure disables writes until an admitted reload.

The existing list/drag methods now support both kinds of file. Add
`revealRecentFile({generation,downloadId})` with the same installed-search-owner,
current-command-generation and user-gesture restrictions as file drag; call
`aux::files::RevealRecentFile` using the sender-derived Profile. Explicit chosen
files can be revealed or dragged, never sent through download AI naming. Native
sidebar observers subscribe to chosen-index changes as well as DownloadManager.
Unavailable/replaced chosen files fail identity validation on reveal/drag and ask
the user to attach again; stored metadata does not claim current path availability.

Focused checks: real supplied command/daemon composition and parsing, unchanged
CSS class strings, AI suggestion/provider/cancellation contracts, chosen-file
opaque-ID dispatch with no rename/provider fallback, and counted actual native
chooser insertion. Actual native compile, OS drag and profile teardown remain
integrator acceptance; no owner file or provider was touched by these checks.

Startup reconciliation waits for actual `DownloadManager::IsManagerInitialized`
(or its `OnManagerInitialized` callback) before interpreting a missing GUID.
The pending registry remains held during that wait. Manager shutdown releases
only this undispatched wait; it does not pretend a file task was completed.
This prevents history loading from turning valid prepared receipts into conflicts.
