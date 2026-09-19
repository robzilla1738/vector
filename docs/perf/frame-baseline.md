# Frame baseline

Evidence for H0-A1 / H1-A4 / H1-A5. Measured by `NativeBrowser` with product chrome enabled. Cache key is layout revision + viewport; document `record_scrolled` does not rebuild the list.

| Sample | from_layout calls | input→paint | notes |
|---|---|---|---|
| wheel scroll after first paint (chrome on) | 0 after first paint | compositor translate of cached list | `shell::tests::wheel_does_not_rebuild_the_display_list` |
| product chrome + page + IME + wheel | 0 after first paint | chrome list + translated page | `shell::tests::gui_chrome_typing_scroll_and_screenshot` |
| production observe (simple page) | n/a | see `docs/perf/production-observe-gate.json` | `security_mode: production` |
| §6 this-host software present | 0 after first paint | `docs/perf/section-6-this-host.json` | x86_64 Linux release; not Apple silicon; IME/wheel/full-repaint p50 ≈ 64 ms (software chrome raster, glyph cache + opaque fills) |

Command:

```
cargo test -p ve-api --lib wheel_does_not_rebuild_the_display_list
cargo test -p ve-api --lib gui_chrome_typing_scroll_and_screenshot
cargo test -p ve-api --lib writes_production_profile_observe_gate
cargo test -p ve-api --lib writes_section_6_human_timings
```

`NativeBrowser::from_layout_calls()` is the gate: scroll-only replay stays at 0 after the opening paint. Screenshot: `docs/ui/screenshots/ve-shell-gui.png`.
Software present reuses one `SoftwareRenderer` (system fonts loaded once). Hinting uses CSS size ≤ 18 px, including Retina 2x physical sizes.
