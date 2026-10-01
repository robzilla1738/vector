# Browser-runtime execution board

Objective: complete every requirement in [BROWSER-RUNTIME-PLAN.md](BROWSER-RUNTIME-PLAN.md), including Wave Q. This board records evidence, not self-reported completion.

## Integration state

- Repository: `/Users/rcourson/Documents/Vibe/web` (`/Users/rcourson/Code/web` resolves here).
- Branch: `integration/browser-runtime`, cut from clean `main` at `1cf1d75e`.
- Native tree: `/Users/rcourson/aux-chromium-stable/chromium/src`.
- No pushes, signing, release work, setup reruns or credential/session/keychain reads.
- Wave0 foundation checks and clean splitView qualification/promotion pass. `contracts-v1` tagged at2af63300; Wave1 uses isolated worktrees from that ref.
- Available agent capacity is four including integrator; the plan permits up to eight. Run at most three child agents, preserving one dedicated builder and, from Wave 1, one design reviewer. Reuse the remaining lane slot as dependencies clear.

## Wave 0

| Item | Status | Evidence / next action |
|---|---|---|
| Planning documents committed first | Complete | Docs-only first commit `ffcf8a54` |
| W0-1 product identity and schema-2 qualification | Complete | Clean product identity survives docs commit; script-written splitView record independently validated |
| W0-2 unattended harness and split/keyboard migrations | Foundation complete | Swift serve compiled; AX/app/RPC/fixtures/evidence helpers and split/keyboard modules implemented; split and keyboard native diagnostics passed; reader port and native test clock pass; remaining legacy bridge coverage pending |
| W0-3 contracts-v1, organization v2, safety, CLI, mount wiring | Foundation complete | Safety and CLI discovery fixes tested; B12, 192 host methods/26 events and runtime contracts implemented; organization v2 source/tests pass, native validator applied; shell mounts/runtime boots and shared clock implemented; contracts-v1=2af63300; mock build pass |
| W0-4 native slot and native diff | Complete | Slot/diff tooling and scratch pins implemented and fixture-tested; dedicated builder incremental smoke passed |
| splitView qualify/build/promote without dev acceptance | Complete | Clean f0fe15d0 schema2 record/manifest independently validated; runtime and visible About on probe passed without acceptance |

## Lane ownership and queue

All lane-owned globs, contract symbols, journeys, dependencies and exit criteria are in the canonical plan and [lane briefs](BROWSER-RUNTIME-LANE-BRIEFS.md). Integrator owns contracts, generated output, main/App wiring, patch series and evidence docs. Native mirrors live under each isolated lane worktree `.native`; only builder writes stable Chromium. Lanes start from `contracts-v1`, merge integration only, and follow fixed message prefixes.

| Role / lane | Status | Patches | Agent / worktree |
|---|---|---|---|
| Integrator / Wave 0 | Active | 0136–0139, fix-ups 0186–0199 | Current chat / repository |
| Builder | Idle, dedicated | 0136–0139 applied and reverse-checked; v2 incremental build and diagnostics passed | `/root/builder` / stable native tree |
| Design reviewer | Waiting for corrected native captures | None | /root/design_reviewer /tmp/aux-browser-runtime-design |
| L1 Commands | Active | 0140–0143 | /root/l1_commands /tmp/aux-browser-runtime-l1 |
| L4 Windows | Active source implementation | 0148–0153 | /root/l4_windows /tmp/aux-browser-runtime-l4 |
| L2 Layout | Waiting for lane capacity | 0144–0147 | Unassigned |
| L5 Surfaces | Waiting for L4 selector and lane capacity | 0172–0177 | Unassigned |
| L6 Profiles/routing | Waiting for lane capacity | 0154–0159 | Unassigned |
| L7 Extensions | Waiting for lane capacity | 0160–0165 | Unassigned |
| L8 Organize | Waiting for lane capacity | 0178–0179 | Unassigned |
| L9 Downloads | Waiting for lane capacity | 0166–0169 | Unassigned |
| L10 Agent trust | Waiting for lane capacity | None | Unassigned |
| LJ Legacy journeys | Frozen dfe9a314; twelve-journey builder retry | None | /root/lj_journeys /tmp/aux-browser-runtime-lj |
| L3 Command surface | Waiting for L1 | 0170–0171 | Unassigned |
| L11 Autonomy | Waiting for Wave 2 | 0180–0183 | Unassigned |
| L12 Polish/performance | Waiting for all feature lanes | 0184–0185 | Unassigned |

Merge order: L1 → L4 → L2 → L5 → L6 → L7 → L8 → L9 → L10 → LJ → L3 → L11 → L12. Integrator verifies every claim with gates and native journeys before merging.

## Native build queue and evidence

