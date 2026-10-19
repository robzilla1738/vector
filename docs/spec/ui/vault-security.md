# Vault security controls and generator details

Status: **ready** for the timeout choices/default and daemon expiry behavior, secret-copy clearing, and generator controls below. Per-item reprompt authorization and native credential-exchange interoperability remain **draft**. Evidence is static analysis only; no live reference profile, credential or Keychain was accessed. Sources VF1–VF6 in `../provenance.md`.

## Lock timeout

The default is10080minutes (seven days). The settings control offers15,60,240,480,1440 and10080minutes, plus an unlimited choice represented by-1. A finite timeout is measured in minutes. The observed API schema accepts an integer; behavior for custom values outside the displayed menu has not been accepted as a UI requirement.

Password setup and a successful unlock establish the current expiry. Successful daemon operations that acquire the unlocked Vault key renew expiry to the current time plus the selected interval. Settings replacement, partial update and reset also renew the deadline using the resulting setting. Reading auth status does not renew a positive timeout. Treat the control as inactivity since unlocked Vault use, not elapsed time since the initial unlock, and do not let a status-polling loop keep the Vault open indefinitely.

On expiry, the next status/key access reports locked and cannot return a decrypted key or record. An active expiry mechanism should clear unlocked state promptly even if no client reads status. Manual lock remains authoritative under the unlimited setting; unlimited must not undo an explicit lock. Setup, unlock, timeout change and reset recompute the deadline only after successful acknowledgment. Failed unlock does not renew an earlier grant. Locked state clears decrypted UI records, masks, pending fill secrets and private authorization grants; subsequent use requires the normal account gate.

The reference's extension-local key cache initially stores an absolute unlock deadline, while the daemon also renews the authoritative deadline during unlocked-key operations. The combined browser behavior has not been observed live. Aux's independent daemon remains the single source for its own key lifetime; this document does not prescribe copying a second extension-local secret cache.

## Secret-copy lifetime

Copy succeeds only after the clipboard write succeeds. The temporary copied indicator lasts about two seconds. Copying a sensitive Vault field schedules clipboard clearing after30seconds. Repeated sensitive copy schedules the current clearing deadline anew. The reference uses a browser alarm and an offscreen clipboard operation so closing the popup does not cancel the scheduled clear. A configurable clipboard-expiry menu was not found in the inspected target settings;30seconds is the observed sensitive-copy duration, not a guessed menu default. Ordinary nonsensitive copy and generated-password copy are not established as using the same secret-copy path.

The reference clear operation writes an empty text value; static evidence does not show a comparison with a clipboard value copied by another app in the meantime. Any independent Aux choice to preserve a newer unrelated clipboard value must be documented as its own safety decision and verified separately rather than attributed to the reference.

## Password and passphrase generator

The generator offers character-password and word-passphrase modes. Character-password length ranges from8to64, default20. Uppercase, lowercase, numeric and symbol groups are individually selectable; at least one must be enabled. The target defaults enable all four groups, request at least one numeric and one symbol character, and avoid visually ambiguous characters. The internal generator configuration additionally carries minimum numeric/symbol counts and an optional custom symbol set, but separate visible controls for those fields were not found in this popup. Do not claim they are exposed by the reference UI; Aux may implement them as independently documented additional controls.

Passphrases support3–10words, a separator of1–3characters, capitalization of each word's first letter, and an optional three-digit numeric suffix separated like the words. Defaults: four words, a hyphen separator, capitalization enabled, numeric suffix disabled. The exact reference dictionary must not be copied. Aux must source an independently licensed dictionary and use cryptographic sampling; do not preserve an implementation defect or bias merely to imitate reference internals.

Changing generator options or explicitly regenerating creates a new candidate. Copy reports actual success; accepting a candidate places it in the editor. No candidate becomes a saved credential until the user saves the item. Candidate persistence beyond the current generator surface is not established.

## Per-item reprompt: unresolved boundary

An item-level boolean is stored, defaults false for new items, survives editing and conflict/history projections, and has a user-readable history-field description. These are ready data-preservation requirements. The inspected target popup/editor/background and daemon paths do not establish a live toggle or an additional credential challenge when reading, revealing, copying or filling an item with this flag. No scope, grace period, one-use grant or biometric substitution contract has been verified.

Do not invent a supposedly reference-compatible reprompt protocol from the boolean alone. An Aux implementation may continue to reject enabling/using protected items until an independent secure protocol is specified; it must not silently treat a protected item as an ordinary item or claim reprompt parity. This is an explicit incomplete feature, not an accepted success state.

## Native exchange: unresolved boundary

The existing import spec inventories an OS credential-exchange session and helper. A session distinguishes pending, importing, success, failure, cancellation and expiry; it tracks password/passkey totals and completed counts. New import invalidates an earlier active session, and cancellation stops future work. Account/profile targeting, an unlocked destination Vault, explicit user consent and passkey-key validation are required. Generic CSV/JSON export import does not establish native exchange support.

Native callback schema details, public OS eligibility/entitlements, actual system permission flow and independently implemented key conversion still need separate evidence. No helper or credential-provider extension has been launched for this investigation.
