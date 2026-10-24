# Selected-Space tab cleanup

Source proposal only. The accepted UI layout and default cleanup-off/profile-wide behavior remain unchanged. No app, profile, provider, shutdown, signing or release operation was performed.

## Integration

Apply `native-cleanup-scopes.patch` to the corresponding latest native proposals, preserving unrelated integrator changes. Its eight baseline files were captured from root `integration/source` when present, otherwise `organization/source`. Apply `supplied-cleanup-scopes.patch` at the repository root to the two existing supplied settings adapter/test files. Do not apply the supplied patch to Chromium. `manifest.json` pins every before/after file and both count-checked patches. No new GN registration is needed; the added codec assertions live in the existing authored model test file.

The native patch also adds the previously reported narrow profile-ID/owner-generation check before committing a directional tab drag. It is based on the already integrated directional-drop source.

## Behavior

- The existing organization snapshot is the only store. Optional `cleanup.spaceIds` carries canonical Space IDs; absence preserves legacy all-Space semantics. A stored selected set excludes future Spaces. API `spaceIds: null` explicitly chooses all Spaces; an omitted API field preserves the current stored scope for older clients.
- Scope IDs are bounded, unique and required to exist in the current profile. An enabled empty selection refuses. Unrelated commands cannot carry a scope. Fingerprints retain their exact legacy bytes for unscoped commands; explicit selections participate in persistent replay/conflict handling.
- Removing the final selected empty Space disables cleanup without widening scope. Undo restores the previous scope; scope bytes count toward bounded Undo memory. Codec round trips the optional field and continues to refuse malformed, unknown or newer state.
- The native scheduler checks selected Space membership together with its existing cross-window/active-work/retention protections, including the existing final archive recheck. This does not authorize extra live-view closure or bypass startup/storage admission.
- The supplied cleanup dialog uses its existing rows, switches and typography for All Spaces and each available Space. Actual native Space IDs, generation and revision drive the controls. Save remains durable-callback plus readback; a removed Space or changed profile refuses rather than publishing a fake success. The policy applies on the existing startup cleanup schedule; this proposal adds no second background scheduler.

## Focused evidence

- Seven settings tests passed with Node's experimental VM modules: the existing five pinned-supplied-transform/CAS/lifecycle tests and two selected-Space/removed-Space cases. The transform fixture parsed the actual pinned supplied Appearance and General assets and reversed the adapter exactly, preserving the existing bytes/classes.
- `node --check` passed for the changed adapter.
- Both patches passed whitespace-error checking and exact replay against their pinned baselines (8 native + 2 supplied modified files, no added files).
- Three native model/codec cases are authored, covering replay/scope validation, final-Space deletion with Undo, and legacy/selected/unknown codec state. They have not been run in this lane. Native compilation, actual settings interaction, restart scheduling, cross-window archive and visual acceptance remain integrator/runtime checks; source checks are not a readiness claim.
