# Aux status — October 17, 2026

Full Aside parity and browser readiness remain active and incomplete on local
`main`. [ROADMAP](ROADMAP.md) records owner decisions; the active R1–R6 work is in
[the execution graph](ROADMAP-EXECUTION-GRAPH.md). Detailed earlier evidence and
retired preview handles are in [historical status](STATUS-HISTORY-2026-10-17.md).
Older entries there are not current operating instructions.

## Current build ownership

No accepted product preview is running. The last accepted unchanged product
observations belong to `c366c7dc8` (Chromium154, areas through0057); its disposable
launcher retired normally. Area0058 compiled in the155baseline and still needs
changed-flow acceptance. Area0059's compact Quick Ask awaits native compilation.

The isolated `aux-readiness-chromium` worktree, branch
`codex/chromium-155-security`, completed its58-area baseline at `96f772c6d`.
Source is `/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src`,
official155.0.8059.85 / `0e66b94549a8bd85f03fbdf189b752d6e7b63c32`.
The first two cold attempts exposed a changed WebSocket storage-access callback
and the removed password-store result type. Those boundaries were rebased in
areas0007/0015; their original owners90979/67020 retired normally. Owner85228
compiled both affected credential objects and completed the remaining build in
29m28.15s (`/tmp/aux-chromium-155-credential-build.log`). All58areas replay across
890owned paths with matching bytes/modes (`/tmp/aux-chromium-155-final-replay.log`).

The155app launched as2370 with disposableProfile`aux-dev-USiBHb`. Its first
runtime worker timed out awaiting `native.profileStorageFactor`; a subsequent
worker reachedReady in46.66ms and answered the normal `runtime.describe` API.
The sanitized receipt is `/tmp/aux-155-baseline-runtime.json`. The1s native sample
was collected after the initial stall cleared and does not establish its cause.
No storage-factor timeout workaround was introduced without diagnosis. Original
launcher85228 then retired app/runtime/Profile/plainlock normally, all verified.

Integrate current local main into this isolated candidate, retaining its155pin
and rebased areas, then apply0059 and build/launch the latest complete source under
one owner. Recheck fresh-Profile startup and capture the native stack during any
recurrence. This is candidate integration; root main/product remain pinned154
until migration and changed-flow acceptance are supported. Stable product/stock
checkouts remain untouched. Earlier logs:
`/tmp/aux-chromium-155-websocket-build.log` and
`/tmp/aux-chromium-155-native-generated.log`.

Local fixture96158 serves address POST→303,302navigation and a synthetic test-card
form at `http://127.0.0.1:4826`; no form fields are logged. Its prior owner87871
retired normally. This setup is not native acceptance.

Native UI control currently reports `Sky Computer Use native pipe startup failed`,
including after resetting its session. No current live Aside or Aux visual check
is claimed. CUA bindings from retired previews must not be reused: a stale binding
can launch the default Profile. Check the owned app PID and disposable Profile
argument before creating a new binding. Only disposable Profiles are authorized.

## Shared popup glass and fluid motion — integrated source

Every shared Dialog now uses popup material, including stage dialogs and floating
inspectors. Model-provider submenus, mention suggestions, citation previews,
tooltips, reader contents and notifications now use the same recipe as anchored
menus, command search and native-select pickers. The shared backing,16px blur,
125% saturation, edge/shadow pair and secondary text tokens own their appearance;
replaced opaque surfaces and duplicate material/entrance rules were removed.
Reduced-transparency, forced-colors and increased-contrast modes retain explicit
fallbacks. OS-owned menus keep their native material.

Menus/popovers position before first paint; anchor size changes and model-submenu
window resizing update their bounds. One opacity entrance avoids animating blur
or moving anchors. Left/chat/right sidebar widths and page spacers share the200ms
layout timing; disclosure and hover timings use shared tokens. Direct resizing
stays immediate and reduced motion disables layout/reveal transitions.

