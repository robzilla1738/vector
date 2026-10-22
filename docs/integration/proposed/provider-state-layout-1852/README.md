# Actual supplied1852 provider persistence contract

Static audit of the exact frozen daemon/CLI SEA source and Agent JavaScript. No account files, browser profiles, credentials, SQLite databases or renderer storage were opened. `source-anchors.json` pins extracted source hashes, byte positions, exact anchors and occurrence counts. This is the original implementation contract; existing Aux staging already changes selected names/home variables, so integrate a transaction against its actual final transformed loaders too.

## Filesystem map

Original `ASIDE_HOME_PATH` uses the explicit environment home or `.aside`; Aux adapters isolate this as the Aux home. With numeric account ID `n`, `getAccountRoot(n)` is `<home>/u/<n>`. The helper also accepts a string root; an integrator must not permit arbitrary roots through migration APIs.

| Actual path | Store / loader | Actual provider references |
| --- | --- | --- |
| `<home>/accounts.json` | `AccountRegistryStore.fromFile`, `accountRegistrySchema`, `FileJsonStoreBackend` | `accounts[]` login provider is **google/email/anonymous**, not the managed model provider. Preserve it. `sessions[accountId]` contains accessToken/refreshToken/expiresAt. Profile binding and bootstrap maps are independent. |
| `<home>/u/<n>/settings.json` | `SettingsStore.fromFile` + `settingsSchema` | `defaultModel.provider`, `imageGenerationModel.provider`, `customModels[].provider`, `modelCategories.{fast,standard,deep,visual}.provider`; original managed catalog preference field is `asideModelCatalog:{added,removed}`. |
| `<home>/u/<n>/models.json` | `ModelsJsonStore.fromFile`, `modelsJsonConfigSchema`, `stripJsonComments` | `providers[providerId]` is the actual provider map. Config can contain apiKey, headers, modelOverrides, baseUrl and custom command/environment expressions. Preserve all values except explicitly reviewed product identity fields. |
| `<home>/u/<n>/credentials.json` | `CredentialStorage.create`, `FileJsonStoreBackend` | Entire file is the provider-keyed record: e.g. `{aside:{type:"api_key",key:...}}` or OAuth objects. **There is no enclosing credentialStore field.** |
| `<home>/u/<n>/cache/models.json` | `CacheStore.namespace` + FileJsonStoreBackend | Keys are the literal JSON strings of arrays, e.g. `["models","provider-catalog","aside"]`. Values have `{value:{models,visibleModelIds},updatedAt,invalidated?}`. `RemoteModelCatalog.entry/refreshProvider` uses these keys. |
| `<home>/u/<n>/state.db` | supplied SQLite/Drizzle state database | `sessions.model` is JSON text containing a model selection; `routines.session_config` is JSON text containing optional `model`. These require SQLite transactions, not JSON-file replacement. |

`credentials.json`, `models.json` and `accounts.json` are explicitly classified by the supplied `secretPaths` helper. Their cleartext file-backed nature does not authorize opening an owner's files or publishing transaction snapshots.

### Actual encryption boundary

The FileJsonStoreBackend code reads UTF-8 with `readFileSync` and directly `JSON.parse`s it; writes call `atomicWriteFileSync(JSON.stringify(...))`. CredentialStorage stores provider values directly via this backend. `getModelAuth` returns `key` for an api_key entry and processes original OAuth fields without a DK envelope. Therefore **renaming a top-level credentials.json key `aside` to `aux`, preserving its exact value, is not itself a purpose/AAD change**. It must still reject conflicting existing destination entries, preserve OAuth data and concurrency, and coordinate every caller.

This conclusion is specific to the real credentials file. It does not validate a synthetic `{credentialStore:{aside: encryptedBlob}}` layout. There are no literal `credentialStore`, `providerCache` or `modelCatalog` fields in the shipped daemon source. A pure helper using those wrapper field names is a virtual model, not an integration with this persisted state.

The separate supplied DK API operates on `{purpose,nonce,ciphertext}` and derives HKDF info plus AEAD AAD from `aside.dk.${purpose}.v1`, rejecting purpose mismatch before decrypt. Native installation wrapping separately authenticates `aside.wrap.dk.v1`. Those encrypted records need the explicit versioned cryptographic migration; moving their opaque bytes to a renamed key does not migrate labels or ciphertext. Agent-file cloud sync is another encryption/transport boundary: after a credentials file changes, its hash and any encrypted remote object must reconcile through the actual sync path. Do not reinterpret remote ciphertext as a local plaintext JSON snapshot or replace original sync authority with the new transaction's checksum.

