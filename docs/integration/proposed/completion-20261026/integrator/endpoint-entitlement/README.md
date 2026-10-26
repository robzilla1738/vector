# Required execution capability: Apple entitlement path

The owner chose **keep required; prepare entitlement path** on October 26, 2026. General Bash, PTY and CLI REPL remain completion requirements. The [exact source/SDK/signature review](../../integration/advertised-tools/scope-review.md) remains authoritative for the missing dependency. This decision does not grant provisioning, signing, release execution or Apple form submission.

Apple's current [API documentation](https://developer.apple.com/documentation/endpointsecurity/es_new_descendants_client(_:_:)) describes macOS 27 descendant-only scope and requires the restricted entitlement, without root or TCC approval. Its [entitlement documentation](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.endpoint-security.client) requires a request to Apple. The official [request entry point](https://developer.apple.com/system-extensions/) leads to a sign-in-protected form. Public Markdown snapshots and hashes are recorded in `sources.json`; no account session was accessed.

The [request draft](request-draft.md) names the existing Team `9F2JXY8TCK` and daemon identifier `dev.aux.browser.daemon`, as pinned by the reviewed A38 signing manifest. The browser, CLI and unrelated helpers are not proposed recipients of this entitlement. Apple's approval is unverified and cannot be manufactured by adding a plist key.

## After owner-approved submission and Apple approval

1. Confirm Apple's actual grant covers the intended Team and daemon App ID. Review its conditions and compatible development-profile path. Retain the existing profiles, certificates and accepted app; do not replace them merely because a request was submitted.
2. Prepare a separately reviewable daemon entitlement/profile delta that retains its existing identity, JIT and required Aux Keychain groups. The exact new profile and executable bytes must be pinned before requesting local signing/activation approval. No broad private-vault access is needed for that review.
3. Join the existing fresh-entry descendant observer before Node/task startup, with its successful subscription/fence and stream-loss refusal. Review browser-only source guards individually against the real live native owner. A compile-flag change alone does not prove correct startup, runtime seeding, exec or PTY producers. Preserve the ordinary profile/bootstrap policy and protected roots.
4. Complete the existing native exec reservation and original sole-reaper/descendant-cohort joins; pair the fixed PTY linked binding with its actual owner while preserving original addon bytes. Keep unknown/pending process custody until actual settlement. Publish the actually supported OS boundary.
5. After exact local execution approval, check one small Bash command, one yielded/cancelled command, one PTY input/resize/exit sequence and one escaped descendant against the real owner. Verify account/session revocation and normal Quit. These focused outcomes establish the capability; entitlement presence or compilation alone does not.

An unavailable entitlement remains an external completion dependency. The local browser, provider, selected-page and fixed-helper work continues independently. Distribution signing, notarization and publishing stay separate.
