# daemon-peerloss-deadline-a1

After a browser abort, the daemon kept running and the next launch was refused ("paired daemon receipt") until someone killed it by hand. Diagnosis on an instrumented seal (`actual-result.json`):

1. On browser loss, the native `ReadyPulse` and `AuthorityLoop` threads detect peer loss and request the supplied SIGTERM shutdown. The shutdown closes the HTTP/WebSocket servers.
2. The event loop never returns. Chokidar watchers opened through `auxBrokerBoundary().watcher` keep libuv's FSEvents source alive, and the supplied shutdown never closes them. A later SIGTERM re-runs the same idempotent shutdown, so it appears ignored.
3. Once the loop returns, the worker drain stays `pending` indefinitely. Browser grant retirement waits for a browser peer to prove teardown, and a lost peer never does.

`source/AuxNativeDaemonMain.cc` bounds both steps, only after observed peer loss:
- the existing fatal `node::Stop` if the loop hasn't returned 10 s after the shutdown request;
- then, if the drain is still unresolved 10 s later, `Refuse("parent-loss-drain")` and `_exit(75)`.

There is no V8 disposal, reset or clean claim. The next launch treats it as an interruption. The deadline thread is armed only by the pulse and authority threads, under the same lock main uses before teardown, and is joined after them.

Built with the recorded fixed-builtins `main.o` command and the PDF-ABI relink command, with only `main.o` swapped (`out/live-inputs/completion-20261026/daemon-peerloss-a1/fix2/`). The JS lifeline edit from `desktop/daemon-lifeline-a1` is dropped: both daemon JS leaves are back to their pre-Batch-1 bytes.

Observed on `03e13f8e`:
- the daemon exits 21 s after a browser abort;
- relaunch then works;
- normal Quit works but takes 17 s for the browser and 37 s for the daemon, because on a clean Quit the loop doesn't end either.
