# Provider sign-in inventory (provider-cli-a1)

2026-10-28. Every subscription sign-in path in the shipped daemon and Agent extension, read from static files only. No launch, no token file, no Keychain, no prompt to any provider. Plan: [agent plan, phase 2](../../../../../plans/2026-10-28-agent-plan.md); decision: [release readiness, decision 1](../../../../../plans/2026-10-28-release-readiness.md).

## Inputs

| Input | Path | SHA-256 |
| --- | --- | --- |
| Frozen supplied daemon, SEA code | `out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/MacOS/aside-daemon` (NODE_SEA blob) | `5e35dfa1…14f5` (`DAEMON_CODE_SHA256`) |
| Candidate daemon entry | `out/provided-candidate-completion-20261026-a1/…/Aux Daemon.app/Contents/Resources/node-development/aux-native-entry.mjs` (the native `aux-daemon` host loads this file) | `101a65a2…5b76` |
| Agent provider list | `assets/strip-markdown-DRcmtuJc.js` (snapshot `ab010d96…22cb`, candidate `5cc5c4b5…e343`) | |
| Agent connect dialogs | `assets/connect-dialog-CacgpFap.js` | |

Offsets below are character offsets in the candidate entry. The same anchors occur once each in the frozen snapshot (checked by `borrowed-identity-removal.test.mjs`).

## Daemon: in-app subscription sign-in

The daemon embeds pi-ai. Each subscription provider has a `lazyOAuth` loader (`registerBundledOAuthFlowLoaders`, @4742177) and appears in `OAUTH_PROVIDERS` (@6553022), which the OAuth flow manager and `CredentialStorage` use.

