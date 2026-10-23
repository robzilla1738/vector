# Download, migration and scheduled-producer writer continuation (inactive)

`applyAuxCompletionWrites(source)` accepts only the exact `18edabeb…` recovery source and produces a successor with 25 count-checked seams. Native WorkerHost, Owner, counters, policy and UI are unchanged. Root composes this source and its dormant entry separately; the ordinary cold refusal remains intact.

Implemented finite/resource coverage:

- Five actual filesystem output streams—model decompression, skill archive, runtime archive download, runtime ZIP entries and webfetch artifacts—use the existing native retained producer-stream lifetime. Pending custody ends only at real stream close, errors retain unknown, and shutdown does not end these streams before their producers finish. Fetch, pipeline or iterator settlement alone does not release them.
- Drive-sync metadata SQLite now uses the existing real native database lifetime, keeping its WAL/connection under custody through original synchronous close. Metadata directory creation has finite synchronous admission.
- Actual project migration directory creation, recursive merge, external-storage marker reads/removal/write and legacy session alias operations have synchronous guards. Original collision/rename/copy/fallback behavior is preserved. Merge, alias and completion-marker functions explicitly retain unknown before their catch/continue paths; partial failure cannot become a clean migration receipt. This does not redesign or authorize migration into owner directories.
- Runtime writable-directory preservation uses finite awaited custody through original recursive copy/removal. Its asynchronous filter is a bounded original stat check; no callback is supplied by the caller.

Implemented producer refusal/uncertainty coverage:

- Skill/ZIP extraction, runtime install/download and runtime replacement check real owner admission at entry and mark unknown. These have subprocesses, event listeners, arbitrary replacement callbacks or other producers, so a fulfilled outer Promise is deliberately **not** accepted as proof of drain.
- The actual DriveSync queue rechecks admission at dispatch, after waiting for prior work, and retains unknown before starting the original producer. A queue scheduled before shutdown cannot start a new write producer after closure. The no-runtime path is normalized to a rejected Promise when admission fails so existing asynchronous callers can handle it.
- Actual watcher creation retains unknown; file watcher callbacks refuse after shutdown before mutating caches/scheduling work. The watcher itself is not claimed closed: its close lifecycle and any other callbacks remain outstanding.
- The dreaming entry point checks admission and retains unknown before its nested scheduled work. Individual previously covered memory writes retain their finite guards.

Focused validation executes exact transformed recursive migration and runtime-preservation bodies on disposable directories, checks migration destination conflicts, and exercises the actual queue's close-while-waiting case. Complete source syntax and changed-input rejection pass. The native binding is explicitly synthetic; no daemon, protected browser, owner data, provider, signing or OS permission operation runs. Native code is unchanged, so another native compile would provide no new evidence and was not run.

Remaining gaps are explicit: whole download/install producer cancellation and cleanup; ZIP reader/event listener closure; watcher/timer shutdown; arbitrary runtime callback and subprocess descendant custody; unenumerated provider/import/native utility/extension producers; migration transactional/atomic path safety and restart recovery; and integrated protected-browser acceptance. Stream closure and finite filesystem results do not clear other unknown counters. This source cannot on its own make the successor ready or enable protected profile switching.
