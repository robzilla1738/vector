# Aux Chromium tree

This is the complete Aux delta on Chromium 155.0.8059.85 (commit `0e66b94549a8bd85f03fbdf189b752d6e7b63c32`), exported from the durable checkout. It replaces the old `chromium/patches/` series, which never reconstructed the tree and is now only in Git history.

- `aux.patch`: every tracked change (`git diff HEAD --binary --full-index`, excluding `out/`), deletions included.
- `added.tar.gz`: untracked additions (new Aux sources, GN files, resources, symlinks), with normalized owner and mtime.
- `manifest.json`: SHA-256 of every changed path, plus the deleted paths.
- `base.json`: base commit and counts.

```sh
python3 scripts/chromium-tree.py export <src> chromium/tree   # after a native batch
python3 scripts/chromium-tree.py verify <src> chromium/tree   # replay in a temporary index; adds loose objects only
python3 scripts/chromium-tree.py apply  <clean-src> chromium/tree
python3 scripts/chromium-tree.py export <rebased-src> chromium/tree --new-base   # after scripts/chromium-rebase.py
```

`verify` replays the patch onto the base commit in a temporary Git index and checks every blob and archive entry against the manifest, so it never touches the checkout's index or working files. It does add loose blob objects to the checkout's `.git`. Re-export after every native change so this folder always matches the tree the current candidate was built from.

## Recording the tree in receipts

There is no shared native receipt writer: each lane's prepare script or the integrator writes its own receipt. The convention is:

- `export` prints `manifestSha256`, the SHA-256 of `manifest.json`. Every native build receipt records it as `chromiumTreeManifestSha256`, next to the build output it describes.
- When a reseal ships a new Framework, the integrator sets the same value as `chromiumTreeManifestSha256` in `docs/integration/proposed/completion-20261026/integrator/current-source-selection.json`, in the same commit as the re-export.
- `python3 scripts/verify-candidate.py` fails with `chromiumTree: stale` when this folder's `manifest.json` no longer matches that pin, so a native change without a re-export (or an export without a reseal) is caught.

Receipts written before 2026-10-28 do not carry the field; the selection pin `f3ca7cf6…` is the tree of seal `b606bf7c`.
