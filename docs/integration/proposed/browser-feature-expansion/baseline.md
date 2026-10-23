# Execution baseline and reservations

Owner goal: implement the complete [desktop feature roadmap](../../../plans/2026-10-23-browser-feature-expansion.md). Mobile is deferred. The local main baseline is `02ce77253fce3298cd6035b43be75a6bcbc0ff7a`; `baseline.json` pins selected native seams. No live app, profile or credentials were accessed to establish these inputs.

## Active lanes

Managed worktree creation reached checkout but task registration could not verify ownership. Those pending directories remain untouched. Small ordinary Git worktrees were created successfully as the fallback:

| Owner | Worktree | Branch | Reserved output |
|---|---|---|---|
| Organization worker | `/private/tmp/aux-features-execution-organization-20261023` | `codex/features-organization-20261023` | `organization/source/` native domain, pin type/actions and consumer adapter |
| Frame worker | `/private/tmp/aux-features-execution-frame-20261023` | `codex/features-frame-20261023` | `frame/source/` presentation, region and actual navigation placement |
| Navigation worker | `/private/tmp/aux-features-execution-navigation-20261023` | `codex/features-navigation-20261023` | `navigation/source/` search owner, shortcut/private API, `vendor/provided/aux-navigation-*` |
| Integrator | root local main | `main` | shared native registration, broad BrowserView/layout/TabStripModel adapters, exact source projection, storage/factory, composition/stage/package and ledger |

Native proposals do not mutate the selected or owner's native tree. The integrator reviews baseline hashes, composes one-writer changes, projects under `scripts/native-build.py`, and records fresh receipts without rewriting historical proof. Current preview and inactive packaged candidate are preserved.

## First interface freeze

- Organization: one native service per regular profile; separate stable tab record/view IDs; global pins only within profile; UUID identities; uint64 revisions serialized as canonical decimal strings. Command context includes actual native profile/owner generation, expected revision and operation UUID. Persist command fingerprints for replay, validate tree before commit, and bound Undo.
- Storage: `OrganizationStorage::IsCurrentOwner` and async `Commit(snapshot,profile,generation,expectedRevision,newRevision,callback)`. Receipt is committed/refused/failed/uncertain and pins the full tuple. A queued pref callback does not prove successful storage. Retain actual I/O ownership until settlement; publication requires exact successful receipt and current owner.
- Frame: state model resolves real top/sidebar host and redundant chrome while retaining trusted URL access. Actual focus/menu/drag locks defer movement. The controller moves existing native navigation views; it cannot instantiate another URL field. Default geometry/material stays unchanged.
- Commands: modes SearchTabs/NewTab/Navigate/Commands share the actual native search host. Native weak window/selected WebContents plus invocation generation bind commit. Existing symbolic command IDs and installed private API are reused. Generated supplied bundles are outputs, never source edits.

Each producer implements its header before downstream consumer wiring. Changes to these contracts are coordinated here before dispatching window/AI/file consumers. Persisted model and native view correctness remain implementation/acceptance gates, not claims established by this document.
