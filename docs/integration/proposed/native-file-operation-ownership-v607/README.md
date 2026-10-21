# Native file operation ownership — v607

Source-only platform adaptation. Preserve the supplied file selection, validation, upload and context handoff implementation. No renderer styling, draft storage, session restore, profile credential, daemon or model changes.

## Concrete defect and fix

The selector's ThreadPool read reply and later `AddFileContextFromBrowser` reply capture only its weak pointer. A new chooser replaces the selector's `web_contents_`, `edit_model_`, image options and mode flags while those original operations still refer to that mutable owner. Delayed results can consequently use the new selection's source/options.

Track the actual callback lifetime with a `ScopedClosureRunner` per read reply and context handoff. The token remains alive through callback execution and also decrements on callback destruction without invocation. The synchronous selection/validation/close stack has a token too. Tokens hold a weak selector; destruction after the selector dies does not access it. Context handoff obtains its token before the read token can retire, leaving no admission gap.

While these owners are live, the original file/image menu commands are disabled (including dynamic input-state-model commands), and the native chooser entry refuses a stale command. No old result is dropped, moved to another profile or canceled. The original menu enablement rules still apply when the operations settle. An already open dialog also prevents a second chooser from replacing its inputs. Selected-path callbacks now recheck weak self after validation, close, focus-triggering blocker reset, dialog reset and popup reopening; this mirrors the previously corrected cancellation path.

This does **not** equate local file read completion with remote upload or AI completion. The existing selected-file/context/session profile-switch guards remain intact. `CanRetireUnusedForAuxProfileSwitch` additionally reports the precise live local-read/context-handoff blocker. Profile switching still cannot destroy selected or retained context merely because the callback counter reaches zero.

## Pins and verification

`files.json` pins all three before/after byte hashes and all seventeen unique replacements. The selector inputs match v607 composition hashes. The newly tracked original context-menu controller matches native upstream HEAD and receives its own explicit baseline pin. `prepare.py` writes only proposal copies and the patch, and checks pins/counts before construction.

Focused checks: constructor script parsed/executed, hashes/counts matched, patch apply-check passed against native v607, and whitespace checked. No build, app launch, file upload, paid request or runtime test was performed in this lane.

Integrator acceptance after the combined build: select a disposable local file, verify a second file picker cannot replace source/options while the original read/context handoff is pending, then verify normal chooser enablement returns on settlement. Verify profile switch remains blocked while actual attachment/context is retained. Check cancel remains usable and preserves the previously accepted cancel-only switch path. No broad test suite required.

## Remaining intentional boundary

Native AIM selected attachments, retained session/context, active picker/Drive/screen-share requests and pending renderer acknowledgments remain guarded. Supplied Agent daemon task continuation is a separate owner from native AIM. Retaining an Agent sessionStorage namespace alone proves neither pending attachment preservation nor runtime job handoff; this proposal makes no such claim.
