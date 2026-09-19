# Vector: independent, AI-native browser engine roadmap

> **Superseded by [docs/ROADMAP.md](docs/ROADMAP.md).** Ticket evidence (VEC-001–025) below remains historical. Do not schedule new work from this status block.

## Review baseline and status

Repository: https://github.com/robzilla1738/vector

Landed revision: GitHub `main` (PR #9). Ticket evidence:
`docs/engine/evidence/` and `docs/engine/architecture.md` §0.

Latest measured tree (2026-09-18 Mac): `testharness.txt` 114 files;
official `html/dom/partial-updates` 28 PASS / 2 FAIL of 30 on pin
`7c204383`; combined tree-family run 142 PASS / 2 FAIL of 144
(`wpt-partial-updates-latest.json`). Full official `html/dom` tree remains
302 PASS / 29 FAIL in `wpt-tree-latest.json` (not a Mac re-score of the
whole family). Official `html/dom/idlharness.https.html` PASS.
`describe()`: `serviceWorkers:true`, `webgl:false`, `webgpu:false`. ve-vm
is research (V8 is production). Kept official partial-updates FAILs:
`sanitize-template-element`, `template-for-empty`. Other still-open
official `html/dom` FAILs include
`aria-attribute-reflection-enumerated.tentative.html`.
`remove-element-unblocks-rendering.optional.html` PASSed on the review
rerun (see `behavior-results.json`).

## Objective

Build an independent web engine that provides standards-correct page execution, a real native visual browser, and a privileged, observable, policy-constrained agent execution system. Optimize verified task completion and resource consumption, not incomplete page processing or isolated synthetic operations.

An independent browser engine does not require independent implementations of cryptography, Unicode, font shaping, image codecs, or the JavaScript VM. Keep well-maintained components where they do not dictate Vector's page model or product architecture. Initially retain V8 behind a deliberately narrow embedding boundary; optional VM research must not block web-platform correctness.

## Non-negotiable invariants

1. Engine-only mode never starts or silently substitutes Chromium.
2. Host/sandbox initialization failures are fatal in the production profile.
3. A compromised renderer cannot choose its security identity or bypass the privileged network/storage policy.
4. Page content, screenshots, tool descriptions, and model output are data—not authority.
5. No stale reference may resolve to a different live object after slot reuse or navigation.
6. Input and agent actions use the same standards-correct event/default-action machinery.
7. Agent observations, accessibility, hit testing, and visual output derive from compatible versions of authoritative page state.
8. An uncertain external write is not automatically retried or represented as rolled back.
9. User takeover stops further agent dispatch until explicit resumption; already-dispatched effects are reported honestly.
10. A supported feature is supported by behavioral evidence, not merely an exposed constructor or passing toy fixture.
11. Optimization preserves observable behavior. No skipping arbitrary scripts, fabricating layout, or accelerating the live clock to improve scores.
12. Performance results identify the actual backend, security mode, features, hardware, benchmark revision, failures, and exclusions.

## Target architecture

```text
Native desktop UI / CLI / MCP / WebDriver BiDi
                       |
          Privileged browser coordinator
     profiles, permissions, scheduling, action journal
             /                    \
  Agent planning service       Browser services
  untrusted proposals          network / storage / secrets
             \                    /
             validated, bounded IPC
                       |
       Sandboxed web-content processes
     ownership follows browsing/agent-cluster rules
  HTML + DOM + JS realms + event loop + CSS + layout
         /                |                \
 versioned semantic   display lists     accessibility
 query projection          |           platform bridge
                      isolated GPU /
                      codec services
                           |
                      native surface
```

Use actor-owned mutable web state and immutable published snapshots where useful. Do not turn the DOM into a globally immutable database at the cost of synchronous JavaScript semantics. Preserve required same-origin synchronous interactions; isolation placement must follow browser semantics, not an arbitrary process-per-element or process-per-tab rule.

Headless operation can omit unnecessary rasterization, but not layout, font metrics, lifecycle processing, input behavior, or other effects observable to scripts and tasks. A screenshot path is separate from direct interactive presentation; do not require GPU-to-CPU readback and PNG encoding for every displayed frame.

## Evidence driving priority

Pinned source root for the paths below:
https://github.com/robzilla1738/vector/tree/d9c212c0b558a8163eba713823c8735d9edb2e6b

| Finding | Evidence | Implication |
|---|---|---|
| Engine-only routing selects the Chromium backend when the addon is absent | `apps/runtime/src/services/router.ts`, `decide()` | Correctness of product identity and benchmark classification |
| Process startup may silently fall back to a thread in the host | `engine/crates/ve-napi/src/host.rs`, `Host::spawn`; `isolate.rs`, `try_spawn` | Production isolation must not depend on an optional binary being discovered |
| Sandbox application errors are logged but execution continues | `engine/crates/ve-host/src/main.rs` | Fail closed before any untrusted page is processed |
| Broker forwards transport requests and ignores the job context | `engine/crates/ve-net/src/broker.rs`; `engine/crates/ve-napi/src/isolate.rs` | Authoritative origin, egress, and credential policy must live outside the renderer |
| Several web interfaces expose placeholder behavior | `engine/crates/ve-agent/src/dom_prelude.js` | Replace advertised-but-incorrect behavior with tested implementation and truthful feature detection |
| Geometry harness is not a full WPT implementation | `engine/tools/wpt-runner/src/main.rs` | Separate geometry regression scores from upstream conformance reporting |
| GPU scene construction drops text and image items | `engine/crates/ve-gfx/src/vello_backend.rs`, `build_scene` | Native presentation needs real text/image rendering before speed claims |
| GPU output currently follows offscreen readback | same file, `render_scene` | Add a persistent direct-presentation path, keeping readback for capture/tests |
| Native Buffer response is converted to UTF-8 and JSON-parsed | `packages/browser-driver/src/vector-engine.ts` | A Buffer transport is not an end-to-end zero-copy typed protocol |
| Native pages are headless while desktop page views use Chromium | `README.md` | A native custom-engine view is an explicit product milestone |
| Runtime journal is not a fully checkpointed resumable agent loop | `docs/architecture.md` | Recovery requires durable coordinator state and external-effect reconciliation |

The reviewed engine workflow run was `35042063266`; runtime workflow run `35042063292` succeeded. Two inspected engine failures were a denied Clippy lint in `ve-net/src/http3.rs` and missing documentation errors in `ve-napi/src/lib.rs`. Many downstream test steps were skipped. This does not establish that those tests themselves fail.

## Delivery sequence

Milestones are gated by evidence rather than calendar estimates. Once shared contracts are fixed, multiple workstreams can proceed concurrently. The ordering is a dependency graph, not a request for one developer to work sequentially.

### M0 — Trustworthy baseline and containment

Deliver strict engine identity, production fail-closed execution, an authoritative broker, required build/test coverage, and truthful capability reporting.

Exit: packaged artifacts launch the real native engine; absent/failed sandbox hosts cannot cause a downgrade; malicious IPC cannot escape context policy; every required CI job actually runs; benchmark records assert backend and security mode.

### M1 — Correct web execution for complete task families

Deliver the event loop and binding semantics, real asynchronous fetch and bodies, forms/navigation, frames/origins/storage, and complete dynamic application workflows. Prioritize features by minimized failures from held-out tasks, not by API-name count.

Exit: selected, published upstream suites pass under an explicit support manifest; realistic application tasks pass on independently scored state; no silent fallback or API stubs are counted as success. Expand coverage continuously rather than claiming whole-web support from a small suite.

### M2 — A real native visual browser

Deliver full text/image painting, coherent layout and hit testing, direct GPU presentation, native input/accessibility, and the user's live view of the same custom-engine page the agent controls.

Exit: native-only installation without Electron/Chromium page rendering; visual reftests with real fonts; human/agent handoff; responsive interaction under agent load; accurate disclosure of unsupported media and graphics features.

### M3 — Engine-native agent advantage

Deliver dependency-aware semantic queries, compact deltas, action preconditions/receipts, resumable orchestration, bounded program compilation, and safe skill reuse.

Exit: held-out tasks demonstrate equal-or-better success and safety with fewer model turns/tokens and lower tail latency than the controlled baseline. Security and compatibility behavior remain unchanged.

### M4 — Performance and scale leadership

Deliver critical-path optimization, asynchronous resource loading, incremental rendering and semantics, efficient IPC, memory control, profile isolation, and fair scheduling.

Exit: independently reproducible results across cold/warm, interactive/headless, single-session/concurrent workloads; complete process-tree memory and energy accounting; no omitted features or security downgrades hidden in the result.

### M5 — Research that compounds the architecture

Explore hermetic replay, safe speculative planning, task-specific compiled skills, privacy-preserving local models, and optional custom-VM research. Promote experiments only when they improve held-out outcomes without weakening invariants.

## Implementation work packages

Each package must include its source changes, independent tests, failure cases, traces, and a short evidence report. These are proposed tickets, not claims that the repository currently contains the proposed modules.

### VEC-001 — Strict engine identity and packaging [M0]

**Start in:** router, engine-native loader, packaging scripts, runtime health.

Return a typed backend-unavailable error when strict native mode cannot run. Publish backend/build/security identity on sessions and traces. Package the native host and addon together with a protocol version handshake.

**Acceptance:** missing addon, missing host, wrong protocol version, and sandbox failure cannot start Chromium or run untrusted content in-process. Explicit hybrid mode remains separately labeled. A benchmark fails immediately if actual identity differs from requested identity.

### VEC-002 — Production containment contract [M0]

**Start in:** `ve-host/main.rs`, `sandbox.rs`, `ve-napi/host.rs`, `isolate.rs`.

Separate trusted-fixture developer execution from production profiles. Abort production startup on missing protections. Restrict filesystem access, inherited descriptors, environment secrets, process creation, and kernel surface according to a documented platform threat model. Do not treat a socket syscall denylist as a complete sandbox.

**Acceptance:** negative tests cover forbidden file reads, network creation, child-process attempts, malformed IPC, oversized messages, resource exhaustion, and host termination. Unsupported platforms fail closed or are explicitly non-production. Review the syscall architecture check and executable-memory policy.

### VEC-003 — Authoritative network and storage broker [M0]

**Start in:** `ve-net/broker.rs`, network policy, cookie/storage ownership, process IPC.

Assign context/frame identity from the trusted channel. Enforce URL scheme, destination, redirect, resolved address, credentials, and storage partition policy in the privileged service. Revalidate each redirect and actual connection destination. Distinguish browser-origin rules from additional agent egress permissions.

**Acceptance:** tests for forged identities, cross-profile cookies, denied schemes, redirects into prohibited networks, DNS rebinding scenarios, credential stripping, and private-network consent. Page-controlled messages cannot declare themselves privileged. Local fixtures receive explicit local-network permission rather than a global permissive default.

### VEC-004 — Build and test evidence [M0]

**Start in:** GitHub workflows, toolchain and dependency pinning, release packaging.

Repair inspected lint/documentation blockers. Make test execution independently visible instead of universally downstream of lint. Run integration checks when runtime, contracts, drivers, packaging, or engine boundaries change. Add actual production-feature and sandbox-host configurations.

**Acceptance:** required checks include native addon plus host, native-only smoke tasks, supported platform builds, negative containment tests, and fallback-disabled task tests. Missing binaries cannot turn required tests into green skips. Pin WPT/toolchain revisions and update through explicit jobs.

### VEC-005 — Capability evidence ledger [M0/M1]

**Start in:** web API registration, driver capability reporting, docs.

For every exposed feature record implemented behavior, known gaps, test suites, owners, and failure diagnostics. Stop adding success-shaped stubs. Feature detection must follow platform semantics, not unconditional true/false shortcuts.

**Acceptance:** `CSS.supports`, `matchMedia`, `fetch` body readers, custom-element readiness, observers, and WebSocket lifecycle each receive focused tests. Unsupported optional features are not falsely advertised. A diagnostic records the precise unsupported operation and engine version.

### VEC-006 — Real WPT execution and reporting [M0/M1]

**Start in:** `engine/tools/wpt-runner`, automation adapter, CI.

Keep the existing geometry runner as a named regression tool. Add upstream-compatible testharness execution, IDL tests, reference screenshots, the WPT server environment, font loading, test timeouts, and expected-failure metadata. Publish both tested-subset and overall manifest counts.

**Acceptance:** distinguish pass/fail/timeout/crash/not-run/skip. Pixel tests include images, text, clipping, opacity and painting, not only box signatures. Tests requiring script setup actually execute it. Supported-suite regressions block merge.

### VEC-007 — Browser event loop and resource lifecycle [M1]

**Start in:** `ve-agent`, script host, resource loader.

Implement task sources, microtask checkpoints, rendering opportunities, parser/script ordering, modules, timers, cancellation, and lifecycle transitions according to the relevant standards. Keep deterministic virtual-time operation as an explicit testing mode.

**Acceptance:** event-order traces agree with required semantics for async/defer/modules, Promise reactions, mutations, frame callbacks, network completion, navigation and abort. A busy or stalled page cannot prevent other independent browsing agents from progressing.

### VEC-008 — Web IDL bindings and JS/DOM object lifetime [M1]

**Start in:** `dom_prelude.js`, `ve-script`, DOM host bindings.

Generate interface boilerplate, conversions, descriptors, exposure and brand checks from pinned IDL definitions. Implement behavioral algorithms in small auditable modules. Specify wrapper identity, cross-realm behavior, tracing roots and collection of disconnected subtrees.

**Acceptance:** IDL harness plus behavioral tests; author-created events cannot forge trusted event state; objects have correct prototypes/descriptors; repeated page churn and detached DOM cycles do not create unbounded retention. Generating signatures alone never satisfies a feature ticket.

### VEC-009 — Fetch, streams, cancellation and web networking [M1]

**Start in:** `ve-net`, fetch/XHR bindings, service integration.

Replace synchronous string-shaped results with byte-correct asynchronous bodies. Implement headers, response cloning/body consumption, abort, redirects, request modes and credentials. Add streaming with bounded backpressure. Implement genuine WebSocket connection/message/error/close behavior as a complete feature slice.

**Acceptance:** binary response round-trips; clone/body-used semantics; cancellation during DNS/connect/body; cross-origin denial; header and cookie rules; compression/resource limits; streaming under slow consumers. A Promise wrapper around blocking work is not the accepted asynchronous design.

### VEC-010 — Navigation, frames and storage [M1]

**Start in:** page lifecycle, frame tree, session history and storage services.

Define document epochs, navigation cancellation/commit, frame origins and realms, same-origin access, cross-origin messaging, cookies, storage partitioning and quotas. Add IndexedDB and worker/service-worker support through complete lifecycles where workload evidence demands it.

**Acceptance:** synthetic authenticated multi-origin apps, iframe communication, reload/back/forward, redirects, storage isolation, offline behavior and concurrent profiles. A service-worker registration object is not evidence that a service worker executes or controls requests correctly.

### VEC-011 — Forms, trusted input and human takeover [M1/M2]

**Start in:** native actions, DOM default actions, coordinator control epochs.

Unify keyboard/pointer input, focus, selection, form validity, submission, event cancellation and agent actuation. Make human takeover a real suspended coordinator state, including interruption checks between native batch steps.

**Acceptance:** React-controlled inputs and ordinary native controls receive correct events; disabled/occluded controls do not get unintended actions; changing controller ownership prevents subsequent dispatch; resumption requires an explicit transition. Report effects already dispatched before takeover rather than claiming they were canceled.

### VEC-012 — Layout and typography correctness [M1/M2]

**Start in:** `ve-style`, `ve-layout`, text shaping and font services.

Close demonstrated gaps in sticky positioning, margin collapsing, table borders, inline alignment and writing modes. Extend cascade/selector behavior and invalidation through real layout failures. Use actual font metrics for compatibility runs; retain deterministic synthetic metrics for explicitly synthetic tests.

**Acceptance:** pixel and geometry references; bidirectional and international text; intrinsic sizing, zoom and scrolling; invalidation equivalence between incremental and full layout. Compare accessibility bounds and hit targets to visible content.

### VEC-013 — Complete paint and direct presentation [M2]

**Start in:** `ve-gfx/display_list`, `vello_backend`, compositor, native surface.

Carry shaped glyph runs and decoded images into GPU output. Preserve clips, transforms, stacking and opacity. Introduce persistent resources, damage tracking and direct surface presentation; keep capture readback off the regular display path.

**Acceptance:** CPU/GPU rendering compared within explicit tolerances; no text/image display items silently dropped; screenshot rendering matches displayed state; device-loss recovery; animated scrolling does not allocate a full fresh readback path every frame.

### VEC-014 — Native browser shell and platform integration [M2]

**Start in:** a separate native desktop application consuming the engine API.

Build a minimal native-only browser view first. Add tabs, navigation, focus, selection, IME, clipboard, downloads, accessibility, permission prompts, profile controls and signed updates. Replace Electron in the independent distribution rather than swapping it for another system webview.

**Acceptance:** human and agent interact with the same live Vector document; keyboard-only and screen-reader workflows work; privileged chrome cannot be spoofed by page content; normal operation does not require a Chromium binary. Advanced media, WebGL/WebGPU, WebRTC and protected playback remain explicit compatibility tracks, not hidden omissions.

### VEC-015 — Versioned semantic query service [M1/M3]

**Start in:** `ve-a11y`, mutation journal, runtime observation contracts.

Create a deterministic page projection with roles, names, relationships, form constraints, geometry, hit-test results, frame/origin and provenance. Offer scoped queries and change subscriptions with dependency tracking. Separate observed facts from model-inferred intent.

**Acceptance:** token budgets are honored without silently dropping decisive constraints; incremental queries match full recomputation; page/frame/document/generation identity is preserved end to end; unrelated animation does not invalidate every target; hidden/private information is filtered by policy before model export.

### VEC-016 — Action contracts, receipts and uncertain effects [M3]

**Start in:** contracts, program executor, action journal, broker.

Extend actions with expected identity/state, permissions, deadline, cancellation epoch and postconditions. Distinguish planned, authorized, dispatched, observed, confirmed, uncertain and failed states. Make revalidation part of the trusted executor, not a suggestion to the model.

**Acceptance:** stale target replacement, DOM mutation races, crash after dispatch, network timeout after submission, and fallback migration do not cause blind duplicate writes. Receipts describe what was observed; they do not claim remote business success without an adequate check. Use server idempotency only where actually supported.

### VEC-017 — Durable coordinator and fallback reconciliation [M3]

**Start in:** runs, persisted coordinator state, router replay and checkpoints.

Persist the plan boundary, unresolved effects, page/document identity, authorization scope, model configuration and recovery status. Treat backend migration as a semantic discontinuity requiring fresh observation and reconciliation, not continuation of the same JS state.

**Acceptance:** crash injection at every transition; no duplicate external effects; deterministic restart of safe work; user review for ambiguous outcomes. Fallback reasons are specific, expiring, versioned and observable; an origin-wide ban is not the only compatibility-learning mechanism.

### VEC-018 — Compiled guarded skills [M3]

**Start in:** saved programs, observation queries, action contracts.

Compile successful task patterns into bounded programs using semantic relationships, preconditions and postconditions. Reuse them without repeated model planning when guards hold. Escalate only when evidence changes.

**Acceptance:** held-out application versions and changed layouts; failures stop at a guard rather than improvising writes; recorded evidence explains why a skill was reused; private task data is not implicitly converted into global training data. A saved selector sequence alone is not the target capability.

### VEC-019 — Privileged agent policy and model routing [M0/M3]

**Start in:** coordinator, prompt construction, secrets and permissions services.

Keep model proposals outside the security boundary. Enforce permitted origins, data destinations, file access, credential usage and sensitive operations independently. Use local deterministic checks first; evaluate smaller/local models for routing and extraction, escalating only when needed.

**Acceptance:** prompt injection through page text, images, metadata and tool results cannot expand granted capabilities; sensitive values are redacted or represented by handles before model export; denied egress remains denied regardless of explanation. Measure task success, latency, privacy and power rather than assuming a local model is superior.

### VEC-020 — WebMCP and automation adapters [M3]

**Start in:** external protocol adapters, capability broker.

Support WebDriver BiDi for interoperability and testing. Add WebMCP as a versioned, experimental adapter to the same internal action policy; do not hardwire an evolving community draft into the page kernel. Keep MCP transport separate from page-declared tools.

**Acceptance:** tool schemas, descriptions and outputs remain untrusted; page tools cannot bypass user authorization; draft-version negotiation and feature flags; ordinary DOM interaction still works on sites without tools.

### VEC-021 — End-to-end benchmark laboratory [M0/M4]

**Start in:** benchmark harness, task evaluator, traces and CI artifacts.

Separate primitive engine tests, standards/compatibility tests, deterministic task benchmarks and controlled live-web evaluation. Compare the same task, model, prompt policy, features, security mode, hardware and network conditions. Assert actual backend and record all failures.

**Acceptance:** cold/warm distributions, median/p95, uncertainty intervals, model calls/tokens per successful task, retry cost, complete process-tree memory, CPU and energy. Publish raw traces and exact revisions. Use Speedometer, JetStream and MotionMark when relevant features are implemented; use realistic task suites and independent state checks for agent outcomes.

A proposed first stretch objective is 2x lower p95 task completion time and 50% fewer model tokens per successful task at non-inferior task success and unchanged safety. Establish the baseline first; these are research targets, not forecasts. Broader performance claims require broader workloads.

### VEC-022 — Profile-led engine performance [M4]

**Start in:** whichever stages the controlled traces identify.

Measure selector matching, style invalidation, layout rebuilds, accessibility naming, hit testing, serialization, GC, body loading, model waiting and IPC separately. Investigate the repeated reverse paint-list hit tests and full observation reconstruction on large pages. Optimize only measured bottlenecks.

**Acceptance:** scaling curves at increasing DOM size and mutation volume, not only small fixtures; incremental/full equivalence tests; persistent spatial and semantic indexes when justified; binary transport or borrowed/shared buffers only with explicit ownership and validation; PGO/SIMD backed by measured improvement.

### VEC-023 — Concurrent browsing and memory governance [M4]

**Start in:** actor/process placement, scheduler, network and storage services.

Avoid a slow page blocking every page in a shared context. Use semantics-correct ownership boundaries, asynchronous resources, fair scheduling, quotas and bounded queues. Share only safe immutable resources and partition caches/credentials correctly.

**Acceptance:** many active/idle sessions, one hostile busy page, repeated navigation and tab churn; tail latency under saturation; no cross-profile data leakage; process-tree memory reported with OS-appropriate shared-memory accounting. Do not buy benchmark speed by disabling containment.

### VEC-024 — Hermetic replay and safe speculation [M5]

**Start in:** journal, resource recorder, deterministic test mode.

Record sufficient external inputs and scheduling decisions for a declared replay scope. Replay in an environment whose network is denied or intercepted. Explore alternate plans against immutable observations and controlled response archives, not against live accounts.

**Acceptance:** replay reports unsupported nondeterminism; external effects cannot leak from speculative branches; no assumption that HTTP GET is harmless; winning plans revalidate live preconditions before execution. Whole-browser arbitrary snapshot/restore is research, not an implicit guarantee.

### VEC-025 — Optional independent JavaScript VM research [M5]

**Start in:** a parallel experimental embedding backend.

Build a correctness-first interpreter and standardized conformance harness before pursuing JIT tiers. Study DOM integration, startup and task-specific execution against the V8 backend. Reuse compiler/code-generation infrastructure when advantageous.

**Acceptance:** explicit language feature manifest, Test262 and embedding tests, GC/rooting and sandbox review, and end-to-end evidence that replacing V8 improves a meaningful objective. Do not replace a robust VM because independent branding requires it; the browser engine is already independent of Blink/Chromium without that replacement.

## AI-assisted development system

The scaling unit is a verified behavior change, not a generated pull request.

```text
Pinned spec + real task failure
              |
Independent minimized failing test
              |
Bounded implementation candidate
              |
Conformance + differential + fuzz + security checks
              |
Performance and compatibility evidence
              |
Reviewed merge -> expanded regression corpus
```

Separate spec interpretation, test/oracle authorship, implementation, security review and integration where practical. Have agents work behind stable interfaces and small change scopes. Keep hidden evaluation cases outside the implementation agents' feedback loop. Differential disagreement across browser engines is a signal for specification review, not a majority vote establishing truth.

Require each change to state: behavioral claim; relevant standard sections; positive and negative tests; before/after traces; resource effects; rollout/revert conditions; and known limitations. Reject changes that turn failing tests into skips, weaken assertions, substitute canned fixture results, or relax security to make benchmarks pass.

Use property-based tests and model checking for tractable state machines: reference generations, navigation epochs, controller ownership, policy capabilities, journal transitions and recovery. Use fuzzing for parsers, IPC, codecs and bindings. Do not claim that testing proves the entire browser secure.

Suggested initial parallel workstreams after shared contracts are agreed: containment/broker, conformance/bindings, visual rendering, agent semantics/recovery, and benchmark/verification infrastructure. The integration gate is authoritative; parallel code generation does not bypass it.

## Source references

Project source and build evidence:

- Repository revision: https://github.com/robzilla1738/vector/tree/d9c212c0b558a8163eba713823c8735d9edb2e6b
- Engine CI: https://github.com/robzilla1738/vector/actions/runs/35042063266
- Runtime CI: https://github.com/robzilla1738/vector/actions/runs/35042063292
- README at reviewed revision: https://github.com/robzilla1738/vector/blob/d9c212c0b558a8163eba713823c8735d9edb2e6b/README.md

Primary technical references checked during the review:

- DOM Standard: https://dom.spec.whatwg.org/
- HTML execution and event loops: https://html.spec.whatwg.org/multipage/webappapis.html
- Fetch Standard: https://fetch.spec.whatwg.org/
- Web IDL Standard: https://webidl.spec.whatwg.org/
- WPT JavaScript tests: https://web-platform-tests.org/writing-tests/testharness.html
- WPT reference rendering tests: https://web-platform-tests.org/writing-tests/reftests.html
- Linux seccomp scope and pitfalls: https://docs.kernel.org/userspace-api/seccomp_filter.html
- WebMCP draft (not a W3C Standard): https://webmachinelearning.github.io/webmcp/
- Browser benchmark suites: https://browserbench.org/
- VisualWebArena research: https://aclanthology.org/2024.acl-long.50/
- Lightpanda project, for competitive context rather than independent validation of vendor benchmarks: https://github.com/lightpanda-io/browser

## Final priority

Make Vector's claims executable: which engine ran, what state was observed, what action was authorized, what effect was verified, and what tests establish compatibility. Then use those guarantees to eliminate redundant work. That is the foundation for both a distinctive AI browser and defensible performance leadership.
