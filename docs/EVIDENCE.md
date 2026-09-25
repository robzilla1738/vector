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

The cap is **$50 total** for Aux and its harnesses across all waves. Planned allocation: Wave 0 smoke ≤$1; Waves 1–2 development smokes ≤$8; Wave 2 planner/code comparison ≤$8; Wave 4 qualification ≤$20; remainder reserved. The persisted SQLite ledger at the default Aux data directory is shared across Profiles and fixture runtimes. Failed calls with unknown usage keep their full projected reservation as charged spend.

| As of | Ledger revision | Recorded cumulative USD | Remaining USD | Runs / notes |
| --- | --- | ---: | ---: | --- |
| 2026-09-24 B0 smoke | `80816007` | $0.210960221 | $49.789039779 | `SpendLedger.summary()` after live fixture-only smoke; successful responses reported $0.00050892, and failed probes were conservatively charged. No reservations remain outstanding. |

## Batch record

| Batch / commit | Label | Result and raw evidence | Open failures |
| --- | --- | --- | --- |
| B0 docs reset | **[Verified]** document state | Reviewed plan adopted as the sole roadmap; superseded planning and UI ledgers archived; [reference spec scaffold](reference-specs/README.md) created. | Other B0 gates are tracked by their implementing lanes; do not infer CI or model success from this row. |
| B2 zero-build / `154` base selection | **[Partial]** | [Webium decision](decisions/host-composition.md): existing candidate loaded Webium, local page input, tabs, context menu and window fullscreen; stock split command failed. Chromium Mac stable `154.0.8037.58` tag resolves to `a65484142514cbb703a2931e07b70a83aedbafd`. | Full critical subset, native Aux W implementation and matrix remain open. |
| B0 CI and model | **[Verified]** on integrated checkout | `pnpm lint` passes at 387 warnings with the 390 limit unchanged; `pnpm typecheck` passes; `pnpm test:unit` passes 240 files and 1,200 tests. The [fixture-only Gateway smoke](../tests/smoke/muse-gateway.mjs) confirmed live catalog ID, streaming JSON, structured output, image input, tool calling and low/medium reasoning. [Official Gateway model metadata](https://vercel.com/ai-gateway/models/muse-spark-1.3-contributor) corroborates ID, context and list prices. | Hosted checks on exact SHA and the wave PR remain to verify. |
| B1 pinned source and native CI | **[Partial]** | Exact Chromium `154.0.8037.58` tag resolves to `a654841425914cbb703a2931e07b70a83aedbafd`; `gclient sync --no-history --shallow -j 8 --revision src@a654...` completed. Official `.0` lite archive SHA-256 is recorded in [downloads.ini](../chromium/downloads.ini). The initial patch series applies cleanly; `gn gen out/AuxDev` made 34,239 targets. The repository is private, and GitHub API reports repository-scoped `aux-mac-rcourson` online with `aux-mac`. Full compile has started; its result is pending. | Candidate app, Aux shell, patch-series reproduction and green `aux-mac` PR lane remain open. |
