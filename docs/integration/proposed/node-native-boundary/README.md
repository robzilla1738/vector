# Node native guard and startup seams

Status: source-only integration slice. No shared Chromium files edited. Native compile remains queued: carrier/interposer session31341 and newly added NAPI guard session27971. Neither new guard nor fixed-scope revision has compiled or run. Earlier successful pointer proof applies to earlier carrier only.

## Production loader contract

Stage `vendor/provided/aux-native.cjs`, newly built `aux-native-guard.node`, and byte-identical pinned original `provided-native.node` together in daemon/CLI `Contents/Resources/native/`. `nativeShimPath` now exports this production seam; `disposableTestShimPath` explicitly identifies the old file-backed test shim. Do not ship the test shim as crypto fidelity.

The CJS loader checks the explicit externally accepted runtime flag, canonical home, inherited scope, fixed regular non-shared-writable local files and original native hash. It loads the NAPI guard first. The guard checks actual imported Security function pointers, independently derives SHA256(canonical AUX_HOME) and latches the boundary scope exactly once. Environment mutation cannot change that process scope. Production exports are the exact original module object, including original run/PDF functions; no replacement crypto or fake success is added. Unknown native binding or guard path overrides are ignored. Daemon candidate loading is now fixed to its bundled CJS, matching integrator's fixed CLI candidate.

The original helper's asynchronous worker requires `workerData.bindingPath=loadedBindingPath`; this is now the guarded CJS, so every worker independently validates scope before loading the original module. Original PDF methods call `loadPdfBinding()` through that same guarded loader. CJS explicitly sets canonical home/scope into the Node environment for subsequently created worker copies. NAPI guard keeps no per-environment handles globally and uses a context-aware stable NAPI module registration.

`AUX_PROVIDED_NATIVE_LOAD_ONLY=1` latches deny-all and permits original NAPI registration only. Its exports refuse actual run/PDF calls; boundaryStatus reads current deny-all/counter state. A process that entered load-only cannot become production afterward. Production preserves original DataProtection storage semantics under the immutable Aux scope; it does not substitute a file Keychain. Actual execution remains externally gated pending compiled isolation evidence and explicit approval for new Aux-only DP operations. Shared host entitlement-domain behavior is unproven; readiness remains false. See dp-production-design.md and approval-preview/.

## Build and immutable resources

`buildProvidedNativeBoundary(out, nodeInclude)` now returns guard in addition to carrier/boundary/fixture and compiles every item through native-build.py. Explicit nodeInclude points to supplied static Node headers; default is the authorized static runtime headers. Observed headers are Node26.5.0; used NAPI object/string/callback functions are stable API. Header SHAs: node_api.h `2d4560831e525b47b060ec8a0864ab73993df9e20215ce9f0fe7b24cd31af32a`, node_api_types.h `a25356630d3058f0a0c8937d9f297e9471e037fda58c2696d8a505c2bd99cb00`, js_native_api.h `8808ef8899a1691411928ef5dd7dae0537aedc93d3a34e223b2d89692e79c788`, js_native_api_types.h `c12406a8c0036aefdb66b98065fc88e2e7a053c1f274deef33af6c26c099b933`.

Ad hoc sign only new guard/dylib/carrier and deliberately modified SEA/helper executables plus outer bundle. Preserve original provided-native.node signature bytes and SHA; no blanket deep signing of immutable native or signed-catalog payloads.

## Integrator-owned launch hook

`daemon-environment.patch` is a minimal separate proposal against the recorded current supervisor SHA. It validates a fixed canonical in-bundle `native/libaux-native-boundary.dylib`, sets only that DYLD_INSERT_LIBRARIES, and passes canonical AUX_HOME. It does not create runtime acceptance. Root/L2 should compose it with their existing supervisor/runtime proposal; this is not permission to overwrite their changes.

CLI app launch needs an equivalent native wrapper: derive its fixed library from the owned bundle (or approved canonical Aux root), validate canonical descendant and non-shared-writable mode, replace rather than append arbitrary inherited DYLD libraries, pass canonical home, then exec the original modified CLI SEA. Do not add a JavaScript env prelude as a supposed DYLD proof: injection must be present before host launch; the native guard still verifies actual pointers afterward. No shell/external module-path escape is needed.

## Checks

Three existing pinned-adapter/auth fixtures and two new Node refusal fixtures pass; CJS syntax passes. New Node tests prove unaccepted execution and mismatched inherited scope refuse before guard/original module loading, including irrelevant external binding overrides. They do not prove native guard loading. Native compile/load-only fixtures remain queued. No original native crypto, Keychain or OS permission was invoked.
