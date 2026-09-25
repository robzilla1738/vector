# Aux implementation handoff

Updated September 24, 2026. [ROADMAP.md](ROADMAP.md) is the sole active plan; [EVIDENCE.md](EVIDENCE.md) is the current claim ledger. The [pre-reset handoff](archive/2026-09-24-b0-reset/HANDOFF.md), [host comparison](archive/2026-09-24-b0-reset/M1-HOST-COMPARISON.md), and [UI transplant record](archive/2026-09-24-b0-reset/ui/COMPONENT-TRANSPLANT.md) are historical evidence, not current instructions.

## Product and stop line

Aux is becoming a Chromium browser with the existing agent runtime. Preserve Aux's mark, Geist type, liquid glass, and both vertical and horizontal layouts. The Electron app remains a development preview until the fork passes the journeys in B11. Build and qualify an ad-hoc-signed app and DMG; stop before Developer ID signing, notarization submission, production feed hosting, real-account tests, or publication. The owner supplies Team ID, stable-signature checks, 1Password account, passkey entitlement, and release decision after B12.

## Current state

- **[Verified]** The proof fork built from Chromium trunk, and a Store extension survived candidate restart. The React shell ran over real native tabs. See [host evidence](archive/2026-09-24-b0-reset/M1-HOST-COMPARISON.md).
- **[Partial]** Native shell composition and input work in limited journeys. Floating-sidebar retention, accessibility crash, native window behavior, Profile mapping, and runtime connection remain open.
- **[Verified]** At baseline `4d01370a`, PR #24's seven required checks were red: 16 lint errors, 488 warnings against a 390 limit, and missing jsdom types. See [CI checkpoint](evidence/ci-handoff-2026-09-24.md). Recheck the exact integration SHA before claiming green.
- **[Verified]** The Electron runtime has durable write intent, scoped grants, controller epochs, takeover, and protected observation. Electron results do not qualify the Chromium host.

## Continue

Execute the waves and B0–B12 acceptance checks in [the roadmap](ROADMAP.md), updating [the evidence ledger](EVIDENCE.md) after each batch. Start with B0 CI, feature registry, model and spend gates, then B1 stable Chromium base and B2 Webium decision. Use [the native runbook](../experiments/chromium-fork/CONTINUATION.md) for the existing checkout and build commands. One native build runs at a time. Reference captures stay local under `release/test-artifacts/reference-captures/`; checked-in specs and literal transfers follow [provenance rules](reference-specs/PROVENANCE.md).

All AI Gateway runs use fixture content, `meta/muse-spark-1.3-contributor`, and the cumulative $50 program cap. Never print credentials or commit Profiles, build caches, raw reference captures, or personal-data logs. The measured spend and remaining allocation belong in [EVIDENCE.md](EVIDENCE.md); unknown spend is a gate to reconcile before further runs.
