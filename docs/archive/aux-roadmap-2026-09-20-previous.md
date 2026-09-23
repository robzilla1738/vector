# Aux: authoritative product and implementation roadmap

Status: Phases 1–4 delivered for private development review; post-handoff backlog
deferred. This is not release authorization. Updated 2026-09-20.

**Aux is the browser that works with you. Delegate real work, take over whenever
you want, and know what actually happened.**

This document supersedes the implementation priorities in earlier roadmaps. The
original product-intent brief is preserved in `planning/product-intent-2026-09-19.txt`.
`PRODUCT-ARCHITECTURE.md` remains evidence of the existing architecture, not proof
that the capabilities below are finished. Track implementation and verification in
`AUX-PROGRESS.md`. Never infer readiness from historical checkmarks.

## Decisions and completion boundary

- Build an excellent everyday browser, capable cross-tool workspace, and trusted
  execution system together. Initial audience: developers and technical operators.
- First platform: macOS. Preserve portable contracts and Windows-safe filenames.
- The complete founder build includes local/cloud development, research, documents,
  and prepared administrative actions. It is not a narrower browser demo.
- Existing agents and BYOK precede managed inference and billing. Prioritize Codex
  and Claude Code; provide qualified direct providers and compatible endpoints.
- Keep one shared local signed-in browser profile. Workspace memory and agent
  access are scoped; workspaces do not imply separate authentication containers.
- Cloud-capable tasks continue with the Mac asleep or Aux closed. Local-only steps
  wait for the desktop. No silent transfer of local browser credentials.
- Keep the Electron shell initially; replace it with a maintained Chromium shell
  if mandatory browser compatibility cannot be satisfied. Preserve runtime work.
- Do not release, publish packages, create release tags, or invite beta users.
  The endpoint is a private complete build, founder testing, and design revisions.
  External distribution needs a later explicit decision.
- Do not limit ambition by assumed staffing. Sequence by actual dependencies and
  verify each requirement; unrelated improvements cannot substitute for the goal.
- Credential constraint (user instruction): never search the user's Keychain,
  password stores, or personal files for missing credentials. Ask the user when
  a task needs credentials not explicitly supplied, including package publishing.
  Implement and test credential-handling code with synthetic test data; do not
  exercise migrations against personal credential stores without authorization.

## Reference-led redesign — next hands-on build

The user’s Aside screenshots are the primary visual reference, using Aux branding.
Implement complete experiences in this order: **shell and home → conversations →
settings and layout options**. Preserve the wider roadmap and existing saved data.
See `AUX-DESIGN-DIRECTION.md` and the project-root `design-qa.md` for qualification.

- Charcoal shell, restrained toolbar, fine borders, rounded selected rows. Preserve
  original Aux navigation/address, pins, spaces, folders and tabs in that order.
  Compact lower controls expose chats, tasks, Library, downloads and settings.
- Frosted sidebar with native macOS vibrancy, configurable solid/translucent material,
  neutral backdrop blur without a colored wash. Crisp icons/text; reduced-transparency,
  reduced-motion and contrast support. Literal AppKit Liquid Glass remains a separate
  native-shell investigation; do not describe CSS blur as that system material.
- Understated Aux mark, explicit Search/Ask choice and shortcut, generous spacing,
  real saved history excerpts/images, optional suggested tasks; no weather/greeting.
- Full-page persistent conversations, bottom reply composer, compact work history,
  captured screenshots, linked task browser, retained alongside-page agent panel.
  Replies must preserve chat/task context and uncertainty protections.
- Full-page searchable categorized preferences; system/light/dark, material controls,
  horizontal/vertical tabs with open-tab/selection continuity.
- Validate the actual rendered application against the screenshots at comparable
  sizes. Inspect populated and empty states and fix visible mismatches before handoff.
- Routines, global mini popup, voice input, account billing and sharing are separate
  capabilities; no placeholder controls implying they are available.

