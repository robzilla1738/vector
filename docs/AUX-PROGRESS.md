# Aux implementation evidence and continuation record

Phases 1–4 in `AUX-ROADMAP.md` are integrated and handed off as a usable private
`pnpm dev` build with explicit capabilities and limitations. Founder testing now
determines the next roadmap. The former Phase 5 remains a post-handoff backlog.
No app bundle, packaging, publishing or external release is authorized.

User credential constraint: do not search Keychain, password stores, or personal
files for keys/passwords. Ask for missing credentials instead, including publishing
credentials. Source inspection is allowed; tests use synthetic secrets and temp
profiles. Do not read real credential stores to complete a test or migration.

## Private-build delivery status and review limitations

- **Phase 1:** the Electron development build is usable and its daily browser,
  recovery and unpacked-extension paths are implemented. Full-Chromium extension
  compatibility, 1Password/Apple Passwords, real platform passkeys, screen sharing,
  microphone/conferencing and representative live SSO remain unqualified. Modern
  display capture now reaches the native macOS picker on supported releases, but an
  intentional real-screen selection remains a founder hands-on check. Native identity
  work conflicts with the current no-bundle instruction.
- **Phase 2:** persistent conversations, task authority, takeover, evidence, direct
  providers and scoped Codex/Claude MCP connections are implemented. A live model or
  authenticated external-agent journey still needs the user to authorize/configure
  one available connection. The installed local Ollama has only an embedding model.
- **Phase 3:** local issue/app/incident workflows, isolated checkouts, multiple
  toolchains, services/previews, recovery and integrity-checked commit/handoff work.
  Live selected-account GitHub/Vercel/Sentry qualification and any remote write need
  explicitly supplied/authorized service access.
- **Phase 4:** bounded Sandbox lifecycle, desktop-off worker launch, source/lease/
  result continuity, artifacts, preview, reconnect, child tasks and local API/SDK/
  CLI/MCP parity are implemented. Live Vercel qualification, a hosted deletion
  coordinator, provider-side currency controls and real remote-browser takeover need
  cloud credentials/infrastructure authorization; these cannot be truthfully closed
  by another local synthetic check.

The implementation cycle is complete within the private development boundary. These
account, signed-identity and provider-environment items are retained as review
limitations; they are not represented as successful live qualifications. Historical
entries below preserve the state at the time each batch was completed, so older
phrases such as “remains active” are chronology rather than the current roadmap state.

## Phase 1 native display-capture path — integrated, 2026-09-20

Modern `getDisplayMedia` requests now use macOS's native system source picker when
the running OS provides it. Aux does not enumerate windows or screens, choose a
source for the site, or persist a blanket screen-sharing grant; every request keeps
the operating-system selection boundary. Requests without a user gesture, requests
from unowned content, older-system fallback, and legacy `chromeMediaSource` capture
all fail closed. This removes the prior blanket block on supported macOS releases
without weakening the legacy-path protection. Actual capture and conferencing still
need founder-environment qualification because validation must not select or record
the user's real screen without an intentional hands-on action.

## Phase 4 desktop-off worker launch — integrated, 2026-09-20

Cloud handoff can now transfer the exact task/source lease and start the reviewed
executable as one detached provider command. The desktop shows the executable,
arguments, session limit and local-write lock before dispatch. Once accepted, the
provider command identity and intent are persisted immediately, so the worker can
continue for the environment's bounded session after the Aux window closes and its
logs and result can reconcile on reopen. The existing lease-only handoff remains for
interactive terminal work.

The combined API is deliberately desktop-only. Scoped external clients cannot grant
themselves cloud authority or start unattended billable work through it. A failure
after the lease is written leaves cloud authority in place and the command outcome
visible as failed or uncertain; Aux does not silently retry a process that may have
started. Source/revision fencing, result validation, explicit checkpoint/return and
retention preservation remain unchanged.

The affected runtime, contract and desktop surfaces build together, and a synthetic
provider journey verifies that the lease in `.aux/task.json` is the lease persisted
by Aux and that one detached provider command receives the bounded timeout. No live
provider, account or credential was used. Live Vercel qualification and hosted
deletion retry remain externally gated.

Every source upload and authority handoff now also refreshes
`.aux/write-result.mjs`. A worker sends it a small JSON object on stdin; the helper
fills the task identity, revision, source tree, current lease and timestamp from the
durable brief, validates criterion IDs, local-request shape and regular in-workspace
artifact paths, then atomically replaces `.aux/result.json`. A direct isolated run
confirmed the emitted manifest carries the handed-off lease and declared artifact.
This removes stale-identifier hand editing from the normal reconnect path without
turning worker claims into accepted evidence.

Remote workspace browsing, result review, download and preservation now reject every
symbolic-link component in a requested path, including a symlinked parent directory.
This closes the case where a lexically in-workspace artifact could resolve outside
the uploaded workspace after a worker changed the filesystem. The sandbox-local
writer performs the corresponding real-path check before it declares an artifact.

## Phase 4 typed local SDK and client transport parity — integrated, 2026-09-20

The versioned method and result schemas now drive a private `@aux-browser/sdk` client.
It discovers the running loopback runtime, authenticates with the existing bearer
boundary, validates request parameters before dispatch, validates every returned
result and exposes cursor-based event streaming. Transport failures are surfaced as
typed errors and the client never retries an RPC, because a lost response can hide a
completed mutation.

`auxctl` and the MCP server now use this same SDK instead of maintaining separate
HTTP/descriptor implementations. The MCP adapter still drops a stale descriptor
after transport failure and discovers the restarted runtime on the next explicit
call; it does not replay the failed action. Scoped MCP bearer requirements remain in
front of SDK dispatch. Both adapters build against the shared package, the no-replay
restart journey passes, and live workspace/task reads succeeded against the running
development app.

## Phase 2 external-agent client negotiation — integrated, 2026-09-20

External-agent settings now detect the installed Codex and Claude Code executables
and show their reported versions beside the scoped MCP setup. Detection searches the
launch PATH and runs only the executable's bounded `--version` command with a minimal
environment; it does not open either client's configuration, account, credential
store or task history. Private browsing cannot invoke the probe.

The current development host reports Codex CLI `0.155.0-alpha.9.2` and Claude Code
`2.1.277`. This establishes which client versions the generated configuration targets
and removes ambiguity between “not installed” and “not connected.” It does not claim
an authenticated agent run: the one-time scoped configuration still has to be merged
into the chosen client, which keeps its own model/account authentication.

## Phase 4 revision-pinned cloud task handoff — integrated, 2026-09-20

The explicit cloud upload now transfers both the selected checkout and a bounded
`.aux/task.json` brief containing only the saved task ID, revision, title, objective
and acceptance criteria. This gives a detached coding-agent process a durable task
contract after Aux closes instead of leaving it with source code but no definition
of done. The adjacent source manifest advances to v2 and keeps the exact local tree
identity, project identity, file count and upload time.

The upload control and disclosure now name the task-brief transfer. Browser cookies,
model credentials, workspace memory, page observations, unrelated task resources and
host environment variables remain excluded. Cloud exports retain the source/task
manifests for review while excluding the transient preview-proxy implementation.
The brief also declares a bounded `aux-cloud-result-v1` contract. On reconnect, Aux
can load `.aux/result.json`, reject malformed results, stale task revisions, different
source trees, duplicate/foreign criteria and unsafe artifact paths, then show the
worker summary, criterion claims and artifact locations as untrusted evidence for
human review. It never auto-accepts a criterion. The same validated read is available
to the task-scoped MCP client, and the scoped catalog now actually advertises the
implemented cloud inspection/command lifecycle tools.

The desktop reviewer can import each validated worker criterion claim into the
authoritative task evidence ledger. Every imported record preserves the environment,
uploaded source tree and result timestamp, includes the bounded result summary and
declared artifact paths, and remains an external-client claim. Import is idempotent
for the same environment/result/criterion and refreshes the task receipt; it never
creates a human review or accepts a criterion. Active runs, archived tasks, foreign
criteria and changed revisions reject the import.

Declared result artifacts are now actionable instead of display-only paths. Aux
revalidates the exact result timestamp and declared path at download time, accepts
only a regular sandbox file, caps individual artifacts at 25 MB, stages the bytes
inside protected Aux storage, reports a SHA-256, and removes staging after the native
Save flow. Undeclared paths, changed manifests, symbolic links and oversized files
fail closed; larger output can still use the bounded workspace export.

Preserving a result now closes the disposable-compute gap. Aux first validates the
manifest against the exact task revision and uploaded tree, stages every declared
regular file under a 25 MB per-file and 50 MB aggregate limit, and atomically stores
the result manifest and bytes in its local artifact store. Criterion evidence carries
each durable artifact ID, label, byte count and SHA-256. The task receipt can save
those exact stored bytes later even after the sandbox is stopped or deleted, and the
normal Aux backup includes them. A repeated import reuses the existing evidence and
does not create another artifact set. None of this grants acceptance automatically.

Contracts, runtime, MCP and desktop compile together without provider access; focused
authority/catalog checks pass. Live detached-agent execution still requires the user
to authenticate deliberately inside the remote terminal and qualify the configured
Vercel account.

Current provider research confirms that Vercel Sandbox supplies compute, coding-agent
CLIs, files, commands and previews, while a remotely viewable/takeover browser is a
separate managed-browser service connected over CDP. Aux does not silently install or
select such a provider. Remote browser takeover therefore remains credential- and
provider-dependent rather than being misrepresented as a Sandbox capability.

## Phase 1 new-tab search routing — repaired, 2026-09-20

Auto routing no longer creates ordinary `about:blank` or `data:` new-tab surfaces
on the specialized Aux Engine. Those documents are usually temporary browser tabs;
pinning one to the engine made its later Search navigation inherit the engine's
restricted network policy and could reject DuckDuckGo instead of browsing. Auto mode
now starts transient documents on embedded Chromium, while explicit Engine requests
and qualified real origins retain the existing engine path. The running app exposed
the failure without revealing page content, and the focused routing regression plus
the runtime build pass.

## Phase 4 current universal cloud image — integrated, 2026-09-20

New cloud environments now default to Vercel Sandbox's current Universal image
through the installed v3 SDK instead of a deprecated language-runtime selector.
The environment remains task/revision/project bound and retains the same session,
lifetime-resource, cleanup, source-transfer, preview and explicit-resume boundaries.
Existing Node 24, Node 22 and Python 3.13 records remain readable and resumable;
those choices stay available in the UI with an explicit Legacy label.

The Universal option provides the supported multi-toolchain base for Node, Python,
Bun, containers and installed coding-agent CLIs. Aux does not copy local browser
sessions, model keys or agent credentials into it. Any remote-agent sign-in must be
performed deliberately in the task-scoped cloud terminal. Contracts, runtime and
desktop compile together; no provider resource or credential was used for this
credential-independent integration.

## Phase 4 bounded child-task coordination — integrated, 2026-09-20

Saved tasks can now carry durable parent identity. A task-scoped external connection
may create a resource-free child beneath its root or an existing descendant, then
list, inspect, revise and run only that bounded descendant tree. It cannot create a
new root, cross workspaces, attach browser pages or repositories, or access a sibling
outside the original scope. Workspace-scoped connections can create roots or children
inside their workspace under the same resource-attachment rule.

Aux limits decomposition to four levels and 20 direct children per task. Children do
not inherit browser, repository, environment or file authority; they own independent
revisions, resources, runs and evidence. The Tasks page marks child records, shows
their parent relationship and can create a child directly from a saved task with a
separate recoverable draft. Contracts, runtime authorization, MCP catalog and desktop
UI compile together, and the focused authority check proves descendant visibility and
rejects root and cross-workspace escape.

## Phase 4 reviewed external-agent cloud work — integrated, 2026-09-20

A task- or workspace-scoped MCP client can now inspect its task's remote workspace,
read bounded UTF-8 files, reconcile command status and propose an exact cloud command
or bounded service. The desktop brings the review to the foreground and shows the
task revision, environment identity, runtime, region, exact arguments, time limit and
billable-compute warning. Nothing dispatches unless the user approves that native
dialog, and task/resource authority is checked again afterward against the current
environment record.

This does not let an external agent create, delete, resume or stop environments, open
terminals or previews, export files, inspect account-wide inventory or clean orphans.
Those resource and account boundaries remain explicit desktop actions. If Aux is not
open on the local Mac, a proposed command reports that local approval is required
rather than waiting ambiguously or bypassing review. Command intent persistence and
uncertain-outcome handling still apply after approval.

A scoped agent can stop its own recorded running command or service, which completes
the approved process lifecycle without granting control of the environment itself.

All inspection paths now request provider state with resume disabled. Reading files,
refreshing logs, stopping work, deleting resources and cleanup cannot wake a stopped
sandbox as a side effect. Commands, services, source transfer, terminals, exports and
protected previews require the durable record and provider to both report `running`;
the user must use the explicit Resume action first. The desktop disables these active
controls while stopped, preserving the lifecycle and billing boundary in the UI too.

The versioned runtime/native bridge, desktop approval surface and Aux MCP catalog
compile together. Focused MCP transport and API result checks pass. Live provider
dispatch remains credential-dependent; no provider account or secret was accessed.

## Phase 4 cloud command reconnect reconciliation — integrated, 2026-09-20

Opening cloud command history now reconciles every persisted in-flight service with
the provider's command identity without resuming the sandbox or dispatching another
process. Completed and failed commands recover their exit status, bounded output,
duration and finish time after an Aux restart. Commands still running remain running.

If the provider cannot answer for one command, Aux preserves the last known state and
shows the refresh error beside that command. It does not invent an exit result, clear
the record or retry the work. A later refresh can settle the same durable identity.
Foreground commands and detached services now also persist an intent before provider
dispatch. If Aux loses the provider response before it can save the remote command
identity, the record becomes **uncertain** after the request fails or after restart.
The UI directs the user to inspect the remote workspace before choosing whether to
run it again; Aux never retries that potentially executed command automatically.
Contracts, runtime and desktop production builds pass together, as does the focused
API contract suite. Live reconnect qualification still requires the explicitly
configured Vercel Sandbox account; no credentials or provider resources were used.

## 2026-09-20 — Active completion boundary revised to Phases 1–4

At the founder’s direction, Phase 5 is no longer a delivery phase or completion gate.
The active objective is to complete and verify the daily browser, trusted connected
agent work, local development and cloud-continuity phases, then provide a usable
private development build and a concise capability/limitations handoff. Aux stops
there for hands-on review. The seven-day pilot, founder acceptance program, broad
refinement campaign, packaging/signing/release work and speculative post-testing
features cannot delay that handoff. Necessary safety, recovery, compatibility, data
integrity and bounded performance validation remain embedded in Phases 1–4.


## Phase 3 exact-source validation handoff — integrated, 2026-09-20

Successful bounded checks now record the exact Git tree present after the process
finishes. A delivery handoff qualifies that check only when it belongs to the open
task and saved task revision and its tree still matches the checkout being reviewed.
Edits made after a check, results from another task revision, legacy results without
a fingerprint and checks whose fingerprint could not be captured remain visible as
evidence but cannot authorize readiness or a local commit.

The persisted command record, command UI, review summary and hashed delivery manifest
all expose the checkout fingerprint. Fingerprinting uses Aux's existing temporary Git
index with repository hooks, global configuration, credentials, filters and network
disabled; it does not modify the working index. A restart retains the proof, while an
interruption during finalization remains interrupted and is never promoted to success.

The focused real-process and isolated-repository checks pass, including persistence,
exact-tree readiness, local commit integrity and stale-handoff rejection. The desktop
production build also passes. This closes the stale-check authorization gap; broader
issue/app/incident journeys and connected service qualification remain Phase 3 work.


## Phase 2 authenticated browser-session operations — integrated, 2026-09-20

Aux’s zero-model operation router can now select a session-required HTTP implementation
when an authorized live page is on the operation’s site. The request executes inside
that exact page origin, so the browser applies its existing sign-in state without Aux
exporting cookies, tokens or storage credentials. This repairs a stale eligibility rule
that previously marked the implemented in-page route permanently unavailable across
the runtime API, CLI and MCP surfaces.

Session-required operations fail closed when the exact origin is unavailable, including
when a caller explicitly names the implementation; they never fall back to a plain
runtime request. Saving an operation now rejects cross-site endpoints, URL credentials,
Cookie/Authorization/Proxy-Authorization headers and header line injection before any
secret-bearing executable can be persisted. Both in-page and credentialless response
bodies are capped at 1 MB and report truncation. Existing effect and egress grants,
pre-dispatch intent records, idempotency keys and no-retry rules for uncertain writes
remain in force.

The runtime and desktop production builds pass, and the focused operation suite covers
same-site in-page routing plus pre-persistence cross-site and secret-header rejection.
Qualification against a real signed-in service remains account-dependent; no browser
cookies, credentials or personal sites were accessed.


## Phase 2 connected-operation uncertainty — integrated, 2026-09-20

The zero-model operation path now participates in the same task-level recovery
boundary as browser-planned writes. If Aux loses confirmation after a connected
write, destructive action or egress operation, the task becomes uncertain, its next
run is blocked and the exact invocation appears in the task receipt. Read operations
and failures proven to occur before dispatch do not create this block.

The receipt identifies the operation, effect class, run, time and last safe error.
The user can settle it only from the desktop UI using fresh evidence from the current
task revision and a written reason. Reconciliation updates the invocation atomically,
writes a dedicated immutable audit row and emits a task event; it never repeats the
external operation. External clients cannot perform this human decision. Markdown
receipt exports preserve unresolved connected operations for offline review.

The database advances to schema 10 with the normal private pre-upgrade snapshot and
a backward-safe reconciliation table. Focused migration, task receipt, renderer and
runtime tests pass, as do the contracts/runtime/desktop production builds. This closes
the previously separate operation-invocation recovery route without adding another
journal or requiring a live account.


## Phase 4 bounded cloud lifecycle and scheduled cleanup — integrated, 2026-09-20

Every newly created Vercel Sandbox now has a required six-hour, 24-hour or three-day
auto-delete deadline in Aux’s durable environment record and in a provider resource
tag. The default is 24 hours and the enforced maximum is 72. The runtime reconciles
due resources on startup and once per minute wherever that runtime is hosted, deletes
the sandbox together with orphan snapshots, persists in-progress state before the
provider call and retries failures after a bounded backoff. Manual deletion clears
the schedule. The task UI shows the exact cleanup time, active deletion and retry
errors rather than leaving retained compute ambiguous.

The existing account-wide cap, per-task retained-resource cap, 45-minute session cap,
90-minute lifetime CPU ceiling and 1 GB lifetime egress ceiling now guard every path
that can start more work: commands, detached services, source upload, terminal and
protected preview. Refresh automatically stops a running sandbox that has crossed a
lifetime resource limit. Export, inspection, stop and delete remain available for
recovery. Aux explicitly reports that Vercel currency-budget enforcement is unavailable;
resource ceilings are never presented as a dollar cap.

Runtime and desktop production builds pass. A synthetic provider lifecycle probe
reconciled an overdue persisted environment, requested deletion with orphan snapshots,
and retained the final deleted record. Real-provider qualification, a deployed
desktop-independent coordinator and provider-side currency controls remain Phase 4
dependencies; no credentials were discovered or used.


## Phase 4 exact-source cloud transfer and interrupted-sync recovery — integrated, 2026-09-20

Cloud source upload now binds one transfer to the current saved task revision and an
exact Git tree from the attached local checkout. Aux fingerprints before collecting
files and again after collection; if an editor or process changes the checkout in
between, no provider write begins. The environment records the accepted tree, task
revision, transferred paths and omitted-file count, and the remote workspace receives
a small Aux source manifest after the upload finishes.

Aux persists `uploading` before mutating the sandbox. A crash or provider failure
therefore leaves a visible interrupted/failed state instead of a false successful
snapshot. Commands, services and protected previews remain blocked until the user
uploads a stable checkout again. Inspection, terminal recovery, export and deletion
remain available. A later successful upload removes files previously managed by Aux
that were deleted locally while preserving remote generated files and files Aux never
owned. Binary, unreadable, over-limit and beyond-cap files remain explicitly skipped;
the local tree identifies the source selection but does not claim those omissions were
copied.

The existing hook/filter/credential-free temporary Git index supplies the fingerprint.
Contracts, runtime/native bridge, desktop main/renderer and the production build pass
together. Live transfer still requires an explicitly supplied Vercel Sandbox account;
no credentials or real remote resources were accessed.


## Phase 3 coordinated local service stacks — integrated, 2026-09-20

Detected local services can now be reviewed and started as one task-scoped stack.
The project panel presents the available manifest-derived service commands in stable
startup order, limits the selection to Aux’s existing four-service budget, and uses
one native confirmation showing every exact command and the checkout directory.
Detection remains inert; repository code runs only after that confirmation and a
second task-revision/project-authority check.

Each stack member retains an independent persisted command record and output stream.
The records carry stack identity, label and order across UI reloads and Aux restart.
Stopping the stack terminates every active member. If a member fails unexpectedly,
Aux stops its siblings; partial synchronous startup rolls back already-started members.
Interrupted or failed stacks never restart silently. A restart action appears only
when every member still belongs to the open saved task revision and requires the same
native review again. Individual service controls and manual commands remain available.

Contracts, desktop main/preload/renderer and the production build compile together.
A focused real-process probe started two Node services, forced the second to exit 7,
and observed the first become canceled while the failing member retained its exit
status. Live multi-service repositories and readiness-aware dependency sequencing
remain Phase 3 qualification work; this implementation guarantees reviewed startup
order and coordinated failure, not inferred application readiness.


## Safe idle-tab suspension — integrated, 2026-09-20

Ordinary Chromium tabs that remain hidden for ten minutes now enter Chromium's frozen
lifecycle state and wake as soon as they are selected, split, recovered, captured or
used for staged agent interaction. Aux does not freeze audible or loading pages,
popups, engine views, visible/split tabs, offscreen pages under active automation, or
runtime-owned background workers. Runtime ownership now crosses the versioned native
bridge explicitly instead of being guessed from layout state.

Suspension preserves the live renderer and DOM rather than discarding the tab or
reloading its URL, so form state and navigation history remain in memory. Lifecycle
commands are serialized per tab to prevent a late freeze racing a user selection;
unsupported or detached debugger sessions fail open and leave the page active. The
private health history records only the maximum suspended-page count and aggregate
suspension-failure total alongside its existing resource measurements, so the founder
can see when the optimization was unavailable without exposing sites or content.

Electron 43.6.0 accepted a real frozen→active lifecycle round trip in a temporary
native WebContentsView. Contracts, runtime, desktop main/preload/renderer and the
production desktop build compile together. The seven-day pilot must still measure
whether this policy improves resources without disrupting the founder's real sites.

## Canonical Aux developer entry points — integrated, 2026-09-20

The public command is now documented and rendered as `auxctl`, including help,
examples, usage failures and error prefixes. The package continues to install the
legacy `vector` command as a compatibility alias, so existing scripts keep working.
The root workspace identity and description now say Aux. Internal `@vector/*` package
imports and backend identifiers remain compatibility contracts until their versioned
migration exists; they are no longer presented as a second product.

Desktop-generated scoped MCP connections already advertise `aux_*` tools. Their
read-only resources now follow the same mode (`aux://…` for canonical scoped
connections and `vector://…` for the legacy direct development catalog), and public
MCP copy calls the product Aux. CLI/MCP documentation now leads with Aux and explains
the retained aliases. This is an A1/A2/A4 migration increment, not a profile/database
rename or permission to break third-party clients.

## Private browser-health history — integrated, seven-day observation in progress, 2026-09-20

Aux now records one local health sample per minute while the regular browser is open.
The bounded eight-day record contains only time, anonymous per-launch identity, app
uptime, aggregate Electron-process CPU and working-set memory, main-process timer lag,
regular-window and tab counts, and renderer crash/unresponsive totals. It never contains
URLs, titles, site origins, browsing content, task
text, account identity or credentials. The file is private to the Aux data directory,
keeps at most 12,000 samples and is flushed at startup, periodically and during a
normal quit.

Settings → General shows recording span, observed open time, session count, typical
startup time, p95 CPU, memory and responsiveness, renderer failures, and maximum tabs. It describes the result as app-open
observation instead of claiming continuous uptime, indicates when a real seven-day
span has been reached, and provides one local Clear action. Private windows cannot
read or erase the record. The support report includes the same aggregate summary but
never its raw samples.

Desktop main, preload, renderer and mock bridge typechecking passes. This supplies the
instrumentation and private review surface for B6/L2; the actual seven-day founder
browsing period and performance interpretation remain live acceptance work rather than
an automated claim.

## Founder support diagnostics — integrated, 2026-09-20

Settings → General now exports one readable JSON support report through the native
Save dialog. It records Aux/Electron/Chromium/Node identity, runtime contract and
engine mode, browser window/page/extension counts, task/run status totals, nonsecret
appearance/model modes, credential source presence and the current compatibility
limits for extensions, passkeys, password managers, screen sharing and packaging.
The report includes a SHA-256 payload digest so a retained diagnostic can be checked
for accidental modification.

The report is assembled from an explicit allowlist. It excludes secret values and
secret references, endpoints, URLs, page titles, history, bookmarks, prompts,
responses, task text, account names and emails, local paths, artifacts and document
content. It aggregates task state across every workspace without serializing any
workspace or task identity. Private windows cannot call the export surface. An
unavailable runtime produces an honest disconnected report instead of blocking the
browser or inventing capability state.

Desktop main, preload, renderer and mock bridges compile together and the production
renderer build succeeds. The report is ready for the personal browsing pilot and
future fault/compatibility qualification; it does not replace those live gates. No
credential store, personal page data, app bundle, publish or external service was used.

## Portable runtime-data backup and guarded restore — integrated, 2026-09-20

