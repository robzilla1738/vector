# Restore the actual native session for durable drafts

The approved disposable Work state demonstrates an identity lookup failure, not a lost draft or a task-service dependency. Only reviewed key identifiers, encoded value length, native session extra-data IDs and the explicit startup-pref presence were read. The 669-byte draft remains under the old stable page ID. The same logical tab has a different page ID after URL-only rematerialization. See `session-draft-restore-observation.json`; no draft body or attachment contents were read.

The two-file source patch uses existing native owners:

- `InitializeFreshProfileIdentity` sets restore-last-session once only after the actual fresh admitted store has acquired its real Aux profile ID. Explicit user preferences, policy and recommended values remain intact; startup URLs are not rewritten. Existing/ambiguous profiles return before this code. Aux Shell and other build selections do not receive this default.
- `SessionServiceBase::BuildCommandsForTab` preserves the exact actual view's existing logical ID when rebuilding its session snapshot, alongside the already serialized page ID. Incremental bindings remain unchanged. Genuine `SessionRestore` already restores both before native tab insertion, preserving separate windows, histories and page identities.

No `OpenLogicalTab`, UI, draft bytes/keys, PageIdentity uniqueness, cryptography or task authority changes. This is queued PrefService persistence, not a durable-write certificate. Existing disposable/owner settings are deliberately not rewritten; the next bounded runtime check should use a genuinely fresh scope, or the owner may choose the existing startup setting through the actual UI. Do not transplant old keys or assign another view's page ID to make an old disposable check appear repaired.

Verification here: four exact anchors against current A58-input native bytes, independent patch application reproduces both output SHA-256 pins, and source guard inspection. No native build, launch, signing or runtime acceptance by this lane. Root should compile only affected owners, then check fresh-profile normal quit/restart with draft, attachment, independent windows and explicit preference preservation. Native source is unchanged by this commit.
