# Space-aware tab mentions — inactive overlay

This closes the concrete plan §3.6 mention-menu gap. It reuses the supplied
mention loader, ranking, tab-group rows and tab chips without changing CSS.
Individual open-tab rows include their actual native Space label. Explicit
Space rows say how many open tabs will be attached and how many remain unloaded.
Choosing a Space attaches its open native views only; it never opens unloaded
tabs, scans files or uploads content. An empty/unloaded-only Space explains that
the desired tabs must first be opened. More than 64 open views requires choosing
individual tabs. Identical URLs and independent windows retain distinct targets.

`getTabMentionSpaces()` reads metadata from the sender's admitted native Profile
and its ready organization model/controllers. The supplied account ID must match
the actual native profile binding before results are displayed. The read does
not mint content permissions. `captureTabMentionSpace` requires exact current
owner generation, organization revision, Space membership, complete target/URL
set and original primary Agent composer document, then delegates to the existing
native document-capability capture synchronously on the UI sequence. Navigation,
profile change or tab membership changes refuse selection. Existing submit,
deferred-read and reply validation still own actual content access. Drafts and
other capabilities remain unchanged on failure.

## Root integration

1. Add `source/chrome/browser/ui/aux_tab_mention_spaces.{h,cc}` to projection and
   existing browser UI GN sources. Do not project this during a running freeze.
2. Apply `shared-edits.json` against its exact pinned baseline (or replay its
   count-one edits on a reviewed successor), not an unchecked wholesale overwrite.
   These add methods to the existing installed-Agent-only/admitted feature API.
   The wrapper additionally requires the actual primary Agent extension document;
   it accepts no arbitrary caller profile/window IDs.
3. Append `schema-additions.json`; register the two listed extension-function
   classes and assign unused histogram values to the manifest's enum names.
   No event, new permission or provider/backend endpoint is required.
4. Import `transformAuxMentionSpaces` from the new vendor adapter and compose it
   immediately after `transformAuxTabContext` in the post-identity UI pipeline.
   Replay its count-checked anchors in the same staging evidence/ledger as other
   supplied UI transforms. Do not edit generated bundles as source.
5. Include the new native hashes/adapter and changed API/schema in the next full
   freeze, compile and paired package. This overlay is not enabled by itself.

## Evidence and limits

Three focused fixtures passed: duplicate-URL independent-view preservation,
account/membership failures and unloaded selection, and actual pinned supplied
provider asset composition/syntax with unchanged CSS classes. No broad suite,
provider call, owner data, app launch, restart or signing was performed. Native
compilation and real disposable menu/chip/read behavior remain integration gates.
Existing native top/bottom split commands provide the explicit stacked layout
option required by §3.5; no automatic narrow-layout redesign is needed here.
