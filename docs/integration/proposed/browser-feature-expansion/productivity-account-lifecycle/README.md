# Supplied productivity account-instance lifecycle

Source adaptation only; no provider, browser, owner-profile, credential, or cloud operation was run.

The two producers retain the authenticated `accountProcedure` account snapshot, its supplied `createdAt` instance check, `incarnationId`, identity fields, and external-owner revocation epoch. Their existing native-derived `browserProfile.profileId` travels with the request and must match a captured account-registry profile binding throughout the request. No default profile resolution or new authority is added. CLI-only `accountInstanceProcedure` is deliberately not referenced from the models router: its initializer is separate, while the shared `assertAccountInstance` function is already available.

The supplied `onAccountAuthChange` listener immediately aborts a request when actual deletion/replacement or authentication revocation invalidates that snapshot. Each asynchronous selection/model-resolution/inference boundary and the final broker return rechecks the instance and native binding. Settings and ModelsManager are captured once after admission rather than reacquired by a reused numeric account ID. Cancellation requires the same request, profile and authenticated account instance. Listeners and request entries are removed in `finally`.

## Evidence and limit

- Static source: `/private/tmp/aux-offline-runtime-source-20261023/index.mjs`.
- Whole static source SHA-256: `ecff19ddbc7fa76529c50111152f8324ef0ba6b87de11e7ecf872f76270a7484`.
- Pinned selected account assertion, notification, revocation, lookup and remove-method excerpt SHA-256: `d440bb5454ac54845c70b731be814e76cdc4dc05a3832ba7f41790af24fa5bb7` (test hashes the JSON object of exact excerpts).
- Eleven focused offline checks pass, executing the actual supplied assertion/event/remove methods with synthetic in-memory account storage and deferred model doubles. Coverage includes removal during selection, same-timestamp incarnation replacement during resolve, immediate inference cancellation, late-result suppression, profile rebind refusal, final broker-return check and benign account rename.
- Ten existing producer/adaptation checks pass, including syntax of composed static UI and both daemon entrypoints; existing CSS class inventories are unchanged.

The supplied `ModelsManager.resolve(modelId, provider)` has no AbortSignal argument. An already-started internal catalog/auth lookup can finish; these adapters do not falsely claim to stop its underlying work. The existing broker awaited-work fence stays pending until it actually returns, and the result cannot start inference or leave the handler after its account instance is revoked. Provider completion receives the real abort signal. Live native/account/provider acceptance remains a separate step.
