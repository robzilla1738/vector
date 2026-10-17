# Memory parity implementation boundary

References 072–077 were reopened on October 17. The current nested navigation
matches the destinations. The new local-extraction activity implementation records
actual duration, trigger and note count separately from recovery revisions. The
document browser and complete model-extraction workflow remain open.

| Reference | Required behavior | Current implementation |
| --- | --- | --- |
| 072–073 | Folder/document tree, selected document breadcrumb, modification time, rendered Markdown and Edit; episodic, sites, routines and root documents | Space notes editor, approved claims and search; no document identities or editable tree |
| 074 | Extraction activity grouped by date, source title, trigger, duration, model, token/cache usage, cost, file changes and Dream now | Local-extraction activity plus a separate Recovery revisions view; model usage, errors, file diffs and Dream now remain open |
| 075–076 | Index health, update time, chunk count, Rebuild, extraction enable and episodic retention | Approved-note search index now has encrypted chunks, update time, verification and Rebuild; editable-document indexing and episodic retention remain open |
| 077 | Context awareness controls | Existing browsing/content memory controls; matched native comparison remains open |

Source findings:

- `MemoryPipeline.extractRunOwned` currently splits a completed report into quoted
  candidate claims. It does not invoke a model. Do not borrow the source run's
  token/cost totals and present them as extraction usage.
- `MemoryPipeline.historyOwned` returns reversible snapshots of claims. Retain
  this recovery facility separately when adding extraction history.
- `SpaceMemoryStore` stores encrypted logical files and history under one
  generation key. `writeGeneration` writes claims, inbox, import receipts, summary,
  handbook and rollout projections. Those projections are not independently
  editable source documents.
- Extraction verifies completed-run ownership, source eligibility and exact quote
  provenance; owner-pasted context remains explicitly unverified. New document
  edits must not manufacture verified source quotes or bypass these checks.

Implement document identity, revision-conflict handling, content/provenance and
encrypted backup/forget semantics together before exposing the reference tree.
Define which documents are owner-authored and which are generated projections;
editing generated prose must retain attribution to the owner edit. Connect the
document model to actual recall so an attractive browser is not an inert copy.

Extraction activity needs its own durable records, including no-change/error
outcomes and measured metadata from the actual extraction operation. Add index
status/rebuild and episodic retention against that same authoritative model.
Retention must remove the intended episodic material without silently dropping
owner-authored long-term notes or restoring forgotten material from projections.

Acceptance requires synthetic documents and extraction runs, editing and reopening,
conflict preservation, source provenance, actual recall, forget/recovery behavior,
and native wide/narrow/light/dark comparison. Existing revision-browser tests and
screenshots are not evidence that these requirements are complete.

## Next integrated document batch

October 17 source audit: `runs.ts` obtains pipeline recall through
`MemoryPipeline.overview`, while manual Space notes use `workspaceMemoryText`.
Pipeline search currently searches approved claim text, and recovery verifies an
exact inventory of encrypted files plus deterministic summary/handbook/rollout
projections. A document editor must update these consumers together; merely
exposing `handbook.md.enc` would lose edits at the next extraction/consolidation.

The next implementation should provide stable logical paths, document revisions,
modification times and Markdown content in one encrypted generation. Owner-authored
root documents and edits need explicit owner provenance. Generated episodic/site/
routine sections retain their source claim/run associations; editing them cannot
change an exact report quote into supposedly verified evidence. Keep a base
revision in each editor draft, reject stale saves without discarding the draft,
and include document revisions and source dependencies in recovery and Forget.

The matching screen uses a narrow folder/file tree next to a full-width document
pane, with breadcrumb, modification time and Edit in one top row. Folder expansion,
selection, keyboard navigation, Markdown preview and Save/Cancel must be real.
Retain pending-note review and recovery access as secondary destinations rather
than squeezing those controls into the document pane. Do not add an inert Open
folder action: encrypted storage cannot be presented as readable Markdown files.
A readable export would need an explicit destination and export lifecycle.

Recall and search must use the authoritative effective document text with bounded
context, source eligibility and owner-edit attribution. Index status/count/update
time and Rebuild should describe a real index over that same text; never label
claim count as chunks without actual chunking. Episodic retention applies to daily
observations and their revisions, preserving root owner notes and extraction
watermarks so a forgotten source cannot silently reappear. Its deletion/recovery
semantics must be integrated before exposing the selector from references075–076.


## Approved-note index foundation — October 17

The pipeline now writes an encrypted search-index.json.enc derivative in every
new generation. It stores512-character chunks with64-character overlap, source
claim IDs, a digest of authoritative approved text and its actual rebuild time.
Search reconstructs chunked notes into token postings, then retains live source,
contradiction and sensitivity checks. Terms can match separate chunks of a note.
Older generations without the derivative remain searchable through an in-memory
rebuild and report not-built; inconsistent derivatives report needs-rebuild.
Recovery requires an exact derivative match, reseals restored text and rebuilds
its index. Forget regenerates chunks from remaining approved text. No removed
note text is kept in the current index or its exported recovery inventory.

Memory configuration now shows approved-note index health, update time, chunk
count and a real Rebuild action. This does not establish the root/episodic/site/
routine document model described above. Future owner-authored documents must join
these authoritative consumers and recovery/Forget semantics; this claim-backed
index is not a substitute for the required document browser or episodic retention.
Native acceptance remains pending with the next consolidated build.


## Approved-document edit model — October 17

memory.pipeline.documents returns each approved claim with its stable path
`episodic/YYYY-MM-DD.md`, effective modification time and the encrypted
workspace generation. memory.pipeline.edit accepts an atomic list of changed fragments, requires that
exact generation, and stores ownerEdit text/revision/time beside, not over, the original quote. Recall,
handbook and the search index use the effective text with owner-edit attribution;
source eligibility and exact-quote checks still use original evidence. History
and recovery carry the edit, while source/claim/all Forget removes it with its
claim. Reindex cannot overwrite it. Consolidation never merges away distinct owner
edits; editing refreshes contradiction flags without aging or merging other notes.

The generation is the save precondition, including after rollback; the ownerEdit
revision is descriptive and must not be used alone as a conflict token. The editor keeps rejected drafts and their base generation until the owner
explicitly compares and rebases, or cancels. Paths and source relationships survive edits, and removed claims cannot
be recreated through this edit method.

The document browser groups approved fragments into daily files and maps root
MEMORY.md directly to WorkspaceMemory.content. Its root editor shares the existing
window-scoped saved draft store, revision checks and workspaces.memory.set; it does
not create another authoritative copy. Episodic edits remain in memory while the
Memory view stays mounted and are pruned when Forget removes their source. They
are not persisted across closing Settings. New fragments are preserved when an
owner explicitly rebases a daily-file draft. Review/import/Forget and individual
manual notes remain available through Review and manage notes.

USER.md/TAXONOMY.md and site/routine document authority remain unimplemented. The
browser exposes no placeholder files for those concepts. Native acceptance of the
new browser remains pending; renderer/mock observations do not establish runtime
or final packaged behavior.
