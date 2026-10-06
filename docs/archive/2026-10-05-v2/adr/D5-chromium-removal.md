# ADR: Engine separation — Chromium is the sole web engine (D5)

**Status:** decided, implemented.
**Date:** 2026-09-22

Supersedes the previous version of this ADR, which gated a plan to remove
Chromium in favor of the custom Rust engine. That direction is reversed:
Chromium is the sole web rendering engine in the product.

## Decision

- The custom Rust engine (`engine/`, `ve-shell`, `ve-host`,
  `@vector/engine-native`) is removed from the product path, packaging, and
  routine TypeScript CI. Its full source and history are preserved on the
  `engine-track` branch; engine documentation and evidence remain in git
  history.
- `Backend` is `"vector" | "chrome"`. Both are Chromium; the value records
  the connection kind (embedded vs attached), not a rendering engine.
- The runtime router, `engineMode`/`engineCohorts` settings, mid-program
  cross-backend fallback, engine paint/input surfaces, and engine-specific
  environment variables are removed. There is no fallback to preserve: a
  managed page and an attached page run the same engine.

## Rationale

- Web compatibility is a prerequisite for the product, not a qualification
  gate the engine can earn. The Aux roadmap (docs/AUX-ROADMAP.md) commits to
  keeping the Chromium host.
- A single engine removes the largest source of behavioral divergence
  (two observe/act/capture paths, two ref schemes, two failure modes) and
  the routing/fallback machinery that existed to manage it.

## Consequences

- `pages.open` never routes: omit `backend` for embedded Chromium,
  `backend: "chrome"` adopts an attached tab by `targetId`.
- The packaged application contains no Rust artifacts; TS CI requires no
  Rust toolchain.
- Engine capability claims (semantic refs, native batch execution, software
  PNG capture) are retired from the product surface; observation, programs,
  and capture run through the CDP drivers only.
