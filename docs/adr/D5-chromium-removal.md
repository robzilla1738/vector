# ADR: Chromium / Electron removal (D5)

**Status:** gated, not scheduled.  
**Date:** 2026-09-18

Chromium fallback and the Electron hybrid stay in tree until every gate below is measured and recorded here.

| Gate | Required | Current |
|---|---|---|
| `capability_unsupported` on ≥ 500 real pages | < 1% | offline corpus observe in `docs/engine/evidence/corpus-500-latest.json` (live fetch still skipped; not a deletion license) |
| Shared backend contract suite | green on both backends, 0 skips | Electron e2e frozen (D1) |
| Multi-page + storage-state + screenshot on native service | green | `service::tests::cookies_storage_contexts_and_events_are_real` |
| `vector-engine` adapter ≥ Chromium on verified success | ≥ 5 live-model trials | held-out harness exists; live rows skipped without API keys |

Deletion is forbidden until this ADR is rewritten with the numbers.
