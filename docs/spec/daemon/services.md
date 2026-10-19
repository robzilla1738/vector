# Local services, memory and remaining router inventory

Status: **ready** for explicitly described local behavior. Complex nested data models and algorithms marked draft require implementation design plus acceptance; this is not a claim of complete procedure-level parity. Evidence SP1-E1/E2/E4. Common account scoping, authentication and errors are in core.md.

## Projects and workspace files

Project record: id, nonempty name, icon/color, workspacePath, created/updated time and optional archivedAt. `projects.list` returns account projects; `get` requires projectId; `defaultWorkspacePath({projectId})` returns an unused account-owned default; `create` requires id/name/workspacePath, optional icon/color; `update` patches name/icon/color/workspacePath; archive/delete operate on projectId. Reject missing/archived ownership where mutations require an active project. Moving a heartbeat session between projects also updates its heartbeat routine ownership atomically.

`listFiles` inventories project-managed context files. `readFile({fileName})` and `writeFile({fileName,content})` use allowlisted project filenames, not unrestricted arbitrary paths. `importFiles` accepts a nonempty array of name/base64-data entries, normalizes names and rejects escape/conflicts. General workspace file tools still require session filesystem policy.

Skill procedures are additionally project-scoped with nullable projectId: `getSkillsDirectory`, `listSkills`, `listSkillsForSettings`, `createSkill`, `updateSkill`, `deleteSkill`, `setSkillEnabled`, `readSkillFile`, `importSkillFolder`, `copySkillForCustomization`. Null project selects account skills; project uses workspace `.agents/skills`. User skill input: nonempty name/description/body, enabled default true, keywords and URL-pattern arrays default empty. URL patterns omit scheme/whitespace. User mutation targets stay under user scope, never shipped built-ins. Update/delete requires skillPath; copying a built-in creates independently editable user customization. Detect overridden built-in names. Runtime discovery deduplicates user over built-in. Exact import conflict UX is owned by UI spec.

## Routines

Record: id, nullable projectId, nonempty name/prompt, kind (`cron` creates new session; `heartbeat` continues targetSessionId), triggerKind (`schedule`/`event`), scheduleKind (`once`/`recurring`), timezone, optional rrule/runAt/eventFilter/expiresAt/model/permissionMode/runtimeConfig/browserBinding/createdBySessionId; state/source; nextRunAt; created/updated time; optional pause/deletion/dismissal metadata.

Validate schedule and target as a unit: cron cannot target an existing session; heartbeat requires a target in the same project. One-off requires ISO runAt and forbids rrule. Recurring requires RRULE and forbids runAt. Event requires eventFilter.source and forbids schedule fields; expiresAt is event-only. Compute nextRunAt in specified timezone with DST-aware upstream RRULE support. Persist trigger execution identity before starting work, prevent duplicate firing across restart and concurrent scheduler polls. Paused/deleted/dismissed/expired rules do not fire. One-off completes after execution. Recurring cron can maintain routine memory under its own memory subtree.

`routines.list` filters projectId/includeDeleted/source/state. `get` requires routineId. `create` validates writable record. `activate` promotes draft to active; `dismiss` retires suggestion; `update` patches writable fields and nullable overrides; `delete` stops future triggers. `runNow` accepts routineId and optional browserBinding, applies same policy as scheduled runs. `runSuggestionScan` analyzes permitted local usage and creates reviewable draft suggestions, never silently schedules them. Errors distinguish missing target, invalid schedule, archived project and unavailable model. `suggestedItems.list` takes limit 1–20 (default 3), returns draft routine/task suggestions with id/type/title/description/prompt/model/policy/timestamps.

## Memory files and recall

Account memory root has `MEMORY.md`, `USER.md`, `TAXONOMY.md`, `episodic/` and optional routine subtrees. These filenames describe roles, not copied file contents. Embeddings are local using an independently licensed model/runtime; indexed documents and vectors never leave the machine without an authorized provider operation. The file/history API must work independently of embedding availability. Search failure is explicit `PRECONDITION_FAILED`, not a fabricated empty successful recall.

| Procedure | Input | Result / invariant |
| --- | --- | --- |
| `memory.getDirectory` | account | absolute root |
| `listFiles` | account | markdown path/absolutePath/lastUpdatedAt inventory; skip dot entries/nonmarkdown/managed ambient pages |
| `readFile` | filePath | content, absolutePath, lastUpdatedAt; missing file gives empty content/null timestamp; reject escape/nonmarkdown/managed ambient page |
| `writeFile` | filePath/content | existing ordinary markdown only; update content/index, append edit history; absent returns NOT_FOUND |
| `search` | 1–3 nonempty queries, optional maxResults 1–10 | ranked source passages; filter ambient pages when ambient recall disabled |
| `listHistory` | optional limit 1–100/cursor | entries and pagination, excluding ambient-only artifacts |
| `getHistoryEntry` | historyEntryId | history record or NOT_FOUND |
| `getDreamState` | account | lastDreamAt/sessionsSinceLastDream plus current consolidation state |
| `runDreaming` | force=true | consolidate memory with configured permitted model, atomic history; reject disabled memory or concurrent consolidation |
| `rerunExtraction` | sessionId | extract durable useful facts from completed session; reject incognito, extraction-disabled, active/empty session or missing model |
| `revertHistoryEntry` | historyEntryId | reverse successful recorded changes only; reject no-change/failed record; conflict if current content no longer matches expected revision |

