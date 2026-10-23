# Confirmed browser Sync recovery enrollment

Inactive, count/hash-pinned integration proposal. This changes the existing account Sync recovery row and reuses the supplied recovery modal, phrase grid, save helper, checkbox and three-word confirmation components. No CSS, window, sidebar, glass or icon changes. The generic component exports are reused without importing the excluded password-manager module or its queries.

The explicit Enable/Regenerate action generates the existing 12-word/16-byte entropy format. Finish requires saving the browser-only recovery file, acknowledgment and three correct words. The existing recovery-input ABI remains unchanged; the supplied decoder accepts the numbered downloaded file. Regenerate creates another backup of the **same** Sync key. Historical encrypted revisions remain retained; this does not revoke old recovery material.

The account/user/generation tuple is captured, keyed on the modal, freshly revalidated against the actual account/status queries before dispatch, and checked again in the daemon before client construction. The mutation uses `gcTime:0` and resets on completion/close/unmount. Cancellation and late generation invalidate controller state; JS references are cleared, with no claim of secure string/DOM/transport zeroization. A confirmed request already dispatched cannot be rolled back by closing its UI.

## Root integration

1. Use `adaptAuxRecoveryEnrollmentUI` only in state 2. `mode:'stage-prebranding'` accepts the exact existing account hook projection before ordinary branding; its branded output equals `mode:'accepted'` on the current accepted UI. Three count-one edits; only the account asset changes.
2. Copy exactly the two files returned by `materializeAuxRecoveryEnrollmentUI` as fixed sibling UI assets. Keep all existing CSS and other accepted UI files unchanged.
3. Apply `adaptAuxRecoveryEnrollmentDaemon` after the existing recovery phase, before OS8. Five count-one edits pair required status metadata, owned-current eligibility, and optional expected-user/generation mutation fields. State 1 is unchanged.
4. Prepare `materializeSyncRecoveryDesktop()` once asynchronously, retain its fixed `aux-sync-recovery.mjs` artifact and 98-input inventory, then let the existing synchronous driver verify/copy those bytes. Keep its existing post-cold-refusal preload placement. This is a successor to the historical recovery asset, not a change to its old evidence.
5. Backend status fields `recoveryConfigured`/`recoveryRevision` require the coordinated backend successor `af240ac81`. Missing metadata refuses parsing rather than falsely reporting no backup.

The new runtime client preflight handles the owned-key `device_required` rotation path: after authenticating the current recovery head, the signed v2 recover action restores the absent server row with that same local CSK and head commitment, verifies receipt/status/current context, then enrolls the new envelope with CAS. It never republishes local keys or uses ordinary enrollment as a bypass. A lost restore reply can be retried by observing the server's now-ready state. Conflicts/generation changes refuse. The old phrase recovery path is unchanged.

## Focused evidence and remaining gaps

`tests/check.mjs` executes the supplied pure BIP39 helper and actual extracted transformed account/status/mutation callbacks with captured boundaries. It checks save/ack/word gating, cancellation, owner changes, mutation cleanup and expected-owner dispatch refusal. `tests/server-preflight.mts` executes the new client with the source-authentic signing/transport/publisher bridge captured in memory: same-key server restore, lost reply retry, conflict and owner-change refusal; no local republish. `verify.mjs` pins accepted/frozen sources, parses both daemon projections/UI assets/new runtime, proves stage composition equality and exact reuse of all ten presentation class strings. No full daemon/app/React view was evaluated.

Actual app build, visual observation, signed native admission and end-to-end account enrollment remain root integration work. First setup with **both** no recovery head and absent server key still refuses: there is no authenticated recovery commitment permitting the bounded preflight; no new authority or ordinary-enroll bypass is invented. Unsupported hardware/installation ABI remains the existing recovery bridge refusal. No owner data, real network/DB/native/Keychain/OS/provider access or signing was used here.
