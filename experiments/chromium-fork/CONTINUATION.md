# Chromium candidate — continuation runbook

Current implementation checkpoint: `31e7ef95`, September 24, 2026. Read [the handoff](../../docs/HANDOFF.md) first. This is an unsigned development proof; no full migration or release is approved.

## Tracked inputs and local outputs

- `aux-proof.patch`: original identity patch against upstream `b151276ea2110e74b063c6964bd0a5c14dc42f52`.
- `native/aux_shell_view.{cc,h}`: native shell/tab/bridge/input proof.
- `native/aux_page_material.h`: isolated-world, visual-only toolbar/sidebar page frost.
- `native/aux-host.js`: trusted WebUI bootstrap; rejects unsupported operations instead of substituting mock success.
- `apply-shell-proof.py`: idempotent integration into the already-built pinned checkout. Requires the original completion metadata. It does not check for active incremental builds; the operator must do that first.
- `prepare-shell-assets.mjs`: stages current production renderer and bootstrap with freshness/CSP/hash checks.
- `checkpoints/2026-09-24-upstream.patch`: exact diff of the eight tracked upstream files (identity plus native integration) at the checkpoint. The three new C++ files are separately in `native/` and are not inside that upstream diff.
- `checkpoints/2026-09-24.json`: upstream revision, source hashes, GN arguments and original build measurements. Native C++ files were byte-compared to the built checkout when captured.
- `fixtures/material.html`: controlled live-page blur/input target; not product UI.

Do not apply both patches blindly: the checkpoint patch includes the original identity patch. On the existing Mac, changes are already applied. Use `git diff`/reverse checks and preserve that tree. On a fresh pinned checkout, either use the original identity-build → integration-script sequence, or apply the complete checkpoint diff and copy the three native files before GN generation. Do not copy the bootstrap into Chromium's source resources; staging includes it.

The first-build script writes the original metadata/log and regenerates GN arguments. **Do not rerun it to continue an already completed build.** Use incremental commands below. `watch-build.py` was a one-shot guard for the original build; stale PID files are not proof that a build is running.

## Existing Mac: inspect before changing anything

```sh
export AUX_CHROMIUM_SRC=/Users/rcourson/aux-chromium-proof/chromium/src
export AUX_DEPOT_TOOLS=/Users/rcourson/aux-chromium-proof/depot_tools
export DEVELOPER_DIR=/Applications/Xcode-beta.app/Contents/Developer
export PATH="$AUX_DEPOT_TOOLS:$PATH"
git -C "$AUX_CHROMIUM_SRC" rev-parse HEAD
ps -axo pid,ppid,ni,command | rg 'autoninja|siso|clang|Aux Host Proof'
tail -30 "$AUX_CHROMIUM_SRC/out/AuxProof/aux-shell-build.log"
```

If compilation is active, preserve it and keep native edits in this Aux repository until it completes. Do not start another build. Before relinking, quit only the candidate through its native app menu; keep personal browsers and other apps alone.

## Incremental native build

From the Aux repository, only after the active compile has finished:

```sh
python3 experiments/chromium-fork/apply-shell-proof.py "$AUX_CHROMIUM_SRC"
cd "$AUX_CHROMIUM_SRC"
nohup nice -n 10 /usr/bin/time -l autoninja -C out/AuxProof chrome -j 8 \
  >> out/AuxProof/aux-shell-build.log 2>&1 < /dev/null &
```

The detached process can continue after the agent turn stops. Inspect its exit/build log; launching a process is not a successful build. Do not erase object files or logs to retry. The original GN configuration is component build, release mode, no symbols, `use_lld=false`; it is recorded in the checkpoint manifest. Production build characteristics are not measured by this configuration.

## Stage the real renderer and launch

From the Aux repository:

```sh
pnpm --filter @aux/desktop exec vite build
node experiments/chromium-fork/prepare-shell-assets.mjs
```

Use the **new staging directory printed by that command**, not a temporary path from an older environment. Set `AUX_SHELL_STAGE` to it, then launch after confirming the candidate is not already running:

```sh
export AUX_CANDIDATE_PROFILE="$PWD/release/test-artifacts/chromium-candidate-profile"
open -n -a "$AUX_CHROMIUM_SRC/out/AuxProof/Aux Host Proof.app" --args \
  --user-data-dir="$AUX_CANDIDATE_PROFILE" \
  --remote-debugging-port=0 --no-first-run --no-default-browser-check \
  --use-mock-keychain --password-store=basic \
  --aux-shell-assets="$AUX_SHELL_STAGE" --enable-features=GlassFrame \
  --enable-logging --log-file="$PWD/release/test-artifacts/candidate-shell-continuation.log" \
  about:blank
```

These flags are for the isolated proof only, including mock keychain/basic password storage and debugging. Do not use a personal Profile or treat this launch as secure production packaging. Native glass uses macOS 26+ public AppKit through upstream Chromium's experimental GlassFrame service. Fallbacks/private/popups still need qualification.

Select the already-running app by **name** (`Aux Host Proof`) in computer-use tooling; selecting its full bundle path previously launched an unwanted default-Profile instance. Native C++ changes require restart; candidate React HMR is not established. Electron's Vite development workflow is separate.

For the controlled material page, first check whether port 5199 is already served. If absent, serve only `experiments/chromium-fork/fixtures` with a loopback HTTP server and open `http://127.0.0.1:5199/material.html` in the candidate. The existing mock UI on 5198 is not native evidence.

## Verification order

1. Resolve current CI failures in [the CI checkpoint](../../docs/evidence/ci-handoff-2026-09-24.md), without weakening gates.
2. Reproduce floating sidebar over the material page and compare AX with pixels. An AX node appearing briefly is not success. Trace native edge events, shell pointer/focus/blur and dismissal. Child-view exit handling is corrected but retention still fails; clicking outside intentionally dismisses in `App.tsx`.
3. Verify actual New Tab → live page → New Tab seam-free glass, native input focus and toolbar blur/click routing after relevant changes. Add window, layout, theme, reduced-accessibility and split tests separately.
4. Connect runtime, then execute the complete `tests/host/candidate-shell.mjs` contract. It depends on runtime truth; manual shell checks do not satisfy it.
5. Run candidate extension/API/native-messaging tests from [INTEGRATION.md](INTEGRATION.md), then account/signing/security/performance gates. Preserve earlier Store evidence and requalify after integration changes.

Focused material/bootstrap checks and UI coverage audit are in the handoff. Use one worker while native compilation runs. Do not claim full CI or host completion from them.

## Transfer to another machine

Fetch the Aux branch; provision the pinned Chromium source and dependencies using the platform's supported Chromium toolchain. The original Mac used Xcode 27 beta, 10 CPUs/32 GiB; this is observed build evidence, not a guaranteed minimum specification. This repo contains no object cache or ready-to-run candidate binary. Review the checkpoint patch, copy the native source files, generate GN and build locally. Rebuild/stage renderer assets there; absolute paths and temporary staging directories are machine-specific.

Raw Profiles/cookies, account secrets, generated build outputs and reference-product bundles are deliberately excluded from GitHub. Sanitized result JSON and selected screenshots are committed under `docs/ui/evidence/2026-09-24/host`. Restore required external credentials through approved secret handling; never paste them into docs or PRs.
