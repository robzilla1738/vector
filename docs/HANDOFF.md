# Aux development handoff

Updated September 25, 2026. [ROADMAP.md](ROADMAP.md) is the active product plan; its September 25 scope amendment governs the current work. [EVIDENCE.md](EVIDENCE.md) is the claim ledger, and the [dated native log](evidence/native-aux-live-2026-09-25.md) contains the detailed observations. Earlier rows in those files describe the state at their named commits, not the present app.

## Current goal and boundary

Deliver a **working native Chromium development build** with the roadmap's product features and native integration, preserving Aux branding, liquid glass, and both horizontal and vertical Aside layouts. Implement and test migration with fixtures; **do not migrate the owner's real data**. Final DMG, release signing/notarization, full release qualification, and the takeover package are deferred. The current build is a development checkpoint, **not** a completed product handoff or release.

Build and test locally on this Mac. Do not enable paid GitHub Actions billing. Tell the owner before using a Linux VM. No Linux VM or paid Actions run was used for this checkpoint. Keep AI Gateway fixture-only, on `meta/muse-spark-1.3-contributor` and within the $50 cumulative cap; reconcile the spend ledger before another model run.

## Exact working state

- Repository: `robzilla1738/vector`, private; branch `codex/aux-roadmap-build`, last code checkpoint `d0dba3c9` before this documentation update. PR [#24](https://github.com/robzilla1738/vector/pull/24) is open. Read the remote and check status at the exact pushed head; no green CI claim is made here.
- Native source: Chromium `154.0.8037.58` in `/Users/rcourson/aux-chromium-stable/chromium/src`, with ordered Aux patches **0001–0046** from [patches/series](../chromium/patches/series). This checkout is intentionally modified by those patches. Clean full-series replay is recorded through 0036; later patches have incremental application/build evidence, not a fresh full replay claim.
- Development app: `/Users/rcourson/aux-chromium-stable/chromium/src/out/AuxDev/Aux.app`. The latest native build passed after patch 0046. It contains the bundled Aux Runtime and staged `chrome://aux/` shell. The separate official static build was stopped safely and its cache preserved.
- Native journeys that passed: six core runtime RPC journeys; two disposable Profile restart/isolation fixture journeys; Aux Home, live page navigation, native Find and page zoom; print preview and DevTools; Open File; PDF save/cancel; page-focused default shortcuts; a user-rebound Command Palette shortcut, subsequently reset. These are scoped results, not full feature coverage.
- Visual state: the owner confirmed the corrected right-only assistant corners. Docked glass uses the common native window material/tint; narrow floating left and right panels now share the same tint and blur tokens. Perceptual blur across displays, widths and Reduce Transparency still needs live inspection. Screenshots alone do not establish native glass quality.
- Known unfinished integration: Quick Ask and the native Profiles management screen are still feature-gated; many bridge methods, agent/product surfaces, extension/passkey/import flows, both-layout accessibility and complete visual journeys remain. Do not switch their gates on to conceal missing native services. The earlier Profiles experiment was removed before staging.

## Continue from here

1. Use the [current native runbook](../experiments/chromium-fork/CONTINUATION.md). Preserve the existing checkout and build cache; run only one native build at a time.
2. Complete missing Chromium bridge services and their live Aux journeys, starting with feature-gated product surfaces. Keep Profile/window identity and trusted WebUI authorization in the browser process. Recheck the two Aside layouts and material after changes that affect them.
3. Run relevant local typecheck, lint, focused tests, shell budget, native build and fixture journeys after each integrated batch. Update [EVIDENCE.md](EVIDENCE.md) with the exact commit and remaining failure. Avoid rerunning unrelated checks that already passed.
4. Keep [migration](ELECTRON_MIGRATION.md) on disposable copies and fixtures. Do not use the owner's real Profile as a destination.
5. Keep the branch and PR #24 in sync after reviewed work. GitHub-hosted checks are not necessary to use the local development build; the required `CI passed` check **is** necessary for a normal protected-main merge. The prior hosted run was blocked by GitHub billing before jobs started. Do not enable billing or claim a green check from an older SHA.

The [historical host comparison](archive/2026-09-24-b0-reset/M1-HOST-COMPARISON.md), [UI transplant record](archive/2026-09-24-b0-reset/ui/COMPONENT-TRANSPLANT.md), and [original candidate proof](../experiments/chromium-fork/INTEGRATION.md) remain useful background, not instructions for the current AuxDev checkout. Never commit Profiles, credentials, build caches, raw reference captures or personal-data logs.
