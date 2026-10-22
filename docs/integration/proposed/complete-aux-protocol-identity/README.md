# Coordinated Aux protocol rename — native half

Owner-directed identity migration; no visual changes. The eight-file native patch changes actual browser HTTP/CDP token producers/consumers, health identity and both HTTP challenge-domain construction sites. Challenge lengths derive from the complete Aux literal including the explicit NUL rather than retaining the old21-byte length. Exact source hashes and count-checked edits are in `manifest.json`.

This is deliberately **unapplied and uncompiled**. Applying it to a browser with the old daemon/CLI would break installation authentication. The corresponding count-pinned JavaScript protocol transformation is `vendor/provided/aux-protocol-identity.mjs`, currently unactivated. Its replay/challenge fixture passes; it is not proof of an actual handshake. Existing default staging still preserves the compatibility baseline until all consumers can be switched together.

This patch does not complete bridge/schema/dispatch migration, stored-key migration, embedded runtime/addon branding, copied update/domain cleanup, full native/compressed-resource auditing or packaged runtime acceptance. Those are tracked in `docs/plans/2026-10-22-complete-aux-identity.md`. Do not use this isolated patch or older signing receipts as a deployable successor. No owner-state access, signing or UI change occurred.

Independent native audit found a further chat-navigation auth-scheme check outside the initial seven-file proposal. The eighth pinned change updates that check; no visual geometry or rendering code changes.
