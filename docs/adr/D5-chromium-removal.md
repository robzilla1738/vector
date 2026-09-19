# ADR: Chromium / Electron removal (D5)

**Status:** gated, not scheduled.  
**Date:** 2026-09-18

Chromium fallback and the Electron hybrid stay in tree until every gate below is measured and recorded here.

| Gate | Required | Current |
|---|---|---|
| `capability_unsupported` on ≥ 500 real pages | < 1% | engine 0/60 opened live HTML bodies; live fetch 488/500 (12 bot-wall/timeout, 2.4%) in `corpus-500-latest.json` — fetch fail is not engine `capability_unsupported`; n=60 opened, not 500; gate unmet; not a deletion license |
| Shared backend contract suite | green on both backends, 0 skips | Electron e2e frozen (D1) |
| Multi-page + storage-state + screenshot on native service | green | `service::tests::cookies_storage_contexts_and_events_are_real` |
| `vector-engine` adapter ≥ Chromium on verified success | ≥ 5 live-model trials | `held-out-latest.json` engine 15/15 = competitor 15/15 (`openai/gpt-5.6-luna-fast`); still not a deletion license while the unsupported-rate gate is unmet |

Deletion is forbidden until this ADR is rewritten with the numbers.
