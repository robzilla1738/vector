# Exact pinned source recovery after installed auto-update

The pinned source versions are recovered in the project-owned static snapshot:

`/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852`

The existing stage is unchanged. No newer source version was adopted. The snapshot is an explicit source input, selected with `--source-snapshot`; installed defaults do not silently redirect to it. Canonical inventories and source versions remain unchanged. See `docs/acceptance/provided-source-snapshot-recovery.json` for manifest, inventory, validator and original critical-file hashes.

## Complete coverage

Strict `resolveProvidedSourceSnapshot` validation passed all seven components:

| Component | Pinned records |
|---|---:|
| Agent1.26.1016.1852 |1215|
| Vault1.26.1016.1852 |46|
| Daemon pinned original app |133|
| CLI pinned original app |6|
| Runtime1.26.1019.335 |10929|
| Memory catalog-1792381929 |31|
| Computer Use1.26.1020 / build1.26.1020.23 |11|

All12371 records have exact canonical file bytes, pinned modes, types and symlink targets, with no additional component leaves. Runtime includes9346 files,1573 directories and10 symlinks; memory includes19 files and12 directories. Directory parents implicit in app/UI inventories do not introduce new files. Mutable installed runtime state such as unpinned tmp/.npmrc was not copied. App/runtime/helper modes retain their actual canonical permissions; the recovered daemon executable's canonical mode is0700.

The complete recovery inventory, provenance and per-record pins are at snapshot-root `recovery-inventory.json`; its hash is in the committed receipt. `validation.json` contains the strict resolver result. Recovery ledgers sit outside component inventories. UI recovery reuses the separately verified1261-file original snapshot and its116 exact forward text replay receipt (`provided-ui-original-1.26.1016.1852/recovery-inventory.json`, also copied above the component trees).

## Recovery methods

- CLI, runtime and memory were still exact at their explicitly pinned static paths and were copied by canonical records only. The vanished daemon app's unmodified resources were recovered from authorized project staging/static caches only on whole-file SHA equality. A handful of unchanged static skills/provisioning resources in the later installed package matched the old pinned hashes exactly; no changed leaf was accepted merely because it was installed.
- The original daemon code extraction still matched `5e35dfa1…03814f5`. Inserting it into the staged SEA container with its original assets reproduced the **entire original binary** SHA `60d3c50a…fed286`. This uses the original executable container rather than manufacturing a substitute daemon. Only the project snapshot was written.
- Computer Use's three changed leaves were restored from the earlier staged original using its recorded count/offset/byte/plist anchors. Inverse byte patches and text anchors were accepted only after each full original pinned SHA matched; the binary exactly matches `a17241d3…c97026`. The other eight leaves were already exact.
- Both daemon Info.plists were recovered by restoring only the original short/build version strings in the static XML and requiring whole-file original SHA equality. The two original CodeResources XML files were recovered by restoring exact original resource hashes and the nested original CodeDirectory digest in the unchanged XML template. Both entire resource-seal SHA values match their canonical old pins. Embedded provisioning profiles and original binaries were copied only on exact SHA equality.

Resource-seal reconstruction is **static byte recovery**, not signing, signature validation, provisioning, or authorization. No private key, Keychain material, signing tool, OS grant, browser, helper or supplied executable was operated on. The original stage/installed app was not edited. Recovered source availability does not prove packaged behavior, native authority, import, Vault, CLI or Muse acceptance.

## Use

Root can select this exact snapshot for staging and preservation checks through the explicit `--source-snapshot` option. The manifest SHA is `c37cf10878fcb7c4f471a9b5feadd6dc79faa96da4d294255f7a6e8e4d66000d`. Continue to fail closed on any later source drift; do not repin to the owner's auto-updated installation. Canonical inventories remain in `docs/source/provided-{ui,app,runtime,computer-use}-inputs.json`.
