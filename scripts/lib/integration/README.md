# Live integration code

These modules were proposed under `docs/integration/proposed/<package>/` and later wired into staging, packaging and tests. The live copies are here so build scripts no longer import from the records tree; the originals under `docs/integration/proposed/` stay unchanged as the reviewed records their receipts and `source-pins.json` files pin by hash.

Each module still reads its reviewed data (`inputs.json`, `source-pins.json`, `anchors.json`, `edits.json`, payload text) from its record folder, so a pin change is still a record change. Only the import paths differ from the records; the code is otherwise byte-identical. `scripts/lib/provided-stage-inputs.mjs` hashes these copies as stage provenance, so editing one requires a restage.

| Here | Record |
|---|---|
| `<package>/<file>` | `docs/integration/proposed/<package>/source/<file>` (or `<package>/<file>`) |
| `research-v1/aux-research-ui.mjs` | `browser-feature-expansion/research-v1/source/aux-research-ui.mjs` |
| `completion-integration/transform.mjs` | `completion-20261026/integration/transform.mjs` |
