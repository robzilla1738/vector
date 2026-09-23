# Aux product architecture

> Implementation direction is maintained in [Aux roadmap](ROADMAP.md).
> This document describes the existing architecture and release gates; its
> implemented labels are not evidence that the complete Aux product is ready.

**Decision date:** 19 September 2026, revised 22 September 2026
**Status:** authoritative product architecture and release gates

Aux is one browser on one rendering engine. Chromium is the sole web engine —
embedded in the desktop shell as `WebContentsView` pages, headless in
standalone mode, or attached as the user's Chrome over CDP. Users interact
with one window, one workspace, one profile, one permission model, and one
agent contract. The custom Rust engine is preserved on the `engine-track`
branch and is not part of the product path, packaging, or routine CI.

## Product decision

The desktop shell in `apps/desktop` is the product path. It owns the window
and chrome, embeds Chromium pages with `WebContentsView`, and connects to the
authoritative runtime in a separate process.

Backend selection is a connection kind, not an engine choice:

1. `aux` is the default embedded Chromium session; an open without a
   `backend` lands there (`routeReason: "chromium-default"`).
2. `chrome` adopts a tab from a Chrome instance attached over CDP; borrowed
   tabs are detached rather than closed.
3. No routing layer sits between the two: connection kind is explicit and
   never silently substituted.

## Shared authority

The runtime owns page identity, controller state, effect authorization,
execution, observations, and receipts. Human takeover is per page, so
interacting with one tab cannot freeze or release another. Human and agent
tabs use the same persistent profile, including cookies, storage, cache,
service workers, and site permissions.

The runtime keeps these invariants:

- every observe, execute, screenshot, takeover, and resume call includes a
  page ID;
- a page under human control rejects agent execution from every client;
- loopback requests without the bearer token fail with `permission_denied`;
- DOM postconditions count as observed browser state, not remote business
  confirmation;
- navigation and destructive operations require explicit grants.

## What creates durable advantage

Aux should invest where owning the stack changes agent outcomes:

- compact semantic observations derived from the rendered document;
- generational references and stale-target failure;
- atomic act-and-observe execution;
- deterministic replay and local operation compilation;
- per-page control ownership with a clear human takeover path;
- evidence-rich receipts that separate dispatch, observation, and remote
  confirmation;
- lower token cost on agent workloads.

## Stop-doing rules

- Do not treat roadmap checkmarks, WPT counts, or synthetic benchmark scores
  as browser readiness.
- Do not publish speed or token claims from mock models, one trial, or
  different task loops.
- Do not maintain separate human and agent cookie jars for ordinary tabs.
- Do not call a DOM condition `remoteConfirmed`.

## Qualification gates

A release must meet all product gates on release builds.

| Area | Product gate |
|---|---|
| Task success | ≥95% verified success on the release suite |
| Safety | zero duplicate side effects; all writes have observed or remote evidence |
| Human quality | daily-driver flows pass: auth, downloads, uploads, print, media, permissions, accessibility, crash recovery |
| Compatibility | Chromium baseline suite green |
| Speed | p95 interaction and task duration recorded |
| Efficiency | process-tree RSS and token use recorded |
| Reliability | restart and restore, offline failure, renderer crash, service restart |
| Security | authenticated local IPC, permission audit |

## Delivery sequence

### Foundation — implemented

- page-addressed browser operations and per-page takeover;
- authenticated loopback API and clients;
- read-only default permissions and explicit egress/destructive grants;
- honest action receipts;
- one shared Chromium profile for human and agent use;
- persistent, origin-scoped Chromium permission decisions;
- unpacked extension loading from the managed extension directory or
  `AUX_EXTENSION_PATHS`;
- desktop product and packaging commands point at the shell.

### Daily-driver release gate

- validate signed application packaging, auto-update, keychain-backed
  secrets, crash recovery, profile migration, downloads, file uploads,
  printing, password-manager interoperability, media playback, and
  accessibility;
- qualify extension behavior by API family and show unsupported APIs before
  install;
- verify Widevine/DRM distribution rights and signed-component delivery;
  report unavailable content explicitly until that is complete;
- validate the permission management UI against the release permission
  matrix;
- run a seven-day internal browsing pilot and record failures by workflow.

### Agent release gate

- build a versioned task corpus with independent state oracles, side-effect
  canaries, and adversarial prompt-injection pages;
- compare Aux and relevant competitor products with the same model, task
  instructions, trial count, and completion oracle;
- report success, intervention rate, unsafe-action rate, p50/p95 duration,
  model calls, tokens, and process-tree memory with confidence intervals;
- require re-observation before completion and explicit evidence for remote
  outcomes;
- add recovery tests for kill-after-dispatch, takeover during dispatch,
  stale refs, and service reconnect.

## Evidence policy

Every published result must include commit, build profile, OS and hardware,
Chromium version, model version, prompt/tool contract version, task manifest
hash, trial count, raw outcomes, scoring code, and failures. Results that
omit any field are diagnostic data and cannot support product claims.
