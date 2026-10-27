# Keep the daemon responsive while browser REPL code runs

Startup14's combined Muse check ran a model-generated browser REPL script that never yielded. The supplied QuickJS interrupt handler only fires on abort or the 120 s run deadline, and abort cannot be observed while guest code holds the Node event loop. The daemon therefore stopped answering its health probe ("Bundled daemon did not become ready", 18:03:03) and the extension bridge closed with 1011 until the deadline released it.

Two changes, applied to the a3 queued-send derivatives (current and future):

- `Repl.run` adds an unref'd 250 ms heartbeat. The existing interrupt handler also stops guest code once the event loop has not ticked for 5 s, and reports a TimeoutError telling the model to split synchronous work. Stop and the deadline behave as before. After an aborted, timed-out or blocked run, the handler stays in "always interrupt" mode so leftover guest jobs drain instead of resuming; the next run installs its own handler. Normal runs still remove it.
- `QuickJSBridge.pump` executes pending jobs in batches of 64 and yields to the event loop with `setImmediate` after 50 ms, so endless async guest chains cannot starve heartbeats, health checks or Stop.

`check.mjs` exercises the same mechanism against the bundled `quickjs-emscripten@0.31.0`: a synchronous infinite loop is stopped after the block limit, and an endless async recursion keeps the event loop responsive and ends on abort. Both derivative pairs pass `node --check`.

Outputs: `/private/tmp/aux-repl-event-loop-guard-20261026-a1-{current,future}`. No native build, signing, model call or live state change is part of preparation.
