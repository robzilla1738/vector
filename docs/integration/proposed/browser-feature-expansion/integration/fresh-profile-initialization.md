# Fresh Profile identity lifecycle fix

The three-file/four-anchor patch calls the existing `InitializeFreshProfileIdentity(this)` immediately after actual `InitProfileUserPrefs` and before keyed services/extension creation. This covers the initial Default Profile, which need not visit omitted-profile finalization or first-run UI. A real WeakPtr recheck handles synchronous preference-observer destruction.

The existing initializer remains unchanged: actual newly created PrefService store, absent user value, modifiable registered pref and genuine browser-state admission are required; nonempty identities stay unchanged and ambiguous existing missing IDs refuse. `kCreatedPending` still means queued persistence, never durable completion, migration, task or installation authority.

Layering uses the existing header-only `aux:profile_gate` interface, with an opaque forward enum and compatible redeclaration of the existing initializer. `profiles:misc` gains only that header dependency; implementation stays in full UI `profile_gate.cc`. No circular dependency on the compiled `profile_identity` target is added. No default styling/layout/behavior or store-authority checks change.

Exact current native input/output pins and four sequential anchors are in `fresh-profile-initialization.json`; the unified patch applies/reverses and changed-line whitespace/order checks pass in a disposable source tree. No shared native files were mutated or compiled by this lane. Root owns actual native projection/GN/compiler/assembly and the genuine early startup receipt/root ownership. This patch cannot create admission and no ordinary storage-generation fallback is added. Signing and product launch remain separate.
