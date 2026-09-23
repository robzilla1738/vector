# Aux: the browser and workspace for the AI era

## Implementation handoff · 22 September 2026

**Purpose:** turn the current Aux application into a fast, fluid everyday browser and an integrated AI workspace, competitive with Aside, Dia, and Arc on the workflows that matter to its users.

**Status:** complete product and engineering direction for the next implementation cycle, including the final minimalism, permission-friction, and speed review. Requirements and targets below describe the intended outcome; they are not claims that the current application already meets them. This handoff supersedes the September 22 audit-plan draft and its companion review for future implementation. It incorporates the founder's subsequent design and interaction decisions.

**Reference checkout:** `/Users/rcourson/Code/web`, inspected at commit `5829303d2a15928fd3276b90d1f977e53455ed6b`. Revalidate affected code against the implementation checkout. Component paths are navigation aids, not instructions to recreate functionality that already works.

**How to use this document:** read Sections 1–7 and the permission rule in Section 13 before changing architecture or UI; implement the work packages through the single release sequence in Section 16; use Sections 17–21 for dependencies, verification, and handoff. The low-friction checks in Section 18.5 are required from the first usable release. The document is self-contained. Historical plans are background, not additional competing specifications.

## 1. Product outcome and fixed decisions

Aux should feel like an excellent browser every moment it is open. Its AI should understand the page and work in front of the user, complete real tasks across their signed-in websites, and communicate as naturally as a capable collaborator. Its workspace should connect chats, tabs, files, code, previews, commands, and projects without making the user assemble a toolchain for every task.

The everyday experience is continuous: browse, ask, act, refine, continue. A quick page question can become research, a document, a website action, or a code change in the same conversation. The browser stays responsive throughout. The user can keep working, intervene immediately, and come back later without rebuilding context.

### Decisions to preserve

1. **Keep the current Aux design.** Preserve the sidebar, native materials, quiet palette, Geist typography, compact controls, Chats/Tabs organization, current brand, and existing layout behaviors. Refine and complete this design rather than replacing it with a new visual concept.
2. **Results belong in the conversation.** The AI explains what it accomplished in ordinary chat, with a link, preview, file, table, or diff when useful. No dedicated Receipts destination, audit dashboard, evidence checklist, completion stamp, or compulsory post-task review flow.
3. **Browser and workspace are both core product capabilities.** Chats, project files, changes, previews, commands, connected agents, and cloud continuation remain first-class. Their controls appear when relevant and do not crowd ordinary browsing.
4. **Chromium is the sole web rendering engine.** Remove the Rust engine from the product path, distribution, and routine TypeScript CI. Preserve its source/history in the separate engine track.
5. **Human browsing is independent of the agent runtime.** Opening, switching, closing, navigating, typing, and organizing tabs work when models, networks, providers, or the runtime fail.
6. **One controlled browser for humans and agents.** AI operates the user's real permitted browser state and accounts through the same lifecycle and control rules. Avoid a second unrelated browser experience.
7. **A one-time development reset is allowed.** Complete the Vector-to-Aux rename and remove legacy development compatibility. Once external users keep a beta profile, support upgrades and recovery for that new data.
8. **Vercel AI Gateway remains the default transport.** Keep supported direct/local options. Choose defaults by measured quality, latency, cost, and provider capabilities; do not hardcode assumptions into scattered components.
9. **Reliability is mostly invisible.** The user's clear request authorizes its routine steps within the selected scope; internal permission checks are not requests for another click. Keep authorization, durable intent, verification, and recovery behind the experience. Interrupt only for missing consequential information, genuinely new authority, or required native interaction.
10. **Completion means a working experience.** UI, runtime, persistence, failure handling, packaged behavior, and relevant verification ship together. A component, endpoint, screenshot, or green unit suite alone does not establish that a workflow works.
11. **Minimal is the default experience, not a smaller feature set.** Preserve a complete browser and substantive workspace. Reveal advanced capability in context; do not make people manage agents, permissions, logs, or panels to get ordinary work done.

### The competitive standard

Aux must combine four qualities: browser comfort and organization, immediate contextual assistance, capable delegated website work, and a useful development workspace. The advantage comes from how well these qualities work together.

The first audience is Mac-based developers, founders, researchers, and technical operators who work across websites, documents, dashboards, repositories, and AI agents. Optimize the first complete release for this audience while keeping ordinary browsing understandable without technical knowledge.

Success is measured through repeated real use: people retain Aux as their default work browser, finish useful tasks with less effort, and trust it with increasingly substantial work. Feature-count parity and competitor slogans do not establish that result.

### Competitive reference points

The following are vendor-documented capabilities checked September 22, 2026, not independent quality or security rankings. The Aux implications are product judgments to validate with users.

