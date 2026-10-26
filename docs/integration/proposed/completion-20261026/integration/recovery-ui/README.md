# Classify and remove a closed legacy recovery schema

`assets/-types-Wy38XkNB.js` contained the sole Agent literal `aside.recovery.auk.v1`. It was not a new encrypted-envelope writer or the current Aux sync-recovery format. Its unexported Zod schema graph is:

- `I`: old purpose recovery.auk / envelopeVersion aside.recovery.auk.v1 / nonce / ciphertext validator.
- `_` and `B`: old Argon2 parameter and pending AUK security-setup validators; B references I.
- `E` and `Y`: Vault-sync mode and local-bootstrap validators; Y references B and E.

Acorn source analysis establishes **zero identifier consumers outside those five declarations**. None is exported. The eight actual module exports (`c,K,j,H,G,S,V,F`, with their existing aliases) serve account redirect/error/popup/email/browser-context UI and remain unchanged. The separately constructed common account/session/registry schemas are preserved. This is a proven closed legacy setup branch, not permission to rename cryptographic headers or reinterpret an old export.

`transformAuxClosedRecoveryUi({path,text,source})` in `vendor/provided/aux-closed-recovery-ui.mjs` removes only those five declarators through one count-pinned statement replacement. `source` is the exact original A38 asset; `text` is current accumulated source. Parse, exact reverse replay, repeated-transform refusal, unchanged exports and absence of the dead pending setup/old envelope literal passed. No encryption/decryption, native API, key, profile, ciphertext or owner-state read occurred.

## Actual current contracts stay unchanged

The current daemon's `accountRecoveryBackupSchema` explicitly rejects the old AUK path with “Legacy account recovery is unavailable in this Aux build.” Legacy cryptographic helpers similarly refuse rather than trying a different derivation label. That actionable refusal is retained.

Actual account UI calls use `accounts.auth.recoverSyncKey` → `recoverAccountSyncKey` → `makeAuxSyncRecoveryClient(...).recover`, and the enrolled-key counterpart. Enrollment requires explicit saved/verified12-word entropy and expected user/generation; missing confirmation refuses. The copied app's actual `Resources/aux-crypto/aux-sync-recovery.mjs` and current cloud `src/sync-recovery-crypto.ts` use **aux.sync-recovery.v2**, with its own Aux challenge/request/CSK/enrollment-proof domains. `src/sync-recovery.ts` and the paired desktop client use `/sync/recovery/v2/*`. A v3 adapter/credential protocol revision must not be confused with this encrypted envelope's v2 discriminator. None of those live schemas, labels, routes, keys, fields or producers changes here. Existing old ciphertext is not adopted or migrated.

DOM IDs such as `aside-recovery-key` are label/input associations, not the envelope version or KDF input. Desktop may rename those IDs and matching label/ARIA consumers independently through its exact Agent batch.

## Other structured findings

- `aside.at` in `artifact-test-CdjpLuI1.js` is not an artifact API. It appears three times as `jun@aside.at` in calendar-event demo attendee data. Desktop can replace it with `jun@example.com`, preserving fixture shape without inventing an Aux contact or sending mail.
- `@chrome-aside/models/inventory-changed` and `@chrome-aside/billing/changed` in `strip-markdown-DRcmtuJc.js` are same-module Agent broadcast constants. `q1`/`Y1` produce through `Xs().broadcast`; `J1` consumes through `Yr`. Renaming each shared constant pairs producer and receiver. The separate daemon model-inventory path emits `models:inventory-changed`, consumed by `Nc` over the authenticated event-bus WebSocket; that literal and data schema remain unchanged. These Agent names are not native URL schemes and do not require a C++ scheme change or native rebuild. No daemon `@chrome-aside`/`@chrome-aux` producer was found in actual paired-a8; do not claim a literal daemon protocol repair from these UI-only edits.

Root composes this one asset with desktop's remaining nineteen-file Agent batch. It is source evidence only; no app edit, projection, signing, grants or execution occurred.
