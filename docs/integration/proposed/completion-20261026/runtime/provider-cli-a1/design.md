# Provider CLIs, the T3 Code way (provider-cli-a1)

2026-10-28. Design for [decision 1](../../../../../plans/2026-10-28-release-readiness.md): users bring their Claude, ChatGPT/Codex, Cursor, Grok and OpenCode plans through each provider's **official CLI and the login they already have**. Aux ships no borrowed OAuth client and no impersonated client headers. Inventory of what ships today: [inventory.md](inventory.md). Code: `vendor/provided/provider-cli/` (tested, not yet integrated).

## Product decisions

1. **One row per CLI provider** in Settings > Models, above the API-key providers: ChatGPT (Codex CLI), Claude (Claude Code), Cursor, Grok (Grok Build), OpenCode. Each row shows exactly one of three states, plus a rare error state:
   - **Not installed**: "Install Codex CLI to use your ChatGPT plan in Aux." Actions: *Install guide* (official page) and *Copy install command* (`brew install --cask codex`, …).
   - **Signed out**: "Codex CLI is installed but not signed in." Actions: *Copy sign-in command* (`codex login`, `claude auth login`, `agent login`, `grok login`, `opencode auth login`), *Open Terminal* (opens Terminal with the command typed, not run), *Check again*.
   - **Ready**: "Signed in with Codex CLI." Shows the version, the account hint the CLI reports (masked email, plan, team), and the model picker. *Disconnect* explains that sign-out happens in the CLI (`codex logout`, …); Aux never signs the user out itself.
   - **Error**: the CLI's own one-line reason (timed out, failed to start) and *Check again*.
2. Aux re-checks on Settings open, on window focus while Settings is open, and after *Check again*; results are cached for 30 s. Detection never blocks chat or startup.
3. **Copilot**: GitHub publishes an official Copilot CLI (`copilot`, `gh copilot` wraps it). The row appears only when `copilot` is installed, and it stays read-only ("support not verified yet") until its headless flags are verified from its own `--help` on a machine that has it. It is not installed here, so it is hidden. The in-app GitHub sign-in is removed.
4. **Kimi and Meta stay API-key providers** (`kimi-coding`, `meta`). Their in-app subscription sign-ins (`kimi-code`, `meta-muse`) used another product's device-flow client and leave the picker; a connected row from an older profile still shows (the list keeps `providerIds`), but its sign-in refuses with a pointer to the API-key row.
5. **ChatGPT**: the row is driven by the Codex CLI. The candidate's own `aux-chatgpt.cjs` path (Aux's client, eligibility form unsubmitted) stays dormant and untouched; the supplied pi-ai Codex flow with the Codex CLI client id is removed.
6. A CLI turn runs as a **browser agent**: built-in shell and file-edit tools are off or confined to a private per-turn folder, and Aux's browser tools come in over MCP. Users who want a coding agent use the CLI directly.
7. Aux sends no prompt during detection, and the acceptance pass sends one short prompt per provider only with Robert's yes (it uses his plans).

## Detection (`detect.mjs`, `catalog.mjs`)

- **PATH**: one login-shell call, `<shell> -ilc 'echo __AUX_PATH_START__; /usr/bin/printenv PATH; echo __AUX_PATH_END__'`, trying the account's login shell (`os.userInfo().shell`) first and then `$SHELL`. `printenv` prints the exported, colon-joined PATH in fish, zsh and bash alike; the markers cut rc-file noise. Then the official install locations: `/opt/homebrew/bin`, `/usr/local/bin`, `~/.local/bin`, `~/.npm-global/bin`, `~/.volta/bin`, `~/.bun/bin`, `~/Library/pnpm`, `~/.opencode/bin`, `~/.claude/local`, `~/.cursor/bin`.
- **Binary**: first executable match. Cursor tries `cursor-agent` before the generic `agent`, and every CLI must print its own version banner, so a foreign `agent` reads as not installed.
- **Version and status** (8–20 s timeouts, run in their own process group, killed on timeout; OpenCode retried once while it warms up):