## Delivered development cycle — four phases and a post-handoff backlog

Updated user direction, 2026-09-19: individual controls, isolated fixes and small
features are implementation tasks, **not delivery milestones**. The four phases below
defined the completion boundary for this development cycle and are now integrated in
the private build. The former fifth phase remains a post-handoff backlog. Account,
signed-identity and provider-environment qualifications are recorded as limitations
for founder testing rather than silently claimed as verified.

Sequence by impact on usable Aux: daily browsing first, real delegated work next,
complete local development, desktop-independent cloud work, then the private
development handoff. Work on a later phase only for a concrete dependency or
when the current phase genuinely needs external input; identify that reason.
Do not substitute an easy backlog item for the current phase's exit criteria.

### Phase 1 — A browser the founder can use every day

**Outcome:** one coherent running macOS development build for personal browsing,
with the accepted Aux design, dependable saved state and a useful first-review
walkthrough. Use `pnpm dev`; do not create an app bundle yet.

**Delivered scope:**
- Consolidate shell, home, conversations, settings and both tab layouts. Complete
  keyboard/focus/accessibility and actual rendered review across populated, empty,
  collapsed and error states. Preserve original spaces/folders/pins/navigation.
- Close essential browser gaps and qualify the complete browsing journey: navigation,
  history/bookmarks/import, tabs/session recovery, downloads/uploads, clipboard,
  print/PDF, site controls, multiple windows, private browsing, reader-friendly
  viewing and default-browser/deep-link behavior. Do not infer readiness from
  separate control tests; identify unavailable OS integration explicitly.
- Resolve the early shell-compatibility decision using the required account/SSO,
  passkey/password-manager/extension and media/conferencing flows. If mandatory
  flows cannot be supported, make the shell decision here, preserving runtime work.
- Verify restart/crash/offline/sleep-wake behavior and existing-data safety. Keep
  Aux branding consistent while retaining compatibility identities where needed.
  Ten-minute safe suspension for eligible hidden Chromium tabs is implemented with
  immediate wake and exclusions for media, loading, visible and agent-owned work;
  qualify its resource benefit and site behavior during the personal browsing pilot.

**Dependencies:** existing native shell/runtime/profile and current recovery work;
founder input for account-dependent compatibility and personal-use acceptance.
No credential-store discovery. An OS integration requiring a bundle remains
explicitly unqualified until the user authorizes that prerequisite.

**Exit:** the founder can launch, browse representative sites, organize and restore
work, transfer files, recover common failures and evaluate the integrated UI.
A single capability/limitation record identifies every remaining browser gap and
its effect on daily use. Mandatory shell incompatibilities have a resolved path;
no claim that Electron is full Chrome. First hands-on review happens here, not
at the end of the roadmap. Founder hands-on testing begins after Phases 1–4.

**Requirement ownership:** B1–B5; browsing parts of B6, C2, F1, L1–L3; early A1–A4.

