# Loaded-session reentrant submission guard

Successor to `aux-loaded-session-participant`; the historical proposal and its successful compile receipt remain unchanged. Root found that an actual reset delegate can run a nested UI loop: a previously posted write callback can reduce pending writes to zero before the outer loop submits the next loaded profile. The previous `Advance` could close managers and move the result prematurely.

The two changed production files now use `SessionWriterSubmissionWindow` around both final-write and manager-close inventory loops. Actual `Advance` requires submission to be finished **and** the respective pending count to be zero. Reentrant callbacks still record real results, but cannot transition the phase or finish the participant while the outer loop uses its observations. The outer loop always posts advancement after ending submission. No change to open-path persistence, layouts, callbacks, startup admission or ordinary shutdown.

Validation performed:

- Twelve checks execute the actual production submission-window class for an early zero callback before a later profile is submitted, both write and close phases, later pending work and empty inventories. Source checks bind that exact class to both production loops/transitions. This is not an executed real profile/delegate callback test.
- The one changed scheduler translation unit compiled successfully with existing pinned AuxFast GN flags and the complete successor include overlay; no linking or browser execution. `evidence.json` authenticates the command, input and object evidence.
- Dry composition replay against `out/native-reuse-composition-aux-loaded-session-participant` manifest `76aa49a819db0e3adce2fc04ca4e508e1cee13b14007d320bda9ea543e8f9977` preserved all 779 source records and 23 binary assets, changing exactly two source hashes. `composition-review.json` is historical evidence for that output location; replay produces a location-dependent manifest hash.

Reproduce lean checks with `python3 verify.py` and `sh check.sh` in this directory. Integrator prepares the unapplied successor with:

```sh
python3 docs/integration/proposed/aux-loaded-session-submission-guard/prepare-composition.py --artifact-root /Users/rcourson/Documents/Vibe/web --output /absolute/fresh/output
```

Only if recompilation is needed, serialize `compile-check.py --output /absolute/fresh/output` through `scripts/native-build.py`. This compile-only script touches no Chromium checkout sources.

Remaining limits are unchanged: no full-browser application/link, real loaded-profile callback run, fsync, profile-creation exclusion, renderer/extension/independent-process exclusion, authority/provenance grant or full-profile writer custody. The native participant is not activated here. No owner state, Security, OS effects, signing, UI or packaged app was accessed/changed.
