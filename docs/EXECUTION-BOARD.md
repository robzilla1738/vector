# Browser-runtime execution board

Objective: complete every requirement in [BROWSER-RUNTIME-PLAN.md](BROWSER-RUNTIME-PLAN.md), including Wave Q. This board records evidence, not self-reported completion.

## Integration state

- Repository: `/Users/rcourson/Documents/Vibe/web` (`/Users/rcourson/Code/web` resolves here).
- Branch: `integration/browser-runtime`, cut from clean `main` at `1cf1d75e`.
- Native tree: `/Users/rcourson/aux-chromium-stable/chromium/src`.
- No pushes, signing, release work, setup reruns or credential/session/keychain reads.
- Wave 0 is serial. Feature lanes cannot start until `contracts-v1` and unattended splitView qualification pass.
- Available agent capacity is four including integrator; the plan permits up to eight. Run at most three child agents, preserving one dedicated builder and, from Wave 1, one design reviewer. Reuse the remaining lane slot as dependencies clear.

## Wave 0

| Item | Status | Evidence / next action |
|---|---|---|
| Planning documents committed first | Complete | Docs-only first commit `ffcf8a54` |
| W0-1 product identity and schema-2 qualification | In progress | Identity/stamping/schema-2 writer implemented; focused tests pass; no qualified records |
| W0-2 unattended harness and split/keyboard migrations | In progress | Swift serve compiled; AX/app/RPC/fixtures/evidence helpers and split/keyboard modules implemented; split and keyboard native diagnostics passed; reader port and native test clock pass; remaining legacy bridge coverage pending |
| W0-3 contracts-v1, organization v2, safety, CLI, mount wiring | In progress | Safety and CLI discovery fixes tested; B12, 192 host methods/26 events and runtime contracts implemented; organization v2 source/tests pass, native validator applied; shell mounts/runtime boots and shared clock implemented; no tag |
| W0-4 native slot and native diff | In progress | Slot/diff tooling and scratch pins implemented and fixture-tested; dedicated builder incremental smoke passed |
| splitView qualify/build/promote without dev acceptance | Pending | Required Wave 0 exit evidence |

## Lane ownership and queue

All lane-owned globs, contract symbols, journeys, dependencies and exit criteria are in the canonical plan. Integrator owns contracts, generated output, main/App wiring, patch series and evidence docs. Native mirrors live under each isolated lane worktree `.native`; only builder writes stable Chromium. Lanes start from `contracts-v1`, merge integration only, and follow fixed message prefixes.

| Role / lane | Status | Patches | Agent / worktree |
|---|---|---|---|
| Integrator / Wave 0 | Active | 0136–0139, fix-ups 0186–0199 | Current chat / repository |
| Builder | Active | 0136–0139 applied and reverse-checked; v2 incremental build and diagnostics passed | `/root/builder` / stable native tree |
| Design reviewer | Waiting for Wave 1 | None | To be assigned |
| L1 Commands | Waiting for Wave 0 | 0140–0143 | Unassigned |
| L4 Windows | Waiting for Wave 0 | 0148–0153 | Unassigned |
| L2 Layout | Waiting for Wave 0 | 0144–0147 | Unassigned |
| L5 Surfaces | Waiting for Wave 0 and L4 selector | 0172–0177 | Unassigned |
| L6 Profiles/routing | Waiting for Wave 0 | 0154–0159 | Unassigned |
| L7 Extensions | Waiting for Wave 0 | 0160–0165 | Unassigned |
| L8 Organize | Waiting for Wave 0 | 0178–0179 | Unassigned |
| L9 Downloads | Waiting for Wave 0 | 0166–0169 | Unassigned |
| L10 Agent trust | Waiting for Wave 0 | None | Unassigned |
| LJ Legacy journeys | Waiting for Wave 0 | None | Unassigned |
| L3 Command surface | Waiting for L1 | 0170–0171 | Unassigned |
| L11 Autonomy | Waiting for Wave 2 | 0180–0183 | Unassigned |
| L12 Polish/performance | Waiting for all feature lanes | 0184–0185 | Unassigned |

Merge order: L1 → L4 → L2 → L5 → L6 → L7 → L8 → L9 → L10 → LJ → L3 → L11 → L12. Integrator verifies every claim with gates and native journeys before merging.

## Native build queue and evidence