History record includes stable ID/type/status/trigger, start/end times, touched files, before/after content changes, model/tool messages and errors. Revert itself creates a new history entry instead of erasing prior evidence. Dreaming is a background consolidation job, not merely renaming or concatenating files; preserve user-authored facts and source links, use an independently written extraction/consolidation instruction. Automatic trigger thresholds/model choices are configurable and remain draft parity measurements.

Browsing-history retrieval indexes visited URLs/titles/content with actual visit times and stable source identity; search returns evidence from permitted profile scope. Browser import must preserve original visit dates. Incognito visits never enter long-lived recall. Lexical fallback may be exposed explicitly, but cannot stand in as proof that semantic recall works.

## Context awareness

Capture is opt-in and requires OS permissions. Track app/window/site events with source identity, occurredAt, appName/bundleId/windowTitle and optional URL/domain/target. Keep an append-only local ledger plus redacted content blobs and summaries. Excluded app/site rules apply before capture, recall and summarization. Pause stops observation; deleting data must remove dependent indexes/summaries. Password/secret input is excluded/redacted. App screenshots alone are not equivalent to semantic event history.

| Procedure | Input | Behavior |
| --- | --- | --- |
| status | optional URL | current enabled/paused/permission/URL observability state |
| permissions / requestPermissions | account | inspect OS grants / invoke required helper prompts |
| events | optional from/to/source/kind/bundleId/domain, limit 1–500 default 100 | filtered ledger entries |
| search | optional up to 3 queries, from/to/app/domain, limit 1–100 default 20, offset>=0 | activity evidence with source IDs |
| read | 1–20 evidence IDs, optional offset/match(1–200 chars)/contextLines(0–100) | bounded matching source context |
| pause / resume | optional until or positive durationMs | persist paused state / resume with permissions |
| clear | target: all/today/timeRange/application/domain/session | delete matching ledger/blobs/index content |
| historyList | from/to | activity history |
| historyStatus | account | index/capture state |
| listApplications | account | observed/available app metadata |
| appIcons | up to 80 bundleIds | available icon mapping |
| summaries | optional from/to/kinds/limit 1–200 | summary records |
| verifyStore | sample 1–2000 default 200, all=false | integrity result; never silently repair without result |
| comprehend | optional closeOpenWindow, maxJobs 1–20 | process pending semantic windows/jobs |
| replay / resummarize | at, optional briefingOnly for replay | regenerate/review historical semantic window |
| digest | account | current permitted activity digest |
| reportTabSignal | targetId/url/kind activation-media-unobservable, optional audible/dwelled/observedAt/sequence | account-bound browser signal; reject stale sequence |
| summaryModelDefault | account | configured/default summary model |

Exact event normalization, content redaction heuristics, window closing and embedding ranking are draft algorithm-level parity gaps. Implement original behavior and verify recall with known local test activities before claiming acceptance.

## MCP client and local channels

`mcp.testConnection` takes name/server, opens bounded temporary connection and always closes it. `saveServer` accepts name/server, optional previousName/clientSecret; persist configuration, clear stale tool inventory on rename/config change, perform OAuth or connection verification before enabling. Result includes settings, optional credentialError/connection. `deleteServer` removes settings/inventory and owned credentials, reporting partial cleanup errors. `setEnabled` takes name/enabled and checks known server/inventory before enabling. `connect`, `cancel`, `refreshTools` take name and return connection plus settings; `connectionStatus` reads status. Support stdio and streamable HTTP with upstream MCP SDK; OAuth secrets are account-private. Disabled clients cannot execute tools. Do not treat an HTTP 200 as proof of a usable MCP inventory.

Local channel namespaces: `channel.connections.create/list/update/remove/restart`, `channel.pairing.list/approve/reject`, `channel.principals.list/remove/update`, `channel.policies.get/update`. Connection IDs/request IDs are UUIDs; update/remove/restart require owned connectionId, pairing approve/reject require requestId; principals operate on connectionId/senderId; policy mutation takes connectionId/policy. Public connection/principal results are redacted, containing platform/status/display identity/permission state, never bot tokens. Removal stops transport and erases its credentials. A new sender requires local pairing approval before triggering privileged tasks; approved principals and replay are scoped to that connection. Cloud relay/device pairing stays hidden. Exact platform config shapes are draft and must be drawn from independent upstream SDKs, not reference helper code.