Settings → General can now create a consistent SQLite snapshot through `VACUUM INTO`,
which includes committed WAL content instead of copying only the live main database.
Aux places it in a portable recovery folder with every available complete artifact
body referenced by the snapshot plus a versioned digest manifest. The bundle carries
workspaces, tasks, conversations, evidence, captured screenshots and generated task
artifacts, browsing records and runtime preferences. It caps artifact data at 1 GB and
10,000 records, reports source artifacts that were already unavailable, and warns that
URLs, task content and artifacts make the folder private. Cookies, browser sign-ins,
extensions, downloads, project checkouts, cloud resources and encrypted credentials
remain outside the bundle.

Restore is staged rather than overwriting a live runtime. Aux validates SQLite
integrity, supported schema range, required core tables, file size and the absence of
triggers, views or virtual-table schema; removes the disabled legacy plaintext Gateway
setting; verifies every artifact path, size and SHA-256; rejects traversal, symlinks
and collisions with different current data; rewrites artifact paths for the destination
Aux data directory; writes a SHA-256-bound pending record; and lets the user cancel.
Artifact rows whose bodies were missing when the bundle was created are restored as
unavailable instead of retaining a stale absolute path.
On the next launch, before the runtime opens, the native process verifies the digest
and every artifact again, copies only nonconflicting immutable bodies, creates a
consistent private recovery snapshot of the current database, swaps the staged database
atomically, removes stale WAL/SHM files and records the restore time. A damaged or
incomplete staged restore is quarantined while the current data continues to open.

A focused cross-directory recovery simulation created a schema-v9 WAL database with
one available and one missing artifact, copied the bundle to another location, staged
and applied it to a different Aux data directory, recovered the database and available
artifact contents, marked the missing body unavailable, rewrote its paths, removed the
legacy plaintext credential, consumed the pending marker and retained the pre-restore
database. Contracts, runtime and desktop compile together. Full browser-profile,
project and cloud migration plus personal credential validation remain A3/L2 work and
require their own authorization and closed-application process.

## Phase 3 read-only GitHub delivery connection — implemented, live qualification pending, 2026-09-20

Settings now has one concise Connections page for an explicitly supplied fine-grained
GitHub token. Aux saves it through the existing OS-encrypted secret bridge, never
returns it to the renderer or writes it to preferences/database, and supports an
explicit account probe and disconnect. The health record retains only account identity,
reported classic scopes and check time. Aux does not inspect GitHub CLI, browser cookies,
Keychain entries or other credential stores to discover a token.

An attached managed checkout can now be matched to a recognized `github.com` HTTPS or
SSH origin without invoking a credential helper or network-capable Git protocol. A
read-only API check reports the connected account, repository visibility, permissions,
default branch, whether the reviewed baseline and current local head exist remotely,
and the head's combined commit status. The result is revalidated against the checkout,
saved with the project, visible in Tasks, available to its scoped MCP connection and
included in the durable review handoff. The repository opens as an ordinary Aux tab.

This implementation compiles across contracts, runtime, native shell, renderer and MCP.
Live account/repository qualification requires a token deliberately entered by the user;
none was requested or discovered during implementation. Push, branch publication, PR
creation and every other GitHub write remain disabled under the current no-publish
instruction. Vercel/Sentry incident connections and authorized remote delivery remain
open Phase 3 work.

## Phase 3 durable incident snapshot — integrated, 2026-09-20

The linked project-preview diagnostics can now become a durable incident report with
one action. Aux binds the exact saved task revision and attached checkout to the live
page, working-tree state, bounded diff, last 100 console messages, last 100 network
responses and 10 recent project commands. Scoped agents receive the same tool only for
a task-authorized page or their explicitly approved project preview. The runtime and
native shell both recheck task/project authority before writing the report outside the
checkout.

The report strips URL user information and fragments and replaces query values with
redacted markers before persistence. It records time, provenance and explicit limits;
it does not claim root cause, current remote health or successful remediation. The
renderer exposes the saved location beside live diagnostics, and scoped Codex/Claude
connections can prepare the same evidence for review. Compiler validation covers the
new contract, runtime, native and renderer path. Direct Sentry/Vercel context remains
open and will require explicitly supplied service connections.

## Phase 3 Python projects and complete scoped file lifecycle — integrated, 2026-09-20

Aux now recognizes Django, FastAPI and Flask applications from bounded root manifests
and regular entry files without importing project code. It offers manager-aware setup,
pytest/Ruff/mypy checks when declared, and framework-specific local service commands.
The existing task-bound approval, service lifecycle and loopback preview path carried a
detected Django project from `.venv` preparation through its system check to a rendered
Aux preview. Rust and Go projects have guided checks and runnable services when detected. Ruby, JVM, PHP and container support is recorded in the later multi-toolchain update below.

Scoped Codex and Claude Code connections now have a complete ordinary text-file
lifecycle: create, conflict-safe write, rename and delete. Rename and deletion require
the expected SHA-256 and a native review bound to the exact saved task revision and
attached checkout. Aux rechecks the file and task after approval, serializes mutations,
refuses replacement, and keeps a recovery copy outside the working tree. These actions
still cannot touch an unrelated repository, commit, push or publish.

The inspected environment UI is in `release/test-artifacts/aux-project-environment.png`.
The native project journey passed with the detected Python check, local service, preview,
restart, recovery and handoff intact. Compiler validation covers the added MCP/runtime/
native contracts. Broader real repositories and connected GitHub/Vercel/Sentry delivery
remain Phase 3 gates; no personal repository, credential store, bundle or remote write
was used.

## Phase 3 task-scoped external editor continuity — integrated, 2026-09-20

An attached managed-checkout file can now move from Aux to its macOS default editor
and back without relying on the user to remember a manual refresh. Opening it carries
the exact saved-task identity and revision through the native boundary; a stale task
or checkout that is not attached to that task cannot open. Aux checks the disk file
when its window regains focus and also provides a deliberate **Check disk changes**
action.

A clean editor adopts an external change immediately. When both the Aux draft and
disk version changed, Aux preserves the draft, shows the current external contents,
blocks an ordinary save, and requires an explicit choice. The user can adopt the
external version or replace it with the Aux draft; replacement uses the external
version's exact hash and retains that version in recovery history. The same conflict
state is reconstructed when a saved draft meets a changed file after restart.

The native isolated-project journey now verifies stale-revision rejection before
the operating-system open call, exact checkout path handoff, clean return, two-sided
conflict review, recoverable resolution, rename, delivery patch and restart. The
rendered conflict state was inspected at
`release/test-artifacts/aux-external-editor-conflict.png`. This closes the human
external-editor continuity gap; agent planning, broader toolchains and connected
GitHub/Vercel/Sentry work remain open in Phase 3. No personal repository, credential
store, bundle, publish or remote write was used.

## Phase 3 scoped-agent local preview loop — integrated, 2026-09-20

A Codex or Claude Code connection scoped to a saved task can now carry its attached
managed checkout through the browser-preview part of the development loop. After an
approved local service starts and reports ready, the agent can request an exact
localhost URL. Aux shows a native dialog with task, revision, project and URL, sends
a cookie-free loopback check only after approval, and opens a tab only for a successful
response. The requesting connection receives temporary access to that page while
unrelated tabs remain hidden; the grant disappears when Aux restarts and revocation
still stops the live MCP process immediately.

The native scoped-agent journey now uses the managed checkout to serve a real page,
opens it through this boundary, reads the rendered heading through Aux's browser
observation, then stops the service and carries the command and file changes into the
integrity-checked review and local commit. The captured native page at
`release/test-artifacts/aux-scoped-agent-preview-page.png` was inspected to verify
the heading actually rendered. This closes the missing preview segment in
the scoped external-agent development loop. A user-configured real Codex/Claude model,
broader toolchains and connected GitHub/Vercel/Sentry delivery remain Phase 3 gates;
the synthetic MCP client does not qualify those. No personal repository, credential
store, bundle, publish or remote write was used.

## Phase 2 durable provider provenance — integrated, 2026-09-20

Every recorded model call now carries Aux-controlled provider and sanitized destination
provenance alongside the exact model ID. The destination is reduced to its URL origin;
paths, query strings, credentials and provider response bodies never enter this record.
Full-page conversations expose the provider/model quietly beneath a turn and expand to
show destination, token counts and whether cost reporting is complete. The same summary
is rebuilt from persisted model-call records after restart instead of degrading to an
opaque call count.

Saved-task receipts and their Markdown exports now carry the distinct providers,
models and destinations used through the selected revision, together with existing
call and cost totals. This preserves historical execution identity even if the active
model setting later changes. The isolated native connected-agent journey configured a
local compatible endpoint, streamed a real planner request, took and returned control,
cancelled the request, restarted Aux, completed a provider-backed follow-up in the same
conversation and verified the exact provenance remained visible.
The rendered state was inspected at
`release/test-artifacts/aux-agent-provider-provenance.png`. The synthetic key remained
absent from the isolated data directory. Live third-party account qualification still
requires a connection explicitly configured by the user.

## Phase 2 saved-task conversation continuity — integrated, 2026-09-20

Every saved task now owns one durable conversation across all of its revisions and
runs. Starting a later revision reuses that conversation, includes the deliberately
selected prior turns, documents and generated artifacts, and snapshots the task
workspace memory exactly once. The full-page conversation shows the saved task title,
all revision turns, its fixed task workspace and the same inspectable context panel.
Tasks can open that exact conversation directly.

Task authority remains in Tasks: a task conversation cannot be independently renamed,
archived, deleted, retried as an unscoped chat or moved to another workspace. Renaming,
archiving and restoring the task update its conversation. Chat history identifies saved
tasks and exposes only **Open saved task** for them. A version 9 database transition
merges legacy per-run task chats, preserves task/run records and carries forward saved
context choices under the stable task conversation ID; the normal pre-upgrade private
backup and transactional rollback protections apply.

The isolated native journey reopened a task after restart, rendered two revisions in
one full-page thread, inspected its governed context, navigated precisely between
Tasks, the run panel and Chats, and confirmed task archive state follows into
conversation history without creating an unscoped replacement run. The rendered state
was inspected at `release/test-artifacts/aux-task-conversation.png`. No provider,
credential store, app bundle or external release was used. Live qualification with a
user-configured provider remains part of the Phase 2 exit gate.

## Phase 1 current-site trust and privacy controls — integrated, 2026-09-20

The site icon in Aux's compact vertical address field and horizontal toolbar now
opens one current-site control center. It reports the exact live origin, distinguishes
encrypted HTTPS, local HTTP and unencrypted remote HTTP, counts cookies visible to
that page, and shows its saved permission decisions. A user can reset one decision
or all access for the origin, or clear cookies and stored website data through the
existing cancel-first native confirmation. The data-clearing boundary rechecks the
tab and origin after confirmation so approval cannot be reused after navigation.

The same surface works in a private window against only that process's nonpersistent
session and in-memory permission map. Private clearing now uses the same confirmation
and changed-tab check as regular browsing; it does not touch the regular profile.
Closing the panel restores keyboard focus to the visible address-field site control.

The native journey used an isolated local site and profile to inspect cookie and
permission state, reset one permission, approve scoped data clearing and verify the
updated state. The existing full private-browser journey now clears and reseeds its
private cookie/storage through this UI, then proves restart isolation and coordinated
exit behavior. The rendered control center was inspected at
`release/test-artifacts/aux-site-controls.png`. It is deliberately a concise trust
surface, not a certificate viewer or a claim that the wider password-manager,
passkey, extension and media compatibility gate is resolved.

## Phase 2 durable conversation sources — integrated, 2026-09-20

Every web page Aux actually observes during an agent turn now appears as compact,
expandable source provenance beneath that turn. A source records the URL, title,
observation timestamp, exact saved artifact identity, document epoch and revision.
Repeated observations of one URL in a turn collapse to the latest revision. Local
file URLs and internal pages are excluded, while captured page bodies and artifact
paths never enter the source API or interface.

Selecting a source returns to the original browser tab when it remains live. If the
tab was closed, the same deliberate action reopens its URL in a new tab. Conversation
Markdown exports include the same source identities and timestamps beside the turn
that used them. Observation artifacts are now detected by their validated content,
so they cannot accidentally appear as reusable generated text merely because their
filename differs from the normal internal naming convention.

The isolated native journey persisted two web sources across a full Aux restart,
deduplicated an older observation, excluded a local-file observation, opened the
live tab, restored the closed tab and inspected the exported report. It also caught
and corrected a broken-preview image state: unavailable previews now fall back to
the source URL without leaving a broken image in the shell. The rendered state was
inspected in `release/test-artifacts/aux-conversation-sources.png`. No provider,
personal data, credential store, bundle or external release was used. These records
prove what Aux observed; they remain explicitly distinct from independent outcome
verification.

## Phase 2 connected-agent control path — integrated with synthetic provider, 2026-09-20

Aux can now use a deliberately configured OpenAI-compatible provider alongside its
existing Gateway, OpenAI, Anthropic and Google choices. The dedicated Settings row
shows the exact destination, requires HTTPS for remote hosts and allows plain HTTP
only on localhost/loopback. It rejects embedded credentials, query parameters and
fragments. The model key uses the existing desktop encrypted secret store and is
never returned to the renderer, database or preferences file. Changing any part of
the connection invalidates its prior health result, and no provider fallback occurs.

The full-page conversation now exposes an explicit Take control action for a live
task. Taking control pauses its run and opens the actual task tab. Returning one
page cannot accidentally resume a multi-page run while another scoped page remains
under human control. Return and Stop are duplicate-safe while in progress, and the
run stays visibly paused until every held page is handed back.

The isolated native journey configures and probes a local OpenAI-compatible fixture,
starts a real streamed planner call, takes and returns browser control, cancels the
run, restarts Aux and verifies the endpoint, masked encrypted key and successful
health result persist. It also scans the isolated Aux data directory to confirm the
synthetic key is absent in plaintext. Rendered states were inspected in
`release/test-artifacts/aux-openai-compatible-settings.png` and
`release/test-artifacts/aux-agent-human-control.png`. No personal credential store,
external provider, app bundle or release was used. Phase 2 still requires a real
user-configured provider or supported existing-agent task before its live gate can
be called complete.

## Phase 2 portable conversation reports — integrated, 2026-09-20

Every saved full-page conversation now has one quiet header action that exports the
complete thread as Markdown through Aux's existing native save dialog. Export loads
all turns from runtime pagination rather than relying on the currently rendered
page. It records prompts, visible structured results, safe failure recovery text,
turn status, timestamps, workspace-memory revision, selected context provenance and
human-facing local/generated artifact metadata.

The report explicitly omits hidden prompt context, local document and workspace-note
contents, generated artifact bodies and filesystem paths. Untrusted visible text is
escaped as inert Markdown/HTML text. The report states that it is a transcript and
provenance record, not independent verification of consequential outcomes. Canceling
the native save leaves the conversation unchanged.

The isolated native artifact journey now exports a real Markdown file after a full
Aux restart and verifies its artifact provenance while confirming a seeded hidden
prompt and temporary path are absent. The understated header action is visible in
`release/test-artifacts/aux-conversation-artifact-context.png`. No provider request,
credential store, personal data, app bundle or external release was used.

## Phase 2 revisioned workspace memory — integrated, 2026-09-20

The conversation Context panel can now bind a chat to one saved workspace and edit
a bounded shared memory note. The panel shows the workspace, exact memory revision
and update time; saving rejects a stale revision instead of overwriting a newer
edit. The selected workspace and its memory survive a complete Aux restart. The
composer shows the selected workspace name without adding another permanent control.

At run start, Aux snapshots the workspace note into bounded context and records its
workspace ID and revision. The same memory enters saved-task runs automatically from
the task's workspace. Retry retains the original snapshot and revision even after
the shared note changes. The note is user-authored reference context and never
grants page, project, credential or action authority. Scoped external clients cannot
read or rewrite it through the API; management remains in the Aux desktop.

The isolated native journey creates a workspace, selects it in a conversation,
saves memory, fully restarts Aux, verifies the restored scope and note, and confirms
both a follow-up conversation turn and saved-task run carry revision 1. The rendered
state was inspected in `release/test-artifacts/aux-conversation-workspace-memory.png`.
No provider request, credential store, personal data, app bundle or external release
was used. Cross-device synchronization and cloud workspace memory remain Phase 4
work rather than implicit behavior of this local profile.

## Phase 2 generated-artifact context continuity — integrated, 2026-09-20

Text, Markdown, CSV and JSON artifacts produced by earlier turns now appear in the
conversation's existing Context panel. They are excluded by default and can be
selected deliberately for a follow-up. The row identifies the artifact, originating
turn, size and bounded excerpt. Internal observation snapshots, nontext content,
oversized files, missing files and artifacts from another conversation remain out
of this surface.

Selection lives in the runtime profile and survives a full Aux restart. Context
assembly reads only supported bounded content, labels it as untrusted reference
text and stamps the exact artifact IDs on the new run. Retry preserves that exact
prompt snapshot even if the current selection changes later. The conversation API
does not expose the artifact's filesystem path, and deleting a conversation clears
its artifact selection with its artifact records and safely contained files.

The isolated native journey selects a synthetic Markdown output, restarts Aux,
verifies the selected row, starts the next turn with exact provenance and confirms
the path stays absent. The rendered state was inspected in
`release/test-artifacts/aux-conversation-artifact-context.png`. No provider request,
credential store, personal data, app bundle or external release was used. Binary
and image artifacts remain visible through their existing turn previews rather than
being flattened into model text context.

## Phase 2 local-document conversation context — integrated, 2026-09-20

The full-page conversation can now attach up to five local text, Markdown, CSV or
JSON documents through the existing native file picker. Aux shows the filename,
size and a bounded excerpt; each snapshot can be included, excluded or removed
before the next turn. A document may be attached before the first message. That
unsent conversation identity, its draft and its document list survive a complete
Aux restart, so the selection cannot become an invisible orphan.

Only the selected text snapshot enters Aux's runtime profile. The native source
path is never returned to the renderer or written into run history. The runtime
assembles bounded untrusted document sections and stamps the exact attachment IDs
onto each new turn; retry retains the original snapshot even if the source file or
current selection changes later. Conversation deletion removes the attachment
record with the rest of the chat-owned data.

The isolated native journey selects a synthetic document, changes the source file,
fully restarts Aux, verifies the original snapshot, starts the next turn and removes
the document from the rendered context panel. The expanded state was inspected in
`release/test-artifacts/aux-conversation-document-context.png`. No provider request,
credential store, personal file, app bundle or external release was used. Workspace
memory remains independent Phase 2 work.

## Phase 2 durable conversation lifecycle — integrated, 2026-09-20

Chats now have a first-class durable lifecycle instead of being only a view over
run rows. The searchable full-page history separates active and archived chats and
supports inline rename, archive, restore and an explicit permanent-delete
confirmation. Titles, archive state, timestamps and turn counts live in the runtime
SQLite profile and survive a full Aux restart. Archived chats leave Home and the
normal run feed while their complete turn history remains available for restore.
Continuing an archived chat is rejected until it is restored.

Deletion is conversation scoped and transactional. Aux removes the chat's turns,
steps, results, model-call records, events, spans, response metadata, datasets,
operation/action history, checkpoints, context preference and artifact rows, then
removes artifact files only when their resolved paths remain inside Aux's artifact
directory. It leaves browser tabs, page state, browsing history and other chats
untouched. Active work, saved-task conversations and unresolved actions or
operations cannot be deleted, preserving their recovery paths.

The isolated native journey renames a two-turn chat, archives it, fully restarts
Aux, restores it, confirms permanent deletion and verifies the linked browser tab
survives. The archived state was inspected in
`release/test-artifacts/aux-conversation-lifecycle-archived.png`. Database upgrade
8 backfills metadata for legacy chats and preserves the standard private recovery
snapshot. No provider request, credential store, personal browsing data, app bundle
or external release was used. Live provider streaming and a real agent session
remain the next account-dependent Phase 2 boundary; workspace memory and richer
cross-workspace context remain independent follow-on work.

## Phase 2 inspectable conversation context — integrated, 2026-09-20

The full-page conversation composer now shows one quiet Context control that opens
the exact recent turns Aux may use for the next reply. Individual turns can be
excluded and restored. **Use previous turns** clears or restores inherited memory
without deleting visible conversation history. Browser-tab context remains a
separate selector, so choosing a page never silently re-enables conversation memory.
These choices live in the runtime SQLite profile and survive a complete Aux restart.

Context assembly moved out of the renderer and into the runtime. Each new run stores
the exact source run IDs beside its bounded prompt context. Failed turns contribute
their safe status summary instead of raw error text. A retry preserves the original
context snapshot instead of adding later history. The isolated native journey
excludes one turn, clears and restores all inherited context, restarts Aux, verifies
the exclusion, and starts the next run with only the selected provenance. The
rendered state was inspected in
`release/test-artifacts/aux-conversation-context.png`. No provider request,
credential store, personal browsing data or app bundle was used. Workspace memory,
local-document context and task-level inspection remain broader Phase 2 work.

## Phase 2 resilient provider sessions — integrated, 2026-09-20

Conversation turns now persist a small, provider-neutral failure record for model
authentication, quota, rate-limit, network, timeout, provider, capability and
malformed-output failures. Provider response bodies are replaced at the runtime
boundary with stable user-facing summaries before model-call or run history is
written. Auth, quota, capability and configuration failures route directly to the
existing Models settings page. Transient failures offer one deliberate retry that
uses the existing guarded same-thread retry path. The coordinator no longer
amplifies auth, capacity, network or provider failures through internal plan repair;
bounded automatic repair remains reserved for malformed structured output.

Cancellation and run deadlines continue to abort the in-flight model signal. A
versioned database migration adds the failure record without discarding existing
runs and retains the pre-migration recovery snapshot policy. The native isolated-
profile journey renders the retryable state in
`release/test-artifacts/aux-conversation-provider-recovery.png`, verifies no raw
provider body appears, and routes an authentication failure to the actual Models
page in `release/test-artifacts/aux-conversation-provider-settings.png`. It uses a
synthetic page and seeded safe metadata, with no provider request, credential store
or app bundle. Live provider streaming and real account qualification remain the
account-dependent Phase 2 gates.

Broader validation exposed a stale local native-engine addon that predates the
authenticated browser-service token API. In developer mode Aux now closes that
listener and uses its existing in-process engine instead of attaching without a
bearer or disabling the engine. Production continues to require its isolated host
and fails closed. The native engine and live MCP journey pass with this compatibility
path; the optional Chromium fallback subcase remains skipped when no standalone
Chromium binary is installed.

## Phase 2 model-connection health continuity — integrated, 2026-09-20

An explicit provider connection test now leaves a small, nonsecret health record:
provider, exact model ID, success/failure, test time, latency and vision capability
when known. Settings restores that result after closing or restarting Aux, placing it
on its own readable line beneath the selected model. Changing the provider, key or
model immediately removes the stale result. Provider error text remains transient
and is never written into the health record, avoiding persistence of a response that
might echo request details.

The native isolated-profile journey restores a saved failed result, renders the full
model ID and timestamp in `release/test-artifacts/aux-model-health.png`, changes the
model, and verifies the prior result disappears from both UI and runtime settings.
Provider client checks still verify fixed provider destinations and single-attempt
authentication failure. No provider request, key, OS credential store or app bundle
was used for the native journey. A real connection test remains an account-dependent
Phase 2 acceptance gate.

## Phase 2 interrupted conversation-turn recovery — integrated, 2026-09-20

A failed, cancelled or runtime-interrupted conversational turn can now be retried
from the full-page conversation without losing its thread or browser scope. Retry
creates a new auditable run linked to the original turn rather than mutating history.
Only the latest turn offers the action. The runtime rejects an older retry after a
newer turn exists, rejects concurrent work, and retains the existing unresolved-
action guard so an uncertain consequential effect cannot be repeated. Runs tied to
a saved task continue through that task's exact revision instead of bypassing its
scope from the conversation.

The real desktop journey opens a synthetic browser context, fully exits Aux, seeds
the same state a mid-turn process loss leaves behind, relaunches, opens the saved
conversation, and retries it once. The second turn retains the conversation ID,
original prompt and restored page ID. Rendered states were inspected in
`release/test-artifacts/aux-conversation-interrupted.png` and
`release/test-artifacts/aux-conversation-retried.png`; the earlier turn no longer
shows a stale retry control. Runtime restart integration and service/store checks
cover retry lineage and duplicate rejection. No model key or credential store was
used. This closes deliberate recovery after an interrupted turn; live provider
streaming, provider cancellation/reconnect behavior and real account qualification
remain Phase 2 gates.

## Phase 3 reviewed project-session resume — integrated, 2026-09-20

An interrupted task-bound local service can now be resumed deliberately after Aux
restarts. Aux continues to mark every formerly running process interrupted and never
executes repository code automatically. For a service attached to the currently
open task and exact saved revision, the command record offers **Review and restart
service**. Restart goes through the existing native command sheet, rechecks the task
revision and project attachment after approval, creates a new auditable command
record, and keeps the interrupted record intact. Services from another or earlier
task revision show recovery guidance instead of a launch control.

The complete native managed-project journey now starts a service after a reviewed
local commit, fully exits Aux, verifies the prior record becomes interrupted,
reviews and restarts the exact service, reopens a healthy browser preview, stops the
new process, and continues through file recovery and stale-revision rejection. The
resumed and prior records were inspected together at
`release/test-artifacts/aux-project-resume.png`. This closes manual local-service
resume for the supported project workflow while preserving the no-silent-execution
rule. Multi-process dependency ordering and automatic health/restart policies remain
open and will not be inferred from this manual recovery path.

## Phase 3 package-aware workspace readiness — integrated, 2026-09-20

