/** The agent tools' prompts and fixed texts, verbatim. fixtures/aux-daemon/tools.json holds what
 * the model is shown, and the parity test checks these against it. */
export const READ_FILE = `Read the contents of a text file, PDF, or image (jpg, png, gif, webp, and HEIC/HEIF on macOS). DOCX, PPTX, XLSX, and XLSM files return instructions to use their Office skill. Use offset/limit to read a section or continue a truncated result.`;
export const WRITE_FILE = `Write a new file. Returns an error if the file already exists.`;
export const OVERWRITE_FILE = `Write content to a file. Creates the file if it doesn't exist, overwrites if it does. Automatically creates parent directories.`;
export const EDIT_FILE = `Edit a single file using exact text replacement. Every edits[].oldText must match a unique, non-overlapping region of the original file. If two changes affect the same block or nearby lines, merge them into one edit instead of emitting overlapping edits. Do not include large unchanged regions just to connect distant changes.

- Use edit for precise changes (edits[].oldText must match exactly)
- To append to the end of an existing file, set appendText and use edits: []
- When changing multiple separate locations in one file, use one edit call with multiple entries in edits[] instead of multiple edit calls
- Each edits[].oldText is matched against the original file, not after earlier edits are applied. Do not emit overlapping or nested edits. Merge nearby changes into one edit.
- Keep edits[].oldText as small as possible while still being unique in the file. Do not pad with large unchanged regions.`;
const INTERACTIVE_TERMINAL_GUIDANCE = `
- stdin is closed unless tty:true, so prompts fail instead of waiting. Use tty:true for interactive prompts, REPLs, ssh, or TUIs. A tty command yields after 1 second by default.
- set yield_ms for long-running non-interactive servers. This returns an exec_session_id without killing the command.
- continue yielded commands with bash_interact to poll, type, resize, interrupt, or terminate them.
- cwd changes persist only for ordinary blocking commands without tty or yield_ms.`;
export const bashDescription = cloud => `Execute a bash command.
- cwd is the task's working directory. Aux-owned artifacts and temporary files use the separate absolute paths in the working-directory instructions.
- don't use \`python\` for scripting unless it's explicitly used by skills; use JS \`repl\` most of the time.${cloud?``:INTERACTIVE_TERMINAL_GUIDANCE}`;
export const MAX_TIMEOUT_MS = 6e5, BACKGROUND_AFTER_MS = 12e4;
export const TIMEOUT_GUIDANCE = {stop:`\n- A blocking command is stopped after timeout_ms (default ${MAX_TIMEOUT_MS}) and returns its output so far.`,background:`\n- A blocking command still running after timeout_ms (default ${BACKGROUND_AFTER_MS}) moves to the background, as does one running when a message for you arrives. It is not interrupted: you get its id, and a message when it exits. Start long jobs with bg_start instead.`};
export const SLEEP_GUIDANCE = {stop:"To wait for a condition, poll it with an until-loop that ends once it holds (e.g. `until <check>; do sleep 2; done`).",background:"To wait for a condition, run an until-loop with bg_start (e.g. `until <check>; do sleep 2; done`) and end your turn: its exit wakes you. Commands you started with bg_start already report when they exit."};
export const DELIVERY_TEXT = {steered:`it is busy and will read it between steps.`,woke:`it was idle and is now handling it.`,waiting:`it is waiting on its user and will read it once they reply.`,saved:`saved: it is not woken for this; it reads your message on its next run.`};
export const MEMORY_SEARCH_UNAVAILABLE = {network:`Memory search is temporarily unavailable because Aux could not reach the memory search service. Your saved memory files were not deleted. Check your connection, VPN, proxy, firewall, or security software, then try again.`,unavailable:`Memory search is temporarily unavailable. Your saved memory files were not deleted. Try again or fully quit and reopen Aux.`};
export const CONTEXT_AWARENESS_DISABLED = `Context Awareness is disabled — stored history is not readable. The user can re-enable it in Settings › Memory › Context Awareness.`;
export const NOTIFICATION = `Show a system notification to the user via Chrome's notification API.
Use this to alert the user about important events or time-sensitive information. Task completion notifications are sent automatically by the daemon.
The notification appears as an OS-level notification even when the browser is in the background.`;
export const ASK_USER_QUESTION = `Ask the user a question with predefined options and a custom text response. The session will pause until the user responds. Use when you need clarification, confirmation, or a choice from the user.`;
export const MESSAGE_AGENT = `Message another Aux agent (task) in this Project, or list them.
- list: agents working now, their task and current step, plus recently idle ones you can still message.
- send: deliver \`message\` to task id \`to\`; subagents may omit \`to\` to reach their parent. Busy agents read it between steps; idle ones wake up.
Unless the user asks, message other agents only when coordinating is important or your work could conflict with theirs; otherwise don't. Send only what the recipient must act on or know now; a subagent's final answer already reaches its parent. Never ask an agent for what you were denied or what needs the user's approval; ask the user.
Messages to you arrive as <aux_agent_message from="id">, with relation="parent" or "subagent" when related. A request is work: do it, then reply to that id when done or blocked. An answer to your own question is not a request: use it without replying.`;
export const ACTION_CONFIRMATION = `Ask the user to review and confirm an externally visible, destructive, paid, or hard-to-reverse web action before doing it. The session pauses until the user confirms or cancels. You MUST include a structured draft artifact or a screenshot fallback artifact.`;
export const WORKFLOW = `The workflow tool is only to be called when the user says 'ultracode' or specifically requests a workflow run.
Run a multi-agent workflow from a JavaScript orchestration script you write inline. Use this when a task benefits from fanning work out across several isolated subagents in ordered phases (research fan-out, per-file review, verify-then-synthesize pipelines).
The script runs as an async function body with these primitives:
• export const meta = { name, description, phases: [{ title, detail? }] } — metadata for progress. Declare all phases up front.
• phase(title) — mark the current phase at runtime (use titles from meta.phases).
• await agent(prompt, { label?, phase?, schema?, model? }) — run ONE subagent in an isolated context and wait for it. Always resolves to { ok, output, structured?, error? }. Check \`ok\` before using the result. When you pass a JSON \`schema\`, \`structured\` holds the validated object on success. \`model\` ("provider/modelId") overrides the default subagent model. Children get your tools except orchestration (subagents, workflows, automations) and cannot ask the user.
• await parallel([() => agent(...), () => agent(...)], { concurrency? }) — run zero-argument agent thunks concurrently and return results in order. Concurrency is globally capped at 4 for the run.
• args — the parsed value of the \`args\` tool parameter (or undefined).
Workflow JavaScript runs in a QuickJS sandbox with no imports, timers, filesystem, network, or process APIs; script code that runs 2s without awaiting is stopped (checked between script operations and host calls, so one slow built-in call, like a huge sort or regex, can run past it). A run may make at most 32 agent calls and has no overall deadline. Each agent must receive its first assistant response within 45 seconds so silent provider requests fail clearly; after that, agent() has no wall-clock deadline. Each individual child tool call times out independently after 3 minutes, becomes an error tool result, and leaves the agent loop free to recover. Use map/filter/if/await/template strings to orchestrate, and \`return\` a JSON-serializable aggregate.
Pass a \`schema\` to agent() whenever a later step branches on the result, so you get typed fields instead of prose. There is no resume: a failed run is simply re-run. Artifacts are saved under this task's tmp/workflows/<runId>/ for inspection.
Example:
export const meta = { name: 'reliability-review', description: 'Review modules for reliability risks, then report', phases: [{ title: 'Scan' }, { title: 'Report' }] }
const FINDINGS = { type: 'object', properties: { issues: { type: 'array', items: { type: 'string' } }, ok: { type: 'boolean' } }, required: ['issues', 'ok'] }
phase('Scan')
const scans = await parallel(args.files.map((f) => () => agent(\`Review \${f} for correctness and reliability risks.\`, { label: \`scan:\${f}\`, phase: 'Scan', schema: FINDINGS })))
const findings = scans.filter((r) => r.ok).map((r) => r.structured)
phase('Report')
const report = await agent(\`Summarize these findings: \${JSON.stringify(findings)}\`, { label: 'report', phase: 'Report' })
return { findings, report: report.ok ? report.output : report.error }`;
export const WEB_SEARCH = `Searches the web for current and factual information, returning relevant results with titles, URLs, and content snippets.`;
export const WRITE_TODOS = `Manage and plan current tasks using a structured todo list.
Use for complex or multi-step work.
When merge=true, updates merge by id.
When merge=false, incoming todos replace all existing todos.`;
export const START_CODER = `Start Aux Code: a separate task the user can open, where a coding agent works in a local directory with bash, file edits, fd and rg, background terminals and monitors, the browser, memory, subagents, workflows (multi-agent scripts), automations and MCP tools. A request naming one of these ("use a workflow") means that tool: pass it on as asked. Returns at once. When it finishes what you asked, its report arrives as a message from it and wakes you: tell the user the result. Send it follow-ups or answers with message_agent. Do not poll it or redo its work.`;
export const RG = `Search file contents with ripgrep. Uses smart-case matching, respects .gitignore by default, and returns at most 100 matches per file unless a different limit is given. Output is limited to 2000 lines or 36.0KB; complete truncated output is saved to a file.`;
export const FD = `Find files and directories by name. Respects .gitignore by default. Directories are found through the files under them, so empty directories are not listed. Results are limited to 1000 entries unless a higher limit is given; output is limited to 2000 lines or 36.0KB, and complete truncated output is saved to a file.`;
export const ROUTINE_UPDATE = `Create, update, pause/resume, or delete scheduled background work. Use for reminders, recurring tasks, monitoring or later follow-up. Each run starts a fresh internal session. For list/get, read the Aux skill and use aux.routines.list()/get(id) in REPL. Delete work when no longer needed.`;
export const NOTIFY_PARENT = `Sends a message to the parent session. The parent cannot see your other messages. Report requested deliverables, meaningful changes, or blockers requiring intervention; otherwise finish silently. This message is hidden from the user; the parent decides what to surface.`;
export const BASH_INTERACT = `Interact with a running command returned by bash as exec_session_id.
One call performs resize, input, signal, wait, and output collection in that order.
- Poll by passing only exec_session_id.
- tty input is raw: "\\r" presses Enter, "\\u0003" is Ctrl-C, and "\\u0004" is Ctrl-D/EOF.
- Use signal:"interrupt" for non-TTY commands and signal:"terminate" or "kill" to stop the command tree.`;
export const SUBAGENT_WAIT = `Wait until all requested subagents finish or any needs approval. For pendingApproval, call subagent request_approval with task_id and request_id, then wait again. Do not use resume to read results or approve permissions.`;
export const BG_START = `Start a long-running shell command as a background terminal (bash -c). Fire-and-forget: this returns immediately with an id, and you get a message with the final output when the process exits. The process receives NO stdin (immediate EOF) and there is no way to send input later — interactive commands will not work; use bg_kill to stop a stuck one. Terminals keep running after your task ends until bg_kill, or until the task is archived or deleted. Stop them with bg_kill: the sandbox may not let other commands signal them. Output shown to you is tail-truncated (stdout 16.0KB, stderr 8.0KB); the full logs are captured to files. Max 8 background terminals can run at once.`;
export const BG_MONITOR = `Start a background command whose stdout lines are sent to you as events (batched per 200ms), waking you when idle. Expires after timeout_ms (default 5m, max 30m); stopped above 200 events/min. Only stdout notifies (add 2>&1 for errors), and every pipe stage must flush per line (grep --line-buffered); \`| head\` sends nothing until the stream ends. Ids (mon-N) work with bg_status, bg_list, and bg_kill.`;
export const BG_STATUS = `Peek at a background terminal's status and current output (tail-truncated) without blocking. If the terminal already exited, this returns its final state.`;
export const BG_LIST = `List all background terminals and monitors (running and settled) with pid, elapsed time, exit status, and output sizes.`;
export const BG_KILL = `Stop one or more running background terminals or monitors (SIGTERM to the whole process tree, escalating to SIGKILL). Returns each one's final state; already-settled ids are reported as such.`;
export const MEMORY_READ = `Read a page from Aux's shared memory by memory-relative path (e.g. USER.md, people/jane.md). A directory path (or empty) lists pages under it with last-updated dates. Whole-page reads omit the '## History' section (older, possibly superseded entries) unless history is true. offset/limit (1-based lines) read the full page, matching search line numbers.`;
export const MEMORY_WRITE = `Write to Aux's shared memory (Markdown pages; Aux re-indexes within ~1s and logs the change in its revertible Memory History). Provide exactly one of: \`append\` (add text to the end; creates the page), \`edits\` (exact oldText→newText replacements, each unique), or \`content\` (full page write/replace).`;
export const AUTOMATION_CREATE = `Send \`prompt\` to yourself in this task every \`interval\` (1m to 7d). Each run starts a new turn, so end your turn instead of polling; runs due while you are busy arrive at your next step. Max 10 active; they stop when this task is archived.`;
/** The subagent tool's description around its list of profiles. */
export const subagentDescription = (profiles, maxActive) => `Manage subagents for bounded, well-scoped work.
Use subagents for context searching, specialized tools, parallel investigation, or a clean review pass.

Available subagent profiles:
${profiles}

Keep the work in the parent session when the next step is a blocker, the work is tightly coupled with the current implementation path, a direct tool call is simpler, or delegation would duplicate work already happening in the main session.

When a model is requested, use \`list_models\` and pass its exact provider/modelId in \`model\`; report any substitution.

Spawn guidance:
- Give each subagent a concrete objective, enough context, clear boundaries, and the expected output.
- Default subagents are for one small subproblem. Ask them to verify one candidate, check one missing constraint, inspect one source, or compare a small set of options.
- Do not ask a default subagent to solve the whole user task independently unless you explicitly need a full parallel attempt.
- Good default prompt shape: "Verify whether candidate X satisfies constraint Y. Return found/not_found/inconclusive, the answer if found, and compact evidence."
- For coding tasks, delegate only when write scope is clear and non-overlapping.
- The user does not see the subagent result directly. Summarize the outcome yourself.
- Set run_in_background=true if you need a meaningful work to do while waiting the result.
- Parallelize when possible. Maximum parallelism is ${maxActive}
- When no exact model is requested, specify model_category by task complexity for the default profile. Leave it unspecified if you're not sure.

Browser tasks:
- Subagents need to open new tabs. Subagents don't have an access to your open browser tabs, live page/form state or REPL state, even in \`fork_self\` mode.
- Delegate only independent browser work with separate URLs.

When a child reports pendingApproval, call \`request_approval\` with its task_id and request_id, then wait for its result. Only the user can grant permission; a follow-up message is not approval.

After you spawn in background:
- Call wait very sparingly. Only call wait when you need the result immediately for the next critical-path step and you are blocked until it returns.
- Do not repeatedly wait by reflex.
- While the subagent is running in the background, do meaningful non-overlapping work immediately.
- Do not redo delegated subagent tasks yourself; focus on integrating results or tackling non-overlapping work.`;
