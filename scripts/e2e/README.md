# Supplied-stack real Muse acceptance

This harness preserves20 real effect cases:10 browser tasks, file edit, shell CSV transform, two actual attachments, durable memory write/semantic cross-session recall, child delegation, planning, automatic compaction/continuation and browser-to-file reporting. A failure remains a failure; unavailable memory, suspension, missing native bridge, unsuccessful compaction and absent effects are never replaced by successful fixtures.

The runner exposes unchanged helper bodies from the pinned supplied CLI (`013dbd114ac574df1e4c72f53fd438d4b7da4d2aebbf3c45fa22a6fb2fe1dd62`, version1.26.1015), applies the production CLI branding/identity adapter, removes only its one command-line dispatch and changes its empty export. It uses that implementation's createDaemonClient/createExecSession/createChatClient, actual daemon auth and websocket run lifecycle. It does not import the retired independently built CLI client or supply a replacement RPC facade. Control calls use the supplied client's native tRPC proxy.

Offline preparation (no supplied module execution, daemon, model or network). The second command verifies byte-pinned daemon contracts/counts/UTF-8 offsets,20-case scope, synthetic command bounds and extracted helper syntax. Source hashes/anchors are recorded in contracts.json:

```
node scripts/e2e.mjs --check --cli-source out/provided-source-audit/cli-original.mjs
node scripts/e2e/check.mjs out/provided-source-audit/cli-original.mjs <pinned-daemon-source>
```

Later acceptance requires a running self-contained reused stack with a genuinely disposable Aux home, HOME, ordinary browser profile/account binding, preprovisioned local memory model/index and fresh account without sessions or provider credentials. Obtain a token only for that disposable installation through its actual auth boundary. Inject the test key explicitly through a private parent environment; the runner never opens `.env`, owner CLI/profile files or Keychain. Example variable names, without credentials:

```
HOME=<aux-temporary-os-home> AUX_HOME=<aux-temporary-daemon-home> \
DAEMON_BASE_URL=http://127.0.0.1:21520 AUX_CLI_UPDATE_CHECK=0 \
node scripts/e2e.mjs --cli-source out/provided-source-audit/cli-original.mjs \
  --account u0 --profile <actual-disposable-profile-id>
```

The parent process must already supply `DAEMON_AUTH_JWT` and `AUX_E2E_GATEWAY_KEY`; never put either value in command arguments/logs. `--limit 1..20` permits partial diagnosis but can never yield full acceptance. `--adapter PATH` can explicitly locate the current production CLI adapter. The helper export file and raw events are mode0600 in a mode0700 report directory. Destroy that local evidence and disposable state after review; they contain synthetic task transcripts, never intended owner data.

Production calls, deferred until explicit acceptance execution:

- accounts.summary returns per-account profileBindings, not a top-level binding list. cli.resolveBrowserBinding proves the exact ordinary profile/window. Session cwd is returned by the supplied session, not guessed from id: actual storage uses dated directories.
- models.setCredential/removeCredential/getCredentialStatus are the actual credential API. models.setAiGatewayModelIds restricts the gateway catalog to the one permitted Muse model. All four real routing categories/defaultModel are set to it; assistant/compaction events and actual parent/child session models are asserted. Only `vercel-ai-gateway/meta/muse-spark-1.3-contributor` is allowed.
- sessions.files.uploadAttachment receives `{accountId,sessionId,attachment:{id,type:'file',name,mimeType,data}}`; the returned stored attachment goes in actual preceding user-message-metadata row (attachments) in the prompt bundle through the supplied websocket client. No independent attachment-id endpoint is used.
- Browser work uses the real `repl` tool with openTab/snapshot/locator actions. Raw tool_execution_start evidence and fixture effects are both required. Browser-only calls reject shell/file/fetch/evaluate bypasses. Only the random loopback fixture origin is authorized by these tasks; no owner tab/site is part of the prompts.
- memory.getDirectory/readFile/search are real supplied routes. The desktop toolset has no memory_operators; write_file targets the real disposable memory directory, then memory_search and indexed source evidence must succeed in another session.
- write_todos must return actual completed/pending state; subagent and subagent_wait plus a persisted child are required.
- The supplied compaction setting clamps thresholds to64000 tokens; contextWindowTokens/compactionThreshold runtime overrides from the retired engine do not exist. The test sets the real threshold, sends bounded synthetic blocks across at most8 actual turns, requires successful auto_compaction_start/end and recalls a code given only in the first turn. It never calls manual sessions.compact to pretend automatic compaction occurred. This is substantially more model usage than the old4k test.

Cleanup aborts unfinished actual sessions, disposes clients, restores settings and removes/verifies the credential through the supplied API before restoring model settings. Session runtimeConfig.memoryExtractionDisabled prevents unrelated extraction inference. Cleanup failure makes acceptance incomplete and requires destruction of the disposable home; it never deletes a guessed native credential file. No real acceptance has been run by the preparation change.