**Founder compatibility priorities (2026-09-19):** broad SSO and passkeys are core
requirements; the founder need not enumerate sign-in sites. Qualify representative
redirect, popup, MFA and WebAuthn journeys, then account-specific policies with the
founder. Target 1Password integration; Apple Passwords is desirable. Existing Chrome
extensions are the preferred ecosystem. The current Electron shell supports only a
subset of extension APIs and does not establish Chrome Web Store compatibility.
Resolve this architecture constraint before investing in a separate marketplace.
An Aux marketplace is a conditional later ecosystem proposal, not a substitute for
extension execution compatibility. An Aux-owned password vault is exploratory and
deferred beyond the first hands-on review; it is not an agreed new completion gate.
See [Electron extension limits](https://www.electronjs.org/docs/latest/api/extensions)
and [1Password additional-browser requirements](https://support.1password.com/additional-browsers/).

### Phase 2 — Trusted, connected agent work in the browser

**Outcome:** a real task can move from Search/Ask into a persistent conversation,
use the intended browser context, accept follow-ups and human intervention, and
finish with inspectable results and honest uncertainty.

**Delivered scope:**
- Qualify the first real provider or supported existing-agent connection, prioritizing
  Codex/Claude Code and configured BYOK. Complete setup, account/model visibility,
  streaming, errors, cancellation and reconnect behavior around that connection.
- Complete task/workspace continuity across tabs, conversations, runs, agent changes
  and restart. Scope context and memory deliberately; provide inspection, exclusion
  and deletion instead of implicitly sharing all browsing or local files.
- Enforce task/resource/account authority, credential separation, revocation and
  action journaling at actual dispatch boundaries. Complete takeover/resume and
  uncertain-outcome handling across the enabled execution paths.
- Deliver question-to-supported-report and request-to-prepared-action workflows,
  including sources, local documents, useful artifact previews/exports and review
  boundaries. No unsupported controls or invented success claims.

**Dependencies:** Phase 1 browser/session behavior; an explicitly user-configured
provider/agent connection for live qualification. Synthetic checks support safety
work but cannot satisfy this phase's real-agent gate. If a connection is unavailable,
continue implementation without treating live qualification as completed.

**Exit:** real connected-agent journeys demonstrate follow-up continuity, correct
context/account selection, cancel/takeover/restart behavior and supported reports
or prepared actions with evidence. Consequential actions respect authorization;
uncertain effects remain unresolved until reconciled. Security is part of this
phase's delivery, not deferred to final hardening.

**Requirement ownership:** C1–C4, D1–D4, E1–E4, F1–F2, J1–J3; initial I2–I4;
relevant L1–L3. Later phases extend the same protections to their new surfaces.

### Phase 3 — Complete local development and operations

**Outcome:** Aux can take an issue or bounded app request through implementation,
running checks, a working browser preview and a reviewable change; it can also
investigate an incident and prepare an evidence-backed fix.

**Delivered scope:**
- Extend the integrated worktree/editor/command/service/preview/recovery workflow
  from its scoped file/process tools, detected JavaScript/Python setup, linked
  console/network diagnostics, useful checks and task-scoped external-editor
  continuity into
  agent-driven planning across monorepos and additional qualified toolchains.
- Preserve the original dirty checkout, task/branch identity, unsaved drafts and
  external edits. Make stopping work, restarting Aux and resuming a task coherent
  across commands, services, files and previews.
- Complete selected-repository GitHub workflow and Vercel/Sentry investigation
  connections, including account health, scopes and revocation. The integrity-checked
  patch, manifest and draft-PR handoff now reaches an exact, approved local commit;
  connected checks remain open. Creating remote PRs or other external writes remains
  subject to the user's explicit authorization and no-publishing instruction.
- Qualify JS/TS application and Python-service workflows beyond the existing local
  fixtures, and clearly identify unsupported environments.

**Dependencies:** Phase 2 task authority and a qualified agent; user-authorized
service connections and remote writes when required. Existing local tools should
be reused rather than expanded into a separate IDE platform.

**Exit:** complete issue-to-verified-change, bounded-idea-to-working-app and
incident-to-prepared-fix journeys work with task-linked evidence, live previews,
change review and recoverable interruption. Where remote PR creation is not
currently authorized, the prepared result is reviewable but that final gate stays
open; do not label a prepared PR as created.

**Requirement ownership:** G1–G3, local I1, F2; development extensions of D/E/J2;
relevant L1–L3. Local command primitives alone do not complete this phase.

### Phase 4 — Cloud continuity and an open execution ecosystem

**Outcome:** explicitly cloud-capable work continues while the Mac sleeps or Aux
is closed, then reconnects with the same task history, artifacts and control state.

**Delivered scope:**
- Finish the implemented environment setup, execution, files/logs, bounded export,
  authenticated preview, checkpoint, stop/resume, location and expiry path with
  live-provider qualification. Account-wide inventory, guarded orphan cleanup,
  fixed concurrency/session/lifetime resource limits and durable scheduled deletion
  with retry are implemented. Provider-side currency limits remain unavailable and
  must be stated honestly rather than inferred from CPU or egress ceilings.
- Keep durable source/artifacts outside disposable compute. Complete brokered
  credentials, authority fencing and reconnect reconciliation without duplicate
  coordinators or silent copying of local browser authentication.
- Complete remote browser takeover, explicit local-only waiting and scoped child-task
  coordination. The implemented task-scoped terminal still needs live provider
  qualification. Distinguish a checkpoint from universal rollback.
- Complete the remaining provider/agent/SDK/CLI/API/MCP parity and interoperability
  qualification. Qualify specialized engine workloads through measured evidence;
  do not let engine generalization delay the core user workflows.

**Dependencies:** Phases 2–3 task/execution contracts and recovery; explicitly supplied
cloud credentials, infrastructure and deployment authorization. No cloud deployment
or paid-resource creation is implied by this planning document.

**Exit:** a complete cloud workflow and preview survive desktop-off and worker
interruption, reconnect consistently, support real takeover, preserve artifacts and
clean up resources with account/cost/authority boundaries verified. Contract parity
and claimed adapters are qualified against actual supported versions.

**Requirement ownership:** H1–H4, F3, remaining I1–I4, K1–K2; cloud extensions of
C/D/E and L1. Unsupported adapters cannot be counted as delivered.

### Post-handoff backlog — not an active phase or completion gate

Phases 1–4 are integrated and the founder handoff is recorded in
`AUX-PRIVATE-BUILD.md`. Work stops at the usable private `pnpm dev` build for hands-on
review. Feedback from that review defines the next roadmap.

The following work is explicitly outside the current completion boundary:

- a seven-day personal browsing pilot, founder acceptance program, broad final
  refinement campaign or feedback-driven polish not required for a safe usable build;
- packaging, signing, update channels, release preparation, app-bundle creation or
  publishing of any kind;
- external brand/legal clearance, public namespaces, distribution accounts and
  speculative ecosystem expansion;
- full internal namespace cleanup, credential migration from personal stores and
  other migrations that are unnecessary for the private development build.

Retain useful completed instrumentation, diagnostics and recovery work. Security,
recovery, data-integrity, compatibility and performance checks needed to trust
Phases 1–4 remain inside those phases and cannot be deferred here. Unresolved visual
polish and requests discovered during founder testing belong in this backlog unless
they expose a Phase 1–4 functional or safety defect.

### Execution rules for every phase

- Keep one active delivery phase and a short list of its remaining blockers.
- Before an implementation batch, name its dependencies and phase-level acceptance
  scenarios. Complete related UI/runtime/persistence/integration together.
- Treat controls, fixes and tests as work items inside the phase. Do not declare a
  new milestone for each or stop at a small internal checkpoint when independent
  work toward the phase exit remains available.
- Validate focused changes during development, then the integrated phase when
  ready. Repeat checks for changed behavior, failures or unresolved concerns.
- Report the working user journey, remaining phase gaps, evidence and external
  dependencies. Update `AUX-PROGRESS.md` so resets do not repeat investigation.
- Optional polish, routines, the global mini popup, billing, speculative engine
  expansion and broad adapter proliferation must not displace first-review blockers.
  Keep the delivered private build stable and let founder testing determine the next
  roadmap.

## Architecture

Aux Browser owns human interaction. Aux Tasks owns persistent objectives and
context. Aux Agent Runtime owns authority, execution, scheduling, and recovery.
Aux Receipts owns evidence and uncertainty. Aux Sandbox owns local/cloud execution
environments. Aux Connect owns service, provider, and agent integrations. Aux
Engine earns specialized semantic, replay, and controlled-execution workloads.
Aux SDK, CLI, and API expose the same contract and authorization rules.

Durable entities: Workspace, Task, Run, Resource, AgentSession, CapabilityGrant,
Action, Checkpoint, Verification, Receipt, MemoryItem. Tasks outlive runs, tabs,
agents, and environments. Execution status and outcome confidence are separate.

Keep local tasks in the TypeScript runtime and SQLite. Initial cloud architecture:
the same policy/execution contracts, Vercel Workflows orchestration, managed
PostgreSQL metadata, private object storage, a credential broker outside untrusted
compute, and Vercel Sandbox as the first execution adapter. Qualify these adapters
before claiming support. Retain provider-independent task/evidence records.

One coordinator owns a task at a time. Transfer requires a checkpoint, authority
handoff, and fencing lease. Cloud tasks are cloud-authoritative, with a local view;
local tasks remain local until explicitly transferred. Desktop disconnect must not
create two coordinators able to dispatch the same effect.

## Requirements and evidence

Each ID owned by Phases 1–4 is required for the private development handoff unless
explicitly moved to the post-handoff backlog. Every implementation epic records dependencies, contract/migration
impact, failure behavior, tests, and evidence. Status vocabulary: planned,
implemented, verified, accepted. Code existing is not equivalent to verification.

### A — Identity and migration

- A1: Inventory and classify product copy, metadata, icons, packages, Rust crates,
  source namespaces, build scripts, executables, environment variables, protocols,
  SDK/API schemas, databases, profiles, preferences, caches, telemetry, logs, docs,
  tests, screenshots, domains, signing, deep links, and update channels.
- A2: Canonical names: Aux; aux-browser; auxctl; aux-runtime; aux-mcp; AUX_*;
  aux-* Rust crates; private @aux-browser/* packages; aux-state.sqlite; Aux Browser
  data directory; chromium / attached-chromium / aux-engine backend identifiers.
  No bare aux filenames: AUX is reserved by Windows even with extensions.
- A3: Versioned, restartable migration; consistent SQLite backup including WAL;
  existing application closed; preserve sessions, files, and all user state;
  reconcile separate runtime/profile locations; validate keychain decryption;
  prevent old applications opening incompatible migrated databases; never silently
  merge independent profiles. Keep legacy identifiers only where necessary.
- A4: Explicit adapters for legacy env/CLI/API/MCP/storage identifiers; canonical
  configuration wins within a source, process environment beats dotenv files.
  Keep compatibility through prelaunch and the first stable compatibility cycle.
- A5: External brand clearance: trademarks, naming conflicts, domains/handles,
  app stores, package/executable conflicts, pronunciation, recall, international
  meanings, and discoverability. Existing Aux Browser listing requires review.
  No public namespace availability or legal clearance is assumed.

### B — Everyday browser

- B1: Navigation, omnibox, suggestions, history/bookmarks, tabs/pins/groups,
  workspaces, reopen/session restore, multiple windows, default-browser/deep links.
- B2: Downloads/uploads, drag/drop, print/PDF, clipboard, find/zoom, reader-friendly
  viewing, site controls, private browsing, supported data import/export.
- B3: Popups, passkeys/security keys, SSO, password managers/native messaging,
  qualified extensions, conferencing, screen sharing, media/DRM capability matrix.
- B4: Site permission management/revocation; crash recovery, sleep/wake, offline and
  network changes; keyboard/VoiceOver/focus/contrast/reduced-motion accessibility.
- B5: Compatibility gate early: mandatory account/password manager/extension/media
  flows pass or shell migration completes. Electron's Chromium is not full Chrome.
- B6: Active-tab responsiveness, bounded agent resource use, safe idle suspension,
  energy/startup/memory measurements sufficient to detect material regressions.
  A seven-day personal browsing pilot is post-handoff.

### C — Workspaces, tasks, and interface

- C1: Runtime-owned persistent workspaces/tasks/resources; objectives and editable
  acceptance criteria; runs/agent replacement/restarts keep one task history.
- C2: Sidebar tabs/tasks/workspaces, main browser/artifact/diff/environment surface,
  task panel, optional authority/evidence/cost inspection; background work never
  steals focus or overwrites the user's active page.
- C3: Clear actor/model/location/account, budgets, progress, pause/cancel/redirect/
  takeover/resume, follow-ups and historical receipts; objective changes invalidate
  irrelevant previous results explicitly.
- C4: Distinct observations, task history, workspace memory, user preferences;
  provenance, inspection/edit/delete/exclude; scoped local search before measured
  semantic retrieval; no implicit transmission of all tabs/files/history.

### D — Authority and credentials

- D1: Task/resource/account/environment/expiry/budget-scoped capabilities, checked
  at dispatch. Trusted user instruction can grant authority; untrusted model/page/
  document/repository/tool/agent content cannot expand it.
- D2: Equivalent checks for browser/API/terminal/files/external agents/saved
  workflows/cloud. Worktrees are not security sandboxes. Ambiguous consequential
  clicks need review/takeover unless a qualified adapter establishes their meaning.
- D3: Separate browser, service, model, and application credentials. Secure local
  persistence; no plaintext fallback. Cloud broker outside sandbox; least access;
  no browser cookie jars, host environments, or unrelated tokens in sandbox code.
- D4: Authenticated control IPC; no page/client bypass; redirect/egress checks;
  deny cloud metadata/host/internal access outside grants; redaction/retention of
  observations and logs; revocation blocks new actions and outstanding capabilities.

### E — Verification and recovery

- E1: Acceptance criteria precede execution; no retroactive success definition.
  Action progression and confidence separate: proposed/prepared/dispatched/
  observed/interface-confirmed/verified/uncertain/failed/needs-user.
- E2: Criterion-specific evidence with source/time/resource/account/revision;
  independent state readback where possible; screenshot or second-model agreement
  alone is not business confirmation. Mark evidence stale when its subject changes.
- E3: Transactional intent/authorization journal before dispatch; stable logical
  action keys; reconcile unknown outcomes; provider idempotency when available;
  never interpret timeout as definite failure or promise universal exactly-once.
  Unreadable journal fails closed. Local rollback does not reverse remote effects.
- E4: Receipts show requested/completed/prepared/uncertain outcomes, unmet criteria,
  links/artifacts, verification, intervention, cost/time, and next action.

### F — Human control

- F1: Exact live browser session, scroll/selection/forms/unsaved state; immediate
  per-page ownership change honored by all clients; disclose in-flight effects.
- F2: Resume re-observes human edits and authority before continuing. Terminal
  control and file conflicts have explicit ownership; stopping dispatch differs
  from stopping a running process; preserve external-editor changes.
- F3: Cloud takeover presents the existing remote browser/terminal. A local page
  at the same URL is not takeover. Show session identity and recovery limits.

### G — Local development and operations

- G1: Select repo/issue; preserve dirty checkout; isolated worktree/branch; inspect
  setup; approved command execution; dependencies/services/logs/ports/readiness;
  browser preview, edit/diff/checks, authorized draft PR and preview.
- G2: Qualify JS/TS web apps and Python services; explicit unsupported environments;
  file search/light editing/diffs/terminal/processes/logs/console/network/checks;
  external editor handoff preserves task/branch/environment.
- G3: Sentry + source + deployment/log timeline, correlated evidence, reproduction,
  prepared fix; production investigation read-only unless action authority exists.

### H — Cloud execution

- H1: Environment create/inspect/exec/logs/files/authenticated previews/checkpoint/
  stop/resume/destroy/export/resources/expiry; reproducible setup/cache/services,
  network/resource limits, idle shutdown, orphan cleanup.
- H2: Persist source/artifacts/task state outside disposable compute. Distinguish
  filesystem/git/database/process/browser/external state; snapshot != universal
  rollback or process-memory preservation. Vercel snapshots may stop sessions.
- H3: Explicit data/credential/location/cost disclosure; survive desktop/worker/
  deployment restart; local-only work waits, independent cloud work continues.
- H4: Parallel child tasks/environments with scoped grants, budgets, conflict
  protection, parent links, consolidated receipts. Remote takeover included.

### I — Connections and open agent ecosystem

- I1: GitHub selected repos/issues/branches/commits/draft PRs/checks/reviews; Vercel
  selected projects/deployments/logs/previews; Sentry selected alerts/context;
  approved MCP servers; browser adapters for API gaps. Official scoped auth with
  account health/revocation/audit; Aux broker narrows broad upstream permissions.
- I2: OpenAI/Anthropic/Google direct keys, existing Vercel AI Gateway, compatible
  enterprise/aggregator/local endpoints; qualify concrete model capabilities;
  streaming/tools/vision/structured output/context, visible provider/cost/location;
  no silent cross-provider/context-destination fallback.
- I3: Codex/Claude Code first; sessions/resume/events/artifacts/cancel/intervention;
  version negotiation; supported subscription authentication only. Distinguish
  enforced Aux-managed execution from external clients with independent authority.
- I4: Versioned shared SDK/CLI/API/MCP contracts for workspace/task/resource/grant/
  page/environment/process/connection/agent/artifact/verification/receipt; event
  cursors/reconnection; all clients enforce equivalent authority and evidence.

### J — General work

- J1: Web/authenticated/local-document research; extraction/comparison/synthesis,
  claim citations, conflicts/freshness, reports/tables/export; fact vs inference.
- J2: Markdown/rich text/PDF/tables/CSV/images/app/generated-file previews/revisions;
  provenance/history, isolated active content.
- J3: Vendor comparisons, form completion/missing info, application packets, draft
  communications, subscription/account recommendations; prepared review boundary;
  authorize and record autosave/draft side effects, no unrequested final action.

### K — Engine and execution knowledge

- K1: Compact semantic perception, stale refs, deterministic controlled replay,
  evaluation, large/offline documents, efficient background work; measurable cohort
  qualification, visible backend identity, Chromium for unknown ordinary sites.
- K2: No replay of possible writes across backends. Reusable operations require
  held-out validation and demotion; privacy-scoped outcome/retry/recovery/drift/
  authority/intervention knowledge; no default cross-user raw-content training.

### L — Quality and private development handoff

- L1: Contract/migration/integration/desktop/fault/adversarial/performance checks
  appropriate to the supported development build; browser/dependency security updates;
  sanitized reproducible diagnostics and versioned evidence.
- L2: Private macOS development build, necessary legacy compatibility, representative
  end-to-end checks, concise capability/limitation handoff, sanitized diagnostics and
  recoverable backup.
- L3: Founder testing and feedback-driven visual/interaction refinement occur after
  the Phase 1–4 handoff and define a future roadmap. They are not current gates.

## Legacy gate mapping — traceability, not the execution unit

The former M0–M11 labels remain requirement/evidence references. Work is now
organized and reported through the four active delivery phases above. M11 and any
packaging-specific part of M10 are retained only as post-handoff traceability.

| Delivery phase | Legacy gate coverage |
|---|---|
| 1 — Daily browser | M0 baseline; early M1 safety; M2 compatibility; browser parts of M3/M11 |
| 2 — Trusted agent work | M3–M4; M8; initial M9 |
| 3 — Local development | M5; M7; local portions of M9 |
| 4 — Cloud continuity | M6; remaining ecosystem/engine portions of M9 |


| Milestone | Deliverable and exit evidence |
|---|---|
| M0 | Baseline and one authoritative roadmap; claims classified by evidence |
| M1 | Identity/adapters/migrations; clean install + upgrade pass; no release |
| M2 | Browser compatibility matrix passes or required shell migration completes |
| M3 | Durable tasks survive restart/agent replacement with coherent context |
| M4 | Authority/secrets/journal/takeover/verification pass fault and policy gates |
| M5 | Local issue-to-verified-draft-PR workflow passes |
| M6 | Cloud workflow + preview completes desktop-off, reconnects consistently |
| M7 | Incident investigation and bounded application creation qualified |
| M8 | Research/artifacts/prepared actions pass source and boundary checks |
| M9 | Agent/provider/API parity and measured engine/operation qualification |
| M10 | Phases 1–4 pass integrated private-development qualification and handoff |
| M11 | Post-handoff founder testing and any next roadmap (not an active gate) |

Critical path: browser compatibility → durable tasks → authority → verification →
complete workflows → private development handoff. Identity and provider contracts start
early; engine expansion must not block the core browser/task experience.

## Evaluation and acceptance gates

Phase 1–4 signature workflows: issue-to-verified-change; incident-to-prepared-fix;
bounded idea-to-working-app; question-to-supported-report; request-to-prepared-action.
Use representative end-to-end scenarios plus focused fault cases that exercise the
actual supported paths. Exhaustive statistical qualification is post-handoff.

- Supported workflows complete with inspectable evidence and no known critical blocker.
- Zero false consequential-success claims, duplicate effects, or successful
  authority violations in qualification. Finite tests are not zero-risk proof.
- All mandatory takeover and browser cases pass; ≥95% recovery on recoverable cases.
- No lost persisted data in supported migrations; no plaintext persisted provider
  keys or secret-bearing diagnostics.
- Local command/pause/cancel acknowledgement ≤100ms p95; no new dispatch afterward.
- No observed unbounded growth in a bounded navigation/resource check; the seven-day
  personal browsing pilot is post-handoff.
- Median ≤1 unplanned intervention on qualified routine tasks.
- Consequential research facts supported or explicitly uncertain.
- Prepared/needs-user/uncertain are not completed unless that was the requested end.

Fault matrix: crashes before/after dispatch/confirmation; timeout after success;
in-flight takeover; stale refs/navigation/site drift; account switch; expired/
revoked/rate-limited connectors; worker/Mac/desktop/redeploy interruptions; local
dependency offline; sandbox/snapshot/setup failure; budget exhaustion/unknown cost;
concurrent writes/external edits; fabricated success; prompt injection through all
content surfaces; disk-full/locked-profile/keychain migration failures; provider
egress changes; autosaving forms; direct-control bypass.

Compare controlled components with matched model/task/budget/oracle where possible,
and whole products in their supported configurations. Measure correctness, human
supervision, recovery, takeover, cost/latency, trust, browsing friction, and return
usage. Primary metric: verified valuable tasks per active user, with prepared and
uncertain outcomes separately counted. Local diagnostics by default; explicit
controls for broader telemetry.

## Post-handoff possibilities (not active work)

Private-beta decision follows signing/notarization/update/rollback qualification,
brand and namespace clearance, accurate capability/privacy information, support/
incident response, cloud cost/cleanup controls, and integration terms checks.
No tag-triggered publishing while implementing the private founder build.

Subsequent expansion: recurring trusted workflows; managed Aux AI and billing;
team workspaces/roles/audit; more integrations; qualified administrative execution;
Windows and other platforms; enterprise identity/retention/region/private networking.

Stop work that pursues general engine completeness without a qualified workload,
rebuilds commodity IDE/cloud platforms without need, spreads integrations too thin,
misrepresents confidence/session/control boundaries, or degrades daily browsing.

## External references verified during planning

- https://www.electronjs.org/docs/latest/api/extensions
- https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file
- https://prod.cursor.com/docs/cloud-agent
- https://aside.com/
- https://sourceforge.net/projects/auxbrowser/
- https://vercel.com/docs/workflows
- https://vercel.com/docs/sandbox/concepts/snapshots