FIFO queue: `~/aux-chromium-stable/build-queue/*.json`, integration priority. Slot: `~/aux-chromium-stable/.aux-native-slot/owner.json`. Latest v2 incremental build passed (49 native steps, 1m36.77s). Native/runtime labels agree at `a874dea49faffab2e24a25e5d1e2b149c7df293e+dirty`; qualified features are empty. Shell digest `587cb93b964414daf1a39817ffe5fd4fbbff23cfff9eeb12ef10fda73d541ea1`. Logs: `/tmp/aux-browser-runtime-w0-v2-{shell,build,runtime}.log`. Dirty diagnostics `w0-v2-split-view-diagnostic-2026-10-01-b`, `w0-v2-keyboard-tabs-diagnostic-2026-10-01`, and `w0-v2-reader-diagnostic-2026-10-01` passed with real UI inputs, AX/RPC observations and captures. Integrator independently verified all capture byte counts/hashes and passed steps; these cannot qualify. Separate v2 restart diagnostic proves shared organization persistence and explicit test-clock scale 1000. The first split attempt caught a bundled runtime boot path defect; static generated boot imports fixed it, without relaxing assertions. About status probe `w0-promotion-ui-diagnostic-2026-10-01-d` verifies preview without acceptance and exposes offscreen AX matches; promotion now searches About and requires a visible status frame. Page-zoom restart port diagnostic `w0-v2-page-zoom-diagnostic-2026-10-01-c` passed; integrator verified native zoom 0.5227586988632231 then 0 and capture hashes. Current source adds bounded `setStageVisible` (193 methods / 26 events, `9c8a58e9f274`); compiled app remains at 192 / `aa36979d020e` until next build. New normal shell pin `f3c53343b16128bdac4297ba5ad778c48d48659185c6d250614eaea80fea13ae` independently verifies. Clean splitView qualification now passed separately; no perf or visual acceptance claimed.

Final gates: `npx tsc -b`, `npm test`, `npm run typecheck`, `npm run lint` (≤390 warnings), `npm run format:check`, host bindings check, bridge coverage check, native port inventory check, journeys registry check, `npm run budgets`. Native perf needs ≥20 trials on AC; every feature needs light/dark/reduced-transparency contact sheets with no open P0–P2 findings, then owner visual sign-off.

## Current verification

- Rebuilt full unit suite passes 383 files / 2036 tests (`/tmp/aux-w0-unit-final.log`). Qualification validator subsequently tightened to require a nonempty AX tree; focused qualification tests pass.
- Workspace typecheck, generated bindings, bridge coverage, port inventory and format ratchet pass on the final foundation slice; lint remains 379 warnings / zero errors. Build budgets pass: startup JS 470/490 KB, CSS 179/180 KB, total JS 1681/1800 KB. These are bundle checks, not the required native perf trials.
- `journeys/index.mjs --check` intentionally remains failing until all mapped journeys and B12 feature contracts exist; no gate has been relaxed.
- Sequencing uses the plan's explicit W0-3 foundation gates plus clean splitView promotion. Full target registry remains unchanged and mandatory before feature merges and final integration; its future-feature coverage cannot precede implementation. This interpretation is recorded in the plan; no owner waiver is claimed.
- Foundation product/harness committed `f0fe15d0`; initial documents were committed first. `contracts-v1` tagged2af63300 after foundation exit. Clean splitView qualification/promotion passes; integrator independently validated the record/manifest/captures and reviewed successful scripted promotion assertions. Docs-only record commit0345bb40 and repeated promotion/on probe both pass.

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


Clean split qualification: product `f0fe15d04d94ff98a70e66105350520bb8061fc9`, tree `9c1ae21d20b5d9a466e916b474b709461b460d3f`; native manifest `9c8a58e9f274406550a10392694a85f835d613bc73282249679a21ee7a43dcb3`. Record `docs/qualification.json#features.splitView`; manifest `release/test-artifacts/browser-runtime/f0fe15d04d94ff98a70e66105350520bb8061fc9/split-view-1790833467257-1/manifest.json` SHA `de8a8a573d0e92ed1f7b811d65128dc4e84e463b9b2967bd54c762112b1d80b4`. All three steps pass (one attempt), capture hash independently verified. Qualification build23steps1m12.12s; promotion relink11steps14.14s; log `/tmp/aux-browser-runtime-w0-clean-split-qualification.log`. Script exit0 includes runtime and visible About on assertions without development acceptance. Cleanup verified. Mock build passes at /tmp/aux-w0-mock-build.log. Docs-only promotion stability diagnostic w0-docs-promoted-2026-10-01 independently verifies splitView on, native qualifiedFeatures=[splitView], developmentAcceptanceRequested=false, and a visible19px AX frame; capture inspected/hash verified. Foundation phase exit passes, full feature registry remains open until feature merges.


