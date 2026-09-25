# Native saved-password handoff

Patch `0026-profile-password-handoff.patch` adds `native.fillSavedPassword` to the authenticated Chromium Profile host. A program step supplies only a page ID, its exact expected HTTPS URL, and CSS selectors for the password field and optional username field. The request schema rejects credential references, values, and unknown fields. The Electron and standalone hosts have no implementation and fail closed.

The fork resolves the page through that Profile's tab catalog. It requires the visible, selected tab in the active window and its primary main frame. The exact committed URL and navigation ID must remain stable through target inspection, password-store lookup, user approval, and fill. An isolated-world check requires a unique, visible password input in a form whose submission origin equals the document origin. An optional username selector must identify one input in the same form. The check runs again after approval.

The browser queries only its owning Profile and account password stores, then filters to exact HTML login realms and origins. A native account-choice sheet provides action-time approval, followed by device authentication. The request expires after 55 seconds; cancellation and stale documents do not fill. Once approved, Chromium's `PasswordManagerDriver` fills the focused form. Only a typed nonsecret status returns through the host socket. No password or account label is returned to Node, the model, or the step ledger.

The existing origin policy, final review, approval provenance, and Guardian gate run before native dispatch. The native checks independently enforce Profile, page, origin, form, and user choice. `credential_fill_unittests` covers exact HTTPS origin and request-field rejection; the runtime tests cover missing host, cancellation, stale target, and rejection of secret-bearing responses.

The patch was generated against the isolated 0021 source plus 0024. The host-neutral typecheck and focused tests passed. Native compilation and a saved-password browser journey remain pending integration with the Chromium 154 API migration and patch 0025; no user password or personal Profile was used.