## Inbox and notifications

`inbox.ingest`: source, optional externalEventId/threadKey, title/content, optional preview/from(id/name/type)/string metadata. Return message, inserted and matchedRoutines. Deduplicate stable external event identity. Do not insert revoked-origin events; event-trigger evaluation is account-scoped and transactional. `overview` accepts optional messageLimit; returns recent permitted notifications/events and routine delivery state. Grant procedures: `listNotificationGrants`, `getNotificationGrant({origin})`, `revokeNotificationGrant({origin})`, `syncNotificationPermission({origin,permission,source,timestamp?})`; source api/native_ui. Origin normalization must prevent permission sharing across distinct sites. Revocation suppresses future event-trigger delivery.

`uiAttention.reportAgentManagerSessionAttention` records account/session/surface focus and read attention; background/reconnecting stale attention must not mark unseen messages read. Exact nested report schema remains draft pending native/UI contract agreement.

## Vault and password security

Vault plaintext record: id/name/description/icon/appearance/type(personal/shared/everyone), optional orgId, role/shared, created/updated time and revision. Local release provides personal vaults; shared/org cloud surfaces stay hidden. Item data: id/vaultId/category/title/subtitle, URLs/match strategy, tags/favorite/state/reprompt, agentAccessPolicy(always/while-unlocked/never), sections/notes/attachments, optional document metadata, loginFields/loginType(password/oauth/passkey), OAuth hints, passkeys/passwordHistory, purpose/conflicts/revision/import provenance.

Use independent libsodium authenticated encryption and Argon2id derivation as required by plan. Never reuse reference ciphertext formats/keys. Exact envelope version, KDF parameters, nonce and key-wrapping representation are **draft independent design work for L6**, to be documented and tested with tamper/wrong-password/recovery cases. Do not claim cryptographic parity from API shape alone.

`vault.getSnapshot`, `getSnapshotRevision`, `listVaults`, `getItem(itemId)`, `getItemHistory(itemId)` require unlocked appropriate account. `createItem/createItems` accept original item fields without generated id/times/revision; update uses itemId plus partial fields; delete uses itemId. Vault create requires nonblank name and optional type/appearance; update requires vaultId/name/appearance; delete requires vaultId. `ensureInitialPersonalVault` is idempotent. `resolveConflict(itemId,conflictId,action apply/dismiss)` uses revision checks. `getAgentAutofillPayload(itemId,targetUrl,agentSessionId)` validates session authorization, URL matching, unlock/reprompt/access policy and returns only the appropriate fill payload to the authorized actuator; never expose secrets in ordinary transcript.

Cipher transport works while plaintext vault is locked: `cipher.getUnlockContext` returns encrypted master-key/security metadata; `getSnapshot` returns encrypted vault/item/access/keyset data and revision; `getRevision` returns revision; `putVault` and `putItem` take encrypted data and optional nonnegative baseRevision, enforce conflict checks; deleteVault(vaultId), deleteItem(itemId), listItemHistory(itemId). Encrypted item metadata includes category/state/favorite/reprompt/access policy and optional URL match metadata. Encrypted vault metadata includes type/appearance and wrapped access keys. Whether URLs remain plaintext is an independent threat-model decision, not permission to leak a password.

Password-manager procedures are nested: `passwordManager.accounts.list/select/connectCurrent/disconnect/setSyncEnabled`; local selection/connection works without cloud. Email/connect cloud procedures return unsupported. `passwordManager.auth.status/setup/unlock/lock/biometricStatus/biometricEnroll/biometricRemove/biometricUnlock/unlockAll/biometricUnlockAll/lockAll/verifyRecovery/recoverPassword/changePassword` manage native-backed local vault state. Setup/new password requires at least 8 characters; current/unlock password is nonempty. Setup includes recovery entropy; recovery verifies entropy and rewraps keys; password change verifies current password. Lock clears decrypted secrets from active state. Touch ID enrollment/unlock uses OS-protected owner credentials through helper. Exact recovery/key envelope is draft L6 design.

`externalPasswordManagers.list/legacyAccounts/importPreferences/migrationPlan` return discovered/configured/migration metadata. Additional observed procedures connect/save/reveal/deletePassword/disconnect/importPassword require provider identity; save/connect use password only in private transport, importPassword requires accepted=true plus connection/source. Avoid implementing a broad reveal API unless needed by approved UI; reveal is authenticated, reprompted and no-store. Provider exports 1Password/Bitwarden/LastPass/Dashlane/Proton/Apple/CSV map to independent import pipeline with review/count/errors. Never read owner's managers without task authorization.

