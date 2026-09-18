# Frame baseline

Evidence for H0-A1 / H1-A4. Measured by `NativeBrowser` unit tests and `paint_page_id` / `DisplayListCache` (`engine/crates/ve-api/src/shell.rs`).

| Sample | from_layout calls | input→paint | notes |
|---|---|---|---|
| wheel scroll after first paint | 0 | compositor translate of cached list | `shell::tests::wheel_does_not_rebuild_the_display_list` |
| product chrome + page | 1 on first paint | chrome list + translated page | `shell::tests::product_chrome_paints_sidebar_stage_and_rail` |
| production observe (simple page) | n/a | p50 53 µs / p95 101 µs, n=8 | `docs/perf/production-observe-gate.json` |

Command:

```
cargo test -p ve-api --lib wheel_does_not_rebuild_the_display_list
cargo test -p ve-api --lib writes_production_profile_observe_gate
```

`NativeBrowser::from_layout_calls()` is the gate: scroll-only replay stays at 0 after the opening paint.
