# Protected recall retrieval benchmark

Build the runtime, then run:

```sh
pnpm typecheck
node tests/benchmarks/content-memory-retrieval.mjs --check-baseline --out /tmp/aux-retrieval.json
```

The fixture contains manually written, held-out questions in English, Spanish, Japanese, and French. It adds deterministic unrelated articles to reach the current 500-article Space limit. The report includes recall at 1/3/5, reciprocal rank, empty-result accuracy for unrelated questions, cold and warm latency, CPU time, encrypted bytes, SQLite pages, and restart-tested Forget. The optional gate requires at least 90% lexical recall at 3, no matches for the unrelated questions, and successful Forget.

These are synthetic pages and questions. Paraphrase misses are reported separately from the lexical gate; a local lexical index cannot establish real-site semantic quality. RSS includes the Node runtime and loaded modules. Energy is recorded as unavailable because this harness has no portable per-process meter. The existing `content-memory.mjs` probes article-size capacity; neither probe measures 20,000 documents, since the current product limit is 500 per Space.