Managed JavaScript/TypeScript checkouts now recognize common root workspace layouts
from bounded `package.json` workspaces and `pnpm-workspace.yaml` package patterns.
The project surface identifies the workspace alongside its package manager,
lockfile, dependency state and root commands. It now also discovers up to 50 regular
package manifests declared by those patterns, shows their names, paths and scripts
behind one quiet expandable row, and prepares bounded package-level commands for
npm, pnpm, Yarn and Bun. Aux compares the checkout with its saved Git baseline,
maps changed paths to packages, and follows internal package dependencies so a
changed library also marks its dependent applications. Each affected package shows
the reason it was selected. One action loads a bounded combined check command for
the affected set without running it; the user can inspect the exact command before
the existing native approval. Root manifest, workspace, lockfile and TypeScript
configuration changes conservatively affect the whole workspace. Real paths must
remain inside the managed checkout, so parent patterns and workspace symlinks cannot
expose outside manifests. Inspection
does not execute repository code. Every root or package command still requires the
existing native review before execution.

The complete native project journey now uses a workspace fixture, changes a file
after the saved baseline, displays the affected package and reason, loads and runs
the reviewed affected check, prepares Python and JavaScript environments, operates
multiple services, follows the linked preview, edits and recovers files, restarts
Aux, and preserves the original checkout. The rendered workspace state was inspected
in `release/test-artifacts/aux-project-workspace.png`.
This qualifies declared workspace discovery, internal dependency propagation and
reviewed affected checks for the supported npm/pnpm project path. Very large or
cyclic workspace qualification, non-JavaScript build graphs, and richer impact
rules remain open.

## Phase 2 scope-aware external-agent catalog — integrated, 2026-09-20

New Codex and Claude Code connections now advertise only tools usable within their
saved authority. Task connections omit page/workspace creation, unscoped run starts,
global events, Chrome attachment, sets and other general-runtime operations. A
workspace connection additionally exposes task creation inside that workspace.
Both retain the authorized page, run, evidence and managed-development tools. The
runtime still rechecks the bearer, scope, task revision, page/resource attachment
and project identity on every dispatch; catalog filtering is usability and least
surprise, not the security boundary.

The real desktop → restart → MCP stdio journey verifies both task and workspace
catalogs, performs the existing authorized browser, evidence, file, command, review
and local-commit workflow, rejects unrelated resources and stale revision, then
proves UI revocation stops the already-running client. Legacy broad `vector_*`
configuration behavior is unchanged, while obsolete Aux configurations without a
scoped bearer still fail closed. The scoped catalog UX gap is closed. Actual
Codex/Claude account qualification, long-running reconnect/cancel behavior and a
live provider-backed task remain dependent on a user-configured connection.

## Phase 1 durable closed-tab recovery — integrated, 2026-09-20

Recently closed tabs now survive a full Aux restart in the regular profile. Reopen
Closed Tab restores the latest entry into its prior space, surviving folder and
global sidebar position, then selects the newly created browser document. If the
space or folder was removed, the existing safe fallback remains: use the current
space and do not recreate deleted organization. Recovery retains at most 20 valid
entries for 30 days, discards malformed or stale saved data, and never records blank
new tabs.

Private browsing explicitly skips this recovery store. The real desktop journey
closes and restores a foldered tab, closes another tab, fully exits and relaunches
Aux, then restores the second tab with its original organization while the tabs
that stayed open retain their stable IDs and receive fresh document epochs. The
private process journey closes a synthetic tab and proves no recently-closed key is
written. The restored populated sidebar was inspected at
`release/test-artifacts/aux-tab-recovery-after-restart.png`; the original
spaces/folders hierarchy and neutral shell remain intact. Desktop type/build and the
applicable repository regression suite pass. Reopening restores the URL and
organization, not unsaved form state or the prior navigation stack.

## Phase 2 conversation composer continuity — integrated, 2026-09-20

New conversations now have the same durable draft behavior as saved-chat replies.
Home’s explicit Ask mode, the full-page composer and alongside-page agent panel share
one new-chat draft. Ask mode, the text and selected browser-context identifier survive
renderer and app restart. Saved chats retain independent drafts and context choices.
Starting a run clears only the submitted draft after success; setup errors and start
failures retain it. Opening New chat resets the side panel to its neutral composer
instead of showing an unrelated prior run.

Only the opaque page identifier is persisted, never page text, URL or a preview. If
that page closes or cannot be restored, the composer falls back to New browser tab
without deleting the prompt. The real redesigned desktop journey switches between
saved conversations, full-page and panel composers, reloads the renderer, restores
the new prompt and context, then closes the context and verifies the safe fallback.
The resulting states were inspected at
`release/test-artifacts/aux-new-chat-continuity.png` and
`release/test-artifacts/aux-home-ask-continuity.png`; the home and composer remain
restrained, readable and aligned with the accepted shell. This closes the
credential-independent draft/context continuity gap. Live provider streaming and
reconnect qualification still require a user-configured connection.

## Phase 3 reviewed local commit checkpoint — integrated, 2026-09-20

Aux can now turn a ready delivery handoff into one local commit in its isolated
checkout. The UI and task-scoped agent route bind the request to the task revision,
attached project, SHA-256 patch identity and exact staged Git tree. The human enters
the commit message, author name and email explicitly; Aux does not inspect global Git
identity, password managers, signing keys or credential stores.

Before and after the native confirmation sheet, Aux regenerates and compares the
reviewed snapshot, rejects task/attachment drift, and requires commands and services
to be stopped. The commit uses a private temporary index, disables repository hooks,
signing, credential helpers and network protocols, atomically advances only the saved
managed branch, and retains a protected copy of the previous index. No push, publish,
remote authentication or pull-request creation occurs. A matching tree cannot be
committed twice as an empty checkpoint.

The desktop journey committed tracked, empty, binary and new files after its real
checks and preview, proved the source checkout stayed on its original commit, then
restarted and continued editing/recovery. The scoped MCP journey created the same
kind of approved checkpoint and remained fenced to its authorized task. Unit coverage
also proves explicit author identity, hook/signing bypass, index recovery and rejection
when files change after review. The reviewed form and completion state were inspected
in `release/test-artifacts/aux-prepared-change-review.png` and
`release/test-artifacts/aux-local-commit.png`. Local commit identity is no longer a
Phase 3 gap. GitHub account/scopes/checks and any authorized remote PR write remain
open. No credential store, personal repository, app bundle, push, publish or remote
write was used.

## Phase 3 integrity-checked delivery handoff — integrated, 2026-09-20

Aux now regenerates a task-bound delivery handoff from a fresh checkout inspection.
It creates a reviewer summary, deterministic pull-request draft, binary-capable Git
patch and JSON manifest beside protected project metadata. The patch includes tracked
changes since the saved baseline and regular untracked files, is bounded to 2 MB and
is omitted with an explicit reason if it cannot be complete. The manifest records
the project, branch, baseline, task revision, readiness decision and SHA-256/byte
length for every artifact.

Readiness is conservative: fresh changes, a complete patch and a successful latest
bounded check are required; active processes, environment inspection errors or a
failed recorded preview become visible attention items. The task page opens the
summary and PR draft, exports the exact patch through a native save dialog and
reveals the handoff files. Copy states plainly that no commit, push or pull request
was created. Preparing through the UI revalidates the attached task revision; the
scoped-agent route applies its existing task/revision/project authority check.

The native journey includes tracked text, new text, empty and binary files, exports
the patch, clones a clean checkout and successfully applies that patch with content
and bytes intact. It also verifies restart persistence and the existing stale-task
approval boundary. The rendered handoff was inspected at
`release/test-artifacts/aux-prepared-change-review.png`; readiness, artifact actions,
hashes and evidence remain readable. Focused schema/artifact checks, desktop build,
the scoped-MCP journey and the full local-project journey pass. A portable local
review package and PR draft are no longer a Phase 3 gap. Local commit identity,
GitHub account/scopes/checks and any authorized remote PR write remain open. No
credential store, app bundle, commit, push, publish or remote write was used.

## Phase 3 project environment readiness — integrated, 2026-09-20

Managed checkouts now expose a shared environment inspection to the human workflow
and task-scoped external agents. Aux reads only fixed root markers, bounds
`package.json` to a regular 256 KB file and does not execute repository code while
inspecting. It detects npm/pnpm/yarn/bun lockfiles and scripts, Python requirements,
pyproject/Pipfile/Poetry/uv markers, project-local `.venv` state and the availability
and version of the required local tools.

Commands & preview presents the result as one compact readiness surface. Setup,
check and dev-script choices load an exact, shell-quoted command and select service
mode only for long-running scripts. Nothing starts until the existing native dialog
shows the command, checkout, task and revision. The same separate HOME, no inherited
model credentials, concurrency limits, saved output and stale-revision recheck apply.
Readiness refreshes after a command finishes, and prepared change reviews include a
dated environment summary.

The isolated desktop journey prepares a real `.venv`, runs a real npm check, verifies
both saved task-bound records, continues through multiple services, preview
diagnostics, live editing, restart and recovery, and proves the original checkout is
unchanged. The real scoped-MCP journey reads the same npm/script/tool facts before
performing its approved changes. The rendered environment was inspected at
`release/test-artifacts/aux-project-environment.png`; hierarchy, statuses and command
choices remain legible without turning the task page into an IDE dashboard. Focused
inspection and schema checks, desktop build and both native journeys pass. Baseline
JavaScript/TypeScript and Python readiness is no longer a Phase 3 gap. Monorepos,
additional framework/toolchain qualification, process health/restart policy, real
provider planning and authorized GitHub/Vercel/Sentry delivery remain open. No
credentials, personal repository, app bundle, publish or remote write was used.

## Phase 3 linked preview diagnostics — integrated, 2026-09-20

The managed-project workflow now links a checked localhost preview to the actual
Aux tab it opens. Rechecking the same URL reloads and activates that tab instead of
creating duplicates, so switching a service or rebuilding cannot leave the user on
an old document. The project panel retains the tab relationship through ordinary UI
navigation and renderer restart, then resolves the recovered tab by its stable ID.

Commands & preview now shows a bounded, two-column view of the linked page's recent
console messages and HTTP responses, including level, method, status, URL, timestamp
or duration. It refreshes after a completed navigation and on demand. If the tab is
closed or navigates away from the checked URL, Aux stops presenting its evidence as
the project preview and gives the exact recovery action. The local readiness probe
remains separate and cookie-free; diagnostics describe the linked browser page and
do not claim that a process owns the port.

The native desktop journey launches a real Vite service, opens its browser tab,
captures a deliberate console warning and the module response, checks the navigated
and closed-tab states, reopens the preview, edits through Aux and observes live
reload. The rendered result was inspected at
`release/test-artifacts/aux-preview-diagnostics.png`; its hierarchy, truncation and
compact scrolling remain readable inside the task page. Typed response contracts,
capture checks, desktop build and the complete local-project journey pass. This
closes the integrated console/network diagnosis gap. Monorepo and additional
framework qualification, process-health policy, real provider planning and
authorized GitHub/Vercel/Sentry delivery remain open. No credentials, personal
browser content, bundle, publish or remote write was used.

## Phase 3 coordinated local services — integrated, 2026-09-20

A managed checkout can now keep up to four independently recorded local services
running while one bounded build/check command executes alongside them. Duplicate
service launches, a fifth service and overlapping one-shot checks are rejected with
clear recovery text. Every process retains its own task/revision binding, exact
command, output, state and stop control. Stopping one service leaves the others
running; quitting or restarting Aux marks every unfinished record interrupted and
does not restart anything silently.

The Files workflow still permits live-reload edits while services run. Ordinary
commands block conflicting saves only for their bounded lifetime, and the existing
separate HOME, no supplied model credentials, native command review, process-group
cleanup and saved-output limits remain in force. Scoped external agents receive the
same limits and can list or stop only commands in a checkout attached to their
authorized current task revision.

The native desktop journey runs a Vite frontend and a separate Node service together,
executes a check while both remain live, edits the frontend through Aux, verifies the
browser preview updates, stops each service independently and confirms all records
after restart. The real scoped-MCP journey also starts two approved services, runs a
check beside them, stops one without affecting the other and includes the evidence
in its review handoff. The rendered service view was inspected at
`release/test-artifacts/aux-local-service.png`; distinct logs and controls remain
readable in the neutral shell. Multi-service coordination is no longer a Phase 3
gap. Additional environment breadth, process health/restart policy, real provider planning
and connected delivery remain open. No
credentials, bundle, publish or remote write was used.

## Phase 3 task-scoped agent development — integrated, 2026-09-20

A scoped Codex or Claude Code MCP connection can now carry its authorized saved
task into an attached managed checkout. The client can list only repository
resources on that task, inspect the baseline diff, enumerate bounded Git-visible
files, read one UTF-8 file with its SHA-256, propose a conflict-safe replacement or
exclusive new file, inspect saved commands, request an exact command/service, stop
it, and prepare the durable local review handoff. Every call rechecks connection
scope, task identity, task revision and repository attachment before desktop
dispatch.

File creation and replacement pause at a native Aux dialog showing the saved task,
revision, checkout path, byte size and a bounded content preview. Command execution
shows the exact command, working directory and unsandboxed/network disclosure.
After approval Aux revalidates the task revision and attachment, coordinates with
active project commands, and uses the existing no-overwrite, expected-hash, atomic
save and recovery paths. The client never receives arbitrary filesystem authority,
model credentials, commit/push access or a remote-write shortcut.

The real isolated desktop → scoped bearer → MCP stdio → runtime → desktop journey
now covers attached-project filtering, bounded read, approved replacement/create,
task-bound command output, a command-backed review summary, unrelated-project
rejection, stale-revision rejection, original-checkout preservation and immediate
revocation of the same running MCP process. Contract and handler checks exercise the
same dispatch boundary. This materially advances Phase 3, but a real configured
Codex/Claude session, agent planning over these tools, dependency/framework breadth,
multi-service work and GitHub/Vercel/Sentry delivery
remain open. No personal repository, credential store, bundle, publish, commit,
push or remote service was used.

## Phase 3 local change lifecycle and review handoff — integrated, 2026-09-20

Aux now carries a managed checkout from editing through a durable local review
handoff. A selected UTF-8 file can open in its macOS default app without exposing a
general filesystem picker. The task-scoped return path above detects outside changes
and its existing hash/inode checks reject stale writes. Files can be moved
within the checkout without replacing existing or ignored paths. Deletion requires a
native confirmation. Both rename and delete verify the exact disk version and retain
a recovery snapshot outside the working tree; the original source checkout remains
unchanged.

Checkout status can prepare a timestamped Markdown handoff from a fresh baseline
diff, untracked file names, the ten most recent task-bound command records and the
last local preview check. The summary is stored beside Aux's protected project
metadata, survives restart, and never appears as a Git change. Its copy explicitly
states that it does not commit, push or create a pull request. The rendered handoff
was inspected at `release/test-artifacts/aux-prepared-change-review.png` and the
action geometry was tightened after inspection.

The native isolated journey exercises task-scoped default-app handoff and conflict
resolution, rename, confirmed delete,
recovery retention, summary generation, command/diff inclusion and restart while
proving the dirty original checkout is untouched. Focused file/project checks cover
conflicts, no-overwrite behavior, link rejection and durable output. This completes
the human-controlled change lifecycle portion of Phase 3. Agent-scoped development
tools, dependency setup breadth, multi-service projects,
real provider qualification and authorized GitHub/Vercel/Sentry connections remain
open. No credential store, personal repository, bundle, publish or remote write was
used.

## Phase 1 managed unpacked extensions — integrated, 2026-09-20

Settings now provides an honest unpacked-extension manager for the regular Aux
profile. A user explicitly chooses a folder and sees its name, version and declared
manifest access before installation. Aux validates a bounded regular-file tree,
rejects symbolic links, copies it into private managed storage, loads it without
file-URL access, and supports durable disable, re-enable and removal. Launch-configured
developer extensions remain visible but are not presented as Aux-managed copies.

The native isolated journey verifies a real MV3 content script in an Aux browser
tab, full restart while enabled, immediate disable, restart while disabled, re-enable,
absence from a separate private-browsing process, removal and absence after another
restart. The rendered Settings row was inspected for hierarchy, state, permissions
and action alignment. Focused manager checks cover atomic copying/state and symlink
rejection. Existing data is preserved; removal deletes the managed copy but the UI
correctly notes that Chromium profile storage may remain until site data is cleared.

This improves the first hands-on build without claiming Chrome parity. Chrome Web
Store installation, automatic updates, native messaging, 1Password desktop identity
and broad third-party compatibility remain open architecture/real-account gates.
No credential store, personal extension, personal profile, app bundle, publishing
or external service was used.

## Phase 2 scoped external-agent authority — integrated, 2026-09-20

Aux can now create a revocable Codex or Claude Code MCP connection for one saved
task or workspace. Settings generates the client configuration, shows the raw token
once, records only its SHA-256 digest, displays persisted last-use/revocation state,
and revokes an already-running client immediately. Version 6 adds the durable
connection records through the protected database migration path. Older Aux-branded
configs that omit a scoped token fail closed instead of inheriting the broad runtime
descriptor.

The runtime enforces scope on every request. Task/workspace/page/run lists are
filtered; task calls must belong to the selected scope; page calls require a page
attached to the task or one of its current-revision runs. A connection cannot open
a new page or workspace, access unrelated work, manage connections, use the global
event stream, accept evidence, reconcile actions, or expand its authority. External
evidence retains `external_client` provenance and stays in Needs review.

The native isolated journey creates two disjoint workspaces, tasks and real browser
tabs through the desktop, creates a task connection, restarts Aux, launches the
generated real MCP stdio command, and proves only the authorized records and page
are visible. The allowed page is observed, unrelated and authority-expanding calls
are rejected, evidence is recorded with reviewable provenance, and UI revocation
cuts off the same live MCP process. Rendered Settings screenshots were inspected;
the connection hierarchy and active/revoked states are legible and aligned.

This is an independently deliverable Phase 2 security/integration batch while
Phase 1 waits on founder account compatibility, hands-on review and bundle-dependent
OS integration. It does not complete Phase 2: a real user-configured Codex/Claude
session still must qualify setup health, streaming, cancellation, reconnect and
follow-up continuity. The shared MCP catalog can also present general tools that a
scope will correctly deny; catalog filtering is a remaining UX refinement. No
credentials, personal profile, app bundle, publishing or external service were used.

## Phase 1 multiple regular windows — integrated, 2026-09-20

Acceptance for this coordinated batch is two regular Aux windows with independent
selected tabs and space/folder layouts, one shared signed-in Chromium profile and
runtime, correct page/dialog/event routing, coordinated unsaved-work protection,
and restart recovery without duplicate or lost tabs. A duplicate shell over the
single global stage is explicitly insufficient.

Regular-window ownership is now end to end. Page targets, native snapshots, popup
descendants and restart-tab records carry a window ID. Database schema 5 adds
`tabs.window_id` with `main` as the compatibility default; protected upgrades keep
existing tabs. Each window owns its native stage, selected and split tabs, shell
events, shortcuts, dialogs, page controls and close decision. Cross-window page
commands are rejected. Global downloads and runtime status remain deliberately
shared. The signed-in Chromium profile and runtime are shared without merging each
window's tabs or sidebar layout.

`tests/smoke/multi-window-desktop.mjs` drives two real Aux windows in an isolated
profile. It verifies disjoint tab lists and selection, distinct persisted space
layouts, shared cookies and site storage, sender/owner enforcement, cancellation of
a dirty secondary-window close, and full-process restart. Both windows return with
the same window and tab IDs, selected tab and layout, without duplicates. Existing
authentication navigation, single-window tab recovery, regular close/Quit unload
coordination and external-link journeys pass after the refactor. Type checking,
database migration and renderer tab-layout checks pass. The one full-suite browser-
service timeout passed immediately in isolation with a 2.2-second run and is treated
as resource contention, not ignored product evidence.

This completes the multiple-regular-window experience inside Phase 1; it does not
complete Phase 1 or the roadmap. Browser-platform compatibility, remaining
daily-use qualification and founder review stay open. No app bundle, credential
access, personal profile inspection, publishing or release was involved.

## Phase 1 authentication-navigation continuity — 2026-09-19

Human background tabs now use a separate native adoption path instead of Electron's
synchronous background-window hook, which could deadlock a real middle-click. They
retain the request referrer, appear in Aux's original space/folder tab model, remain
unselected, and no longer get mistaken for hidden runtime worker pages. Foreground
tabs and sign-in windows keep Chromium's opener, blank-window and form-navigation
behavior. Closing a launched foreground tab returns to its opener rather than an
unrelated newer background tab.

An isolated two-origin journey now covers middle-click selection, same- and
cross-origin referrers, opener continuity, an IdP redirect that sets and reads a
SameSite cookie, state round-trip to the relying-party callback, shared callback
cookies, opener messaging and popup cleanup. Existing blank-window/form-POST/nested
popup, restart recovery and external-link journeys also pass. This establishes the
browser plumbing needed by sign-in flows; it does not qualify a real identity
provider, passkey device, 1Password or Apple Passwords. No account, credential store,
personal profile, app bundle or external service was used.

## Phase 1 accessible shell integration — 2026-09-19

The accepted neutral Aux shell now has one consistent keyboard and accessibility
path across home, spaces, folders, both tab layouts, conversations and settings.
The Search/Ask field exposes a real combobox relationship and announces its current
mode; recent cards have concise names instead of reading their entire preview;
conversation titles, timestamps, reply controls and captured images have useful
document semantics. Settings categories support arrow/Home/End traversal, theme and
engine choices behave as native radio groups, and every settings input now has a
programmatic name. Focus remains a fine neutral line without reintroducing blue.

Reduced Motion now suppresses continuous spinners, sweeps, transitions and folder
animation through the shared design-token layer. Increased Contrast strengthens
secondary text and dividers, and Reduced Transparency retains the existing solid
sidebar fallback. Theme, typography, shell geometry, focus and link values now live
in the canonical token sheet rather than later component overrides, so the rendered
appearance and its design contract no longer disagree.

The integrated native journey covers Search/Ask switching; spaces, menus and modal
focus restoration; collapsed folders; complete sidebar collapse/reveal; vertical
and horizontal tab navigation; settings-category and radio movement; and a simulated
Reduced Motion preference. The full home/conversation/settings journey and broader
source checks also pass. Inspected `aux-keyboard-settings-focus.png` after rendering:
the selected appearance row, radio state, select focus, sidebar alignment and rounded
main surface remain coherent. These checks establish the implemented semantics and
keyboard flow, but do not claim a completed manual VoiceOver audit on real websites.
No app bundle, personal profile inspection, credential access or external release
was involved. Phase 1 remains active because browser compatibility and remaining
daily-use gaps are still open.

## Phase 1 private-browsing integration — 2026-09-19

New Private Window now launches from Aux's File menu as a separate process using the
real shell, original spaces/folders/tab model and fully collapsible sidebar. It has
nonpersistent shell/page sessions and in-memory tabs, history, permissions, bookmarks
and download state. It does not start the agent runtime, expose a production CDP
endpoint, load extensions or write regular browsing databases. Agent/project/settings
controls are hidden; the home explains that explicitly saved downloads remain files.

The native journey verifies the regular-menu launch path, complete collapse/restore,
tab switching, a retained live draft, native nonpersistent session identity, and
fresh cookies/localStorage/tabs/history after restart. A real `beforeunload` form
confirms Stay preserves every private tab and draft and Leave closes cleanly. A direct
non-Playwright process proves no remote-debugging switch or DevToolsActivePort and
scratch-profile removal. Regular popup/sign-in and whole-window unsaved-work journeys
still pass. Inspected `aux-private-home.png` and `aux-private.png`; the latter cannot
include native WebContentsView pixels in a shell-only screenshot, so the page content
is asserted through its native renderer.

Whole-app Quit now coordinates the regular process and every private child through a
two-phase prepare/validate/commit protocol. Each process performs Chromium's real
`beforeunload` traversal without destroying a page, then freezes the approved document
set until the other windows agree. If a later window chooses Stay or changes during
the preflight, earlier approvals are aborted, hidden windows return, and every draft
and private scratch profile remains intact. Unanimous Leave closes all processes and
removes every private scratch profile. The integrated journey covers two dirty private
windows with a later veto, a second successful Quit, and the ordinary regular-window
exit path. General support for multiple regular Aux windows remains separate work. No
app bundle, real account, credentials, publishing or release was involved.

The updated source app was then launched with `AUX_LOAD_DOTENV=0 pnpm dev` for the
next hands-on review. The rebuilt renderer, desktop process and runtime reached their
ready states and remain running on the normal development ports. This was not a
fixture/profile migration test: existing page URLs and contents were deliberately
not enumerated, and no credential store was searched. No bundle was created.

After coordinated Quit was integrated, the source app was rebuilt and restarted so
the running hands-on build includes that behavior. The renderer is listening on 5197
and the runtime reported ready. This restart did not enumerate the existing profile's
page URLs or contents.

## Phase 1 runtime and wake recovery — 2026-09-19

The desktop shell now supervises its execution runtime independently from the native
browser views. An unexpected runtime exit immediately pauses agent-backed features,
shows a compact neutral reconnecting status, and starts a replacement with bounded
backoff. The replacement enumerates and reattaches to the live native targets instead
of recreating them. Page IDs and selection remain stable, while document/controller
epochs advance so stale automation references cannot cross the runtime boundary.

`tests/smoke/runtime-recovery-desktop.mjs` force-kills the isolated runtime beneath a
real Electron shell while a native page contains an unsaved form. It verifies the
visible disconnect state, automatic reconnection, unchanged tab identity and active
selection, no duplicate surfaces, continued API use, and retention of the same live
renderer and draft. It then emits a synthetic macOS resume event and verifies the
wake health check leaves the workspace unchanged. The inspected recovery surface is
`release/test-artifacts/aux-runtime-reconnecting.png`; it is a small floating neutral
pill rather than a full-width colored bar. Related page-crash, private-window,
whole-window unload, runtime persistence and routing journeys still pass. No real
profile, credential store, bundle or external service was used.

