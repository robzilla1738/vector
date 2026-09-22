# Packaging

## Desktop product

```bash
pnpm package:local
```

Produces `release/mac-arm64/Aux Browser.app` (`release/mac/` on Intel; unsigned local build) with the
desktop shell, runtime, and embedded Chromium backend. Smoke with `pnpm smoke:packaged`.

```bash
pnpm dev
```

## How the desktop packager works

`scripts/package-local.mjs` (invoked as `pnpm package` or `pnpm package:local`):

1. `tsc -b` the workspace + `vite build` the renderer + `bundle.mjs` the
   Electron main/preload into self-contained files (no node_modules in the
   asar).
2. Stage the runtime under `release/.staging/runtime`: `apps/runtime/dist`
   plus vendored contracts and engine-client workspace packages,
   workspace deps rewritten to `file:`, registry deps hoisted into the
   runtime manifest, then `npm install --omit=dev`.
3. `electron-builder` packages the app; the staged runtime lands at
   `Contents/Resources/runtime`.
4. electron-builder hard-excludes `node_modules` from `extraResources`, so the
   script copies the runtime's `node_modules` in after the build.

The macOS build compiles `native/liquid-glass.mm` with AppKit and Node-API headers;
the build SDK must include macOS 26 AppKit declarations. The addon uses a runtime
availability check and falls back to titlebar vibrancy on older macOS.
`liquid-glass.node` and `aux-dictation` are unpacked from ASAR; dictation resolves
its executable from `app.asar.unpacked` in packaged builds.

Native icon: `apps/desktop/brand/aux-icon-1024.png` is the full-canvas silver
master. Run `node scripts/make-icon.mjs` before packaging after replacing it.
This generates the 16–1024px iconset, `apps/desktop/icon.icns`, and the renderer
About icon. The separate monochrome UI mark is `renderer/public/arch-mark.svg`.

At launch, `main/runtime-proc.ts` resolves
`process.resourcesPath/runtime/dist/main.js` and forks it under
`ELECTRON_RUN_AS_NODE=1` with `AUX_IPC=1`, `AUX_ELECTRON_CDP` (the
auto-assigned remote-debugging port), and `AUX_DATA_DIR`.

## Verify a packaged build

```bash
# fixtures must be running: pnpm fixtures
pnpm preview
# or drive it headlessly:
AUX_DATA_DIR=/tmp/vpkg 'release/mac-arm64/Aux Browser.app/Contents/MacOS/Aux Browser' &
cat /tmp/vpkg/runtime.json     # port + token
curl -X POST http://127.0.0.1:<port>/rpc \
  -H "authorization: Bearer <token>" -H 'content-type: application/json' \
  -d '{"method":"pages.open","params":{"url":"http://127.0.0.1:4810/records","backend":"aux"}}'
```

## Notes

- Code signing / notarization are intentionally off (`identity: null` in
  `electron-builder.yml`) — local builds only.
- The packaged browser profile lives under the app's `userData` dir;
  `AUX_DATA_DIR` only carries runtime state (db, artifacts, descriptor).
- `pnpm preview` uses separate persistent data under `~/Library/Application Support/Aux Preview`,
  disables dotenv loading, and does not import main-profile credentials.
- Isolated manual `electron-builder --dir` builds also require the runtime
  dependency injection in step 4; packaging alone does not include those dependencies.