| Daemon provider id | UI name | How sign-in works today | Borrowed identity | Models |
| --- | --- | --- | --- | --- |
| `openai-codex` | ChatGPT ("Reuse your ChatGPT Plus or Pro subscription") | Candidate routes get/set/delete/auth through `auxChatGPT()` (`DMN/native/aux-chatgpt.cjs`, Aux's own client, eligibility unsubmitted); `CredentialStorage.login` throws "Use the Aux ChatGPT connection dialog". The supplied pi-ai flow is still bundled and still the `oauth.load` of the provider: browser PKCE on `localhost:1455` plus device code against `auth.openai.com` | **Codex CLI client id `app_EMoamEEZ73f0CkXaXp7hrann`** twice: `CLIENT_ID$2` in `init_openai_codex$1` (@4722049, login, device code, refresh) and `CLIENT_ID` in `init_web_oauth` (@6594239, authorize and code exchange) | `OPENAI_CODEX_MODELS` (gpt-5.3-codex-spark, gpt-5.5, gpt-5.6-luna/sol/terra, gpt-6-astra) at `chatgpt.com/backend-api`; usage from `chatgpt.com/backend-api/wham/usage` |
| `claude-code` | Claude ("Reuse your Claude Pro or Max subscription") | `claudeCodeOAuthProvider` (@6204391): PKCE against `claude.ai/oauth/authorize` with callback `localhost:53692`, token from `platform.claude.com/v1/oauth/token`. Requests then **pose as Claude Code**: `withClaudeCodeBilling` (@5864783) sets `user-agent: claude-cli/2.1.280` and prepends a forged `x-anthropic-billing-header: cc_version=…; cc_entrypoint=cli; cch=00000;` system block derived from salt `59cf53e54c78`; betas `claude-code-20250219,oauth-2025-04-20`. It also runs `claude auth status --json` (@5862759) for the coding-agent nudge | **Claude Code client id** (base64 `OWQxYzI1…`, decodes to `9d1c250a-…`) as `CLIENT_ID$1`; Claude Code user agent and billing block | Anthropic built-ins re-labelled `claude-code` (`getClaudeCodeModels`) |
| `anthropic` (OAuth half) | Anthropic | pi-ai `anthropicOAuth` (@4667512): same PKCE flow; OAuth-token client sends `user-agent: claude-cli/${claudeCodeVersion}` and `x-app: cli` | Claude Code client id as `CLIENT_ID$6` | Anthropic built-ins |
| `github-copilot` | GitHub Copilot ("Reuse your GitHub Copilot subscription") | `githubCopilotOAuth` (@4698050): GitHub device flow, then Copilot token exchange | **VS Code Copilot client id** (base64 `SXYxLmI1…`, decodes to `Iv1.b507…`) as `CLIENT_ID$5`; **VS Code headers** `User-Agent: GitHubCopilotChat/0.35.0`, `Editor-Version: vscode/1.107.0`, `Editor-Plugin-Version: copilot-chat/0.35.0`, `Copilot-Integration-Id: vscode-chat` in `COPILOT_HEADERS` (@4698050), `GITHUB_COPILOT_HEADERS` (@6604184), 29 bundled model entries and the 2 device-flow requests (31 header sets in all) | `github_copilot_default` (29 models) plus a live `/models` fetch with the same headers |
| `xai-grok-oauth` | Grok ("Reuse your Grok subscription", "Sign in with SuperGrok or X Premium") | pi-ai `xaiOAuth` (@4741967): device code at `auth.x.ai`; inference through `cli-chat-proxy.grok.com/v1` | **Grok CLI client id `b1a00492-…`** with scope `grok-cli:access`; headers `X-XAI-Token-Auth: xai-grok-cli`, `x-grok-client-version: 1.0.13` (composer model, @6208294) and on the usage call (@6595740) | xAI built-ins plus the Grok composer model |
| `kimi-code` | Kimi Code ("Reuse your Kimi Code subscription") | pi-ai `kimiCodingOAuth` (@4705168): device code at `auth.kimi.com`/`auth.kimi.ai` | Kimi Code CLI client id `17e5f671-…` (`CLIENT_ID$4`) | Kimi coding models |
| `meta-muse` | Meta Muse ("Reuse your Meta Muse subscription") | pi-ai `metaOAuth` (@4712933): device flow at `auth.meta.com`, then mints a 24 h key at `api.meta.ai/muse-code/key` | client id `1031625952748946` (`CLIENT_ID$3`) | Meta models |

Other subscription surfaces: `getSubscriptionUsage` accepts `aux`, `claude-code`, `kimi-code`, `openai-codex`, `xai-grok-oauth` (@12058816); routing defaults list `claude-code`, `github-copilot`, `openai-codex` and `xai-grok-oauth` candidates (@1816629); `detectAISubscription` (@10673629) runs `codex login status` and `claude auth status --json` through the login shell for the coding-agent nudge.

Already present and reusable: `resolveShellCommandPath` / `getClaudeCommandPath` (login-shell lookup with markers), the `aux-browser` skill installer for `codex`, `claude-code`, `cursor`, `opencode` (`AGENT_INSTALLATION_CONFIGS`, @11850583), and an MCP **client** for user-configured servers. There is no MCP **server** in the daemon.

## Agent extension

- `strip-markdown-DRcmtuJc.js`: provider metadata table `aa` (names, descriptions, `type:"subscription"`, `oauthOnly`), the visible provider order `Zf`, the subscription set `Xf` (`meta-muse`, `claude-code`, `openai-codex`, `xai-grok-oauth`, `kimi-code`, `github-copilot`) and the usage-limit set `kf`.
- `connect-dialog-CacgpFap.js`: one OAuth dialog per subscription provider, each opening a popup (`aux-claude-oauth`, `aux-openai-codex-oauth`, `aux-github-copilot-oauth`, `aux-meta-muse-oauth`, `aux-xai-grok-oauth`, `aux-kimi-code`). Copy: "Aux will use your subscription to access … supported models. Sign in with … to connect your account." `Ve` reserves the ids from custom providers.
- `coding-agent-nudge-Cy9BtLdb.js`: suggests Codex or Claude Code for coding prompts.
- `subscription-usage-BB4arJ0Z.js`, `icons-C7UupG-g.js`, `types-BEI3ap6-.js`, `model-categories-BLKcCTS7.js`: usage, icons and routing for the same ids.
- No borrowed client id or spoofed header exists in the extension; it only renders and routes.

## Observed CLI states on this Mac (2026-10-28, status commands only)

Run through `vendor/provided/provider-cli/detect.mjs` (`detectAll`, login-shell PATH from fish) and by hand. Emails masked; no token file was opened.

| Provider | Binary | Version | Status command | Observed |
| --- | --- | --- | --- | --- |
| Codex | `/opt/homebrew/bin/codex` (cask 0.164.0) | `codex-cli 0.164.0` | `codex login status` | **ready**: exit 0, "Logged in using ChatGPT" on stderr |
| Claude Code | `/opt/homebrew/bin/claude` (cask 2.1.308) | `2.1.308 (Claude Code)` | `claude auth status --json` | **ready**: `loggedIn:true`, `authMethod:"claude.ai"`, `apiProvider:"firstParty"`, `subscriptionType:"enterprise"` |
| Cursor | `cursor-agent` wins over the `agent` wrapper (`/opt/homebrew/bin/agent` is a shell script exec'ing `cursor-agent`) | `2026.10.22-27dcf5f` | `agent status --format json` | **ready**: `isAuthenticated:true`, team "BG Innovation" |
| Grok Build | `/opt/homebrew/bin/grok` (a local Python launcher picking the newest cask build) | `grok 1.0.67 (2fe064390d07) [stable]` | `grok models` (no status subcommand exists) | **ready**: "You are logged in with grok.com.", default `grok-4.7`, 4 models |
| OpenCode | `/opt/homebrew/bin/opencode` | `opencode v2.2.0` | `opencode auth list` | **ready**: 10 stored integrations. The first call failed in 6 s with "Location plugins did not finish activating" (runtime warm-up); the retry and `--standalone` succeeded. That first call started OpenCode's own background service (`opencode serve --service`, 127.0.0.1:49374), which was left running |
| GitHub Copilot CLI | not installed (`copilot` missing; `gh copilot` would download it, not run) | n/a | n/a | **not installed → hidden** |
| Kimi CLI | not installed | n/a | n/a | API key only (decision 1) |

`detectAll` real run: see the "Real detection" section of [design.md](design.md#real-detection-2026-10-28).
