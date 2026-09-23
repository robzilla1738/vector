# Frame baseline

Evidence for H0-A1 / H1-A4 / H1-A5. Measured by `NativeBrowser` with product chrome enabled. Cache key is layout revision + viewport; document `record_scrolled` does not rebuild the list.

| Sample | from_layout calls | input→paint | notes |
|---|---|---|---|
| wheel scroll after first paint (chrome on) | 0 after first paint | compositor translate of cached list | `shell::tests::wheel_does_not_rebuild_the_display_list` |
| product chrome + page + IME + wheel | 0 after first paint | chrome list + translated page | `shell::tests::gui_chrome_typing_scroll_and_screenshot` |
| production observe (simple page) | n/a | see `docs/perf/production-observe-gate.json` | `security_mode: production` |
| §6 this-host software present | 0 after first paint | `docs/perf/section-6-this-host.json` | Apple M5 release at 1440×900 @2x; wheel p50 ≈ 0.86 ms; input p50 ≈ 20.20 ms after glyph face/advance caching; SQLite persist off the present path |

Command:

```
cargo test -p ve-api --lib wheel_does_not_rebuild_the_display_list
cargo test -p ve-api --lib gui_chrome_typing_scroll_and_screenshot
cargo test -p ve-api --lib writes_production_profile_observe_gate
cargo test -p ve-api --lib writes_section_6_human_timings
cargo test -p ve-api --lib writes_section_6_idle_command_rss_soak
cargo test -p ve-api --lib frame_tick_springs_rubber_band_and_ignores_inactive_tabs
```

Idle CPU, command-ack, peak RSS, and 1000-nav soak live in `docs/perf/section-6-this-host-budgets.json` (`appleSilicon: true`, 1440×900 @2x). Command acknowledgement p95 is ≈ 48.09 ms and the 1,000-navigation soak has 0% post-warmup growth; peak RSS is 535.19 MB and remains above the 400 MB target. The GUI uses `ControlFlow::Wait` unless `needs_frame()` is true (rubber-band / momentum on the visible tab). `MacWindow::preferred_frame_rate_range` is 80–120 Hz while interacting.

`NativeBrowser::from_layout_calls()` is the gate: scroll-only replay stays at 0 after the opening paint. Screenshot: `docs/ui/screenshots/ve-shell-gui.png`.
Software present reuses one `SoftwareRenderer` (system fonts loaded once). Hinting uses CSS size ≤ 18 px, including Retina 2x physical sizes.
Wheel present copies a cached chrome raster and blits the visible region of a document-space page layer (`wheel_reuses_cached_chrome_base`). Profile writes run on tab/session mutations, not on every frame.