| CLI | Version banner | Status command | Ready when | Signed out when |
| --- | --- | --- | --- | --- |
| Codex | `codex-cli X` | `codex login status` | exit 0 and "Logged in using …" (stderr) | exit 1 / "Not logged in" |
| Claude Code | `X (Claude Code)` | `claude auth status --json` | `loggedIn:true` (any auth method the user chose) | `loggedIn:false` |
| Cursor | `YYYY.MM.DD-hash` | `agent status --format json` | `isAuthenticated:true` | `isAuthenticated:false` |
| Grok Build | `grok X` | `grok models` (Grok has no status subcommand) | exit 0 and "You are logged in with …"; also yields the model list and default | otherwise, or "grok login" in the output |
| OpenCode | `opencode vX` | `opencode auth list --standalone` | at least one "stored" credential | empty list |
| Copilot | any semver | none | installed (shown read-only) | n/a |

  `--standalone` keeps Aux from starting or depending on the user's shared OpenCode background service. No command that prints secrets is ever used (`opencode auth export` is explicitly avoided), no token file is read, and the daemon's own `detectAISubscription` stays as the nudge's data source.
- **Environment for every child**: the daemon's environment (which already drops inherited provider keys) minus every `AUX_*` variable and nested-agent markers (`CLAUDECODE`, `CLAUDE_CODE_ENTRYPOINT`, `CODEX_SANDBOX*`, …), with the resolved PATH, `TERM=dumb`, `NO_COLOR=1`. The user's CLI config homes (`CODEX_HOME`, `CLAUDE_CONFIG_DIR`, `XDG_CONFIG_HOME`) pass through so the CLI finds its own login.

## Driving (`drivers.mjs`, `stream.mjs`)

Each turn runs in a private working folder `<Aux home>/agent-cli/<turnId>` (0700, removed after the turn). Every flag below comes from the installed CLI's own `--help` (2026-10-28 versions in the inventory); Codex's protocol comes from `codex app-server generate-json-schema`.

| CLI | Command | Prompt | Streaming | Browser tools (MCP) |
| --- | --- | --- | --- | --- |
| Codex 0.164.0 | `codex app-server -c mcp_servers.aux.url="…" -c mcp_servers.aux.bearer_token_env_var="AUX_MCP_TOKEN"` (stdio JSON-RPC) | `initialize` → `initialized` → `thread/start {cwd, ephemeral:true, approvalPolicy:"never", sandbox:"read-only", model?, developerInstructions?}` → `turn/start {threadId, input:[{type:"text"}]}` | `item/agentMessage/delta`, `item/reasoning/*Delta`, `item/started`/`item/completed` (`mcpToolCall`, `commandExecution`, `webSearch`), `error`, `turn/completed` (`completed`/`interrupted`/`failed`) | `-c` overrides; token in the env |
| Claude Code 2.1.308 | `claude -p --output-format stream-json --verbose --include-partial-messages --no-session-persistence --permission-mode dontAsk --tools "" --mcp-config <file> --strict-mcp-config --allowedTools mcp__aux [--model] [--append-system-prompt]` | stdin | `system/init`, `stream_event` text and thinking deltas, `assistant` tool_use, `user` tool_result, `result` | `.aux-mcp.json` (0600) with `"Authorization": "Bearer ${AUX_MCP_TOKEN}"` |
| Cursor 2026.10.22 | `agent -p --output-format stream-json --stream-partial-output --workspace <dir> --trust --sandbox enabled --approve-mcps [--model] <prompt>` | argv | `system/init`, `assistant` text deltas (a whole-segment restatement is dropped), `tool_call` started/completed, `result` | `<dir>/.cursor/mcp.json` with `${env:AUX_MCP_TOKEN}` |
| Grok Build 1.0.67 | `grok --prompt-file <dir>/prompt.txt --output-format streaming-json --include-partial-messages --cwd <dir> --permission-mode dontAsk --no-subagents --allow mcp__aux [--model] [--rules]` | 0600 file | Claude-compatible records when present, else text/thinking/tool/done/error shapes (schema not published) | `grok mcp add --scope project --transport http --header "Authorization: Bearer <turn token>" aux <url>` in the turn folder |
| OpenCode 2.2.0 | `opencode run --standalone --format json --title Aux [--model provider/model] <prompt>` | argv | `text`/`reasoning` parts (whole or delta), `tool_use` with state, `step_finish` reason `stop`, `error` | `<dir>/opencode.json` with `{env:AUX_MCP_TOKEN}`, `permission: {edit: deny, bash: deny}` |

Common Aux events: `session`, `text`, `reasoning`, `tool` (start/end), and exactly one terminal `done` (`end` or `cancelled`) or `error` (`exit`, `incomplete`, `malformed`, `stalled`, `spawn`, `mcp-setup`, provider codes). A sign-in error from the CLI becomes "… is not signed in. Run `codex login` in Terminal." and flips the Settings row to *Signed out* on the next check.

