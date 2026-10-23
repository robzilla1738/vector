# Session snapshot header registration

This dry successor registers the reviewed workspace snapshot header in the existing Aux browser source list, and the header-only session write result in the existing sessions shared source list. The sessions component already publicly depends on that shared target. No new dependency, visibility, runtime behavior or UI change is introduced.

`prepare.py` verifies the exact root session-write composition, reads and authenticates all776 current shared inputs, replays its parent patch into a temporary directory, and performs two count-one GN edits. The existing extender independently replays the cumulative result. The result contains777 source records and the same23 binary assets; the Chromium checkout remains unchanged. Earlier actual four-TU compilation belongs to `aux-session-write-completion`, not to this GN bookkeeping step.

The additional read-only component-boundary review found the new methods covered by existing `SESSIONS_EXPORT` class annotations. The result types are header-only values, and symbols in the four existing compiled objects match across the callback chain. This is not a linked browser or runtime acceptance claim.

```sh
python3 docs/integration/proposed/aux-session-write-gn/prepare.py \
  --output /absolute/fresh/composition
```

Actual root output: `out/native-reuse-composition-aux-session-write-gn`; manifest SHA256 `eac2e5cba8b41fe82611378892a55cd424ffe4a7b19c1031beea30a3ce59c806`. No source application, GN generation, browser linking, signing or app activation ran. Genuine whole-writer custody remains required; this cannot authorize state2 startup.