## Phase 1 interrupted-browsing integration — 2026-09-19

Offline navigation now explains the interruption and offers the existing retry/back
controls. DNS and certificate errors have specific guidance; timeout guidance is
implemented but not separately qualified. Certificate errors still have no bypass.
The native error remains visible for diagnosis.

Verified the integrated offline-to-online journey with Chromium per-tab network
emulation: the actual failed navigation reports ERR_INTERNET_DISCONNECTED, tab IDs
remain stable, an independent live draft survives switching tabs, and Try again
loads the destination into the same selected tab after network restoration. A real
failed lookup then reports ERR_NAME_NOT_RESOLVED, and a local self-signed HTTPS
fixture reports ERR_CERT_AUTHORITY_INVALID without loading the document. The
initial Electron session-emulation attempt did not block fixture traffic; it was
replaced with CDP network emulation, not counted as passing evidence. All traffic
uses a synthetic hostname mapped to a local fixture in an isolated profile.
Inspected `release/test-artifacts/aux-offline.png` at 1260×900 logical size; neutral
recovery surface and original sidebar remain coherent. Desktop build, renderer
TypeScript and the existing crash/page-recovery journey passed. This is work within
Phase 1, not a phase exit.

## Phase 1 local-document browsing integration — 2026-09-19

Corrected Open File so native paths containing `#`, `?`, spaces, percent signs or
Unicode become one exact file URL instead of being split into URL query/fragment
syntax. The menu shortcut and command palette now share the same conversion. This
preserves the current tab when one is selected and opens a new tab from the empty
home state.

An isolated native journey verifies that canceling the file picker changes nothing,
a synthetic special-character HTML filename replaces the selected tab and renders,
and the same local-document tab identity and URL restore after a clean restart.
Unsaved form contents are intentionally not claimed as restart-persistent. The
desktop build, renderer TypeScript check and focused path-conversion checks pass.
Inspected `release/test-artifacts/aux-open-file.png`; the shell shows the local
document selected within the original sidebar. Electron shell-only screenshots do
not contain native WebContentsView pixels, so document rendering was separately
asserted in its actual native page. No personal file was selected or read.

This closes part of Phase 1's local-file journey. File-type breadth, OS default-
browser registration and deep links remain separate acceptance items; no bundle was
created and the delivery phase remains active.

## Phase 1 external-link continuity — 2026-09-19

Aux now queues web URLs received during startup until both the shell and runtime are
ready, rather than dropping them. A later invocation hands its HTTP(S) URL to the
existing Aux process, focuses that window and opens a selected tab. The macOS
`open-url` event follows the same route. Page-originated new-tab requests also use
this bounded queue, removing an earlier startup race. Non-web external schemes are
rejected instead of being passed to a local OS handler.

The native journey launches Aux with a local URL, then starts a real second Electron
process against the same isolated profile and verifies that it exits after handing
off another URL. A simulated macOS application event verifies the platform callback.
All three links become separate selected Aux tabs and an unsaved draft in the first
tab remains intact. A `file:` open-URL request creates no tab. This is source-level
deep-link handling; Aux has not been registered as the system default browser and
that OS integration remains unqualified until app-bundle work is authorized.

## Phase 1 daily-reading integration — 2026-09-19

Delivered Reader View in the existing shell while the CEF test-bundle question is
pending. View → Reader View / Command-Option-R opens a clean article surface;
Back to page returns to the original live document. Added Mozilla Readability 0.6.0
for article extraction from a clone in an isolated world. The bridge returns an
allowlisted inert tree, never website HTML, scripts, event handlers, styles or form
controls. HTTP(S) links open through the existing new-tab flow. Article text is
transient; only reading font size persists in shell localStorage. No model request
or agent observation is generated. This first reading experience displays formatted
text and links, not embedded images or media.

Native validation confirms extraction, removal of navigation clutter/unsafe links,
retained original draft and scroll, useful error on non-article pages, text-size
retention and links opening into actual tabs. Desktop build and renderer TypeScript
check passed. Inspected `release/test-artifacts/aux-reader.png` at a 1260×900 logical
window: neutral surface, readable column, aligned compact controls, no extra colored
wash. Original sidebar geometry and state remain intact.

Authoritative review-process check: exec session 59313 returned terminal exit 0 and
no process was listening on dev port 5197. No assumption of liveness and no automatic
restart were made. Therefore renderer changes did not hot-reload that earlier user
review session. Launch the updated source app with `AUX_LOAD_DOTENV=0 pnpm dev` when
ready. No app bundle was created. Phase 1 and the full goal remain incomplete.

## Phase 1 browser-layer source candidate — 2026-09-19

Moved from isolated Electron fixes to the browser-layer dependency shared by the
remaining compatibility requirements. Current CEF explicitly permits a Chrome-style
Views window to contain one Chrome BrowserView plus Alloy views for trusted UI.
Prepared `experiments/cef-shell/layout-probe.cc` for that arrangement; compiled it
successfully against checksum-verified CEF 152.0.7 ARM64 SDK headers. The README pins
the SDK and lists the actual runtime/design acceptance gate. Only headers were
extracted; no .app, installation, signing, user-profile migration or release occurred.

This is source/API evidence only. It does not qualify a runtime replacement, Chrome
tab control, real extensions or the design. The single-Chrome-view limitation still
needs running evidence; do not repeat the earlier rejection of parent-view/Alloy
embedding as if it also rejected this supported mixed-Views arrangement.

A pending async question asks whether the user's earlier bundle deferral can permit
an isolated development-test .app. That approval is needed to run this macOS candidate,
not to publish or sign anything. Continue from the prepared source and pinned headers
if approved; keep the working Electron first-review path intact. Do not claim global
blockage: the overall goal remains active and no phase is complete.

## Phase 1 independent-window command integration — 2026-09-19

Implemented a focused user-facing correction while tracing reusable window ownership:
independent sign-in windows now own Close, Reload/hard reload, Back/Forward, zoom,
and Print commands. Menu dispatch previously always targeted the main shell. Native
popup keyboard dispatch and menu dispatch now share `popup-commands.ts`; Close Window
uses the focused window. Main-window tab behavior remains on the existing renderer
route. No additional settings or alternate shell UI were introduced.

Native integrated evidence: a synthetic popup reload leaves opener state unchanged;
Back/Forward traverse the popup history; zoom/reset target its contents; a native
Command-W input with Stay preserves a dirty popup and its opener; Close Window with
Leave destroys only the popup. Existing cookie/opener/POST/nested/fast-close sign-in
journeys pass, as does whole-main-window cancellation/approval. Desktop build passes.
Playwright page-level Meta-bracket input did not reliably exercise the native menu;
Back/Forward were verified through actual Electron menu dispatch and Close through
`webContents.sendInputEvent`, rather than claiming the former proved OS accelerators.

This does not implement arbitrary additional Aux shell windows or private browsing.
Those still require window/process ownership work and privacy isolation described in
the compatibility record. Unsupported popup-focused shell commands (for example the
main-shell Find overlay) remain a gap; do not claim full popup command parity. The
running founder process was not restarted and needs a later launch to use this fix.

## Phase 1 private-window dependency qualification — 2026-09-19

Traced current window ownership and persistence before implementing private browsing.
The main process has one shell/window and global stage/selection; runtime PageService
always writes page metadata and recovery, and observations are persisted separately.
An isolated native probe confirms an in-memory session separates synthetic cookies
but its page remains exposed by the shared CDP `/json/list` endpoint.

Evidence: `private-boundary-desktop.mjs` passes; generated
`aux-private-boundary.json` records version, cookie separation and debugging exposure.
The hidden synthetic candidate window was destroyed and its temporary profile removed.
No regular user window or credential store was touched. No private browsing feature
has been shipped or claimed; this prevents an inadequate cookie-only implementation.

The compatibility record specified a separate, non-agent debugging process for
private windows and coordinated cross-process exit. The later Phase 1 implementation
now satisfies that boundary with the actual Aux shell and a coordinated Quit protocol.
General multiple-regular-window delivery and final browser-layer selection remain open.

## Phase 1 screen-sharing compatibility evidence — 2026-09-19

Returned to the broader browser gaps after exit protection. Actual native requests
showed that Electron 43.6.0 exposes identical `media` / empty `mediaTypes` permission
metadata for modern screen sharing and legacy desktop capture. Version-pinned native
source confirms the legacy path does not use the display-source chooser. Enabling
empty media types would therefore undermine mandatory source selection. No such
change was made; the production denial now includes a maintenance comment explaining
this constraint. The actual macOS chooser has not been enabled or qualified.

Permanent isolated qualification: `screen-sharing-boundary-desktop.mjs` and generated
`aux-screen-sharing-boundary.json`. Both requests are denied; the fixture never grants
capture, enumerates screens, changes OS settings or reads clipboard/credentials.
This test proves the permission API limitation, not successful screen sharing.
The temporary investigation script was removed. Browser compatibility documentation
now includes this additional requirement for the final native/browser-layer choice.

Next: move to the remaining coherent private/multiple-window browser experience or
the browser-layer candidate investigation; avoid re-probing this known limitation
without a new runtime/version or changed native API. Existing review app untouched.

## Phase 1 exit protection follow-through — 2026-09-19

Revalidated the native exit adapter and completed two remaining checks that matter
to real document editing. A cross-origin iframe editor now has native qualification:
Stay retains its text and all peer tabs, and unanimous Leave exits. A real navigation
of a clean peer tab during a dirty-page approval invalidates the exit agreement and
keeps the other documents alive. The implementation now checks invalidation before
starting each native traversal as well as before committing exit.

Bounded isolated-world injection and cleanup to 15 seconds so a stalled renderer
cannot leave the exit coordinator permanently busy. An isolated test deliberately
holds that acknowledgement, waits past the timeout, then releases it. Exit remains
canceled, the document survives, and a later ordinary exit attempt still works.
This is deterministic stalled-acknowledgement coverage, not proof of every crashed
or hung renderer state. No user window was reloaded or closed.

Evidence: desktop source build; native `window-unsaved-work-desktop.mjs --frame
--quit --timeout` and `window-unsaved-work-desktop.mjs --navigate` pass. The earlier
ordinary tab and recovery checks remain applicable; they were not repeated without
a related failure. No renderer UI or appearance changes were made.

Next Phase 1 work should return to the larger remaining daily-browser gaps (screen
sharing/media, private and multiple windows, and browser-platform compatibility),
not promote additional unload controls to milestones. Real account/password-manager
and signed-provider acceptance remain unqualified, with no app bundle authorized.

## Phase 1 coordinated exit protection — 2026-09-19

Implemented native whole-window/quit preflight in `main/window-unload.ts` and the
main lifecycle. Chromium executes real beforeunload handlers; a harmless temporary
listener in an isolated world ensures clean documents traverse the same path.
Electron's internal `-before-unload-fired` event is vetoed after each decision so
no document is destroyed until every tab approves. Cancel retains earlier approved
and clean documents. New/removed tabs or navigation invalidate the exit agreement.
Recovery freezes only after acceptance, before native window teardown.

**Version dependency:** this relies on the inspected Electron 43.6.0 implementation,
not a public dry-run API. The exact-version guard refuses unqualified exit traversal
on upgrades. Requalify or replace the adapter before changing Electron; never remove
the guard merely to make Quit work. A timed-out traversal retains its one-shot veto
so a late native acknowledgement cannot unexpectedly destroy the document.

Desktop source build passed. Isolated native window-close and Quit journeys passed:
Stay preserves unsaved text, all tabs and selection; approving the first dirty page
and canceling the second preserves both documents and intervening clean tabs;
unanimous Leave exits. Individual tab-close/link/reload protection and full restart
recovery of IDs, spaces, folders, order and selection also passed. The clean-page
fixture includes a page without any website beforeunload handler. These establish
the ordinary native-tab path. The later follow-through entry adds cross-origin
frames and navigation invalidation; other hung/crashed-renderer states and
engine-backed tabs remain unqualified.

The user's running review process was not restarted and therefore does not acquire
this main-process fix until the next launch. No app bundle or external release was
created. Phase 1 remains active; compatibility/media, broader window behavior and
live founder review remain open. The previous failure record below is historical.

## Phase 1 whole-window data-loss qualification — 2026-09-19

The prior reply clarified existing compatibility priorities but made no implementation
progress. This cycle established new native evidence for the next session-safety fix.

`tests/smoke/window-unsaved-work-desktop.mjs` exercises a real dirty textarea with
sticky user activation and a second clean tab. It uses an isolated HOME/profile,
mock Keychain, no dotenv, and synthetic Stay responses. Both the default window-close
run and `--quit` run **fail**: the Electron application exits instead of preserving
the document. This is now a reproduced defect, not merely missing qualification.
The running founder review application was not operated on or restarted.

Keep this failing qualification gate. The production BaseWindow close hook currently
only notifies `app.closing`; it does not obtain child-page unload decisions. A fix
must preserve every live document, tab order and selection when any page cancels,
and freeze the recovery snapshot only after exit is accepted. Closing child tabs
sequentially is not sufficient: a later veto must not leave earlier tabs destroyed.
Do not replace the real native unload behavior with an unqualified synthetic event
and claim equivalent coverage. Whole-window close and app Quit must both pass before
this gap is closed. Individual-tab unload verification remains separate and passing.

The first-review guide now explicitly warns that both window close and Quit bypass
unsaved-work protection. No product fix has been claimed or made in this cycle.

## Current state

