# Supplied runtime distribution staging

This slice stages the owner's supplied static runtime, rather than substituting the independent Aux runtime. It executes no supplied program and requests no OS permission. Root owns packaging, CLI and daemon integration.

## Pinned inputs

`provided-runtime-inputs.json` pins version `1.26.1019.335` at `~/.aside/runtime`. Its only traversed implementation roots are `bin`, `native`, `node`, `python`, plus the five explicit top-level files `env.sh`, `manifest.txt`, `openssl.cnf`, `prepare-python.py` and `version.txt`. The top-level owner `tmp` and `.npmrc` are neither opened nor copied. No other owner home/state directory is enumerated.

The runtime pin has 9,346 regular files, 1,573 directories and 10 symlinks, totaling 367,666,482 regular-file bytes. Every file has its source SHA-256, length and permission mode; every link has its literal target. The ten links are relative internal npm/npx/Python aliases. Link targets outside the allowlisted roots, dangling links, nonregular files and unexpected source changes fail. Regular binaries, native dependencies, Python bytecode, Node/Python dependency layouts, licenses and script behavior are preserved. This includes old CI paths embedded in immutable Python bytecode debug metadata; no binary patching is performed.

A separately pinned `memory` component reads only `~/.aside/memory-catalog.json`, catalog-described current generations under `memory-runtimes`, and catalog-described current weight generations under `models`. These contain 19 files / 176,379,619 bytes. Metadata must match a catalog runtime/model declaration; every payload size and SHA-256 must match that declaration. Paths, generation names, file inventory and symlinks are checked before payload access. Unknown generations/files or an external metadata link fail. No user index or `u` tree is read. The catalog's supplied signed envelope is retained byte-for-byte; payload matching and a pinned envelope hash are verified, not an independent public-key signature authenticity claim. Signed IDs, executable names, model hashes and catalog bytes remain unchanged so catalog authenticity is not invalidated by cosmetic renaming.

## Integration API

```js
import { stageProvidedRuntime } from './scripts/lib/provided-runtime.mjs';
const report = await stageProvidedRuntime({
  sourceRoot: '/Users/rcourson/.aside/runtime',
  memoryRoot: '/Users/rcourson/.aside', // optional; only the three static distribution paths above
  outputRoot: outputDirectory,       // must not exist
  runtimeRoot: '/Applications/Aux.app/Contents/Resources/aux/agent-runtime',
});
```

`runtimeRoot` is required and is the final installation path, not the temporary staging directory. Root chooses the actual final app location and must restage when that location changes. It must be a normalized absolute path using ASCII letters, digits, slash, period, underscore and hyphen. Whitespace/shell metacharacters are rejected because the supplied venv entrypoint shebangs and activation scripts embed unquoted paths; silently inserting an unsafe path would alter or break their behavior. The standard `Aux.app` installation seam satisfies this constraint. Input, output and installation roots cannot overlap, including through existing parent symlinks.

The stage writes `outputRoot/runtime` and optional `outputRoot/memory`, plus a report `outputRoot/manifest.json`. Root can copy the runtime component to `runtimeRoot` and seed the memory component into an isolated Aux state home using the original relative distribution paths. The component root names are staging containers, not instructions to reuse the owner's `.aside` directory.

## Exact differences

Only nine runtime text files change:

- `env.sh`: 11 occurrences of the `ASIDE_` environment prefix become `AUX_`; its existing relative path calculation remains.
- `python/venv/bin/activate`, `activate.csh`, `activate.fish`, `pip`, `pip3`, `pip3.13`, `vba_extract.py`, and `python/venv/pyvenv.cfg`: 12 exact occurrences of the original CI runtime prefix become the explicit final `runtimeRoot`. This restores the supplied activation/entrypoint paths without replacing their implementation.

Each changed file has pinned occurrence counts and a replayable final `{kind,find,replace,count}` anchor. Actual hardcoded source runtime paths, if present in an exactly pinned snapshot, use the same relocation rule. Ordinary text, diagnostics, third-party code and all binary bytes otherwise stay unchanged. Memory bytes do not change.

Two output-only paths are created inside the staged runtime: empty `tmp/` (0700), and `.npmrc` (0600) containing exactly:

```ini
fund=false
audit=false
update-notifier=false
```

There are no tokens, owner registry settings, credentials or inherited temporary files. The stage does not run npm, Python, pip, native tools, memory inference, activation, quarantine cleanup or networking.

## Report and checks

The returned/written report is `{version:1,runtimeRoot,components:{runtime,memory?}}`. Each component records source version/root, output root and `files`. File rows have `path,type,mode,sourceSha256,outputSha256,changeKinds,anchors?`; directory rows have the original mode, and symlink rows record source/output link targets. Added paths use `generated-empty-state` or `generated-config`. Unchanged files retain equal source/output hashes. Atomic staging rejects an existing output and discards its own incomplete temporary directory on failure.

Focused fixture checks passed owner-config/tmp exclusion, internal-link preservation, external-link rejection, unsafe installation-path rejection, metadata-link rejection and catalog-payload tamper detection. One full actual-source stage passed unchanged file/permission/link preservation, all nine relocation/env edits, all unchanged memory hashes and fresh minimal state/config checks (47.6 seconds). A fixture initially exposed the macOS `/var` versus `/private/var` path spelling difference; canonical-root handling corrected it and both fixture tests passed afterward. No repeat expensive full copy was needed for that path-normalization correction. Stage/module syntax checks pass. Supplied binaries were never executed; real packaged runtime/daemon/CLI/memory behavior remains integrator acceptance work.
