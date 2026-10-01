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
| Planning documents committed first | In progress | Verbatim plan copied; board and sync design written |
| W0-1 product identity and schema-2 qualification | Pending | Inspect existing generation/staging and implement |
| W0-2 unattended harness and split/keyboard migrations | Pending | Existing runner frozen; no new legacy branches |
| W0-3 contracts-v1, organization v2, safety, CLI, mount wiring | Pending | Must precede feature lanes |
| W0-4 native slot and native diff | Pending | One native builder owns stable-tree writes/builds/journeys |
| splitView qualify/build/promote without dev acceptance | Pending | Required Wave 0 exit evidence |

## Lane ownership and queue

All lane-owned globs, contract symbols, journeys, dependencies and exit criteria are in the canonical plan. Integrator owns contracts, generated output, main/App wiring, patch series and evidence docs. Native mirrors live under each isolated lane worktree `.native`; only builder writes stable Chromium. Lanes start from `contracts-v1`, merge integration only, and follow fixed message prefixes.

| Role / lane | Status | Patches | Agent / worktree |
|---|---|---|---|
| Integrator / Wave 0 | Active | 0136–0139, fix-ups 0186–0199 | Current chat / repository |
| Builder | Pending | Applies reviewed candidates only | To be assigned |
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

FIFO queue: `~/aux-chromium-stable/build-queue/*.json`, integration priority. Slot: `~/aux-chromium-stable/.aux-native-slot/owner.json`. No builds queued yet. No new manifests, qualification records, perf measurements or visual acceptance claimed.

Final gates: `npx tsc -b`, `npm test`, `npm run typecheck`, `npm run lint` (≤390 warnings), `npm run format:check`, host bindings check, bridge coverage check, native port inventory check, journeys registry check, `npm run budgets`. Native perf needs ≥20 trials on AC; every feature needs light/dark/reduced-transparency contact sheets with no open P0–P2 findings, then owner visual sign-off.

## Deviations / unresolved evidence

- The supplied plan has no F8 section. Preserve its numbering; implement every enumerated spec F1–F7 and F9–F21, and all mapped features. No feature is silently omitted.
- The checked-in 05 reference contains no Sync/escrow measurements. The sync document labels proposed design and missing reference evidence explicitly.
- Agent concurrency is bounded by the host's four slots, below the requested maximum of eight.

## Resume protocol

After context reset, read this board, canonical plan and `docs/HANDOFF.md`; inspect current git state and running agents before editing. Preserve all original gates. Keep qualification records script-only. Batch owner-only permission, attended-auth and final visual asks; continue independent work.