Wave1 dispatch: reviewer, L1 and LJ each have isolated contracts-v1 worktrees and full briefs/roster. L1 requests a core dispatchCommand contract for normal/private windows plus a shared shortcut adapter. LJ requests owned prelaunch fixture preparation. Integrator awaits saved patches before applying; full target registry remains mandatory before feature merges. Reviewer reports P2 Reader overlap, offscreen native zoom popup and About status column collision; closure requires new native evidence, no visual completion claimed. Root prepares future-feature journey definitions to resolve static coverage before merges. Builder roster notification must be retried once an agent slot is idle (tool rejected delivery at four active slots).

Contracts-v2 checkpoint: core dispatchCommand(normal/private window), all-command shortcut override rows, disposable prelaunch prepare hook and TLS ClientHello fixture counter are integrated. Generated194 methods/26 events (3e697f1058ca); typecheck,13 focused tests, codegen/bridge/inventory/format and lint379 pass. Dedicated builder staged103 assets digest599982dd8df28417218d291068d3cb26ae57c7b52fb27f3fe63f8914b292b26f; budgets470/179/1682 pass. Native build remains pending; no new qualification claimed. Inspect and trusted website double-press contracts follow after review. App/control adapters await L1 commands module. Reviewer foundation docs merged65a7202e, with four open P2 findings. LJ has nine candidate ports but no native proof yet. Roster delivery to builder succeeded.

Contracts-v3 checkpoint: devTools accepts optional toggle/inspect; onShortcut accepts optional websitePassThrough notification for native forwarding of the actual second trusted event. Generated194/26 hash386a28167923;13 focused tests, typecheck, codegen, bridge and format pass. Builder staged103 assets digesta3f65c8a2cb09787b974d4114633a6f44e98f7437e65ec516d7b4f1d23bc1908; root independently verified pin; budgets470/179/1682 pass. L1 must test navigation/focus target refusal for website forwarding before native review. LJ frozen candidate d9110f6ad2e7542d62ae0a06e3e89acc789fc347 independently source-reviewed, eleven IDs queued builder. Parity matrix preserves remaining gaps; no feature merge/new qualification yet.

Future L2 verification: integrator added layout-modes.mjs with sidebar-modes and minimal-ui. Real UI/RPC assertions cover auto-hide toggle,216ms reveal, below111px snap, registered CmdS, both-layout Minimal UI250ms toggle and99% page/window area plus top/left controls. Syntax and metadata for these four feature targets pass; full registry still fails missing remaining mapped features, no gate relaxation or native pass claimed. L2 must independently review selectors against its implementation and provide native geometry captures. Lint gate passes after addition. LJ candidate build now running after ignored local pnpm task-state symlink repair; candidate digest matches committed pin599982dd8df28417.

Native LJ candidate d9110f6a build passed23steps/1m12.18s with clean c304e798 product, scratch pin matching599982dd8df28417. Early native results: QuickAsk passed; sitepermissions0cookies instead1cookie, translation wrong AXrole, Peek/tabname dependentpress races, HTTPS nonexistentrailcategory, Reader shortcut no effect. All preserved as failures. L1 identified native KeyboardCodeFromCharCode does not map Space; new all-command inventory adds QuickAsk Space and rejects whole shortcut inventory atomically. Reserved0140 will explicitly map Space and reverify; source diagnosis is not a passing nativeclaim. Root independently inspected available manifests/failureAX.
Root source repairs DR001/DR003 prepared: Reader toolbar horizontal left reserve derives from sidebar control offset+control-h+12px gap; About table fixed readable columns/8px cellpadding/wrapping. Inspected both original images; typecheck/format/diffcheck pass. Native/theme/narrow/AX nonintersection closure still pending, findings stay open. Product currently dirty in these3 files, shell pin regeneration pending dedicated builder after LJ batch.

LJ candidate final audit:1pass(QuickAsk)/10fail. Root independently checked all11 manifest digests, only capture digest/size and QuickAsk schema2 validator against frozen module. Canonical release/test-artifacts/lj-d9110f6a-audit.json preserves exact failures. Worktree released for evidence-backed corrections, no merge/records. Reviewer queued QuickAsk capture. Reader/About source repairs shellpin c2342cba909a34d9556560fd76c4eb256168b9183b5075b28fb7e3fa2914493c independently verifies103assets; budgets470/179/1682, typecheck/lint/formatpass. Nativeclosurepending. L1 source/native0140 and saved sharedadapters ready independentreview; invariant intentionallyfails unappliedadapters. Exact QuickAsk globalregistration hunks assigned L1 reserved0141 to remove hardcoded chord ownership and preserve opt-in; Profile selection dependency laterL6.

