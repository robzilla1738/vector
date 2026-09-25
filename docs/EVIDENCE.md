# Aux evidence ledger

Updated September 24, 2026. This ledger records what the current code or a recorded run proves. Requirements and acceptance criteria live in [ROADMAP.md](ROADMAP.md). Historical detail is retained under [archive/](archive/README.md); archived completion claims do not transfer to the new Chromium host.

## Labels

- **[Verified]** Observed in current code or a recorded run, with a linked artifact or exact command and revision.
- **[Partial]** Demonstrated only in named conditions; remaining conditions are explicit.
- **[Promising]** Strong reference evidence, not yet tried in Aux.
- **[Assumption]** Untested; a named spike must prove it before dependent work.

A passing fixture, mock UI, or Electron run is never evidence for a native Chromium journey. Record failures as failures. For any speed claim, add raw data and a row to [BENCHMARKS.md](BENCHMARKS.md).

## Baseline at `4d01370a`

| Area | Label | Evidence | Remaining gate |
| --- | --- | --- | --- |
| CI | **[Verified]** failing | [September 24 CI checkpoint](evidence/ci-handoff-2026-09-24.md): 16 lint errors, 488 warnings against 390, missing jsdom types; all seven checks red at the prior PR head. | Green required checks on the exact new SHA. |
| Chromium proof | **[Verified]** bounded | [Archived host comparison](archive/2026-09-24-b0-reset/M1-HOST-COMPARISON.md): first 56,841-step build completed; candidate Store install and restart passed. | Stable-tag base, extension API matrix, signed compatibility. |
| Native shell | **[Partial]** | [Archived host comparison](archive/2026-09-24-b0-reset/M1-HOST-COMPARISON.md): React shell over real tabs and limited glass/input journeys. | Floating sidebar, accessibility failure, real runtime, window and Profile journeys. |
| Agent runtime | **[Verified]** in Electron | [Archived implementation record](archive/2026-09-24-b0-reset/ROADMAP.md) documents durable write intent, epochs, takeover, and protected observation. | Re-qualify against the fork; no native agent action has passed. |
| Reference fidelity | **[Promising]** | The reviewed [roadmap](ROADMAP.md) records P1/P3/P4/P6/P7 and upstream observations. | Capture reproducible specs and test Aux surfaces against them. |
| Webium readiness | **[Assumption]** | Upstream code is present, but the roadmap counts unimplemented host paths. | B2 zero-build spike and bounded matrix. |

## Program spend

The cap is **$50 total** for Aux and its harnesses across all waves. Planned allocation: Wave 0 smoke ≤$1; Waves 1–2 development smokes ≤$8; Wave 2 planner/code comparison ≤$8; Wave 4 qualification ≤$20; remainder reserved. The runtime's persisted cumulative ledger is the authority for spend after B0 lands. At this documentation reset, prior cumulative spend is **unreconciled**, so no numeric remaining balance is claimed. Reconcile it before the next Gateway run, then record exact USD total, ledger revision, and run IDs here.

| As of | Ledger revision | Recorded cumulative USD | Remaining USD | Runs / notes |
| --- | --- | ---: | ---: | --- |
| 2026-09-24 baseline | Pending B0 integration | Unreconciled | Unreconciled | No model smoke result is claimed. |

## Batch record

| Batch / commit | Label | Result and raw evidence | Open failures |
| --- | --- | --- | --- |
| B0 docs reset | **[Verified]** document state | Reviewed plan adopted as the sole roadmap; superseded planning and UI ledgers archived; [reference spec scaffold](reference-specs/README.md) created. | Other B0 gates are tracked by their implementing lanes; do not infer CI or model success from this row. |
