# Protected local data boundary (STORE working inventory)

This is the source inventory and migration plan for the S12 STORE outcome. It is not a qualification record. `state.sqlite`, its WAL, runtime backup snapshots, artifacts, and Git objects must be inspected separately before claiming that sensitive data is protected at rest.

## Current source and native boundary

Atomic `native.profileStorageRoot` and `native.profileStorageFactor` provisioning and scoped native restart/migration journeys passed on September 28; see the [combined-runtime 14-table native manifest](../release/test-artifacts/native-store-protected-startup-2026-09-28-b/manifest.json). Device authentication, reviewed recovery transfer, the remaining SQLite inventory, and full STORE qualification are pending. The native build identifies source `aa996397`; runtime-only changes were staged afterward through integrated `bfc71328`.

`apps/runtime/src/store/protected-startup.ts` activates only these fully adapted columns before repository services start:

| Table family | Protected fields |
| --- | --- |
| `model_calls`, `events` | `provider_metadata`, `error`; `payload` |
| `page_sets`, `set_members` | `name`, `result_schema`; `url`, `record_key`, `label`, `error` |
| `programs`, `response_metadata` | `name`, `description`, `site_key`, `parameters`, `steps_json`, `preconditions`, `postconditions`; `url`, `method`, `content_type` |
| `results`, `datasets` | `source_url`, `values_json`, `evidence`, `error`; `source`, `schema_json`, `values_json`, `provenance` |
| `run_messages` | `text`, `context_page_refs`, `error` |
| `safety_approval_requests`, `safety_send_journal`, `safety_audit` | `action_json`; `text`, `digest`, `error_code`; `payload` |
| `operation_implementations`, `operation_reconciliations` | `executable`, `evidence`, `stats`; `note` |

Each registered table is migrated transactionally with stable primary-key AAD; a marker rejects later plaintext, invalid ciphertext, or unavailable key material. The current database is compacted after a migration changes rows. Historical backups and exported copies are not rewritten by this startup process.

Schema v25 and source adapters now also support protecting `runs` and `steps`, using a durable `run_lookup` metadata projection for direct SQL consumers. Conversation titles and filtered `kv` values have source adapters and migration checks. **None of these four families is in `ACTIVE_PROTECTED_TABLES` yet.** Before activation, review the retained `run_lookup` fields, and make portable backup creation and restore page-recall sanitization decrypt/re-encrypt protected run/KV rows without exposing retained JSON. An unadapted sanitizer currently reads `runs.config` and `setting:conversationAttachments:*` as plaintext. `conversations.title` and legacy `setting:gatewayApiKey` can duplicate sensitive data until the reviewed migration is activated; older offline backups remain outside current-file compaction.

- `space-memory/` generations are encrypted files. Current writes use a Profile Keychain root, a derived `space-memory` store key, a disposable Keychain generation factor, and random wrapped data keys per file. Legacy generations remain readable for migration. Forget retires the previous factor before removing the previous generation. Historical offline copies plus their historical factor and root remain readable if someone saved them earlier.
- `content_memory.ciphertext` contains encrypted page text. Current candidate writes use the same hierarchy under the `page-memory` domain. Legacy `v1` rows are migrated transactionally; the old `pageMemoryKey` is retired after migration. Explicit Forget, origin exclusion and retention pruning rotate the factor and re-encrypt retained rows.
- The native vault and Chromium password store keep actual credential secrets outside `state.sqlite`. `vault_items`, grants, account labels, origins and access metadata remain plaintext in SQLite. Calendar and MCP OAuth tokens are Keychain secrets, but their account/server metadata remains in SQLite.
- SQLite is not SQLCipher. A page or database copy can still expose every plaintext column listed below. The Keychain hierarchy does not encrypt those columns by itself.

## Sensitive column inventory and remaining work

The canonical schema is `apps/runtime/src/store/db.ts` (v24). This table groups every column that can carry user text, observed page content, provider metadata, local paths, secret-adjacent metadata, or an agent transcript. The protected fields above are listed here for completeness; the other fields remain plaintext or need a documented retained-metadata decision. IDs, counters and timestamps are omitted unless their value is a user URL/path or an access token. The accompanying service-owned tables follow the canonical rows.

