# Task conversation and composer

Status: **ready** for functionality and dimensions explicitly listed; full viewport geometry **draft** until captures. Sources: SP2-U3 and SP2-H1 in `provenance-sp2.md`.

## Shell and state

Full-height column: fixed header, scrolling transcript, bottom composer. Adapt to narrow sidepanel and wider task route. Inspected header variant 44px high, 8px side inset, 14px medium title, compact back/tab/actions and hairline divider. Task tab strip is 44px high with icon, truncated title and close on hover/focus. Keep conversation stable when browser tabs change unless explicit follow-tab preference is active.

States: empty draft; connecting/loading; idle; running; queued input; steering; clarification; approval; retrying; compacting; interrupted; completed; failed. Use actual daemon state, never simulated progress. Draft persists per account/session. Reconnect reconciles authoritative rows without duplicate messages or repeated approval dispatch.

## Composer

Rounded raised card and hairline boundary. Layout wraps at available width; inspected compact threshold 520px, side inset 16px roomy / 6px compact. Editor/actions must never overlap. Attachments scroll horizontally with 8px gaps and padding. Thumbnail 32×32px; filename/detail 12px; remove action keyboard reachable. Upload progress/error is per attachment.

Enter submits; Shift+Enter inserts newline; composition never submits. Enable send with nonempty draft or supported attachment. Mid-run input can steer now or queue; Stop interrupts without deleting transcript. Queue cards support edit/remove/reorder, with keyboard alternatives; measured list maximum height 208px, raised 22.4px radius, hairline, compact header. Keep content until mutation succeeds.

Mentions can reference available tabs, files, selection, skills and other scopes. Picker supports keyboard selection. Store stable context IDs plus labels, with separate dismiss buttons. Backspace/Delete on empty draft may remove last removable badge. Pasting ordinary text must not execute commands.

Model picker groups by provider, shows configured/available status, a provider list and model pane, centers current selection and offers settings navigation. Effort picker exposes supported levels only and a distinct extended-browsing mode. Shortcuts: Meta+Shift+M model; Meta+Shift+period effort. Permission picker shows backend-supported three modes. Project/workspace and private-session choices persist via daemon APIs rather than local UI state. Missing credentials/unavailable model must be actionable before submission.

## Transcript

Combine persisted and streaming rows, replacing the stream with its final row once. Group turns; distinguish user, assistant, steering, lifecycle status, tools and queue. Hide internal prompt wrappers. User messages align right with rounded accent fill and sample inset 12px side/8px vertical; assistant prose spans the content column without a large bubble. Wrap long links and preserve code whitespace.

Support Markdown headings/lists/links, code blocks and inline code, horizontally scrollable tables and KaTeX from licensed upstream. Prose leading 1.625. Attachment cards: 36px icon, 14px title, 12px details, 10px inset and rounded boundary. Table cells: 12px side/8px vertical padding. HTML artifacts use isolated sandbox with open/preview, loading and error states.

Follow newest content only while already at bottom. User reading earlier rows keeps position; offer return-to-latest. Actions are exposed on hover/focus and remain keyboard reachable. Edit editor minimum 80px/maximum 320px with save/cancel and error retention. Branch/edit semantics come from daemon spec, never silently overwrite history.

## Tools and human input

Compact tool rows show original Aux description, target, running/completed/failed state and expandable useful detail for terminal/repl, fetch/search, browser, files, memory/history, notifications, subagents and routines. Display real elapsed/usage data only. Subagent opens its conversation. Todo states show pending/current/done. Never expose secrets in tool details.

Approval cards identify action, target and consequence. Offer allow-once, persistent policy where supported, and deny. File-change details can show highlighted additions/deletions. Bind response to the exact suspension/tool-call ID, disable after dispatch, retain visible failure if resolution fails. Clarification cards collect requested single/multiple-choice or free text and answer the exact suspension. Escape does not approve or discard required questions.

Retry/compaction indicators reflect real states. Error treatment measured: radius 22.4px, destructive boundary alpha 20%, wash 5%, inset 12px side/8px vertical, 14px text and 16px icon. Draft action preview is attached to its pending action. Annotation comment sample: 320px glass editor, 14px text, maximum 160px height. Artifacts/file/subagent tabs have clear close/back navigation.

## Acceptance and unknowns

Verify create/send/stream/stop, queue edit/remove/reorder, steering, approval allow/deny, clarification, mentions/uploads, picker persistence, todo/subagent, formatted output, reconnect and recoverable failure against live daemon. Exact empty artwork, all row spacing, column maximum per host, composer base height and gesture animation remain unmeasured; approximations are not visual parity.