Import procedures inventory: `applePasswordsImportSupport`, `detect1PasswordDb`, `prepare1Password`, `commit1Password`, `resolve1PasswordReferences`, `import1PasswordAttachment`, `cancel1Password`, `importAppleCredentialExchange`, `appleCredentialExchangeStatus`, `cancelAppleCredentialExchangeSession`, `appleCredentialExchangeDirectImportTarget`, `installAppleCredentialExchangeApp`, `launchAppleCredentialExchangeApp`, `openApplePasswordsApp`, `reportAppleCredentialExchangeFailure`. Prepare takes nonempty password/accountUuid, attachment takes itemId/fileName/base64, cancel/status use import sessionId. Aux helper must provide own app identity/temporary directories. Exact Apple credential exchange and DB decoding schemas remain draft; implement from public export formats, never copied parsers.

`search.items` filters text/category/favorite/state/url/vaultId/tags and returns accessible vault matches. `siteMetadata(url)` returns site display metadata; `brandTitlesByDomain` accepts at most 100 domains. `checkPasswordExposure` must use privacy-preserving upstream breach lookup (never transmit full password); exact input/output schema remains draft. `auditLog.list` accepts limit 1–500 default 50, offset>=0 default 0, optional since/until; `record` takes event without server-assigned timestamp. Do not log plaintext secrets. Vault-local settings get/set/update/reset include lock timeout, autofill/submit preferences, inline menu, suggestions/save/change-password prompts, TOTP copy, excluded domains and URL matching; locked state is enforced independently of settings.

## Browser/helper/utility routers

`capture.fullPage` and `viewport` take nonempty targetId, resolve only the permitted bound profile/target and return captured image metadata/bytes; full page differs from visible viewport. `lasso.transform` accepts selected content plus transformation instruction/model context and streams bounded transform progress/result/error to requesting extension; exact request schema remains draft with UI lane. No auto-send or clipboard replacement without authorized interaction.

`tabs.list({sessionId})` returns tracked session tabs; `resolveByTarget({targetId})` maps to owned session tab; `remove({sessionId,sessionTabId})` untracks/closes only the corresponding authorized tab. Native/CDP methods are in SP3 spec.

`meta.resolvePath` takes account/session-relative path and returns absolutePath after boundary validation; `open` invokes OS opener on approved file; `copyFile` places an authorized artifact/file on clipboard; `listOpenApps` returns compatible running-app metadata; `openWith` requires approved target and app identity. localhost transport is required in addition to file permission. Exact app descriptor schema is helper-owned draft.

`fullDiskAccess.check` returns granted/not_detected/unknown. `request` opens native instructions/permission flow and returns completed boolean; unsupported platforms fail explicitly. Never infer granted merely because settings pane opened.

`onboarding.detectBrowsers`, `detectPasswordManagers(optional currentProfilePath)`, `detectAISubscription`, `analyzeUserApps(optional positive days/limit)` inspect authorized local metadata and return installation/setup candidates. Detection is read-only and must not import data or sign users in.

`developers.getAuxBrowserSkill`, `checkCliInstallation`, `installCli`, `checkAgentInstallations`, `installAuxBrowserSkill({id})`, `refreshAuxBrowserSkills` expose original CLI/skill installation. Use new Aux names, preserve owner customization, report actual found/written paths. `agentRuntime.status/job/install` show bundled independent runtime availability/install progress; download sources are pinned upstream artifacts with hash/license verification, never reference component updater endpoints.

## Local stubs and telemetry

`analytics.capture/captureException/identify` accept compatible event data and return success without outbound telemetry. `isFeatureEnabled(key)`/`isExperimentalEligible` use local known flags only. Cloud-only routers billing/referrals/org/sync/remoteControl return explicit typed unsupported results and remain hidden; remoteControl.status may report enabled=false/localOnly=true. Billing procedure inventory: getSubscription/getUsage/createCheckout/createAddOnCheckout/createPortal/setAutoReload. Sync status/trigger/resolveConflict are cloud unsupported. Org membership/group/vault-sharing procedures are unsupported. No update/sign-in/remote-sharing behavior is implied by these placeholders.

## Remaining acceptance gaps

This inventory covers every requested router family but does not establish every nested response schema or algorithm. Open items: exhaustive helper event schema; Apple/manager import formats; all native CDP commands; crypto envelope/KDF parameters and Touch ID recovery; service-global REPL helper signatures; exact channel configs and lasso payload; event normalization/ranking thresholds; 35-vs-current skill manifest reconciliation. These must be resolved by independent design, public upstream docs and functional observations before full parity is claimed. Returning empty arrays or success stubs for these local features does not satisfy the plan.
