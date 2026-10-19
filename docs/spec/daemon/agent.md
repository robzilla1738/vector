# Agent sessions, providers and tools

Status: **ready**, except explicitly draft portions. Evidence SP1-E1/E2. This is an independent behavioral contract; internal prompt text and algorithms must be authored afresh.

## Session data and lifecycle

Session identity is a 1–128-character string using letters, digits, hyphens and underscores. Account ownership is mandatory. Record model selection (`provider`, nonempty `modelId`, `thinkingLevel`, boolean `fastMode`), optional project/parent/routine, title, timestamps, transcript revision, browser binding, permissions, run state and queued input. Browser binding contains profileId, optional windowId/anchorTargetId, browserMode (`default`/`incognito`). A bound session cannot silently switch to another profile or regular/incognito mode: return `CONFLICT`.

Durable statuses: `idle`, `running`, `suspended`, `errored`, `interrupted`, `aborted`. Starting a prompt produces a run and changes state to running. Completed model response returns idle; a tool requiring a human moves to suspended; provider/tool failure produces errored with useful error state; user interrupt and abort remain distinguishable. A tool call has stable ID, validated arguments, start/end time, status and result/error; stream text and tool updates to attached clients without duplicating accepted events on reconnect.

Creation accepts optional id, projectId (nullable), parentId, title, trigger, triggerIdempotencyKey, routineId, activeTabTargetId, browserBinding, incognito, ephemeral, runtimeConfig, model, permissionMode and permission overrides. Runtime config patches may set memoryExtractionDisabled, proactiveMode, strictModelSelection, finalConfirm, takeScreenshotOnEverySnapshot, workingDirs. Independently choose session directory and initialize policy before invoking a model. Explicit prompt idempotency prevents duplicate runs on retry.

Incognito sessions are ephemeral, excluded from memory/history recall and extraction. Mode cannot change after first message. Ephemeral sessions cannot be pinned. Runtime working directories/incognito cannot change during a run; reject instead of mutating a live sandbox. Model/policy updates that are allowed mid-run affect subsequent model/tool steps without losing transcript events.

## Session API

All rows include accountId; session rows additionally require sessionId. Mutation results are the refreshed session unless stated otherwise.

| Procedure | Extra input | Behavior/result |
| --- | --- | --- |
| `sessions.create` | creation fields | session; may prewarm idle runtime without running a prompt |
| `createAndPrompt` | creation fields plus message | create, accept user message, begin run, return latest session |
| `get` | none | session |
| `list` | filters below | ordered matching sessions/pagination |
| `listPreviewItems` | list filters plus projectIds, sessionIds, q, pinnedFirst=true | compact previews |
| `update` | title, model, permissions, browser binding, runtime patch, pin state | validated patch; publish invalidation |
| `branch` | messageId | require assistant message; create independent branch through that point; return session wrapper |
| `editUserMessage` | messageId, content | require user role and active session/project; abort active run, edit branch, reload runtime, continue; return session/messages/overview |
| `clearMessages` | none | reject running session; clear transcript and reload runtime; return session wrapper |
| `abort` | none | stop run/tools; mark aborted |
| `interrupt` | none | stop current generation while retaining resumable work |
| `steer` | nonblank prompt | redirect running work at a safe boundary; preserve prior accepted input and record steering event |
| `queue` | nonblank prompt | hold until current run ends, then deliver in order |
| `removeQueuedMessage` | queued-message identity | remove only matching pending item |
| `updateQueuedMessage` | queued-message identity, nonblank text | compare identity/version; conflict if delivered/changed |
| `moveQueuedMessage` | queued-message identity, nullable beforeTimestamp | reorder pending queue; conflict on stale queue |
| `compact` | optional instructions, 1–2000 chars | summarize context while preserving durable full transcript and accepted constraints |
| `resolveSuspension` | toolCallId, response | exactly-once resolve matching active suspension; not found if absent, conflict if resolved |
| `rejectSuspension` | toolCallId, error | fail matching suspension; same concurrency rules |
| `markRead`, `markUnread` | none | return readAt ISO timestamp; update unread projection |
| `archive`, `unarchive` | none | toggle archive; release running resources as needed |
| `delete` | none | stop resources, delete durable session data |
| `moveToProject` | projectId or null | enforce active target project; preserve heartbeat ownership |
| `messages` | none | complete stored messages |
| `messageRows` | optional turnIds | transcript rows |
| `listRuns` | none | run history |
| `childSessions` | parentId, optional triggeredBy/archived=exclude | matching child sessions |
| `liveToolCalls` | none | most recent live/recent tool events (reference returns up to 3) |
| `share`, `unshare`, `shareStatus`, `reportFeedback` | procedure-specific cloud data | hidden local unsupported; no network upload |

