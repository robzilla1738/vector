# Explicit page-context commands — inactive source overlay

Adds **Ask current page**, **Ask selected tabs**, and **Summarize current page** to the supplied command palette using its original result rows, icons, action labels and error presentation. Ask requires an entered question; Summarize is an explicit submission. Opening the palette, typing, changing selection or listing commands never submits. Normal search and the preceding editable Ask-composer handoff remain unchanged. No stylesheet, screen, daemon or provider integration is replaced.

## Integrator

1. Replay `native-overlay.json` onto exactly `palette-ask-v1/source/aux_tab_search_bubble.cc` after its navigation-output successor (`d32887a05`). The only native leaf is `chrome/browser/ui/views/frame/aux_tab_search_bubble.cc`; nine count-one edits. The included complete source is the reviewed output, not a replacement baseline for other files. New includes reference existing compiled APIs; no schema, histogram, header, GN or registration change is required.
2. Import `transformAuxContextActions` from `source/aux-context-actions.mjs`. Apply to branded `assets/tabsearch-3k_2hgil.js` **after** `transformAuxPaletteAsk`. Existing feature composition provides `auxFilesClient` (the original queries client object) and `auxFilesAccount` (original current-account function). Three edits; unrelated resources pass unchanged. Later independent transforms can follow it.
3. Project/re-pin the native leaf and UI adapter with the shared source ledger and package machinery. This overlay does not change ordinary/dormant daemon bytes or research source-pair receipts.

## Actual authority and submission

The original native search invocation retains the active page and exact native TabStripModel selected WebContents with WeakDocumentPtr. It never accepts renderer-provided page IDs, profile IDs, window IDs, destinations or attachment arrays as selection authority. Selected targets must all remain loaded HTTP(S) documents with no pending navigation and unchanged selection; unsupported/unloaded entries refuse the whole selection. There is no URL deduplication, implicit opening, upload or context dropping.

`context-ask` prepares native capabilities owned by the original stable page, not the temporary palette. It captures actual native account, persisted profile, epoch and window. The original account helper must match. `context-ask-authorize` is one-use and rechecks all documents/selection/account/epoch immediately before the original `sessions.createAndPrompt` mutation. Original tab attachments carry every documentCapability. Existing delayed daemon/CDP guards remain required during real reads. No new backend, model selection, synthetic success or provider call is introduced.

`context-ask-open` revalidates the native token and original context after the supplied session response. It accepts only the existing bounded session-ID grammar and builds the fixed installed Agent `/main.html#/u/<native account>/tasks/<id>/` URL. It checks the actual Navigate output belongs to the original profile/window and requested destination. A late window/document/profile change reports that the created chat remains in history; it never silently retries or creates a duplicate. Closing/cancelling/reopening the palette invalidates the pending action. A provider/setup failure is shown by the original error surface; the user must reopen to retry a consumed authorization.

The native refs retain source-page lifetime after palette close. They intentionally expire if that source page navigates/closes or profile authority changes. This is not an immutable content snapshot; ordinary protected read validation applies.

## Evidence and remaining acceptance

`check.mjs` ran one tiny synthetic boundary fixture and count-replayed the actual composed tabsearch plus native overlay. The first assertion expected two rows for a question containing “pages”; the intentional summary match produced three; the expectation was corrected. Final fixture checks passive listing, unchanged attachments, stale-profile and selection refusal before RPC, and no duplicate mutation after failed open. The actual transformed script parses. No provider request, actual product execution, native compile, owner data or UI observation occurred in this lane.

Root must compile the changed native object, compose final resources, then perform bounded disposable real-app acceptance for all three commands, true native multi-selection, navigation/profile changes during submission, source capability lifetime after palette close, original chat navigation, provider readiness/error behavior and content-quality. Real browser transport gesture/lifetime and delayed read behavior are not established by synthetic fixtures. No claim of release readiness, full isolation, cloud readiness or provider quality follows from source coverage.
