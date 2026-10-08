# Aux — fluid browser, first-class coding harness

Reviewed against the current Aux working tree on October 7, 2026.

## Outcome

Make Aux fast, frictionless and sleek enough to become a daily browser, with an
Aux-owned agent that finishes browser and coding work. Its distinguishing
promise is durable, inspectable execution: reviewed effects, honest outcomes,
restart-safe suspension, and conflict-safe undo for governed file changes.

Approval fluidity alone does not establish competitive quality. Browser basics,
context quality, interruption handling and successful end-to-end work are part
of this plan. Treat “best coding harness” and competitor parity as goals to
prove through use, not conclusions established by having tools in source.

## Owner constraints

- Chromium only. Vertical layout and Ask first default. Remember Skip
  confirmation; Auto remains in Settings. Show built features, with Labs
  opt-outs and honest native capability checks.
- The agent loop belongs to Aux. No pi-agent-core, Claude Code embed, or foreign
  agent harness, including as a subprocess. A normal user terminal is separate
  from the agent runtime.
- Every consequential action goes through `decide()` → durable journal →
  dispatch or suspension. New tools, QuickJS host APIs, child agents, process
  starts and worktree integration use that boundary. Reads are governed and
  recorded without ordinary confirmation ceremony.
- The unrestricted-evaluate deny stands. Extend governed capabilities instead
  of exposing raw Node, raw page eval, cookies, credentials or vault APIs.
- Full skips ordinary confirmation; Ask verifies consequential actions. Neither
  overrides protected paths, site policy, secret protections, account-security
  handoff, cancellation or ownership. Search maps to read; file changes and
  process actions retain their real effect categories.
- Preserve Stop, Take over, durable effects, restart-safe park/resume and undo.
  Never retry an uncertain effect merely because a transcript was compacted.
- Package and repository instructions are task context, not authority. No
  foreign harness branding in Aux-facing flows; real provider/model names and
  import documentation may identify their actual source.
- Fast development: focused verification, no new test bureaucracy, hosted CI,
  benchmark campaign, push, signing or release. Use disposable Profiles.

## Source grounding and delivery status

The table maps the implemented slices to their current source. Verification and
remaining acceptance are recorded in `docs/STATUS.md`. Source delivery is not a
claim of competitor parity or live-provider acceptance. Rebuild runtime dist
before tests; extend these implementations rather than creating parallel paths.

| Capability | Implemented source | Quality contract |
|---|---|---|
| Per-run mode and scopes | `safety/approval.ts`, `safety/decide.ts`, composer RunOptions | Trusted effective run policy, explicit durable scope grants, current revocation checks and no late grants from interrupted/stopped runs |
| Exact concrete review | Approval store, `services/pages/executor.ts`, Chromium driver, coding file service and review UI | Exact arguments/content and target identity; revalidate browser target after awaited preparation, preserve file-version conflicts and per-file outcomes |
| Declarative coder profiles | `services/agent-profiles.ts`, public tool schema, `services/subagents.ts`, coder-worktree services | Parent authority intersection, top-level/child limits, isolated workspaces with no implicit browser-tab inheritance; durable bounded integration batches preserve earlier confirmed changes |
| Search and file ergonomics | `loop/coding-tools.ts`, `services/coding-files.ts`, coding worker | Governed read tools, project ignores, versioned create/edit/move/delete, binary/mode receipts, reconciliation, protected diff and conflict-safe undo |
| Supervised processes | `services/coding-processes.ts`, shared Bash Seatbelt, `bg_*` manifest and activity UI | Run lifecycle cleanup, identity-checked recovery, bounded log artifacts and honest interruption/unknown outcomes; no universal command undo promise |
| Governed coding code-mode | QuickJS `loop/repl.ts`, `loop/host.ts` | Shared admission/journal, no ambient filesystem/process authority, durable replay of confirmed calls, no advancement past an uncertain mutation; explicit local-only capability limits |
| Restart and dedicated reviews | `agent/coordinator.ts`, `services/startup-recovery.ts`, cloud executor and native source admission | Explicit reopened-window binding, persisted accepted answers, same-model retry, reviewed budget continuation, exact cloud-session cleanup; unknown provider outcomes retain funding and cannot duplicate creation |
| Prompt/context | Coding prompt, `loop/context.ts`, `loop/host.ts` | Bounded failure diagnostics, metadata summaries on resume, paginated unresolved receipt references even after long histories, relevant verification instead of repeated broad testing |
| Aux Packages | Manifest/contracts, loader/library, shipped aux-core, package UI | Pinned declarative context, permission intersection, protected shipped contents and explicit unsupported import metadata; Aux-owned execution |
| Native browser/terminal | Chromium browser and native area patch 0079 | Ordinary user shell independent of Aux's agent loop; changed-flow native evidence in STATUS, browser polish and comparative performance remain separate acceptance work |

