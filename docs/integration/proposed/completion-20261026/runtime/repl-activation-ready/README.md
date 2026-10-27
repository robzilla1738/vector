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

## Why the rebase waits

The cohort predates these accepted or prepared repairs:
- `final-polish-a1` and `brand-sweep-a1` (`futureResourcesLackRules`), plus the PDF-ABI rule
- `phase1-native-a1`, `product-logo-a1`, `split-multipane-metrics-a1`
- `daemon-lifeline-a1`, `split-menu-feedback-a1`, `durable-checkout-a1`

Batch 2 (wire and state identity) and Batch 4 (native addon and keychain group) rename the same daemon, browser and resource leaves this cohort replaces. Rebasing now would be done twice. The rebase therefore runs once, after Batch 4, on the durable checkout:
1. Re-project `../future-supervised-build/browser-source-plan.json` onto the then-current files.
2. Recompose both daemon resource leaves with every accepted rule.
3. Relink daemon and Framework.

It runs earlier only if Apple approves `2H4D7KNGUP` first.

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
