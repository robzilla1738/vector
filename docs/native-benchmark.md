# Native performance comparison

Run `pnpm perf` only at phase ends, after the Aux and stock native apps are built.
The schema-7 runner and matching window/presentation instrumentation are
implemented. Aux area 0037 and stock area 0051 are applied in their preserved
source trees; matching compilation and a complete comparison remain pending.

The comparison takes five paired runs and reports medians for cold launch,
actual first presentation, launch to usable content, navigation input,
presented tab switch, command-bar results, process-tree physical footprint,
original Aux shell and packaged runtime physical footprints,
app bytes and bundled Node bytes. After the one-window/ten-tab memory snapshot,
the same process creates a warm window with Cmd-N. The runner retains original
and additional native window identities, first presentation, live address and
shortcut readiness, and an ordinary input/navigation proof, then closes only
the additional window. Each measured process also records 20 tab switches
and 20 single-character omnibox queries, producing 100 samples per browser for p50/p95/max.
After each fresh-process sample it relaunches the same disposable Profile and records
the warm first frame. These observations remain separate from the prepared fresh-process
samples and are warm-process-relaunch diagnostics, not evidence for the 120 ms
warm-new-window target. Available runtime boot marks are retained as diagnostics; missing marks do not
prove a runtime-startup target. Both source trees must have the same Chromium
VERSION and the same critical resolved fast-build flags, with the Aux shell
excluded from stock. Stock retains the same timing histograms and presentation triggers,
including matching warm-window and display-interval instrumentation. Aux area 0100 adds only its original shell-process witness; it is not installed in stock, whose BrowserView supplies no shell WebContents. This difference is recorded in the report: the binaries are not byte-identical. The witness runs after the first presentation timestamp is captured and cannot improve Aux's reported timing.
Source changes do not require an artificial clean-checkout qualification.

Each timed run starts a new browser process with a clone of a prepared disposable
Profile. Setup and synthetic history preparation happen before timing and only
after the preceding browser has acknowledged exit. OS caches are not flushed.
The sample therefore measures a fresh process with a prepared Profile, rather
than first-use setup or an OS hard-cold launch. No saved user Profile is used.

Run with the Xcode developer directory used for the native builds, for example
`DEVELOPER_DIR=/Applications/Xcode-beta.app/Contents/Developer pnpm perf ...`. GN
resolves flags against each supplied source root. During Aux preparation, the
runner prints `AUX_PERF_SETUP_REQUIRED` with its disposable Profile, process ID
and fixture URL. In that window, choose Finish later and navigate to the fixture
using the native address bar. This happens before timing. The privileged Aux
shell remains hidden from CDP; only ordinary fixture tabs are inspected. Leave
the measured browser foreground and avoid other input until the run finishes.

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

Aux role measurements require the original shell renderer PID and kernel process
birth emitted by opted-in native instrumentation. A duplicated or retired shell
witness cannot be replaced by another renderer. The PID-scoped Swift collector
checks browser ancestry and birth around each kernel footprint observation; it
recognizes the runtime only when `proc_pidpath` matches the supplied app bundle's
actual `Contents/Helpers/Aux Runtime` path. Missing or ambiguous roles leave the
report incomplete. Stock role fields are not applicable, while its total uses
the same collector. Role targets are reported explicitly in MiB; the shared-page
caveat still applies to the total process-tree sum.

The report also writes an advisory `target-summary.md`. Its target status does
not change build or measurement exit semantics. Acceptance requires all five
valid paired samples, all 100 intended input observations and the exact original
process roles. Missing values remain unavailable; they are never zero or a
passing subset. Shell/runtime role limits use MiB, while total overhead and
stock-relative application size use decimal MB. Warm-window acceptance uses the
median of each window’s maximum first-frame/controls-ready time. Tab acceptance
uses all 100 original latency/display-interval pairs and p95 latency beyond that
input’s confirmed display interval. Missing or zero VSync intervals leave that
target unavailable; relaunch or absolute tab latency cannot substitute for it.
