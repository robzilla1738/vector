# ADR: Chromium / Electron removal (D5)

**Status:** gated, not scheduled.  
**Date:** 2026-09-18

Chromium fallback and the Electron hybrid stay in tree until every gate below is measured and recorded here.

| Gate | Required | Current |
|---|---|---|
| `capability_unsupported` on ≥ 500 real pages | < 1% | not measured |
| Shared backend contract suite | green on both backends, 0 skips | Electron e2e frozen (D1) |
| Multi-page + storage-state + screenshot on native service | green | `pages.list` / `pages.screenshot` landed; cookies throw |
| `vector-engine` adapter ≥ Chromium on verified success | ≥ 5 live-model trials | held-out mock retired |

Deletion is forbidden until this ADR is rewritten with the numbers.
