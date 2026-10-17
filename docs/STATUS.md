# Aux status — October 17, 2026

Full Aside parity and browser readiness remain active and incomplete on local
`main`. [ROADMAP](ROADMAP.md) records owner decisions; the active R1–R6 work is in
[the execution graph](ROADMAP-EXECUTION-GRAPH.md). Detailed earlier evidence and
retired preview handles are in [historical status](STATUS-HISTORY-2026-10-17.md).
Older entries there are not current operating instructions.

## Current build ownership

No accepted product preview is running. The last native product candidate is
`c366c7dc8` (Chromium154, areas through0057); its disposable launcher retired
normally. Area0058's redirect correction and area0059's compact Quick Ask still
need native compilation and changed-flow acceptance.

The Chromium155 migration is building in the isolated
`aux-readiness-chromium` web worktree at frozen `0f7d9bc1b`, branch
`codex/chromium-155-security`. Source is
`/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src`, official
155.0.8059.85 / `0e66b94549a8bd85f03fbdf189b752d6e7b63c32`, with58native areas.
GN generated36,045targets; the cold build is still active under original owner
90979, log `/tmp/aux-chromium-155-native-generated.log`. Do not start another
native builder or clear its plain lock. That worktree intentionally predates the
new provider and compact-surface commits. Accept the migration before merging its
pin/rebased patches into local main, then stage the later source and area0059.
The current main/product pin remains154 until migration evidence is ready.

Native UI control currently reports `Sky Computer Use native pipe startup failed`,
including after resetting its session. No current live Aside or Aux visual check
is claimed. CUA bindings from retired previews must not be reused: a stale binding
can launch the default Profile. Check the owned app PID and disposable Profile
argument before creating a new binding. Only disposable Profiles are authorized.

## Model-based Memory extraction — integrated source

The production sentence splitter is replaced by a budget-admitted structured
request on the selected connection's fast route. It selects at most20exact quotes
from32,000report characters, without tools. Original source eligibility and the
review inbox remain; source-run tokens/costs are never reused as extraction usage.
The operation records its own model invoices, input/output/cache usage, known or
estimated cost, duration and safe failure codes. History shows proposed notes and
an original-control retry for failures. Completed sources retain watermarks;
failed requests can retry without duplicating successful notes.

Per-Space queues preserve simultaneous completions. Source content/eligibility,
policy, model generation and operation lease are checked before dispatch and at
the actual encrypted publication point. Pause/shutdown cancel uncommitted work
while joining native key writes. Forget all cancels/joins active and queued
sources and records their retirement so a later extraction cannot revive them.
Activity remains encrypted and follows recovery and Forget. Retired direct model
transports now mark their pre-network refusal as undispatched for budget accounting.

Integrated `npm run check` passed typecheck, lint and4,719tests/754files in126.16s
(`/tmp/aux-model-memory-integrated-check.log`). The final queue refinement passed
runtime rebuild and38focused tests in2.43s; Forget retirement passed rebuild and
54focused tests in2.51s (`/tmp/aux-model-memory-forget-tests.log`). Extraction/UI
metadata and original Settings controls passed39tests in2.24s. The RPC result
declaration is split into typed domains to avoid TypeScript's oversized-inference
limit while preserving validators. No unchanged full suite was repeated.

Real-provider extraction and native populated/error/light/narrow comparison remain
pending. USER/TAXONOMY/site/routine document authority, actual file diffs and Dream
remain open; proposed-note disclosures are not file-change receipts.

## Compact Quick Ask and recent downloads — integrated source

Quick Ask uses the same conversation/draft owner with a92px draft floor, real
context menu and Send, and an Open in Aux action that preserves the draft. The
full header/transcript and ordinary task controls return for submitted or error
states. Text, attachments and offline notices participate in native sizing.
Area0059 updates both native validation and sizing, hides native traffic controls
for compact drafts, and preserves normal transcript controls. It reverse-applies
on product154 and applies cleanly to155; the active155 source has not been mutated.

Both browser layouts now expose recent downloads from the shared toolbar when
items exist. The anchored glass popup reuses the native snapshot, open/reveal,
pause/resume/cancel, retry and error paths; Full Download History opens the existing
complete view. It retains file failures and works with the runtime unavailable.
The popup lists20recent items with shared typography, spacing, borders and popup
material. Matched native geometry, platform file icons and automatic-open behavior
remain comparison work; no full popup-parity claim follows from source tests.

Integrated `npm run check` passed typecheck, lint and4,710tests/752files in136.01s
(`/tmp/aux-compact-surfaces-check.log`). Focused21tests passed in8.96s before the
final integrated check. The final resize-observation refinement passed renderer
typecheck, lint and its focused test in4.47s; unchanged suites were not repeated. Native compilation/inspection
remains pending behind the existing builder and UI connection.

## Named custom model providers — integrated source

Models Settings now supports named JSON providers with independent destinations,
keys, model catalogs, role choices and disconnect/remove actions. The four
declared transports are OpenAI Chat Completions, OpenAI Responses, Anthropic
Messages and Google Generative AI. Credentials leave the imported JSON before
configuration persistence and use separate OS entries bound to endpoint/protocol.
Changed destinations cannot silently reuse an old key. Anonymous authentication
must be explicit; local-only policy still excludes remote providers.

