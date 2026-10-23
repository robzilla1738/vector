# Current dormant native-entry package resources

The actual20748 stage's generated `node-development/index.mjs` is byte-identical to the previously reviewed owned-entry input: SHA256 `e3ca08e182127f5eb0330a96d91b43cdec9e935045eb6aff8073059246003ac3`. No routing-anchor revision is necessary. This proposal reuses the existing owned-native, fixed-PTY and exec-lifetime projection functions unchanged; it does not loosen their exact source/count checks.

It materializes exactly two additional files inside a **new package's private assembly transaction**:

| Resource relative to Aux resources | Bytes | SHA256 |
| --- | ---: | --- |
| `apps/daemon/Aux Daemon.app/Contents/Resources/node-development/aux-native-entry.mjs` |12211782|`d6288135e178d25540ab139e637bd44ed101274532769ed005054ae32f826541`|
| `apps/daemon/Aux Daemon.app/Contents/Resources/native/aux-owned-native.cjs` |581|`ec7ea0405f415d84e4afc695405eec07378d8c7233b926ffd9dd7db2edfed663`|

Both modes are0644. No generated12MB file is committed; the pinned generator returns its exact bytes. `inputs.json` pins the original supplied SEA and all projection/dependency bytes. The current projection output matches the already-reviewed exec-lifetime output exactly. No new execution, PTY behavior, UI/CSS/assets or authority mechanism is introduced.

## Package-only inclusion

`source/resources.mjs` provides:

- `projectCurrentNativeEntry(originalDaemon,index)`: pure exact-source projection.
- `currentNativeEntryResources({repositoryRoot,index})`: checks pinned static dependencies and returns the two fixed resources.
- `addDormantCurrentNativeEntry({resources,assembled,repositoryRoot})`: checks the current index inventory and bytes, existing inactive native-main package mode and real parent directories; creates only the two absent fixed files with `wx`; verifies their hashes/modes; updates the complete bundle inventory and a truthful `nativeEntryProjection` record. It rechecks the ordinary index bytes afterward and refuses repeated/mixed inclusion.

`package.patch` plus `package-metadata.json` propose three exact edits in `scripts/lib/provided-package.mjs`: import the helper; invoke it only after the explicit inactive native-main replacement; record its result in external package.json. The default mode never invokes it. The patch is unapplied; no shared pipeline, stage, app or native checkout was edited. The current native-main receipt still identifies68715 and does **not** falsely identify the reader successor.

The ordinary `index.mjs`/SEA/CLI/refusal bytes remain unchanged. The added entry is dormant: its first statement resolves the actual native linked binding. No argv/environment authority or selectable JS handle is added. Its fixed CJS loader projects only real owned `run` and `withAccountRegistryLock`; it has no original-addon fallback. Main and Worker routes use that same fixed CJS path with the actual inherited per-Environment native preload. PDF retains its separate fixed loader. The finite PTY resource path and no-chmod helper requirement and retained execution lifetime code are the unchanged reviewed projections. No actual Node/Worker/PTY loading is proven by adding the resources.

## Required native reader successor — not in current executable

The current68715 executable still authenticates/reads `Resources/node-development/index.mjs`, which refuses. `source/AuxSealedNativeDaemonEntry.swift` and `reader.patch` change exactly four literal filename occurrences to `aux-native-entry.mjs`: descriptor open, same-entry recheck, SecCode sealed-resource validation and original resource URL passed to Node ModuleData. All FD, metadata, ACL, identity, allocation, signature and role checks are otherwise byte-identical. The same directory preserves relative `assets.mjs`/dynamic resource import resolution; the new name does not redirect imports to another root.

This logical Swift source replacement requires a **new actual46-Swift final link** with the existing verified C++ objects if their exact input checks still pass, then a separately reviewed successor native-main package receipt/output pin. Neither this source nor a new executable was compiled here. Current68715 must not be represented as reading the new file. The marker explicitly records `readerPresentInBuild68715:false` and the proposed reader SHA. A later build/receipt integration must update that truthful schema rather than simply changing the false value.

The parent cold hook remains default-off; outer state2 refusal and fallback source remain intact. Future signed-policy/PTY/helper bytes, root-owned immutable bundle custody and genuine runtime/whole-cohort acceptance are still required. Resource inclusion alone does not satisfy any of them or retire the original supplied addon from the fallback bundle.

## Focused checks

`node docs/integration/proposed/aux-native-current-entry-package/check.mjs` reconstructs the exact current projection, rejects changed input, parses the generated module without evaluating it, checks exact four-literal reader replay and package patch replay, and exercises the actual resource copier once in a disposable synthetic directory. It verifies unchanged index bytes, exact inventory additions and repeated-inclusion rejection, then removes only its fixture. `evidence.json` records the two concrete outputs and successful checks. No daemon/module, native protected call, actual package, provider request, signing or owner state was executed or modified.

## Root applied integration and actual package

Root applied the paired resource/reader package successors and actual new package27703 passed in a fresh directory. The fixed reader compiled/linked in95354 and the actual copied binary/resource hashes match. Ordinary index remains unchanged/refused; all1217 Agent/five CSS files match the preceding recovery-enrollment stage. `aux-native-current-entry-reader-build/evidence/actual-paired-package.json` records exact observed package/bundle hashes. No app/module was run, signed or activated; current native cold hook remains off. Previous unapplied/uncompiled descriptions above are historical for their source-only lane, not current package status.