| Reference | Relevant expectation | Implication for Aux |
|---|---|---|
| [Aside](https://aside.com/) | Delegated work across signed-in websites, files, and credential-assisted login. | Qualify real multi-step actions and account continuity; ordinary chat must lead to completed work. |
| [Dia](https://www.diabrowser.com/) | Contextual answers across tabs/tools, useful generated work, profiles, organized tabs, and remembered splits. | Make asking, producing an artifact, and returning to context feel like one continuous experience. |
| [Arc Spaces](https://resources.arc.net/hc/en-us/articles/19228064149143-Spaces-Distinct-Browsing-Areas) and [Split View](https://resources.arc.net/hc/en-us/articles/19335393146775-Split-View-View-Multiple-Tabs-at-Once) | Durable browser organization and comfortable side-by-side work. | Preserve Aux's current sidebar identity and make organization, focus, restoration, and layout excellent. |

Aux's intended differentiation is the complete path from a page or issue to delegated work, a useful output or code change, a live preview, and continued conversation. Benchmark the experience as a whole; do not copy a competitor's visual identity or repeat its marketing claims as measured fact.

## 2. The experience to build

### 2.1 Browsing feels immediate

The window becomes usable quickly. Restored tabs appear immediately without loading every page. Opening a tab, typing an address, switching Spaces, revealing the sidebar, or resizing a split never waits for an AI request. Background work does not cause typing lag, scroll stutter, focus theft, or a sudden change to the active page.

The address field behaves like a familiar browser address field. Search is predictable, suggestions are fast, navigation does not lock the input, and the user can correct a URL or stop a load immediately. New tabs, links, popups, back/forward, downloads, permissions, and keyboard shortcuts have conventional behavior.

### 2.2 Asking is lightweight

The current page is the natural starting context for a new page-related question. Small context chips show what is attached. The user can add another tab, selected text, a screenshot region, file, saved result, or project without building a formal task definition.

A question streams into a readable answer. Sources are easy to open when relevant. The answer does not arrive surrounded by duplicated status cards, counters, logs, or an automatically expanded preview that leaves no room to read.

### 2.3 Doing work is a normal continuation of chat

“Compare these three options,” “update these records,” or “fix this issue and show me the preview” begins work in the current conversation. Aux infers the practical steps, carries out the authorized work, and asks a focused question only when the answer materially changes the outcome or the requested action needs additional authority.

Users can send a correction while work is running. Aux applies it at a safe boundary, explains a relevant change briefly, and continues. Stop and takeover act locally and promptly. The user does not need to open a task management screen to control the assistant.

The completion is ordinary language:

> I updated the three records. One was locked, so I left it unchanged.

> The fix is ready. The menu now stays aligned when you resize the window. Here's the preview.

> These two options meet your requirements. I put the comparison in a spreadsheet and linked the sources.

Follow-ups such as “change the second one,” “show me the diff,” “what did you change?” and “undo that” continue in the same chat. An actual uncertain outcome gets a clear explanation and a useful next step; it never becomes a false success or an administrative ritual.

### 2.4 The workspace appears around the work

Attaching a repository gives the conversation access to its project and reveals contextual access to Preview, Changes, Files, and Console, without opening every pane. Opening a preview uses a real browser tab with the same site controls and agent capabilities as other tabs. Selecting a region in that preview can start an edit request with the correct project, route, screenshot, and conversation context already attached.

Files support useful editing, Changes supports readable diffs and feedback, and Console supports real commands and services. The user can inspect and adjust these directly while discussing the work with Aux. These surfaces are useful parts of the workspace, not mandatory checkpoints after every task.

### 2.5 Returning is effortless

Chats retain drafts, attachments, linked pages, project selection, results, and useful scroll position. Switching between a compact question, side panel, full conversation, and project workspace changes presentation without creating another conversation or losing context.

Reopening Aux restores the browser session and makes previous work easy to continue. Interrupted work is reconciled before resumption. A completed task can become a reusable Skill without rewriting it as a program.

### 2.6 The low-friction contract

This is the user-facing interpretation of every later work package. Architecture terms such as grant, lease, journal, verification, and checkpoint describe internal machinery, not screens or approval steps to add.

- **Ordinary browsing stays ordinary.** Opening links, moving tabs, typing, downloading, and manually using a website never require an AI permission prompt. Existing site/OS protections still apply. Human input takes control immediately; do not ask permission to take a page back from the agent.
- **Ask once, then work.** With the relevant account/project/provider connected, a clear request starts its routine permitted steps. Do not ask the user to approve a generated plan, every new research URL, every click, each file edit/test, or a write already included in the request. Section 13 defines the few real boundaries.
- **Use sensible defaults.** Infer ordinary implementation details and use reversible choices where possible. Ask only when an ambiguity materially changes the outcome, cost, account, recipient, or irreversible effect. Do not ask users to choose technical parameters the product can determine reliably.
- **A short task gets a short interaction.** Answer directly or return the result. No mandatory preamble, checklist, progress essay, completion card, or generic follow-up menu. Complex requested content can be detailed; routine execution narration should not be.
- **Long work stays quiet and controllable.** Use one compact working indicator/status that updates in place, with Stop. Add a chat update only for a meaningful finding, changed expectation, prolonged wait that needs explanation, or user decision. Do not append a message for every tool call or retry.
- **Return one useful result.** Ordinary completions default to one to three natural sentences, plus the relevant link, file, or preview when useful. Adapt to the request; do not truncate a requested explanation or hide a material failure to satisfy a word count. Sources support substantive answers without becoming an evidence dossier.
- **Keep the user's place.** No unsolicited panel expansion, focus change, tab switch, permission-center detour, or recurring tutorial. One bounded automatic recovery can be invisible when safe; repeated failure gets one useful explanation and next action, not a toast storm.

“Inspect result” means talking about the work in the same chat. Internal diagnostics remain available when deliberately requested, never as a prerequisite for finishing or trusting an ordinary task.

## 3. Preserve and refine the current design

### 3.1 Design sources and change rule

Use `docs/AUX-DESIGN-DIRECTION.md`, `apps/desktop/renderer/src/tokens.css`, current shell components, and a fresh capture of the running application as the visual baseline. Existing `release/test-artifacts/` images help locate prior behaviors but may predate current layout changes. Do not copy an old screenshot over a newer working design.

The approved current in-app silhouette is `apps/desktop/renderer/public/arch-mark.svg`, used by `AuxMark` through its shared styling. The native icon master is `apps/desktop/brand/aux-icon-1024.png`, the silver arch artwork. Both were updated September 21 and are present on the reference checkout. September 19–20 screenshots containing the older script-style mark are historical; do not restore that logo or their older sidebar address-field layout.

Before the first UI change, capture populated light/dark native windows, expanded/collapsed/hover sidebar, loaded page, new tab, active chat, and project workspace. Preserve their design language throughout implementation. Improvements should address a named usability defect, consistency problem, missing capability, or performance issue.

| Element | Required direction |
|---|---|
| Sidebar | Preserve native translucent material, compact rows, quiet selection, pins/bookmarks, Chats, Tabs/folders, and bottom Space/profile controls. Keep the user's arrangement and resizing preferences. |
| Collapse | Collapse fully; preserve left-edge hover reveal and an accessible explicit reopen control. No permanent replacement logo strip. Keyboard users can always reveal navigation. |
| Typography | Geist Variable and Geist Mono; retain the shared type scale, readable line height, truncation rules, and user interface text-size setting. |
| Palette/material | Preserve neutral light/dark colors, native vibrancy/Liquid Glass where supported, solid fallback, sidebar tint, and independent content opacity. Honor existing appearance preferences and reduced transparency. |
| Geometry | Reuse the 4 px spacing rhythm, existing radii/squircle language, hairlines, column alignment, and menu/row/control tokens. Avoid per-component approximations. |
| Icons and branding | Keep the Aux mark and current approved icon system. Preserve meaningful icon labels, baselines, and hit targets. |
| Address row | Preserve the current floating/revealed address-row behavior on loaded pages and hero field on a new tab; Command-L always focuses the appropriate field. Support a stable visible mode where input/accessibility needs it. |
| Motion | Use the existing approximately 150 ms feedback and 240 ms layout rhythm. Input and navigation begin immediately; animation never delays dispatch. Cancel/reverse animations cleanly and respect reduced motion. |
| Chat | Keep the familiar message/composer structure and optional page preview. The answer is the primary content; optional previews yield space on narrow layouts. |
| Project workspace | Evolve the current Preview/Changes/Files/Console surfaces using the same tokens and chrome. Do not introduce a visually unrelated IDE inside the browser. |

Retain existing horizontal-tab and multi-window options. Improve the primary sidebar experience first without removing working alternatives.

### 3.2 Interaction polish is implementation work

All important states need intentional layout: empty, populated, loading, streaming, offline, failed, needs input, paused, restored, and narrow window. Avoid unexpected panel opening, row reordering during pointer movement, unstable button positions, or layout jumps as content arrives.

Menus anchor correctly to the invoking control; popovers never disappear behind native page views; drag targets remain stable; resized panes respect usable minimum widths. Focus returns to the control that opened a menu/dialog. Escape dismisses the topmost temporary surface before affecting unrelated content.

The sidebar never steals focus because a task finishes. A stream follows the bottom only if the user was already following; scrolling upward preserves position and shows an unobtrusive return-to-latest control. Very long chats, tab lists, code output, and tables use measured virtualization without breaking selection, copying, search, or accessibility.

Accessibility ships with each feature: keyboard navigation, VoiceOver names and ordering, visible focus, sufficient contrast, reduced motion/transparency, text scaling, and IME composition. Use semantic tables for ordinary tabular output; use interactive ARIA grids only with the full required keyboard behavior.

### 3.3 Keep the default surface small

Keep the current sidebar as the single global navigation structure. The default layout has one primary page/chat/workspace surface and, when useful, one companion pane. Additional splits, files, or Console appear by deliberate user action or an explicit request to show them; preserve the user's chosen layout afterward. Narrow windows collapse secondary surfaces without discarding their state.

Attaching a Project makes its existing tools available; it does not automatically open Preview, Changes, Files, and Console simultaneously. Task execution does not create a permanent manager panel. Memory, Skills, Connections, and Library remain discoverable through existing menus/search/settings or deliberate pins, not mandatory new sidebar sections or nested navigation rails.

Keep normal actions visible where expected, with keyboard and menu alternatives; minimalism must not make essential controls hover-only or command-palette-only. Use familiar labels such as Files, Changes, and Open preview. Keep run IDs, leases, checkpoints, policy names, model-routing events, and token counters out of normal conversation chrome. Optional cost/details belong in a deliberate secondary view.

New persistent chrome needs a demonstrated repeated user need. Prefer an existing control or contextual action. Test usefulness and discoverability before adding another switch, badge, toolbar, mode, or onboarding step.

## 4. Information architecture and shared state

The user sees a small set of familiar concepts. Internal execution concepts should not turn into top-level destinations merely because a table or service exists.

| Concept | Meaning and ownership |
|---|---|
| Profile | Browser account/storage and permission boundary. Owns cookies, site storage, credentials policy, history policy, and its Spaces. Separate from visual organization. |
| Space | A persistent organization for tabs, chats, pins, notes, Skills, and optional Projects within one Profile. Changing a Space does not silently change website accounts. |
| Tab | A browser page with stable identity, placement, lifecycle, and document generation. Main owns it. |
| Chat | The conversation, messages, drafts, attached context, and result references. One chat can appear in several supported presentations. |
| Task | A durable objective associated with a chat or Skill. Created internally when execution needs it; saving/pinning it remains an optional user action. |
| Run | An internal execution attempt or continuation. Retries remain associated with the original task and chat. |
| Project | A repository or working folder, associated checkouts, preview, services, provider connections, and chats. Attached to a Space without coupling every chat to the same branch. |
| Environment | A local or cloud execution environment for a Project/task, with explicit identity, resource limits, and lifecycle. |
| Artifact | A useful output: document, spreadsheet, report, image, file, comparison, patch, or saved result. The chat presents it; Library supports later discovery. |
| Memory | Explicit notes/preferences plus optional captured context with provenance, scope, retention, and deletion. |
| Skill | A reusable task with parameters, requirements, allowed scope, and optional schedule. User-facing terminology replaces overlapping program/routine concepts. |
| Connection | A configured model, service, external agent, or MCP integration with visible capability and scope. Browser extensions retain their own lifecycle. |

Main is authoritative for the Profile/Space/Tab catalog and browser organization; its persistence worker stores that catalog. Runtime owns chat/task/Skill/project execution records referencing stable catalog IDs. The renderer owns transient layout and selection. Personal layout preferences are persisted through one explicit settings path, not reconstructed from agent events.

Use stable opaque IDs rather than names as identity. Define deletion and movement behavior between stores before implementation. Archive a Space with retained work; never silently cascade-delete chats/projects because its visual container is removed. Cross-profile moves create a new page in the destination identity after a clear user action; cookies and credentials do not move with a tab.

For the private alpha, retain one regular Profile plus a separate private boundary, while carrying `profileId` in contracts. By the broader daily-browser beta, deliver multiple persistent Profiles with real account-isolation tests, so work and personal accounts do not depend on visual organization alone. Do not market Spaces as account isolation.

## 5. The complete acceptance journeys

These journeys define the product across workstreams. Each must be exercised in the real desktop app, including failure and return paths.

| ID | Journey | Expected result |
|---|---|---|
| J1 | Launch with many saved tabs; type immediately; open a page; switch/reorder/split tabs; collapse/reveal sidebar; restart. | Fast interaction, correct organization and focus, no unnecessary background loads, reliable restoration. |
| J2 | Ask about a page; select text; add another tab and a file; expand/collapse the same chat; follow a source; revise the answer. | One conversation, stable draft/context, useful streaming, relevant sources, coherent layout. |
| J3 | Delegate work on signed-in sites; continue browsing elsewhere; correct the task; take over one page; resume; receive a result. | Work completes within scope without redundant approvals, focus theft, duplicated effects, or a separate review ceremony. |
| J4 | Compare information across sites and a document; produce a spreadsheet/report; ask for an edit; reopen it later. | Accurate cited output, useful preview, real editable/exportable file, correct revision and provenance. |
| J5 | Attach a repository; open an issue; reproduce in preview; ask for a fix; inspect/edit a file; run tests; view the diff. | A functioning workspace tied to the same chat, routine edits/tests without reapproval, correct checkout, preserved user changes, working preview, honest test result. |
| J6 | Open an incident; gather permitted console/network context; use a connected agent; return to the updated preview. | Correct project/account, useful reproduction context, no secret leakage, smooth handoff and reconnection. |
| J7 | Continue eligible project work in cloud; close desktop; reopen; recover outputs; return changes locally. | Real remote execution, clear auth/local dependencies, bounded spend, conflict-aware return, no false claim that a local process kept running. |
| J8 | Save a successful task as a Skill; rerun with parameters; schedule a read-only monitor; pause it; handle expired auth. | Repeatable behavior, meaningful notifications, no missed-run duplication, recoverable failures. |
| J9 | Sign in with SSO/MFA/password manager/passkey; join a meeting; share screen; upload/download; print. | Real platform/browser compatibility for supported workflows, including signed-build permission behavior. |
| J10 | Use private browsing, close it, inspect regular history/memory/agent access; forget saved context. | Correct privacy boundaries and deletion, with explicit exceptions for files the user chose to save. |
| J11 | Disconnect network; interrupt a model stream; kill runtime; crash a tab; restart during work. | Browsing continues where possible, drafts survive, effects are reconciled, useful recovery happens in context. |
| J12 | Complete J1–J5 using keyboard/VoiceOver, large interface text, reduced transparency, and a smaller window. | Core functions remain discoverable, readable, operable, and correctly focused. |

## 6. Performance and responsiveness contract

Record baseline measurements first on a signed release build, one current Apple Silicon reference Mac, and one older supported Mac. Fix OS, power mode, workload, network conditions, and sample count. Distinguish cold/warm starts, live/discarded tabs, and local/network-bound pages. Targets are initial engineering budgets to validate; changes to a budget need a documented tradeoff and user-visible justification.

| Measure | Initial budget or release condition |
|---|---|
| Local interaction acknowledgment | Visible response to click/key action within 50 ms p95; work begins immediately, before decorative transitions finish. |
| Live-tab activation | Input to correct visible frame ≤50 ms p95 on the reference machine; main's view-activation work targets ≤16 ms. Measure paint, not only a function return. |
| Shell startup | Usable shell ≤800 ms p50 / 1.5 s p95; independent of runtime/model availability. |
| First useful tab | Cached/local fixture paints within 1.5 s p50; report network-dependent pages separately. |
| Large-session restore | 100 logical tabs usable within 1.5 s p95, active tab prioritized, background materialization bounded. Count both tabs and actual renderer processes. |
| Omnibox local results | <10 ms p95 with 50k history entries; end-to-end UI updates within 50 ms p95. |
| Input under load | No repeated >50 ms main/shell stalls from agent work, indexing, import, persistence, or streamed output. Preserve the foreground budgets under the standard background workload. |
| Chat acknowledgment | User message and working state visible within 100 ms; composer remains usable. |
| AI latency | Record time to first useful text, first safe action, and verified completion. Initial target: first useful text ≤2 s p50 and first safe action ≤2.5 s p50 for designated simple reference tasks/provider. Do not generalize to every task/network. |
| Stop/takeover | Feedback ≤100 ms p95; local revocation prevents subsequently authorized dispatch. Already-in-flight external effects are handled separately. |
| Local search | Memory/document retrieval <50 ms p95 at 20k indexed documents on reference hardware; heavy indexing off the UI thread. |
| Energy/memory | Track whole process tree, CPU, wakeups, disk writes, and energy for 20/100-tab workloads, active agents, media, and idle. Require no material regression as features land, then measure improvements against a reference browser. |
| Bundle/startup assets | Initial renderer JS target ≤300 KB raw and shell CSS ≤80 KB; installed app <300 MB is a stretch target subject to correct packaged behavior. Lazy loading does not reduce installed bytes by itself. |
| Reliability | Record crash-free active hours/sessions, hangs, lost acknowledged state, recovery outcomes, and update failures. No known reproducible tab/draft-loss or duplicate-effect bug may pass a release gate. |

Use the existing `browser-health.ts` machinery and task benchmark reports. Add bounded local metrics, not a background analytics product. Telemetry stays off unless a user opts in; performance collection must not include page contents, credentials, or secret-bearing URLs.

Foreground input wins scheduling priority. Agent observations, indexing, imports, thumbnail work, summaries, and background restores yield under foreground load. Bound concurrent work globally, by provider, and per tab. A page kept alive for a running task has an owner and a lifecycle reason that ends when the work ends; surface ownership in the existing tab/task context when useful, not as another persistent overlay.

### 6.1 Optimize the actual path to the result

The budgets above are ceilings to improve on, not artificial delays to fill. Profile input → dispatch → page/result paint, and request → context → model → action → verified outcome. Report p95 and long stalls as well as medians. Optimize the largest measured waits; do not trade a faster demo for worse input latency, battery use, correctness, or recovery.

Keep native browsing deterministic and local: no model routing, runtime handshake, remote policy check, or catalog fetch before a human action. Query local indexes immediately and merge optional remote results later. Use event-driven readiness, cancellation, bounded batching, and valid cached snapshots; remove fixed sleeps, duplicate page reads, redundant requests, and unnecessary cross-process round trips. Cancellation propagates to work that is no longer useful.

The AI path should not add a blanket planning, permission-classification, approval, or summarization model call to every action. Scope/target validation stays in the trusted execution path; qualified simple requests use the shortest correct route. Parallelize independent work within budget and stream useful output promptly. Do not speculate irreversible actions or prefetch authenticated destinations outside the user's intended scope.

Compare cold/warm loads and foreground p95 against the previous accepted Aux build and a matched Chromium reference workload. Treat a repeatable foreground regression exceeding measurement noise as a release finding even if it still fits an absolute budget. Critical-path improvements land throughout R1/R2; they are not deferred to a final polish milestone. Browsing with AI disabled and browsing under agent load are both required performance runs.

## 7. Architecture to implement

### 7.1 One owner per fact

| Layer | Owns | Required boundary |
|---|---|---|
| Renderer | Presentation, transient selection, pane geometry, text editing, optimistic feedback. | Typed narrow IPC; no arbitrary Node access; no model/runtime round trip in the human navigation path. |
| Desktop main | Tab/Profile/Space catalog, native views, lifecycle, permissions, final local actuation gate, window/input ownership. | Bounded in-memory operations; validate sender and command; no large synchronous database or import work. |
| Browser persistence worker | Durable browser catalog/history/bookmarks/favicon/session state and search indexes. | Versioned requests, batching, backpressure, explicit durable acknowledgments, recovery snapshots. |
| Runtime process | Tasks/chats, planning, model transport, agent execution coordination, durable action records, memory, Skills, project orchestration. | Crash isolation; validated/authorized API for every client; no ownership of human tab lifecycle. |
| Trusted Chromium adapter | Observe and operate the granted native page, using semantic/visual capabilities. | Stable identity/generation/lease validation; attach only when needed; no unrestricted external CDP exposure. |
| Project/environment workers | File operations, commands, services, cloud jobs, indexing, and heavy document work. | Correct checkout/environment scope, bounded resources, cancellation, output recovery. |
| Private process | Private windows and ephemeral state, reusing safe shared UI/controller code. | No regular runtime/agent bridge or shared debugging endpoint; separate storage and permissions. |

Target modules should follow responsibilities, not arbitrary line-count ceilings. A reasonable direction is `main/tabs`, `main/sessions`, `main/omnibox`, `main/browser-store`, runtime `agent`, `models`, `pages`, `memory`, `projects`, `environments`, `api`, and `store`. Reuse functioning modules behind narrow interfaces and remove old paths only after their replacement passes relevant journeys.

### 7.2 Human command and event protocol

Human commands carry `commandId`, `windowId`, expected catalog version where necessary, and stable target IDs. Main validates the actual sender and Profile scope. New-tab UI may mint an ID optimistically; main accepts or rejects it explicitly. Navigation begins immediately and reports progress asynchronously; the address field never waits on DOMContentLoaded.

Every accepted command receives an outcome acknowledgment. Repeated command IDs are deduplicated. Failures reconcile optimistic UI without overwriting a later command. Main publishes ordered, versioned patch batches; a gap or reconnect requests a fresh snapshot. Do not discard a patch because a renderer was briefly suspended.

Renderer start can use a small bootstrap snapshot. Large history/session reads and imports stay in the worker. The shell can render a lightweight frame while the worker loads the catalog. Keep browser-ready, runtime-ready, and agent-attached-to-tab as separate states.

### 7.3 Agent control protocol

Every agent action includes principal, task/run ID and task revision, Profile ID, Tab ID, tab-instance generation, document/observation identity, control epoch, and command ID. Bind any authorization to the relevant target/account/action scope. The final trusted dispatch path checks the current lease and revision immediately before action delivery.

Human input that changes a page revokes agent control for that page locally before subsequent agent input. Viewing a preview or moving the pointer does not spuriously transfer ownership. Taking over one tab leaves unrelated tasks alone. The runtime learns the transition through events and reconciles its work.

Raw external CDP is not an alternative public API. External agents use the same scoped broker. Prefer per-WebContents/inherited private transport over a browser-wide exposed debugging listener if the compatibility spike supports it. While a global endpoint remains, preserve the private-process boundary and document same-OS-user threat limitations. Agent scopes cannot claim protection against a transport that bypasses them.

### 7.4 Persistence and recovery

Keep `synchronous=FULL` on the authoritative action journal. SQLite WAL `NORMAL` can lose committed transactions after power loss; use it only for a demonstrably rebuildable cache if needed. Application-level synchronous code is not a durability substitute. [SQLite documentation](https://www.sqlite.org/pragma.html#pragma_synchronous).

Persist accepted chat messages and important task transitions before exposing them as durably saved. Drafts auto-save off the render path; window close flushes when possible. Browser session state has an explicit persistence window and a write-ack boundary: instantaneous visible navigation need not wait for disk, but a display acknowledgment must not be mislabeled a durable save. Test loss of unacknowledged recent state separately from loss of durable state.

Keep an intent durable before consequential agent dispatch. Record outcome afterward. A failed connection can leave an uncertain effect; do not automatically repeat it. Local deduplication is not a universal exactly-once guarantee for remote websites. Use server idempotency where an integration actually supports it, and independent reconciliation elsewhere.

Recover to a usable browser even if runtime data is unavailable. Recover chats/tasks without silently restarting irreversible work. Profile upgrades after the development reset require versioned migrations, backup/recovery behavior, and tested update compatibility.

## 8. Browser workstream

### BR-01 — Native navigation and tab ownership

Move human open, activate, navigate, back/forward, reload, stop, close/reopen, mute, pin, duplicate, split, and cross-window operations into the main-owned tab controller. Preserve native popup/opener/referrer behavior and browser-history semantics. Agent requests that open or close pages use this same controller through scoped commands.

Land complete slices rather than replacing the entire shell at once: navigation/activation, then close/reopen/popups, then movement/split, then restoration/lifecycle. Each slice switches authoritative ownership once, reconciles events, and deletes its superseded runtime path. Private windows reuse the shared controller implementation within their separate process.

**Acceptance:** J1 works with the runtime child killed or missing; address input remains editable during loading; a popup is adopted once; close/reopen restores expected history; stale/repeated commands cannot affect another tab. Start in `main/index.ts`, `main/native-views.ts`, renderer `store.ts`, runtime `services/pages.ts`, and the Chromium driver.

### BR-02 — Responsive stores, layout, and startup

Replace broad page-array subscriptions with stable ID lists and per-tab selectors. Update only the affected row/status/progress surface. Persist layout only when its structure changes. Keep stage updates dependent on geometry/visible tabs, not unrelated page events. Add an app-root error boundary and a recoverable renderer-crash path.

Split renderer state by responsibility without duplicating authority. Keep shell-critical code small; lazy-load heavy document viewers, terminal/editor features, and rarely used settings. Move shared URL helpers out of heavy Markdown modules. Load essential fonts deliberately; keep multilingual fallback behavior.

Create the shell promptly and make extension/runtime startup independent where safe. Existing user-installed security or content extensions that must run before a page loads require an explicit startup readiness policy; do not open pages unprotected just to improve startup numbers. Remove busy waits and repeated full refreshes.

**Acceptance:** foreground budgets in Section 6 hold during a ten-tab load storm and streaming chat; loading one tab does not rerender every row; runtime startup or a slow optional integration cannot block shell input.

### BR-03 — Lifecycle, restoration, and resource management

Use explicit placeholder/live/frozen/discarded/crashed states. Restore active tab first; load other saved pages on activation and under bounded idle scheduling. Keep stable logical tab IDs across materialization but increment the tab-instance generation when a WebContents is replaced.

Freeze/discard only when safe. Protect active/split, audible, captured, downloading/uploading, unsaved-editing, and agent-held pages; keep uncertain pages alive. Collect minimal isolated dirty-state hints covering paste, autofill, drag/drop, rich editors, and relevant frames. Avoid a full-DOM walk on every routine lifecycle decision. Do not treat absence of a keyboard event as proof of safety.

Preserve URL/title/favicon, recoverable navigation history, and appropriate scroll state. Test `navigationHistory.restore`, process ownership, renderer crashes, unload vetoes, and active media before relying on them. Qualify warm tabs, preconnect, BFCache, and debugger detachment with measured resource benefits. A paused task releases unnecessary resources; an active task holds only the pages it needs.

**Acceptance:** J1/J11 restore safely, no known unsaved-work loss, measurable memory reduction on an eligible idle-tab workload, and no foreground slowdown. Use `page-suspension.ts`, `offscreen-holds.ts`, native views, and existing unsaved-work smoke tests.

### BR-04 — Omnibox, commands, and fast retrieval

Unify local providers for open tabs, history, bookmarks, recently closed tabs, and commands. Maintain a bounded hot index and worker-backed FTS fallback. Rank by actual intent, prefix/title matching, frequency/recency, and source relevance. Deduplicate, preserve keyboard selection across updates where possible, and keep an explicit search option.

Use query sequence IDs and cancellation so stale responses never replace current results. Add inline URL completion only when confidence is high and selection/editing works conventionally. Support keyword search engines and a shared command registry. Search suggestions are a clear preference, disabled in private mode; do not send probable private/intranet addresses or arbitrary typed context to remote suggestion services.

Test explicit schemes, domain-like text such as `node.js`, localhost, IP/ports, intranet names, pasted URLs, punctuation, non-English queries, and IME composition. A TLD list helps classification but is not the whole intent policy. Calculator/unit shortcuts are optional after the main ranking/latency behavior passes.

**Acceptance:** J1 and local result budgets pass; learned common destinations are easy to reach; Escape/Tab/Enter/selection behaviors are stable; ambiguous input is recoverable without surprises. Begin with `CommandBar.tsx`, `chrome.ts`, history/bookmark services, and shortcut tables.

### BR-05 — Organization and everyday browser completeness

Preserve Spaces, pins, folders, tab search, multi-select, drag reorder, cross-window movement, collapsed sidebar, and horizontal layout. Add missing group color/emoji/collapse behavior through the existing row language. Group agent-created tabs under the owning task without moving unrelated human tabs. Let users keep, move, or close those tabs normally.

Deliver persistent work/personal Profiles by R2 using the existing compact profile/Space controls. Isolate cookies, permissions, extensions, history/memory, and agent grants; define routing for external links without leaking account context. Profile switch and profile deletion are distinct actions. Test the same site signed into different accounts, including popups, downloads, suggestions, and cross-window moves.

Complete and test downloads with progress/cancel/retry/show-in-folder; uploads and native file pickers; clipboard; find; persistent per-site zoom and pinch zoom; print/PDF; reader; context menus; save/open files; standard form autofill; media keys; mute; meeting devices; screen sharing; fullscreen; PiP where supported; site notifications; mouse back/forward; and trackpad navigation that respects horizontal page scrolling.

Use one shortcut registry across application menus, web page interception, and renderer dispatch. Include customizable bindings with conflicts explained. Add default-browser registration, readable site controls, permission persistence/revocation, and browser error/reload surfaces. No dead controls or “coming soon” substitutes in core flows.

Reading list is a bookmark subtype with `readAt` and optional offline artifact, keeping one ownership path. Cosmetic preferences must not turn it into a second bookmark system.

Browser completeness is a release floor, not an optional feature menu: reliable navigation/history and reopen, bookmarks/organization, usable address/search, real login/account isolation, file/media/meeting flows, permissions/site controls, private browsing, accessibility, restore, and signed updates must work in the claimed release scope. “Qualify” means proving shipped behavior, not substituting a compatibility note for a missing essential flow. An essential login/extension/meeting failure blocks the daily-driver claim for that audience. Minimal UI is achieved through placement and defaults, not removing browser basics.

**Acceptance:** J1/J9/J12 pass on the declared compatibility matrix. Preserve existing working implementations; close verified gaps rather than rewriting them from inventory labels.

### BR-06 — Import, credentials, passkeys, and extension compatibility

Make switching practical. Import starts with a preview of supported categories and a clear partial-result report. Implement Chrome/Arc bookmarks/history/open tabs and supported Arc Space/folder/pin/title metadata first; add Safari/Firefox through supported access paths. Copy live databases with a consistent snapshot/WAL-aware method; never modify the source profile. Large imports are cancellable and run off the UI thread.

Establish a real human login solution early: qualify 1Password/Apple Passwords/passkeys and necessary native messaging on a signed build. If essential workflows are unsupported, choose and implement a concrete integration/host solution or an appropriately scoped native password experience before claiming daily-browser readiness. The agent credential broker already provides useful foundations but is not automatically a complete human password manager.

For a native credential experience, use the existing secret store with origin/frame/account checks, lock/unlock, save/update prompts, generator, explicit import/export, and trusted fill. Secrets never enter model context. A task grant refers to opaque credentials. Do not assume Chrome Login Data or cookies can simply be decrypted/imported; offer supported explicit migration or fresh login. Test wrong-origin frames, lookalike domains, session changes, and keychain continuity.

Publish an accurate extension support matrix and qualify required APIs, updates, and native messaging. Electron does not provide general Chrome Web Store compatibility out of the box. [Electron extension documentation](https://www.electronjs.org/docs/latest/api/extensions). DRM/passkeys/full extension requirements receive an early feasibility decision, not a late surprise.

**Acceptance:** J9 works with actual authorized test accounts, devices, and the signed application. Synthetic OAuth/WebAuthn fixtures supplement but do not replace that proof.

### BR-07 — Private mode, content blocking, and site behavior

Retain private browsing in a process without the shared regular debugging endpoint. Share safe UI/controller code to reduce duplication. Private history, tabs, thumbnails, permissions, memory, extension state, and agent context never enter regular persistence. Files the user chooses to save remain on disk and are explained plainly. Fix private search directly rather than waiting for a large refactor.

The existing `private-boundary-desktop.mjs` test and stored result demonstrate that an in-memory session alone remains visible through the shared debugger. Runtime filtering is insufficient. Any future process consolidation must first pass equivalent discovery, attachment, observation, persistence, and shutdown/crash tests.

Ad/tracker blocking uses maintained filter lists and a shared request-policy router, with cached/offline startup, atomic updates, per-site controls, and a recoverable broken-site escape. Integrate cosmetic filtering through a minimal isolated preload. Only one owner installs each Electron request-event listener; later listeners otherwise replace earlier ones. [WebRequest documentation](https://www.electronjs.org/docs/latest/api/web-request).

Add HTTPS-first with a comprehensible failure path, explicit local-development handling, and scoped site permissions. Keep certificate validation separate; a local development exception cannot disable TLS checks for ordinary websites. Implement or explicitly qualify phishing/malware/download protection; adblocking is not a substitute for those protections. Resolve service licensing/privacy choices before public claims.

Favicons come from the page/session or a local fallback, not third-party hostname lookups. Translate starts with requested selection/page translation, clear remote-processing behavior, and reliable Show original. Avoid changing form values or executable content; qualify dynamic framework pages before automatic translation. Use robust language detection and preserve international PDF/fonts behavior.

**Acceptance:** J10 passes; blocked-site exceptions are understandable; request policies compose; private content remains inaccessible to every agent route.

## 9. Chat and conversational workspace workstream

### CH-01 — One conversation across presentations

Share chat ID, draft, attachments, context, selected Project, reply state, and history across quick question, side panel, full chat, and workspace. Preserve text and attachment operations through navigation, provider failure, panel collapse, and restart. Switching an active browser tab does not silently change an existing conversation's pinned context.

New page questions default to the initiating page. Explicitly attached context remains stable; following the current tab is a visible option. Show closed/stale/missing context with a useful reopen or replace action. Opening a source never destroys the conversation or its scroll position.

**Acceptance:** J2/J11 pass with unsent text, an in-progress attachment, long history, and a failed provider. Start from `Conversation.tsx`, conversation context/draft stores, `BrowserContextPicker`, and the existing lifecycle/context smoke tests.

### CH-02 — High-quality streamed answers and artifacts

Add sequenced text/citation/artifact events to the shared contracts and persist enough stream state for reconnect/replay without duplicated text. Render partial Markdown safely, keep tables/code legible, and batch UI updates to avoid expensive work per token. Do not stream a completion claim before its action is verified.

Citations point to the relevant source/document/page location where possible. Explain an unavailable or changed source instead of silently substituting one. Images, documents, spreadsheets, and code previews open directly from chat. Generated files are real downloadable/editable artifacts, with names, revisions, and locations that stay understandable.

Consolidate overlapping result/dataset/saved-result concepts behind typed artifacts; retain specialized viewers where useful. Support the current PDF/image/text/CSV/DOCX/XLSX paths with bounded parsing in workers and safe preview surfaces. Untrusted documents/scripts cannot acquire shell privileges. Preserve formatting/data during edits and report unsupported content accurately.

**Acceptance:** J2/J4 pass; a resumed stream produces one final answer; links and artifact versions remain correct; long outputs keep scrolling/input fluid. Core results are readable without opening an extra administration screen.

### CH-03 — Steer, stop, resume, and complete naturally

The composer stays usable while an agent works. A new message defaults to steering the current task when appropriate; independent requests can start a separate chat/task deliberately. Display whether a message is applied now or queued. Do not let a queued instruction silently apply to the wrong run or stale task revision.

While working, show one compact status that updates in place, with Stop as the primary control. Take over appears when a page is actually being controlled; Pause/Resume and other controls appear when relevant. Ordinary manual interaction already takes over that page. Do not create a toolbar of every possible runtime action.

Tool activity is hidden by default behind a deliberately opened Details view, not one collapsed transcript card per tool call. Do not present model chain-of-thought. Apply the output defaults in Section 2.6: quick tasks can go straight to the answer, longer work gives meaningful updates, and completion is one conversational result. No duplicate success badge, receipt, checklist, toast, and answer describing the same event.

Ask for missing input inside the conversation. Preserve the user's reply draft while waiting. After an actual failure, explain what completed, what did not, and the smallest useful continuation. Do not make users manually accept evidence before the task can finish.

If an existing “Inspect result” or “Review work” action remains, it asks the AI to explain the work in the current chat, optionally opening the relevant preview or diff. It never opens an audit mode or a separate receipts screen.

**Acceptance:** J3/J11 pass across streaming, tool dispatch, model reconnect, and human takeover, including the friction checks in Section 18.5. Cancellation prevents queued actions from restarting when an old stream reconnects.

### CH-04 — Onboarding, finding work, and useful defaults

Browsing works immediately without an AI account. First run opens a usable browser; import, default-browser selection, and a useful optional AI task are lightweight, skippable entry points, not a wizard blocking the first tab. Ask for native/service access when its feature is first used, not all at startup; remember declines without nagging. Preserve the current restrained new-tab composition. Show real recent work and relevant continuation; no fake activity, unread-receipt widgets, or a dashboard of every product capability.

Connections provides a coherent place for models, services, and external agents. Clearly distinguish the built-in Aux agent from a connected coding agent and explain whose model/account is running. Use one good default model route after qualification, respecting the user's existing choice; expose presets and advanced controls secondarily without making provider/model selection a required step in every chat. Remember valid setup and task context rather than asking for them again on each run.

The initial developer/private alpha can use a user-provided Gateway key or supported local provider. Before broader beta, make a product decision on managed onboarding/billing versus a deliberately BYO audience; do not invent subscription-login integrations or ship a claimed one-click experience that requires undocumented setup. Provider outages and exhausted budgets leave browsing and stored work available.

Unified local search finds chats, saved outputs, history, bookmarks, notes, and Projects with clear type/scope filters. Keep Library for saved work and history recognizable as browsing history. Background-task notifications are meaningful and coalesced; do not duplicate a result notification while the user is already reading that chat.

**Acceptance:** a new target user completes J2 and returns to prior work without coaching; setup interruptions preserve their progress and drafts.

## 10. Agent capability and runtime workstream

The target is human-equivalent breadth on supported ordinary website workflows, with better speed, repeatability, and cross-page synthesis where possible. Establish that through task outcomes. A fast assistant that only reads simple DOM pages does not meet the goal; neither does a capable agent that makes the human browser unpleasant to use.

### AI-01 — A grounded view of the actual page

Combine semantic DOM/accessibility information, visible content, frame structure, relevant text, and screenshots when needed. Preserve existing compact observations, occlusion/offscreen handling, repeated-content collapse, change detection, and grounded element references. Mark truncated/omitted content explicitly so the planner knows when to ask for a table, subtree, frame, or larger context.

References are scoped to tab instance, document generation, frame, and immutable observation snapshot. Handle SPA navigation, same-document updates, detached/replaced nodes, popup adoption, shadow DOM, virtualized lists, scrolling, and cross-origin frames within the task's permitted scope. A snapshot of a page is not permission to observe unrelated tabs or accounts.

Eliminate duplicate observations only when reuse is valid for scope, age, generation, and postcondition. A page can change without another agent action. Replace the old “one observation per turn” target with a measured duplicate-observation rate and explicit freshness reasons. Keep reference registration and revision updates serialized until immutable snapshot semantics are proven; initially parallelize across pages and coalesce identical same-page requests.

**Acceptance:** correct targets across navigation/reflow/frame changes, no cross-snapshot ref confusion, useful observations on long/dynamic pages, and no skipped verification merely to meet an observation count. Extend `playwright-page.ts`, page observation/ref stores, and coordinator verification.

### AI-02 — Complete interaction coverage

Use semantic actions first for speed and precision. Use visual grounding and coordinate actions for custom/canvas interfaces or inadequate semantics, with screenshot dimensions, scale, scroll position, and generation tied to the action. Both modes obey the same control and authorization rules. Re-observe after a layout/navigation change rather than clicking a stale coordinate.

| Capability | Required real behavior |
|---|---|
| Navigation and tabs | Links, redirects, new windows, popups, back/forward, tab creation, waits, and downloads preserve page identity and browser state. |
| Forms | Text, checkboxes, radio/select controls, date pickers, validation errors, rich text, autocomplete, keyboard shortcuts, and multi-step forms. |
| Complex pages | Nested frames, permitted cross-origin/OOPIF content, shadow DOM, virtualized tables, infinite scroll, sticky overlays, custom controls, and canvas interactions. |
| Files and artifacts | Trusted file selection from authorized inputs, upload progress, download arming/completion, generated files, and correct linking into chat. No arbitrary local-file discovery. |
| Auth and interruptions | Detect expired login, MFA/passkeys/CAPTCHA, native dialogs, account ambiguity, permissions, and unavailable site capabilities; request the specific human action and resume afterward. |
| Reading and synthesis | Extract complete relevant data, reconcile conflicting sources, produce grounded comparisons/reports, and acknowledge missing evidence. |

Do not bypass site access controls or pretend every biometric/CAPTCHA/OS prompt can be automated. Those are bounded handoffs inside an otherwise continuous workflow. Avoid broad “I can't use that website” failures when a supported visual or keyboard path exists.

**Acceptance:** coverage cases in every row, success on held-out dynamic workflows, and recoverable human handoffs. Compare agent outcomes with a human completing the same supported task, not merely with a tool's return code.

### AI-03 — Validated planning and provider-correct streaming

Retain a strong internal discriminated action schema. Generate provider-compatible tool schemas through explicit adapters; keep semantic validation and authorization after decoding. Strict providers have different supported subsets: for example, OpenAI requires required fields with nullable values for optional semantics and allows supported nested unions. [Structured-output documentation](https://developers.openai.com/api/docs/guides/structured-outputs).

Test actual provider routes through the selected Gateway/SDK version. Treat truncation, refusal, unsupported options, malformed arguments, repeated fields, and stream interruption as normal recoverable cases. Fine-grained tool deltas may be incomplete or invalid; property order is not a permission or validation boundary. [Anthropic streaming documentation](https://platform.claude.com/docs/en/agents-and-tools/tool-use/fine-grained-tool-streaming).

Use one execution pipeline for streamed, non-streamed, repaired, and Skill-produced actions. In the first release, consequential actions wait for a complete validated action/tool-call envelope and durable intent. Reduce latency through small action envelopes, fast context, caching, and safe preparation; do not wait for an entire long multi-action plan unnecessarily. Independently validated low-risk operations can dispatch early only with a fixed target/control envelope and tested cancellation behavior.

Local models without strict tools receive a bounded JSON/text adapter with the same post-parse validation. A fallback must be selected by tested capability, not by guessing from a model's name. Never replay completed effects because parsing a later chunk failed.

**Acceptance:** one behaviorally equivalent execution path; every supported step variant round-trips; invalid streams produce no unauthorized action; real-provider tests distinguish schema quality from semantic task quality.

### AI-04 — Models, context, and efficiency

Create one typed registry for model IDs, route/provider options, context/output limits, modalities, structured-output support, streaming, reasoning options, caching, and current pricing metadata. The UI, runtime, mocks, and settings use it. Keep a known-good offline snapshot; refresh capabilities and verify selected routes without making basic startup depend on catalog availability.

Initial candidates include the currently listed Sonnet/Haiku/Opus, GPT Luna/Mini, Gemini Flash, and other qualified models. Both `alibaba/qwen3.8-27b` and `openai/gpt-5.6-luna-fast` were present in the live catalog during the September 22 review; do not blacklist them as invalid identifiers. [Gateway model discovery](https://vercel.com/docs/ai-gateway/models-and-providers), [live catalog](https://ai-gateway.vercel.sh/v1/models).

Offer a small set of useful presets after evaluation. Route by task requirements: lightweight extraction/formatting can use a utility model; difficult repair may need a stronger model; visual interaction requires qualified vision. Apply reasoning effort based on measured task outcomes rather than a universal low-effort rule. Bound escalation count, spend, and provider changes.

Replace fixed tail truncation with task-aware context selection: goal and constraints, current target state, unsatisfied criteria, recent failures, relevant form/table content, then secondary context. Preserve provenance. Compact long histories without dropping authorization, pending effects, account choice, or the user's latest correction. Use provider-supported prompt caching and report actual cache usage; do not require an impossible universal cached-token floor.

Put indexing, summarization, parsing, and optional local inference outside the main/UI thread. Local-model discovery is opt-in and informative about capability/resource requirements; an on-device inference mode never silently falls back to remote processing.

**Acceptance:** better verified success/cost/latency on the task corpus, no hidden provider-policy change, and correct behavior when a model is unavailable or a catalog request fails.

### AI-05 — Bounded concurrency, steering, and ownership

Use per-tab exclusive action lanes and safe snapshot reads, plus bounded cross-tab fan-out. A task has global token/dollar/time/step budgets shared by its children. Foreground human work gets priority. Stop cancels queued model calls, pending tool work, and child tasks; losing a UI connection does not create another task.

User steering increments a task revision. Apply it at a safe execution boundary; invalidate incompatible queued plans and recheck the current page. “Pause” preserves a resumable checkpoint; “Stop” ends ongoing execution while retaining the conversation. A takeover revokes only the affected page's lease, then the task either continues independent work or waits naturally for that page.

**Acceptance:** J3 under multiple tabs/windows, two independent tasks, concurrent human input, and a delayed provider. No task can accidentally drive another's replacement tab or keep browsing frozen while waiting for a model.

### AI-06 — Completion, uncertainty, and restart recovery

Make completion task-specific. For a read, verify the answer against source content; for a file, verify the output exists and its important contents; for a project fix, verify relevant checks and actual preview behavior; for a remote write, verify an appropriate remote outcome when possible. A successful click, HTTP call, or model declaration is insufficient by itself.

Keep intent/outcome/verification records internally. Explain a relevant partial or uncertain result in chat with concrete wording. Avoid claims of remote confirmation where only local page state was observed. Undo is a new action governed by the current state and user request; some effects are irreversible.

Checkpoint task revision, scope/account, goals, budget, control epoch, current pages/observations, outcomes, and unresolved effects. On restart, restore browser state first, reconstruct task state, re-observe needed pages, and check access. Continue compatible read-only work under existing authority. Resume consequential work only when its prior scope remains valid and pending effects are resolved; ask a focused question if state or authority changed materially.

**Acceptance:** kill-before/after dispatch, network loss after submission, disk-full/journal failure, stale checkpoint, account change, provider timeout, and human takeover produce correct recovery without silent duplicates.

### AI-07 — A task-quality improvement loop

Build a versioned corpus around J2–J8, with simple and difficult tasks, independent state oracles, live holdouts, and adversarial untrusted content. Include browser state changes, inaccessible controls, files, auth interruptions, and recovery. Do not use only the existing eight local fixtures as a proxy for general capability.

Classify failures as perception, grounding, planning, interaction, auth, verification, provider/transport, product UX, or environment. Fix the largest observed failure families. Re-run solved failures after model/schema/browser updates and compare total user effort as well as raw agent time.

**Acceptance:** releases improve real success without higher unauthorized-effect or duplication rates. An easy-case benchmark gain cannot hide a regression in logins, takeover, recovery, or foreground browsing.

## 11. Development workspace and connected-agent workstream

The workspace is part of Aux's core promise. Build a useful browser-centered development environment around the current `TaskWorkspace`, `ProjectFileEditor`, `ProjectCommandPanel`, local-project services, and cloud service. Avoid replacing working components with decorative mock versions.

### WS-01 — Projects and workspace continuity

Attach an existing folder/repository or create a new project through the conversation or Project control. Show the selected project and actual branch/checkout unobtrusively. A Project can have multiple chats/tasks and isolated working trees; distinguish the canonical project from a task's checkout. Reopening the chat restores its environment, preview, file drafts, and command state.

Preserve the current outer sidebar. Reveal a compact Project section only when a project is attached. Keep Preview/Changes/Files as workspace surfaces and Console as an expandable tab/drawer according to available space. Chat stays present or one predictable action away. Opening a file or diff from a message opens the right surface without losing the conversation.

Respect existing uncommitted changes. Prefer an isolated checkout for concurrent agent code changes, but preserve the user's deliberate choice to work directly. Pick a sensible checkout/environment default and show it unobtrusively; ordinary users should not need to understand worktree topology before asking for a fix. Record the starting commit/tree and preexisting modifications. Do not label unrelated user changes as the agent's work.

**Acceptance:** J5 with two project chats, independent branches, a dirty source checkout, and an app restart. Context never silently switches to another folder or branch.

### WS-02 — Files, editing, changes, and review in context

Provide a useful file tree, quick-open, bounded repository search, line navigation, syntax-aware editing, selection-to-chat, and readable diffs. Keep large/binary/generated files responsive through limits and appropriate previews. Preserve working keyboard conventions, unsaved editor state, and external-editor changes.

Save with expected-content hashes and conflict detection. Create/rename/delete operations have precise targets and recoverable behavior. Resolve paths and symlinks against the granted project scope; a path inside a repository must not authorize arbitrary filesystem access through a link. Never overwrite an existing destination silently.

Changes supports file/hunk navigation, inline discussion, staged/unstaged awareness, and current baseline comparison. The assistant's result appears in chat with a link or inline diff when helpful. The user can ask for another change immediately; there is no compulsory evidence-acceptance screen.

**Acceptance:** J5 with concurrent external edits, unsaved drafts, renamed/deleted files, large diffs, and untracked files. Agent edits preserve unrelated work and failed saves do not lose the draft.

### WS-03 — Commands, services, and real previews

Console runs real project commands and services with working directory, environment identity, output, exit status, stop/restart, and bounded logs. Interactive terminal support must be a real controlled PTY when offered; do not present a log viewer as a terminal. Keep the terminal/editor packages lazy-loaded.

A clear coding request in the selected Project authorizes its ordinary file edits and test/build commands within the configured execution boundary; there is no separate Approve task ritual. Recheck scope and target integrity on every call without displaying those checks. Additional elevated access, destructive effects not already authorized, or publication/data transfer outside the request follows the focused boundary rule in Section 13. A new public research URL or routine project file is not automatically a new permission question.

Project commands are not sandboxed merely because they use a separate working directory or environment variables. Use an actual sandbox when promised; otherwise explain the local execution boundary during setup. Do not inject unrelated model/provider secrets into commands. Bound process groups and output, and terminate descendants predictably on Stop when owned by that task.

Preview discovers the appropriate service/port, waits for readiness, then opens a real browser tab when requested. Otherwise keep a ready preview available through the result without stealing focus. Preserve routing, hot reload, console/network diagnostics, and select-region-to-request-edit. Capture the selection with Project/checkout/page identity; do not attach a screenshot to the wrong task after tab switching. A failed build/service gets one concise chat explanation; detailed output stays in Console and opens on request.

**Acceptance:** a user can ask for a change, see the updated preview, edit a file manually, rerun tests, stop/restart the service, and resume the chat without reattaching the project.

### WS-04 — Issues, incidents, commits, and publication

Connect GitHub/Vercel/Sentry through the existing Connections model. A selected issue or incident provides bounded context and links to the relevant Project. Reproduce in a browser tab, collect relevant redacted diagnostics, make the change, run appropriate checks, and present the result naturally.

Supported commit/push/PR/deploy operations execute when included in the user's task authorization and use the correct provider/account. Present concrete changes before an additional authorization is needed; do not ask repeatedly for actions already requested. Production deployment, unexpected destructive changes, or a different destination must not be inferred from a generic request to fix code.

Interpret effects by operation semantics, not HTTP verb. Provider read operations may use POST; GET does not guarantee no effects. Existing read-only connectors stay enforced until the new scoped write path is implemented and qualified. A future product capability in this plan is not permission to mutate the founder's live services during development.

**Acceptance:** J5/J6 cover issue → fix → preview → diff and an authorized publication path. The recorded account, commit, checks, and destination match the chat; unrelated repository state is preserved.

### WS-05 — Connected agents and MCP

Make connecting one supported external coding agent easy before expanding the integration list. Reuse existing scoped connection tokens and revocation. Offer a clear setup action that shows what configuration will change, merges rather than overwrites existing settings, and provides a reversible/manual alternative. Never reuse the client's credentials as Aux credentials.

A connected agent receives only allowed tabs, task/project context, files, commands, and artifacts. It uses the same action and lifecycle boundary as the built-in agent. A chat can show which agent is working, its useful progress, and a returned artifact/diff; external actions performed outside Aux's tools must not be falsely reported as observed or controlled by Aux.

Tool catalogs are capability-based and concise, with typed operation schemas and useful errors. Visibility is a convenience; authorization is enforced on every call and event subscription. Include pagination, cancellation, reconnect, and resource-scope semantics. Preserve separate operations where their effects differ instead of hiding many permissions inside one catch-all tool to satisfy a tool-count quota.

Expose existing API/CLI/SDK/MCP capabilities consistently. Remove legacy `vector_*` compatibility after the agreed reset. Support revoking a live connection immediately, clear reconnect behavior, and truthful cancellation of external work only where the client protocol supports it.

**Acceptance:** one real user-configured client completes J5 through scoped tools; unrelated pages/projects/artifacts are rejected; revocation affects an already-running connection. Synthetic scope tests and actual client interoperability are recorded separately.

### WS-06 — Continue in cloud, and return safely

Continue an eligible project task in a real remote environment with source manifest, base commit, task revision, environment/worker identity, budget, expiry, outputs, and checkpoints. Local files and dependencies have explicit transfer rules. Secrets use the provider's scoped secret mechanism, not chat text or copied dotfiles. Personal browser cookies and local credentials do not move automatically.

Remote work survives desktop closure only when a durable remote worker actually owns it. Persist enough state to reconnect to the same job, recover logs/artifacts, cancel it, and collect outputs after failure. Implement provider-side resource/spend limits and TTL cleanup so stopping the local UI is not the only cost control.

For cloud browser work, show the actual remote session, identify its separate account state, and implement exact-session takeover before offering that control. If a task requires a local login/device/file, pause that dependent part clearly while independent authorized work continues. Do not disguise a separate fresh browser as the local authenticated one.

Return changes using the recorded base, a content manifest, and a three-way merge or explicit conflict resolution. Preserve edits made locally while cloud work ran. Link the returned preview/diff with a concise outcome in the original chat; open it when requested or when continuing an already visible preview. Cleanup preserves useful outputs and reports unresolved spend/deletion failures.

**Acceptance:** J7 includes desktop closure, network loss, worker restart/failure, task cancel, expired environment, local divergence, and artifact recovery. A local bookkeeping row alone does not qualify remote continuation.

## 12. Memory, search, and repeatable work

### ME-01 — Explicit memory and unified recall

Start with explicit Remember, editable preferences/notes, and searchable saved chats/artifacts. Keep automatic browsing memory opt-in per Space, with clear site exclusions. Ordinary history metadata and saved chat history do not require enabling ambient page-content capture.

Use a single durable source of truth per content type: user-edited notes under `memory/<spaceId>/MEMORY.md` and related note files; captured documents and their metadata in structured local storage; FTS/optional embeddings as derived indexes. Atomic writes, stable IDs, import/export, file-watcher rescan, and conflict handling make external edits reliable. A watcher event is only a signal to reconcile.

Index relevant title, URL, text, kind, time, Profile/Space/account scope, and source identity. Retrieval returns dated, attributed snippets and respects exclusions. Current-page answers do not silently incorporate another Space's material. A remembered fact can be stale; validate consequential facts against current permitted sources automatically where possible. Ask the user only if a material ambiguity remains, not to certify every retrieved fact.

**Acceptance:** fast search on the reference corpus, correct scope and source links, predictable note editing, and useful recall without ambient capture.

### ME-02 — Optional ambient memory and better retrieval

If enabled, capture only policy-eligible content with conservative sensitive-content handling and bounded retention. A page without a password field can still contain highly sensitive data. Exclusions apply before capture, screenshotting for memory, summarization, embedding, retrieval, and model transmission.

Add hybrid/semantic retrieval only when held-out questions show a material gap over FTS. Evaluate language coverage, quality, model-download size, CPU/memory/energy, and startup cost. Keep embedding/summarization workers low priority; local inference does not run in the shell process.

Forget removes source content and derived summaries/index entries. Do not silently retain deleted information because it was cited. Keep a minimal redacted reference when an internal action record must indicate a removed source. Explain limits for user-created exports/backups and expire controlled backups appropriately. Plaintext Markdown is inspectable but not encrypted; describe storage honestly.

**Acceptance:** deletion/exclusion tests cover every derived path, private pages never enter memory, and the retrieval improvement justifies its resource cost.

### SK-01 — Save successful work as a Skill

Make “Save as Skill” available from the result's contextual actions or a direct chat request; do not append a promotion after every answer. Infer a clear name, parameters, expected inputs/output, sites/accounts, and repeat behavior from the conversation. Let the user edit these in a compact interface. Keep one user concept rather than exposing Programs, Operations, Routines, and Skills separately.

Version the definition, preconditions, permissions, and compatible compiled steps. A Skill can reuse a proven program where appropriate, but must re-observe and replan when the site/state changes. A shared Skill is untrusted content and grants no authority by installation. Scope changes are visible before a future run uses them.

Invoke from the composer or existing command/skill affordance with parameter completion. Results appear in the owning chat. Keep current saved tasks accessible; consolidate UI/data deliberately rather than silently discarding user work.

**Acceptance:** J8 manual reruns work with changed parameters and a changed website; a failed precondition produces an understandable correction rather than a stale replay.

### SK-02 — Schedules and monitors that stay quiet when appropriate

Add schedules after manual runs are reliable. Specify timezone/DST, occurrence ID, execution location, account, limits, no-overlap policy, expiry, and missed-run behavior. Default to coalescing missed read-only checks; do not replay a backlog of consequential actions automatically.

Local work runs while Aux's required processes are available. Work advertised to run with the desktop closed needs durable remote scheduling and the cloud execution path. Each occurrence rechecks scope/access and uses stable logical identities to prevent duplicate effects.

Notify on a meaningful change, the completion of a requested deliverable, failure, or required input. Finishing an unchanged monitoring check is not itself a notification-worthy completion. Silence unchanged monitors and avoid duplicate notifications across devices/reconnects. Support pause-all, per-Skill disable, cost visibility, and a direct link to the relevant chat result. Avoid turning the new-tab page into a wall of routine status.

**Acceptance:** clock changes, offline periods, expired auth, retries, restarts, overlap, and cancellation preserve expected occurrence semantics and do not spam the user.

## 13. Trust, privacy, and compatibility requirements

These are engineering requirements behind the fluid experience. The default UI communicates only what helps the user make a real decision.

### The permission rule: enforce scope silently; ask at a real boundary

A user request is an instruction to act, not the first page of an approval wizard. Derive the task's bounded authority from the actual user request, selected resources/accounts, and configured permissions. A website, generated plan, tool response, or retrieved memory cannot supply that authority. Existing valid grants survive routine steps and reconnects within their defined lifetime; do not expire them at every click.

| Situation | Default experience |
|---|---|
| Human navigates or uses a page directly. | Act normally. No agent approval dialog. Preserve browser/site/OS protections. |
| AI reads selected context, researches relevant public sources, navigates, or prepares a requested output within scope. | Proceed; no per-tab, per-domain, per-tool, or Approve plan prompt. Do not inspect unrelated private tabs/accounts. |
| User clearly requests ordinary changes: update specified records, edit project files, run relevant checks, or send specified content to a known recipient. | Treat the clear request as authorization for those actions within policy; do not ask the same question again because a tool is labeled write. Resolve consequential missing details first. |
| First use needs a project folder, service connection, model-processing choice, or device permission. | One contextual setup/request for the actual capability; remember the valid decision. Do not ask for unrelated capabilities in advance. Required OS prompts still occur. |
| Work needs a different account, new sensitive-data recipient, broader filesystem access, elevation, unexpected spend, or a materially different external effect. | Ask one focused question for the missing authority; keep independent permitted work available. Opening another relevant public research page is not such a boundary. |
| Financial commitments, irreversible bulk deletion, access-control changes, or production-impacting operations. | Require concrete, informed authorization bound to the actual target, amount/content, account, and environment as applicable. If not already established for that effect, request it once immediately before commitment. Never rely on a vague task title or blanket trust switch. |
| MFA, biometrics, CAPTCHA, an OS prompt, or an unresolved account/conflict choice requires a person. | Explain the single needed action in context, keep the task state, and resume when resolved. Do not restart the task or ask for the same grant again. |

Use one shared authorization model and deduplicate permission requests across the runtime, browser broker, connection, and UI. Layers still validate their own trust boundaries; they must not each display a separate approval. Bind a granted decision to the real scope/payload, invalidate it on material change, and permit immediate revocation. A coherent batch can share one decision when its targets and effects are clear.

When a question is necessary, use plain language and a concrete action: “Send this to Maya?” if the user only requested a draft, or “Use the production project?” when the environment was not specified, with the relevant detail. Do not repeat these questions when that exact action is already authorized. Avoid generic “Allow tool execution?” dialogs, raw JSON, policy jargon, and multi-step permission-center visits. Ordinary task questions belong in chat; native authentication/OS controls remain native. Keep one place to review/revoke remembered access in settings, without making it part of every task.

Do not solve prompt fatigue with an unrestricted everything-is-allowed mode. Solve it through clear intent, sensible scoped defaults, remembered valid decisions, reliable enforcement, and no duplicate questions. Prompt count never overrides an actual security boundary; unnecessary prompts are product defects, just as missing required boundaries are defects.

### TR-01 — Untrusted content cannot expand authority

Websites, screenshots, documents, repository files, retrieved memory, shared Skills, and MCP responses are untrusted task data. Content that looks like an instruction from the user must not grant new page/file/account/destination permissions. Prompt fences support interpretation; code enforces access.

Use a principal/resource/capability model at every API/IPC path, including desktop calls. Validate schemas, size limits, origin/frame identity, target membership, task revision, and revocation. Page preloads expose narrowly defined capabilities, never a generic runtime invoke, filesystem bridge, arbitrary shell, token, or vault accessor. A compromised web page must not become the shell.

Include adversarial cases for cross-site data transfer, hidden tab access, credential disclosure, privileged URL schemes, local-file reads, malicious documents, unsafe rendered HTML, and scope escalation through a connected agent. Preserve sandbox/context-isolation settings and revalidate them in packaged builds.

**Acceptance:** adversarial regression cases fail safely without blocking unrelated normal workflows; normal authorized tasks also pass the zero-redundant-prompt checks in Section 18.5. No frontend-only permission decision is sufficient.

### TR-02 — Transparent context and model processing

Clearly separate where data is stored, what Aux collects, and what a selected feature sends to a provider. Local storage does not imply local inference. Page questions, translation, summaries, vision, and automatic recall follow the user's chosen processing policy. Context chips and a concise provider explanation make the normal path understandable without a warning before every request.

Do not silently switch to a provider with different data handling when one route fails. Respect permitted provider/region choices. Keep secrets out of prompts, screenshots intended for the model when a secret can be avoided, routine logs, crash uploads, and support bundles. Clipboard and screen capture occur only in the user's intended interaction and supported scope.

Private browsing does not participate in AI or persistent memory in this release. If private AI is ever added, it requires a separate product/security design and explicit user choice rather than inheriting regular behavior.

**Acceptance:** test egress, redaction, exclusions, local-inference mode, private isolation, and user-visible explanations against the actual transport implementation.

### TR-03 — Credentials, permissions, and real accounts

Use the existing OS-backed secret store and opaque credential references. Resolve human and agent fill into the correct requesting origin/frame and selected account. Keep task grants revocable, bounded, and invalidated when relevant state changes. Granting access to one account at one site is not access to every account in the Profile.

Persist regular site permissions through one store; private permissions remain separate and ephemeral. Validate native microphone/camera/screen-sharing prompts, certificate errors, downloads, external URL handlers, and file access on a signed build. Do not wrap an OS permission dialog in a duplicate Aux approval. Other task questions follow the conversational boundary rule above; remembered denials do not trigger repeated requests without a relevant new user action.

**Acceptance:** J9/J10, wrong-account/wrong-origin tests, and signed update/keychain continuity. Neither a mock keychain nor a virtual authenticator proves the real native flow.

### TR-04 — Browser maintenance is ongoing product work

Track the supported Electron/Chromium line, upstream security fixes, native dependencies, and relevant advisories. Assign a release/security owner. Proposed operational targets: assess a critical relevant advisory within one working day and target shipment within 72 hours of an available compatible upstream fix, with documented mitigation if blocked. Security releases bypass a normal feature schedule.

Qualify update signatures, packaged entitlements, supply-chain provenance, safe download handling, and profile recovery. Grant only required entitlements; broad library-validation exceptions need specific justification and a removal path. Signing affects macOS `safeStorage` behavior and must be tested across updates. [Electron security](https://www.electronjs.org/docs/latest/tutorial/security), [safeStorage](https://www.electronjs.org/docs/latest/api/safe-storage).

Publish a vulnerability-reporting contact, supported platform/version matrix, release notes, privacy explanation, and known compatibility limitations before public beta. Do not imply that Chromium alone supplies all Chrome browser services, protections, extensions, or licensed media support.

## 14. Codebase, build, and distribution workstream

### PL-01 — Remove the custom engine from the product

Preserve the engine's source/history and verify the preservation before removing it from this product checkout. Remove engine binaries, runtime engine startup/routing/fallback, paint/input paths, engine-only settings/components, package scripts, and ordinary TS CI dependencies. Keep Chromium driver behavior and useful backend-independent tests.

Both a managed Aux page and an explicitly attached external Chrome page use Chromium; represent connection kind separately from rendering engine. Keep external browser attachment under Advanced/Developer where appropriate, with honest differences in control/permissions. Do not preserve a generalized multi-engine routing architecture for two connections to the same engine family.

**Acceptance:** desktop/runtime/typecheck/build/tests pass without Rust/engine artifacts; a TS-only CI change does not clone/build the engine; the packaged application excludes engine binaries; source/history preservation is verified. Publishing a new engine repository is a separate authorized action if needed.

### PL-02 — Complete the Aux identity and clean schema

Rename `@vector/*`, `VECTOR_*`, `VectorError`, wire/resource names, session partitions, product IDs, log prefixes, and package references coherently. Move the useful driver package toward `@aux/chromium-driver`; remove the dead browser-driver path. Keep historical quoted/source references where appropriate rather than corrupting archives to satisfy a grep.

Use a staged codemod with reviewable diffs and typechecks between coherent stages. Do not ban model names as “legacy.” Remove environment dual writes, legacy migration UI/importers, old journal conversion, and duplicated model defaults after the development reset. Preserve meaningful defensive checks unrelated to migration.

Create a new schema v1 for the new profile, with explicit foreign keys, journal durability, indexed chat/task columns, and typed rows. Unknown/newer schema versions produce a recoverable incompatibility message; they never trigger an automatic destructive reset. The implementation only resets designated disposable development data, not personal browser stores or arbitrary directories.

Finalize one bundle identifier/signing identity before persistent signed profiles. After the external beta starts, new Aux schema versions receive tested migrations and recovery. That lifecycle boundary applies even though old Vector compatibility is intentionally removed.

**Acceptance:** no active dual naming or legacy product path; a fresh profile works; an incompatible profile is preserved; the next supported Aux upgrade is tested without data loss.

### PL-03 — Simplify contracts and services without losing behavior

Consolidate visible concepts and overlapping implementations incrementally. Use typed exhaustive dispatch generated/checked from `MethodSchemas`; apply validation, authorization, and body limits equally to desktop, renderer, SDK, CLI, and external callers. Separate namespaces by coherent resource/action semantics.

Split `PageService`, coordinator cycles, handler switches, and repository casts along tested boundaries. Keep a thin transition facade only while callers move; remove it at the end of its package. Enforce import direction and typed storage records with appropriate tooling. Counts of methods, tools, files, or lines are diagnostics rather than correctness gates.

Preserve fan-out execution semantics until child runs replace them, retain independent action-journal identity, and distinguish artifact content from execution evidence. A cleaner user glossary does not require discarding useful internal entities.

**Acceptance:** contract/authorization coverage has no drift; all clients see the same effective rules; existing journeys remain functional; a reduction in concepts corresponds to less duplicated behavior.

### PL-04 — Faster development and meaningful continuous checks

Make development startup incremental. Cache native compilation and built assets by relevant inputs; preserve correct rebuilds on source/toolchain changes. Improve main/runtime reload feedback while keeping renderer HMR. Pin compatible dependency/tool versions and remove duplicate packages deliberately.

Parallelize independent unit files only after isolating shared ports, directories, globals, and fixtures. Keep mutation-sensitive tests serialized as needed. Wire the existing desktop smoke scripts into named suites and real CI/release gates. Maintain a quick deterministic path for ordinary changes and a broader native suite when affected.

Fix warning classes that hide real issues, especially accessibility and effect dependencies; do not simply raise the lint ceiling. Run appropriate checks once per meaningful change; repeat/broaden only for new failures or risk. Paid models are a budgeted evaluation lane, not an unbounded flaky dependency of every PR.

**Acceptance:** repeatable local setup, clean build output, CI artifacts that explain failures, and useful feedback time. Initial aspiration is <15 minutes for the ordinary TS validation path after baseline and infrastructure sizing.

### PL-05 — Package, sign, update, and recover

Bundle runtime code with explicit treatment of native modules, workers, dynamic imports, document assets, and optional features. Remove npm-install staging if the bundle makes it unnecessary. Measure installed/compressed size and startup separately. Keep fonts/PDF assets needed for supported languages and correct document rendering.

Produce signed, notarized macOS artifacts with stable/beta channels, safe update timing, signature/integrity checks, staged rollout, and release provenance. Sign nested executables/add-ons correctly. An update does not silently interrupt active work; checkpoint/finish or ask for restart at an appropriate moment.

Test install N → real test state → update N+1 → restart → browser/chat/project/credential continuity. Failed or interrupted installs preserve a recoverable profile. Rollback/downgrade must respect database compatibility; do not restore an old binary blindly onto a newer schema.

Crash reporting starts local and uploads only with informed user choice and redaction. Provide a useful support bundle with secrets/content excluded by default. Update checks and security alerts remain functional without opting into usage analytics.

**Acceptance:** Gatekeeper accepts the release, native permissions identify Aux, update/recovery journeys pass, and artifacts work outside the source checkout.

### PL-06 — One roadmap and accurate documentation

This is the single current roadmap; the earlier phase tracker and Vector-era roadmaps are frozen under `docs/archive/`. Preserve `AUX-DESIGN-DIRECTION.md` as the visual contract and maintain small architecture records for privacy, ownership, journal durability, and schema decisions. Freeze superseded progress/roadmap documents with pointers; avoid creating another permanent competing roadmap.

Archive known obsolete engine/product plans after mapping still-relevant obligations, including actual account, extension, native, cloud, and distribution proof. Check references before moving files. Preserve untracked local backups. Changelog entries describe verified delivered behavior; check actual PR contents rather than inferring from their numbers.

**Acceptance:** one product release sequence, consistent glossary/identity, intact links, preserved current design requirements, and no documentation claim that mocks or source builds prove real account/cloud/signing behavior.

## 15. Work package ledger

Each package above includes implementation scope, affected components, and acceptance. The milestone column is the first usable delivery, with later refinement where stated. Assign a named owner before beginning a package. Estimate after the relevant spike: S = roughly 1–3 engineer days, M = 4–10, L = 11–20, XL = split into independently usable slices. These are sizing aids, not calendar promises.

| Package | First delivery | Initial size | Main dependencies |
|---|---|---|---|
| BR-01 Native tabs/navigation | R1 | XL, sliced | Ownership protocol; compatibility baseline |
| BR-02 Stores/startup/layout | R1; refine R2 | L | Design baseline; BR-01 cutovers |
| BR-03 Lifecycle/restore | R1 conservative; R2 optimization | L | BR-01; unload/dirty-state proof |
| BR-04 Omnibox/search | R1 basics; R2 ranking | M–L | Browser worker/index; existing command UI |
| BR-05 Browser completeness | R1 critical; R2 broad | XL, by workflow | Baseline matrix; native session policy |
| BR-06 Import/login/extensions | R0 feasibility; R1–R2 delivery | XL, external dependencies | Signed identity; host/API proof |
| BR-07 Private/content/site policy | R1 boundaries; R2 completion | L | Preserved private process; request router |
| CH-01 Conversation continuity | R1 | M | Stable IDs/context; durable draft path |
| CH-02 Streaming/artifacts | R1 core; R2 formats/polish | L | Event contracts; worker/viewer isolation |
| CH-03 Steering/results | R1 | M–L | AI-05/06; control protocol |
| CH-04 Onboarding/find work | R1; refine R2 | M | Model setup; import/search; real saved data |
| AI-01 Observation/refs | R1 | L | Tab generations; trusted adapter |
| AI-02 Interaction coverage | R1 core; R2–R3 long tail | XL, by failure family | AI-01; real fixtures/holdouts |
| AI-03 Tool schema/execution | R1 | L | Provider route spike; durable dispatch |
| AI-04 Registry/context | R1 | M–L | Catalog/route checks; baseline evaluation |
| AI-05 Concurrency/control | R1 core; R2 fan-out | L | Main broker; task revisions |
| AI-06 Verify/recover | R1 core; R2 full continuation | L | Durable journal; restored page identity |
| AI-07 Quality loop | R0 onward | Ongoing | Versioned corpus; authorized evaluation budget |
| WS-01 Project continuity | R1 | M | Existing project isolation; CH-01 |
| WS-02 Files/changes | R1 existing path; R2 full | L | Project identity; hash/conflict safeguards |
| WS-03 Commands/preview | R1 | L | Task capabilities; service lifecycle |
| WS-04 Issue/incident/publication | R1 read/local; R2 authorized writes | L | WS-01–03; provider connections |
| WS-05 Connected agents/MCP | R1 one client; R2 broaden | L | Scoped tokens; actual client interop |
| WS-06 Cloud continuation | R3 | XL, sliced | WS-01–05; durable remote worker; budgets |
| ME-01 Explicit memory/recall | R2; existing behavior retained R1 | M | Scope catalog; FTS; deletion model |
| ME-02 Ambient/semantic memory | R3, only on measured need | M–L | Consent/deletion; ME-01 evaluation |
| SK-01 Manual Skills | R2 | M | Successful tasks; parameter/scope model |
| SK-02 Schedules/monitors | R3 | L | SK-01; occurrence identity; WS-06 if remote |
| TR-01–04 Trust/maintenance | R0 onward | Embedded + specialist review | Required before exposing affected capability |
| PL-01 Engine separation | R0–R1, before distribution | L | Verified history preservation |
| PL-02 Rename/schema | R0–R1, before retained beta profiles | L | Identity decision; PL-01 |
| PL-03 Contract simplification | R1–R3, alongside user slices | L, incremental | Relevant ownership/schema decisions |
| PL-04 Developer loop/CI | R0 onward | M + ongoing | Existing checks and smoke inventory |
| PL-05 Distribution/update | R0 start; R1 signed pilot | L | Signing account; PL-01/02; native validation |
| PL-06 Documentation | R0 onward | S–M | Mapped obligations and current implementation |

A package is not done because its first milestone shipped a subset. Record the accepted slice and remaining acceptance cases explicitly. Conversely, a later enhancement is not a reason to withhold a complete useful earlier slice.

## 16. Single release sequence

This is the only release sequence for this handoff. Use outcome gates rather than treating an estimated calendar as proof of completion. After R0, forecast the next milestone from measured package sizes and actual staffing. Reserve approximately one-quarter of capacity for compatibility, regressions, upstream maintenance, and findings. Keep later forecasts adjustable.

Sections 2.6, 3.3, 6.1, and 18.5 apply from R1 onward, not only at final polish. Repeated approval of already-authorized work, routine tool-log output, automatic panel clutter, or a regression in ordinary browsing blocks acceptance of the affected feature. Additional agent features do not offset an incomplete daily browser.

### R0 — Establish the foundation and prove the risky assumptions

**Outcome:** the team understands the existing product, preserves its design, and knows how the first complete browser/AI/workspace slice will ship.

Deliver:

- Fresh visual baseline with the September 21 arch mark/silver icon and current sidebar/toolbar behavior; record the UI elements that must be preserved.
- Baseline timing/resource reports and an inventory of working, incomplete, and externally unverified user journeys.
- Small runnable spikes for main-owned control/takeover, private debugging isolation, signed identity/keychain/update, required password/passkey/extensions, target identity/BFCache, live native preview composition, and actual gateway tool schemas.
- Begin signing/distribution immediately. Begin engine separation and then rename/schema reset as bounded separate changes; do not bundle them into the browser ownership rewrite.
- Fix independent existing defects such as private search, third-party favicon requests, layout-persistence churn, and missing root error handling where confirmed.
- Demonstrate an initial page answer, a delegated site task, and a local issue-to-preview workflow using existing capabilities. Record the smallest missing behavior in each.
- Recruit 5–8 design partners from the target audience and collect real switching blockers, favorite workflows, credential/extension needs, and desktop/multi-device expectations.

**Exit:** each high-risk assumption has a working proof or a documented failed result with a selected next action; baseline and preserved design are recorded; the first implementation slices and owners are concrete. R0 is not a demand that every external entitlement/account decision finish before independent coding continues. Estimate the probes separately from full engine/reset work.

### R1 / 0.2 — A fast browser with a useful conversational workspace

**Outcome:** an invited user can browse comfortably, ask naturally, delegate useful work, and complete one project workflow in the same application.

Minimum release scope:

- Main-owned human navigation and tab control; responsive shell/store; conservative lazy restore; runtime-independent browsing; existing visual style preserved.
- Signed installation and a tested update path; reset/identity decisions complete before users keep these profiles.
- Supported import/default-browser path and the critical login/media/file/permission flows needed by the invited cohort. Private isolation remains intact.
- Shared chat/context/drafts, streamed answers, useful sources/files, mid-task steering, Stop/Take over, natural chat completion, and recoverable provider failure.
- Model registry, validated tool dispatch, stable refs, bounded execution, durable writes, and independent verification for the selected task families.
- One real connected agent and one complete local Project flow through files, command/test, preview, and diff. No dependency on completing every concept/API cleanup first.

**Demonstration:** J1–J6, J9–J12 for the declared initial scope. J7/J8 cloud/scheduling can remain unexposed until later milestones rather than showing ineffective controls.

**Exit gates:** a signed build works outside the checkout; target users complete the selected journeys without coaching; a frozen set of at least 15 representative agent tasks spans reading/research, website action, and project work, with repeated trials and at least 90% verified success in that explicitly bounded set. No unresolved critical authorization, private-boundary, duplicate-effect, or durable-state-loss defect. Foreground responsiveness holds during agent work. Record a week of actual pilot use and fix its concrete blockers before expansion.

### R2 / 0.3 — Dependable daily browsing and productive project work

**Outcome:** users keep Aux open for ordinary browsing and recurring work rather than returning to another browser whenever a serious task appears.

Deliver:

- Resolve the observed switching blockers: credentials/passkeys, needed extension capabilities, omnibox ranking, import gaps, site controls, filter-list blocking, media/meeting paths, shortcuts, and recovery. Deliver isolated persistent work/personal Profiles through the existing controls.
- Improve resource management, larger sessions, long chats, multi-window behavior, and optional real agent views without foreground regressions.
- Complete the useful Files/Changes/Console workspace, Project/account continuity, real connected-client lifecycle, and authorized provider write flows.
- Explicit notes/FTS recall and manual Skills, with edit/delete/export, changing-site handling, and clear scope.
- Broader document/artifact workflows, language/input coverage, accessibility, and stable behavior under network/model/service failures.
- Incremental internal concept cleanup, keeping data/behavior intact for retained beta profiles.

**Exit gates:** expand the versioned corpus to at least 50 cases with held-out tasks and difficult variants; target ≥95% verified success on supported deterministic/common-flow qualification tasks, with results per family and uncertainty reported. Do not average away any critical failure. At least 15–25 real target users exercise daily use; keep onboarding/dropouts in the denominator. Complete the declared login/extension compatibility matrix and observe useful repeated tasks over several weeks. Foreground performance and energy remain within budget.

### R3 / 0.4 — Capable extended work and repeatable workflows

**Outcome:** Aux carries more substantial research, multi-site operations, and software work across sessions without losing continuity.

Deliver:

- Broader semantic/visual interaction coverage and bounded multi-tab research with structured artifacts.
- Reliable task continuation, deeper project/incident workflows, and improved external-agent handoffs.
- Parameterized/shareable Skills and carefully scoped schedules/monitors with meaningful notifications.
- Real cloud execution, reconnect, cancellation, budget/expiry, artifact recovery, and conflict-safe local return; remote browser takeover only after exact-session proof.
- Optional ambient/semantic memory where its measured benefit and data controls justify it.

**Exit gates:** J7/J8 pass their failure/return paths; the browser remains pleasant under longer/background work; comparative trials show repeated improvements in successful completion, total user effort, and/or cost for the targeted tasks. Hard cases remain visible in the reported results. No generic “best agent” claim follows from a small fixture subset.

### R4 / 1.0 — Earn the default-browser and workspace promise

**Outcome:** a stable, supportable product whose declared users can rely on it for both browsing and meaningful work.

Deliver:

- Complete the promised browser/login/workspace compatibility matrix, signed release/update/recovery qualification, and architecture/security review of the major boundaries.
- Finish data import/export, persistent Profile qualification, support/recovery tools, native accessibility, reduced-transparency/light/dark checks, and supported architecture builds.
- Public download, release notes, privacy/model-processing explanations, vulnerability reporting, and a maintained update/security process.
- A broader evaluation with at least 30 target users for four weeks. Target ≥70% retaining Aux as their default work browser; disclose enrolled count and dropouts, and investigate failures by workflow.

**Exit gates:** all promised journeys work on supported hardware/platforms; no unresolved critical data/control/recovery issue; retention and task usefulness meet the declared targets; there is clear ownership for maintenance. A repeated essential compatibility failure triggers a real fix or an explicit product-scope decision, not an ever-growing exception list.

Evaluate sync/mobile/Windows demand during these milestones. They are not silently included in this desktop release. If the target cohort cannot adopt without one of them, reassess the roadmap explicitly rather than pretending local export meets that need.

## 17. Dependencies and first implementation slices

### 17.1 Critical dependency chains

| Dependency chain | Why it matters |
|---|---|
| Current design baseline → shared state/continuity → every UI slice | Avoids accidental redesign, lost drafts, and disconnected workspace surfaces. |
| Main-owned identity/control → native browsing → restoration/discard/live preview | Every page must have one owner and reject stale actions before lifecycle optimization. |
| Signing/identity → real credentials/passkeys → retained beta profiles → updates | Native behavior and profile/keychain continuity cannot be proven in an unsigned dev build. |
| Typed provider tools → authorized durable dispatch → verification/recovery → Skills/schedules | Repeatability amplifies any weakness in action correctness or uncertain-outcome handling. |
| Stable Project/checkout → files/commands/preview → connected-agent interoperability → cloud return | Remote and external work need the same correct project identity and conflict behavior. |
| Scope/deletion policy → explicit memory/FTS → optional ambient/semantic memory | Better recall must not broaden capture or make Forget incomplete. |

Browser/distribution and agent/workspace implementation can progress independently where these contracts are fixed. Shared-contract changes need a coordinated cutover with a single owner. Do not split the architecture between multiple incompatible authorities to increase short-term throughput.

### 17.2 The first reviewable slices

These are implementation units, not a demand for one giant PR or exactly twelve commits. Split when a unit is too large to review while keeping each accepted slice coherent.

| Slice | Deliverable | Verification |
|---|---|---|
| 1 | Record current assets/layout, component inventory, native/browser/task baselines, and unresolved account/host proofs. | Fresh native captures; known-good journey recordings; no product claims from historical screenshots. |
| 2 | Confirm/fix isolated responsiveness/privacy defects: layout persistence, selectors, root boundary, favicon sourcing, private search. | Focused regression cases and actual rendered behavior. |
| 3 | Preserve/extract engine and remove product/CI/bundle coupling. | Product build/tests/package without Rust; preserved history verified. |
| 4 | Apply coherent Aux rename, identity, new development schema, and legacy-path removal. | Fresh-profile smoke, typecheck, contract identity checks, incompatible data preserved. |
| 5 | Introduce typed main tab/control commands, worker persistence, patch/snapshot protocol, and runtime subscription. | Stale/repeated commands, runtime failure, reconnect, cross-window scope. |
| 6 | Cut human navigation/activation to the native path; then close/reopen/popups and lazy restore. | J1/J11 plus dirty-editor/unload/popup cases; before/after latency. |
| 7 | Deliver shared chat state and sequenced streamed answer/artifact events with ordinary conversational completion. | J2/J4; provider interruption/replay; draft preservation; quiet output and stable layout; current styling. |
| 8 | Consolidate registry/provider schemas and a single validated, journaled dispatch path with correct stop/takeover. | Recorded malformed streams, actual route checks, dispatch-boundary failures, and no reapproval of routine requested steps. |
| 9 | Connect the current Project surfaces into the chat; qualify edit → command → preview → diff. | J5 with dirty checkout, external editor, running service, restart. |
| 10 | Complete one external-agent setup/lifecycle and scoped Project/browser flow. | Real supported client plus synthetic isolation/revocation cases. |
| 11 | Finish signed distribution/update and required account/native compatibility proof for the invited cohort. | Install/update outside checkout, keychain/TCC, SSO/passkey/extension matrix. |
| 12 | Run the integrated private-alpha journeys, fix the largest failures, and prepare the R1 release record. | Repeated bounded task results, performance under load, target-user pilot. |

Signing/spikes and task quality work start with slice 1 and continue alongside these changes; slice 11 is qualification, not the first time distribution is considered. Engine/reset completion is not a prerequisite for designing or testing the initial conversational/workspace flow in an isolated profile.

### 17.3 Every accepted slice contains

A user-visible outcome; the contract/state changes supporting it; persistence and failure behavior; relevant code/tests; a demonstration in the actual app; and a short record of what was verified versus still externally blocked. Remove superseded code after its replacement passes. Update milestone status without declaring the entire workstream complete prematurely.

Prefer small coordinated changes over months of architecture-only work. Internal refactors earn their place by enabling an outcome, eliminating measured latency, fixing a reliability boundary, or lowering the demonstrated cost of the next change.

## 18. Verification and comparative evaluation

### 18.1 Use the right proof for the claim

| Layer | What it proves | When it runs |
|---|---|---|
| Unit and contract | State transitions, schemas, ranking, scope checks, replay, deletion, and pure layout/state logic. | Every affected change; deterministic and isolated. |
| Fixture integration | Complete runtime/browser/project interactions with resettable data and independent final-state checks. | Relevant PRs and the main CI lane. |
| Native desktop smoke | Real Electron views, IPC, focus, input, popups, downloads, permissions, and recovery. | Affected PRs plus a grouped release suite. |
| Signed packaged qualification | Installation, identity, keychain, OS permissions, actual accounts/extensions, update, and operation outside the checkout. | Early feasibility probes and every release candidate affecting these paths. |
| Budgeted live task evaluation | Held-out site behavior, provider-route compatibility, real agent effectiveness, and model/browser regression. | Scheduled evaluation and before relevant releases; explicit test accounts and cost limits. |
| User and comparative trials | Discoverability, overall effort, daily comfort, adoption blockers, and relative value. | From R0 onward, with repeated pilots at release gates. |

A fixture pass is not a signed-account pass. A screenshot is not interaction proof. A task returning `done` is not an independent outcome check. Preserve these distinctions in engineering reports without exposing a verification workflow to ordinary users.

At the reference checkout, the starting commands are:

```sh
pnpm typecheck
pnpm test:unit
pnpm bench:tasks --validate
pnpm --filter @vector/desktop typecheck
pnpm --filter @vector/desktop build
```

These are existing entry points, not claims that they were rerun while writing this plan. Use the updated package name after PL-02. Add the affected integration/native suites and packaged qualification; the five commands alone are not a release gate. The existing lint command permits warnings, so its green exit is not proof that all lint issues were addressed.

Group the existing smoke scripts instead of starting a second test framework. Useful starting cases include `runtime-recovery-desktop.mjs`, `tab-recovery-desktop.mjs`, `unsaved-work-desktop.mjs`, `window-unsaved-work-desktop.mjs`, `conversation-lifecycle-desktop.mjs`, `conversation-context-desktop.mjs`, `private-boundary-desktop.mjs`, `authentication-navigation-desktop.mjs`, `scoped-agent-connection-desktop.mjs`, `local-projects-desktop.mjs`, and `packaged.mjs`. Recheck setup/cleanup and isolation before enabling parallel runs.

### 18.2 Required failure coverage

Exercise the appropriate cases in each accepted slice:

- Runtime absent, slow, crashed, or reconnecting while the user opens, navigates, switches, and closes tabs.
- Delayed/repeated commands, event gaps, stale tab/document/reference IDs, task revision changes, account switches, and revoked tokens immediately before dispatch.
- Page or renderer crash, unload veto, dirty rich-text editor, active call, upload/download, and disk-full or worker failure during state persistence.
- Provider refusal, invalid schema, partial tool stream, timeout after submission, budget exhaustion, and recovery after an uncertain remote effect.
- A user taking over a page while the agent is planning, observing, dispatching, or waiting; other permitted work remains unaffected.
- External file edits, untracked files, simultaneous project tasks, preview-service failure, a long-running command, and cloud return after local divergence.
- Private-page discovery/attachment attempts from every exposed debugging/API path; excluded or forgotten data in summaries, indexes, logs, caches, and model requests.
- Interrupted update, incompatible/newer schema, keychain changes, first-install native permissions, and restoration outside the development checkout.

Use isolated test profiles/repositories/accounts and authorized test destinations. Tests must not reset the founder's working browser profile, send real customer messages, purchase anything, publish code, or incur unbounded cloud/model charges. A test blocked by missing access is recorded as unverified, not passed or silently omitted.

### 18.3 Task-quality methodology

The current benchmark README describes eight deterministic local tasks and 33 AssistantBench validation tasks. Those are useful seeds, not evidence of human-equivalent general browsing. Keep their results separate from the broader Aux corpus.

For R1, use at least 15 distinct tasks spanning reading/research, website action, and project work. For R2, expand to at least 50 covering the applicable capability matrix, including hard dynamic pages and interruption/recovery cases. Run at least five seeded repetitions per deterministic task; budget repeated live trials separately and report their smaller sample sizes honestly.

Use independent state oracles for mutations, file assertions/tests for code and artifacts, and source-checked rubrics or blinded human assessment for open-ended work. An LLM judge alone cannot certify correctness. Maintain a held-out set; do not tune on every case used for the headline result.

Report task count, attempts, complete/partial/failed outcomes, human interventions, unauthorized effects, duplicate effects, false completion, p50/p95 completion time, tokens/cost, and foreground responsiveness. Include per-family results and uncertainty; do not exclude failures from time/cost reporting without showing them separately. The success targets in Section 16 apply to the declared bounded corpus, not all possible websites. Zero observed safety failures does not establish zero risk.

Compare two questions separately:

1. **Infrastructure quality:** matched model/provider, task data, account state, hardware, and budget across compatible adapters.
2. **Product usefulness:** Aux versus a capable human and available comparison browsers using their normal supported workflows. Record version, setup, provider differences, assistance allowed, and user effort; do not describe unlike configurations as controlled harness comparisons.

Treat “as good as a human” as a measured ambition across the supported task families. Claim an advantage only for the workloads actually tested, including completion quality and intervention burden, not just a faster first click.

### 18.4 Visual and interaction qualification

Use fresh native captures from the implementation build, not the historical September 19–20 images. Check the current arch mark/silver icon, light/dark appearance, reduced transparency/motion, normal and enlarged text, and approximately 1024×768, 1280×800, and 1512×982 window sizes. Include a smaller/narrow layout when supported. Check populated and long-content states, not only an empty start page.

Exercise the actual sidebar reveal, focus return, dragging, splits, native-view overlap, text selection, IME, VoiceOver, streaming scroll, editor interaction, and keyboard shortcuts. Measure frame pacing on supported 60/120 Hz displays where available. Preserve semantic/keyboard behavior when virtualizing or animating.

Engineering evidence belongs in test reports and release notes. Users receive a fluid application and conversational results.

### 18.5 Friction, clarity, and everyday-use release checks

Run these in the real application with ordinary users, not just a scripted happy path. Count Aux-generated clarification/permission interruptions separately from first-time setup, genuine task ambiguities, and required site/OS authentication. The goal is no unnecessary interruption, not hiding a necessary one.

| Scenario | Passing experience |
|---|---|
| Ask a straightforward question about the current permitted page. | One request → a useful answer; zero extra approval, mandatory plan, receipt, or unsolicited panel. |
| Research across public sites and create a local comparison file. | No per-domain/per-click approvals; one compact in-place working state and one result with sources/file. Only meaningful progress enters the chat. |
| Update specified ordinary records within established scope. | No reapproval per record or final “approve completion”; one concise result, with any actual exceptions. |
| Fix a project issue and run its checks after project execution is configured. | No prompt per file, search, edit, test, or preview startup. One result with an optional preview/diff; the workspace stays where the user left it. |
| Cross a real consequential boundary or change the target/account after approval. | One concrete question at that boundary; correct binding/revalidation; no duplicate modal from another layer. |
| Take a page back, then ask the AI to continue. | Immediate human control without confirmation; a simple continuation without rebuilding context or reapproving unchanged scope. |
| Finish a task while the user is typing, reading another tab, or in a meeting. | No focus theft, automatic navigation, panel expansion, or duplicate toast/system/chat alert. Notify once only when useful. |
| Repeat a saved monitor with no relevant change. | No routine notification or new status clutter; real failure/required input remains visible. |

For each J1–J12 flow, test the keyboard/menu path as well as discovery without shortcut knowledge. Watch for hesitation, accidental actions, lost place, repeated setup, and retreat to another browser. Ask whether the person could tell what was happening and what to do next without needing to interpret internal terminology. Resolve repeated confusion rather than adding a tutorial to compensate.

Record time to useful result, number of user interventions, redundant prompts, default output size, and unsolicited layout/focus changes in the existing evaluation reports. No new product dashboard is required. Zero duplicate approvals, routine receipt screens, or unsolicited focus changes is a regression-suite requirement. Review longer answers in context rather than enforcing a blind word limit.

Finally, spend a normal work session in Aux with AI disabled, then with background agent work: mail/docs, search, forms, files, media, meetings, many tabs, and a project preview. Passing an agent benchmark cannot compensate for a slow address field, broken login, lost form, inaccessible control, or unreliable restore. Use these observations alongside Section 6 measurements and the retention gates, not as a substitute for them.

## 19. Early risks and decision rules

Assign an owner and a time-boxed proof to each relevant R0 risk. The owner may also own an implementation package; this is not a new management layer. A failed proof changes the implementation or declared release scope before promises are made.

| Risk | Required proof | Decision if the proof fails |
|---|---|---|
| Human credentials, passkeys, required extensions, or licensed media exceed the current host's capabilities. | Actual signed builds, devices, supported extension/native-messaging paths, and representative services. | Implement a concrete supported integration or evaluate a more capable Chromium host while preserving the Aux shell. Compare maintenance/distribution cost before committing. Do not revive the Rust engine or claim arbitrary Chrome compatibility. |
| Private pages are reachable through shared debugging. | Discovery, attachment, observation, and crash tests against the actual transport. | Retain the separate private process; share safe code without sharing the debugging surface. |
| Page identity/control changes during detach, navigation, popup creation, or BFCache. | Adversarial lifecycle tests with stable logical IDs and replaced native instances. | Keep the conservative attachment/lifecycle path until the optimized path is correct; defer the optimization, not stale-action protection. |
| Live native preview composition breaks clipping, focus, input, or accessibility. | Actual WebContents inside chat/workspace layouts, popovers, resizing, and takeover. | Use a clearly identified snapshot/open-tab preview for the affected presentation while keeping the real page operable. Do not represent a snapshot as interactive. |
| Main-owned persistence stalls or loses acknowledged state. | Load/crash/disk-full tests with worker backpressure and explicit durable acknowledgments. | Preserve the working journal guarantees; repair the worker protocol and expose a recoverable save failure. Do not downgrade durability globally to make benchmarks pass. |
| A catalog model fails the required route/tool behavior. | Small live route tests plus recorded malformed/interrupted streams. | Disable that capability/route with a clear reason; use a qualified permitted route without weakening validation or changing data policy silently. |
| Cloud work is only a local façade or has uncontrolled cost. | Close/reconnect/cancel/expiry/provider-failure tests against a real durable worker. | Keep the local workflow fully useful; withhold cloud claims until the remote execution and spend controls exist. |
| Required signing, service access, or account approval is missing. | Real credential/entitlement and packaged-service probe, with secrets kept out of reports. | Record the exact external dependency and continue independent slices. Do not fabricate the result or remove the acceptance case. |
| Scope expands faster than complete experiences ship. | Working R1 journeys and user trials before widening features. | Sequence by the largest adoption/task failures; split XL work. Preserve the core browser and workspace promise while postponing unproven extras. |
| Internal safety/runtime concepts turn into permission fatigue, tool chatter, or workspace clutter. | Section 18.5 scenarios with interruption/output/layout counts and real user observation. | Remove duplicate prompts and default chrome, repair scope/default handling, and keep enforcement internal. Do not demand that users enable unrestricted access to obtain a fluid experience. |

If a browser-host change becomes necessary, it is a separate architecture decision with a prototype and a continuity plan for the current design, tabs, profiles, agents, packaging, and updates. It must not quietly turn this handoff into an unbounded browser rewrite.

## 20. Scope, cleanup, and evidence map

### 20.1 Preserve, replace, and defer deliberately

**Preserve:** the current approved design and branding; functioning browser behaviors; chats and draft/context continuity; substantive Project/editor/command/preview capabilities; useful agent grounding and control; privacy separation; durable action intent; engine source/history; and unrelated user data or working-tree changes.

**Replace after equivalent behavior passes:** runtime-mediated human navigation, duplicate browser state ownership, broad rerender subscriptions, superseded Vector compatibility, obsolete custom-engine product paths, overlapping result/Skill concepts, unsafe unscoped calls, and routine completion UI centered on `TaskReceiptView` or receipts. Keep the underlying recovery/verification information internal; removing that UI does not mean removing correctness checks.

**Do not build as hidden prerequisites:** a new visual identity, a mandatory task dashboard, compulsory post-task approval, a whole new agent framework, universal site-specific integrations, a full IDE replacement, or semantic memory before basic search works. A useful file editor, project commands, diffs, and real preview are required; exhaustive language-server/debugger/extension-marketplace parity is not required for the first workspace release.

**Explicit later decisions:** cross-device sync, mobile/Windows support, multiplayer collaboration, a full extension marketplace, universal DRM coverage, and private AI. Revisit based on adoption evidence and host feasibility. Do not imply that local export, cloud task execution, or Spaces secretly provides any of these features.

Refactor incrementally and delete obsolete implementations once callers/tests have moved. Do not leave permanent parallel paths behind every feature flag. Temporary flags have an owner, a cutover criterion, and a removal milestone; security boundaries remain enforced in every path.

### 20.2 Starting source map

These locations were inspected during preparation or identify the existing implementation/test entry points. Revalidate line numbers and behavior against the checkout used for implementation.

| Area | Starting evidence |
|---|---|
| Current design/brand | `docs/AUX-DESIGN-DIRECTION.md`; renderer `tokens.css`, `styles.css`, `AuxMark.tsx`, `public/arch-mark.svg`; `apps/desktop/brand/aux-icon-1024.png`. Current assets supersede old saved screenshots. |
| Browser/native/private | `apps/desktop/main/index.ts`, `native-views.ts`, `private-main.ts`; `tests/smoke/private-boundary-desktop.mjs`; stored `release/test-artifacts/aux-private-boundary.json`. The stored test is historical evidence, not a fresh run for this document. |
| Journal and dispatch | `apps/runtime/src/store/db.ts`, `apps/runtime/src/agent/durable.ts`, coordinator/services/API contracts. Preserve intent-before-effect and validate the actual final dispatch path. |
| Chromium observations | `packages/engine-client/src/playwright-page.ts` and related reference/observation stores; this useful code moves with the Chromium package rename. |
| Chat/workspace | Current conversation components/stores, `TaskWorkspace`, `ProjectFileEditor`, `ProjectCommandPanel`, local-project/cloud services, and existing conversation/project smoke tests. |
| Quality/build | Root/desktop package scripts, `tests/benchmarks/tasks/README.md`, task manifest/adapters, `tests/smoke/`, packaging scripts, and release artifacts. Existing reports do not automatically establish current-build health. |
| External behavior | Primary Electron, SQLite, provider schema/streaming, and Gateway references linked at the relevant requirements above. Catalog availability is not account access or model qualification. |

Repository-specific facts and stored results motivated this plan. Requirements, new targets, proposed ownership, estimates, and release gates are recommendations to implement and validate. No fresh paid inference, real-account certification, native-host migration, or completed release is asserted by this handoff.

## 21. Implementation handoff and definition of done

### 21.1 Instructions for the implementing team or agent

1. Read applicable repository instructions, this plan, and the current design contract. Inspect the actual branch/worktree before editing; preserve unrelated changes. Treat the current approved assets as authoritative.
2. Map the relevant packages to **working**, **partial**, **missing**, or **externally unverified**. Confirm suspected defects before fixing them. Do not repeat functioning work simply because it appears in this plan.
3. Begin R0 and the first reviewable slices. Start native/signing/compatibility proofs early while delivering visible browser/chat/workspace improvements. Keep a single active release checklist rather than creating another competing master plan.
4. Land complete, reviewable slices with real tests and native demonstrations. Apply the low-friction contract from the first slice: internal checks stay internal, routine requested steps proceed, results are concise, and extra panes stay contextual. Preserve the existing visual design. Every visible control should do what its label promises.
5. Record measured outcomes and exact external blockers. Missing credentials, subscriptions, signing access, or user decisions are not permission to guess, weaken a boundary, or claim an unrun test passed. Continue independent in-scope work where possible.
6. Follow normal authorization for resets, repository publishing, live-site writes, paid/cloud resources, deployment, and credentials. This document defines the product to build; it is not blanket authorization to perform those actions on real accounts.
7. End each implementation handoff with the current commit/branch, accepted slice, verification actually run, remaining known failures, and the next coherent slice. Keep this concise; no new user-facing audit system is needed.

### 21.2 Product definition of done

The declared release is ready when:

- The browser is pleasant and responsive without AI, with the current logo/sidebar/style intact and complete core navigation, organization, account, and recovery behavior.
- The assistant works across the supported complex website workflows, uses permitted real context, can be steered/stopped, and reports verified results naturally in chat.
- Ordinary permitted tasks do not require repeated approval, routine audit/tool transcripts, or managing a task dashboard; necessary questions are specific, rare, and in context. The default UI stays small and discoverable, and extra output/panes appear because they help the requested work.
- A repository issue can become a real edit, command/test result, preview, and diff in the same coherent workspace; external-agent and cloud capabilities meet the claims made for that release.
- Returning after navigation, restart, failure, or interruption preserves the user's work and gives a truthful continuation without duplicated effects.
- Privacy, account/control boundaries, credentials, update security, and data recovery pass the appropriate actual-build checks.
- Performance, task-quality, accessibility, compatibility, and target-user gates pass for the declared release; failures are fixed or the product promise is explicitly revised before shipping.
- The team can maintain the browser: one roadmap, clear module ownership, fast useful tests, supported upstream updates, and accurate release/support documentation.

The intended result is recognizable Aux, materially better at both browsing and doing work: fast in the hand, calm on screen, capable across real websites, and comfortable enough to become the user's everyday browser and workspace.
