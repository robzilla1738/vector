# Actual1852 provider JSON adapters

This supersedes using the earlier virtual `credentialStore`/`providerCache`
envelope as a filesystem layout. The adapter is pure preparation: it performs no
filesystem, renderer, network, Keychain, SQLite or provider operation and never
runs a configuration command. No real account/profile state was read or changed.

The copied `source-anchors.json` and `virtual-fixture.json` are the exact reviewed
static-layout evidence and synthetic fixture from commit74c0e950d. Original daemon
SHA and Agent settings-hook SHA are checked by `verifyAuxProviderJsonSource` when
its caller supplies those static source texts. The tests verify all recorded
actual-source anchors, the real model selection schema and the exact supplied
models-JSON comment parser. These pins describe the original source; root must
also review the final transformed loader and invocation point before activation.

## Filesystem preparation API

`prepareAuxProviderJsonFile({path,bytes,version:1})` returns
`{path,accountId,kind,sourceVersion:1,targetVersion:2,before,after,beforeSha256,afterSha256,changed}`.
Buffers can contain credentials: do not print, commit, place them in public
receipts, or serialize them into an unprotected journal. The hashes support the
existing transaction helper's source revalidation; they are not authentication
or encryption authorities. A caller must copy only `after` into its private
prepared snapshot and preserve the matching expected before-hash.

Allowed relative paths are canonical numeric `u/<id>/credentials.json`,
`u/<id>/models.json`, `u/<id>/settings.json`, `u/<id>/cache/models.json`, and the
single root `accounts.json`. Leading zeros, unsafe account numbers, traversal,
absolute paths, backups and SQLite paths fail closed. Input is bounded16MiB UTF-8.
Malformed JSON, duplicate keys, BOM, invalid encoding and old/new destination
collisions are refused without recovery/default generation. Missing files are a
caller decision; passing empty content does not silently create a store.

- Credentials use the **actual top-level provider map**. Only the `aside` map key
  becomes `aux`; every value remains opaque and semantically identical. OAuth
  refresh/access/state fields, unknown records and wrapped ciphertext fields are
  not decoded, relabelled, regenerated or reset.
- Models use the actual `providers` map. Provider key `aside` becomes `aux`.
  Provider `asideDisconnected`, model `asideSource`, and explicitly named API IDs
  migrate in their known containers. apiKey command/environment expressions,
  headers, unknown config and other provider values stay intact. The exact
  supplied parser supports line comments/trailing commas but not block comments
  or broader JSON5. If no semantic identity changes occur, original bytes,
  formatting and comments are returned unchanged. Changed JSON is normalized.
- Settings migrate `defaultModel.provider`, nullable
  `imageGenerationModel.provider`, `customModels[].provider`, and singular
  `modelCategories.{fast,standard,deep,visual}.provider`, preserving model IDs,
  reasoning/fast-mode and other fields. The managed catalog key migrates to
  `auxModelCatalog`. These are actual named fields, not a recursive replacement
  of arbitrary nested `provider` strings.
- Cache encoded-array keys migrate `["models","provider-catalog","aside"]` to
  the Aux identity and `["models","aside-catalog"]` to `aux-catalog`. Related
  cached model provider references change; timestamps, flags and visible IDs
  remain. Unknown/unrelated cache entries remain untouched.
- Accounts validates `accounts[].provider` as google/email/anonymous and returns
  the original bytes unchanged, including sessions and tokens. These are login
  providers, **never** the managed model provider. It does not normalize or write
  account/profile binding maps or scan historical account backups.

Validation covers the actual named selection/config fields whose identity is
changed. Root must additionally validate snapshots against its complete effective
supplied schemas without invoking corruption recovery, then quiesce all original
writers, durably commit the whole selected state and reload/invalidate consumers.
Do not activate by renaming files under a running daemon. DK/AAD installation
records and encrypted remote agent-file objects are separate boundaries. This
adapter does not migrate encrypted remote state or prove a startup write fence.

## Renderer-owned preparation

`prepareAuxProviderRendererStorage({accountId,entries,version:1})` returns
`{accountId,sourceVersion:1,targetVersion:2,operations}`. Each operation contains
`{sourceKey,targetKey,before,after}` strings for an extension-origin localStorage
transaction/acknowledgement, not a filesystem path. Supply a safe integer account
ID and snapshots from that exact authorized renderer origin. It selects only:

- `aside.agent-settings.v2:<id>` → `aux.agent-settings.v3:<id>`;
- `aside.settings-inventory.v1:<id>` → `aux.settings-inventory.v2:<id>`.

It validates and migrates selection `modelProvider`, inventory
`availableModels[].provider`, `connectedProviders[].providerId`, and map keys in
`visibleModelIdsByProvider`; model IDs, linked/state/auth flags and unknown fields
remain. Other accounts, prefixes, sessionStorage and chrome.storage are untouched.
Conflicts or malformed inventory refuse the entire preparation. Root must
revalidate old strings, atomically write/acknowledge the renderer transaction,
remove old keys only after success and invalidate account-qualified query caches.
Do not edit Chromium LevelDB or relocate session tokens into persistent files.

The earlier pure virtual-envelope helper also now migrates
`visibleModelIdsByProvider` map keys so it cannot silently leave a stale map when
used for an offline fixture. Prefer this actual account-qualified adapter for
integration; the virtual envelope remains a model, not the shipped file layout.

## Evidence

`node --test vendor/provided/aux-provider-json-files.test.mjs` passes five focused
checks: actual source hashes/anchors/schema, actual file shapes/opaque values,
models comment and command preservation, fail-closed inputs, and account-qualified
renderer inventory. Tests execute actual pinned parser/schema expressions with
synthetic values. No paid request or real state operation occurs.

Not yet proven: transactional filesystem/SQLite/renderer startup migration,
concurrent writers and rollback, consumer reload, cloud-sync reconciliation or
actual successor app behavior. There is no new readiness/no-trace claim.
