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