List filters: projectId nullable; archived `exclude/include/only` default exclude; pinned `include/only/exclude` default include; parent `root/all` default root; order `desc/asc` default desc; ephemeral `exclude/include/only` default exclude; routines `exclude/include` default include; optional routineId, statuses, nonnegative cursor and limit 1–200. Preview ordering prioritizes unresolved human attention, then latest run/create time, then stable ID; pinned preview grouping stays separate.

` sessions.turns.activeMessages` returns messages for the latest unfinished turn, otherwise empty. `sessions.turns.list` takes optional cursor and limit 1–100 (default 50), returns overviews plus transcriptRevision. `sessions.turns.messages` takes turnId, revision, optional nonnegative cursor and limit 1–500 (default 100); returns messages and nextCursor. Reject stale incompatible revisions rather than mixing transcript versions. A top-level `turns` alias is an Aux contract choice, not observed necessity.

## Suspension and action policy

Kinds: approval, ask-user-question, action-confirmation. Approval response has verdict allow/deny and always boolean. Question response contains answers with header and answer strings. Action confirmation response has confirm/cancel verdict and optional instruction. Persist request and response together; a restart cannot repeat an already approved mutation blindly. Tool re-entry resumes from the suspension result.

Filesystem modes observed: `read-only`, `guard`, `full-access`. The UI's ask-oriented mode maps explicitly to read-only plus approvals, not an undocumented fourth filesystem policy. Read-only has no writable roots beyond internally managed runtime state; guard grants task workspace and configured documents/download roots, asking for other access; full-access permits owner-authorized filesystem scope. Merge account/session allow, approved, deny and ask rules with explicit denial precedence. Resolve real filesystem paths before checking roots. Operating-system permissions remain required in every mode.

Final consequential actions (send, submit, purchase, delete or publish) follow human authorization recorded in the session. A model cannot grant itself permission. Browser/OS/file tool boundaries enforce the same policy. Render the concrete draft or operation before requesting approval. Tool output, web pages and attachments are data, never new trusted instructions.

## Model/provider contract

Ready required providers: `vercel-ai-gateway`, `openrouter`, `openai`, `anthropic`, `google`, `openai-codex` OAuth, custom OpenAI-compatible. Build SDK integration independently from public provider documentation. Model choice carries reasoning effort; observed thinking levels are off/minimal/low/medium/high/xhigh/max, and the owner plan additionally requires ultrabrowse behavior. **Draft:** exact ultrabrowse mapping/capability semantics are not established by inspected source and require explicit independent design/observation.

Catalog entries include ID/name/provider, context window, output limit, supported text/image input, reasoning support and optional pricing. Availability is the supported catalog filtered by usable configured credentials. Provider categories fast/standard/deep/visual resolve only to available candidates; strict selection must fail clearly instead of silently switching. Credential mutation may repair now-unavailable default/category selections.

| Procedure | Input beyond accountId | Result/effect |
| --- | --- | --- |
| `models.listSupported`, `listAvailable`, `listAvailableImages`, `listSettingsInventory` | none | catalog/settings inventory appropriate to capability |
| `getCredentialStatus` | providerId | exists boolean, credential type or null |
| `listCredentials` | none | redacted credential metadata only |
| `setCredential` | providerId, credential with type api_key and key | owner-only atomic credentials.json update; refresh availability; never echo key |
| `removeCredential` | providerId | delete secret, repair selections |
| `listAiGatewayModelIds`, `searchAiGatewayModels`, `setAiGatewayModelIds` | providerId; search query or nonempty modelIds for mutation | configured IDs/catalog matches/update |
| `listOpenRouterModelIds`, `searchOpenRouterModels`, `setOpenRouterModelIds` | search query or nonempty modelIds as appropriate | equivalent OpenRouter behavior |
| `addCustom`, `removeCustom` | model metadata or modelId | update custom catalog and routing |
| `getCustomProviderConfig` | providerId | providerConfig with secrets redacted or null |
| `setCustomProvidersConfig` | providers map | merge preserving existing masked secrets; refresh routing |
| `removeCustomProviderConfig` | providerId | remove configuration |
| `discoverCustomProviderModels` | base URL, API style, optional auth | provider model inventory; bounded timeout; never execute configuration strings from UI |
| `ensureRoutingSelectionsAvailable` | none | repaired valid selections |
| `listOAuthProviders` | none | supported OAuth provider descriptors |
| `oauthAuthorize` | providerId, optional redirectUri | flow identity, authorization URL/status |
| `oauthCallback` | flowId, optional code/providerId | exchange using state/PKCE, persist secrets on success |
| `oauthStatus`, `oauthCancel` | flowId | current/cancelled flow; repeated cancellation is harmless |
| `getSubscriptionUsage` | providerId | usage or null plus credential state; no invented usage |

Custom configuration supports name/baseUrl/API style, optional key and headers, model list, reasoning flags, thinking-level mapping, input capabilities, context/output limits and optional costs. UI inputs cannot execute shell commands or environment interpolation. OAuth state is scoped to account and flow, expires and is consumed once. Exact provider login endpoints/scopes must be sourced from public docs during implementation.