AccountRegistry tokens are also directly persisted as JSON in the supplied implementation. Do not confuse `accounts[].provider` with `settings.defaultModel.provider`; changing `anonymous`/`google`/`email` to `aux` fails the actual registry schema.

### Loader and concurrency implications

FileJsonStoreBackend takes proper-lockfile locks and exposes corruption recovery that may rename corrupt files and generate defaults. A migration must validate snapshots without invoking that recovery path on malformed source: reject and preserve them instead. AccountRegistry reload can normalize/write binding maps; CredentialStorage OAuth refresh and synced replacement both write their files. Settings and cache have live in-memory snapshots. Quiesce these writers under a reviewed startup fence and explicitly reload all affected consumers after the durable filesystem transaction commits. An external rename while the daemon is running is insufficient.

ModelsJsonStore accepts comments and trailing commas through `stripJsonComments` and writes normalized JSON; it has file-signature reload behavior rather than the same FileJsonStoreBackend locking. Account backups under `<home>/backups/accounts` are real historical registry backups and may contain credentials; do not scan, rewrite or erase them opportunistically.

## Agent browser storage is a separate transaction domain

The actual Agent hook `assets/use-agent-settings-DiedG0R1.js` uses:

| Key | Storage / content |
| --- | --- |
| `aside.agent-settings.v2:<accountId>` | renderer `window.localStorage`; JSON string with modelProvider, modelId, thinkingLevel, fastMode, proactiveMode |
| `aside.settings-inventory.v1:<accountId>` | renderer localStorage; JSON string containing availableModels[], connectedProviders[], subscriptionPlan and visibleModelIdsByProvider |

Inventory model references are `availableModels[].provider`; connected entries use `connectedProviders[].providerId`, not `.provider`; visible IDs are keyed by provider under `visibleModelIdsByProvider`. `connectedProviders` includes fields such as type, state, linked and hasModelsJsonAuth. The hook validates only that the two major inventory fields are arrays when loading a cache; use stronger shape and account scoping in a migration rather than assuming that proves every value is valid.

Original hook `$` derives inventory keys with `${prefix}:${accountId}`; function `D` derives selection keys similarly. These values prime UI queries and are subsequently overwritten by real account-qualified daemon inventory/settings. Migrate the exact qualified keys and their nested provider references before enabling the renamed hooks, then invalidate the corresponding query caches. Do not read another account's key as fallback.

`assets/draft-storage-ixLojjZ5.js` separately uses sessionStorage plus a legacy localStorage fallback for `aside.chat-draft.v2:<sessionId-or-supplied-scope-or-new>`. It writes current drafts into sessionStorage and removes the legacy localStorage copy. `aside.sidepanel-new-session-settings.v1:<scope>` is sessionStorage JSON with a nullable `draftModelOverride:{provider,modelId,thinkingLevel,fastMode}`. `aside.chat-pending-new-session-message.v1` is a sessionStorage claim record, not a provider cache. Draft scope is a supplied argument, not automatically an account ID. The original `aside.last-permission-mode.v1` and `aside.last-final-confirm.v1` keys are global preferences, not account-qualified model selections.

`chrome.storage.local`, `chrome.storage.session`, renderer localStorage and renderer sessionStorage are distinct stores; the Agent's token cache intentionally uses chrome.storage.session and removes legacy persistent copies. Never transplant that cache into a persistent file migration. Actual storage migration needs an extension/renderer-owned transaction and acknowledgement; directly editing Chromium LevelDB files or pretending these are `<home>` JSON files is not integration.

## CLI and fixture scope

The exact supplied CLI contains SDK documentation mentioning models.json/settings.json but has no original daemon credentials/accounts filesystem loader or literal credentialStore/providerCache/modelCatalog map. It chiefly uses the daemon API and model wire values. Update protocol/provider arguments together rather than inventing a second CLI credential file.

`virtual-fixture.json` contains only synthetic data using the actual relative file paths and JSON shapes, plus explicit separate renderer storage strings and selected SQLite row values. Materialize `homeFiles` only under a new disposable root. Create a full state database using the supplied migrations before using `sqliteRecords`; the selected JSON columns are not a replacement schema. The fixture does not execute the original loaders and is not runtime acceptance.

Remaining integration boundaries are the startup write fence and original schema-compatible filesystem commit; a real SQLite migration for active session/routine model identities; account-qualified extension/renderer storage acknowledgement; reload/invalidation; actual cloud-sync object reconciliation; and the separately reviewed original DK/native authority migration. None is proven merely by a generic journal or synthetic provider-state test.
