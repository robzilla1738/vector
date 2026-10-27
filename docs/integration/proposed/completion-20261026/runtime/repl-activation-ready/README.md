# REPL activation readiness (2026-10-27)

General Bash, PTY and the CLI REPL stay **inactive**. Tools return disabled-capability failures. Nothing here signs, activates or changes the candidate.

## Source and build state

The execution cohort in `../future-supervised-build/` is complete for its frozen baseline. Its README says no known local source or build join remains:
- generic filesystem (12 methods, `../selected-repl-fs/checkpoint.json` v2: integrated, compiled, not activated)
- session scratch, runtime lease, cancellation and awaited QuickJS/CLI disposal
- the linked PTY built-in (`../fixed-pty-linked/`): a private NAPI8 initializer for static linkage that keeps `--no-addons`, replacing generic `require('node-pty')`
- the early ES descendant observer and native exec/PTY reservation joins, with the original sole-reaper and descendant-cohort joins
- the paired browser producers and Framework link (`native-cohort-receipt.json`)

## Preserved inputs

The cohort, like most completion receipts, pinned its sources and outputs under `/private/tmp`, which macOS purges. On 2026-10-27, every surviving referenced directory was APFS-cloned to `out/live-inputs/tmp-preserved/<name>`: 93 directories, plus the 78 individual files cited from the old `/private/tmp` Chromium tree. `manifest.json` there records each file's SHA-256. A receipt path `/private/tmp/<name>/…` resolves to `out/live-inputs/tmp-preserved/<name>/…`. Receipts are historical records and were not rewritten.

Already gone before preservation:
- **Worktree sources:** 44 references to removed `/private/tmp` worktree sources. Every one exists at the same `docs/…` path in HEAD.
- **Superseded build outputs (five):**
  - `aux-completion-selected-daemon-20261026-a1`
  - `aux-future-supervised-native-20261026-a1` (b1 superseded it and is preserved)
  - `aux-native-host-daemon-build-20261026-a1`
  - `aux-spawn-custody-native-20261023-r4-complete`
  - `aux-selected-owner-fixture`
  
  Their receipts remain.
- **Template names:** the remaining references are name templates such as `…-a1-` and are not real directories.

## Rebased onto the current seal (2026-10-27)

The cohort now carries every correction the shipping candidate has. Nothing is activated, signed or linked into the candidate.

- **Browser overlay:** `future-supervised-build/browser-source-rebased-a1/` holds all 12 files with every one of the 19 counted anchors replayed onto the current durable tree, including the three files that had drifted (`daemon_supervisor.cc`, `AuxSelectedStateHome.cc`, `AuxOwnedNativePeerChild.cc`). Every change stays behind `AUX_FIXED_LINKED_PTY_POLICY`.
- **Daemon JS:** `future-supervised-build/resources-rebased-a1/compose.py` replays the final-polish (6), brand-sweep (13), broker-order (8) and memory-close (2) rules onto both frozen future leaves. All apply exactly once and both outputs parse. This clears `futureResourcesLackRules`.
- **Daemon main:** `future-supervised-build/main-rebased-a1/` is the future main with the bounded peer-loss shutdown applied cleanly. It compiles with the cohort's recorded command.
- **Task layout:** the future link uses the same file the shipping daemon used, so `prepared-lease-recovery-a1/source/AuxNativeTaskLayout.swift` applies as-is.
- **PDF-ABI:** the future link must swap in `out/live-inputs/tmp-preserved/aux-completion-final-daemon-pdf-abi-20261026-a1/worker-host.o`, exactly as `final-daemon-pdf-abi/relink/relink.py` did for the shipping daemon.

What is left before activation is only what Apple gates: relink the daemon and Framework from these inputs, then make the entitlement/profile change and the v11 signing delta.

## Activation (after Apple approves 2H4D7KNGUP)

1. Confirm the grant covers Team `9F2JXY8TCK` and `dev.aux.browser.daemon`. The early browser observer also needs coverage for `dev.aux.browser`; that is unverified (`../future-supervised-build/README.md`).
2. Prepare a daemon-only entitlement/profile delta. It keeps the existing identity, JIT and Aux Keychain groups, and pins the profile and executable bytes.
3. Prepare the v11 signature/resource/namespace delta for the rebased cohort, then apply it with a local reseal.
4. Run the six journeys on a disposable profile:
   - one Bash command
   - one yielded/cancelled command
   - one PTY input/resize/exit sequence
   - one escaped descendant
   - account/session revocation
   - normal Quit
