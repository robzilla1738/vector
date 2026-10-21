# Profile transition rejection diagnostics

Pinned against the two current v563 native preimages in files.json. This is investigation instrumentation for the observed New profile action returning to the old account, not a claim that creation failed or a behavioral fix.

The actual route is AuxProfileMenu::NewProfile -> deferred CreatePrimaryProfile after menu teardown -> ProfileManager::CreateMultiProfileAsync -> DispatchSelectedProfile -> ProfileSwitchRequest -> BrowserWindowFeatures::RunAuxProfileSwitch. A successful create can therefore leave a new genuine profile even when its later in-place switch rejects. Do not repeatedly create profiles to probe it.

This patch emits ERROR-level messages only on failed explicit transitions. Every diagnostic payload is a static stage or owner-type string, prefixed `Aux profile transition rejected:`. It emits no profile identities, paths, URLs, titles, credentials, tokens or arbitrary error objects. It preserves all guards and their evaluation order. No success, layout, timer or general profile observation is logged.

- `unported.*` identifies the first unsupported source or cache owner exactly.
- `bindings.source-*` identifies source readiness (interaction owners, toast, Glic, AI, tabgroup/data protection, view/toolbar/location/private services, bound UI, cookie controls).
- `bindings.cache-*` identifies target/cache identity, support or readiness rejection.
- `transaction.*` identifies entry validation, binding preparation, target lifetime, cache construction, target tab construction, revalidation, tab movement or final browser identity transfer.

One failure can emit a leaf message plus its enclosing transaction stage. A source-readiness group still contains several short-circuit predicates; its label narrows the next investigation without re-evaluating stateful predicates for logging. No readiness check is bypassed or turned into an inferred success. A failure before RunAuxProfileSwitch (creation/load failure or vanished sender) remains outside these two-file diagnostics.

Validation: generated patch preimage/output SHA256 verification, isolated application to copied source, whitespace check. No native build, runtime launch, profile access, Keychain operation or AI call performed by this lane. Integrator should compile the two changed translation units and perform one explicit transition in the approved disposable scope, then inspect only these static rejection lines. Root owns build and live observation.
