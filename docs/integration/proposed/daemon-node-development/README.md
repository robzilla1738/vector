# Supplied daemon JavaScript on unchanged bundled Node

Source-only, local-development proposal requested by root. This reuses the exact pinned supplied daemon implementation and its existing count-checked Aux adapter. It introduces no replacement backend/auth/native module, launch, signing, Keychain command or process-control action. Runtime/DP acceptance remains false.

`vendor/provided/daemon-node-development.mjs` exports `buildDaemonNodeDevelopment(originalBinary)`. It rejects a different original binary/code/assets/SEA flags/tail and returns four in-memory files plus a build manifest. Caller owns staging/assembly/opt-in; no package/native source is modified here. Input binary is SHA `60d3c50a649a528927137c427d284e695a98162476d28065bb9634e937fed286`; extracted supplied code SHA `5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5`. Whole supplied app/native/runtime layout remains required.

The returned paths are relative to the existing `<Resources/aux>` root:

- Node: `agent-runtime/node/bin/node` — actual unchanged supplied host, not the patched SEA.
- Script: `apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs`.
- Emitted asset loader and both ORIGINAL SEA WASM assets live beside that script. There are exactly two assets: QuickJS503134bytes and Photon1881634bytes, hash-pinned in source and manifest.
- Launch arguments BEFORE script: `--disable-sigusr1`, `--use-system-ca`. These are the actual original SEA tail's two embedded Node arguments, not new guesses. Root retains responsibility for environment, stream/working-directory handling and explicit native startup metadata.

## Narrow integration changes

Twelve count-checked development edits follow the existing faithful `adaptDaemonCode` output. Resource discovery uses this script's actual daemon app `MacOS`/`Resources`/`Applications` locations. It fixes the same guarded native binding, bootstrap/diagnostic files, PTY fallback and importer paths that otherwise incorrectly resolve beside the real runtime Node. It selects packaged-resource mode based on that actual `.app` layout. `process.execPath` is never assigned/spoofed and remains the real Node host, including for worker creation and unrelated APIs.

Three asset read sites use the original pinned WASM bytes. The helper implements the used `getAsset` behavior: a fresh ArrayBuffer copy, or decoded text when encoding is supplied, with unknown/unsafe/drifted assets rejected. Original Node's `node:sea` imports and truthful `isSea()` remain unchanged. The embedded Photon worker receives the same actual Photon bytes through its original workerData/transfer path; no worker renderer, model or image-processing replacement is introduced. No `getRawAsset` emulation is needed for the macOS path. SEA-only `verifyPackagedMemory` intentionally still refuses a non-SEA host rather than claiming SEA acceptance.

The unchanged `aux-native.cjs` guard/daemon-role original `provided-native.node`, boundary library and actual private runtime layout remain mandatory. The builder never sets native-acceptance flags, loads native modules, creates credentials, substitutes `daemon-native.cjs`, changes crypto labels or changes public wire contracts. Original RPCs/services/workers/helper behavior remain the supplied code.

## Verification and limits

`daemon-node-development.test.mjs` requires `AUX_PROVIDED_DAEMON_STATIC_BINARY` naming the pinned static executable. Two focused checks passed using Node26.12.0: actual binary/code/asset pins and all counted edits; generated ESM syntax-only parse; actual owned asset helper ArrayBuffer copy/encoding behavior; unknown-name rejection and fresh-read tamper rejection. The original/adapted daemon entrypoint was NEVER imported or executed. Temporary fixture files were removed. Because this lane lacks root's current adapter modules, the check copied only those existing source-only dependencies and the two new modules into a disposable directory before importing the builder; root can run the same test directly after integration. `build-manifest.json` records the concrete output hashes and applied edits.

No real Node-host daemon launch, NAPI command, signing, Keychain/DP authority, browser profile, network or UI acceptance occurred. Running the unchanged Node host does not confer the SEA's application identity/entitlements. Guarded native loading, actual common authority, bootstrap and all supplied runtime functionality still need separately authorized acceptance. Existing runtime bootstrap requires destination `AUX_HOME/runtime`; root must keep its actual environment consistent. This proposal does not repair an unrelated env contract by silently falling back.

Root owns the explicit local-development opt-in and startup wiring. The current nonexistent independent `apps/daemon/dist/index.js` fallback must not be treated as this implementation. Default SEA production selection stays unchanged until root explicitly installs/chooses this development artifact.
