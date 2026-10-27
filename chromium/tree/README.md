# Aux Chromium tree

This is the complete Aux delta on Chromium 155.0.8059.85 (commit `0e66b94549a8bd85f03fbdf189b752d6e7b63c32`), exported from the durable checkout. It replaces the old `chromium/patches/` series, which never reconstructed the tree and is now only in Git history.

- `aux.patch`: every tracked change (`git diff HEAD --binary --full-index`, excluding `out/`), deletions included.
- `added.tar.gz`: untracked additions (new Aux sources, GN files, resources, symlinks), with normalized owner and mtime.
- `manifest.json`: SHA-256 of every changed path, plus the deleted paths.
- `base.json`: base commit and counts.

```sh
python3 scripts/chromium-tree.py export <src> chromium/tree   # after a native batch
python3 scripts/chromium-tree.py verify <src> chromium/tree   # replay in a temporary index; no checkout change
python3 scripts/chromium-tree.py apply  <clean-src> chromium/tree
```

`verify` replays the patch onto the base commit in a temporary Git index and checks every blob and archive entry against the manifest, so it never touches the checkout's index or files. Re-export after every native change so this folder always matches the tree the current candidate was built from.
