# Live integration code

Code first proposed under `docs/integration/proposed/` that staging, packaging and audits import. The copies here differ from their records only in import paths; they still read reviewed data (`inputs.json`, `source-pins.json`, payload text) from the record folders, which stay unchanged. `scripts/lib/provided-stage-inputs.mjs` hashes these copies as stage provenance, so editing one requires a restage.

| Here | Record |
|---|---|
| `provided-agent-worker-revision/revision.mjs` | `docs/integration/proposed/provided-agent-worker-revision/revision.mjs` |
| `aux-native-main-package-integration/native-main-package.mjs` | `.../aux-native-main-package-integration/source/native-main-package.mjs` |
| `research-v1/aux-research-ui.mjs` | `.../browser-feature-expansion/research-v1/source/aux-research-ui.mjs` |
| `aux-native-compatibility-metadata/inspect.py` | `.../aux-native-compatibility-metadata/inspect.py` |

## Still imported from `docs/integration` (on purpose)

Sixteen modules stay where they are because the code verifies them by path and SHA-256 at stage time through their reviewed pin files: the native entry/package projections (`aux-native-{rebuilt-pty,provider-entry,current-entry,main}-package`, `aux-native-owned-entry-{pty,routing}`, `aux-native-exec-lifetime`, `aux-native-fixed-pty-loading`, `aux-final-local-entry-package`, pinned by their `inputs.json`), `aux-sync-recovery-enrollment-ui/source/adapt.mjs` and `aux-macos-utility-node/source/adapt.mjs` (pinned by `aux-macos-utility-integration/inputs.json`, which also pins `vendor/provided/aux-crypto-stage.mjs`), `aux-crypto-runtime-assets/source/materialize.mjs` (pinned by `aux-crypto-stage-integration/inputs.json`) and `completion-20261026/integration/transform.mjs` (pinned by `desktop/browser-files/composition-inputs.json`). Copying them would leave the checks verifying the record while a different file runs. Moving them means moving and re-pinning those pin files with them, which is a reviewed change.
