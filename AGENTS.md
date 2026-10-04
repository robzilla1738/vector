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
