# Aux status — October 17, 2026

The full Aside parity goal is active on local `main`. Work remains incomplete.
Use [ROADMAP](ROADMAP.md) for owner decisions and the
[reference ledger](design/aside-parity-2026-10-16.md) for surface evidence.
The accumulated chronological status entries are preserved in
[historical status](STATUS-HISTORY-2026-10-17.md); old preview handles there are
retired and old gaps may have been resolved by later entries.

## Current live preview

Product **3c34b442b**, launcher **12644**, app **13842**, runtime **13856**,
exec **93546**, disposable Profile **aux-dev-kxVOpm**, API port64825.
Log `/tmp/aux-address-focus-native-build.log`; native build passed in **9m27.89s**.
About verified clean source3c34b442b2ec578303a703db6a4bcc877e098f4f,
Chromium154.0.8037.98 and ABI9021388e…. CUA binding **addressFocusApp**.
Preserve launcher12644 cleanup ownership. The prior8670 preview is retired.

Native rapid-typing acceptance passed: from Bookmarks search, Cmd-L preserved
full about:blank and focus-handoff-check; after Cmd-L, Cmd-T preserved full
keyboard focus check. Escape dismissed without clicking, restored the retained
Bookmarks search, and subsequent typing appended to it. This verifies the native
ownership and renderer delayed-selection corrections together. Integrated source
check passed4,621tests/744files. No unchanged suite repeated for acceptance.

Window zoom action expanded the preview for reference comparison. Current app
captures are3456×2010 versus reference001/023 at3424×1978 (close, not exact).
Saved captures:
- `/tmp/aux-parity-2026-10-16/aux-appearance-expanded-3c34b442b.jpg`
- `/tmp/aux-parity-2026-10-16/aux-home-expanded-3c34b442b.jpg`

Next visual batch findings: Appearance card width/order/row spacing are close to
023. SettingsDialogControl uses smallGhostButtonProps, leaving Configure as plain
text where the reference shows a bordered action. Reference Tabs also has an
Advanced row; verify its actual destination before adding it. Home hero position
matches closely, but Recent work is about50CSS pixels too low: current
`.home-history` margin-top152px versus approximately100px in001. Home screenshot
has no synthetic chats yet, so populated card parity remains unverified. Home
profile action and backdrop/palette also require comparison; do not infer a color
fix from screenshots with uncontrolled backdrop. Sidebar address placement remains
an explicit Aux owner decision. Preview is left on Home with suggestions collapsed.

Memory document work remains the next substantial backend/UI batch; implement its
model/recall/recovery together per the design boundary. Reference count stays182PNG.

## Prior native acceptance and source follow-up

Native product **dd642e5a4**, launcher **8670**, app **9769**, runtime **9785**,
exec **81841**, disposable Profile **aux-dev-2nvFHq**, API port64030.
Log `/tmp/aux-focus-handoff-native-build.log`; build passed in **9m27.82s**.
About verified clean source dd642e5a4ca223df20aee336317beedef6414000,
Chromium154.0.8037.98 and ABI9021388e…. This preview is retired.
Its CUA binding **focusHandoffApp** is stale. Native checkout:
`/Users/rcourson/Documents/Code/aux-chromium-product/chromium/src`, output
`out/AuxFast/Aux.app`. The previous4140 preview and Profile were retired normally.

Patch0052 native acceptance: with native Bookmarks search focused, Cmd-T followed
immediately by about:blank opened the new tab and left Bookmarks search empty.
A second test retained the original page query, put draft in the command input,
and Escape dismissed without clicking and restored focus to the page input.
Further typing appended to the page query. Hide/raise preserved page input focus.
This verifies the embedded-page keyboard-ownership correction.

A separate renderer defect remains in this packaged preview: Cmd-L followed by
rapid about:blank yields bout:blank, and focus-handoff-check yields
ocus-handoff-check. After Cmd-L, Cmd-T can also lose the draft prefix. CommandBar's
focusRequest handler waits for native focusShell then selects again, replacing
characters that arrived meanwhile. Source follow-up moves focus/select to the
layout effect and removes delayed selection. A delayed-acknowledgement regression
check accompanies it. Initial check caught only a test Promise<void> type mismatch;
corrected to the bridge's undefined result. Integrated check passed typecheck/lint and all4,621tests/744files in99.52s,
log `/tmp/aux-address-focus-check.log`. Native replacement required
after source validation/commit; do not claim rapid-typing acceptance for this
renderer until the replacement is tested.

Patch0052 integrated check passed typecheck/lint and4,620tests/744files in95.67s
(`/tmp/aux-focus-handoff-check.log`). No runtime edits. Original rounded model
search fix remains accepted; full parity is not complete.

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