Codex: `exec --json` is the documented fallback if `app-server` (marked experimental) changes; T3 Code and the plan use `app-server` because it streams deltas and supports `turn/interrupt`. Server requests are answered by Aux, never shown to the user: approval requests get `{decision:"decline"}`, anything else a JSON-RPC "not supported".

Prompt exposure: Cursor and OpenCode take the prompt on argv (visible to the same macOS user through `ps` for the life of the turn); Claude reads stdin and Grok a 0600 file. Acceptable for a same-user local agent; revisit if those CLIs add stdin input.

## Browser tools (daemon MCP endpoint, to build at integration)

- The daemon adds a streamable-HTTP MCP endpoint on its existing listener: `http://127.0.0.1:21520/mcp/v1/<profileId>`. Tools are the Agent's existing browser tool set for that profile (the same handlers the built-in agent calls), nothing new.
- Auth: for each CLI turn the daemon mints a **turn token** (random 256-bit, stored only in daemon memory, bound to `{profileId, windowId, turnId}`, revoked when the turn ends or after 30 min). The MCP route accepts only `Authorization: Bearer <turn token>`, checks the bound profile against the path, and runs behind the same `verifyDaemonAuthHttpRequest` middleware family as other routes, so the long-lived `AuxDaemonSessionToken` never leaves the daemon. CORS: no browser origin is allowed on `/mcp/`.
- Scope: a turn token can act only in its profile, only while its turn is live; every tool call shows in the chat as a tool row, and the existing Agent confirmation rules for sensitive actions still apply.
- Existing alternative kept: the `aux-browser` skill plus `aux` CLI that Settings > Developers already installs for Codex, Claude Code, Cursor and OpenCode.

## Cancellation and cleanup (`process.mjs`)

- Every CLI child is spawned `detached`, so it leads its own process group; Stop and Quit signal the whole group (MCP bridges, shells, sleepers included).
- **Stop**: Codex gets `turn/interrupt` first and up to 3 s to finish with `turn/completed: interrupted`; the others get SIGTERM to the group immediately. SIGKILL follows after 2 s. The stream ends with `done: cancelled`.
- **Idle watchdog**: no output for 180 s → `error: stalled` and group kill.
- **Consumer gone** (window closed, generator `return()`): the group is killed in `finally`.
- **Quit**: the daemon awaits `terminateAll()`; `installExitCleanup()` SIGKILLs any group left if the daemon exits abruptly. The per-turn folder is removed after every turn.
- Tests prove the grandchild (`/bin/sleep 300`) is gone after Stop, idle timeout, early return and Quit, and that `liveChildren()` is empty afterwards.

## What supplied code is removed (`borrowed-identity-removal.mjs`)

28 count-checked daemon edits (one group per provider) and 2 Agent edits, verified against both the frozen snapshot and the candidate entry. After them none of these strings remain in the daemon: the Codex CLI client id, the VS Code Copilot and Claude Code client ids (encoded and decoded), the Grok CLI, Kimi Code and Meta Muse client ids, `Copilot-Integration-Id`, `vscode-chat`, `GitHubCopilotChat`, `copilot-chat/`, `Editor-Version`, `Editor-Plugin-Version`, `xai-grok-cli`, `x-grok-client-version`, `grok-cli:access`, `claude-cli/`, `x-anthropic-billing-header`, the billing salt.

| Group | Edits |
| --- | --- |
| codex | blank both Codex CLI client ids; pi-ai Codex `login` and `refresh` throw "Sign in with the Codex CLI instead: run codex login…" |
| copilot | blank the VS Code client id; `COPILOT_HEADERS` → `{}`; `GITHUB_COPILOT_HEADERS` keeps only `X-GitHub-Api-Version`; 29 bundled model header sets → `{}`; 2 device-flow user agents dropped; `login` throws |
| claude | blank both Claude Code client ids; both Claude OAuth `login`s throw; `withClaudeCodeBilling` becomes the identity; version, salt and billing block blanked; both `claude-cli` user agents (and `x-app: cli`) dropped |
| grok | blank the Grok CLI client id and its `grok-cli:access` scope; `login` throws; the Grok CLI client headers on the composer model and the usage call removed |
| kimi, meta | blank the client ids; `login` throws "Add a … API key in Settings > Models" |
| ui (Agent `strip-markdown`) | drop `meta-muse`, `xai-grok-oauth`, `kimi-code`, `github-copilot` from the visible provider order `Zf` |