FIFO queue: `~/aux-chromium-stable/build-queue/*.json`, integration priority. Slot: `~/aux-chromium-stable/.aux-native-slot/owner.json`. Latest v2 incremental build passed (49 native steps, 1m36.77s). Native/runtime labels agree at `a874dea49faffab2e24a25e5d1e2b149c7df293e+dirty`; qualified features are empty. Shell digest `587cb93b964414daf1a39817ffe5fd4fbbff23cfff9eeb12ef10fda73d541ea1`. Logs: `/tmp/aux-browser-runtime-w0-v2-{shell,build,runtime}.log`. Dirty diagnostics `w0-v2-split-view-diagnostic-2026-10-01-b`, `w0-v2-keyboard-tabs-diagnostic-2026-10-01`, and `w0-v2-reader-diagnostic-2026-10-01` passed with real UI inputs, AX/RPC observations and captures. Integrator independently verified all capture byte counts/hashes and passed steps; these cannot qualify. Separate v2 restart diagnostic proves shared organization persistence and explicit test-clock scale 1000. The first split attempt caught a bundled runtime boot path defect; static generated boot imports fixed it, without relaxing assertions. About status probe `w0-promotion-ui-diagnostic-2026-10-01-d` verifies preview without acceptance and exposes offscreen AX matches; promotion now searches About and requires a visible status frame. Page-zoom restart port diagnostic `w0-v2-page-zoom-diagnostic-2026-10-01-c` passed; integrator verified native zoom 0.5227586988632231 then 0 and capture hashes. Current source adds bounded `setStageVisible` (193 methods / 26 events, `9c8a58e9f274`); compiled app remains at 192 / `aa36979d020e` until next build. New normal shell pin `f3c53343b16128bdac4297ba5ad778c48d48659185c6d250614eaea80fea13ae` independently verifies. No qualification, perf or visual acceptance claimed.

Final gates: `npx tsc -b`, `npm test`, `npm run typecheck`, `npm run lint` (≤390 warnings), `npm run format:check`, host bindings check, bridge coverage check, native port inventory check, journeys registry check, `npm run budgets`. Native perf needs ≥20 trials on AC; every feature needs light/dark/reduced-transparency contact sheets with no open P0–P2 findings, then owner visual sign-off.

## Current verification

- Rebuilt full unit suite passes 383 files / 2036 tests (`/tmp/aux-w0-unit-final.log`). Qualification validator subsequently tightened to require a nonempty AX tree; focused qualification tests pass.
- Workspace typecheck, generated bindings, bridge coverage, port inventory and format ratchet pass on the final foundation slice; lint remains 379 warnings / zero errors. Build budgets pass: startup JS 470/490 KB, CSS 179/180 KB, total JS 1681/1800 KB. These are bundle checks, not the required native perf trials.
- `journeys/index.mjs --check` intentionally remains failing until all mapped journeys and B12 feature contracts exist; no gate has been relaxed.
- Owner clarification about the Wave 0/full target-registry dependency cycle remains pending; no gate or lane sequencing requirement has been relaxed. Independent foundation and journey port work continues.
- Foundation product/harness commit is being prepared; initial documents were committed first. `contracts-v1`, qualification and promotion are outstanding.

## Deviations / unresolved evidence

- Native port inventory now preserves all 103 historical smoke sources and four historical e2e cases at the pre-retirement commit, permitting missing files only if explicitly deleted by existing main commit `56c53810`; unknown deletions and new cases still fail. Retired cases retain their coverage status.
- Clock scaling preserves native wall timestamps and scales elapsed ages/scheduled delays through one abstraction; scale is optional, bounded 1–100000, and native exposes it only in test builds with an explicit switch. Production omits the property.
- Slot acquisition now honors its timeout even when a crashed reclaimer left a lock; regression test passes.
- Memory Git maintenance now stays synchronous, fixing a real detached writer caught by the full suite.
- W0 runtime/native stubs are temporary as explicitly required by W0-3; all must be replaced before final completion.
- Git `ls-tree` rejects exclusion pathspec magic. The identity helper filters full NUL-separated tree records using the same product exclusions, preserving original bytes and ordering before hashing; fixture tests cover excluded commits and untracked product edits.
- The supplied plan has no F8 section. Preserve its numbering; implement every enumerated spec F1–F7 and F9–F21, and all mapped features. No feature is silently omitted.
- The checked-in 05 reference contains no Sync/escrow measurements. The sync document labels proposed design and missing reference evidence explicitly.
- Agent concurrency is bounded by the host's four slots, below the requested maximum of eight.

## Resume protocol

After context reset, read this board, canonical plan and `docs/HANDOFF.md`; inspect current git state and running agents before editing. Preserve all original gates. Keep qualification records script-only. Batch owner-only permission, attended-auth and final visual asks; continue independent work.
