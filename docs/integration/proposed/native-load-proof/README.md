# Deny-all original addon registration proof

Prepared runner (not executed against native artifacts):

```
node vendor/provided/prove-native-load-only.mjs /absolute/Resources/aux /absolute/native-build-output /absolute/docs/source/provided-runtime-inputs.json
```

It requires the new successful source-matching build receipt, current guard/interposer hashes, original supplied addon hash, unchanged bundled runtime Node source hash, and codesign verification before creating a private disposable proof tree. No signing or build is performed. Missing receipt refusal was actually tested and stops before any host launch. Current native builds remain pending, therefore no original addon was loaded by this work.

The dedicated unchanged Node host receives only a minimal disposable environment and the fixed copied interposer. The probe loads guard first, verifies actual imported Security function pointers and latches deny-all before original addon NAPI registration. Load-only CJS metadata records registered run/PDF descriptor booleans without accessing a PDF getter or calling original commands. Main and worker separately prove canonical SHA scope, rejected scope change and latched deny-all; counters report refused Security calls only. Original run/PDF are never invoked. Subprocess output is bounded to8192 bytes and20 seconds. Private fixtures are removed afterward.

A successful result explicitly says suppliedSeaLoadingProven:false and dpRuntimeAccepted:false. Compilation, signature validity, addon registration and deny-all pointer proof do not establish production DP entitlement/shared-authority behavior. Root owns signing. Receipt hashes describe pre-sign outputs; re-signing that changes bytes requires a separately reviewed signed-artifact provenance chain rather than bypassing the receipt check. The runner currently refuses changed output hashes.

## Actual SEA options and CLI pre-exec check

Static actual staged CLI SEA inspection: flags1, original entryPath /Users/runner/work/bro-components/bro-components/apps/cli/build/sea/index.mjs, zero assets, empty tail. Pinned supplied CLI source ends with buildProgram(actions,CLI_VERSION).parseAsync(process.argv). It has no NODE_OPTIONS integration or eval testing command. Commander documentation mentioning node --eval is generic parser library documentation, not a supported SEA eval entrypoint. No assumption that SEA `-e` or preloading works is made. A true supplied hardened SEA load-only proof remains pending a verified safe preload/startup seam.

After root assembles and signs the wrapper+SEA, this disposable command checks actual CLI pre-exec/argument behavior only (it does not establish original addon loading):

```
fixture=$(mktemp -d /tmp/aux-cli-wrapper.XXXXXX)
chmod 700 "$fixture"
env -i HOME="$fixture" AUX_HOME="$fixture" PATH=/usr/bin:/bin AUX_PROVIDED_NATIVE_LOAD_ONLY=1 '/absolute/Aux.app/Contents/Resources/aux/apps/cli/Aux CLI.app/Contents/MacOS/aux-cli' --help
rm -rf "$fixture"
```

Never set AUX_ENABLE_PROVIDED_NATIVE_CARRIER for this check. The wrapper sets the fixed DYLD path and canonical scope; the original CJS guard must still independently validate imported pointers before any future original binding load. No original native commands should be used merely to make --help become a native loading test.