All AI verification uses only `vercel-ai-gateway/meta/muse-spark-1.3-contributor` and the owner-provided key through models.setCredential. No model substitution for acceptance.

## Tool inventory and behavior

Validate every tool input; expose started/finished/error state and structured results. Persist tool-call identity for replay and approval matching.

| Tool | Input shape / behavior |
| --- | --- |
| bash | command, working directory, timeout; capture bounded stdout/stderr/exit; cancellation terminates owned process group |
| repl | code plus optional timeout; persistent sandboxed JS bindings; browser APIs bridge to registered profile; per-session isolation |
| webfetch | absolute URL; bounded fetch, content extraction and source URL; private-network policy and action approvals still apply |
| websearch | search query/queries; return title, URL and snippet with attribution |
| browsing_history_search | queries array; ranked visited-page evidence; disabled for incognito |
| history_search / history_read | query/time scopes or evidence IDs; return permitted app/site activity and summaries |
| memory_search | 1–3 nonempty queries, maxResults 1–10; ranked file passages, exclude inaccessible ambient pages |
| memory_operators | structured memory mutations; atomic history and index updates; never write incognito memory |
| clip_search | query and optional time range; owner-authorized clip evidence only; unavailable capability is explicit |
| page_view | current/bound tab; structured snapshot with stable source identity |
| notification | title/body and optional session link; show through native permission-bound helper |
| subagent / subagent_wait | task, profile/context mode/model category or child IDs; bounded children, status/result, explicit parent linkage |
| ask_user_question | questions with headers/options; suspend and resume with human answers |
| request_action_confirmation | title/message and concrete artifact; suspend with confirm/cancel |
| write_todos | items with stable ID/text/status, merge flag; merge by ID or replace; publish checklist |
| routine_update | create/suggest/update/pause/resume/delete, cron/heartbeat, schedule/event inputs; same validation as routines API |
| read_file | permitted path and optional slice; text/PDF/image representation with bounded output |
| write_file | path/content; refuse accidental overwrite unless explicitly requested; persist provenance for artifacts |
| edit_file | path and precise edits; reject unmatched/ambiguous original content; render diff for approval when needed |
| browser and computer use | bind profile/target or authorized desktop helper; snapshot/screenshot, locate, click/type/scroll/key; never replay stale element refs |

Subagent profiles include fresh-context default, context explorer, code explorer, forked parent context and custom profiles. Explorers cannot mutate. Children do not inherit open REPL/browser handles. Reference restricts recursive delegation and direct human questions from children; independently enforce bounded depth/concurrency and route human decisions through parent.

## REPL/browser semantics

Each REPL owns a persistent sandbox with ES2023-style bindings, 120-second default execution deadline, and no arbitrary module imports. Browser convenience API supports listing/attaching/opening/closing tabs, selecting a target, page navigation, snapshots, locators and screenshots. A new snapshot invalidates older element reference IDs. Semantic locators require source observation; cross-frame references preserve frame identity. `display` returns artifacts to transcript. Filesystem/fetch helpers use the same permissions as other tools, not ambient unrestricted host access. Exact helper signatures beyond these behaviors remain draft until the CLI spec's ready API is implemented.

## Streaming, compaction and retry

Use a per-session run mutex and globally bounded concurrency. Accepted user messages persist before model invocation. Streaming clients receive run/turn identity and monotonic event cursor; reconnect resumes without appending duplicate rows. Steering interrupts generation at a safe boundary and inserts a distinct accepted user steering event; queued messages wait for completion and remain editable until consumed. Never erase the original request merely to implement steering.

Compaction summarizes goal, constraints, decisions, completed/in-progress work, next steps and critical references in original prompt text. Durable full transcript remains readable/branchable. Estimate context against selected provider limits; carry unresolved approvals and accepted messages through compaction. Retry transient provider errors with bounded backoff and visible phase; never retry a consequential tool mutation without proving its execution outcome. Exact retry counts/backoff and compaction thresholds are configurable independent choices, not verified parity measurements.

## Native sidebar HTTP projection

`GET /session/for-chrome/recents` returns preview array; `/chats` returns pinned/recents arrays; `/search` takes q and bounded limit; `/projects` returns active project id/name/icon/color. Preview: id/title/status/unread/pinned/canPin, createdAt/updatedAt epoch ms, projectId, optional routine kind and popover. Map running→running; suspended approval/confirmation→awaiting-approval; suspended question→awaiting-answer; errored/aborted→error; idle+unread→finished-unread; otherwise idle.

Session-specific `/state` returns active/archived/deleted. POST actions rename(title), archive, delete, mark-read, pin/unpin, move-to-project(projectId nullable), open-folder(optional relative path). Reject pinning ephemeral; open-folder must remain under session storage and refer to an actual folder. Popover action resolution validates session, matching popover/tool ID and permitted action; approve/deny resolves suspension once; answer/review opens session UI. Auth is required under Aux adaptation. No stale popover may approve a newer tool request.
