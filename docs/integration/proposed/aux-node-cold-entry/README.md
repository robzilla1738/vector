# Generated Node-development entry cold refusal

This follow-up changes only `vendor/provided/daemon-node-development.mjs` and its focused test/evidence. It requires the parent's already integrated daemon cold-entry adapter. No daemon/CLI adapter, stage manifest, native checkout or generated output was edited by this lane.

For state2, the generator requires exactly one existing first `AUX_COLD_ENTRY_REFUSAL`. It keeps that throw first and places destructuring bindings from `await import("./assets.mjs")` immediately afterward. The original static assets import is absent, so ESM cannot initialize that module's realpath/layout code before the refusal. There is no second assets gate, acceptance override or changed asset module. The code remains valid ESM with top-level await; all later supplied references retain the same binding names. The extra development edit is recorded in the generated manifest.

For state1, the original static import prefix and every generated/copied file remain exact. `state1-baseline.json` pins all four old generated file hashes/lengths/modes and the original generator source hash.

`node --experimental-vm-modules --test vendor/provided/daemon-node-cold-entry.test.mjs` passes two focused cases. The generator under test uses the actual workspace composed daemon adapter through a VM linker (read-only, not a copied replacement). It generates from the actual pinned supplied binary. The resulting full state2 index is linked using builtin-only undefined bindings; its dependency list excludes assets.mjs, evaluation throws the exact quarantine error and the dynamic-import callback is never invoked. Thus neither an actual asset module nor any filesystem/native/provider function can initialize through this evaluation. The second case compares all four state1 output hashes, bytes and modes with the previous baseline.

No signed program, daemon, owner state, native addon, helper or browser was executed. State2 remains quarantined; this does not establish all-writers closure or activate migration.
