# Aux implementation handoff

Updated September 25, 2026. [ROADMAP.md](ROADMAP.md) is the sole active plan; [EVIDENCE.md](EVIDENCE.md) is the current claim ledger. The [pre-reset handoff](archive/2026-09-24-b0-reset/HANDOFF.md), [host comparison](archive/2026-09-24-b0-reset/M1-HOST-COMPARISON.md), and [UI transplant record](archive/2026-09-24-b0-reset/ui/COMPONENT-TRANSPLANT.md) are historical evidence, not current instructions.

## Product and stop line

Aux is becoming a Chromium browser with the existing agent runtime. Preserve Aux's mark, Geist type, liquid glass, and both vertical and horizontal layouts. The Electron app remains a development preview until the fork passes the journeys in B11. The September 25 scope amendment makes a working development build with completed product features/native integration the current handoff. Final DMG, release signing/notarization, full release qualification and takeover packaging are deferred. Keep migration implementation and fixture tests; do not migrate the owner’s real data. Release publishing and real-account tests remain outside current work.

## Current state

- **[Verified]** The stable Chromium 154 component app builds locally. Six native RPC journeys pass, including Find, input, takeover/revocation, parallel tabs and close reconciliation. The native checkout now includes patches 1–46; clean replay evidence remains at patch 36. Independent Work/Personal fixture restarts restore page identity and HttpOnly accounts while cross-Profile access remains denied. Native Open File, PDF export, and rebound shortcut journeys also pass. See [native integration evidence](evidence/native-aux-live-2026-09-25.md).
- **[Partial]** Aux Home and runtime startup work in the native app. Native material settings are wired, but glass quality, complete layout/shortcut/accessibility journeys and remaining host methods are not yet qualified. The official static app and DMG are deferred under the scope amendment.
- **[Verified]** At baseline `4d01370a`, PR #24's seven required checks were red: 16 lint errors, 488 warnings against a 390 limit, and missing jsdom types. See [CI checkpoint](evidence/ci-handoff-2026-09-24.md). Recheck the exact integration SHA before claiming green.
- **[Verified]** The Electron runtime has durable write intent, scoped grants, controller epochs, takeover, and protected observation. Electron results do not qualify the Chromium host.

## Continue

Execute the waves and B0–B12 acceptance checks in [the roadmap](ROADMAP.md), updating [the evidence ledger](EVIDENCE.md) after each batch. Continue from the working native component app: finish live shell/platform integration, qualify native migration and feature gates, and deliver the working development build. Defer release-only B11/B12 deliverables under the current scope amendment. Run builds/tests locally; notify the owner before using a Linux VM. Do not enable paid Actions billing. Use [the native runbook](../experiments/chromium-fork/CONTINUATION.md) for the existing checkout and build commands. One native build runs at a time. Reference captures stay local under `release/test-artifacts/reference-captures/`; checked-in specs and literal transfers follow [provenance rules](reference-specs/PROVENANCE.md).

All AI Gateway runs use fixture content, `meta/muse-spark-1.3-contributor`, and the cumulative $50 program cap. Never print credentials or commit Profiles, build caches, raw reference captures, or personal-data logs. The measured spend and remaining allocation belong in [EVIDENCE.md](EVIDENCE.md); unknown spend is a gate to reconcile before further runs.
