# Versioned native tab-title provenance

Apply this exact overlay after `4487c9254` (cleanup eligibility) and `f1ee0a332` (root pin update actions). It modifies 12 existing files, including two narrowly added fixture cases in the existing model test file. No new source registration or UI component is required.

## Persisted contract and migration

Organization schema v2 adds a required `titleMode` per entry: `legacy-preserved`, `automatic`, or `manual`. The v1 decoder explicitly accepts only its prior fields and maps every existing title to `legacy-preserved`; it does not infer authorship from the URL or title text. Loading is a read-only conversion. The next admitted durable mutation writes v2 with the same IDs, labels, profiles, Spaces, records, replay ledger and revision lineage. Malformed/current-unknown/future versions are refused without overwriting original state. A v1 record containing v2-only provenance is refused. Older binaries refuse schema v2 rather than discard the new field.

Historical pin migration remains legacy-preserved. Only actual newly registered native ordinary tabs and newly captured live pin titles opt into automatic mode. The pin adapter's new final argument defaults false, so saved/bookmark-provided labels retain their earlier contract; the existing native live-pin caller explicitly supplies true. Existing logical pins retain their mode when moved. Explicit Rename marks manual even when its text happens to equal the page title. Independent copies preserve an original manual/legacy title; automatic copies read the exact local document title.

The new `kUpdateAutomaticTitle` action is appended to the enum, preserving previous operation numbers and replay fingerprints. Optional create provenance contributes to the fingerprint only when present. The model permits metadata writes only for an unarchived automatic tab whose canonical current URL exactly matches the captured URL. The browser-native `RecordTabTitles` service rejects other command kinds and uses maintenance persistence; it does not add an Undo entry. Undo of unrelated organization changes preserves the latest automatic title when the same canonical URL remains. Undo back from manual to automatic queues a new native title read.

## Native publication and presentation

Actual `WebContentsObserver::TitleWasSet`, committed navigation, and initial observation of an automatic title drive updates. Publication captures the current native view/document, logical identity, URL, profile owner generation and revision, and refuses pending shared updates, unrelated native classifications, foreign profiles, missing authority or manual/legacy mode. A queued title is read fresh when the model is available. If a document/title changes during persistence, completion queues another fresh guarded read rather than replaying the older captured string. A later navigation is still independently revision-checked; no title operation changes a URL, loaded page or focus.

There is deliberately no perpetual “local page title differs from shared title” refresh rule. Independent same-URL windows can have different page titles; unrelated snapshot refreshes must not cause an endless write oscillation. Metadata follows real native events, while the shared logical label is consumed by other windows. Loaded global-pin tooltips now respect manual/legacy stored labels instead of silently replacing them with `TabUIHelper` titles. All tile/row geometry, typography and controls remain unchanged.

The retained cleanup state is also invalidated by actual title events; a changing page is not automatically closed while metadata persistence is pending. This reuses the preceding exact compensation path.

## Focused evidence and acceptance

Exact count-one adaptation replay, equivalent unified-patch byte replay, and applied-source whitespace checks pass. Source review covered the actual native title observer API, model revision/URL/mode gates, service maintenance/Undo ordering, decoder and file-storage revision checks, and the two real pin-adapter callers. The existing unit fixture gains two cases: v1/custom/future provenance handling, and automatic-title URL/manual-rename/replay behavior; the old unknown-version fixture now uses `kSchemaVersion + 1`.

Those C++ fixture cases have **not** been executed by this worker. No native compile, app lifecycle, provider access, owner-state read or signing was performed. Integrator acceptance remains actual compilation plus a bounded native check of ordinary/pinned title updates, manual labels, legacy migration, cross-window same-URL behavior and document changes during persistence. Async metadata may briefly contain the older committed title while a newer document's own guarded metadata write is pending; this is not a destructive operation or a claim of whole-profile writer custody.
