# Supported package-removal classification

This disjoint follow-on changes **only the classification of ENOENT for exact package-owned pins**. It does not modify the frozen async proposal or accepted candidate, delete files, repair a cache, authorize execution, or change the original supplied updater validator. Root owns the combined serialized compile/link.

## Confirmed supplied behavior

The exact supplied `env.sh` sets `VIRTUAL_ENV` to `runtime/python/venv`, requires that virtual environment, and sets the npm global prefix to `runtime/node`. `bin/pip` and `bin/npm` forward the original arguments to the packaged managers. These are enabled package-management entrypoints, not hypothetical additional functionality.

The packaged pip installation path calls `requirement.uninstall(auto_confirm=True)` when reinstalling, installs the replacement, and commits the removal after success. Its `uninstallation_paths` is explicitly based on each installed distribution's RECORD, including bytecode derivatives; its permitted-path check constrains virtual-environment removal to that prefix. The packaged npm explicitly supports installing an upgraded npm itself; its uninstall command calls Arborist reify with `rm`. `npm.globalDir` derives `globalPrefix/lib/node_modules`, and the exact `npm` package.json identifies the installed npm tree and npm/npx bin targets.

All supporting files are pinned in `provenance.json`. The generator checks their original distribution SHA/size, reversing any approved relocation anchors exactly before comparison. It reads static supplied source/metadata only and never imports or runs pip/npm/Python packages.

## Exact scope

`generate.py` derives individual paths from nine authenticated wheel RECORDs and the authenticated installed `npm@11.17.0` inventory. It emits **4,903 exact removable pins: 4,183 files and 720 directories; no symlinks**. A directory is included only if every pinned non-directory descendant is in the removable set. There is no runtime prefix exemption or scan of mutable owner caches.

Fixed containers remain non-removable: node/python roots, interpreter/manager bin directories, the venv/lib/site-packages container, global node_modules container and npm package root. Fixed original runtime wrappers, interpreter/native executable targets, version/config files and the npm/npx CLI targets reached by the unchanged launcher links are excluded. The exact twelve required macOS entrypoints and six Mach-O paths are extracted from the hash-pinned current daemon contract; their actual pinned symlink targets are also excluded. Package-internal npm metadata/lib/cli.js, pip internal modules and pip-generated venv scripts remain removable/unverified: a supported self-upgrade may legitimately replace that old layout. `provenance.json` lists all exclusions and every allowed path.

Only ENOENT for an allowlisted exact pin increments `modified` instead of `missing`. Missing core pins continue to yield `incomplete`. Changed/dangling/substituted links, incorrect file types, non-directory or symlink ancestors, ownership/mode rejection and other read failures retain `unsafe`. Present files continue through the original exact pin/hash/relocation inspection.

A removed allowlisted package file yields `unverified-modified`, never `matching-seed`. This cannot prove that removal came from a legitimate package operation rather than damage or an interrupted mutation; preserving that uncertainty is intentional. Original downstream compatibility checks still apply. Nothing here establishes newer-runtime provenance, repairs fresh-stage publication or weakens native owner/cold refusal.

## Apply as an explicit additional layer

1. Require the original frozen core SHA in `overlay.json` from `runtime-cache-async-integration/source/AuxRuntimeCacheInspection.inc`.
2. Replay `inspection.patch` / the three recorded substitutions (counts 1, 1 and 4), requiring the exact output SHA. The updated core includes `AuxRuntimeMutablePins.inc` from the same private source directory.
3. Copy the single new exact include, require its SHA, and pin it in the actual dependency closure. The frozen host/async dispatcher/pin table/bootstrap/source/entry bytes do not change. The native recipe's existing PDF/utility header-path normalization remains a separate recorded layer.
4. Compile this combined projection through the integrator's serialized build lane. No new standalone native executable, library, runtime process, test account, grant or signature is requested.

Validation here is the bounded source/metadata derivation, exact original hashes, complete record/path ownership graph and count-checked patch generation. No new compiler/test executable or product execution was run; combined native compile evidence belongs to the root lane.
