# Packaging

## Desktop product

```bash
pnpm package:local
```

Produces `release/mac-arm64/Vector.app` (unsigned local build) with the
desktop shell, runtime, Chromium compatibility backend, and packaged Vector
Engine host. Smoke with `pnpm smoke:packaged`.

```bash
pnpm dev
```

## Vector Engine development shell

```bash
pnpm package:native-engine
```

Builds `ve-shell` (`--features product`: window + V8 + HTTP) into
`release/ve-shell`. Dev: `pnpm dev:native-engine`.

## How the desktop packager works

`scripts/package-local.mjs` (invoked as `pnpm package` or `pnpm package:local`):

1. `tsc -b` the workspace + `vite build` the renderer + `bundle.mjs` the
   Electron main/preload into self-contained files (no node_modules in the
   asar).
2. Stage the runtime under `release/.staging/runtime`: `apps/runtime/dist`
   plus vendored `packages/contracts/dist` and `packages/browser-driver/dist`,
   workspace deps rewritten to `file:`, registry deps hoisted into the
   runtime manifest, then `npm install --omit=dev`.
3. `electron-builder` packages the app; the staged runtime lands at
   `Contents/Resources/runtime`.
4. electron-builder hard-excludes `node_modules` from `extraResources`, so the
   script copies the runtime's `node_modules` in after the build.

At launch, `main/runtime-proc.ts` resolves
`process.resourcesPath/runtime/dist/main.js` and forks it under
`ELECTRON_RUN_AS_NODE=1` with `VECTOR_IPC=1`, `VECTOR_ELECTRON_CDP` (the
auto-assigned remote-debugging port), and `VECTOR_DATA_DIR`.

## Verify a packaged build

```bash
# fixtures must be running: pnpm fixtures
open release/mac-arm64/Vector.app
# or drive it headlessly:
VECTOR_DATA_DIR=/tmp/vpkg release/mac-arm64/Vector.app/Contents/MacOS/Vector &
cat /tmp/vpkg/runtime.json     # port + token
curl -X POST http://127.0.0.1:<port>/rpc \
  -H "authorization: Bearer <token>" -H 'content-type: application/json' \
  -d '{"method":"pages.open","params":{"url":"http://127.0.0.1:4810/records","backend":"vector"}}'
```

## Notes

- Code signing / notarization are intentionally off (`identity: null` in
  `electron-builder.yml`) — local builds only.
- The packaged browser profile lives under the app's `userData` dir;
  `VECTOR_DATA_DIR` only carries runtime state (db, artifacts, descriptor).
