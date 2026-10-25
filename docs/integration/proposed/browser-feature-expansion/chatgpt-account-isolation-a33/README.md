# ChatGPT numeric account reuse audit

A real isolation gap is present. This is a source audit and a bounded synthetic reproduction, not a credential migration or implemented fix.

## Proven current behavior

The actual selected generated daemon's `AccountRegistryStore.addAccount` chooses `max(current account IDs) + 1`. Its `removeAccount` removes the selected slot, and a fully empty registry creates a new default account with ID 0. The profile-slot allocator can also choose an available native profile index. Every new account gets a fresh `incarnationId`; numeric IDs are not permanently unique.

The current ChatGPT consumers call `localAccount(this.accountId)`, which returns only `account:<number>` (or an undefined-account default). The sidecar root is `AUX_HOME/local-only/chatgpt`; its filenames hash that numeric-only account key. The existing actual deletion method removes sessions, local bootstrap and profile bindings. `removeAccountLocalArtifacts` cleans the account control/task roots and MCP credentials; neither method invokes the ChatGPT sidecar sign-out or token removal. Explicit provider disconnect does invoke those operations, but account removal does not do so automatically.

`vendor/provided/cloud-cookie-profile.mjs` already includes actual `account.incarnationId` in its cloud/native binding stamp. That protection does not bind the separate ChatGPT credential namespace.

`node check.mjs` executes ONLY the two exact actual registry methods with mocked in-memory storage and no daemon initialization. Deleting the highest synthetic slot 1 and adding an account returns slot 1 with a different incarnation. Both old and replacement resolve to `account:1`, so the retained synthetic sidecar is selected by the replacement. `source-check.json` records full selected source and exact extracted method hashes. No credential file, account, registry or provider was read or changed.

## Smallest supported correction to implement next

1. Introduce an explicitly versioned account-instance namespace incorporating the actual nonnegative safe numeric account ID and canonical incarnation UUID. Do not use createdAt, a mutable name, an email, the provider subject or an undefined/default account as an equivalent identity.
2. Capture that instance at the real persistent `CredentialStorage` constructor and the OAuth attempt. Revalidate the exact current `AccountRegistry` instance before selected reads, authentication, model results and asynchronous token publication. A stale service or completed request must not resolve the replacement instance's credentials merely by rereading a reused numeric slot.
3. Bind new registration/token records to that instance while preserving the existing issued client/host/verified-subject formats and values. The versioned namespace/outer binding must be explicit. Validate the binding on every read and pending-registration use; a filename alone must not silently upgrade unbound historical data.
4. Refuse legacy numeric-key credentials and pending registrations explicitly. Do not move, overwrite, delete, auto-revoke, reinterpret or copy them into a new incarnation. Leave the original files untouched and require a separate confirmed reconnect/migration decision. Unknown older account records without incarnation also refuse this provider rather than minting an identity opportunistically.
5. On a genuine future account deletion, cancel the exact old instance's pending authorization/refresh operations before it disappears. The local v2 credential lifecycle and best-effort remote revocation must address only that captured instance; failed/unknown remote revocation remains truthful. Never revoke or clear a newly reused slot by numeric ID, and never report remote revocation from local cancellation alone.
6. Pair every actual caller/receiver together: persistent credential reads/auth/remove/logout/refresh, OAuth begin/complete, selected catalog reader and deletion lifetime. In-memory/unbound credential stores must not implicitly use the default account's ChatGPT registration. Preserve all UI and current non-ChatGPT provider behavior.

A focused acceptance case should remove/recreate the same ID during authorization, refresh and model discovery, showing that old callbacks cannot select or publish into the replacement, while a benign account rename preserves the original connection. That source implementation and new versioned credential binding are deliberately not performed by this audit-only commit.