Settings writes bind the current connection revision, active tasks prevent
connection changes, and previously acquired transports refuse later dispatch
after retirement. Private inference inherits the declared protocol through the
credential-only broker. Custom transports retain inline tool schemas, suppress
authentication when requested and refuse redirects. Explicit reasoning choices
reach the supported protocol fields. The shared dialog, buttons, popup material
and typography tokens serve add/edit and original-control removal reviews.

Runtime dist was rebuilt. Integrated `npm run check` passed typecheck, lint and
4,705tests/751files in136.45s, including all four SDK wire formats, anonymous
headers, redirect refusal, connection/key isolation and private routing.
The final removal-review refinement passed renderer typecheck and4dialog tests
in0.922s. Logs: `/tmp/aux-custom-provider-integrated-check.log` and
`/tmp/aux-custom-provider-final-ui-tests.log`. Native acceptance and real-provider
inference remain pending. The native UI control service currently reports
`Sky Computer Use native pipe startup failed`; no live Aside comparison is
claimed for this batch. Chromium155 continues its separate cold build.

The composer still uses the selected connection's catalog; a combined picker
across saved connections remains separate work. Supported subscription setup,
Memory, channels, routines and cloud acceptance remain open under R5.

## Native autofill accepted; redirect correction awaiting build

Nativec366c7dc8 completed its incremental build/link and launched through
owner79146 in disposable Profileaux-dev-eWrIyF (app85709/runtime API51202).
The synthetic address flow no longer crashes. Chromium's Save address offer,
Edit dialog, Cancel return and Save all worked. Reopening the form exposed the
saved native autofill suggestion and filled every field. Changing the synthetic
name produced the native Update address offer; Update persisted and the next
suggestion showed the changed name. Payment-specific prompts remain unobserved.

The same walkthrough isolated a general HTTP redirect defect. A redacted local
network trace records19same-destination307Delegate redirects after a real302,
ending with ERR_TOO_MANY_REDIRECTS. The content filter unconditionally passed the
unchanged destination as an override. Area0058 now forwards an override only
when policy actually changes the transport destination, and uses Chromium's
redirect helpers for method/body/header/referrer state. Post-task person
navigation receipts now also admit their exact redirect hops; all document,
control-generation and retirement checks remain. Native acceptance follows.

The full integrated check passed typecheck/lint and4,677/4,678tests; the existing
coder-worktree fixture timed out during compilation. Its single failed case
passed in isolation in26.40s. Logs: `/tmp/aux-native-window-handback-check.log`
and `/tmp/aux-native-window-handback-coder-retry.log`. Unchanged TypeScript checks
are retained for the native-only redirect correction. The original launcher
retired normally, removing its Profile, app and lock before native edits.

## Prompt efficiency

Known OpenAI/Anthropic tool calls share local JSON-schema definitions. The exact
51-tool SDK payload fell from109,361 to54,559bytes. Custom/compatible transports
keep inline schemas; original Zod validation, governed dispatch and conservative
budget estimates remain. Real provider token/latency and native performance
measurements remain open; byte reduction is not a latency claim.

## Accepted behavior retained

Earlier disposable previews established native dropdown keyboard/focus handling,
rounded model search, one browser sidebar, native Bookmarks/History with live Labs
preferences during runtime outages, History clear-data Cancel returning to History,
zoom25–500%, DOCX/text/PDF intake, source-backed answers, basic private answer/Stop,
and last-private-window retirement. Reuse that evidence for unchanged behavior.
The exact builds and captures are in historical status and the reference ledger.

Memory's approved daily documents and authoritative root MEMORY.md have native
edit/reopen and original-source observations. Encrypted owner edits, index Rebuild,
Forget/recovery and30/90-day retention are implemented. Empty-Profile retention
persistence and populated dark/light daily-note editing were observed; populated
expiry and narrow comparison remain open. The latest shared Settings/model/popup
source is newer than those accepted previews.

## Remaining readiness work

- R1: accept exact post-task person navigation, redirects/back/forward/reload,
  Stop/Take over and payment-specific prompts; preserve late-task denial.
- R2/R3: complete155build and changed-flow acceptance, then browser restore,
  sleep/wake, runtime outage, imports/extensions/files/media/permissions and the
  default-route20-task manual smoke (at least18/20), with real workflow receipts.
- R4: valid paired native startup/interaction/memory measurements against matching
  stock155, plus actual provider prompt/token/cache/latency evidence. Run phase
  performance acceptance without reusing unmatched154stock numbers.
- R5: supported subscription setup/inference; combined provider picker; Memory
  USER/TAXONOMY/site/routine authority, real-model extraction acceptance, file diffs/Dream;
  real channel persistence/transports/pairing/replies; standalone routine lifecycle;
  cloud provisioning/preview/Stop/recovery/cleanup; device/file-grant and notification
  acceptance. See the implementation boundaries in `docs/design/`.
- R6: matched light/dark, normal/narrow and populated/error/focus comparisons across
  the growing Aside corpus. Latest rescan:182PNG/192TXT/6support files, excluding
  thumbnails, under `/Users/rcourson/Desktop/Aside UI Reference 2026-10-16`.

No phase or complete-browser claim is justified yet. Distribution, signing,
notarization, sync and other platforms remain separate scope.

## Development constraints

Commit coherent slices to local main; never push, run hosted Actions, enable
Dependabot, sign, notarize or release. Use one native builder/launcher/plain lock;
retire through its original owner and preserve live preview cleanup ownership.
Never reset stable checkouts or clear active locks. Runtime edits rebuild dist
before tests. Run one integrated check per slice and changed-flow native
observations; retry failures or changed behavior without repeating unchanged work.
