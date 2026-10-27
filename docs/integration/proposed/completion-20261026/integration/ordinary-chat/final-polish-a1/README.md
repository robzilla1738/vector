# Final polish: PDF daemon, routine device, shortcut hint, auth key cache

Applied to the signed candidate in two bounded repairs (`integrator/final-polish-a1`, `integrator/final-polish-a2`). `prepare.py` applies `rules.json` (count-checked) to the pre-polish signed clone retained by the a1 repair.

- **PDF read_file.** The packaged daemon is the two-addon build-a2 link (`runtime/addon-local-signing-review/actual-signed-source-a1/build-receipt.json`, command 2). `runtime/final-daemon-pdf-abi/relink/relink.py orig` reproduces the unsigned daemon byte-for-byte; `new` swaps only `worker-host.o` for the PDF-ABI build. The earlier refused attempt used a different link base; this one passes the embedded startup policy.
- **Routine "Runs on".** Local mode has no hosted device list, so the details card showed "Unknown device". `routines.summary` now returns `isCurrentDevice` (device environment and `routineDeviceId` match) and the card uses it, skipping the hosted lookup for this computer.
- **Tab-search hint.** The palette hard-coded the default shortcut per mode. It now reads `auxBrowserPreferences.getKeyboardShortcuts()` whenever it becomes visible and shows the current binding (none when unassigned), falling back to the default.
- **Installation public keys.** Each `/auth/daemon/session` ran the `get-public-keys` helper synchronously. The daemon now caches the public keys, clears them on install-init/destroy, refetches once before refusing a signature, and warms the cache when the auth router is created.
- Extension version advanced to 1.26.1016.1887.
