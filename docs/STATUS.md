# Aux status — October 17, 2026

The full Aside parity goal is active on local `main`. Work remains incomplete.
Use [ROADMAP](ROADMAP.md) for owner decisions and the
[reference ledger](design/aside-parity-2026-10-16.md) for surface evidence.
The accumulated chronological status entries are preserved in
[historical status](STATUS-HISTORY-2026-10-17.md); old preview handles there are
retired and old gaps may have been resolved by later entries.

## Current native build

Product **dd642e5a4**, launcher **8670**, exec **81841**,
log `/tmp/aux-focus-handoff-native-build.log`. The native checkout is
`/Users/rcourson/Documents/Code/aux-chromium-product/chromium/src`, output
`out/AuxFast/Aux.app`. Changed sources compiled; framework link/package and live
acceptance are pending. Poll this same owner; do not start another builder.
No renderer/runtime source edits until staging finishes.

The prior launcher4140, app5496, runtime5517, disposable Profileaux-dev-NybYhE
and lock retired normally and were verified removed before replacement.
CUA bindings `memoryActivityApp`, `layoutPreviewApp`, and `featureLibraryApp` are
stale. Confirm the replacement app is running before binding its exact path.

Patch0052 fixes the reproduced native keyboard handoff: a focused Bookmarks search
kept receiving typing after Cmd-T opened the shell command surface; Escape also
failed until clicking the shell input. SurfaceEmbed ignored element blur.
The patch returns ownership to the embedding page only while that child still
owns focus, excludes window-focus notifications and pending nested focus, and
explicitly releases the active embed before shell shortcuts/focusShell.

Next native acceptance: verify About identity, focus Bookmarks search, press Cmd-T
and type immediately; check Escape without clicking the command field. Also check
Cmd-L, return to page input and window deactivation/reactivation. The patch is
**not yet verified in the native app**.

Integrated `npm run check` passed typecheck/lint and all **4,620 tests /744 files**
in95.67s (`/tmp/aux-focus-handoff-check.log`). No renderer/runtime edits in this
batch. Do not repeat the passing full suite without a new reason.

## Latest accepted behavior

- Product2408e4727: native Memory History opens Activity by default. A real
  synthetic completed chat generated2review notes, dated activity with the source
  title, Chat completed trigger and measured2ms duration. Recovery revisions is
  separate and empty before note acceptance. Local extraction makes no model
  request; no fabricated token/cost fields. Native capture:
  `/tmp/aux-parity-2026-10-16/aux-memory-activity-native-2408e4727.png`.
- Encrypted activity records cover success/no-change, deduplication, restart,
  recovery export/import, and source/claim/all Forget. Unit and component evidence
  is recorded in the historical status and reference ledger. Native Memory
  document-tree parity is not complete.
- Prior layout preview: fresh Profiles keep sidebar and42px toolbar visible;
  actions align right. Auto-hide respects its preference and Labs opt-out.
  Reading-list mark-read moves the row and preserves action-button focus.
- Native Bookmarks/History/Downloads use Chromium pages with Aux presentation.
  Bookmark folders/split/private capabilities update live and survive temporary
  runtime unavailability. Empty Mobile/Managed roots are hidden. SavedPages holds
  Reading, Archived and Recently closed; the replaced combined Library is deleted.
- Rounded model-search focus has been verified natively, without the inner
  rectangular outline. Capture:
  `/tmp/aux-parity-2026-10-16/aux-model-search-rounded-4b1358c58.png`.
- Zoom25–500% is implemented in patch0044; older50–200% gap entries are historical.

## Remaining work

Reference corpus:182PNG,192TXT and6support files, excluding thumbnails, under
`/Users/rcourson/Desktop/Aside UI Reference 2026-10-16`. Rescan between batches as
the owner adds captures. Reopened073overview and075configuration on October17.

The next substantial Memory batch needs the actual editable document tree,
authoritative owner-edit storage, source attribution, revision conflicts and
recall integration, with recovery/Forget included. Index health/rebuild and
retention need real underlying behavior. See
[Memory implementation boundary](design/memory-parity-implementation.md).
Model extraction/usage, errors, file diffs and Dream now also remain open.

Other known work includes real channel transports/pairing/reply delivery
([channel plan](design/channels-implementation.md)), named custom JSON providers
and subscription adapters, standalone routine behavior, cleanup/timer ownership,
device capture/file grants/maintenance, completion sound behavior, and matched
native light/narrow/populated-state comparisons. The native Clear History cancel
path still exposes Chromium/Google-worded Privacy settings. These are not an
exhaustive completion checklist; audit the full reference ledger and ROADMAP.

Phase performance evidence and the manual20-task smoke remain incomplete.
Do not claim full parity or phase completion from a passing focused check.

## Development constraints

Commit coherent slices to local main; never push, dispatch hosted Actions, enable
Dependabot, sign, notarize or release. Use one native launcher/plain lock and
preserve cleanup ownership. Retire through the original launcher and verify app,
runtime, disposable Profile and lock removal before replacement. Never reset the
stable checkout or force-clear an active lock. Only disposable Profiles; ask before
touching the owner's real Profile. Runtime edits require dist rebuild before tests.
