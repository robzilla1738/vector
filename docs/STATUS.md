# Aux status — October 17, 2026

The full Aside parity goal is active on local `main`. Work remains incomplete.
Use [ROADMAP](ROADMAP.md) for owner decisions and the
[reference ledger](design/aside-parity-2026-10-16.md) for surface evidence.
The accumulated chronological status entries are preserved in
[historical status](STATUS-HISTORY-2026-10-17.md); old preview handles there are
retired and old gaps may have been resolved by later entries.

## Current native preview

Product **0a5a757e0**, launcher **26443**, app **27577**, runtime **27591**,
exec **4789**, API port **51167**, disposable Profile **aux-dev-juErea**.
Log `/tmp/aux-home-history-native-build.log`; native build passed in **9m22.03s**
and runtime staging completed. CUA **homeHistoryApp** is live. Preserve this
launcher's cleanup ownership; there is no pending build. About confirmed clean
source `0a5a757e0d00e973ad7d3845a9059a33cddb021a`, Chromium154.0.8037.98 and ABI9021388e….
Prior launcher17093, app18292, runtime18307, Profileaux-dev-c7Z9wr and lock all
retired normally and were verified removed before replacement.

Native acceptance at3456×2010: three synthetic real-provider chats completed
without tools. Search-mode Home shows timestamp/title/reply cards without oversized
icons or repeated action buttons. Opening Paper garden shows its actual checklist
conversation. History now has a full-column composer and inherited background.
From history, Cmd-T plus `http://127.0.0.1:5197` displayed the new page immediately,
without clicking its tab. The temporary page was closed afterward.

Captures under `/tmp/aux-parity-2026-10-16/`:
- `aux-home-populated-0a5a757e0.jpg`
- `aux-home-routines-ask-0a5a757e0.jpg`
- `aux-history-populated-0a5a757e0.jpg`
- `aux-history-navigation-0a5a757e0.jpg`

Remaining comparison: Ask mode places Recent work about44CSSpx lower than reference004
because its composer toolbar adds height; Search mode aligns closely with001.
Ask also lacks the reference's Tab-to-switch affordance; any hint must have working,
draft-preserving keyboard behavior. Real image thumbnails and native narrow/light
states remain open. These observations do not establish full Home parity.

## Ask follow-up — source checked, not yet packaged

The empty Ask composer now uses a56px Recent work gap on wide Home layouts,
offsetting the toolbar height; narrow layouts and nonempty transcripts retain
their existing spacing. Ask shows the same Tab-to-switch hint as Search. Plain
Tab from its textarea invokes the scoped Search command without modifying the
durable draft. Modified, composing, already-handled and other-control events
keep their existing behavior. The hint hides at the existing narrow breakpoint.

Local renderer observed through the disposable browser: Ask → Tab → Search → Ask
restored the unfinished text. The synthetic draft was cleared, the temporary tab
closed and native sidebar restored. Capture `aux-ask-spacing-live-renderer.jpg`
under the capture directory shows the empty Ask/Routines layout. It includes an
extra outer native toolbar; accounting for that toolbar, Recent work aligns with004.
This is renderer evidence, not packaged acceptance. Native0a5a757e0 remains live;
queue this source change with the next native replacement rather than starting a
separate nine-minute build for spacing alone.

`npm run check` passed typecheck/lint and **4,629 tests /745 files** in95.79s
(`/tmp/aux-home-ask-check.log`). Reference rescan remains182PNG/192TXT/6support.
Full parity, image thumbnails and native light/narrow comparison remain open.

## Previous accepted native preview (retired)

Product **eabff947d**, launcher **17093**, app **18292**, runtime **18307**,
exec **50761**, disposable Profile **aux-dev-c7Z9wr**, API port49455.
Log `/tmp/aux-home-settings-native-build.log`; native build passed in **8m49.07s**
and runtime staging finished. About verified clean source
`eabff947db8db210d384dbe549cf8acab8047163`, Chromium154.0.8037.98 and ABI9021388e….
CUA binding **homeSettingsApp** is stale; this preview was retired normally.
Previous12644 preview retired normally; addressFocusApp is stale.

Native acceptance: Home Recent work spacing now aligns closely with001 at a
near-matched window size (3456×2010 versus3424×1978). Home's upper-right menu
opens Profiles, Usage & Budgets and General settings. Escape closes the menu and
returns focus to its trigger. General Configure/Import and Appearance Configure
have bordered surfaces; Languages and Customize Tidy Tabs dialogs open and cancel.
Three synthetic real-provider chats completed without tools in this disposable
Profile. Populated Home was captured in Search mode before this preview was retired.

Captures under `/tmp/aux-parity-2026-10-16/`:
- `aux-home-menu-eabff947d.jpg`
- `aux-general-actions-eabff947d.jpg`
- `aux-appearance-actions-eabff947d.jpg`
- `aux-home-populated-eabff947d.jpg`

## Home card follow-up — packaged and observed

Populated native evidence exposed the remaining large mismatch with001: oversized
chat icons, status badges and repeated action buttons displaced the actual reply.
Chat cards now lead with real relative timestamps, title and Markdown response.
Non-completed status and drafts remain visible. Only non-automatic deliverables
get an openable result preview; redundant automatic report actions are removed.
The whole card still opens the conversation, and draft subscriptions remain local
to their own card. Old result-button presentation is removed.

Integrated check passed typecheck, lint and **4,625 tests /745 files** in95.78s
(`/tmp/aux-home-cards-check.log`). Only dead CSS removal and formatting followed.
Packaged0a5a757e0 confirms the hierarchy and conversation navigation described above.
Do not claim complete populated-card parity; real image thumbnails and
narrow/light comparison remain to verify. Keep the substantial Memory
model/UI batch open per the implementation boundary.

## Related Home/history batch — source checked and natively observed

Reference113 comparison found the history composer constrained by the inner896px
compose-content wrapper even though its outer history column was full width.
The wrapper now spans that column. History no longer paints an opaque bg-0 over
the content surface. Shared Markdown typography covers Home and history card
previews. A Home card with a saved deliverable bounds its text preview to three
lines so the actual result remains visible and openable.

Native eabff947d also reproduced Cmd-T URL acceptance from history creating a tab
while leaving history covering it. Native omnibox open previously changed only
the host tab selection. Its renderer acknowledgement now switches to browser mode
for foreground navigation, leaving background opens alone and preserving a newer
view/focus request or owner if acknowledgement is delayed. Regression coverage
includes suggestion acceptance, refused navigation and a newer chat during a
pending typed navigation.

Final integrated check passed typecheck/lint and **4,627 tests /745 files** in
102.70s (`/tmp/aux-home-navigation-check.log`), including the8 native omnibox tests.
The preceding CSS-only check passed4,625tests in96.17s before the navigation fix.

Local renderer (Vite5197) checked through a page in the disposable native browser:
`aux-home-cards-live-renderer.jpg` and `aux-history-live-renderer.jpg` under the
capture directory. These have an extra outer native toolbar and mock data; they
are source-layout observations, not packaged native acceptance. Reference113
native before-capture: `aux-history-populated-eabff947d.jpg`. The temporary preview
tab was closed. No extra browser provider is available through CUA.

## Previously accepted keyboard corrections

Native patch0052 hands embedded-page focus back to the shell. Renderer3c34b442b
focuses/selects synchronously and does not select again after the native ack.
Native Cmd-L and subsequent Cmd-T preserved full rapid input; Escape restored the
retained Bookmarks query and keyboard focus. Window hide/raise retained page focus.
See the reference ledger for evidence. These corrections remain in the current
preview; no unchanged keyboard campaign was repeated.

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
