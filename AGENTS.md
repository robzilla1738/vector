## Parallel continuation: chat ownership and source-backed control states verified (2026-10-04)

Root isolated NEXT3274bcc24 integrates permanent retirement after an observed foreign Conversation window/private/kind/connection mismatch, with old callbacks refusing without retiring a newer committed owner. Actual registered disclosure and held history/context checks pass, retaining drafts, original diagnostics and no stale toasts. Source-backed image-details minimum32px hit geometry and disabled popover hover exclusion are integrated with actual original interaction controls, shell types, lint, exact source/reference pins and replay. Every Aux name/logo/material/geometry remains intact; these source results do not replace native visual qualification.

Home Search/Ask and Open full conversation have concrete remaining direct callback gaps. Root reserves three normal-window scoped remappable definitions; trust implements exact original mode/draft/Tab/focus and retained-conversation behavior in separate owned source. Design tackles measured live duplicate error-message formatting mechanically, excluding those Home-owned leaves and preserving every caller's original exception, owner and notification policy. One coherent renderer rebuild/measurement follows these batches. Last accepted Memory measurement remains1846274 totalJS against1843200, over3074; no waiver or following adoption. Rejected Models/registry/catalog experiments remain restored with negative evidence. Following0cb398df remains the current passing product.

Native329408e8834 is independently accepted source-only: complete733 native hashes,329 ordered packets with exact327 prefix and reviewed0358/0359 corrections,174 unchanged passing capture assets/helper,1843 retained compiled workspace byte/mode pins,286 dependency identities/75 owned workspace joins and11 original raw child retirements. Root derives all three honest generated previews from actual templates with the new identity and empty qualification. Actual326→329 five-leaf transition replays exactly; all12 original new-case source declarations retain order and71 cases, total524 unchanged. Compiler/runtime/App qualification is not inferred. Current326 continues under original sole owner66100; successor stage/GN/build require its genuine terminal, cleanup/mode restoration, fresh compiled receipt and root-reviewed final controller repins.

Four useful lanes continue: root integration, sole native builder/runner, supplied06 design implementation, independent feature/source review and test preparation. Use all applicable actual81 Chromium152 UI files plus captured WebUI/native-resolved-web tokens/fonts/materials mapped in docs/design/upstream-source-map.md, retaining Aux branding. Every native/legacy/Stock qualification, at least20 real AC performance trials, full F21 state/contact-sheet/noP0–P2/final owner signoff, merge order,WaveQ/all-on/final gates/local-main remains mandatory. Nothing pushed, signed or released. Evidence: docs/source-audits/parallel-integration-031/. Earlier entries are historical.


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
