# Mandatory real readiness and source revalidation

Ordered follow-up to provider b3a0f6aa2 and Cast cbbde8822. Three exact output files: the new private provider, actual transaction header and implementation. No shared checkout writes or UI trigger.

The provider now uses the real ContextHighlight pause/refresh and Skills source Prepare/target Rebind/source Abort. It cold-checks actual queued Toast work, TabStrip clients/streams/native observers/active invocation, UI-controller commands, and the per-window actual AuxAgentTabs Widget ownership guard. No client is disconnected or given a fabricated empty result. ContextHighlight's blanket presence guard is removed only with the concrete same-overlay lifecycle; other explicit unknown-source guards remain.

PreparedBindings gains a mandatory actual revalidation callback. Initial collection still runs cold before security/cache/source effects. Actual cache constructors may synchronously invoke observers, so immediately before empty suppression/source detach the core re-collects readiness and compares the same actual window/toolbar/location/sidebar/avatar/media/education identities. If new clients, commands, toasts, widgets or unsupported owners appeared, it returns rejected recoverably. The source identity and collections are untouched; any genuinely created positive-owned cache remains managed by the existing ownership lifecycle. This is not a CHECK pretending the initial query cannot change.

The existing transaction-in-progress owner guard now spans actual cache construction too, preventing nested source switches/close through constructor observers. It is still RAII-restored on every real reject/security/not-change path. No new native window activation, profile event, group-sync result or renderer state is synthesized.

Required source proposal prerequisites:

- 99ecfc40f ContextHighlight lifetime/null-active-tab fix.
- 7f9e4f1cd real TabStrip receiver/stream/native observer/command query.
- e7d2148e1 actual Skills/queued-Toast lifetime and empty-model observation fix.
- Root 809801abe per-window real Widget guard.
- Child weak-bound callback cleanup follow-up for all newly introduced member scopes, before runtime use.

The new internal provider still requires its GN registration beside Features as documented in b3a0f6aa2. Existing transaction sources are already registered. No additional source list entry in this follow-up. Root owns apply/GN/build.

Verification: exact independent replay of provider and Cast parents, then independent disposable replay of these three files and SHA checks PASS. No native compile, actual cache/window/renderer execution, owner profiles/data, Keychain/OS grants, or UI/runtime parity acceptance. Remaining actual sync-listener/optional-service sources and original gesture settlement must be completed before enabling a trigger.