QuickAsk capture audit: reviewer independently found functionalpass screenshot targeted normal Settings instead compact520x640window. Visualapprovalpending. Integrator adds capture(name,{windowId}) with current owned/on-screen/layer0 positiveID validation; LJ mustrequest actualnewcompactwindowID before visualrerun. Existing singlestage default retained. No qualification/visualcompletionclaimed.

L1 adapter checkpoint: integrator independently read commands.ts, invariant, full0140 draft and savedApp/control adapters. Applied only inspected adapters in isolatedL1 worktree; invariant3tests pass. Typecheck fails package declarations due ignored workspace links, lane repairing. Native review requires Toggle rather than Show, exact accelerator equality for doublepress, safe focus eligibility and event key-up accounting before build. L4 dispatched from contracts-v1 then FF integration38026026, full F4/F14 brief and roster delivered; ownership0148–0153. Source capacity root/L1/LJ/L4; dedicatedbuilder/reviewer idle until stable candidate slot rotation.

Contracts-v4 checkpoint: PageTarget carries native anchor/windowKind/split metadata through catalog reconciliation; shifted split chords accept their produced characters and every alias disappears after remapping. Two capture regressions prove explicit compact-window selection and refusal of invalid/foreign/layered IDs. Rebuild/typecheck, five focused tests, generated bindings (194/26,386a28167923), bridge, lint and format pass; full journey coverage remains open. Builder staged 103 assets, digest435c631f4a2816ba3d052f4521e86bf0ec957ad945d96c9f2b110491520c7c32, independently verified; bundle budgets470/179/1682 pass. Native build and visual closure are pending. LJ frozen dfe9a31489a0c8c677d64ee502f3d916ef1b60f1 awaits independent review and twelve-journey builder batch; Reader remains blocked by L1 native shortcut repair. No new feature qualification is claimed.

Wave 1 independent review: root applied App/control cleanup and remaining Sidebar/Toolbar command dispatch in isolated L1; typecheck and 3 invariant tests pass, lint has381 warnings/0 errors. Native0140 apply-check passes against current stable source;0141 must roll back all global registrations on partial failure and validate persisted chords before builder approval. Root applied L4 windowKind adapter in its isolated worktree, fixed normal-only Quick Ask expansion consumption and explicit fixture identities; typecheck plus35 bridge/onboarding/memory-saver tests pass. Native adapter mirror application approved after source review; stable application awaits frozen patches and L1 baseline order. Builder requested exact frozen LJ dfe9a314 batch of12 IDs, excluding Reader pending L1 native repair. Root reviewed every correction diff and new disposable backup/inbound ports; full source unit transcript383/2037 passes, registry24 missing targets remains failed. No feature merge or qualification.

Contracts-v4 full unit rerun passes384 files/2040 tests, exit0 at /tmp/aux-contracts-v4-unit.log. Frozen LJ dfe9a314 incremental build passes23 steps/1m19.34s; candidate scratch pin matches committed c2342cba909a34d9556560fd76c4eb256168b9183b5075b28fb7e3fa2914493c. Builder reports matching clean product631f3a44afd2f9b241300c9f7d25f23947c3ab51/tree3ab7a8c995139d0a01b628eda5dcc410a2237038 and native386a28167923; independent manifest audit awaits batch outputs. Twelve diagnostics running, qualifiedFeatures empty.

LJ dfe9a314 batch completed2 passes/10 failures. Integrator independently audited all12 manifest identity/digests and all4 image bytes/hashes; QuickAsk and link-peek pass the schema2 validator against frozen module bytes. Corrected QuickAsk target inspected directly; reviewer4831efc0 (integratedda656de6) narrowly closes wrong-target defect and sees no new P0–P2 in supplied default QuickAsk/Peek states. Full F21 matrix and DR001–004 remain open. LJ resumed source corrections from exact audit release/test-artifacts/lj-dfe9a314-audit.json; builder idle after verified cleanup.
Next shared checkpoint: L4 contextual IDs/showTabWindow request and authoritative windowKind native+shell pairing remain unlanded in integration. Root applied typed feature invocation/result adapter and spaceId payload in both isolated lanes; L1 enum bridge/fixtures/App adapter applied and typecheck passes, precise persistence-file format gate passes. L1 dispatcher already uses authoritative bridge.windowKind. Native0140/0141 shared reserved-chord helper and atomic global rollback independently reviewed; sequential apply-check passes in disposable mirror, stable untouched. Source candidate must include matching enum native bootstrap before builder request. L4 App/Little/filtered Downloads adapter applied isolated only; central commands dependency and narrow tray/geometry evidence remain.
