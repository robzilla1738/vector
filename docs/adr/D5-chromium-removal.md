# ADR: Chromium / Electron removal (D5)

**Status:** gated, not scheduled.  
**Date:** 2026-09-18

Chromium fallback and the Electron hybrid stay in tree until every gate below is measured and recorded here.

| Gate | Required | Current |
|---|---|---|
| `capability_unsupported` on ≥ 500 real pages | < 1% | engine 0/514 opened live HTML bodies (`engineCapabilityUnsupportedRate` 0.0) in `corpus-500-latest.json`; live fetch 514/526 (12 bot-wall/timeout kept); fetch fail is not engine `capability_unsupported`; unsupported-rate gate met; Electron e2e still frozen so not a deletion license |
| Shared backend contract suite | green on both backends, 0 skips | Electron e2e frozen (D1) |
| Multi-page + storage-state + screenshot on native service | green | `service::tests::cookies_storage_contexts_and_events_are_real` |
| `vector-engine` adapter ≥ Chromium on verified success | ≥ 5 live-model trials | `held-out-latest.json` engine 15/15 = competitor 15/15 (`openai/gpt-5.6-luna-fast`); still not a deletion license — Electron e2e frozen (D1) |

Deletion is forbidden until this ADR is rewritten with the numbers.