2026-09-19: The user provisionally accepted the corrected design (“for now it's fine”)
and asked to continue the wider goal. Use `pnpm dev`; packaging remains deferred.
The original sidebar organization, full collapse, neutral native vibrancy, supplied
Aux artwork, browser recovery, saved tasks and evidence/review workflows are verified
in isolated development-app checks. Full M0–M11 founder acceptance is not complete.

**Active delivery phase: Phase 1 — A browser the founder can use every day.**
No complete delivery phase has been qualified or accepted. Stop promoting individual
controls or fixes to milestones; older entries below are a historical work log.

Recent verified components include original sidebar organization and full collapse,
neutral native vibrancy, saved tasks/conversations/evidence, selected browser recovery,
bookmarks, find/PDF, download destination/retry, and tab audio controls. Local project
fixtures also cover isolated worktrees, commands/services, previews, file creation/
editing/recovery, untracked review and restart continuity. These are reusable inputs
for later phases, not evidence that an entire browser or agent workflow is complete.

Phase 1 remaining work is an integrated daily-browsing qualification and closure of
its essential gaps: coherent navigation/window/session behavior; complete file/site/
privacy interactions; keyboard/focus/accessibility; account/password-manager/
extension/media compatibility and the resulting shell decision; failure/recovery
and actual founder review. Establish current support from code and real journeys;
keep missing and unqualified behavior visible. Keyboard traversal and focus recovery are implemented for the principal tab/space
flows; full accessibility qualification remains a work item within this phase.

No live model/provider or real external-agent session has been qualified. Phase 2's
live gate needs a user-configured connection; independent Phase 1 work remains
available. No credential-store discovery, app bundle or external release is authorized.

The working tree initially contained three user-owned untracked historical
roadmap/screenshot entries; leave those untouched.

Inspected foundations: Electron/Chromium browser, Rust specialized engine,
TypeScript runtime, SQLite, program/run/operation contracts, per-page takeover,
MCP/CLI, local packager. These are not proof of the broader founder-build gates.

Pre-implementation focused baseline: 57 tests in verify-done, review-gates,
engine-routing, desktop-runtime-env, and prompt-injection passed during planning.

Phase 1 compatibility evidence now lives in `AUX-BROWSER-COMPATIBILITY.md`.
The isolated Electron 43.6.0 probe passes virtual WebAuthn registration/assertion,
cryptographic signature/challenge/origin/RP verification and wrong-RP rejection.
Synthetic extension inspection confirms a partial API surface; native-messaging
functions are exposed but no host was invoked. Native Touch ID is unconfigured and
requires a signing entitlement; this is not synced Apple passkey support. Real SSO,
1Password/Apple Passwords and full Chrome extensions remain open. Probe command:
`node tests/smoke/browser-compatibility-desktop.mjs` (clean exit, isolated temporary
profile, virtual authenticator only). No production configuration was changed.
Next architecture work is a maintained full-Chromium candidate qualification,
not an extension marketplace or password vault workaround. First review can proceed
with the documented limits; full Phase 1 acceptance still requires resolving them.

## Delivery phase state

Founder clarification: broad SSO/passkeys are core; no site allowlist is required.
Prioritize 1Password compatibility and investigate Apple Passwords. Prefer Chrome
extensions; an Aux marketplace is conditional, and an owned password vault remains
exploratory after first review. Current Electron extension support is partial, so
the browser-shell compatibility decision remains open rather than declared solved.

Integrated Phase 1 baseline: isolated native development-app journeys passed for
conversation/draft/side-panel continuity, tab/session restart recovery, page crash/
navigation recovery, permission reset persistence, bookmark import/export and PDF
output/cancellation. Evidence: `release/test-artifacts/aux-phase1-readiness.json`
and corresponding `phase1-*.log` files. This does not qualify real SSO, passkeys,
password managers, arbitrary extensions or the whole delivery phase. Next: resolve
the essential browsing/window and authentication integration gaps as a coordinated
Phase 1 batch, with the compatibility decision preceding ecosystem expansion.

| Phase | State | Phase-level exit still required |
|---|---|---|
| 1 — Daily browser | Active; verified components, incomplete integrated qualification | Dependable personal browsing build, early compatibility decision, saved-data/failure checks and first founder review |
| 2 — Trusted connected agent work | Partial foundations; not phase-qualified | Real connected tasks with continuity, authority, takeover, evidence, supported reports and prepared actions |
| 3 — Complete local development | Human and scoped-agent local change workflow works; not phase-qualified | Full issue/app/incident journeys, environment breadth, diagnosis and authorized connected delivery |
| 4 — Cloud continuity and ecosystem | Incomplete | Desktop-off execution, durable artifacts, reconnect/takeover/cleanup and qualified client/provider parity |

The authoritative scope, dependencies and exit gates are in `AUX-ROADMAP.md`.
Security, recovery, compatibility, performance and data-integrity checks required
for a safe usable build belong to Phases 1–4. A seven-day pilot, founder acceptance
campaign, feedback-driven polish and packaging are post-handoff work.

## Implementation findings to resolve

- Older roadmap/script comments contradict the newer Chromium-first architecture.
- Runtime grants classify browser operations; they are not complete task authority.
- Completion verification uses page-text matching; independent outcomes pending.
- Agent/set write intents now use the runtime SQLite journal, fail closed on
  corrupt legacy imports, and block uncertain effects across replans. Task-level
  identities, independent reconciliation/UI, and other dispatch routes remain open.
- MCP transport replay corrected in the first checkpoint; durable logical action
  reconciliation is still required across all execution routes.
- Gateway persistence now requires OS encryption and awaited native storage;
  synthetic tests pass. Live OS/bundle identity qualification and broader broker
  architecture remain pending; see AUX-CREDENTIALS.md.
- Tag-triggered release publishing removed. Manual workflow produces private CI
  artifacts with read-only repository permission; distribution remains gated.
- Packager dependency reference corrected to engine-client; first private macOS
  arm64 build passed. Packaged runtime smoke and full desktop acceptance are
  distinct gates; latest evidence appears below.
- Runtime data directory and Electron userData/profile location are independent;
  renaming app/package before pinning profile identity risks losing visible logins.

## Verification policy

Record commands, outcomes, scope, and failures for each patch below. Implemented
and verified are separate. Missing credentials, provider capability evidence,
founder visual review, and live workflow evaluations remain explicit open work.

## Change log

### Phase 1 running review handoff — 2026-09-19

- Fixed development startup to regenerate desktop/preload/MCP JavaScript from
  source after the workspace compile. Incremental tsc and prior in-place bundled
  output can otherwise leave stale code or an unusable sandbox preload. This is
  source compilation, not creation of an application bundle.
- `tests/smoke/dev-launcher.mjs` now starts with a deliberately stale compiled
  preload. The real `pnpm dev` path replaces it, loads the Aux artwork and shell,
  browses a synthetic site, stops its child processes, and rejects an occupied
  renderer port without launching against another server. The journey passed.
- Launched `AUX_LOAD_DOTENV=0 pnpm dev` for the founder and left it running.
  Exec session at handoff: `59313`; renderer localhost:5197. Verify this live handle
  before polling/restarting; its existence in this document is not liveness proof.
  Avoid hot-reloading product changes during the founder's review without notice.
- Inspected the actual Aux window through native accessibility and a screenshot.
  Existing sidebar organization and a signed-in GitHub page restored. This proves
  that existing session rendering works here; it is not a new SSO/passkey test or
  organization SSO approval. No credential-store search or account change occurred.
- Asked which model connection to use for the first live agent workflow, with
  credentials entered by the founder in Settings → Models, not in chat. A reply
  and a working configured connection remain required before that live gate.
  Continue independent Phase 1 work; do not mark any delivery phase complete.

### Phase 1 unsaved-document navigation integration — 2026-09-19

- Tab closing now waits for native WebContents destruction before removing its
  view/runtime identity. Staying returns `{ok:false}` and preserves the live page;
  cancellation no longer detaches the driver or changes the tab snapshot first.
  Already-destroyed native targets are handled without duplicate removal events.
- Native `will-prevent-unload` owns a Stay/Leave dialog, displaying the actual
  origin and defaulting to Stay. Missing/failed confirmation fails closed.
  The automation connection dismisses its own beforeunload dialog so the native
  decision remains authoritative; a preconfigured agent dialog accept cannot
  silently override the human's unsaved-work decision on an Aux tab.
- Native fixture verifies an actual dirty textarea and beforeunload listener:
  canceled tab close, link navigation and reload preserve text; Leave reloads or
  closes; a clean page closes without a prompt. Dialog answers are supplied by
  the test, while the document and browser lifecycle are real. Evidence:
  `tests/smoke/unsaved-work-desktop.mjs`.
- Workspace/desktop build, focused page/recovery checks, native login-window
  lifecycle and complete tab/session restart recovery passed. Original spaces,
  folders, IDs, ordering and selection remain intact. No app bundle was made.
- **Scope still open:** whole-window close/app quit is not covered by this gate.
  BaseWindow shutdown still freezes the session snapshot and has no coordinated
  all-document approval path. Do not claim unsaved form recovery across quit or
  crash; users must save before quitting. Multiwindow/private browsing and the
  broader Phase 1 gaps remain. Next work should address coordinated window/session
  exit rather than expanding this into more individual-control milestones.
- API evidence: Electron's `will-prevent-unload` event uses preventDefault to allow
  leaving, and `webContents.close({waitForBeforeUnload:true})` respects a veto:
  https://www.electronjs.org/docs/latest/api/web-contents#event-will-prevent-unload

### Phase 1 media/privacy integration — 2026-09-19

- Camera and microphone now have separate per-origin decisions in the actual
  permission request/check handlers and Settings. A camera grant cannot grant
  microphone capture, nor can a microphone grant grant camera capture. Combined
  requests respect either device's denial. Old combined media decisions require
  fresh approval and are removed when a new device decision is saved.
- Permission prompts identify the requested capability in human-readable language,
  default to denial, and abort on document navigation/destruction. A stale dialog
  cannot overwrite an intervening saved/reset decision; persistence failure denies
  access without corrupting previous decisions.
- `media-permissions-desktop.mjs` passed in the native app with fake devices:
  camera capture, microphone denial, combined-request denial, independent settings
  reset, origin isolation, navigation cancellation, failed atomic persistence and
  full restart. A local WebRTC loopback received decoded fake-camera frames,
  generated Web Audio packets and a data-channel message. Generated audio does
  **not** qualify microphone capture. No physical device or clipboard contents
  were accessed. Inspected `release/test-artifacts/aux-media-permissions.png`.
- Renderer typecheck/desktop build passed. Permission settings/reset persistence
  and file upload/site-data recovery journeys also passed after integration.
- **Unresolved qualification failure:** synthetic microphone `getUserMedia` hangs
  after approval on Electron 43.6.0 / Chromium 150.0.7871.250. Reproduced with the
  Aux policy replaced by unconditional approval in a disposable diagnostic,
  without changing production policy. Fake camera succeeds. Separate Chrome for
  Testing 153.0.8010.12 also times out with fake devices/fake UI and a temp profile.
  Fake audio WAV input and disabled audio processing did not resolve it. Do not
  infer an Aux-only regression, real-device failure, or working microphone from
  this evidence. No OS permission changes or real capture were attempted.
- `microphone-capture-desktop.mjs` deliberately remains a failing qualification
  gate until actual synthetic capture returns an audio track. Evidence:
  `aux-microphone-capture.json`, `aux-microphone-chromium-baseline.json` under
  `release/test-artifacts`. The latter reference used existing Playwright Chromium,
  `--use-fake-device-for-media-stream`, `--use-fake-ui-for-media-stream`, isolated
  HOME/profile, mock Keychain and a localhost fixture; it is not Aux qualification.
- Phase 1 remains active. Next: resolve microphone fixture/runtime qualification
  or explicitly qualify hardware during founder review; screen sharing, real
  conferencing, clipboard, private/multiple windows and broader daily-use gates
  remain open. Do not restart the permission investigation from scratch or claim
  the partial WebRTC loopback proves conferencing readiness.

### Phase 1 protected-site authentication integration — 2026-09-19

- Added trusted-shell HTTP authentication prompts with requesting origin, bounded
  realm text, rejected-credential retry and cancel. Credentials pass directly to
  Chromium and are not written to Aux settings, task history or runtime storage.
- Pending requests survive a shell reload; typed credentials do not. Navigation,
  page destruction, shutdown and a two-minute timeout end pending requests.
  IPC responses require the trusted main shell and a live request ID.
- Verified the real development app against a synthetic Basic-auth local server:
  successful sign-in, wrong-password retry, reload recovery, cancel, rejection of
  late responses, and navigation cancellation. Scanned isolated runtime data for
  the synthetic password and Authorization value; neither was present. This is
  not a claim about Chromium's in-memory authentication cache.
- Renderer typecheck and desktop build passed. Re-ran native sign-in popup/tab
  continuity and page crash/navigation recovery successfully. Inspected the actual
  neutral prompt screenshot and tightened excessive field spacing.
- Evidence: `tests/smoke/http-auth-desktop.mjs`,
  `release/test-artifacts/aux-http-auth.png`. Digest, enterprise proxy/SSO,
  native passkeys and password managers remain unqualified. Phase 1 stays active;
  next integrated daily-use work is clipboard/media/privacy and window behavior,
  with real account compatibility and founder review still required.

### Phase 1 file/site recovery integration — 2026-09-19

- Settings → Site permissions now offers website-data clearing for open native
  HTTP(S) tabs. The trusted main process resolves the target from its registry,
  confirms the exact origin with Cancel as default, revalidates the origin after
  confirmation and clears the selected storage types. Related-subdomain cookie
  scope is explicitly disclosed. History/bookmarks/permission decisions and cached
  files remain; live pages may recreate data. This is not an all-data privacy wipe.
- Native integration verifies multiple file selection through the file-chooser
  event, exact multipart upload names/bytes at a local server and retry after a 503
  while preserving the selection. No upload product code change was needed.
- Data-recovery journey seeds synthetic cookies/localStorage/IndexedDB in localhost
  and a separate IP origin. Cancel preserves data, confirmed clearing removes the
  target data, unrelated-origin data remains, changed-origin confirmation rejects,
  and cleared/preserved state remains correct after full restart. Native confirmation
  is mocked in the fixture; no personal site data or credentials are involved.
- Workspace build, renderer typecheck and desktop build passed; the integrated
  files/site-data smoke and prior permissions smoke exit cleanly. Inspected actual
  settings capture `aux-site-data.png`. An initial test used an older bundle after
  typecheck caught a missing mock bridge member; fixed and reran successfully.
- Phase 1 remains active. Native file-picker cancellation, clipboard/media and
  broader site/auth compatibility still need qualification; private/multiwindow
  browsing and the shell migration gate remain open. Do not treat this batch as
  a separate delivery milestone or complete daily-browser readiness.

### Phase 1 keyboard browsing integration — 2026-09-19

- Both tab layouts now support manual arrow/Home/End focus traversal with wrap;
  activation remains Enter/Space. Vertical traversal excludes collapsed/inert
  folder content. Horizontal tabs expose a selected-tab keyboard entry point.
  Context/space menus share arrow/Home/End navigation without intercepting nested
  action buttons or modified shortcuts.
- Space editing traps Tab/Shift-Tab, dismisses with Escape from any control and
  restores shell focus. Its modal hides native page views and restores the existing
  overlay state on close. Sidebar collapse/reveal preserves a usable focus target.
- Render inspection exposed an old thick/double field focus ring; replaced the
  affected field styles with one fine neutral outline. Inspected actual horizontal
  shell and modal captures after correction (`aux-keyboard-horizontal.png` and
  `aux-keyboard-space-dialog.png`). Shell screenshots exclude native webpage pixels;
  the modal's native-view visibility is asserted independently.
- Renderer typecheck and desktop build passed. Native keyboard journey verifies
  manual tab activation, collapsed-folder exclusion, menu traversal, modal wrap/
  Escape, native-page hiding, collapse/reveal and horizontal tab stop. Saved-tab
  restart recovery and focused workspace/recovery checks passed. No bundle created.
- Phase 1 remains incomplete: these journeys do not qualify all dialogs, VoiceOver,
  every keyboard shortcut, private/multiwindow browsing or account compatibility.
  Next work remains essential file/site interactions and remaining daily-use gaps;
  retain the recorded browser-layer migration boundary.

### Phase 1 shell decision evidence — 2026-09-19

- Added and ran a disposable full-Chromium extension baseline. Actual tab lifecycle,
  local storage, script injection, cookie lifecycle and context-menu lifecycle pass
  in the existing Chrome for Testing 153.0.8010.12 binary. Broader browser/account
  compatibility is not inferred; this result is not Aux or CEF qualification.
- CEF source inspection rules out treating macOS parent-view embedding as a direct
  path to Chrome-style compatibility: that path forces Alloy. Chrome-style Views
  remain a native prototype candidate with a one-Chrome-view-per-window constraint.
- Recorded candidate comparison and execution decision in AUX-BROWSER-COMPATIBILITY:
  preserve first-review Electron, prefer a Chromium browser-layer shell for final
  compatibility, avoid a general extension shim/marketplace detour. Native prototype,
  signed identity and migration remain unqualified and subject to no-bundle scope.
- Next independent Phase 1 batch should address remaining daily-use gaps (file/site
  interactions and keyboard/window behavior), retaining this architecture boundary.
  No personal profile, native messaging host or credential store was accessed.


### Phase 1 authentication integration — tab/window continuity (2026-09-19)

- Featureless `window.open` and form-target pages now use Electron's native
  creation hook to become actual Aux WebContentsView tabs, retaining Chromium's
  opener relationship, blank-window navigation and submitted POST body. Explicit
  sized popups remain separate windows. Foreground adopted tabs activate after
  runtime attachment; background disposition is retained without autoactivation.
- Added a pending-attachment removal guard: closing during driver attachment
  disposes the attached driver instead of resurrecting a removed page. Initial
  runtime URL comes from the attached document, correcting navigation that finished
  before attachment. New page IDs use UUIDs to avoid collisions with restored IDs.
  Native removal of the active page selects a remaining recently active page.
- Final workspace/desktop builds passed. Sequential native login, tab-recovery
  and page-recovery checks exited successfully. Login fixture now verifies shared
  synthetic cookies, opener communication, preopened blank navigation, POST method
  and payload, explicit noopener isolation, nested popups, fast-close behavior,
  focus/close and main-window resize. A deterministic delayed-driver unit case
  verifies the close-during-attachment race; existing page-inspection checks pass.
- Verification first found a stale about:blank URL (fixed); a later fixture returned
  an unserializable WindowProxy to the test bridge (fixture corrected). Neither was
  accepted as a pass. Final checks use isolated mock-keychain profiles only.
- These close concrete authentication plumbing gaps, not the SSO/passkey gate.
  Next Phase 1 work: qualify browser identity/WebAuthn and extension feasibility,
  background-link/referrer behavior, cross-origin SSO policies, and remaining
  essential browser gaps. Native passkeys, 1Password/Apple Passwords, actual provider
  sign-in and full extension compatibility remain unqualified. No bundle required.

### Phase 1 integration — sign-in popup lifecycle (2026-09-19)

- Replaced global early popup adoption and fake tab-view casting with explicit
  `did-create-window` registration and a typed independent-window entry. Popups
  receive normal navigation/destruction events while retaining their own geometry;
  main-stage layout no longer hides or reparents them. Aux page activation focuses
  their window, and page close closes it. Runtime preserves the native-assigned ID.
- Destruction removes registry entries without reading disposed Electron objects.
  Initial verification exposed a shutdown hang from accessing a destroyed object's
  ID; fixed before final verification. Those initial runs were terminated and do
  not count as clean passes.
- Verified `pnpm build`, desktop build, and sequential clean-exit native journeys:
  `sign-in-popup-desktop.mjs`, `page-recovery-desktop.mjs`, and
  `tab-recovery-desktop.mjs`. The new isolated fixture checks shared synthetic
  session cookies, opener postMessage, window geometry across main-window resizing,
  Aux activation, script close, reopening and Aux page close. Existing crash,
  failed-navigation and saved organization/restart journeys remain working.
- Scope is explicit window-feature popups, not live identity-provider qualification.
  Featureless `window.open`, immediate-close/attach races, nested authentication,
  native passkeys, provider-specific SSO policies and password-manager integration
  still need qualification or implementation. Keep Phase 1 active; these are
  integration fixes within it, not a completed delivery phase. No app bundle,
  external publication, account access or credential-store lookup occurred.

- Added schema version 3: runtime workspaces/tasks, immutable revision snapshots,
  and indexed task/run linkage. Shared contracts require explicit criteria and
  unique resource/criterion IDs. Stale edits fail with revision conflicts.
- Added workspaces/tasks APIs and task-aware run starts using saved objective/
  criteria. Run metadata binds the task revision before execution; active runs
  block editing/competing task starts, and prior unresolved task effects block
  another attempt across revisions. Older run results retain provenance and are
  labeled as earlier-revision results. Successful runs do not verify tasks.
- Added a Tasks drawer with workspace/task creation, criteria, revision editing,
  current-tab run launch, history, archive/restore, and modal keyboard focus wrap.
  Existing tab spaces are not yet migrated into runtime workspaces.
- Added an actual Electron task-UI smoke with temporary profile/data, no inherited
  provider keys, dotenv disabled, and mock keychain. Initial assertion read the
  editor before asynchronous loading finished; corrected the smoke to wait for
  revision state. Create/edit/reopen/archive/restore then passed. Screenshot
  visually inspected at release/test-artifacts/tasks.png (synthetic data only).
- Added AUX_LOAD_DOTENV=0 for explicit isolated launches; existing default dotenv
  behavior remains. No personal profile or OS credential store was read.

- Added schema version 2 with transactional action intents, append-only transition
  history, and validated legacy-import records. Version 1 upgrades have a separate
  transition and retain a pre-upgrade snapshot. WAL now uses synchronous FULL.
- Agent/set execution uses the runtime SQLite journal. Pending/uncertain outcomes
  block additional writes on the run/page despite new refs/epochs/observations.
  Explicit logical action IDs survive page changes; planner task-level allocation
  is still required. Fingerprints include all parameters and avoid raw values.
- Fixed duplicate suppression being reported as successful execution. The
  coordinator persists unresolved intent IDs and refuses completed status while
  effects remain unresolved. Streaming retains actual dispatch results. A failed
  response does not authorize an automatic write retry.
- Added actual SIGKILL-after-POST regression (not a simulated object reopen),
  transaction rollback, two-connection persistence, legacy corruption/import,
  identity, reconciliation history, and completion-refusal tests. Corrected an
  older test title that overstated process-kill coverage.
- Full-suite failures exposed old expectations that screenshots/model completion
  could clear failed writes. Updated those to require uncertainty, retained read
  repair-escalation coverage, and added a one-dispatch write-repair regression.

- Replaced native plaintext fallback with versioned encrypted secret envelopes,
  private atomic file replacement, backend availability checks, and explicit
  errors. Linux basic_text is refused. Added name validation and secret removal.
- Settings now awaits/serializes credential saves, restores only from the native
  encrypted store or supplied environment, masks keys, and exposes source/errors.
  Legacy plaintext is not consumed automatically. Explicit successful replacement
  retires active legacy copies; historical snapshots are not silently modified.
  Standalone key saving fails instead of writing plaintext. Preference edits do
  not rewrite legacy JSON secrets. Secret handling tests never use OS stores.
- Updated Settings UI to retain entered keys on failed save, show storage/source
  information, and avoid reporting removal when it failed. Actual UI acceptance
  and OS decryption remain unverified.

- Pinned Electron userData/sessionData before readiness with explicit absolute
  AUX_PROFILE_DIR selection, preserved legacy profile discovery, separate fresh
  runtime/profile roots, and ambiguity rejection. Added desktop single-instance
  locking and focus on second launch. Three new synthetic profile tests pass;
  existing personal profiles were not opened, copied, or decrypted.
- Corrected initial profile-discovery assumption using the generated app.asar
  package manifest and Electron 43.6.0 initialization source: packaged Electron
  also uses @vector/desktop when productName is absent from package.json. A Vector
  directory holding only runtime files must not count as a Chromium profile.
  Source: https://raw.githubusercontent.com/electron/electron/v43.6.0/lib/browser/init.ts
- Private macOS arm64 package built with signing explicitly skipped. Bundle still
  uses Vector.app pending credential identity qualification; no release occurred.
- Isolated packaged smoke environment from inherited provider/config values and
  dotenv lookup; uses temporary HOME/data, synthetic auth, a fresh Playwright
  browser with its mock-keychain defaults, and waits for runtime shutdown before
  restart. Removed fixed-delay restart and added request timeouts/process cleanup.
- Packaged smoke exposed separate request host allowlist and missing live grants
  wiring. Added live capability checks for direct/session HTTP requests and wired
  saved browser operations to current settings grants; defaults are read-only.
  HTTP methods require read/write/destructive as appropriate plus scoped egress.
  Session use requires exact origin. An uncertain browser error no longer falls
  through to a second HTTP dispatch. Redirects fail closed until per-hop policy
  exists; this is an explicit compatibility limitation, not completed networking.
- Three request-authority regressions pass: grants/revocation prevent dispatch,
  lost browser response does not replay a mutation, and real HTTP redirects do
  not dispatch a second request. Full task-scoped grants, response reconciliation,
  and semantic authorization of the generated evaluate step remain open.

- Added runtime SQLite schema version 1, private pre-upgrade WAL-aware snapshots,
  transactional schema adoption, rollback on failure, and newer-schema refusal.
  Recovery guidance and limits are in AUX-DATA-MIGRATIONS.md. No real user database
  or credential store was opened by this work.
- Corrected private desktop staging to vendor engine-client, derive platform
  output paths, and fail if runtime dependency injection cannot run. Disabled
  signing-identity auto-discovery. Removed packaged smoke's false-success fallback
  when only a native engine binary exists. Package execution remains unverified.
- Migration regression tests initially exercised stale compiled runtime output
  and failed; rebuilt the workspace, then all 23 focused tests passed. Runtime
  tests resolve its compiled package, so build before testing runtime changes.
- Second checkpoint validation: `pnpm build`, `pnpm typecheck`, and all 416 unit
  tests across 56 files passed. Both changed packaging scripts passed Node syntax
  checks; `git diff --check` passed. These checks do not establish packaged app,
  actual browser-profile migration, cloud execution, or founder acceptance.

- Established the authoritative full-scope roadmap and this evidence ledger.
- Saved the original intent brief as historical planning input and redirected
  active roadmap links to AUX-ROADMAP.md.
- Added source-aware AUX_* configuration normalization with VECTOR_* compatibility.
  Process environment wins over dotenv regardless of spelling; nonempty canonical
  values win within a source. Desktop-owned IPC/CDP coordinates win over inherited
  values. Direct engine harness/Rust environment migration is still pending.
- Unified runtime/desktop/CLI/MCP data and descriptor discovery. New runtime
  installs use Aux Browser/aux-state.sqlite; existing legacy roots/databases remain
  in place. Ambiguous roots require AUX_DATA_DIR; ambiguous databases fail closed.
  No existing user profile, database, or credentials were moved.
- Added auxctl/aux-runtime/aux-mcp executable aliases; legacy aliases retained.
- Updated desktop window/menu/title, engine labels, connection errors, and relevant
  settings copy to Aux. Bundle, icon, package, protocol, fixture, and full UI rename
  remain open; see AUX-COMPATIBILITY.md.
- Removed implicit MCP replay after transport failure. A real HTTP fault test
  commits a mutation then drops its response, proves one dispatch, and verifies
  discovery of a restarted runtime on the next explicit call.
- Corrected stale test harnesses to supply explicit run/dialog grants. Added a
  negative test proving read-only clients cannot accept dialogs. Production
  authority defaults were not broadened.
- Removed a mock-model unit test's writes into committed live benchmark evidence.
  Restored the live evidence artifact changed by the initial full test run and
  verified it remains unchanged after the corrected full suite.

## Verification — first checkpoint

- `pnpm build`: pass.
- `pnpm typecheck`: pass after final source changes.
- `pnpm --filter @vector/desktop typecheck`: pass.
- `pnpm --filter @vector/desktop build`: pass (Electron bundles + Vite renderer).
- Focused configuration/MCP/recovery suite: 21 tests across 6 files pass, including
  standalone canonical-config restart and existing browser crash recovery.
- Full `pnpm test:unit`: 412 tests across 55 files pass. Initial run exposed five
  stale fixture failures; explicit grants and a denial regression resolved them.
- `node --check scripts/dev.mjs` and `git diff --check`: pass.
- No cloud providers, live paid model evaluations, full Rust suite, desktop GUI
  acceptance, packaged application, or actual user-data migration were qualified
  by this checkpoint. No external release or publish action occurred.

## Next delivery milestones

1. **First hands-on review:** use the rebuilt app via `pnpm preview`; browser and
   task receipt workflow validated in the actual package. Founder visual and
   interaction review pending. Bundle still Vector.app for identity continuity.
2. **Daily browser and agent setup:** prioritize navigation/tab ergonomics,
   discoverability, setup/error handling, and a qualified live task with an
   explicitly supplied connection. Do not search for credentials. Address real
   compatibility blockers in the highest-value browsing journeys.
3. **Complete local work:** useful developer/operator workflows and agent
   integrations, task/resource ergonomics, richer artifacts and recovery.
4. **Cloud and full founder acceptance:** complete the remaining roadmap in
   end-to-end workflow milestones. Preserve all original requirements and gates;
   the early review build is not full completion or permission to publish.

## Verification — third checkpoint

- `pnpm build`: pass; 29 focused profile/operation tests pass.
- `pnpm package:local`: pass, macOS arm64, signing explicitly skipped.
- `pnpm smoke:packaged`: pass against rebuilt packaged runtime. Verified API
  authentication, real fixture observation, persisted operation across restart,
  denial without egress grant, and direct request after scoped authorization.
  This does not exercise the packaged desktop shell or real signed-in sessions.
- `pnpm test:unit`: 422 tests across 57 files pass.
- `pnpm --filter @vector/desktop typecheck`: pass.
- Initial smoke failures exposed absent host allowlist configuration and missing
  live capability wiring. Fixed the wiring, kept explicit host restrictions, and
  added negative regression evidence rather than weakening default authority.
- Credentials remain synthetic for tests; no Keychain search, personal-profile
  launch, signing, package publishing, or external release occurred.

## Verification — fourth checkpoint

- `pnpm build`: pass.
- `pnpm test:unit`: 428 tests across 58 files pass, including six synthetic
  credential-storage regressions and async settings-handler coverage.
- `pnpm --filter @vector/desktop typecheck` and desktop `build`: pass.
- `git diff --check`: pass; committed live-model evidence unchanged.
- No actual OS credential provider or personal profile was accessed. The private
  packaged artifact from checkpoint three predates these credential changes;
  rebuild and requalify it before founder testing. Full goal remains active.

## Verification — fifth checkpoint

- `pnpm build`: pass; desktop typecheck passes.
- Journal/migration/review focused suite: 32 tests pass; coordinator/streaming/
  verification focused suite: 39 pass after completion guard integration.
- Initial full suite had four failures from prior unsafe retry/completion
  expectations. Revised those assertions, kept read-repair coverage, and added
  a single-dispatch uncertain-write test. Focused vision/repair suite: 12 pass.
- Final `pnpm test:unit`: 436 tests across 59 files pass. The final strengthened
  repair test additionally passes on its own. `git diff --check` passes.
- Actual synthetic process SIGKILL after one fixture POST leaves a durable
  pending intent and prevents a second dispatch after changed epoch/revision.
- See AUX-ACTION-JOURNAL.md for scope: no claim of universal exactly-once,
  independently verified business success, complete task recovery, or all-route
  enforcement. Packaged artifact still needs a rebuild before founder testing.

## Verification — sixth checkpoint

- `pnpm build`: pass. Focused task/API/migration suite: 18 tests pass.
- `pnpm test:unit`: 443 tests across 60 files pass, including the added version
  2→3 migration preserving uncertain action intents.
- Desktop typecheck and renderer/main/preload build: pass.
- Real Electron task drawer smoke: create workspace/task, edit, reopen, archive,
  restore pass using synthetic data; screenshot visually inspected. Test launch
  explicitly disables dotenv and uses a mock keychain. No model calls occur.
- `git diff --check`: pass; live-model benchmark evidence remains unchanged.
- No founder acceptance, complete browser compatibility, model-backed task UI
  execution, task verification/receipts, or cloud continuation is implied.

## Private desktop review milestone — browsing, tasks, evidence and receipts

Working user experience:
- Browse a real Chromium page, bookmark it, create a workspace/task, revise its
  objective and criteria, attach the current tab, and capture page evidence.
- Record notes with their source, select evidence, accept/reject criteria with a
  reason, reopen a saved receipt, and archive/restore the task.
- Inspect uncertain actions and record a human reconciliation using current task
  evidence. This makes no new external dispatch. Active task runs block decisions.
- Use `pnpm preview` for separate persistent profile/data directories, no inherited
  provider secrets or dotenv, and the Chromium-only review configuration.

Runtime and trust integration:
- Schema v4 adds append-only evidence/review records. Migration preserves saved
  tasks/revisions and action journal. Task/run/page changes invalidate applicable
  evidence, and later evidence requires a new review. Browser captures are dated
  text snapshots, not continuous monitoring or independent outcome verification.
- HTTP/WS callers cannot label themselves as the human reviewer. Shell-only IPC
  context is assigned after main-frame/document/sender checks. Human acceptance
  and external claims are distinct. Model cost remains explicit when incomplete.
- Tasks drawer now supports explicit current-tab attachment and evidence capture,
  selected-evidence review, receipt state, known model cost, and reconciliation.

Validation:
- Workspace build, desktop typecheck, relevant runtime/authority/migration checks,
  and full existing unit regression suite pass.
- Private macOS arm64 package rebuilt with all changes in this milestone. Packaged
  runtime authentication, fixture observation, persistence across restart, and
  scoped-operation authorization smoke passes.
- Actual packaged Electron journey passes: local fixture navigation/bookmark,
  task create/revise, attach/capture, both criterion reviews, saved receipt reopen,
  archive/restore and keyboard focus wrap. Native fixture and task screenshots
  saved in release/test-artifacts. A smoke locator initially assumed the hidden
  toolbar bookmark button; corrected to the real sidebar layout's Cmd+D action.
- No model calls, personal profile access, real OS vault test, credentials search,
  signing, publishing, release, or full compatibility claim. The preview launcher
  was syntax checked; packaged UI qualification uses temporary data/mock keychain.

Material gaps: live model-backed task qualification and agent setup; full browser
compatibility; unified tab/task workspaces; task drafts/search and richer editing;
independent outcome verification; all-route action identity; local/cloud developer
workflows; complete Aux rename. These remain explicit roadmap work rather than
being treated as blockers to the first visual/interaction review.

## Agent setup and recovery experience — implementation

- Agent and task entry points explain missing setup. Sending a prompt without a
  configured model opens Settings and preserves the draft in the agent composer,
  without creating an empty tab or failed run. Runtime-start errors retain the
  draft too, including prompts entered through the address bar.
- Settings puts Agent connection first, requires explicit Save key, permits exact
  custom Gateway model IDs, and distinguishes configured credentials from tested
  connectivity. Draft edits invalidate displayed probe success; test controls
  require saved values and disclose synthetic provider requests/possible charges.
- Settings now reports the effective run permissions. Previously it displayed
  default Read alone while user-started runs actually received Read + Write.
  Defaults are unchanged; the UI accurately displays them and permits read-only
  selection. A modelConfigured flag reports availability without accessing a
  credential store or triggering a model request.
- Credential-free packaged smoke extended through missing-setup recovery,
  preservation of a typed prompt, custom model save, no blur-triggered key save,
  and changing the actual effective run permissions. It does not qualify live
  provider authentication, key storage in the real OS vault, or model execution.
- Targeted runtime/settings/credential regressions and desktop typecheck pass.
  Regression checking caught readiness mistakenly throwing on unavailable/legacy
  credentials; readiness now uses already-loaded metadata and Settings remains
  usable for recovery. Final packaged workflow validation recorded below.
- Final private application rebuilt from the corrected sources. Packaged desktop
  smoke passes the complete browsing/task-review/setup flow, including no extra
  runs or pages on missing setup. Actual provider requests were not made. The
  optional agent-setup screenshot capture was added to the smoke afterward; no
  current screenshot is claimed for that screen. `pnpm preview` opens this build.

## Daily browsing milestone — saved pages and return navigation

- Replaced the history-only overlay with a searchable Library containing Bookmarks
  and History. Save the current page, rename bookmarks, remove with undo, save a
  recent visit, and reopen a saved page. Existing live human tabs are reused,
  including switching to the tab's space; crashed/detached/agent-owned pages are
  not reused. History queries cover up to 500 latest matching visits and show
  that limit explicitly. Loading failures stay visible instead of appearing empty.
- Added Library and Settings entry points to expanded/collapsed sidebar and the
  hidden-sidebar toolbar. The command palette includes Library; Cmd+Y opens its
  History view. Existing bookmarks, history, and events remain authoritative;
  no schema or credential changes were needed.
- Library uses a keyboard-trapped dialog, native action buttons, searchable
  results, arrow navigation between tabs, and keyboard entry into search results.
  It ignores stale asynchronous search responses. Full VoiceOver and large-library
  performance qualification remain open.
- Extended the real packaged journey to rename/search/remove/undo a bookmark,
  search history, reuse an existing tab, then close and reopen it from Library
  before continuing task capture/review and agent setup. Validation outcome below.
- Desktop typecheck and private package build pass. Actual packaged library,
  browsing, task review and agent setup journey passes. Library and setup renders
  visually inspected from synthetic-profile screenshots; controls fit the tested
  desktop layout. `git diff --check` passes. The runtime was unchanged, so the
  already-passing broad runtime suite was not repeated for this UI milestone.
- The private preview now includes this Library experience. Credentials, real
  browsing profiles, signing and publishing remain untouched. The full roadmap,
  live provider qualification and broader browser compatibility remain open.

## Developer collaboration milestone — external agent → task → human review

- Packaged the MCP bridge with the desktop application, using the application's
  own executable in Node mode. Settings now generates Codex TOML and Claude Code
  JSON entries for this installation/profile. No client configuration is written,
  no credentials are embedded, and no client authentication is read or imported.
- Added shared-contract MCP tools for workspace/task create/list/get/update/archive,
  built-in task start, external evidence notes, browser evidence captures, receipts.
  Human acceptance/reconciliation are not exported as MCP tools and remain gated
  in runtime handlers. External notes carry external_client provenance.
- Generated configuration selects canonical aux_* browser tool names. Legacy
  clients keep vector_* browser tools by default; task tools use aux_* and the
  server identifies as Aux. Legacy resource URIs remain registered.
- Documented the actual authority boundary: this is trusted local browser access,
  not task-isolated execution; external model/cost/auth/session controls remain
  with the client. The setup UI makes no live connection or health claim.
- Workspace build, desktop typecheck, focused MCP transport/stdio/evidence checks,
  and the private package build pass. The actual packaged UI-generated command
  connects with the MCP SDK, lists canonical tools, creates a task, records an
  external claim, captures a real fixture observation, reads the receipt, and
  shows that task's provenance/Needs review state in the desktop. Prior browsing,
  Library, setup and human task-review flows pass in the same smoke session.
- External-agent setup screenshot visually inspected; git diff --check passes.
  Official Codex/Claude configuration formats checked; sources and walkthrough
  are in AUX-EXTERNAL-AGENTS.md. Actual authenticated Codex/Claude sessions, managed
  agent lifecycle, task-scoped external authority, full rename, direct providers,
  local development environments and cloud execution remain open roadmap work.
- No personal credentials or client config accessed, no provider calls made, and
  no signing/publishing/release. `pnpm preview` now includes this collaboration flow.

## 2026-09-19 — Aside-led private build redesign

- Delivered the three connected review experiences: charcoal shell and Search/Ask
  home, persistent full-page conversations with captured images and reply
  continuity, and dedicated searchable Settings with appearance/tab layout options.
- Kept existing tabs, folders, spaces, Library, task review and the webpage agent
  panel. Sidebar transitions update native browser bounds; saved tabs and selection
  survive layout changes. Unresolved actions and task ownership still gate replies.
- Polished Lucide icon sizing, favicon bounds, system typography, secondary text,
  rounded focus rings, keyboard resizing and reduced-motion handling. macOS sidebar
  vibrancy provides the native frosted material; this is not AppKit Liquid Glass.
- Direct OpenAI, Anthropic and Google provider adapters now accompany Gateway.
  Keys and model choices are separate by provider; official endpoints and explicit
  selection avoid implicit fallback. Synthetic SDK requests and credential storage
  checks pass. Live provider execution still needs user-supplied credentials.
- Actual packaged-app checks exercised browsing, bookmark rename/remove/undo,
  sidebar collapse/expand/native bounds, saved task review, provider setup,
  horizontal/vertical layout, theme choices and the UI-generated MCP connection.
  A prior intermittent Library check failed; rerun with an explicit post-transition
  runtime bookmark assertion passed. Do not treat that single rerun as proof of a
  diagnosed root cause; retain the assertion for follow-up.
- Seeded temporary-profile visual checks exercise two persisted conversation turns,
  captured image rendering, setup/draft recovery, and reduced transparency. No
  real credentials, personal profile, provider calls, publishing or signing used.
- See design-qa.md and AUX-DESIGN-DIRECTION.md for evidence and remaining limits.
  Full identity migration, authenticated model/client qualification, richer history,
  routines, global popup and the wider roadmap remain open after first review.
- Final rebuilt package passed both desktop journeys again, including bookmark
  persistence after transitions. Final rounded-focus home and light-layout
  screenshots were inspected. The earlier intermittent failure did not recur.

## 2026-09-19 — Readable, actionable conversation answers

- Agent answers now render headings, emphasis, lists, tables, quotes and fenced
  code in both conversation and side-panel views. Code has a copy control; explicit
  web links open actual Aux browser tabs. Home cards summarize formatted content.
- No raw HTML is executed, non-web destinations are inert, and model-authored
  images cannot make remote tracking requests from the trusted shell. Existing
  captured screenshot artifacts remain visible through their established path.
- Desktop typecheck and focused rendering/security checks pass. Packaged-app
  verification confirms exact code copying and navigation to a real local fixture
  tab, then returns to persisted conversation history and draft-recovery checks.
- Actual rendered answer/home captures inspected at reference size. Fixed reset
  styles hiding list markers, link contrast, and excessive home excerpt height.
  Evidence: release/test-artifacts/aux-formatted-answer.png.
- Live model qualification, identity migration and the broader roadmap remain
  active. No personal credentials inspected or external publication performed.

## 2026-09-19 — Corrected visual direction, original sidebar restored

- User correction supersedes prior sidebar reorganization and tint direction.
  Restored the original navigation/address → pins → space → folders/tabs structure
  from Git history while retaining new conversations, tasks, Library and settings.
- Removed tint from settings/API/runtime snapshots and rendering. Existing stored
  tint values have no effect. Neutral frosted material and solid mode remain.
- One continuous rounded content outline replaces the doubled sidebar seam;
  neutral fine focus indicators replace blue rings. Search/Ask, pin/address
  shadows, footer alignment, empty state and home composition are refined.
- Captured and visually compared the actual native app against the Aside reference
  at matching logical size, with populated sidebar and real grayscale backdrop.
  Frosted/solid captures prove visible blur versus opaque fallback. See design-qa.md.
- Packaged browser, saved data, Library, task, provider setup, MCP collaboration,
  formatted conversations and appearance flows pass. Context recovery also passes:
  a saved observed URL reuses an existing human tab or opens a new one, retaining
  conversation context and linking the preview to the actual tab.
- Full roadmap remains active. This completes the focused visual correction for
  private review, not native AppKit Liquid Glass, full identity migration, or
  live-model/browser compatibility qualification.

## 2026-09-19 — Conversation draft continuity

- Replaced the shared draft field for existing chats with drafts keyed by durable
  conversation ID. Full-page and side-panel composers share the same chat draft;
  unrelated conversations and the generic new-chat prompt remain separate.
- Saved-chat drafts persist in the local browser profile through renderer reloads.
  Successful replies clear their own draft only; setup/runtime errors retain it.
  Storage failures keep the in-memory text and show a one-time warning rather
  than claiming it was saved. Submission disables editing until it resolves.
- Focused checks cover malformed storage, exact Unicode/text restoration, setup
  interruption, and unrelated draft preservation. The actual packaged journey
  writes distinct replies, switches chats, reloads, verifies both replies, and
  moves between a full conversation and its side panel.
- Shell organization and neutral material remain unchanged. New-chat drafts are
  still session-only; no new claim of whole-profile/crash recovery is made.
- Screenshot review caught the rounded main surface retaining a hidden horizontal
  scroll offset after focus moved through the agent rail. The shell now clips
  paint without becoming a scroll container; the regression journey explicitly
  requires zero horizontal offset after switching composers.


## 2026-09-19 — Visible identity preparation; packaging deferred

- Changed optional packaging configuration to Aux Browser.app and Aux display
  name. Aux alone is a reserved filesystem name in the cross-platform packager.
  The CFBundleName must still match Aux Browser for native helper discovery.
- Kept dev.vector.browser and @vector/desktop stable. A synthetic launch of the
  previous bundle confirmed app.getName() is @vector/desktop. Electron 43.6.0
  derives macOS storage service/account names from that internal name:
  https://github.com/electron/electron/blob/v43.6.0/shell/browser/electron_browser_main_parts.cc
- About, Hide and Quit menu labels now explicitly use Aux; About panel displays
  Aux without mutating app.name. Local packaging completed after correcting helper
  naming, but real OS credential continuity remains unqualified.
- User clarified that an app bundle is not needed yet. Further packaging work is
  deferred; the running development app and visible product experiences take
  priority. No signing or publishing occurred. The optional identity smoke is
  retained for later bundle qualification, not recorded as passed.


## 2026-09-19 — Find and continue older conversations

- Replaced the 500-turn history ceiling with runtime-backed search across saved
  prompts and response text. Matching an earlier turn returns the latest turn of
  its conversation. Chat rows page on demand with a timestamp/run-ID cursor.
- Opening a saved chat fetches its latest turns; earlier messages load in batches.
  Reply is held while history is loading or has an unresolved load error. Empty,
  loading, retry and no-match states are explicit; stale search responses are ignored.
- Verified in the development Electron app using 675 synthetic saved turns:
  paging, an old prompt match beyond the former cap, opening its latest thread,
  and loading the complete 55-turn conversation. Existing recovery, independent
  reply drafts, side-panel continuity and settings journeys still pass.
- Reviewed search and earlier-message screenshots. Corrected the search input’s
  double focus outline to a single neutral line. Runtime checks include identical
  timestamps, literal wildcard characters, grouping and missing/duplicate pages.
- No application bundle built for this milestone. Packaging remains deferred.


## 2026-09-19 — Workspace-aware closed-tab recovery

- Reopen Closed Tab (native menu / Command-Shift-T) restores the URL into its
  original space, folder and position. The folder opens to reveal the selected
  restored tab. Removed spaces fall back to the current space; removed folders
  are not recreated. Open failures retain the recovery entry for another attempt.
- Concurrent reopen requests are serialized; invisible agent pages are excluded
  from the human closed-tab stack. Closing the active tab chooses a human
  neighbor within the current space instead of an unrelated workspace or agent.
- Verified the development app with real local pages: close a folder tab, switch
  spaces, invoke the native menu, and inspect restored membership, ordering and
  selection. Screenshot: release/test-artifacts/aux-tab-recovery.png. Focused
  checks cover failed reopening, deleted space/folder, and agent-page exclusion.
- Recovery remains session-only and reopens the URL; it does not restore unsaved
  form contents or a closed page’s navigation stack. No package was built.


## 2026-09-19 — Bookmark portability in Library

- Added HTML bookmark import with explicit file selection and preview. The
  lazy-loaded parse5 parser treats HTML as data, without browser DOM insertion,
  script execution or fetching file-supplied URLs. Limits: 5 MB / 10,000 bookmarks.
- Runtime validates web URLs without embedded credentials and imports the batch
  transactionally. Existing URLs keep their titles; repeated imports are safe.
  Any database failure rolls back the batch. Folder contents are flattened and
  clearly disclosed; sidebar spaces, folders and pins are unchanged.
- Export writes escaped standard Netscape bookmark HTML through the existing
  native save dialog. Unsupported addresses are excluded with a notice.
- Development-app journey covers preview, actual import, existing-title
  preservation, export to a synthetic temporary file, duplicate-free round trip,
  and Library reload. Parser/database checks cover hostile markup, entities,
  unsupported URLs, oversized files and transaction rollback.
- Inspected rendered import and Library screenshots and refined the search focus
  treatment to a rounded single neutral border. No application bundle built.


## 2026-09-19 — Usable native download controls

- Downloads shelf now pauses, resumes and cancels actual Electron DownloadItems.
  Controls use trusted-shell-only IPC and the registered live item; unsupported
  or expired actions produce visible errors. No arbitrary download ID can act on
  another filesystem path. Paused indicators and neutral progress remain readable.
- Opening the shelf reconciles persisted rows with the native live download
  snapshot, restoring controls after a renderer reload. Old unfinished records
  without a live item display Interrupted instead of indefinite fake progress.
- Open now reports OS failures, including moved/deleted files. Zero received bytes
  display explicitly rather than leaving an incomplete progress sentence.
- Development-app journey uses local streamed files: pause, reload, resume, exact
  byte comparison after completion, cancel a second download, and show an actual
  missing-file error. Reviewed paused/completed/cancelled/error screenshots.
- This does not persist resumable transfers across application restarts. Downloads
  still use Aux’s existing managed download location. No bundle was built.

## 2026-09-19 — Native tab recovery

- Crashed tabs now expose a usable Reload action and recover the same native tab,
  profile and page identity. A fresh protocol connection restores agent observation
  after Chromium invalidates the old connection. Reconnection failures retain an
  explicit recovery state instead of implying that the tab is fully usable.
- Failed main-frame navigation shows the attempted address with Try again and
  Go back. Chromium's internal error-page address is excluded from tab metadata;
  failure stops the loading indicator. Aborted navigations are not error screens.
- Validated in the development app with an isolated synthetic profile: forced
  renderer crash, same-tab reload, runtime observation, connection failure, retry
  after the server recovers, and back navigation. Reviewed rendered recovery
  screens at 1200×944. Source builds, desktop type checking and relevant shell and
  driver lifecycle checks pass. No application bundle created.
- Reload cannot restore unsaved page forms. Live model-provider qualification
  remains pending an explicitly configured provider connection.

## 2026-09-19 — Website permission controls

- Dedicated Site permissions settings category displays readable per-site decisions,
  search by origin or permission, individual resets and whole-site reset. Loading,
  empty, no-match and save-failure states are explicit. Unrelated decisions remain.
- Reset guidance distinguishes future permission requests from active capture;
  resetting does not promise immediate hardware revocation or clear site cookies.
- Permission read/reset IPC is restricted to the trusted main Aux interface.
  Writes use an atomic file replacement before updating the in-memory decisions.
  A failed write leaves the previous decisions intact and surfaces an error.
- Isolated development-app verification covers search, individual reset, UI reload,
  whole-site reset, preservation of other decisions, and an injected filesystem
  write failure. Reviewed the actual 1200×944 settings screenshot; desktop source
  build and type checking pass. No live camera/microphone or personal data used.
- This does not qualify conferencing, OS privacy prompts, screen-sharing selection,
  or immediate termination of active capture; those browser compatibility gaps remain.

## 2026-09-19 — Save browser pages as PDF

- File → Save Page as PDF (Command-Shift-P) and the command palette export the
  actual Chromium page using its print stylesheet, background graphics and CSS
  page sizing. A native Save dialog chooses the destination. Capture occurs before
  the dialog so later navigation cannot silently change the requested document.
- Trusted-shell-only export checks native page availability and prevents concurrent
  exports of the same tab. Cancellation leaves the page unchanged; write failures
  show a readable actionable error. Unsupported attached/engine pages are explicit.
- Exact palette command matches now rank ahead of Ask. Refined its neutral focus
  boundary and connected palette tab-reopen to the existing space-aware recovery.
- Real development-app verification exercised the File menu, inspected extracted
  text from both PDF pages with pypdf, checked print page breaks, cancellation,
  write failure, preserved tab identity and exact palette selection. Inspected
  `aux-pdf-command.png` at 1200×944. Desktop build and type checking pass.
- Export uses the page's printable representation, not an archival capture of
  interactive state. Custom margins/ranges use the existing Print dialog. No bundle
  created, credentials inspected, or external publication performed.

## 2026-09-19 — Full-page task editing and draft continuity

- Tasks now occupies the main content surface while preserving the browser sidebar.
  The underlying start/page UI is inert during Tasks/Settings so keyboard navigation
  cannot reach obscured controls. Tasks is a nonmodal region with normal access back
  to browser chrome. Search filters task titles/objectives within the workspace.
- Local drafts are separated by workspace and task, persisted on edit, and restored
  across switching/reloading. Last workspace/task selection is remembered. Saved
  task state changes only on explicit Save task. Draft storage failures are visible.
- Drafts retain their base revision. An advanced saved revision prevents Save/run/
  evidence actions until the user reviews and applies the draft to that revision
  or discards it. Runtime optimistic revision checks continue to protect writes.
- Development smoke verifies workspace isolation, new-task drafts, reload recovery,
  conflict review/rebase, and retained task revision history. Task-specific existing
  smoke verifies evidence/acceptance/archive/restore/setup and synthetic external
  MCP collaboration. Desktop build/type checking pass; reviewed full-page screenshot.
- Broader legacy smoke intermittently fails before Tasks: a bookmarked fixture is
  missing after sidebar collapse/expand (tests/smoke/tasks-desktop.mjs line 67).
  One instrumented run passed that section; the cause is not established. Added an
  explicit --tasks-only mode to qualify this task milestone, not to claim the broad
  browser regression passed. Resolve the bookmark/sidebar issue next.
- Browser spaces and persistent task workspaces remain separate. No bundle built;
  live model and authenticated external-client qualification remain pending.

## 2026-09-19 — Foreground loading and regression diagnosis

- Resolved the previously open bookmark/sidebar report. Event tracing showed that
  the failing run never created a bookmark: the shortcut preceded foreground tab
  activation. The old async waitForFunction condition also accepted a truthy Promise
  before its boolean result. This was not evidence of deleting a saved bookmark.
- Foreground tabs now activate before navigation waits for completion. Slow sites
  can be selected/bookmarked while loading. Completing an open request preserves
  later user selection and live metadata; a closed tab is not resurrected by its
  late response. Explicit background-open behavior remains unchanged.
- Replaced async waitForFunction predicates in the affected desktop journeys with
  test-side awaited runtime polling. Inspected the installed Playwright implementation
  to establish the cause; no arbitrary readiness delay substitutes for a condition.
- Qualified a deliberately unfinished local response: activation and bookmark occur
  before the server finishes; selecting another tab survives response completion.
  Full browser/Library/sidebar/task/evidence/setup/synthetic MCP journey now passes.
  Crash/navigation recovery and task-draft conflict journeys pass with corrected
  polling. Focus/metadata/closed-tab late-response cases have targeted coverage.
  Workspace and desktop builds and desktop type checking pass; no bundle created.

## 2026-09-19 — Portable task receipts

- Tasks exports a fresh runtime receipt as readable Markdown through a native Save
  dialog. It retains task/revision/time, objective, criteria, user reviews and their
  evidence references, provenance, source URL/page/observation identity, stale
  warnings, unresolved actions, run revisions/errors/durations and cost completeness.
- Captured page text is explicitly opt-in. Embedded HTML and Markdown image/link
  syntax from task/evidence text are escaped rather than made active. User acceptance
  remains labeled as such; uncertain actions and unknown cost remain explicit.
- Export refuses a changed task revision instead of mixing the old displayed task
  with a new receipt. Canceled exports report cancellation. File-export IPC requires
  the trusted Aux interface; write errors show a readable destination error.
- Verified real saved task/evidence export, optional captured body and cancellation
  in the development app's task journey. Formatter checks cover stale evidence,
  external claims, unresolved outcomes, earlier runs and active-content escaping;
  UI check verifies changed revision cannot reach Save. Inspected rendered export
  controls. Desktop build/type checking pass. No app bundle or external publication.
- Markdown is a portable review snapshot, not a restorable task/evidence backup or
  independent business-outcome verification. Live-provider qualification remains.

## 2026-09-19 — Supplied Aux identity and task references

- Adopted the user's exact PNG/SVG artwork in the home and empty conversation,
  favicon, development Dock/About icon, and macOS icon asset. Generated icon
  sizes from that artwork; no app bundle, signing, or publication performed.
- Rechecked the actual development shell at 1200×944 with populated pins, spaces,
  folders and tabs. Inspected native window capture over a grayscale backdrop:
  neutral frosted blur is visible, the main surface retains curved left corners,
  and the search focus remains a fine neutral outline. Solid appearance and
  collapse/expand preserve the original navigation structure.
- Task references can be added as URLs, renamed, removed, or opened explicitly;
  current tabs can be attached. Saving a URL does not fetch it or grant access.
  Changes use existing revision checks and require fresh evidence review. Closed
  tabs remain visibly unavailable; removing a reference leaves its tab intact.
- Fixed duplicate resource controls caused by sibling React key collisions.
  Real development-app checks verify persistence through reload, unsafe and
  duplicate URL rejection, explicit navigation, rename/removal and closed tabs.
  Desktop compilation/type checking and focused task-runtime checks passed.
- Next: user's first hands-on development review (`pnpm dev`), followed by
  functional blockers found there. Live model/provider qualification still needs
  a connection configured by the user; no credential-store searches. Optional
  polish, routines, global popup and packaging remain deferred.

## 2026-09-19 — Reliable first development launch

- Dependencies: existing workspace compiler, Vite renderer, Electron runtime and
  supplied public icon assets. Acceptance: actual development launch, visible
  artwork, real navigation, owned-server readiness, shutdown and clear port errors.
- `pnpm dev` now waits for Vite's own ready announcement rather than a fixed delay.
  A startup failure stops before Electron opens; an occupied port cannot silently
  attach the browser to an unrelated server. Renderer termination stops the app.
- Normal Electron development no longer depends on three unrelated fixture servers.
  The specialized engine harness retains its fixtures. Development Dock/About
  resolves the canonical source PNG without needing a prior renderer build.
- Verified the real launcher using an isolated temporary HOME/profile and mock
  keychain: startup, loaded SVG, native page navigation, shutdown, then a second
  launch with the renderer port occupied. Workspace compilation passed through
  that same launch path. No personal data, provider credentials or bundle used.
- First-review guide now documents startup errors and completed reference editing.
  Next remains hands-on review and live-provider qualification with user-configured
  credentials; optional new features and packaging remain deferred.

## 2026-09-19 — Preserve browser organization across restart

- Integrated first-review browser/Library/task/evidence/setup/local MCP journey
  passed. Inspection then found restoreTabs assigned new IDs to tabs, breaking
  the persisted sidebar's ID-based space/folder/order associations.
- Restored tabs now retain their identity while receiving fresh document and
  controller epochs. The driver is initialized beyond the previous document
  epoch; previous captured datasets are invalidated. Network navigation continues
  asynchronously so a slow site does not hold up reopening the remaining tabs.
- Native surfaces restore before runtime readiness. The shell preserves its saved
  layout through the initial partial snapshot and late full-page events, until
  it receives the complete workspace. Shutdown destruction events no longer
  masquerade as user tab closures. Snapshot writes are held during restoration.
- A real development-app close/relaunch check caught and now verifies the fix for
  partial-list reordering: IDs, two spaces, folder membership, custom order and
  selected tab survive, with newer document epochs. Workspace/desktop builds and
  renderer type checking passed. No package or personal profile used.
- Navigation history and unsaved form content are not restored. Full crash/disk
  recovery qualification and live model-provider verification remain roadmap work.
- Final integrated checks also passed after the restart fix: crash/retry/back
  recovery with runtime observation, browser/Library/task/setup/MCP journey, and
  focused stale-evidence, operation-authority and interrupted-run recovery checks.

## 2026-09-19 — First-review handoff gate

- Reconciled the authoritative roadmap's stale packaged-first wording with the
  user's explicit development-app-first instruction. No packaging is required
  for the current review. Added a concise current-state handoff to FIRST-REVIEW.
- The agreed design and known startup/restart blockers have current evidence.
  Further optional features await the user's requested hands-on review; live
  model qualification awaits a user-configured connection. Asked for review
  status, without requesting secrets or searching credential stores.
- Full founder acceptance is not achieved: wider local/cloud work, qualification
  and the user's visual/interaction acceptance remain outstanding.

## 2026-09-19 — First-review minimal shell correction

- Dependencies: existing native view bounds, sidebar data model, menu actions,
  appearance IPC and macOS vibrancy. Acceptance: full-height vertical browsing,
  zero-width collapsed sidebar, accessible restoration, compact utilities,
  neutral native material, preserved horizontal tabs and existing functionality.
- Removed vertical-mode toolbar, consolidated footer to New chat / Agent / More,
  softened pins/fields/selected rows, quieted agent history, and removed blur tuning.
  Native under-window material has no added colored tint; Solid and reduced
  transparency remain supported. This is not an AppKit Liquid Glass integration.
- Full sidebar collapse retains only a 7px edge hit target. Command-S toggles;
  Command-L opens/focuses the address field. Native window buttons follow the
  visible navigation layout; keyboard and native menus remain available.
- Inspected actual development-app native captures at 1200×944: populated glass
  home, full-height local webpage plus agent, collapsed page, and settings.
  Tested zero-width collapse, edge reveal, address focus, Glass/Solid and
  horizontal/vertical switching. Integrated browser/Library/task/setup/MCP passed
  using the new utility menu. Desktop build and renderer typing passed.
- No personal profile, credential lookup, app bundle or external release. Existing
  development process must restart for native material/window-control updates.

## 2026-09-19 — Selected local documents as evidence

- Dependencies: trusted native file picker, existing revisioned tasks, evidence store,
  human review, and Markdown receipts. Acceptance: select/preview/save UTF-8 text,
  Markdown, CSV or JSON; retain exact snapshot across restart; review against a
  criterion; export metadata with opt-in body; reject invalid files/stale revisions.
- Native reader reads only the user-selected regular file, bounded to 512 KB.
  Preview requires explicit saving, keeps file content inert, and never sends it
  to a model. Runtime import is desktop-only, rejects active/archived tasks, and
  computes the saved byte count and SHA-256 itself. No absolute host path is stored.
- Uses existing evidence persistence without a schema migration. New evidence
  invalidates prior acceptance. Snapshots are historical: original edits are not
  watched or reread. Fingerprints establish saved-byte identity, not factual truth.
- Verified real Electron select/preview/save, quit/relaunch after source changes,
  review, receipt exports with/without content, inert markup, malformed UTF-8,
  canceled selection and stale-revision rejection. Inspected actual screenshots:
  release/test-artifacts/aux-document-preview.png and aux-document-evidence.png.
- Workspace/desktop builds, renderer type checking, focused file/evidence/export
  checks, and existing task/setup/synthetic MCP desktop journey passed.
- Scope limits: UTF-8 text formats only; PDF/Office extraction, automatic synthesis,
  richer artifact editing and cloud execution remain roadmap work. No app bundle,
  personal profile, provider request, credential lookup or external release.

## 2026-09-19 — Reliable page search while browsing

- Dependencies: existing Find strip, native page lifecycle, runtime find contract,
  and tab activation. Acceptance: real visible-text counts/highlights, next/previous,
  no-result/empty states, switching tabs/navigation, clean close and zoom coexistence.
- Actual browser verification exposed the inverted Electron new-search flag: the
  old fallback counted hidden/script text. Corrected the flag mapping against
  Electron's webContents documentation and verified actual Chromium match ordinals.
  Removed the obsolete cold-search retry machinery; fallback counts use rendered
  body text and do not pretend to have an active highlighted match.
- Request IDs and per-page cancellation prevent mixed results. Renderer request
  ordering and document identity reject stale responses. Find stays open across
  tab selection, refreshes after native layout/navigation, and cancels delayed
  work on exit. Empty queries clear native selection.
- Real Electron workflow passed visible/hidden text, next/previous, no matches,
  two tabs, navigation, clear/close debounce cancellation, and zoom/reset. Native
  window screenshot inspected at release/test-artifacts/aux-find-page.png.
  Desktop build, renderer typing, focused ordering and tab-recovery checks passed.
- Next: qualify a real model/agent connection supplied or configured by the user;
  continue complete local-development/research workflows, remaining browser
  compatibility cases, and later cloud continuity. Full roadmap remains open.
- Reference: https://www.electronjs.org/docs/latest/api/web-contents#contentsfindinpagetext-options

## 2026-09-19 — Saved task history and earlier receipts

- Dependencies: existing task revisions, per-revision evidence/reviews, task drafts,
  and receipt export. Acceptance: inspect saved objectives/resources/evidence,
  export an earlier receipt, retain the current draft, survive restart/archive,
  and never imply that an earlier review establishes the current task's outcome.
- Added Task history to saved tasks. Earlier definitions and receipts are read-only;
  changing revisions cancels obsolete loads. Current form/draft state stays intact.
  Keyboard focus and scrolling move to the history heading below the sticky header.
- `tasks.receipt` accepts an optional positive revision; unknown revisions fail.
  Existing persistence is reused without a migration. Earlier receipts include runs
  through their selected revision, original recorded reviews and evidence, and the
  current task revision. Freshness is reassessed now; this is not time-travel status.
  Newer revisions do not inherit old evidence or acceptance. Mutation guards remain.
- Exports fetch the requested saved revision and prominently identify earlier
  receipts and their limits. Captured text remains opt-in. MCP uses the same schema.
- Real Electron workflow passed: saved document + human review, revised objective
  and criterion, unsaved draft, old receipt inspection/export, quit/relaunch, draft
  recovery, and archive with earlier evidence preserved. Inspected and corrected
  heading visibility in release/test-artifacts/aux-task-history.png. Existing
  task-review/setup/synthetic MCP journey passed; workspace/desktop builds, renderer
  type checking and focused receipt/revision checks passed.
- No personal profile, provider/credential lookup, bundle, publish or release.
- Next implementation scope: complete local project/development workflows using
  explicit selected resources, plus remaining everyday-browser compatibility gaps.
  Live model qualification requires a user-configured connection but does not
  block independent implementation. Full founder acceptance remains incomplete.
- Continuity audit found RunPanel's generic “Run again” could drop a saved task's
  identity. Task-bound terminal runs now offer “Open saved task” and select the
  exact persisted task/workspace before opening Tasks. Full-page conversations
  use the same path. Generic conversations keep their existing rerun behavior.
- Extended the real desktop journey with a synthetic completed run persisted in
  the isolated database while Aux was stopped: returning through the run panel
  and full conversation selects the correct task despite another remembered
  workspace, preserves the draft, and never creates an unscoped replacement run.
  SQLite setup waits for the runtime's shutdown lock to release. No model called.

## 2026-09-19 — Isolated local projects attached to tasks

- Dependencies: native folder selection, installed Git, existing task resources and
  revision guards. Acceptance: review the selected repository and dirty state,
  create a checkout from the reviewed commit, attach it, inspect external changes,
  survive restart, and preserve original files and index exactly.
- Local projects now provides this complete setup workflow in task resources.
  Selection tokens are single-use; manifests persist setup and recovery state.
  Removal detaches a reference only; it never deletes a checkout. Re-attachment
  uses the same task revision guards as other resources.
- Git uses fixed arguments without a shell, bounded output/time, no credential
  helper/network protocol, and disabled hooks, filesystem monitors and filters.
  Dirty/untracked files are not copied. Submodules and large-file downloads are
  not performed. No dependencies, setup scripts or commands run automatically.
- Canonicalized the project storage root to handle macOS /var symlinks correctly.
  Desktop bundling now reads main/preload source files: previously an incremental
  build could bundle stale output when TypeScript did not re-emit its entrypoint.
- Real Electron workflow passed cancellation, review, creation, task attachment,
  external-change refresh, quit/relaunch, reference removal and re-attachment.
  Original dirty file and Git index were unchanged. Synthetic hostile Git hook,
  filter and filesystem-monitor checks did not execute their marker commands.
  Inspected release/test-artifacts/aux-local-project.png. Desktop build and the
  existing task review/setup/external MCP regression passed.
- Next: approved local commands, file/diff inspection, service lifecycle and browser
  previews remain open parts of G1/G2. This milestone does not claim a development
  agent or terminal is implemented. Live model qualification still requires a
  user-configured connection; independent implementation can continue.
- No real credentials, personal repository, app bundle or external release used.

## 2026-09-19 — Review local project changes in Aux

- Dependencies: saved isolated checkout identity and reviewed baseline commit.
  Acceptance: show actual changes, refresh external edits, reopen after restart,
  leave files/index untouched, and never execute repository diff drivers.
- Inspect checkout now includes a collapsible change review against the original
  reviewed commit. It displays the net tracked diff, including later commits,
  staged and working-tree edits; untracked filenames are listed separately.
  Binary content, ignored files and submodule contents are explicitly excluded.
- The desktop service fixes diff arguments and disables external diff/textconv in
  addition to existing hook/filter/monitor protections. No user-supplied file path
  is accepted. Oversized or unavailable diff output produces a visible limitation
  while retaining working-tree status; it is never presented as no changes.
- Real Electron journey verified rendered additions/deletions, external refresh,
  untracked files, restart and existing attach/detach preservation. Screenshot
  release/test-artifacts/aux-local-project-changes.png inspected. Build, renderer
  typing, hostile-driver checks, baseline-versus-later-commit/staged/working-edit
  comparison, index preservation and bounded-output behavior passed.
- Current review is read-only and refreshed on demand. It is not an immutable
  evidence snapshot, integrated editor or command runner. Those development
  workflow capabilities remain next; the full roadmap remains open.

## 2026-09-19 — Approved local commands and browser previews

- Dependencies: validated saved project checkout, trusted desktop IPC and existing
  native browser tabs. Acceptance: explicit command approval, output/exit status,
  cancellation, bounded execution/logs, restart recovery and real localhost page.
- Commands & preview now accepts a command in the isolated checkout. A native
  dialog shows the exact command/path and execution scope, defaulting to Cancel.
  No command runs on project creation, navigation or restart. One active command
  per checkout; shell input is explicit, stdin closed, timeout ten minutes.
- This is human-approved local execution, not an OS sandbox or model tool. The
  process gets a separate HOME/TMPDIR and a limited environment without inherited
  provider keys or shell startup configuration. It still has ordinary OS access
  to files and network. These limits are visible before execution.
- Persistent command records retain merged stdout/stderr, exit code and outcome;
  latest 128K characters are retained with truncation indicated. Stop uses the
  process group with escalation. Shell exit and normal app quit clean up children.
  Interrupted records never auto-resume. Forced app termination can leave process
  state unknown; the UI states this instead of claiming it stopped the process.
  Output persistence failures stop execution and report the durability failure.
- Manually entered HTTP(S) localhost preview URLs open real Aux tabs; credentials
  and non-loopback hosts are rejected in this control. It does not claim server
  readiness or automatic service discovery. Existing browsing remains unchanged.
- Real Electron journey verified native cancellation (zero command records),
  successful execution/output, Python server startup, actual preview page text,
  stop, and saved successful/canceled records after restart. Inspected the rendered
  command/log view at release/test-artifacts/aux-project-commands.png. Builds,
  renderer typing and focused execution/project checks passed including failure
  exit codes, output limits, timeout, group cleanup and interrupted recovery.
- Records are project-level execution history, not task evidence or acceptance.
  Next: task-linked execution receipts, service/readiness lifecycle, file editing,
  JS/TS qualification, external editor continuity and remaining G1/G2 requirements.
  Cloud execution and real model qualification remain open. No bundle or release.

## 2026-09-19 — Command results as task evidence

- Dependencies: persisted native command identities and existing revisioned task
  evidence/receipts. Acceptance: preview a finished result from an attached project,
  save it to a criterion, preserve provenance/limits, export and reopen it without
  automatically accepting the criterion or carrying it into a newer revision.
- Import command result lists finished commands only from projects attached to
  the current task. The native main process accepts identity selection only and
  retrieves its own record; it rejects caller-supplied command/output payloads.
  The runtime denies external-client import, unattached projects, mismatched IDs,
  active commands, active task runs, archived tasks and outdated task revisions.
- Saved evidence includes command/project IDs, outcome, exit status, truncation,
  observed finish time and a fingerprint of the saved command/output/context.
  UI labels this as a historical result, not current checkout verification.
  Later local edits/commands are not monitored by this snapshot. Successful exit
  never automatically accepts the criterion. No database migration was needed.
- Receipt export includes provenance, outcome and limitations by default; command
  text, working directory and output require Include captured text. Rendered and
  exported content remains inert text. Old revision evidence remains readable.
- Real desktop workflow passed command selection/preview, native payload-forgery
  rejection, persistence across restart and both export modes. Inspected screenshot
  release/test-artifacts/aux-command-evidence.png. Workspace/desktop builds, renderer
  typing and focused evidence/export/read-only receipt checks passed.
- Remaining: task-bound execution authority at launch, current-state verification,
  service readiness/lifecycle, light file editing, JS/TS qualification and broader
  roadmap gates. This milestone provides selected historical evidence, not an
  autonomous development agent or full G1/G2 completion. No bundle or release.

## 2026-09-19 — Edit checkout files and recover drafts

- Dependencies: validated isolated project paths, Git filename inventory, existing
  change review and local command lifecycle. Acceptance: select/edit/save a file,
  review its diff, keep drafts across restart, detect external changes, retain a
  recovery copy and reject paths outside the selected checkout.
- Files provides filename search over tracked/untracked non-ignored files. Nothing
  reads file contents until the user selects one. UTF-8 text up to 256 KB is editable;
  the inventory is bounded to 5,000 files and the visible search to 100 matches.
  File and command panels are mutually exclusive to keep the task surface compact.
- Drafts persist in the Aux profile by project/file and original hash. Reopening
  restores the draft; external changes block normal saving. Reload disk and discard
  draft is explicit. Storage failures are visible rather than silently discarding
  work. The editor preserves uniform CRLF and UTF-8 BOM content.
- Native file access checks the selected Git inventory, canonical checkout/path,
  regular-file type and single link. Traversal, .git metadata, symbolic/hard links,
  binary and oversized files are rejected. Saving rechecks hash/inode immediately
  before atomic rename, preserves mode and retains the pre-save text/fingerprint in
  a private file-history JSON copy outside the checkout. Show recovery copy reveals
  that file in Finder. This handles ordinary external-editor conflicts; it is not
  a cross-process filesystem transaction or hostile-process sandbox.
- Saving and Aux command start are mutually excluded per project. Existing active
  commands must stop before saving. Original source checkout remains untouched.
- Real desktop workflow passed conflict detection without overwriting external
  edits, explicit reload, save, resulting Git diff, unsaved draft after restart,
  and continued command/evidence/export/attachment journeys. Inspected and refined
  release/test-artifacts/aux-project-editor.png (monospace and neutral focus).
  Builds/renderer typing and focused link/path/size/mode/recovery checks passed.
- Limits: existing files only; no creation/deletion, syntax services, merge editor
  or automatic recovery restore UI. Service readiness, JS/TS app qualification,
  task-bound execution and broader G1/G2/cloud/model gates remain open.

## 2026-09-19 — Local preview response checks and saved URLs

- Dependencies: project manifests, approved local commands, native browser tabs.
  Acceptance: bounded loopback probe, useful refusal/HTTP/timeout states, open only
  after a successful response, retained URL and explicitly historical check status.
- Check preview issues a five-second GET from the desktop process without browser
  cookies/authorization, ambient proxies or redirect following. Only HTTP(S)
  localhost/127.0.0.1/::1 URLs without credentials are accepted. Connections pin
  loopback addresses and preserve Host/TLS server identity; HTTPS trust checks stay
  enabled. Headers are sufficient; the response body is not buffered or evaluated.
- A 2xx response enables the Check & open action to open the real browser page.
  Redirects, other HTTP statuses and connection errors remain visible instead of
  claiming success. This proves the URL answered, not process ownership, app health
  or task acceptance. Saved check timestamps are shown as historical, never live.
- The latest URL/result persists on the project and restores when returning to
  Tasks or restarting Aux. Checks do not start/restart servers. Per-project checks
  are serialized; manifest writes now use unique temporary files.
- Real desktop journey passed initial refusal, Python response/open/stop, Node
  JavaScript response/open/stop, named localhost probing, retained URL/history and
  restart. Existing edit/conflict/draft, evidence/export and attachment paths passed.
  Inspected release/test-artifacts/aux-local-preview-readiness.png. Unit checks cover
  redirects without following, HTTP 503, timeout, refusal, credential-free headers
  and URL restrictions. Workspace/desktop builds and renderer typing passed.
- Remains open: full JS/TS framework/dependency workflows, sustained service
  management/ownership, automatic readiness monitoring, task-bound command authority,
  cloud execution and live model qualification. No G1/G2 completion claim or release.

## 2026-09-19 — Local commands retain reviewed task identity

- Dependencies: existing task revision/idle/unresolved-action guards, native command
  approval and persistent command records. Acceptance: stale/detached context cannot
  pass preparation, approval identifies the task, results retain execution revision,
  and a task changed during the dialog does not launch the reviewed command.
- Commands now require a saved task ID and expected revision. Desktop-only runtime
  preparation reuses the existing run guards and requires the selected project to
  be attached. Archived tasks, active agent work and unresolved browser effects
  block preparation. External clients cannot call this preparation route.
- Native approval includes task title/revision, exact command and working directory.
  Preparation runs again after approval and checkout inspection. Saved command
  records retain task ID, revision, title and workspace. The UI labels earlier
  revisions, commands from another task and legacy records without task binding.
- Execution identity carries into saved command evidence and default receipt
  provenance; command/output text stays opt-in. Historical result import can be
  deliberately selected for another criterion; it never changes original identity
  or automatically accepts the new criterion. No persistence migration required.
- This is an authorization snapshot at the final preparation check. Already running
  commands remain bound to that revision; later task edits do not retarget them.
  There is no cross-process task lock or OS sandbox, and local commands are still
  explicit human operations rather than autonomous agent command tools.
- Real desktop journey passed normal bound command/preview flows, preserved IDs
  through restart, stale-context rejection, and task mutation while approval was
  pending: approval returned yes but no command launched. Existing edit/draft,
  evidence/export and attachment flows also passed. Inspected the rendered command
  evidence provenance. Builds, renderer typing and focused task/command/evidence/
  export checks passed including archived, active and unresolved-effect guards.
- Remaining: sustained task/process coordination, complete JS/TS app setup/build
  qualification, editor handoff, autonomous scoped development, cloud continuity
  and live provider qualification. Full roadmap remains active; no bundle/release.

## 2026-09-19 — Persistent local services and TypeScript live editing

- Dependencies: approved task-bound commands, saved logs, checkout editor, loopback
  response checks and native tabs. Acceptance: check/build a TypeScript app, start
  its dev server as a service, edit while running, observe the preview change,
  stop it and preserve mode/outcome after restart.
- A single Keep running as a local service choice removes the command deadline;
  approval explicitly describes this lifetime. Services run until stopped, exited
  or normal Aux quit. They are not detached daemons and never auto-restart.
  Existing records default to ordinary command mode for compatibility.
- The command runner retains bounded output, process-group cleanup, task revision
  binding and explicit approval. Service mode is visible in history and captured
  command text. UI reload restores the active mode and provides Stop service.
- File saves remain blocked during ordinary build/check commands or stopping
  processes. Running services allow edits for watcher-driven development, using
  the same file conflict/recovery protections. Services have ordinary OS access;
  this does not add a sandbox or lock out external writers.
- Real desktop fixture completed a TypeScript check and Vite production build,
  opened the Vite preview, saved a TypeScript edit through Aux, observed the updated
  text in the native browser without restarting the server, then stopped it.
  Service mode/outcome survived restart. Full existing project/draft/evidence/
  export/stale-approval flows passed. Inspected and corrected the service toggle's
  layout in release/test-artifacts/aux-local-service.png. Builds, renderer typing,
  service timeout exclusion/stop/shutdown and evidence checks passed.
- Qualification uses the workspace's already installed TypeScript/Vite toolchain;
  it does not qualify fresh dependency installation, all frameworks or external
  services. Multi-service coordination, editor handoff, autonomous scoped tools,
  cloud continuity and live model qualification remain open. No bundle/release.

## 2026-09-19 — Preview and restore file recovery versions

- Dependencies: isolated project checkout, selected-file editor, retained pre-save
  copies and conflict-checked atomic saves. Acceptance: preview a retained version,
  restore after restart, preserve the replaced contents, protect drafts and reject
  corrupt copies without deleting them.
- Recovery history now lists dated file versions and opens a plain-text preview.
  Fingerprint verification happens before contents are offered for restoration.
  Restoration uses the same guarded save path as ordinary edits, retaining the
  replaced file and preserving mode. Unsaved drafts disable restoration; stale
  disk hashes reject it. Archived task views remain read-only.
- Native desktop verification restored an earlier version after restart, then
  restored the replaced version from the new history entry. A dirty draft blocked
  restoration. Existing TypeScript build/live-preview/edit/stop, command evidence,
  export, task revision approvals and detach/re-attach workflows also passed.
  Inspected release/test-artifacts/aux-file-recovery.png. Desktop build, renderer
  typing and focused corruption/path/conflict/restart checks passed.
- Reads are bounded and reject links; known replacement of the history directory
  is rejected. This is ordinary local file protection, not a hostile-process
  filesystem sandbox. History searches the newest 100 project copies and declines
  enumeration beyond 1,000; all retained files remain on disk. Deleted-file recovery,
  automatic merge, retention management and power-loss guarantees are not provided.
- Next: continue first-review functional gaps and full roadmap qualification.
  Live model/provider qualification still needs a user-configured connection;
  independent local work can continue. Packaging and external release remain deferred.

## 2026-09-19 — Create, edit and retain new project files

- Dependencies: managed checkout identity, Git file inventory, draft editor,
  conflict-safe saves and command/save coordination. Acceptance: create a nested
  text file, edit/save it, see its untracked status, reopen it after restart and
  preserve both the original checkout and other unsaved file drafts.
- New file opens a compact relative-path form inside Files. Creation uses an
  exclusive filesystem open and makes missing folders one at a time. Existing or
  tracked paths, ignored files, Git metadata, traversal, symlinked folders and
  nested Git repositories are rejected. Created files use the normal editor,
  draft persistence, conflict handling and recovery history.
- The native action shares project save coordination: ordinary active/stopping
  commands block creation; running services may watch new files. Archived views
  disable creation. Repository scripts and filters are not run by this action.
- Actual desktop journey created src/components/created.ts, saved content, verified
  untracked status and unchanged original checkout, rejected duplicate/ignored
  paths, retained another file's unsaved draft, and reopened the new file after
  restart. Existing service/build/preview/recovery/evidence flows also passed.
  Inspected release/test-artifacts/aux-create-file.png. Desktop build, renderer
  typing, workspace build and focused project/file/process/preview checks passed.
- Files remain untracked until explicitly staged elsewhere. Failed creation may
  leave empty folders; it does not delete or roll back existing data. Protection
  covers ordinary concurrent creation and known links, not a hostile-process
  filesystem sandbox. File deletion/rename, external editor handoff, autonomous
  development tools and wider roadmap qualification remain open. No bundle/release.

## 2026-09-19 — Review new files alongside checkout changes

- Dependencies: Git untracked inventory and the existing bounded, link-rejecting
  UTF-8 file reader. Acceptance: explicit selected-file preview, no automatic bulk
  content read, snapshot timestamps, refresh invalidation and clear empty/error
  states without stale content masquerading as the newly selected file.
- Review changes now includes selectable untracked files. Large lists have filename
  search and a 100-result display limit. The selected content is plain text, not an
  invented Git patch. It excludes editor drafts and does not stage or modify files.
  Refreshing checkout inspection unmounts the previous snapshot and error state.
- Actual desktop journey verified initial absence of content, selected text,
  external edits leaving the old snapshot unchanged, refresh clearing it, empty
  file display, binary rejection clearing old contents, and a fresh updated read.
  Existing creation/edit/restart/recovery/service/evidence flows also passed.
  Desktop build and renderer typing passed. Inspected the rendered view in
  release/test-artifacts/aux-untracked-review.png. No backend or data-model changes.
- Remaining: external editor handoff, fuller development execution/agent integration,
  cloud continuity and full founder qualification. Live model checks still need a
  user-configured connection. No packaging, credential discovery or external release.

## 2026-09-19 — Choose and retain the download destination

- Dependencies: native download lifecycle and Downloads shelf. Acceptance: native
  selection/cancel, persisted choice after restart, active downloads retaining their
  original path, exact completed bytes, unavailable-folder feedback and reset.
- Downloads has one folder row with Change folder and, when needed, Use default.
  Selection writes a private atomic preference separately from runtime settings.
  Existing downloads never move. Missing/unwritable or replaced selected folders
  interrupt new downloads instead of silently using another location. Corrupt
  preferences require explicit recovery; the original preference is not read as
  a fallback path. Reset returns to the existing private downloads folder.
- Native download names now remain readable, with numbered collision suffixes.
  In-process reservations include case/Unicode normalization and existing entries
  are checked before selection. This avoids known duplicates, not arbitrary hostile
  external writes racing Chromium's eventual file open. Very long names are bounded.
- Real desktop verification passed cancellation, changing folders while paused,
  old destination stability on completion, saved selection after app restart,
  exact bytes at the new destination, removed-folder interruption, default reset,
  pause/resume/cancel and missing-file Open feedback. Inspected
  release/test-artifacts/aux-download-folder.png. Native build/renderer typing and
  focused damaged-preference/replaced-folder/duplicate-name checks passed.
- Cross-restart transfer resume remains unsupported; retry from the source page.
  No files were moved or deleted outside isolated test fixtures. Full roadmap and
  live provider qualification remain open. No bundle, publishing or release.

## 2026-09-19 — Retry saved downloads after restart

- Dependencies: durable download history, native browser session, destination
  selection and shell-only IPC. Acceptance: retain a supported source URL, reopen
  after app restart, explicitly retry as a new transfer, retain the cancelled
  record and recover from an unavailable destination after selecting a valid one.
- Native HTTP(S) source URLs are retained with download records in the existing KV
  store; no table migration. Existing records without a source remain compatible.
  The Retry handler resolves the saved record by ID rather than accepting a URL
  from the renderer, rejects active/completed/unsupported records, and uses the
  browser session for a new download. The UI marks the request and keeps old records.
- URL userinfo, non-HTTP(S) schemes, invalid and oversized URLs are not retained for
  retry. Saved URLs are local browsing data and may contain expiring query tokens.
  Retry issues a new GET; it does not replay form bodies, partial bytes, or prior
  request headers. Blob downloads and form-generated/expired links may require
  the original page. Cross-restart partial-transfer resume remains unimplemented.
- Real desktop check retried a cancelled transfer after restart into the persisted
  chosen folder, verified exact bytes/source and retained cancellation, then retried
  an unavailable-folder failure after resetting the destination. Existing download
  pause/resume/cancel/missing-file flows passed. Inspected the rendered retry shelf
  in release/test-artifacts/aux-download-retry.png and corrected its recovery text.
  Workspace/desktop builds, renderer typing, source validation and persisted-history
  checks passed. Full goal remains active; no app bundle or external release.

## 2026-09-19 — Native tab audio controls

- Dependencies: native WebContents identity, existing tab layouts and shell event
  bridge. Acceptance: reflect actual audible/muted state, mute one background tab
  without switching selection, keyboard operation, reload resynchronization,
  navigation continuity, both tab layouts and closed-tab rejection.
- Native audio events and a startup snapshot feed a small per-tab shell state map.
  Snapshot merging respects newer events and destruction removes stale entries.
  Speaker controls use the existing icon family and sizes; the tab menu and native
  webpage menu also support muting silent tabs. Shell-only native IPC validates the
  exact page and boolean; engine-paint views do not advertise audio support.
- Real desktop fixture verified a very low-volume WebAudio tone, audible indicator,
  exact native mute state, unrelated tab remaining unmuted, background selection,
  Space activation, shell reload, silent-tab menu, horizontal layout, navigation
  preserving mute, and rejection after tab close. Silent-output fixtures were
  unsuitable for audible-indicator qualification because Chromium correctly reports
  them as inaudible. Inspected aux-tab-audio-vertical.png and
  aux-tab-audio-horizontal.png in release/test-artifacts. Build/renderer typing pass.
- This is current-tab audio control, not persisted site muting or a media/DRM/
  conferencing qualification. Mute resets when the native view is recreated or Aux
  quits. Wider roadmap remains active; no bundle, release or credential access.

## 2026-09-19 — Execution strategy consolidated at the user's request

- Replaced control-sized delivery milestones with substantial delivery phases in the
  authoritative roadmap, ordered by impact on a usable Aux browser.
- Preserved every A–L requirement, the full evaluation/fault gates and M0–M11
  traceability. Existing verified pieces do not imply complete phase acceptance.
- Phase 1 is active. Keyboard-tab investigation is a task within it; no new keyboard
  implementation was started before this planning correction. Later-phase work must
  serve a concrete dependency or a real external-input block, not easier progress.
- Each phase now states a user outcome, coordinated remaining scope, dependencies,
  exit evidence and requirement ownership. Reports should use these phase outcomes
  and blockers; old “milestone” headings below/above are historical checkpoints.
- First hands-on review stays early. The no-bundle/no-release and no-credential-store
  instructions remain in force. Phases 1–4 now end in a private development handoff;
  founder acceptance, packaging and later refinements are not current completion gates.

## 2026-09-20 — Read-only operations health and additional local toolchains

- Dependencies: existing encrypted desktop secret storage, task/repository revision
  authority, attached-project UI and reviewed command runner. Acceptance: explicit
  connect/revoke, account/project selection, useful task-level health and guided
  non-JavaScript environments without enabling remote mutations.
- Connections now supports separately supplied Vercel and Sentry tokens. Tokens are
  stored through native OS encryption and are only sent to each service's fixed
  HTTPS API host; they are never returned to the renderer. Vercel exposes account,
  team and project selection. Sentry exposes organization and project selection.
  Disconnect removes the saved token and stale probe data.
- Attached development tasks can run one read-only operations check that reports the
  selected Vercel project's recent deployment state and the selected Sentry project's
  recent unresolved issues. Task and revision access is checked before and after the
  remote reads. Incident snapshots also preserve the bounded deployment summary and
  up to ten issue summaries beside local changes, commands and browser diagnostics.
  The MCP surface has the same scoped read path. No deploy, promotion,
  rollback, issue assignment/resolution/deletion, push or pull request is available.
- Project inspection now recognizes root Rust/Cargo and Go module environments.
  It offers exact check, test and build commands and a service command only when a
  runnable binary/main package is detected. Inspection reads bounded regular files
  and never executes repository code; every command still requires native review.
- Contracts, runtime, desktop and MCP bridge build together, and the integrated diff
  passes whitespace validation. Live account qualification remains pending because
  no credentials were supplied or searched. No app bundle, publishing or release.

## 2026-09-20 — Delivery readiness and first Vercel Sandbox lifecycle

- Dependencies: selected GitHub/Vercel projects, encrypted Vercel credential storage,
  attached task repositories and the existing task-revision authority boundary.
  Acceptance: richer read-only remote delivery evidence plus an explicit, durable
  cloud lifecycle that cannot be triggered by an external agent.
- GitHub repository checks now combine classic commit status, GitHub check runs and
  existing open pull requests for the checkout branch. The attached-project view can
  open the existing PR, and local handoffs/incident snapshots record the bounded
  results. Handoffs identify when the saved GitHub result predates the current HEAD.
  These calls remain read-only; Aux still does not push or create a pull request.
- Added the official `@vercel/sandbox` SDK and durable task-bound cloud environment
  records. From an attached project, the user can explicitly create a 15-minute
  persistent Node or Python environment, open its protected browser preview, run an exact
  executable with newline-separated arguments, stop and checkpoint it, inspect
  CPU/network use, resume it through another command, and permanently delete it and
  orphan snapshots. A billing acknowledgement precedes creation and deletion has a
  destructive confirmation.
- Source transfer is now an explicit bounded action: Aux uploads at most 500 UTF-8
  project files and 8 MB into `/vercel/sandbox`, reports skipped files, and never
  copies host environment variables. The cloud panel can reconcile provider state
  after an Aux restart, browse up to 500 regular files per remote directory, and
  open text files up to 256 KB. Paths remain inside the remote workspace and
  symbolic-link file reads are rejected.
- Cloud command records are durable and bounded. Aux preserves the exact executable,
  arguments, outcome, timing and capped output across restarts, and exposes the same
  read-only history to a scoped external agent. The command itself still requires
  an explicit Aux UI action and uses no shell string.
- The same reviewed executable and argument form can start a detached 15-minute
  service. Aux saves Vercel's command identity before returning, so the service can
  keep running while the desktop request is gone. After restart, Refresh logs
  reconnects to that exact provider command, updates its terminal state and retains
  bounded stdout/stderr; Stop service sends SIGTERM to that command. No shell,
  arbitrary environment map or credential forwarding is introduced.
- Provider refresh also records the environment's cumulative CPU and network totals,
  while every session remains time-bounded and retained snapshots expire after seven
  days. A reviewed remote text file can be saved back through Aux's native Save dialog,
  keeping an explicit local artifact outside disposable compute.
- Environment creation now makes the compute location and 15/30/45-minute maximum
  session duration explicit before billing acknowledgement. The saved environment
  retains that limit beside its provider expiry and cumulative CPU/network use.
  The user can export the remote workspace as a bounded compressed archive through a
  native Save dialog. Export excludes `.git`, `node_modules` and Aux's preview helper,
  rejects archives above 100 MB, denies external agents, cleans both the remote
  temporary archive and the protected local handoff, and records only export time and
  size in the durable environment record.
- A stopped checkpoint now has an explicit Resume action. Aux resumes the named
  sandbox through a bounded no-op command, refreshes its session expiry and preview
  route, and leaves source and command history attached to the same task record.
- Cloud environments now support a real interactive terminal. Opening it requires
  an explicit action in the attached task and rechecks the task revision/project
  authority. The runtime keeps the saved Vercel access token private, requests an
  ephemeral provider PTY token, and passes that token only to a lazily loaded xterm
  client in renderer memory. The client speaks Vercel's binary input/output and
  resize protocol, starts Bash in `/vercel/sandbox`, reconnects stopped persistent
  environments, and closes the WebSocket when the panel unmounts. External agents
  cannot request a terminal. No PTY URL/token is saved in Aux data or command history.
- New cloud environments begin without a publicly exposed application port. Opening
  a preview starts an Aux-owned proxy inside the sandbox, rotates a 256-bit secret,
  replaces the sandbox's public routes with only that proxy and opens the result as a
  normal Aux tab. The desktop adds the secret through an origin-scoped request header
  for documents, assets, API calls and WebSocket upgrades, while the proxy strips it
  before forwarding to the user's service. The secret stays in runtime/desktop memory
  and is never written to the address bar, browser history, task records or command
  history. External agents and private windows cannot create or register preview sessions.
- Cloud environments bind the originating task revision and attached project. All
  mutating methods recheck current task/project authority and reject external API or
  MCP callers; scoped external agents can only list their task's durable environments.
  Aux passes only the explicitly saved Vercel token/team/project to the SDK and sends
  no browser cookies, model keys, host environment, or repository files automatically.
- Contracts, runtime, desktop renderer and MCP bridge build together; whitespace
  validation passes. No live sandbox or detached service was created, billed, stopped or deleted because
  no credentials were supplied. Larger/binary workspace transfer, remote browser takeover,
  live provider qualification of protected previews, desktop-independent
  orchestration, cost budgets and orphan cleanup remain Phase 4 work. No app bundle,
  publishing or release.

## 2026-09-20 — Cloud account reconciliation and guarded orphan cleanup

- Dependencies: the existing encrypted Vercel connection, task-bound environment
  records and provider tags applied at environment creation. Acceptance: show every
  Aux-created sandbox visible to the connected account, distinguish durable records
  from true orphans, and delete only an explicitly confirmed unchanged orphan.
- The attached-project cloud panel can now request a fresh provider inventory. Aux
  lists only resources carrying its `product=aux` tag and `aux-` name prefix, caps the
  result at 200, and labels each sandbox as attached to a local task or orphaned from
  this Aux installation. Provider status, creation/update times, runtime, region,
  configured duration and resource shape are reported without saving a second copy.
- Cleanup is deliberately narrow and destructive. The renderer names the sandbox and
  snapshots in its confirmation; the runtime rejects external agents, refuses any
  sandbox referenced by a non-deleted local record, requires the exact provider update
  timestamp from the inventory, rechecks the Aux tag and exact name, then deletes the
  sandbox and orphan snapshots. A changed or disappeared resource requires refresh.
- Aux now applies fixed safeguards without adding another settings surface: at most
  three active Aux sandboxes in the connected account, two retained environments per
  task, 45 minutes per provider session, 90 lifetime CPU minutes and 1 GB lifetime
  egress before a stopped environment can no longer resume. Inventory shows the policy
  and current active count. Creation checks the account before allocating compute;
  resume checks fresh provider lifetime totals and persists the exact refusal reason.
- Reconciliation also handles the inverse orphan case. If a durable local record is
  absent from a complete tagged provider listing, the panel marks it missing. Removing
  that stale record requires an explicit confirmation, the exact saved update time,
  task/project authority and a second provider absence check. This prevents external
  deletion from permanently consuming the task's retained-environment allowance.
- Contracts, runtime and desktop compile together. Live provider inventory and deletion
  were not exercised because no credential was supplied or searched, and no billable
  resource was created. Scheduled expiry cleanup, provider currency limits, remote browser
  takeover and desktop-independent orchestration remain Phase 4 work. No app bundle,
  publishing or release.

## 2026-09-20 — Guided Ruby, JVM, PHP and container projects

- Dependencies: bounded root-manifest inspection and the existing reviewed local
  command/service/preview lifecycle. Acceptance: useful conservative workflows for
  four previously manual ecosystems without importing or executing project code.
- Ruby projects now offer Bundler setup, Rake/RSpec checks when matching root markers
  exist, and Rails or Rack services only when their regular entry files are present.
  Maven and Gradle projects use checked-in wrappers when available, load test/build
  commands, and expose Spring Boot services only when the bounded build manifest
  declares the plugin.
- Composer projects offer dependency setup, declared test scripts or PHPUnit, and a
  local PHP server only when an index entry point exists. Dockerfile and Compose
  projects expose reviewed image-build, configuration-check and foreground service
  commands. Aux never runs these during detection; every action still uses the native
  reviewed command boundary and durable output/recovery path.
- Runtime availability is checked from Aux's fixed command search path and shown before
  use. Missing Bundler, Maven/Gradle, Composer/PHP or Docker disables the corresponding
  suggestion instead of pretending it ran. Bounded manifest behavior, the full desktop
  renderer typecheck, integrated desktop build and whitespace validation pass.

## 2026-09-20 — Revision-pinned cloud coordinator authority

- Dependencies: revision-pinned source upload, persistent task/environment records,
  task mutation gates and lease-validated result manifests. Acceptance: one explicit
  sandbox owns one exact task revision, conflicting local work is fenced, stale
  coordinators cannot submit results, and stopping or deleting returns local control.
- A synced running sandbox now has an explicit **Hand off task** action. It rewrites
  `.aux/task.json` with a durable UUID authority lease, the exact task revision and
  source tree, plus a result contract that requires the same lease in
  `.aux/result.json`. Aux rejects a result whose task, revision, tree or lease differs.
- While that lease is active, Aux blocks local runs, task definition changes, human
  evidence decisions and local project writes. Only the owning environment can issue
  cloud mutations; a second environment cannot operate on the revision, and a synced
  environment cannot start commands, services, previews, terminal sessions or exports
  until it receives an explicit handoff. Read-only
  task/project inspection stays available. The cloud panel shows the owner and lease,
  disables source replacement, and clearly identifies the action that returns control.
- The worker result contract has a bounded, nonsecret `localRequest` for browser,
  credential, approval, file or question dependencies. A `needs_input` result must
  explain that request. Aux retains it on the environment record, shows it after
  reconnect, and offers one checkpoint-and-continue-locally action that returns task
  authority without pretending the remote worker can access the local signed-in browser.
  Resuming later requires another explicit handoff and receives a new lease.
- Parent tasks now expose their bounded descendant tree in the main task view. Each
  child shows its own current run state, stale-revision signal and cloud ownership,
  and opens into its independent resources, evidence and history. Child tasks still
  inherit no repository, page, file or credential authority from the parent.
- Project mutation authority is now exclusive across tasks, including sibling and
  unrelated roots that explicitly reference the same managed checkout. A cloud lease
  on that project blocks local runs, commands, commits and file writes from every
  other task; an active local task run blocks another task from starting against the
  same checkout. Read-only inspection remains available. The owning cloud environment
  can continue its approved commands, while competing environments and task trees fail
  before dispatch. This closes a data-integrity race that task-only fencing left open.
- Worker results are now preserved independently from acceptance claims. A completed,
  failed or `needs_input` result keeps its exact manifest, bounded local request and
  verified artifact bytes in the task receipt before the sandbox is stopped or
  deleted. Preservation is idempotent for the exact environment and result timestamp;
  criterion claims remain a separate import that still requires desktop review.
  This prevents an honest handoff with no claim from losing its diagnostics simply
  because it cannot yet satisfy a criterion.
- Parent and child task lifecycle now remains coherent. A parent cannot be archived
  while any descendant is open, and an archived child cannot be restored beneath an
  archived ancestor. Each task still keeps independent revisions, evidence and cloud
  authority; the guard prevents hidden active work inside an archived task tree.
- Parent receipts now aggregate every descendant task outcome. Active or uncertain
  child work takes precedence, rejected child work prevents a successful parent
  outcome, and a parent can be accepted only when its own criteria and every child
  receipt are accepted. The receipt UI and Markdown export retain each descendant's
  revision, hierarchy depth, archive state and cloud coordinator, so a coordination
  plan cannot look complete while delegated work is merely hidden elsewhere.
  An active cloud authority lease now counts as in-progress work even when no local
  run exists, preventing both the child and every ancestor receipt from appearing
  accepted while a remote coordinator can still change the checkout.
  Each descendant also contributes its own model-call count, known cost and cost
  completeness to a separate coordinated total. The parent’s direct usage remains
  visible, avoiding both hidden delegated cost and misleading attribution to the
  parent task itself.
- Tasks with unresolved browser actions or connected write outcomes can no longer be
  archived. The user must attach current evidence and reconcile what happened first;
  child lifecycle rules then prevent a parent archive from concealing the unresolved
  descendant. This applies to old revisions as well as the current run.
- A repository attachment now remains authoritative while its task retains any live,
  stopped, failed or checkpointed cloud environment. Aux refuses to detach that
  project until the environment is deleted or its missing provider record is
  reconciled, preserving the scoped path needed to inspect, export, stop and clean up
  the resource. Deleted records no longer constrain later task revisions.
- The Vercel connection and selected team/project remain fixed while Aux retains any
  non-deleted sandbox record. Disconnect and scope changes are refused until those
  environments are deleted or reconciled, preventing a billable resource from being
  orphaned from its cleanup authority. A replacement token remains allowed so a
  revoked credential can be recovered without weakening the fence.
- Stop/checkpoint, provider-confirmed stop, deletion, scheduled cleanup and guarded
  removal of a missing provider record return authority to Aux. Provider refresh
  failures remain fail-closed because Aux cannot prove that the remote coordinator
  stopped. Resuming a stopped environment does not silently reacquire authority; a
  fresh explicit handoff is required.
- Retention cleanup is now two-stage for an environment that still owns its task.
  At the deadline Aux first stops and checkpoints the sandbox, returns task authority
  locally and retains the checkpoint for a 24-hour result-recovery window. Only a
  later cleanup pass may delete the locally owned checkpoint. If provider stop cannot
  be confirmed, cleanup remains failed and cloud authority stays fenced. This prevents
  unattended result/artifact loss at the same instant that a worker lease expires.
- Contracts, runtime and desktop build together; the focused evidence/handler/MCP
  checks pass with a coordinator regression covering local run/edit/project/review
  rejection, matching-environment access, competing-environment rejection and local
  authority restoration. Live provider behavior remains unqualified until the user
  supplies a Vercel account; no credentials were searched, no paid resource was
  created, and no bundle or release was produced.
- The source development app was restarted through its normal shutdown path so the
  running main/runtime processes use the new authority API. Its renderer was reached
  over the development CDP endpoint, reported the Aux shell and saved home content,
  and rendered without a startup error. The actual 2880×1920 light-mode shell capture
  is retained as `vector-ui-screenshots/aux-source-build-2026-09-20.png`; the neutral
  search focus, rounded main surface, original space/folder/sidebar structure and
  recent-task composition are visible. This is source-build evidence, not an app bundle.

## 2026-09-20 — GitHub issue-to-task intake

- Dependencies: the existing encrypted GitHub connection, a selected managed
  checkout and task/project revision authority. Acceptance: inspect bounded open
  issues for that exact repository, attach one explicitly to the task, expose the
  same read-only result to scoped agents and retain issue identity in delivery
  evidence without enabling a remote write.
- **Check GitHub** now includes up to 20 recently updated open issues, excluding pull
  requests returned by GitHub's shared issues endpoint. Aux retains the issue number,
  title, URL, author, labels, update time and at most 8,000 characters of body text.
  Repository responses are capped at 2 MB even when GitHub omits Content-Length.
  Full bounded bodies are returned only by the live explicit check. The durable local
  project record retains issue identity, labels and timestamps with bodies removed,
  so disconnecting GitHub does not leave a cache of private issue descriptions in the
  checkout metadata.
- The attached-project view can open an issue in the real browser or add its URL and
  identity to the current saved task. Attachment creates a normal revision-checked
  task resource; it does not inherit GitHub token authority or mark any criterion
  complete. Scoped MCP clients receive the same status response and cannot expand
  repository access.
- Local incident and delivery summaries record the bounded recent issue list beside
  commit/check/PR state. No issue was edited, assigned or closed, no branch was pushed,
  and no pull request was created. Live account qualification still requires the
  user-configured GitHub connection; no credential store was searched.

## 2026-09-20 — Deployment and incident intake

- Dependencies: an attached managed checkout, the existing read-only Vercel/Sentry
  connection health path and current task revision authority. Acceptance: turn the
  latest deployment or an unresolved incident into explicit task context, while
  preserving the separation between a URL reference and service credential authority.
- **Check operations** now presents the latest Vercel deployment and up to ten recent
  unresolved Sentry issues as actionable records. Each can open in a real Aux browser
  tab or be attached to the saved task with its bounded identity and canonical URL.
  Duplicate references are recognized, archived or full tasks refuse attachment, and
  the normal revision-checked task update remains the only mutation boundary.
- A deployment or incident attachment does not expose the Vercel/Sentry token, enable
  provider writes, assert root cause or satisfy a criterion. The existing incident
  snapshot and delivery handoff retain the dated read-only health summary, allowing a
  saved issue reference to lead into diagnostics, a prepared fix and review without
  claiming that a production action occurred. Live service behavior remains
  unqualified until the user configures those connections; no credential was searched.

## 2026-09-20 — Cloud-to-local browser handoff

- Dependencies: a revision-matched worker result, explicit cloud coordinator lease
  and a resource already attached to that task revision. Acceptance: a worker can stop
  honestly for local browser access, the user can reach the exact saved context, and
  no new browser or credential authority is silently granted to the sandbox.
- A `needs_input` worker result that names an attached page or URL now shows the saved
  resource label and opens that exact local Aux tab or canonical URL. Missing tabs,
  detached resources, non-web resources and stale resource IDs fail visibly instead
  of opening an inferred page. The worker contract and runtime reject any requested
  resource ID outside the current task revision before the result can be preserved or
  imported.
- Opening local browser context does not return project authority to Aux or share the
  signed-in profile with Vercel. **Checkpoint & continue locally** still preserves the
  result, stops the environment and explicitly returns authority; resuming remote work
  still requires another upload-compatible handoff and a fresh lease. This completes
  the local-browser dependency loop without claiming a general remote browser.

## 2026-09-20 — Retention-safe cloud result preservation

- Dependencies: the existing scheduled cleanup, revision/lease-validated result
  contract, bounded artifact staging and durable task artifact store. Acceptance:
  retention may stop costly compute on schedule, but it must not delete the only copy
  of a worker result or declared artifact while preservation is unresolved.
- When a cloud-owned environment reaches retention, Aux now checks for a validated
  worker result before stopping it. Any result manifest and declared artifacts are
  copied into durable task storage through the same strict preservation path used by
  the explicit UI. The environment records whether a result was preserved, no result
  existed at checkpoint time, or preservation failed; the cloud panel exposes that
  state rather than implying the checkpoint alone protected task evidence.
- Cleanup still checkpoints and returns authority locally even when preservation
  fails, containing compute cost while retaining the sandbox for the 24-hour recovery
  window. Before the later destructive delete, Aux retries any unresolved
  preservation. A failed retry leaves the stopped checkpoint intact and schedules
  another cleanup attempt instead of discarding evidence. Exact task revision,
  criterion, resource and artifact validation still applies.

## 2026-09-20 — Whole-window unsaved-work gate requalified

- The current source tree already contained the coordinated native preflight for
  whole-window close and application Quit; the older “current state” paragraph that
  still described this as missing was historical and stale. The current first-review
  guide already reflects the implemented behavior.
- Fresh isolated native journeys passed for both entry points. Choosing **Stay** on
  any dirty page preserves every live tab, unsaved value, ordering and selection,
  including pages whose warnings were approved earlier in the same attempt. Unanimous
  **Leave** exits. Recovery state is committed only after the agreement succeeds.
- Crash recovery still restores URLs and saved organization rather than unsaved DOM
  form values. The all-or-nothing adapter remains pinned to Electron 43.6.0 and must
  fail closed and be requalified when that runtime changes.

## 2026-09-20 — Blank app-to-project workflow

- Dependencies: the existing saved-task resource boundary and managed project file,
  command, preview, recovery and review systems. Acceptance: begin a bounded app from
  an empty local baseline without requiring an existing repository, inheriting Git
  identity or introducing a second project execution path.
- Saved tasks now offer **New blank project** beside repository selection. Aux creates
  an empty private Git repository under its managed-project root, assigns a unique
  `codex/aux-*` branch and records a fixed empty baseline commit made by `Aux
  <aux@localhost>`. It neither reads global Git configuration nor creates a remote,
  runs hooks, installs dependencies, executes code or touches another checkout.
- The project is attached through the normal revision-checked task resource update.
  Its first files are created through the existing conflict-safe editor and then use
  the same environment detection, reviewed commands/services, linked preview,
  external-editor continuity, recovery history, portable patch, delivery manifest
  and exact local-commit boundary as imported repositories. Invalid project names
  are rejected and interrupted setup retains its partial directory for recovery.

## 2026-09-20 — Local model connection without a credential

- Dependencies: the existing OpenAI-compatible provider, validated endpoint policy,
  provider-scoped model profiles and connection probe. Acceptance: a local Ollama,
  LM Studio or equivalent endpoint can power Aux without inventing a credential,
  while any nonlocal endpoint remains credential-gated.
- Aux now treats validated `localhost`, `127.0.0.1` and `::1` compatible endpoints as
  configured when a planner model is saved. Settings explains that a key is optional
  for those endpoints, discovers model IDs from their bounded OpenAI-compatible
  `/models` response, and enables the existing live connection test. The runtime uses
  a fixed nonsecret placeholder header because OpenAI-compatible clients require a
  value; it is not stored and grants no authority.
- Remote compatible endpoints still require HTTPS and a provider key from the encrypted
  desktop store or process environment. Endpoint URLs still reject embedded credentials,
  queries and fragments. A live local model was not running during this qualification,
  so the final network probe remains a first-review action once the user starts one.
- Vercel and Sentry response parsing now enforces the two-megabyte limit on the actual
  received body as well as `Content-Length`, then rejects invalid JSON explicitly. This
  keeps read-only connection checks bounded even when a service omits a size header.

## 2026-09-20 — Cargo and Go monorepo development workflow

- Dependencies: the existing manifest-only environment inspector, Git change snapshot,
  reviewed command runner, task revision authority and local preview/review workflow.
  Acceptance: a multi-crate or multi-module checkout yields useful bounded commands
  without executing repository code, following symlinks outside the checkout or
  silently running every package when a narrower affected set is known.
- Cargo workspace member patterns are read from the bounded root `Cargo.toml`, resolved
  to at most 50 in-checkout member manifests and compared with the current change set.
  Aux shows member crates and loads per-package checks for directly affected crates.
  Root Cargo configuration changes mark every detected member affected. Commands use
  `--locked` only when `Cargo.lock` exists, so new and intentionally unlocked projects
  no longer receive a guaranteed-failing default.
- Go workspaces now read bounded `go.work` use entries, retain only in-checkout modules
  with regular `go.mod` files and produce module-scoped test/vet/build commands. The
  affected action targets changed modules, while root workspace configuration changes
  mark all detected modules. This fixes the invalid `go test ./...` default at a
  workspace-only root.
- Suggestions remain inert text until loaded into the existing command review. Native
  confirmation, task/revision binding, clean environment, output bounds, cancellation,
  restart history, preview diagnostics and delivery review remain unchanged.

## 2026-09-20 — Task, development and cloud CLI parity

- Dependencies: the runtime's validated method schemas, loopback bearer boundary,
  saved-task revision checks and the existing MCP development/cloud tools. Acceptance:
  a local operator can inspect and continue the supported task lifecycle from
  `auxctl` without knowing private RPC method names or bypassing desktop approval.
- `auxctl workspace` and `auxctl task` now cover listing and creating workspaces,
  listing/getting/creating/updating/archiving/restoring saved tasks, reading receipts
  and starting the built-in agent on explicitly named page IDs. Structured task
  definitions and patches accept inline JSON or `@file`, preserving the runtime's
  criteria/resource/revision validation.
- `auxctl dev` now exposes attached projects, environment/diff inspection, bounded
  file and command reads, GitHub/operations status and durable review generation.
  `auxctl cloud` exposes task-owned environment, command, directory/file and detached
  result reads. The CLI does not add remote push, deployment, cloud creation/deletion,
  evidence acceptance or secret access commands.
- Both CLI and MCP builds pass, and the running Aux runtime returned live workspace and
  task listings through the new commands. Mutation and native confirmation behavior
  remains owned by the same runtime handlers and exact method schemas.