The integrated document/material check and two updated assertion reruns are
recorded below. Renderer build passed; raw CSS colors outside tokens remain0.
The contrast check now evaluates actual popup material instead of a removed CSS
navigation tint (native navigation glass belongs to the OS). Secondary popup text
passes4.5:1 over both black/white underlays in both themes: minimum4.69:1
(`/tmp/aux-popup-glass-contrast.log`). These computations do not replace matched
native captures or prove every surface's liquid-glass appearance.

## Owner-written Memory documents — integrated source

Each Space can explicitly create, edit and remove USER.md and TAXONOMY.md beside
its independent MEMORY.md. Documents have distinct bodies and modification times,
revision-bound saves and concrete deletion review. Conflicting drafts remain
available for comparison; a Space/window change retires their local state.
Generated daily notes retain their original quotes and separate generation rules.
No placeholder owner files are synthesized.

Original normal-window proof owns writes. The encrypted workspace record and
cross-Profile recovery retain these documents; replacement/removal retires older
managed backups and derived context through the existing Memory boundary. Root
edits preserve owner documents. Recall and search include their text within the
existing bounded Space context; they grant no site, tool or routine authority.
Site/routine documents, file diffs and Dream remain open.

Runtime dist and renderer typecheck passed. The62focused document/authority/
context/paste/task/recovery tests passed in6.28s
(`/tmp/aux-owner-memory-focused.log`). The integrated combined document/material
check passed typecheck/lint and4,782of4,784tests/762files in102.27s; two existing CSS
recipe assertions needed the new shared material/entrance names. Those two passed
alone after updating the expectations (`/tmp/aux-popup-chrome-check-retry.log`).
Renderer build passed. Native document acceptance remains open.

## Channels — integrated transport, task and Settings source

Slack Socket Mode, Telegram long polling and Discord Gateway have real independent
transports. Authenticated bot/app/user identities bind incoming events. Slack ACKs
and Telegram offsets follow durable receipt; Discord heartbeat and resume state
retire with their original socket. Provider redirects are refused, existing
Telegram webhooks remain unchanged and errors omit credentials and socket tickets.
Rate limits retain provider retry guidance. Interrupted sends become unknown.

Schema6 separately encrypts connections, peers, threads, inputs, outbound receipts
and resume cursors. Opaque keyed indexes and historical content survive reviewed
cross-Profile recovery; restored connections are disabled with fresh revisions,
retired work, cleared cursors and revoked pairing authority. No imported remote
permission resumes automatically. Migration preserves schema2–5 records.

Original normal-window proof owns configuration and native secret writes; private
and external configuration requests are refused. Pair/block binds actual provider
IDs and revocable workspace authority. Each person/thread owns an ordinary task
and chat. Initial turns and Queue/Steer retain external authority, normal approval
rules and parent sessions. Stop affects the originating person's conversation.
Disable, configuration changes, blocking and shutdown retire/join original work;
network reconnect preserves pairing. Reply publication validates the original
request/run/task/authority and destination. Unknown acceptance requires local
review of the exact reply/recipient before retry; retired receipts stay viewable.

Channels Settings now includes shared hero/rows, bundled provider marks, Add menu,
Options/Pairing/Credentials, explicit Space and audience choices, reconnect and
removal. Shared fields, dialogs, native selects, switches, buttons and command
dispatch provide the controls. A wiring audit also registered22missing model/
subscription command IDs and fixed secondary form buttons accidentally submitting.
Queued page-free follow-ups now preserve their external authority in RunService.

Integrated `npm run check` passed typecheck, lint and4,772tests/760files in132.21s
(`/tmp/aux-channel-integration-check.log`). This includes actual cross-Profile
recovery, provider protocol/storage fixtures, source-window retirement, pairing/
revocation, Queue/Steer, person-scoped Stop, uncertain reply review and command
registration. Earlier transport foundation checks remain valid. No messenger
credential was read or real message sent. Native visual and live messenger
acceptance, including provider permissions/reconnect, remain open. Personal-
assistant cards require separate implementation; full channel readiness is open.