Source anchors are repository-relative to `/Users/rcourson/Code/web`. Current
ROADMAP, STATUS and ARCHITECTURE remain authoritative for browser state. Do not
copy historical line numbers or describe old four-test failures as permanently
out of scope: account for current failures when an integrated check runs.

## Browser experience required to compete

Use Aside as a reference for visual calm and agent execution, Dia for contextual
chat and repeatable skills, and Arc for fast navigation and tab organization.
Build an Aux identity using a consistent visual system rather than accumulating
three competitors’ controls. Public references inform direction; they do not
prove Aux parity:

- [Aside harness architecture](https://aside.com/blog/how-we-built-the-sota-browser-agent-that-outperforms-fable): compact context and code-oriented browser execution. Its performance claims are vendor-reported.
- [Dia updates](https://www.diabrowser.com/changelog/mac): contextual AI, skills, steerable chat and browser usability.
- [Arc Spaces](https://resources.arc.net/hc/en-us/articles/19228064149143-Spaces-Distinct-Browsing-Areas): distinct browsing areas and organized navigation.

Deliver the following alongside the harness, reusing the existing roadmap:

1. **Instant browsing.** Tabs, back/forward, command bar, bookmarks and history
   stay native and responsive while AI is starting, busy or unavailable. No
   runtime round trip on each keystroke. Agent tabs do not steal focus.
2. **One clear navigation model.** Unified command bar, predictable keyboard
   shortcuts, stable vertical tabs/pins/bookmarks and useful split view. Keep
   project/profile/package controls secondary to everyday browsing.
3. **One composed visual system.** Consistent typography, spacing, materials,
   icons, focus rings and menus across sidebar, chat, approval and Settings.
   Check light/dark and one narrow window during the changed-flow walkthrough;
   avoid a screenshot or pixel-diff program.
4. **Context without ceremony.** Active tab, explicit mentions and selected
   project have visible provenance. One composer supports browser, coding and
   mixed work; don't force users to choose a harness before describing a task.
5. **Continuous control.** Queue or steer work without losing it. Stop and Take
   over remain immediately available. Show waiting, working, blocked and done
   accurately; preserve drafts, progress and unresolved outcomes after restart.
6. **Low-friction adoption.** Existing import, extension, provider and default
   browser flows must support normal daily use. Diagnose concrete failures;
   do not invent another onboarding track or mark provider access verified
   from a configured-but-rejected credential.

Proposed development targets, not measured claims: command-bar input/tab-shell
updates within 50 ms p95 on the development machine; visible run acknowledgement
within 100 ms; stream updates without blocking browsing. Model first-token and
page-load times are reported separately. Compare cold/warm startup with stock
Chromium at the scheduled performance milestone, on matching build settings.

## Current competitor check — October 8

[Dia's October 1 Mac release](https://www.diabrowser.com/changelog/mac) emphasizes
queued/steered chat, pinned-tab search, Profile switching, dictation and window
responsiveness. Its September update adds historical chat/artifact search. These
reinforce Aux's existing priorities: preserve in-flight work, search complete
history and keep navigation responsive during AI activity. Dia reports M155;
Aux's current matching measurement pair is M154, with the next engine update
tracked in CHROMIUM_RESPINS.

[Aside's native changelog](https://docs.aside.com/changelog/native) emphasizes
new-tab preloading, background AI that preserves typing focus, repeated-layout
elimination, split-drag stability, Profile switching and import/shutdown quality.
The review should inspect those interactions directly, not infer quality from
rounded corners. Its [product page](https://aside.com/) positions logged-in
website work, local memory and protected credential use; benchmark rankings are
vendor claims. Aux should prove its own workflows and timings rather than repeat
those claims.

## Fluidity slices A–E

### A — Per-run mode, consistent at dispatch

Capture an optional trusted composer override in `run.config.agentMode`; show
its effective value during the run. Child runs inherit the parent's effective
mode, never broader authority. “This run” is temporary; the remembered composer
choice remains explicit. Do not accept model-supplied mode overrides.

Use one effective-policy resolver in `decide`, approval admission, Bash/network
admission and resume. A two-line change in `decide` alone is insufficient.
Recheck current policy, root grants, run ownership and revocation before dispatch
and after awaits. A saved Full override is not immunity from new managed denies.

Lean proof: one two-direction mode scenario plus authority narrowing/revocation
in the existing policy tests.

### B — Once / this run / this site / everywhere

Keep single-use approvals. Add explicit run, site and global category grants
through trusted writers. Persist run grants with run ownership and an authority
revision, rather than allowing arbitrary model writes to `run.config`.

A run grant applies only to that run and its deliberately inherited child
scope. A site grant requires a canonical applicable site; omit it for file-only
work. Global grants are explicitly broad. Current blocks and handoff rules still
win. Resume must consume or validate authorization at dispatch, not merely trust
a clicked card. Add a compact revoke/reset surface for run permissions.

Lean proof: grant use, scope separation and revocation; reuse existing approval
and policy test files. Do not add one test per button.

### C — Clear mode and scope language

Use Ask first / Skip confirmation / Auto consistently. Keep Auto in Settings.
Display the current run mode, not merely the current global preference.
Use “More options” or “Allow more broadly” for the scope menu: “For this run”
is temporary and should not sit under a misleading “Always allow” label.

### D — Governed capability expansion

Keep unrestricted eval denied. Close demonstrated gaps with typed governed
operations and bounded results. QuickJS orchestrates host calls; it grants no
ambient filesystem/process/browser authority. Prioritize capabilities required
by an actual browser or coding task instead of speculative API completeness.

### E — Exact plan/batch approval

A plan describes intended work; executable approval covers concrete effects.
For files, show paths and actual before/after diff. For browser actions, show
resolved targets and action arguments. For commands, show the command, working
directory and network access, with honest side-effect/undo limitations.

Default approval authorizes only the displayed batch. Bind it to action IDs,
argument/content digests, target versions and current authority. Changed files,
changed inputs or drifted page targets require fresh review. Never convert the
primary button into a category grant. Wider scopes remain separate choices.

Validate all file preconditions before starting a batch. Do not promise an
atomic multi-file filesystem transaction: persist individual outcomes and expose
settled partial success and uncertainty. Stop interrupts remaining work; it does
not erase completed effects. Late approval cannot resurrect a stopped run.

Browser `act` preflight requires explicit implementation review: a card listing
future steps is insufficient, particularly when later targets depend on earlier
navigation. Split dynamic work into newly resolved, reviewable batches.

Dependencies: A/B supply effective modes and wider scopes. Coding reuses E; it
does not create a second approval engine.

## Coding harness slices F–M

### F — Declarative coder profiles and parallel workstreams

Use Aux profiles `{name, prompt, tools, limits, packages, workspace}` with a built-in coder.
`workspace: isolated` gives built-in and custom coder children governed worktrees;
shared browser profiles keep their normal project context.
Resolve profile names once through the same schema for public subagent tools,
QuickJS cells and composer-selected runs. Reject unknown names clearly. Tools
are a parent-authority intersection; a profile never expands roots or policy.
Apply configured budget limits to top-level runs and children.

Coder prompts emphasize search, scoped reads, governed edits, diff review and
relevant verification. Parallel coders work in isolated Git worktrees and share
the run's aggregate budget. Preserve dirty/untracked parent files, executable
modes and binary assets in the permitted snapshot; exclude credentials.
Integrate through parent governed writes with captured parent versions, never
blind merge or automatic overwrite. Keep incomplete/conflicted work inspectable.
Parent orchestration can fan out; nested subagents are not required for v1.

### G — First-class search and file navigation

Finish `grep`, `glob`, `read_file`, `list_directory`, `stat` as read-category
tools, available directly and in code-mode. No Bash/network confirmation for
ordinary local search. Root grants, credential exclusions and path resolution
still apply, including symlinks and traversal.

Respect project ignores; return paths/line numbers, bounded output and useful
continuation. Avoid repeated whole-tree scans when a narrower query suffices.
Record read provenance without flooding the visible activity feed.

### H — File ergonomics, durable diff and undo

Use one governed create/edit/move/delete batch surface. Existing-file changes
require observed versions; stale or ambiguous edits fail with actionable
conflicts. Preserve binary contents and executable modes. Persist action IDs,
request digests, before/after state and per-file outcomes before dispatch.

“Show what changed” and “Revert this turn” read authoritative receipts. Undo
reverses only governed file effects whose current state matches the recorded
result; user edits cause conflicts, never clobbering. Journal undo itself.
Reconciliation observes and settles uncertain writes without redispatch.

Keep changes UI quiet: metadata updates, lazy per-file diffs, bounded previews
and explicit full retrieval. Do not poll every before/after file body repeatedly.

### I — Background processes and monitors

Finish `bg_start/status/logs/stop` inside the same Seatbelt, root, credential and
network policy as Bash. Journal process admission/start and identity; use stable
IDs for retry. Sanitize the environment. Allow local dev-server binding without
implicitly granting arbitrary outbound network or credential access.

Own the process group and descendants. Stop, abort, run end, retirement and
revocation terminate owned work and complete cleanup. Recovery verifies process
identity, avoids PID-reuse mistakes and records uncertain startup rather than
launching a duplicate. Logs are bounded artifacts with cursors and retained
failure summaries. Foreground commands should share the supervised machinery.

Commands may modify files or external systems beyond governed file receipts.
Journal their invocation/outcome, but label them non-undoable unless a concrete
reversal is available. No universal “undo everything” claim.

### J — Governed coding code-mode

Expose familiar `fs.read/write/edit/glob/grep/...` and `proc.start/status/logs/stop`
through Aux host calls in QuickJS. Each nested call passes ordinary policy,
profile restrictions, journaling and suspension. One REPL invocation can
orchestrate many calls; it is not one blanket authorization for those effects.

Persist stable host-call identities and successful responses so restart/resume
replays results rather than completed effects. Detect divergent resumed calls;
inspect receipts and re-plan. Uncertain calls require reconciliation. Keep raw
eval, Node imports and ambient process/filesystem access unavailable.
Local coding is the first delivery. Until an equally governed cloud surface is
implemented, return a clear unsupported capability; no silent execution fallback.

### K — Prompt and context quality

Keep the base prompt small; include coding instructions only for project runs.
Load package skills on demand. Harness context must retain goal, current plan,
changed paths/versions, unresolved receipts and latest relevant failure across
compaction and restart. Never replace completed side effects with “reissue this
call”; re-fetch reads or inspect durable results instead.

Attach bounded command failure context automatically: command, workdir, exit
status and useful stderr/test names, with a link/handle to fuller logs. Success
logs stay compact. Keep explicit todos for multi-step work without turning every
small edit into planning ceremony. Finish from observed outcomes and changed
behavior; report unverified/native/provider work honestly.

### L — Coding plan-then-execute UX

One composer → scoped plan when useful → exact reviewed file/command batch →
execution → concise diff and verification result. Ask can approve a coherent
refactor once. Full executes without redundant permission cards. Neither needs
an additional generic “Are you sure?” step after policy has authorized the work.

Reuse A/B/E and existing suspensions. Restore the plan, approved boundaries,
diff and unresolved effects after restart. Keep Stop, Take over, process logs
and file undo easy to reach without turning chat into a terminal dashboard.

### M — Aux Packages

Aux owns the format and documentation: versioned `aux.package.json` with skills,
declarative profiles, prompt templates and workflows using registered tools.
Choose packages per run/profile; pin the manifest/content digest for reproducible
resume. Shipped package directories are read-only to agents; editable user
packages live separately. Resolve root/profile/package conflicts explicitly.

Import compatible Markdown skills for convenience; reject unsupported executable
hooks and report ignored/unsupported metadata rather than silently pretending
full compatibility. Skills cannot grant permissions, expand tools or reach
credentials. Recheck trusted package-management ownership after asynchronous
validation before persistence. Package workflows propose ordinary governed
calls, never a hidden executable plugin runtime.

## Delivery order and lean verification

1. Audit current source and finish A/B/C using the shared effective-policy path.
2. Integrate G/H with exact file-batch E. Prove one real multi-file edit/undo.
3. Integrate I/J and restart-safe suspension/replay. Prove one stopped process
   and one restart with no duplicate effect.
4. Finish F with isolated coder workstreams and conflict-safe integration.
5. Finish K/L/M and runtime packaging; complete one coding task through chat.
6. Deliver browser-flow gaps alongside these slices using the current roadmap,
   then one changed-flow walkthrough and a concise current-state doc update.

Testing serves implementation. During edits, compile affected code and run only
the smallest relevant existing tests. Add tests for new semantics where mistakes
would lose work, repeat effects or broaden authority; don't mirror implementation
or test every UI control. Rebuild runtime dist before runtime tests. Run
`npm run check` once per coherent integrated slice, not after every file edit;
rerun only affected failures after fixes, then one final integrated check.

Use a few combined scenarios rather than a new matrix:

- Ask reviews one concrete multi-file batch; Full skips it; stale content and
  revoked authority cannot dispatch. Include a protected-path denial.
- A suspended code workflow survives restart without repeating an earlier write;
  an uncertain effect is reconciled and remains visible until settled.
- A real supervised command produces logs and Stops its owned process group.
- Two independent coder cells preserve dirty/binary/mode state; integration
  reports a parent conflict and governed undo preserves later user changes.
- An Aux Package loads from the staged runtime; unavailable runtime still leaves
  ordinary browser controls usable during the changed-flow walkthrough.

No new e2e framework, screenshot suite, stress campaign, coverage quota or paid
benchmark sweep. Native edits get the required incremental build and disposable
Profile walkthrough. Existing phase-end perf/20-task milestones stay scheduled,
not repeated per slice; don't claim phase acceptance before their evidence.
Record remaining failures and unsupported paths accurately. Source presence,
a green unit suite and a successful native build establish different things.

## October 7 implementation evidence

Slices A–M are implemented in the existing Aux runtime and native app. The local
integration passed 4,218 tests across 686 files, typecheck and lint; later focused
reply/resume checks rebuild runtime dist and cover only the demonstrated failures.
Native area patches are consolidated through 0086. No push or release was made.

The disposable-profile walkthrough observed a real-provider two-file reviewed
edit; a pending command restored after normal shutdown and executed once; a real
passing test with durable logs; conflict-preserving undo followed by a confirmed
clean reversal; a Full-mode monitor with real output and an acknowledged stop;
and native navigation while the runtime process was paused. The shipped Aux
package and project picker were exercised. Light and dark glass were inspected.
A browser-backed question/answer also completed through the default provider.
The final parked-question check survived normal shutdown and restart: its cached
source loaded automatically, the original run accepted the answer and completed,
and its report was saved. Cached-response endpoint propagation was corrected at
the native network boundary without bypassing semantic filtering. Both parked
and completed sessions closed cleanly; the disposable Profile was retired.

These results establish concrete implementation behavior, not an unmeasured
claim that Aux outperforms Aside, Dia or Arc. The existing phase-end performance,
20-task/default-provider, offline/OAuth and detailed design targets remain
scheduled acceptance. The source-grounded current record and any active failure
are in `/Users/rcourson/Code/web/docs/STATUS.md`; it supersedes old chronological
checkpoint notes. Keep verification proportionate and do not rerun unchanged
passing suites to manufacture additional evidence.

## Definition of this plan's delivery

A user can browse normally during agent work, ask Aux to change a local project,
review a coherent diff in Ask or use Skip confirmation, run relevant checks,
inspect logs, stop work, resume after restart and undo governed file changes
without losing unrelated edits. Aux can orchestrate independent coder cells and
use its own packages. Every consequential effect retains its original authority,
receipt and honest outcome. No foreign agent runtime or unrestricted-eval escape
is required. Remaining competitive/performance claims await real-use evidence.
