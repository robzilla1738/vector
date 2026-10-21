# Supplied Agent pending file-read guard — v607

This proposal connects the original composer file queue to native profile-switch admission. It does not migrate jobs, cancel uploads, change UI styling or replace the supplied file implementation.

## Exact lifetime

The supplied `permission-approval-D-GTf91U.js` starts local `FileReader` promises in `ge`, counts pending work in `ee.current`, then commits completed attachments through React. Its original unmount generation invalidates pending completions. SessionStorage namespace retention cannot preserve this in-memory work.

Register a real beforeunload listener synchronously before incrementing the original queue. Retain it while reads are pending and until the original `[te,ze]` effect sees queue zero, matching scope and the existing draft callback. That effect calls original `pe(z.current,te,true)` to request immediate persistence, then removes the listener. Errors still take the original finally path and update the queue; the effect settles after the existing writer call. Original scope reset and unmount remove their own listener. No bytes or tokens enter a new storage format.

Native preflight checks only the actual Agent host's live RenderFrameHost `kBeforeUnloadHandler` owners. The broader `NeedToFireBeforeUnloadOrUnloadEvents` API also includes normal visibility/pagehide listeners, so it would falsely block idle Agent hosts. An actual pending listener rejects through the existing profile-switch busy/error path before cache construction and before old host destruction. No beforeunload dispatch, forced cancellation, fake completion, credential access or backend migration is introduced.

## Limits

- Native listener state arrives through Chromium's ordinary renderer-to-browser termination-disabler notification. This is not a new acknowledged IPC transaction. Actual-app acceptance must cover rapid file selection/profile-click ordering; do not claim that source review proves every cross-process race closed.
- Existing draft writer failure/reporting semantics remain unchanged. The listener clears after its immediate callback returns; this does not assert disk fsync or successful persistence if the original writer internally catches an error.
- A composer without a draft callback conservatively retains the guard until its original scope reset/unmount, since no attachment persistence owner is available.
- Existing independent beforeunload handlers also correctly block destructive host retirement. Ongoing daemon AI tasks are not identified with local file reads; their original-profile task ownership remains unchanged and continuation is not newly asserted.

## Artifacts and verification

`files.json` pins three native paths to v607 and four count-checked native edits. `ui-transform.json` pins the frozen supplied resource and four unique replacements; `transformed-resource.js` is the exact transformed reference before any separate branding/staging transformations. Integrator applies these replacements at the existing reviewed resource transformation boundary and refreshes the appropriate resource inventory; no runtime/addon bytes change.

Native patch apply-check, count/hash construction and JavaScript syntax check passed. No build, live upload, paid request or credential use in this lane. Combine with `70073e84b` native picker callback ownership (disjoint files) and the draft lane changes (different supplied resource). Build and actual-app acceptance remain required: pending FileReader blocks profile switching; after completed attachment draft write switching is permitted and the attachment returns in its original profile; no permanent idle block from visibility/pagehide handlers.
