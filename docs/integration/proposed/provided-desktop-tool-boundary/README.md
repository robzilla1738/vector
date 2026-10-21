# Supplied desktop tool boundary — 1852

No native/runtime change is justified by this audit. The supplied standard agent toolset does not register a generic OS screenshot, mouse or keyboard tool. Browser screenshots and interactions use the genuine browser REPL/CDP route. Do not add a new desktop-control feature as a parity prerequisite.

This is a bounded public registration/caller-graph finding, not proof that every native binary or user-configured MCP server lacks additional capabilities. The exact original extracted daemon/CLI inputs and twelve byte-exact excerpts are pinned in `source-evidence.json`; `verify.py` reads bytes only.

## Actual producer/consumer graph

`createCoreToolset` requires a local browser and registers REPL, read-file, terminal, terminal-interact, web-fetch, web-search and time, with actual permission/incognito gates for write/edit/memory. `createAgentToolset` adds genuine history, messages, subagents, routines, confirmation and coder tools under their supplied gates. `createDesktopReplExtensions` supplies browser/chrome/Aside/CAPTCHA and specific system integrations. There is no generic desktop screenshot/click/key surface in these inspected registrations.

The CLI `repl` command explicitly describes Playwright-style JavaScript in Aside Browser. CLI and MCP REPL use `cli.replStart/Run/State/Close`; cloud-host REPL is rejected. Browser screenshot code invokes `Page.captureScreenshot`. This is separate from the Computer Use helper and its OS observation permissions. Root's twenty accepted public browser tests are runtime evidence maintained by the integrator, not new acceptance claimed here.

The Computer Use helper is a context observer plus app inventory and specific Contacts/Messages integrations, not merely a screenshot capture helper. The daemon's literal `runComputerUseCommand` call sites are `contacts.resolve`, `contacts.search`, `imessage.get-history`, `imessage.list-chats`, `imessage.max-rowid`, `imessage.search`, `imessage.send`, and `permissions.check`. Direct manager callers additionally invoke `applications.list`, `applications.icons`, and `discard-context-awareness-buffer`. Messages send is a real specific system action; it does not establish generic desktop control.

The real helper manager's `invoke` validates account id and creation generation before and after startup and sends NDJSON `{command:"invoke",id:"inv-N",name,payload}` to the managed child. The client unwraps actual `{ok:true,data}` or helper errors. This private machinery is not an arbitrary public invoke endpoint. It can start the helper even when Context Awareness is disabled.

## Exact public, no-model-call boundaries

| Public route | Input and result | Important side effects/limits |
| --- | --- | --- |
| `contextAwareness.status` | Account procedure; optional `url`; actual capture/settings/helper/storage/health summaries | Uses `statusFor`; not a permission request. Reads stored context statistics. |
| `contextAwareness.permissions` | Account query, no input; `supported`, `platform`, `built`, `accessibility`, `inputMonitoring`, `secureInput`, `screenRecording` | `requestHealth` does not start a missing child and only sends `health` for its current observation owner. Missing Accessibility/Input Monitoring values default false; **missing Screen Recording defaults true**, so this field alone is not evidence of a grant. |
| `contextAwareness.listApplications` | Account query, no input; installed/recent rows with name, bundleId and icon | Calls `applications.list` with genuine account ownership, catches inventory failure as empty, adds Safari on macOS if missing, merges thirty stored app recents, filters original browser bundle ids, sorts names and resolves icons. Can start the helper; neither a capture-free probe nor pure installed-app inventory. |
| `contextAwareness.appIcons` | Account query; `bundleIds` of nonempty strings, max eighty | Native icon lookup (macOS) or owned helper invocation. No model inference. |
| `fullDiskAccess.check` | Public query, no input; `{status:"granted"\|"not_detected"\|"unknown"}` | macOS Messages/FDA-specific check using internal `permissions.check`. Resolves actual current account and may start helper. It is not observer permission health. |

These procedures contain no model invocation themselves. That does **not** promise that starting a helper cannot initiate observation, or that another existing context scheduler is idle. `runComputerUseCommand` supplies `noDialog:true` for the FDA check, but the manager-invoke branch forwards owner/timeout/signal only; the flag is explicitly passed only on the separate direct `dbPath` subprocess branch. Do not infer a universal no-dialog/no-observation guarantee from the caller flag.

## Permission and acceptance separation

`contextAwareness.requestPermissions` starts/prepares the helper and sends `{command:"permissions",kind:"observer"}`. `fullDiskAccess.request` invokes the distinct Messages permission path. Contacts/Messages/Automation/Full Disk Access requests are **outside** the current observer acceptance scope and must not be exercised or granted as a substitute. No such route, OS grant, model request, helper or native addon was executed during this audit.

The managed observer policy contains actual excluded bundle ids/domains, `captureTypedText`, and `screenText`; enabled/pause/account predicates drive resume/pause. Public `resume`, history/event reads, destructive clear and comprehension/replay/digest are separate operations. Comprehension routes perform actual inference and are not part of a no-inference permission/app-list check.

Remaining actual acceptance is the existing helper/admin boundary followed by a separately authorized, genuinely isolated observer permission/health and local observation journey. The root's previously observed paused helper with all three grants false does not prove capture works; a stopped helper's public default fields do not prove it either. Current public browser control acceptance remains valid independently. Voice/vendor prerequisites remain separate; this audit makes no claim about them.

## Verification and provenance

Only static supplied JS reads and static original helper symbol/string inspection were used. No new REA job, app launch, OS permission request, owner profile read, credential access, cloud call or signing occurred. There is no patch, registration change or fallback implementation. Run `python3 verify.py` for the focused two-source/twelve-excerpt pin check. Byte offsets are UTF-8 byte offsets (not minified source character offsets).
