# Unapplied native composition extension

`--staged-base` extends a pinned composition whose outputs have **not** been applied to its `sourceRoot`. It never writes there. The existing default mode continues to require the base outputs already present in `sourceRoot`.

This lane predates the root tool. `fix.patch` is the exact incremental change against the root tool hash in `manifest.json`; integrate that patch rather than accepting an add/add replacement without checking the baseline. `scripts/test_extend_provided_native.py` is a new independent test file.

From the root workspace, after integrating the tool delta:

```sh
python3 scripts/extend-provided-native.py out/native-reuse-composition-v18 \
  --staged-base \
  --patch <pinned-vibrancy-proposal.patch> \
  --metadata <pinned-vibrancy-manifest.json> \
  --output out/native-reuse-composition-v19

python3 scripts/extend-provided-native.py out/native-reuse-composition-v19 \
  --staged-base \
  --patch <pinned-horizontal-tabs-proposal.patch> \
  --metadata <pinned-horizontal-tabs-manifest.json> \
  --output out/native-reuse-composition-v20
```

Each follow-up manifest's `files` must exactly cover its patch paths. Its `baselineSha256` (or `sourceSha256`) pins the **replayed parent output**, including overlapping files and files the parent created. A newly introduced file uses a `/dev/null` patch and null baseline; no fresh-composer changes are needed. The output directory must be new and outside the native checkout.

Before composing, staged mode checks every actual `sourceRoot` file against the parent's `sourceSha256` (including absence for null), verifies the parent's combined-patch hash and replays that patch in a temporary directory. Every parent output is verified before checking and applying the follow-up. The emitted cumulative unified diff maps the actual shared inputs directly to final outputs; a separate temporary replay verifies every output. The manifest retains actual input hashes, parent manifest hash/history and the parent's binary-asset baseline. Artwork is not copied into or modified in the native checkout.

The default applied mode still checks actual source against parent output hashes and artwork against replacement hashes, then records those applied inputs as the next baseline. Its cumulative source diff therefore includes only changes from those actual applied inputs.

## Evidence and limits

`python3 scripts/test_extend_provided_native.py` passes three filesystem fixtures, covering overlap, parent-created files, new/empty files, missing EOF newline, chained staging, source/patch/parent-output/follow-up/artwork drift rejection, and default applied mode. Each successful fixture asserts the actual input tree remains unchanged; cumulative output is independently replayed. Git application runs in isolated temporary roots with inherited Git overrides removed. No native checkout invocation, shared source write, native build, owner process or network access was performed. Source-file deletion remains unsupported, as in the prior output contract.
