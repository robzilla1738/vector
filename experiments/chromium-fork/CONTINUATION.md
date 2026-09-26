# Native Aux development continuation

Updated September 26, 2026. This is the runbook for the **stable Chromium 154 AuxDev checkout**. Read [the current handoff](../../docs/HANDOFF.md), [evidence ledger](../../docs/EVIDENCE.md), and [patch README](../../chromium/README.md) before changing it. The original `Aux Host Proof` checkout, checkpoint files and `apply-shell-proof.py` in this directory are historical experiments; do not apply them to AuxDev.

## Paths and state

| Item | Current location / condition |
| --- | --- |
| Source | `/Users/rcourson/aux-chromium-stable/chromium/src` at pinned Chromium `154.0.8037.58` plus Aux patches 0001–0051 |
| App | `out/AuxDev/Aux.app`, component development build with bundled Aux Runtime |
| Patch source of truth | [`chromium/patches/series`](../../chromium/patches/series) and its ordered patch files in this repository |
| Shell assets | [`chromium/shell-assets`](../../chromium/shell-assets), staged into `chrome/browser/resources/aux/assets` |
| Local evidence | [`docs/evidence/native-aux-live-2026-09-25.md`](../../docs/evidence/native-aux-live-2026-09-25.md); raw logs and disposable Profiles stay outside Git |
| Release build | `out/AuxRelease` was interrupted intentionally; preserve its cache. Official app and DMG are deferred. |

The native source checkout is dirty **by design** because the ordered Aux patches are applied. Do not reset it, re-run `setup`/`push`, or copy the 2024 proof files onto it. The repository branch should be clean between integration batches. Before editing a native file, inspect the matching latest patch and confirm no build is active.

## Inspect before building

```sh
cd /Users/rcourson/Documents/Vibe/web
git status --short --branch
tail -6 chromium/patches/series
ps -axo pid,etime,command | rg 'siso ninja|autoninja|AuxDev/Aux.app/Contents/MacOS/Aux'
git -C /Users/rcourson/aux-chromium-stable/chromium/src rev-parse HEAD
```

The pinned upstream commit is in [`chromium/version.txt`](../../chromium/version.txt). A running Aux browser should be quit **through its app menu** before relinking its framework. Leave unrelated browsers and personal Profiles alone. Do not run two native builds at once. The old official build is not needed for the current scope.

## Integrate a source change

1. Edit only the required native source files in the existing checkout. Capture their pre-change state, record the incremental diff as the next ordered patch in this repository, and add it to `chromium/patches/series`. Verify that patch with `git apply --reverse --check` against the modified checkout. A fresh full-series replay is a separate gate; the last recorded one is through patch 0036.
2. For renderer changes, from the repository run `python3 chromium/aux-chromium stage-shell`, then `node scripts/check-budgets.mjs bundle`. If the runtime changed, stage it with `node chromium/stage-runtime.mjs /Users/rcourson/aux-chromium-stable/chromium/src/out/AuxDev/Aux.app` after building it. These steps do not replace a native resource rebuild.
3. Build locally in the native source checkout after AuxDev has exited:

```sh
cd /Users/rcourson/aux-chromium-stable/chromium/src
DEVELOPER_DIR=/Applications/Xcode-beta.app/Contents/Developer \
  nice -n 10 third_party/siso/cipd/siso ninja -offline -local_jobs=8 \
  -C out/AuxDev chrome > /tmp/aux-dev-next-build.log 2>&1
```

Check the **exit code and end of the log** before reporting success. Preserve the incremental cache and prior logs. Do not start the official static build for development-only work.

## Verify the development app

Use a disposable Profile for automated host tests and fixture content for agent/model flows. Native test instructions and permissions are in [native-journeys.md](../../docs/native-journeys.md). For the current app:

```sh
node tests/host/native-app-journeys.mjs --app /Users/rcourson/aux-chromium-stable/chromium/src/out/AuxDev/Aux.app --rpc-only
node tests/host/native-profile-journeys.mjs --app /Users/rcourson/aux-chromium-stable/chromium/src/out/AuxDev/Aux.app
```

Run these only when native/runtime changes touch their assertions or a handoff gate calls for a fresh run. `--rpc-only` omits layout and glass verification. The full app journey needs macOS Accessibility and Screen Recording permissions. Inspect live AuxDev with UI tooling for the exact affected journey; window screenshots cannot establish perceptual macOS blur. Keep the owner's real Profile and data untouched.

For a renderer batch, run the focused tests, `pnpm typecheck`, `pnpm lint`, `pnpm format:check` as relevant, and the existing bundle budget gate. Record the exact local command, outcome, app/build identity and limits in [EVIDENCE.md](../../docs/EVIDENCE.md). A passing targeted test or earlier hosted SHA does not qualify the whole roadmap.

## Current next work and constraints

The next product batch is S7 downloads (`downloadFolder`, `chooseDownloadFolder`, `downloadsSnapshot`, `controlDownload`, `retryDownload`) as patch 0052, then one AuxDev build, `node scripts/check-bridge-coverage.mjs`, and one real downloads journey. Coverage was 63 missing members after patch 0051. Do not mark S7 done before that count is zero. Do not copy this repository's generated host-method headers onto the Chromium checkout.

Native Quick Ask and the Profiles management screen remain gated off. Several feature families still need native bridge services and live journeys; extension, passkey, import, agent, both-layout accessibility, and glass checks are incomplete. The owner confirmed the corrected right-only assistant corners and selected the expanded left panel's blur as the reference. Keep both Aside layouts and the shared liquid-glass material while integrating.

Migration implementation remains in scope, but **do not migrate real data**. Final DMG, signing/notarization, official static compilation, full release qualification and takeover packaging are deferred. Build and test on this Mac; tell the owner before any Linux VM. Avoid GitHub-hosted runs and paid billing. A protected-main merge needs GitHub's required check once the account can run it; local development does not.

The historical [proof map](INTEGRATION.md) and [checkpoint](checkpoints/2026-09-24.json) document the previous `Aux Host Proof` binary only. Do not use their mock keychain, public debugging port or old `AuxProof` launch flags for the current development app.
