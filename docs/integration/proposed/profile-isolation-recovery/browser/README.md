# Native browser shutdown observations and isolated build preparation

Inactive source, preserving the UI and accepted app. No signing or runtime use.

The actual Chrome shutdown caller now records six ordered native lifecycle
observations: shutdown entry, profile teardown returned, PostDestroyThreads
entry, BrowserProcess destruction returned, ShutdownPostThreadsStop returned,
and Chrome extra parts destroyed. Selected-home state binds ordering to the
current process and initial shutdown thread, retains the admitted generation,
and records an uncertainty on skipped/repeated/out-of-thread callbacks.

Beginning shutdown refuses new selected-home/authority/startup admissions.
Already-running authority calls retain their own accounting and existing
publication semantics. The retained service, browser roots and descendant
custody are not released by a lifecycle callback. Inspection exposes active
reads and monitor state; `whole_writer_drain_proven` is always false. The six
hooks are facts, not a clean-resume certificate or authorization to clear durable
markers. No UI, profile deletion or migration behavior was changed.

The selected-home and actual browser-main translation units passed against the
paired overlay. Their exact inputs, commands and objects are recorded in
`evidence/shutdown-compile.json`. Existing cold feature remains off.

There is no proved whole-browser drain callback yet: Chrome still performs
Local State/metrics writes, profile deletion and potential relaunch during its
late shutdown stages, and content/network/service lifetimes remain outside the
observed Chrome sequence. Recovery of admitted roots remains blocked.

## Full browser build path

`snapshot.py` prepares a separate APFS clone-only source and AuxFast build tree,
excluding unrelated build outputs and assistant metadata. It never falls back
to ordinary byte copies and does not mutate the owner checkout. This is a
per-file clone over time, not an atomic filesystem snapshot. The source/input
association must be checked before applying the review overlay.

`prepare-build.py` requires successful snapshot and compilation receipts,
checks clone/current source equality for every projected file, applies only
those verified source changes, then regenerates GN and runs Ninja dry-run.
Regeneration is necessary because the cache admission method changes a virtual
interface: manually replacing checked objects in the warm link would miss ABI
rebuild dependencies. Full execution remains separate from this preparation;
inspect any macOS code-sign action before scheduling the unsigned build.

Snapshot currently being prepared at
`/private/tmp/aux-chromium-recovery-snapshot-20261023`.
No successful full-browser build or real-app comparison is claimed.
