# Aux Vault

Independent local Vault popup and content actor, implementing the explicitly documented first slice of `docs/spec/ui/vault.md` and `docs/spec/daemon/services.md`. Cryptographic format and threat boundaries are in `docs/design/vault-envelope.md`.

Build with `pnpm --filter @aux/vault build`; the generated public Vault extension identity and its `dist/manifest.json` are ready for a disposable Aux profile. Typecheck with `pnpm --filter @aux/vault typecheck`. Dependencies/fonts/glyphs come independently from the shared UI package and public npm packages; their notices are retained there.

The popup uses native P-256 challenge signing as `password-manager-extension` and authenticated local tRPC. Missing native account support gives an actionable error. Setup/recovery displays a new recovery key once, requires saved-key confirmation and a six-character verification, and preserves the screen while auth state polls. Lock clears decrypted popup state. Snapshot/read failures remain visible and do not become empty successful vaults.

Saved logins, cards, identities and secure notes have original editors, masked secrets, deliberate reveal/copy, tags/favorites, per-record history with revision-checked restoration, configurable password generation, rotating one-time codes and explicit delete. JSON/CSV exports warn about readable credentials and use the native destination chooser. Recovery-key replacement verifies the current password and retains the new key until saved-copy verification. User-selected CSV/Bitwarden/Aux JSON files have a real preview and explicit import, with row errors and retry deduplication. Unsupported encrypted exports/native manager databases are not treated as these plaintext formats.

Manual fill uses a separate Vault content script. A user focuses a visible login field and chooses a saved login. The background resolves the native profile/account, validates the saved login's origin, actual tab mode/top URL and exact Chrome document identity, then sends minimal values to the selected frame. The content actor validates a fresh single-use token, unchanged full URL and connected visible selected form fields. It never submits a form. No page-world message bridge, generic agent field fill or secret logging is used.

Verification includes a real disposable daemon and cryptographic native-signing test shim, production popup setup/verification/create/lock/wrong-password/unlock observations, and independent DOM actor checks for selected-field isolation, no submit, replay/stale URL/detached-node/foreign-sender rejection. These are separate from native API and pixel parity acceptance.

Touch ID uses the optional private native helper adapter. Enrollment verifies the current password; returned keys must authenticate the current Vault before unlock. Availability/enrollment controls come from the helper; no biometric prompt has been invoked during verification.

Vault preferences now rename Vaults with revision checks and remove only empty Vaults. A dedicated passkey service and consent module are implemented with fresh verification and encrypted private records; native ceremony integration and actual local relying-party verification remain outstanding.

Explicit submitted-login save/update and selected card/identity fill actors are implemented; full-navigation save remains unavailable because stale document/form identities are rejected.

Remaining: real-device Touch ID enrollment/unlock observation; linked passkey/WebAuthn, one-time-code and selected-field UI acceptance; auto-lock controls; native credential exchange/encrypted provider exports; full screenshot parity. Per-item reprompt is rejected until its additional authorization exists. The background never stores decrypted records or fill secrets persistently.
