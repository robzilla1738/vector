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
