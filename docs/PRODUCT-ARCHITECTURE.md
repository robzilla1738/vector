# Vector product architecture

**Decision date:** 19 September 2026
**Status:** authoritative product architecture and release gates

Vector is one browser with two page backends. Chromium provides the compatibility floor. The Vector Engine is a specialized backend that earns traffic through measured task success, safety, and resource advantages. Users interact with one window, one workspace, one profile, one permission model, and one agent contract. Backend choice is visible in the engine badge and `routeReason`.

## Product decision

The desktop shell in `apps/desktop` is the product path. It owns the window and chrome, embeds Chromium pages with `WebContentsView`, and connects to the authoritative runtime in a separate process. `ve-shell` remains the own-engine development shell and evidence harness. This preserves the engine work without making web compatibility a prerequisite for shipping a strong browser.

Auto routing is compatibility-first:

1. Explicit `chrome` and `vector-engine` requests are honored and never silently substituted.
2. `about:` and `data:` documents may use the Vector Engine.
3. Origins in `settings.engineCohorts` or `VECTOR_ENGINE_COHORTS` may use the Vector Engine, with Chromium fallback during open.
4. Every other web page uses Chromium.
5. A mid-program backend change can automatically replay read-only work. A completed or pending write requires re-observation and replanning.

The qualified-cohort rule replaces broad engine-first routing. Cohorts are a release mechanism, not a marketing allowlist: an origin belongs only while current evidence meets the gates below.

## Shared authority

The runtime owns page identity, controller state, effect authorization, execution, observations, and receipts. Browser service calls carry an unpredictable startup token and address a specific page. Human takeover is per page, so interacting with one tab cannot freeze or release another. Chromium human and agent tabs use the same persistent profile, including cookies, storage, cache, service workers, and site permissions.

The browser service must keep these invariants:

- every observe, execute, screenshot, takeover, and resume call includes a page ID;
- a page under human control rejects agent execution from every client;
- service requests without the startup token fail with `permission_denied`;
- DOM postconditions count as observed browser state, not remote business confirmation;
- navigation and destructive operations require explicit grants;
- a backend change never silently retries a possible side effect.

## What creates durable advantage

Vector should invest where owning the stack changes agent outcomes:

- compact semantic observations derived from the rendered document;
- generational references and stale-target failure;
- atomic act-and-observe execution;
- deterministic replay and local operation compilation;
- per-page control ownership with a clear human takeover path;
- evidence-rich receipts that separate dispatch, observation, and remote confirmation;
- process containment for untrusted engine content;
- lower memory and token cost on qualified workloads.

The own engine does not create an advantage when it merely reimplements commodity compatibility. DRM, extension APIs, broad media support, enterprise authentication, accessibility edge cases, and the long tail of CSS/DOM behavior remain Chromium responsibilities until evidence shows the engine is better for a defined cohort.

## Stop-doing rules

- Do not treat roadmap checkmarks, WPT counts, or synthetic benchmark scores as browser readiness.
- Do not route arbitrary HTTP origins to the own engine in Auto mode.
- Do not add compatibility features without a qualified workload that needs them.
- Do not publish speed or token claims from mock models, one trial, developer security mode, or different task loops.
- Do not replay writes across backends.
- Do not maintain separate human and agent cookie jars for ordinary tabs.
- Do not call a DOM condition `remoteConfirmed`.

## Qualification gates

Chromium remains the default until all product gates are measured on release builds. A Vector Engine cohort must meet all cohort gates on at least five trials per task and keep them green continuously.

| Area | Product gate | Engine cohort gate |
|---|---|---|
| Task success | ≥95% verified success on the release suite | no worse than Chromium; lower bound of paired difference ≥-2 points |
| Safety | zero duplicate side effects; zero silent backend changes | same, plus all writes have observed or remote evidence |
| Human quality | daily-driver flows pass: auth, downloads, uploads, print, media, permissions, accessibility, crash recovery | cohort pages have no visible fidelity regression |
| Compatibility | Chromium baseline suite green | `capability_unsupported` <1% and no unsupported critical flow |
| Speed | p95 interaction and task duration recorded | materially faster or cheaper on the cohort |
| Efficiency | process-tree RSS and token use recorded | ≥20% improvement in RSS, tokens, or both without success loss |
| Reliability | restart and restore, offline failure, renderer crash, service restart | 1,000-navigation soak with no monotonic growth |
| Security | production profile, authenticated local IPC, permission audit | process isolation and broker policy verified |

An origin leaves the cohort immediately after a critical regression, repeated fallback, or security failure. The `needs-chromium` table provides a short-lived automatic quarantine; the qualification manifest provides the durable decision.

## Delivery sequence

### Foundation — implemented

- page-addressed browser service operations and per-page takeover;
- authenticated browser service startup and clients;
- compatibility-first Auto routing with explicit cohort configuration;
- read-only cross-backend replay and repair for side effects;
- read-only default permissions and explicit egress/destructive grants;
- honest action receipts;
- one shared Chromium profile for human and agent use;
- persistent, origin-scoped Chromium permission decisions;
- unpacked extension loading from the managed extension directory or `VECTOR_EXTENSION_PATHS`;
- desktop product and packaging commands point at the hybrid shell.

### Daily-driver release gate

- validate signed application packaging, auto-update, keychain-backed secrets, crash recovery, profile migration, downloads, file uploads, printing, password-manager interoperability, media playback, and accessibility;
- qualify extension behavior by API family and show unsupported APIs before install;
- verify Widevine/DRM distribution rights and signed-component delivery; report unavailable content explicitly until that is complete;
- validate the permission management UI against the release permission matrix;
- run a seven-day internal browsing pilot and record failures by workflow.

### Agent release gate

- build a versioned task corpus with independent state oracles, side-effect canaries, and adversarial prompt-injection pages;
- compare Vector, Chromium, and relevant competitor products with the same model, task instructions, trial count, and completion oracle;
- report success, intervention rate, unsafe-action rate, p50/p95 duration, model calls, tokens, and process-tree memory with confidence intervals;
- require re-observation before completion and explicit evidence for remote outcomes;
- add recovery tests for kill-after-dispatch, takeover during dispatch, stale refs, service reconnect, and backend quarantine.

### Engine expansion

- admit only workloads where current evidence shows a product advantage;
- prioritize semantic extraction, large-document handling, deterministic offline workflows, and low-resource background research;
- keep broad consumer browsing, protected media, extension-heavy applications, and unknown origins on Chromium;
- consider removing Chromium only if the own engine passes the full product gates across at least 500 representative sites. There is no scheduled date for that decision.

## Evidence policy

Every published result must include commit, build profile, security profile, OS and hardware, browser/engine version, model version, prompt/tool contract version, task manifest hash, trial count, raw outcomes, scoring code, and failures. Results that omit any field are diagnostic data and cannot support routing or product claims.
