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