## Shared visual tokens and live Terminal appearance

All29remaining raw CSS colors outside `tokens.css` now use shared semantic tokens
or existing liquid palette values. Settings illustration gradients remain grouped
as artwork tokens; project icon colors, layout selection and Home controls use
central definitions. Home status pills and actions follow theme surfaces.
Terminal spacing/radius/type use the shared scale. Its actual xterm canvas reads
the computed background, foreground and font, and updates/refits on theme or
interface-text changes without restarting its original shell session. The same
observer retires with that session's view.

Renderer build passes (`/tmp/aux-token-renderer-build.log`), and the raw-color audit
reports0outside the token file. Typecheck/lint pass; integrated tests passed
4,771/4,772 in147.78s (`/tmp/aux-token-terminal-metrics-check.log`). The unchanged
coder-worktree fixture exceeded60s during native compilation; only that failed
case was rerun and passed in23.94s (`/tmp/aux-token-coder-retry.log`). Terminal's
existing lifecycle test now also proves appearance changes preserve its original
process. No unchanged full suite was repeated. Native visual acceptance remains
open while computer control is unavailable.

## Reviewed, conflict-safe approved-note restoration

Memory history now reads a concrete restoration preview on demand. It shows each
approved note's full current/restored text, daily document path, addition/change/
removal and original source quote before an explicit Restore action. An unchanged
revision offers no write. A refreshed preview never silently authorizes different
changes. Root MEMORY.md and automatic document organization remain separate scope.

Restore requires the exact previewed generation, refusing later edits, Forget or
other Memory updates. It preserves the former current state in encrypted history.
Lease and pause checks run again at actual publication after native key writes.
The replaced unchecked restore signature is removed. Preview/restore use normal
Aux WebUI authorization; external/code-mode management remains denied. Retired
window/Space owners cannot publish previews; Memory-update events immediately
clear reviewed content and invalidate admitted reads, including after Forget.

Dist rebuild,94focused tests/6files and renderer build pass. Integrated typecheck/
lint passed;4,775/4,776tests passed in89.85s
(`/tmp/aux-memory-restore-integration-check.log`). One older workspace fixture
expected immediate restoration; it now verifies preview/no-op behavior and passed
alone in67ms (`/tmp/aux-memory-restore-workspace-retry.log`). No unchanged full
suite was repeated. Host ABI remains274methods/30events,`4afd8361e388`; runtime
authorization/feature maps are regenerated. Native review remains pending.

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

Two bounded real-provider requests used the configured development Gateway key
and disposable in-memory state, with no personal Profile reads. The untrusted
fictional report completed in1.239s with0proposals,823input/36output tokens,
actual Gateway cost$0.001003 and one settled memory invoice. The second request
with verified public Aux facts failed after33.429s; it produced one unpriced
failure invoice and no automatic retry. Logs contain synthetic/nonsecret results:
`/tmp/aux-real-memory-untrusted-report.json` and
`/tmp/aux-real-memory-extraction.json`. This establishes transport/accounting and
safe failure behavior, not successful real-note publication. Native populated/
error/light/narrow comparison and real-proposal acceptance remain pending. USER/TAXONOMY/site/routine document authority, actual file diffs and Dream
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
measurements remain open; byte reduction is not a latency claim. Live catalog
inspection returned387models and listed every configured default/fallback route
(`/tmp/aux-live-provider-catalog.json`); listing does not establish inference
availability. Explicit zero cache-read tokens now survive SDK usage normalization;
unknown cache usage remains absent.

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
  owner-document native acceptance, site/routine authority, real-model extraction acceptance, file diffs/Dream;
  live channel/pairing/reply acceptance and personal assistants; standalone routine lifecycle;
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
