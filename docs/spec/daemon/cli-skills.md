# CLI, MCP, REPL and built-in skills

Status: **ready** for command/flag behavior and skill purposes; site-specific helper implementation signatures remain **draft**. Evidence SP1-E1/E2/E3/E4. All help text and skill prose must be newly authored.

## Root command and options

`aux [options] [prompt…]` starts a browser-agent task; `aux exec` is equivalent. Join positional prompt parts with spaces. With no prompt, offer an interactive terminal session. URL input is a task prompt, not a hidden direct browser mutation. Invalid options exit nonzero with concise usage. `-h/--help` and `-V/--version` work without daemon authentication or starting a browser.

| Flag | Value / precedence |
| --- | --- |
| `--account` | nonnegative integer or `u<N>` (case-insensitive prefix); invalid/empty/negative rejects |
| `--host` | local in this release; remote device identifiers return unsupported |
| `--profile` | explicit browser profile identity on local host |
| `-m/--model` | model ID or provider/model; slash form takes provider precedence |
| `-p/--provider` | provider identity; hidden alias `--providerId` |
| `-s/--speed` | default or fast; fast sets model fastMode |
| `--effort` | off/minimal/low/medium/high/xhigh/max/ultrabrowse; hidden alias `-t/--thinking` |
| `--permission` | ask, guard, full-access; ask and guard both select guard; omission defaults to guard |
| `--update` | alias of update; local-only behavior below |
| `--log-dump` | diagnostic capture flag; exact supported value syntax draft pending independent CLI implementation |

Command-local options override inherited root options, then stored account/profile defaults. Explicit model/provider selection enables strictModelSelection. Ultrabrowse enables proactiveMode and chooses the highest visible reasoning level. It is not sent as an unsupported provider reasoning string. Ordinary effort leaves proactive mode false. Preserve remaining prompt content literally; never execute shell interpolation inside the CLI parser.

Default CLI runs are ephemeral and kept out of ordinary chat list. `settings save-sessions true` exposes durable CLI sessions; false is default. A running/suspended/unread ephemeral run may appear in native attention surfaces. Explicit profile binding remains stable across task continuation. The MCP process pins the account instance lazily for its lifetime; deleting/recreating an account must not let an old process operate on the replacement identity.

## Commands

| Command | Arguments/options | Result |
| --- | --- | --- |
| exec | prompt plus root model/account/host/profile/policy options | stream agent text/tool state; interactive approvals/questions; nonzero on failure |
| repl | optional code words; account/host/profile | one execution when code supplied, interactive persistent REPL otherwise |
| mcp | account/host/profile | MCP stdio server; reserve stdout for protocol, diagnostics on stderr |
| guide | optional topic `repl` | original usage guide; no model call |
| session list | account | sessions including unsaved CLI sessions |
| session resume | id, optional prompt, account | continue existing session; interactive if no prompt |
| session stop | id, account | abort current work |
| session steer | id, required prompt, account | interrupt/redirect current generation |
| session queue | id, required prompt, account | deliver after current run |
| session archive / delete | id, account | corresponding durable mutation |
| memory search | query, account, `-n/--max-results` 1–10, `--json` | semantic recall, text or structured result |
| memory list | account, `--json` | markdown file inventory |
| memory show | relative path, account | file text; memory-root confinement |
| memory path | account | absolute memory root |
| skills list | account, `--json` | names and original descriptions |
| skills show | name, account | original skill body; unknown name is not-found |
| skills install | `--target` general/codex/claude-code/cursor/opencode, or `--path` | install independent aux-browser/SKILL.md in selected skill root; avoid overwriting owner customization silently |
| settings save-sessions | true/false, account | persist CLI visibility preference |
| settings set-default-profile | account syntax | persist later CLI account/profile selection |
| account list | none | local registry summary |
| account status | optional id, account flag | selected account metadata without secrets |
| account use | required id | persist default account |
| host list / status | account, list supports json | local host only |
| host profiles | account/host, json | registered local browser profiles |
| host use | local, account | select local; remote names reject clearly |
| login | account, optional email/password/device-code flags | explain local account use and return unsupported for cloud login; no credential collection |
| logout | none | retire CLI auth state only; never delete model credentials/vault |
| update | none | report local-development version/update availability; never download/install or contact hosted update service |

No automatic update check runs before commands in this local release. SIGINT cancels active owned execution and closes transport; distinguish cancelling one turn from closing an interactive session. Do not terminate an unrelated daemon/browser when a CLI process exits.

## Daemon CLI procedures

