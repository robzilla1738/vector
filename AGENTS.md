## Parallel continuation: operation handling and installer join verified (2026-10-04)

Root isolated NEXT e5ae13652 adds shared operation construction for Memory, backup, diagnostics and recovery, retaining each caller's exact consent, admission, ACK/error, cleanup and stale-completion behavior. Root verifies actual before/result hashes, exact replay, original callback AST bodies, mounted controls, shell types and scoped lint; trust independently reviews the source. The retained outer writer receipt now joins both installer and standard CLI parent: root verifies original-owner refusal before mutation and before installation, exact inherited receipt preservation, actual temporary-slot controls and focused types/lint. Live native-slot source and host bindings remain unchanged. These source changes remain isolated; following0cb398df is the current passing product cohort.

The prior Models-plus-command-row experiment saved only162 bytes and added a component layer; both production changes are restored and the negative evidence is retained. Accepted Memory cohort remains last measured1846274 total JS against1843200, over3074; operation construction has not yet been measured. No budget waiver or following adoption. Sidebar/Selection registration, actual Settings late publication fencing and PageRecovery retirement remain in NEXT. Design continues actual supplied06 stable-surface polish, including a frozen image-details minimum hit target correction; final native visual evidence remains open.

Native326 remains under original sole builder owner66100 running the cached full18 graph. Known actual compiler causes are batched source-only in reviewed canonical0357 (repeating owned dictionary const-reference),0358 (supported capturing test callback factory) and0359 (four explicit raw-pointer fixture declarations). Original captures, assertions, actions, deadlines and524 required cases remain unchanged. Root verifies original API/raw/source pins, complete mirrors and ordered append-only reservations; current326 is not modified. Immutable327bfac source uses unchanged passingC1 assets; the builder prepares a coherent source successor with all corrections and verified installer join before any new execution admission. Actual compilation, matching runtime/helper, safety assertions and App journeys remain pending.

Four useful lanes continue with distinct ownership: root integration, one native builder/runner, supplied06 design implementation, independent source review and test preparation. Derive every applicable design element from actual81 Chromium152 UI files and captured WebUI/native-resolved-web tokens/fonts/materials in docs/design/upstream-source-map.md, retaining Aux name/logo. Every native/legacy/Stock qualification, at least20 real AC performance trials, F21 full state/contact-sheet/noP0–P2/final owner signoff, required merge order,WaveQ/all-on/final gates/local-main remains mandatory. Nothing pushed, signed or released. Evidence: docs/source-audits/parallel-integration-031/. Earlier entries are historical.


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
