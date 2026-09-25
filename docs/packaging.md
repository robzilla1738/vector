# Packaging

> Host scope, September 24: this document describes the existing Electron development/package baseline unless explicitly labeled otherwise. Chromium is now the intended architecture with a partial executable proof; these instructions and feature results do not qualify the fork. Start with [the current handoff](HANDOFF.md) and [candidate runbook](../experiments/chromium-fork/CONTINUATION.md). No signed release is claimed.

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
`ELECTRON_RUN_AS_NODE=1` with `AUX_IPC=1`, `AUX_INTERNAL_CDP=1`, and
`AUX_DATA_DIR`. The authenticated main-process broker carries CDP; packaged
builds cannot select the legacy raw debugging port through the environment.

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

## Signed update qualification lane

`pnpm package:signed` is an **opt-in local build**. It requires `CSC_NAME` for a Developer ID Application identity, `AUX_UPDATE_BASE_URL` for an HTTPS generic update directory, and either Apple ID or App Store Connect API-key notarization credentials. The script checks these before building. It uses the same Aux bundle ID and product name, produces a signed/notarized DMG, ZIP and update metadata, and explicitly sets `--publish never`; it does not upload or release artifacts. Credentials remain in the environment or signing keychain and must not be committed.

After a credentialed build, run `pnpm verify:package:signed`. This verifies the bundle and native binaries with `codesign`, checks notarization stapling and Gatekeeper acceptance, and requires an HTTPS feed plus ZIP/DMG metadata. The app's update menu and periodic check use the packaged feed; a downloaded update waits for Aux's normal dirty-work-aware quit path. They do not call Electron's window-closing `quitAndInstall` path. The unsigned local build has no feed and reports that in the menu. [Electron requires signed macOS updates](https://www.electronjs.org/docs/latest/api/auto-updater); [electron-builder requires the macOS ZIP for its update metadata](https://www.electron.build/docs/features/auto-update/).

**Still required before a release:** install the signed app in `/Applications`, place version N and N+1 artifacts in a private HTTPS test feed, check version N downloads N+1, cancel an exit with unsaved work, complete a later normal quit/update/relaunch, verify Team ID and Keychain continuity, then rehearse rollback and a security-patch build. This checkout has neither a Developer ID identity nor 1Password.app, so a signed journey has not run here. The feed must be supplied by the owner; `package:signed` deliberately does not publish it.

## September 23 shell checkpoint

See [current shell behavior](archive/2026-09-24-b0-reset/ui/design-update-2026-09-23.md) and
[focused native tests](local-testing.md#focused-shell-design-regressions).
Review horizontal and vertical modes, persistent versus preview sidebars, chat
folder actions, and URL reveal followed by page scrolling and window dragging.
Rebuild/relaunch native main and preload code for the input fixes; refreshing a
mock browser is insufficient. Local packages remain unsigned previews; signing,
notarization and the founder pilot are separate handoff gates.
