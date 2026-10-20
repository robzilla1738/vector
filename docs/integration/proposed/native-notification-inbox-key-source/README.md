# Original notification inbox key and save-path prerequisites

Source-only companion to the full notification delivery port. No Keychain or notification operations were executed. Root owns the carrier/query-family/provider implementation; these source pins do not authorize operating that new family and do not extend earlier runtime acceptance.

Original service constructor `0x32f48ac` installs the notification-service vtable and sets byte `+0xa8` to true at `0x32f49bc/c0`. Therefore its save/dispatch path is enabled at construction; it is not an inferred feature, account or authentication flag.

## Original master key

`0x40daccc` calls read helper `0x40da744` with exact service **Aside Agent Master Key**, account **Aside Agent**, no group pointer/length, and final DP flag0. Its original logical names are source inputs; Aux must isolate the actual selectors through the reviewed fixed carrier/query boundary. The helper is distinct from installation signing keys and must never reuse one.

Read query:

- class generic password;
- exact service/account above;
- return data=true, match limit one;
- `LAContext.interactionNotAllowed=true`;
- no access group, explicit keychain/search list, synchronizable or DP-keychain selector in this original call.

If and only if the original read reports item-not-found, the master helper generates **32 random bytes** and stores their **UTF8 base64 encoding**. Creation has eight dictionary entries: generic-password class, service, account, label equal service, accessibleWhenUnlocked, isInvisible=true, valueData=that base64 text, and a noninteractive LAContext. `SecItemAdd` success returns those bytes; duplicate-item (`-25299`) re-reads the same selectors. Other errors return unavailable, with no owner-item fallback. The consumer base64-decodes the stored text before the32-byte AES key is used.

The proposed blocking provider contract, owned by root, is:

```cpp
std::optional<std::array<uint8_t, 32>>
LoadAgentInboxMasterKey(const base::FilePath& home);
```

It is called only on a MayBlock worker. Its source-known new family must default-deny separately from the four earlier carrier commands; old acceptance does not cover it. No flag is enabled by this proposal.

## Original persistence envelope

Original worker `0x40f7e38` opens the actual per-profile SQLite path produced by appending `AsideInbox` to `Profile::GetPath()`; `PermissionAuditingLogs` is the SQL histogram/database tag, not a second pathname. Schema is the pinned `inbox_entries` table (autoincrement ID, created_at, site_url, encrypted_payload, is_persistent). It serializes the real payload, encrypts with AES-256-GCM and a fresh nonce, and preserves the original binary envelope prefix **ASIDEAI1**, followed by nonce and authenticated ciphertext. Internal cryptographic format bytes are not branding.

The complete source is retained as bounded LLVM ranges plus the unchanged authorized supplied master-key decompile (with its normal pseudocode limitations). `source-evidence.json` pins their original bytes and file hashes. The save worker also returns failure when the key is unavailable; the delivery owner must retain the genuine `inbox_save_failed` Agent dispatch fallback rather than inventing a saved ID or dropping the notification.
