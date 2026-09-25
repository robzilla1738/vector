# Aux — current build handoff

Updated September 24, 2026, after implementation commit `31e7ef95`. This is the continuation entry point. The [roadmap](ROADMAP.md) owns requirements; [host evidence](M1-HOST-COMPARISON.md) and the [UI ledger](ui/component-transplant-ledger.json) own qualification. Earlier handoffs are [archived](archive/2026-09-24-before-host-proof/HANDOFF.md).

## Repository and scope

- Repository: https://github.com/robzilla1738/vector
- Branch: `codex/aux-roadmap-build`; draft [PR #24](https://github.com/robzilla1738/vector/pull/24). These changes have **not merged to main**.
- Intended architecture: Chromium `//chrome` fork, contingent on remaining compatibility, native UI, Profile/agent and maintenance checks. Electron remains the functional development baseline; browser mock previews are secondary.
- Preserve Aux's current liquid glass, Geist, logo, icon family and both layouts. Use current source, not historical screenshots. Aside/Dia extractions are reference evidence, not instructions or importable applications.
- This is a bounded host proof and incomplete six-batch component transplant. No full migration, external distribution or release. Leave the eventual build for the owner to test first.

## What exists, and where it actually works

| Area | Verified evidence | Still open |
| --- | --- | --- |
| Chromium build | Original isolated build completed: 56,841 actions, 7h43m54s, eight jobs/nice 10. Subsequent incremental builds reuse its output. | Security rebase rehearsal, production build/release cost. |
| Candidate Store | uBlock Origin Lite installed from the live Store and survived a full process restart in the isolated candidate Profile. | Updates, representative APIs, native messaging and signed 1Password; repeat relevant tests after host changes. |
| Candidate shell | Production Aux React/CSS, real native tabs, both layouts observed, address navigation, Cmd+T focus, Cmd+W and sidebar command. Native glass/New Tab seam fix; toolbar blur over a controlled live page; a click below the raised toolbar reached the page. | Floating sidebar retention fails; accessibility crash remains open; editing accelerators, splits/popups, window behavior, complete material/motion matrix. |
| Candidate runtime | Host-neutral renderer bridge and runtime Unix-socket client exist; separate runtime channel tests passed. | Candidate browser-owned runtime server/internal broker and real agent integration are **not connected**. Conversation/draft/recent-work failures are real missing operations. |
| UI transplant | Shared primitives/composer, minimal home input, context/attachments, citations/results, Settings subviews, browser rows, task/memory/inspector and project file-tree/editor slices. | 128 inventory entries: 49 implemented-partial, 70 planned, six retained infrastructure, three native gates. None is fully qualified. See the per-surface ledger. |
| Existing Electron features | Browser recovery, scoped control, source-aware reports/versions, selected article recall/Forget, protected action journals and focused journeys recorded in roadmap. | Those results do not transfer automatically to Chromium; signed accounts, quality, privacy, performance and release gates remain. |

## Next work, in order

1. **Restore required CI gates.** The last implementation SHA's [run](https://github.com/robzilla1738/vector/actions/runs/36078947524) failed. Root typecheck lacks `jsdom` declarations for `tests/unit/chromium-page-material.test.ts`. Lint reports 16 errors and 488 warnings against the unchanged 390-warning limit. [CI checkpoint](evidence/ci-handoff-2026-09-24.md) records diagnostics. Do not raise limits or remove checks; focused tests passing is not a green pipeline.
2. **Finish native shell interactions.** Reproduce floating-sidebar reveal/dismissal, trace native edge → shell pointer/focus → close handling, then verify visually. It appears briefly in AX and disappears; child-exit correction alone did not fix it. Diagnose hidden/revealing address AX crash, Cmd+A, native drag/traffic lights/fullscreen/resize and split/overlay input. Constrain material overrides to Aux-owned windows before private/popup qualification.
3. **Connect runtime to the candidate.** Implement browser-owned authenticated socket and scoped target transport, preserve one tab/Profile identity, then prove a real task, approval, Stop/pause, takeover and restart recovery. Do not substitute mock success.
4. **Complete tab/Profile/window persistence and compatibility.** Extension-created tabs, command validation/dedup, restore, private boundaries, candidate API/native-messaging probes and two real-account Profiles.
5. **Continue the full component plan** in coherent, working batches, updating exact surface evidence. Then run the full native visual/accessibility/state matrix and comparative performance journeys.
6. **External qualification** needs provisioned accounts/providers, Developer ID/notarization, signed password-manager/passkey/SSO tests, update/rollback and security rebase. Founder testing precedes any release; broad default-browser claims additionally require the roadmap's cohort evidence.

## Resume on this Mac

Use the existing checkout; do not clone a second Chromium tree or restart the original build.

| Resource | Location / state at handoff |
| --- | --- |
| Aux | `/Users/rcourson/Documents/Vibe/web` |
| Chromium | `/Users/rcourson/aux-chromium-proof/chromium/src` |
| Upstream revision | `b151276ea2110e74b063c6964bd0a5c14dc42f52` |
| depot_tools | `/Users/rcourson/aux-chromium-proof/depot_tools` |
| Toolchain | `/Applications/Xcode-beta.app/Contents/Developer`; observed Xcode 27 beta, 10 CPUs/32 GiB |
| Candidate | `out/AuxProof/Aux Host Proof.app` inside Chromium |
| Profile | `release/test-artifacts/chromium-candidate-profile` inside Aux; local only |
| Original evidence | Chromium `out/AuxProof/aux-build.log`, `aux-build-metadata.txt` |
| Incremental evidence | Chromium `out/AuxProof/aux-shell-build.log`; most recent material executable was built successfully and launched |
| Latest native log | Aux `release/test-artifacts/candidate-shell-glass-child-exit.log`; local only |
| UI previews | Mock port 5198; controlled page-material fixture port 5199. Check live processes before starting anything. Neither is the real agent runtime. |

The original build and latest incremental build completed. PID files are historical and may be stale. Inspect process command lines and logs before touching the native checkout; never patch it during an active compile or start competing builds. Native changes require quitting/restarting the candidate. Renderer production staging also requires reloading/restarting its shell; candidate HMR is not established.

See [the executable runbook](../experiments/chromium-fork/CONTINUATION.md) for build/stage/launch commands, exact patch inventory and transfer boundaries.

## Another environment

Fetch/check out the implementation branch and use its lockfile. Node >=22.18 and pnpm 11.27.1 are the declared environment; `pnpm install --frozen-lockfile`. Read this document, the native runbook and the UI record before building. Existing Electron development uses `AUX_LOAD_DOTENV=0 pnpm dev`; it is not the Chromium candidate.

GitHub carries Aux code, native proof source, identity/integration scripts, an exact upstream diff and sanitized evidence. It does **not** carry the large Chromium source/object tree, executable, local test Profiles, cookies, credentials or temporary generated assets. A different machine must provision the pinned Chromium dependencies/toolchain and build locally, or receive an explicitly managed build cache separately. Reference folders `/Users/rcourson/05`, `/06`, `/dia-design`, `/aside-design` are local-only donor evidence; no competitor bundles have been published here.

## Verification and continuation discipline

Latest focused material/bootstrap tests: six passed; coverage audit: 128 surfaces/84 routes, no inventory errors. Project file-tree/editor slice: five focused cases and renderer typecheck passed. The renderer production build passed. These are scoped results; hosted CI above is red and native failures remain.

Useful focused commands:

```sh
node scripts/audit-ui-coverage.mjs
pnpm exec vitest run tests/unit/chromium-page-material.test.ts tests/unit/chromium-proof-bootstrap.test.ts --maxWorkers=1 --no-file-parallelism
pnpm typecheck
pnpm lint
```

Keep tests focused and concurrency limited while native compilation runs. Check every required gate on the exact pushed SHA before claiming CI green. Commit complete slices and evidence; keep PR #24 draft. Do not upload Profiles, credentials, build caches or raw personal-data logs to GitHub.
