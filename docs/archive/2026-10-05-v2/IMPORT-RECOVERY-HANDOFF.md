# IMPORT recovery and S13 review readiness

## Scope and retained acceptance

September 28, 2026. The existing IMPORT outcome remains accepted for the scoped
S7 browser-data contract on the combined Chrome review, Arc/Safari/Firefox native
destination, and attached-tab/cancel/error/retry/restart evidence recorded in the
execution graph. This batch does not reopen those passes or qualify S13.

The next concrete gap was recoverable progress: reopening the Import setting lost
the active job; `import.status` omitted running batch counts; a later batch error
reported zero even after destination writes. The source batch in this commit
closes that gap from contract through runtime receipts and leaf UI. It also adds
the Keychain/access explanation and explicit category exclusions that onboarding
can reuse. Onboarding routing, model setup and postcard execution remain separate.

## Contract

- Browser-import schemas live in `packages/contracts/src/import.ts` and retain
  their previous API exports. No runtime methods were added.
- `import.status({jobId})` retains its behavior. `import.status({})` returns the
  most recent receipt in this Aux Profile, or `not_found` when none exists. It
  does not discover or read installed browser sources.
- Status adds selections, start/update timestamps, monotonic revision and an
  optional `interrupted` flag. Category results include exact source Profile IDs.
  Existing `done`, `cancelled`, `progress` and `report` remain.
- `import.preview` adds up to five recent receipts. Import progress events carry
  the current full receipt plus the changed category fields for compatibility.
- A maximum of one import runs at a time in a Profile's runtime. Independent Aux
  Profiles have separate repositories and receipts.

## Runtime/native boundary

Receipts use the existing Profile repository settings path under
`browser-import.receipts.v1`; the existing configured KV protection applies.
Retention is five jobs. Durable payloads contain browser/Profile/category IDs,
bounded labels, counts and lifecycle metadata. They contain no source paths,
imported URLs, titles, folder paths, browser data, credentials or grants. Raw
reader/native error messages are replaced by generic recovery guidance before
persistence. Status is cloned rather than exposing mutable job state.

The first receipt is written before work starts. Each confirmed destination batch
updates progress, persists a receipt and emits its revision. Counts survive a
later category failure. Cancellation stops after the current batch; confirmed
items remain. Existing native `bookmarks.import` and `native.historyImport` remain
the destination seams. Existing attached-Chrome tab opening remains distinct.
No native source or generated binding is included in this commit.

On a fresh runtime, an unfinished receipt becomes terminal and interrupted. Its
last confirmed counts remain visible. No source discovery, data read, native
write or automatic retry occurs while recovering the receipt. An in-flight
native request may have committed after the last durable checkpoint, so these
counts are a confirmed minimum, not a transaction-wide rollback promise. A fresh
reviewed bookmarks/history retry relies on the existing destination deduplication
to account for those writes. Retrying live tabs can open duplicates and is clearly
identified as such.

## User outcome

The Import setting first restores the latest receipt without scanning browsers.
Active jobs remain visible/cancellable after leaving and returning. Full events
and one bounded status poll per second reconcile progress; older revisions cannot
replace newer terminal state. Read failures retain the active job with a Check
progress action, and cancel failures remain visible and retryable.

After terminal completion, cancellation or interruption, prior selections are
cleared. Retrying requires a fresh preview and explicit unchecked source/Profile/
category selection. This is a UI review flow, not a new server-issued preview
capability. Existing authorized API clients can still call `import.run` directly.

The review explains Chrome, Arc, Safari and Firefox support, Arc folder mapping,
attached-Chrome-only live tabs, safe bookmark/history merging, and excluded
passwords/cookies/extensions/agent permissions. The Keychain section distinguishes
this non-credential import from protected Aux storage prompts and separately
reviewed password transfers; Safari access requirements remain visible. It never
asks the user to enter a system password into the web UI.

## Source evidence

See [the source receipt](evidence/import-recovery-2026-09-28.json).

- Full workspace rebuild (`npx tsc -b`) and shell TypeScript passed before tests.
- **25 tests across three files passed**: existing source/category safety and
  cancellation checks; Chrome/Arc/Safari/Firefox partial failure and deduplicated
  retry; bookmark title/folder preservation; running status checkpoints and
  single-job admission; real child-runtime process exit/reopen without automatic
  work; bounded retention/Profile isolation; UI remount, stale response, temporary
  failure and fresh four-browser review cases.
- Tests inject temporary source roots and verify unchanged source-file digests.
  The native destination seam in unit tests is injected; it is not a native pass.
- Repository lint passed with **370 warnings / zero errors**; formatting ratchet
  and whitespace checks passed. Only importer-owned leaf/new files were formatted.
- One Chromium-targeted shell Vite build passed its startup/total bundle gates.
  No native build, native journey or model benchmark ran in this lane.
- The integration base's generated authorization missed the three SKILLS replay
  methods. The integrator authorized local `gen-host-bindings.mjs` generation for
  verification; those generated changes are deliberately excluded from this
  commit. Regenerate on the combined integration source before its build/checks.

## Exact remaining native acceptance

Use a new disposable Aux Profile and `AUX_IMPORT_SOURCE_HOME` pointing only at
synthetic Chrome/Arc/Safari/Firefox roots. Pin the combined source SHA, staged
runtime digest, generated manifest, binary identity and source-file digests.

1. In native Settings, read the disclosure and open the preview. Every source/
   Profile/category starts unchecked. Choose one fixture category and verify only
   that category is passed to `import.run` and written to the native destination.
2. Start a multi-batch fixture import. After status confirms a nonzero running
   batch, leave and return to Settings. The same job ID/counts and Cancel control
   must reappear without another `import.run` or implicit source selection.
3. At a recorded nonterminal checkpoint, terminate **only the disposable
   Profile's runtime process**, then restart that runtime/Profile. The receipt
   must be `done:true, interrupted:true`, retain at least the last confirmed
   counts, and cause zero destination writes before a new explicit run. No owner
   app/Profile or browser source may be touched.
4. Read a fresh preview, explicitly select bookmarks/history again, complete it,
   and verify native destination deduplication, existing bookmark titles/folders,
   final total and unchanged source hashes. Quit/restart and read the final receipt
   and destination data. Confirm a second Aux Profile cannot read that job ID.
5. Cancel a separate multi-batch job and exercise an independently corrupt source;
   show partial counts and recovery guidance without claiming a rollback. Keep
   attached tabs separate and verify the UI warns that replay can duplicate them.

The existing `--browser-import-ui`, `--browser-import-formats` and
`--browser-import-attached` journeys remain useful prior evidence. Their older
manifests do not prove this new mid-job runtime interruption/remount receipt gate.
S13 still requires its full disposable onboarding flow, mock model setup and
postcard-started chat. Signed release packaging stays outside scope.
