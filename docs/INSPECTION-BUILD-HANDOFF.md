# Aux inspection build — 2026-10-05

Aux is open locally at `/Users/rcourson/aux-chromium-stable/chromium/src/out/AuxDev/Aux.app`.
The user is inspecting the New chat surface. Keep the existing original preview owner; do not relaunch, clear its native slot, or signal unrelated processes.

## Delivered batch

- Page-free chat home and optional context, retaining Aux name and logo.
- Command surface scope filtering and qualified routine gating.
- Split drag survives ordinary title/loading/visibility updates while real owner/document/permission changes still cancel it.
- Native mailbox first-presentation readiness preserves the original deadline and owner guards.
- Fixed the native `FrameTimingDetails` class declaration compilation failure (canonical patch 0380).
- Renderer remains within strict startup, CSS, and total JavaScript budgets. No new features were added during delivery mode.

## Current build and evidence

- Integrated source branch: `codex/sidebar-selection-next`, product integration commit `cf88bf3d0`.
- Built product identity: `eda022bb8e19ec59d473c4438fb5f625b13c6034`, filtered tree `990ffe76ff298e1d96d1417f9516837bf18363be`, clean.
- Native cached build passed. Matching native/runtime/helper pair: `/private/tmp/aux-browser-runtime-builder-native352-source-001/release/test-artifacts/builder-native352-eda022bb-runtime-helper-target27-001/pair-proof.json`.
- Current focused ownership, permission, mailbox, generation, and acknowledgement controls passed: `/private/tmp/aux-builder-native352-preparation-001/NATIVE352-RELEVANT17-TERMINAL-001.json`.
- Strict renderer budgets: startup JS 500637/501760 bytes; CSS 179504/184320; total JS 1842978/1843200. Source gates retained from the integrated batch; no repeat after the native-only declaration fix.
- All work stayed local. No GitHub Actions, push, signing, or release was performed.

## Inspection limits and remaining work

This is an inspection preview, not full roadmap or release qualification. A fresh disposable Profile uses a synthetic loopback model (`fixture-model`), confirmed configured in the actual runtime. No external model provider was qualified.

The user owns resize testing. Historical full qualification remains 541 successes and one viewport failure; full542Passed and safetyPassed remain false. Do not relabel that result. The five current functional journeys and exhaustive performance/visual matrices are deferred, as requested.

Preview supervisor PTY session 73508 / original Node owner 62055 / original App 62086. Fresh root: `/tmp/aux-native-journey-mOKiMu`. Root dismissed setup through the actual UI; the user then opened New chat. The existing supervisor has a test-harness nested native-slot acquisition wait in setup AX creation. This is separate from the product: the App is visible and the local model is configured. Preserve original cleanup ownership; no forced slot release. A successor launcher must establish the existing native-slot token before nested AX acquisition, following `run-journey.mjs`. Do not run more tests while the user inspects.

Historical Native351 compilation failure and Native352 prewrite staging input failures remain retained in their original output directories. No further product build is required for the current preview.
