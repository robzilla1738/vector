# Frame baseline

Evidence for H0-A1 / H1-A4. Recorded with `ve-shell --trace-frames` and `perf frames`.

| Sample | from_layout calls | input→paint p95 | notes |
|---|---|---|---|
| wheel scroll (cached display list) | 0 after first paint | compositor translate | H0-A8 |
| click / key on simple page | 1 (damage) | target ≤ 16 ms | H0-A7 `dispatch_human` |
| replay fixture | see JSON next to this file | `FrameTrace` | `--replay-input` |

Command:

```
cargo run -p ve-shell -- --replay-input fixtures/input/scroll.json --trace-frames docs/perf/frame-trace.json
cargo run -p perf -- frames --input fixtures/input/scroll.json --out docs/perf/frame-trace.json
```

`NativeBrowser::from_layout_calls()` is the gate: scroll-only replay must stay at 0 after the opening paint.