All are account-scoped. `cli.replStart` creates an independent sandbox and returns id/sessionDir. `cli.replRun` takes id and nonempty code, serializes execution per sandbox, refreshes idle cleanup, returns output/error/artifacts plus elapsedMs. `cli.replState({id})` returns current tool state. `cli.replClose` requires account identity/id, is idempotent for absent sessions, and cannot close a different account instance. `cli.replDescription` returns the current independent helper guide. `cli.skillsList` returns discoverable skills; `cli.skillsShow({name})` returns name/description/body/path. Exact idle expiry duration is an independent documented implementation choice until observed.

## MCP

Implement standard JSON-RPC MCP initialization, tools/list and tools/call over stdio. Expose `exec` and `repl` tools. Exec input: required nonempty prompt, optional session_id to continue; return session_id plus streamed/final textual result. REPL input: title and code; reuse one sandbox for process lifetime; on expired sandbox create a new one and clearly report lost bindings. MCP account selection is fixed once resolved. Never interleave diagnostic text with JSON-RPC stdout. Tool errors use protocol error content/isError without crashing the server. Shutdown closes owned REPL sessions. Concurrency must serialize shared REPL evaluation while allowing independent exec sessions.

## Browser REPL surface

Ready behavioral API: list tabs (`getTabs`), openTab(url), attach/select by stable target ID, close tab, page title/URL/navigation, semantic snapshot, screenshot and locators. A page starts unset; listing tabs alone does not silently select one. Persistent bindings survive successful executions. Console output is returned; no arbitrary imports. Default deadline 120 seconds. Each snapshot refreshes element references; stale refs fail explicitly rather than clicking another node. Cross-frame refs retain frame identity. Browser actions must target the bound account/profile/mode and obey agent approvals. Filesystem globals and fetch must be policy controlled. Exact convenience API signatures for service globals are draft; implement independently from public browser/service interfaces.

## Skill discovery and activation

Skill file is SKILL.md with name/description and optional autoInject keyword/url patterns and siteSpecific marker. Built-ins and account/project user skills are discoverable; owner customization overrides a built-in without modifying shipped files. Disabled skills do not auto-activate. Keywords match relevant user input and URL patterns match actual bound tab URLs. Loading a skill supplies original instructions and only the helper capabilities actually implemented; a skill name must not imply a nonexistent integration. Do not copy reference skill text or scripts.

The plan's count of 35 is older than the installed inventory: SP1-E4 observes 35 top-level directories plus a site-specific subtree. Preserve capabilities instead of deleting entries to meet an arbitrary count. Required independent playbooks and purposes:

| Name | Purpose |
| --- | --- |
| aux | inspect account settings, projects, sessions, routines and local channels |
| aux-browser | external-agent installation guide for CLI/MCP/REPL |
| browser | tabs, windows, bookmarks, history, downloads and grouping |
| visual-browse | screenshot/coordinate fallback when semantic browser access fails |
| captcha-solver | recognize supported challenge UI and use permitted human/visual flow |
| onboarding | detect local browser/tool setup and guide first use |
| skill-creator | author and validate original user skills |
| draft-preview | show reviewable concrete drafts before consequential actions |
| notification-activation | manage permission-bound site notifications and routine triggers |
| channel | operate authorized local channel connections and thread context |
| password-manager | unlock-aware local vault lookup/autofill with secret-safe results |
| 1password / bitwarden / dashlane / lastpass / proton-pass / nordpass / apple-passwords | original provider-specific import/use guidance; access only owner-authorized exports/helpers |
| google-accounts | select correct signed-in Google account before actions |
| google-docs / google-sheets / google-search / google-gmail | document/sheet/search/mail workflows with explicit action authorization |
| image-search / imagegen / visualize | discover attributed images, create original visuals, render useful charts |
| docx / xlsx / pptx / pdf | read/create/edit supported file formats using licensed upstream tools |
| imessage / kakaotalk / slack / notion / x-twitter / youtube | authorized communication/content workflows through independent interfaces |
| linkedin / asana / trello / google-slides / google-drive / google-calendar / google-forms / github / jira / linear / confluence / clickup / airtable / amazon / discord | site-specific playbooks for actual observed page flows and permitted APIs |

Passwords are never emitted merely to prove an import succeeded. Sending communication requires human authorization; selecting a skill is not authorization. Cloud channel hosting remains hidden; locally configured connections can use owner-provided credentials. Skill inventories may list unavailable capabilities as unavailable, never as successfully implemented.

## Runtime packaging

Build CLI and daemon SEA from independent source and pinned upstream Node. Bundle independently licensed browser automation/runtime dependencies, Python, rg and poppler with version/hash/license records. No reference binary/native module is reused. CLI must launch without Node on PATH. Ship original aux-browser skill, not an extracted reference skill. Public-doc-driven service helper work remains subject to the same authorization boundaries.
