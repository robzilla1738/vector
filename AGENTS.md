## Integrated continuation: navigation and Settings source batch verified (2026-10-04)

Following0cb398df integrates registered Chats/Tasks/Library/More/Space menu navigation and Agent rail actions, autocomplete Retry and source-backed18px glyph, and shared Search/Autofill/Quick Ask/Default Browser Settings ownership/recovery. Root independently verifies all26 changed product/test leaves against clean root7fd681bb, equal filtered product tree08b1f6e, complete immutable unit suite and required build/types/lint/format/bindings/bridge/inventory/journey/budget gates. Following own workspace rebuild/types/lint/format pass; all175 own native154 renderer files exactly match root’s verified build. Strict499454/179427/1843147 bytes pass unchanged limits. The original Retry fixture failure was corrected with actual mounted visible geometry and proof of a second native request; every original recovery assertion stays intact.

Native325 remains stopped on generated drift, with historical overwrite bytes and unidentified writer retained. The source writer now refuses quarantine, symlink and replaced original owner identities. Sole builder prepares native326 from the integrated batch plus coherent3-leaf compiler correction reserved0356 and original-owned generated-file seal/cleanup; source/stage admission remains pending. No App is admitted. Independent NEXT Sidebar Section/Space and Selection Capture command work continues; actual Settings parent late publication is a concrete remaining source issue under implementation.

Supplied06 source/capture/tokens/fonts/materials continue to govern all applicable design with Aux branding preserved. Actual native full18/runtime/helper/524 assertions/App journeys, Stock11, every20-trial performance budget, full F21/contact sheets/noP0–P2/final owner signoff, required merge order, WaveQ/all-on/final gates/local-main remain mandatory. No requirement waived; nothing pushed, signed or released. Evidence: docs/source-audits/parallel-integration-030/ROOT-CURRENT-COHORT-GATES-001.json. Earlier entries are historical.

## Parallel continuation: native325 stopped; next coherent renderer batch (2026-10-04)

Native325 stopped through its original watcher after three generated files changed to exact historical source bytes. The original graph failed; no matching pair or App is admitted. Root independently verified retained terminal/raw hashes and original process/slot retirement. The actual writer is unidentified. Three genuine compiler corrections are reviewed as one source-only batch, preserving every safety assertion. The sole builder prepares the next cached native326 with original generated-file seals and cleanup ownership; caches are preserved.

The current isolated renderer batch delivers registered Chats, Tasks, Library, More/Space menu navigation and Agent rail actions, source-backed autocomplete Retry/18px glyph, and consistent Search/Autofill/Quick Ask/Default Browser Settings ownership and recovery. Root rebuilt the local workspace and measured exact native154 bytes499454 startup JS/179427 CSS/1843147 total JS, passing unchanged501760/184320/1843200 limits. Final immutable source gates remain in progress. The dependency-join failure and corrected synthetic catalog mock are retained. Section/Space chooser and Selection Capture Settings command work continue separately.

All four useful slots remain occupied: root integration, sole native builder, design implementation, and trust review/writer guard. Every applicable design continues through supplied06 upstream Chromium source, captured WebUI, native/resolved/web tokens, fonts and material recipes with Aux name/logo retained. Full native/legacy/Stock qualification, every20-trial performance budget, complete F21/noP0–P2/final owner signoff, required merge order, WaveQ/all-on/final gates/local-main remain mandatory. Nothing pushed, signed or released. Earlier running entries are historical. Evidence: docs/source-audits/parallel-integration-030/ROOT-NATIVE325-STOP-NEXT-RENDERER-001.json.

# Aux / vector workspace

## Test + build gotcha (important)

Unit tests import `@aux/runtime` via the package `exports` map, which points at
`apps/runtime/dist/` — **compiled output**, not source. After editing
`apps/runtime/src/**`, always rebuild before running tests or the tests will
exercise stale code:

```bash
npx tsc -b            # rebuild workspace dist (fast, incremental)
npm test              # vitest run --project unit  (reads dist/)
npm run typecheck     # tsc -b && tsc -p apps/shell/tsconfig.json
```

Renderer (`apps/shell/src/**`) tests resolve `@aux/contracts` to *source* via
the vitest alias, so shell edits don't need a build first.

## Checks

```bash
npm run lint          # oxlint apps packages tests scripts --max-warnings=390
npm run format:check  # prettier ratchet — only files listed in config are checked
```

The prettier gate is a *ratchet*: only migrated files are enforced. Do not run
`prettier --write` on broad directories — it reformats files outside the
ratchet list and creates massive churn.
