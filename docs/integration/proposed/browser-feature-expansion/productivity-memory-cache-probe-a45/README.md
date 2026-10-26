# Safe lookup for the ordinary fixed-memory cache-probe predicate

This supersedes A44's guard while preserving its historical files and generated outputs. Both new leaves are projected directly from the unchanged exact A38 inputs (index `6585ab56…`, entry `9827a783…`). There is still only one counted probe-condition anchor per leaf.

Only the native binding lookup and descriptor predicate are inside `try/catch`. An absent binding, supervised mode, missing/accessor/mutable capability or lookup failure returns false and runs the unchanged original cached-executable probe. Only immutable ordinary mode plus the immutable fixed-memory factory skips that unused cache probe. This grants no execution authority; ordinary general exec remains refused and the actual native factory still enforces all its own checks.

`predicate.mjs` is the exact function body inserted inline into the generated source condition. It is not a new runtime dependency or standalone product module. Four bounded isolated predicate cases passed: absent binding, supervised true, verified immutable ordinary factory, and mutable fake factory. The fixture invokes no factory, native binding, daemon, app, credentials or OS API. No product source was evaluated.

Forward/reverse exact replay passed. Both generated leaves passed `node --check`. Root owns sealed source pairing, packaging, signing and actual memory indexing/search/close acceptance. No UI/native behavior or general launch gate was changed.
