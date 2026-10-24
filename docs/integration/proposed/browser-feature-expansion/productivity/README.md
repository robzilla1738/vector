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

**Remaining content-consumer boundary:** these checks are admission checks at composer submission, not a permanent read lease. Delayed queued prompts and later provider/tool tab-content extraction must propagate and revalidate document capabilities at dequeue/read. The existing daemon session metadata/schema and extension content reader require that follow-up integration before claiming full end-to-end navigation isolation. A fixture returning a native validation failure does not prove those later paths.
