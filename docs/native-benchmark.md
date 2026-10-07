# Native performance comparison

Run `pnpm perf` only at phase ends, after the Aux and stock native apps are built.
The current v3 instrumentation and harness are under implementation; no new
native performance result has been published.

The comparison takes five paired runs and reports medians for cold launch,
actual first presentation, launch to usable content, navigation input,
presented tab switch, command-bar results, process-tree physical footprint,
app bytes and bundled Node bytes. Both source trees must have the same Chromium
VERSION and the same critical resolved fast-build flags, with the Aux shell
excluded from stock. Stock receives the same benign measurement instrumentation.
Source changes do not require an artificial clean-checkout qualification.

Each timed run starts a new browser process with a clone of a prepared disposable
Profile. Setup and synthetic history preparation happen before timing and only
after the preceding browser has acknowledged exit. OS caches are not flushed.
The sample therefore measures a fresh process with a prepared Profile, rather
than first-use setup or an OS hard-cold launch. No saved user Profile is used.

The disposable Local State explicitly enables the ordinary user-controlled
remote-debugging listener and benchmark telemetry. The harness verifies that
its original browser PID actually owns the loopback listener before connecting;
it never treats an open port as browser readiness. Accessibility permission and
original foreground-process ownership are required for PID-scoped native input.
Missing permission leaves the run incomplete rather than granting permission or
substituting CDP input.

Cold-launch samples use the original macOS kernel process-birth Mach ticks,
including launch and dyld work before Chromium enters main. Presentation samples
require successful native compositor feedback. For Aux
command-bar results, the original committed DOM rows first cross Chromium's
visual-state submission barrier. For the served navigation fixture, the original
active document must load and produce meaningful content before that barrier and
presentation feedback. These are conservative native-confirmed presentation
bounds, not animation-frame estimates. Cold interactive includes the real input
probe and its overhead; input-to-presentation is reported separately.

Retain all five raw samples, actual source/app paths, resolved flags, power state
and limitations. An unavailable or duplicated histogram observation makes the
report incomplete. Add one concise row to [BENCHMARKS](BENCHMARKS.md) only after
every required measurement completes; do not infer a pass from compilation,
listeners, renderer readiness, or unit tests.

The previous qualification-oriented instructions and measured evidence remain
[historical](archive/benchmarks-before-aux-v3.md).
