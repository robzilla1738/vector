# Memory parity implementation boundary

References 072–077 were reopened on October 17. The current nested navigation
matches the destinations. The new local-extraction activity implementation records
actual duration, trigger and note count separately from recovery revisions. The
document browser and complete model-extraction workflow remain open.

| Reference | Required behavior | Current implementation |
| --- | --- | --- |
| 072–073 | Folder/document tree, selected document breadcrumb, modification time, rendered Markdown and Edit; episodic, sites, routines and root documents | Space notes editor, approved claims and search; no document identities or editable tree |
| 074 | Extraction activity grouped by date, source title, trigger, duration, model, token/cache usage, cost, file changes and Dream now | Local-extraction activity plus a separate Recovery revisions view; model usage, errors, file diffs and Dream now remain open |
| 075–076 | Index health, update time, chunk count, Rebuild, extraction enable and episodic retention | Extraction policy and consolidation controls; no corresponding index status or episodic retention model |
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