| Store | Columns requiring encryption or an explicit retained metadata decision |
| --- | --- |
| `kv` | `value`, including `setting:gatewayApiKey`, conversation context/attachments/images, workspace memory/policy and provider settings; keys may contain chat/page identifiers. |
| `sessions`, `pages`, `tabs` | labels/details; URL/title/favicon/`json` and navigation targets. Browser History is also in native Chromium, so this requires a cross-store policy. |
| `page_sets`, `set_members` | names, URL, labels, record keys, result schema, errors, member IDs and program references. |
| `runs`, `run_messages`, `conversations` | goal/config/result/error/failure/status message; user message text/context refs and chat title. SQL currently queries `runs.config` and `runs.result` with `json_extract`. |
| `steps`, `results`, `datasets` | inputs, expected/outcome, source URL, values/evidence/error, dataset schema/values/provenance. |
| `content_memory` | `ciphertext` is encrypted; `origin` and keyed `source_key` expose site membership while URL/text remain sealed. Retention timestamps and workspace identity remain metadata. |
| `programs`, `operations`, `operation_implementations`, `operation_invocations`, `operation_reconciliations` | names/descriptions, site key, parameters, executable steps, schemas/guards, evidence/stats, inputs/errors/notes. |
| `artifacts`, `result_versions` | artifact path/media type, revision lineage; artifact file bytes remain outside SQLite and need a matching migration. |
| `model_calls`, `events`, `spans`, `response_metadata` | provider metadata/errors, event payloads, span attributes/outcomes, URL and request metadata. These can repeat model/user text or secret-adjacent values. |
| `history`, `history_projection_staging`, `history_fts` | URL/title and full-text index. Encryption cannot preserve the existing FTS behavior without a separate searchable projection or moving search to bounded process memory. |
| `bookmarks`, `bookmark_articles`, `bookmark_folders`, `downloads` | URLs/titles/folder paths, saved article JSON, filenames/paths and download-source `kv` entries. |
| `safety_*`, `command_escalation_*`, `action_intents`, `action_transitions` | approval/action JSON, standing-grant origin/recipient, send text, audit payloads, command bodies, effect evidence and challenge origins. Safety journals must retain crash recovery and authorization checks after migration. |
| `workspaces`, `tasks`, `task_revisions`, `task_evidence`, `criterion_reviews`, `criterion_verifications` | Space/task names and JSON, evidence/reviews/verifications. |
| `agent_connections`, `calendar_connections`, `vault_items`, `vault_grants`, `vault_access` | connection labels and token hashes, account keys/labels/scopes, credential labels/usernames/origins/account labels, grant scope and access details. Actual vault/calendar secrets are native/Keychain backed. |
| `routines`, `routine_revisions`, `routine_runs`, `goals`, `hooks`, `hook_invocations` | definitions, parameters, result/error text and event bodies. |
| `plugins`, `plugin_assets`, `outbound_mcp_servers`, `outbound_mcp_grants`, `subagent_groups`, `subagents` | names/descriptions/content, server bodies/tool grants, child-agent bodies. OAuth tokens remain in Keychain. |
| `site_user_css`, `site_zap_rules` | CSS, origins and selectors; selectors may reveal private page structure. |
| Service-owned `run_transcript`, `page_claims`, `safety_suspensions`, `safety_decisions`, `ai_spend` | transcript payloads, observation claims, safety context and provider cost metadata require the same audit; the service DDL must be included in migration tests. |

## Migration and recovery plan

1. Define a versioned envelope and exact AAD for each table/column group. Use a Profile root in the OS credential store, HKDF-separated store keys, random data keys, and revocable Keychain factors for deletion domains. Keep root and factors out of model context, logs, screenshots and ordinary JSON exports.
2. Move SQL filters and indexes off ciphertext before changing columns. Keep only explicitly reviewed metadata in plaintext; use keyed blind indexes where exact matching is needed and bounded in-memory search for text. In particular, replace `json_extract(runs.config/result)` and `history_fts` queries with maintained projections before sealing those fields.
3. Migrate one adapted table family at a time within an immediate transaction using the versioned envelope and per-table marker. Verify every row's identity/AAD and count, then compact the current database/WAL after changed rows. Where direct SQL predicates require plaintext, redesign those queries and indexes before adding a table to startup. A failed migration rolls back that table and fails startup; it never silently drops rows or falls back to plaintext writes.
4. Audit SQLite WAL, free pages, prior `runtime-backup` snapshots, artifact files, Git objects and managed recovery sets. Rotating the current factor blocks current Aux-managed recovery of forgotten generations only if old factors are retired and managed snapshots do not preserve them. An already exported offline ciphertext copy together with its historical valid key cannot be remotely erased.
5. Recovery creation and import require native device authentication and explicit owner review. Export only a versioned, authenticated, phrase-encrypted package for the selected current data and factors. On import into a second Profile, re-encrypt under its own root and identity. Wrong phrase, tampering, stale managed generation, missing Keychain root/factor and interrupted import have distinct non-destructive states. A remembered old offline package remains restorable outside Aux's managed revocation boundary.

The owner approved the recovery boundary: Forget refuses older **Aux-managed** backups and issues a new recovery package, while previously exported files remain restorable with their original phrase. The product must explain that an offline copy and its phrase cannot be revoked at recovery creation and Forget confirmation. The exact retained metadata set remains open before STORE can be called complete.
