# Native startup and tab-switch benchmark

This B12 runner compares Aux.app with **stock Chromium at the exact tag beneath Aux's patch series**. It reads Chromium's own `Startup.BrowserWindow.FirstPaint` and `Browser.Tabs.TotalSwitchDuration3` UMA histograms through CDP. The latter is defined upstream as input event to presented frame, in milliseconds. Every recorded trial must add exactly one histogram observation; missing or overlapping observations fail the run. The report retains all raw samples and uses `tests/benchmarks/statistics.mjs` for p50, p95 and deterministic 95% bootstrap intervals.

Prepare two **optimized static benchmark builds** from clean source worktrees at the same Chromium tag. The Aux source must descend from the stock tagged commit. Keep `is_debug=false`, `is_component_build=false`, `target_cpu` and `is_official_build` equal. Build Aux with `enable_aux_shell=true` and the existing `aux_allow_remote_debugging_for_tests=true` GN flag. Leave the stock build without the Aux shell. The runner checks both adjacent `args.gn` files, source revisions, tag ancestry, bundle metadata and executable SHA-256 digests. The Aux release build keeps the test flag false; `scripts/chromium-sign.mjs` rejects it when true.

```sh
pnpm bench:native --plan
pnpm bench:native --aux-app /absolute/AuxBench/Aux.app \
  --stock-app /absolute/StockBench/Chromium.app \
  --aux-source /absolute/patched/chromium/src \
  --stock-source /absolute/tagged/chromium/src \
  --trials 20
```

Run on AC power with a fixed display refresh rate and no other active browser workload. The runner verifies AC power. It uses a fresh disposable Profile on every startup trial, opts that Aux Profile into test debugging through its `Local State`, and alternates Aux and stock launch order. It then opens two solid-color loopback fixture tabs in each browser, performs four warm-up Control-Tab switches and records at least 20 single-event presentation samples per host. Its native input helper targets only the PID launched by the runner. Profiles are deleted after each process; the test debugging port is never enabled on a personal Profile. The report goes to a new ignored `release/test-artifacts/native-bench-*/manifest.json`, or to a new `--output` directory.

**Limits:** Chromium FirstPaint is not Aux's interactive-shell-ready time. A fresh Profile and process do not clear the OS file cache, so these samples are not physically cold starts. The runner does not independently verify display refresh rate or thermal state. Tab-switch samples use each browser's aggregate histogram; the report records host order, source/build hashes and raw data, but an unrelated tab switch during a run causes that trial to fail. Keep this benchmark as a local instrument until both real binaries complete the run and a reviewed result row is added to [BENCHMARKS.md](BENCHMARKS.md). No speed claim follows from the script alone.
