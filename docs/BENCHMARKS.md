# Benchmarks

<!-- native-perf-summary:start -->

Aux v3 has no published native comparison yet. Source changes and unit checks do
not establish startup, presentation, interaction, memory, or bundle targets.

<!-- native-perf-summary:end -->

The phase-end `pnpm perf` comparison uses five paired prepared disposable Profile launches of
Aux and stock Chromium at the same pinned VERSION and critical `flags.fast.gn`
settings. It reports medians, retains every raw sample, and records power state
and the actual app paths. Setup and synthetic history preparation precede timed runs. Fresh processes
do not imply flushed OS file caches. Disposable Profiles enable the ordinary user-controlled debugging
listener; no test GN bypass or saved Profile is used.

The comparison covers cold launch, actual first frame, cold launch to usable UI,
navigation input latency, presented tab switch, presented command-bar results,
immediate same-Profile relaunch, p95 tab/command interactions across 100 native inputs per browser,
process-tree physical footprint, app bytes, and the bundled Node bytes.
Presentation requires native successful compositor feedback. An animation frame,
DOM readiness, open listener, or loaded host bridge cannot substitute for it.
Unavailable signals leave the report incomplete; they cannot produce a pass row.
Shell memory uses the original `chrome://aux` renderer's native PID/birth witness;
runtime memory uses the exact packaged helper's kernel executable path. Both are
full process physical footprints, with explicit 120 MiB and 90 MiB targets.
Stock has no Aux-only roles. The total remains a process-tree sum, so shared pages
may count more than once; per-process rows are sampled sequentially.

A completed phase-end report contributes one row in this format (latencies in ms,
total footprint and sizes in MB, Aux/stock pairs; shell/runtime columns are Aux-only MiB):

<!-- native-perf-table:start -->

| Date / build / power | Cold launch | First frame | Cold interactive | Navigation input | Tab switch | Command bar | Warm frame | Tab p95 | Command p95 | Footprint | Shell MiB | Runtime MiB | App / Node |   n | Raw report |
| -------------------- | ----------: | ----------: | ---------------: | ---------------: | ---------: | ----------: | ---------: | ------: | ----------: | --------: | --------: | ----------: | ---------: | --: | ---------- |

<!-- native-perf-table:end -->

<!-- native-perf-status:start -->

No measured row has been added. Initial runs stopped during setup before collecting
valid samples. The runner now resolves GN from the supplied checkout and prepares
Aux through native UI without accessing its privileged shell over CDP. A complete
paired measurement remains pending.
<!-- native-perf-status:end -->

See
[the measurement plan](ROADMAP.md) and
[native measurement instructions](native-benchmark.md).

[Historical measurements](archive/benchmarks-before-aux-v3.md) retain the old
numbers, partial paid comparisons, build identities, and limitations. They do
not demonstrate current v3 performance or impose the former qualification gates.