Not removed: API-key providers (`anthropic`, `openai`, `xai`, `kimi-coding`, `meta`, Copilot token env), hosted Aux paths, the `aux-chatgpt.cjs` module, and the `claude-code`/`openai-codex` ids, which the new CLI rows take over at integration.

## Integration still required

1. **Daemon delta** (`docs/integration/proposed/completion-20261026/runtime/…`, through `prepare_edits.py` and the repair executor):
   - call `applyBorrowedIdentityRemoval({component:'daemon', path:'entry.mjs', text})` after the identity and provider-funded edits in `vendor/provided/provider-launch-stage.mjs` `compose()` (it runs on both SEA and `node-development` text);
   - bundle `vendor/provided/provider-cli/*.mjs` next to `aux-native-entry.mjs` (as `native/aux-chatgpt.cjs` is today) and load it from the entry;
   - add tRPC procedures beside `getSubscriptionUsage` (@12058816): `providerCli.status` (cached `detectAll` → `settingsRow`), `providerCli.refresh`, and a chat-runtime branch so a model whose provider is `codex`/`claude`/`cursor`/`grok`/`opencode` runs `runTurn` instead of pi-ai `stream`, mapping events onto the existing assistant event stream (`createAssistantMessageEventStream`);
   - the `/mcp/v1/<profileId>` route and turn tokens beside `daemonAuthMiddleware` (@3027150); call `terminateAll()` in the daemon's shutdown path and `installExitCleanup()` at start.
2. **Agent delta**: apply `applyBorrowedIdentityRemoval({component:'agent', path:'assets/strip-markdown-DRcmtuJc.js'})` in the agent pipeline next to `provider-funded-launch-ui.json` edits; re-point the `claude-code` and `openai-codex` rows in `connect-dialog-CacgpFap.js` (`Sn`, the Codex dialog) from the OAuth popup to the CLI status row, reusing the supplied dialog components (`P`, `I`, `A`, `w`, `ce`) and copy style; add Cursor, Grok and OpenCode rows to `aa`/`Zf` with the same components.
3. **Reseal and accept**: one disposable launch; each row through not installed (PATH without the CLI), signed out (a disposable `CODEX_HOME`/`CLAUDE_CONFIG_DIR` with no login) and ready; one short prompt per provider **only with Robert's yes**; Stop mid-turn; Quit with no child left (`pgrep -g`).

Open items to verify in that real check: Grok's `streaming-json` record shapes and its `--allow mcp__aux` rule; Cursor's MCP approval in `-p` mode; Codex MCP tool calls under `approvalPolicy:"never"` with `sandbox:"read-only"`; OpenCode `{env:…}` header interpolation in v2.

## Real detection (2026-10-28)

`detectAll()` from this module, run against the installed CLIs (fish login shell). Status commands only:

Observed 2026-10-28T13:23:25.785Z in 12142 ms; login-shell PATH resolved from the account shell (fish): true; live children afterwards: 0.

| Provider | State | Version | Binary | Account hint | Settings row |
| --- | --- | --- | --- | --- | --- |
| codex | **ready** | 0.164.0 | `/opt/homebrew/bin/codex` | method ChatGPT | ready, runnable; actions: `codex logout` |
| claude | **ready** | 2.1.308 | `/opt/homebrew/bin/claude` | method claude.ai, plan enterprise, email (masked) | ready, runnable; actions: `claude auth logout` |
| cursor | **ready** | 2026.10.22-27dcf5f | `/opt/homebrew/bin/cursor-agent` | email (masked), team (masked) | ready, runnable; actions: `agent logout` |
| grok | **ready** | 1.0.67 | `/opt/homebrew/bin/grok` | method grok.com; models grok-4.7, grok-4.7-build-fast, grok-4.6, grok-4.5 | ready, runnable; actions: `grok logout` |
| opencode | **ready** | 2.2.0 | `/opt/homebrew/bin/opencode` | 10 stored credentials | ready, runnable; actions: `opencode auth logout` |
| copilot | **not-installed** | – | – | none | hidden; actions: `https://gh.io/copilot-cli`, `npm install -g @github/copilot` |

The first attempt in this session ran with `$SHELL=/bin/zsh`, whose rc hands off without printing, so the PATH lookup returned nothing and only the fallback directories were searched (same five results). `userLoginPath` now asks the account login shell (`os.userInfo().shell`, fish here) first and falls back to `$SHELL`.
