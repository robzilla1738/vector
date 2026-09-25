# CI checkpoint — September 24, 2026

Implementation SHA: `31e7ef95db82abadd0268f42105c22e422efb9a2`. [Hosted run 36078947524](https://github.com/robzilla1738/vector/actions/runs/36078947524) failed all six required job families and the aggregate `CI passed` gate. This is an observed failing checkpoint, not a claim about subsequent documentation commits.

The unit jobs stopped at lint: **16 errors, 488 warnings, limit 390**. Other jobs stopped at root typechecking because the new material test directly imports jsdom without declarations. Downstream integration, e2e, release-smoke and design behavior cannot be inferred from jobs that never passed prerequisites. The six focused material/bootstrap tests passed locally, which did not exercise root typechecking or full lint.

## Recorded blocking diagnostics

- `apps/desktop/main/runtime/internal-cdp.ts:226:43: Using a spread operator here creates a new array unnecessarily.`
- `apps/desktop/main/runtime/internal-cdp.ts:258:43: Using a spread operator here creates a new array unnecessarily.`
- `apps/desktop/renderer/src/components/CommandBar.tsx:180:91: Unnecessary escape character '/'`
- `apps/desktop/renderer/src/components/Conversation.tsx:29:10: Identifier 'hostOf' is imported but never used.`
- `apps/runtime/src/services/pages/session-restore.ts:40:31: Using a spread operator here creates a new array unnecessarily.`
- `apps/runtime/src/services/runs.ts:116:25: Using a spread operator here creates a new array unnecessarily.`
- `apps/runtime/src/services/saved-results.ts:84:7: Empty fallbacks in spreads are unnecessary`
- `tests/host/candidate-shell.mjs:4:8: Identifier 'assert' is imported but never used.`
- `tests/integration/chromium-host-channel.test.ts:28:13: Unexpected conditional expect`
- `tests/integration/chromium-host-channel.test.ts:29:13: Unexpected conditional expect`
- `tests/smoke/internal-cdp-desktop.mjs:4:31: Identifier 'existsSync' is imported but never used.`
- `tests/unit/calendar-connections.test.ts:38:31: Unsafe usage of optional chaining`
- `tests/unit/calendar-connections.test.ts:44:31: Unsafe usage of optional chaining`
- `tests/unit/host-socket.test.ts:43:9: Unexpected conditional expect`
- `tests/unit/saved-article-model-context.test.ts:6:43: Parameter 'input' is declared but never used. Unused parameters should start with a '_'.`
- `tests/unit/set-run-lifecycle.test.ts:736:109: Do not add then to an object.`
- `tests/unit/chromium-page-material.test.ts:2 — TS7016: missing declaration file for jsdom.`

## Repair and qualification

Fix the type declaration/environment issue and the lint errors; reduce warnings to the existing limit rather than raising it. Run `pnpm typecheck` and `pnpm lint`, then relevant focused tests. Let required hosted jobs run on the exact pushed SHA and inspect any remaining failures. Do not remove or make gates optional. The current handoff is cleanly documented, **not CI-green**.
