# Vault popup, unlock and autofill surfaces

Status: **ready** for UX flow, field categories and measured popup dimensions; cryptographic parameters/API shapes belong to daemon spec and visual baselines remain **draft**. Sources: SP2-V1/V2 in `../provenance.md`.

## Popup shell

Popup is600×432px, fixed no body overflow. Use a split item-list/detail layout, each independently scrollable. Item list minimum250px and maximum384px; flexible detail pane uses raised white/dark background,11.2px corners and0.5px boundary, with6px inset around the inner pane. Search header32px with32px icon actions. Group headings28px with12px label; item rows rounded11.2px,4px inset,10px icon/text gap,14px title/12px subtitle. Sidebar filtering, vault selection, sorting and add-item controls remain reachable when list scrolls. Match theme but disable outer glass where host requires opaque popup. Dialog overlays in popup do not blur the entire host.

## Locked/setup/recovery

States: disabled, checking account, uninitialized, locked, biometric in progress, unlocking, unlocked, failed, recovering and reset confirmation. Checking/disabled states are real, not empty vault. Unlock field masks password; reveal is explicit; wrong password leaves locked state and clear original error. Touch ID exists only with real enrollment/available helper; fallback remains password. Lock clears decrypted UI data and invalidates cached access.

Setup confirms unlock password, creates encrypted vault through daemon and provides recovery key with save/copy and verification. Recovery takes file/words, verifies key, chooses replacement password and saves replacement recovery key; explain old-key invalidation. Reset requires explicit destructive confirmation and must not imply that unrecoverable encrypted items can be restored. No UI-devised KDF or plaintext persistence.

## Item model and detail

Primary categories: login, card, secure note and identity; imported records may preserve bank account, database, software license, driver/passport/membership, server/email/network credentials, SSH keys and custom field sections. Detail supports title, subtitle, tags/favorite, vault assignment, secure fields, URL list and notes. Login fields include username/password, websites and one-time code; cards include holder, number, expiry, security code and optional PIN/metadata. Identities include names, contact/address and organization fields. Unknown imported fields remain user-readable rather than silently dropped.

Secrets are masked until reveal/copy. Copy feedback reflects actual clipboard write; use configured clipboard expiry if backend provides it. URL actions navigate to the item address safely. Password history can show versions and restore via supported backend; destructive item delete confirms. Edits retain unsaved values on failure; success refreshes the authoritative snapshot. Empty vault, no matching filter, loading and snapshot failure are distinct.

## Generator and autofill

Generator exposes backend-supported password length/character options and passphrase options, creates fresh randomness, offers regenerate/copy/use and gives an accurate strength indication where supported. Do not use predictable browser Math.random. Generated value is not saved until user accepts.

On supported pages, an inline accessible control opens matching login suggestions for current origin/field. Choice fills only the selected frame/form; never fill hidden unrelated fields or another origin. Save/update suggestion appears after observed login submission and requires user acceptance; update identifies existing item. Cards and identities fill only selected matching fields. Passkey creation/use uses native/WebAuthn semantics with explicit authenticator and origin; do not emulate successful registration without cryptographic backing. Autofill menu handles locked Vault by unlocking then resuming the exact pending target, and rejects stale/navigated targets.

## Import/export/settings

Support authorized1Password, Bitwarden, LastPass, Dashlane, Proton, Apple Passwords and generic CSV flows per daemon importer spec. Preview source/count/errors and selected destination vault; incomplete/invalid rows produce useful errors. Prevent silent duplicate multiplication on retry. JSON/CSV exports are explicit user actions, warn about sensitive plaintext and use chosen destination; no automatic export. Settings manage password change, recovery-key replacement, biometric enrollment/removal, vault create/rename/delete and destructive data clear. Cloud sharing/sync/org controls are hidden locally.

See [security and generator details](vault-security.md) for the evidence-backed timeout and generator controls, secret-copy clearing and explicit reprompt/native-exchange gaps.

## Acceptance and unknowns

Use a disposable test site/account for save/update/autofill/generate/card/identity/passkey/import, lock and recovery. Verify masked secrets never enter logs/general settings cache, origin/frame targeting and stale-page behavior. The static follow-up in `vault-security.md` establishes timeout defaults/choices and generator options, while distinguishing the extension-local cache from daemon idle renewal. Per-item reprompt authorization, live native exchange, KDF interoperability and every imported custom category field constraint remain unresolved; never guess security contracts.
