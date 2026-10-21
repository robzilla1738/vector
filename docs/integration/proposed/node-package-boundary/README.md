# Proposed outer-app Node package boundary

Source-only proposal for the v581 LaunchServices startup stall. No app/stage/packaging file, signed executable, native component, profile or OS permission has been changed.

## Observation versus inference

Root's actual `launch-services-v581-daemon-sample.txt` (SHA256 `eb20e75be5e02b728c84b550905941ce0e6eec735b924bddc1347a00f524be45`) samples all873 main-thread frames in `BindingData::GetNearestParentPackageJSON → TraverseParent → GetPackageJSON → ReadFileSync → __open`. It shows no Keychain frame. Root reports the same artifact works under direct Terminal launch but fails before its listener under LaunchServices. The sample does **not** disclose the filename being opened, prove a TCC denial/prompt, identify the JS caller or rule out another filesystem stall. Documents/TCC attribution remains a hypothesis.

The candidate has no package marker at outer `Aux.app`, `Contents`, `Contents/Resources`, `Contents/Resources/aux`, daemon app root or its `Contents/Resources/native`. A nearest-parent scan can therefore leave the app. Root subsequently identified the first external marker as the generated package-root report `package.json`, which has no `type`/`name`, rather than workspace `web/package.json`.

## Source-backed call path

The active pinned daemon adapter's startup hook calls `createRequire(process.execPath)(absoluteMemoryBootstrapPath)` before normal product main. Runtime lazy provisioning uses the same pattern. The original daemon also creates require functions from `import.meta.url`, and its native loader uses the guarded CJS boundary. The sampled stack cannot distinguish these callers.

Node's CJS loader invokes `trySelf(parentPath, request, conditions)` before ordinary `_findPath`; `trySelf` asks `getNearestParentPackageJSON(parentPath)`. That package metadata read can occur even when `request` is an absolute CJS pathname. Local Node26.12.0's builtin loader source confirms that ordering. Upstream [Node26 TraverseParent](https://github.com/nodejs/node/blob/v26.0.0/src/node_modules.cc#L276-L314) walks parents and returns the first successfully read package file. This supports a filesystem boundary rather than a daemon/native/code rewrite. The actual supplied SEA Node revision was not independently established in this slice; its sampled function names match this mechanism.

## Exact proposed packaging delta

Copy the supplied proposal `package.json` bytes to **`Aux.app/package.json`**, mode0644, before final outer-bundle resource hashing/sealing. Content:

```json
{
  "private": true
}
```

SHA256: `d866fdcb8dc8d2f8038193fb6765500d7565c1c542139d7719ce25b574bf8b6c`.

It sits outside all eight reused signed helper bundles. Do not add markers inside those bundles or modify/re-sign their bytes. No `name`, `exports`, `imports`, scripts, dependencies or resolution aliases are added. No `type` is declared: this preserves the untyped package semantics of the actual nearest external generated report used in the successful direct launch. Untyped CommonJS `.js` and explicit `.cjs` remain CommonJS; explicit `.mjs` remains ESM. The SEA's own module format is not rewritten, and nearer runtime/dependency package markers still win. The marker bounds nearest-package metadata traversal, **not** general node_modules search or arbitrary filesystem access. It grants no OS permission and cannot fix an open blocked inside the app itself.

Root owns any assembler allowlist/inventory, outer resource seal, successor acceptance and disposable LaunchServices experiment. No fallback Node host, working-directory trick, auth change or extra OS grant is proposed. Adding an outer resource changes the outer package inventory/seal even while all helper bytes remain identical; follow the existing exact-byte review workflow.

## Focused proof and remaining acceptance

`node --test docs/integration/proposed/node-package-boundary/boundary.test.mjs` passed on local Node26.12.0. It builds only inert disposable files: fake nested host path, absolute `.cjs` target, untyped CommonJS `.js` target, ESM `.mjs` target and malformed ancestor `package.json`. Without the marker, absolute require fails with that ancestor's `ERR_INVALID_PACKAGE_CONFIG`; with the marker it loads all three targets correctly. No supplied SEA/native binding/Keychain command or product main is executed.

This proves the generic resolution boundary, not the actual LaunchServices fix. Root must observe the exact successor app through bare LaunchServices, confirm real daemon listener/auth readiness, and retain an actual failure/sample if the marker does not resolve it.

Root integration now writes that exact marker into the outer app during packaging and records its SHA/mode in `outerPackageBoundary`. Authority reuse validates the fixed untyped marker against the actual full inventory; helper resource/executable matching stays exact. Six focused loader/resource-boundary checks passed. The581b packaging adaptation reuses compiled native581 bytes; its normal LaunchServices result is still pending.

macOS sealing rejected the top-level Aux.app/package.json as unsealed bundle-root content. The integrated marker location is therefore **Aux.app/Contents/Resources/package.json**, outside every nested signed helper but within the outer app’s sealable resources. All packaged Node hosts are below this directory. The fixture now tests that exact Resources boundary; source statements above about the original top-level proposal are historical. The failed581b package was never launched.581c is the corrected packaging revision over the same native581 build.
