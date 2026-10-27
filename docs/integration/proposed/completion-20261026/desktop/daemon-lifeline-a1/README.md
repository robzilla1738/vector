# daemon-lifeline-a1

After a browser abort, the candidate daemon kept running and ignored SIGTERM and SIGINT. The supplied handler starts a graceful shutdown (`ii()`: end exec sessions, close channels, close the HTTP/WebSocket servers) but never calls `process.exit`. With the browser gone, a remaining handle keeps the event loop alive.

One counted edit to the candidate's `node-development/index.mjs` (the relinked `aux-daemon` loads this file):

- SIGTERM/SIGINT still run the supplied graceful shutdown, then exit after at most 10 s.
- When the daemon was started by the browser named in `AUX_BROWSER_PID` (the native supervisor sets it, and the supplied code never reads it), a 1 s unref'd check sends the same SIGTERM once `process.ppid` changes. That covers an abort, where the supervisor never gets to POST `/shutdown`.

The clean path doesn't change: the supervisor's `/shutdown` and verified SIGTERM run first, and the browser exits only after them.

`prepare.py` pins the current signed preimage from `combined-split-multipane-a1/receipt.json` and writes the replacement plus `aux-native-entry.mjs` (unchanged) to `out/live-inputs/completion-20261026/daemon-lifeline-a1/`. Those are the two daemon inputs the repair executor requires.

The stage path (`vendor/provided/daemon-adapter.mjs`) doesn't have this edit yet. Folding the completion deltas into the stage is Batch 1 Lane A. The `process.ppid` count in `vendor/provided/cdp-startup-audit.mjs` guards the supplied source only, so it still holds.

## Result (2026-10-27)

Sealed in `0e79a582` and **not effective**. After a browser abort the daemon still kept running and ignored a later SIGTERM (`../batch1-a1/actual-result.json`). The native daemon entry already runs the supplied shutdown on peer loss, so the remaining defect is that the JS loop stays alive afterward. Fix it natively and drop this edit in that seal.
