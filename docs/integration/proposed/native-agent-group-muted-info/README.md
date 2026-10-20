# Original agent-group mute export

This one-case follow-up fixes the actual full161 compiler failure in `chrome/browser/extensions/extension_tab_util.cc`. It adds `TabMutedReason::kAgentGroup` to the existing `api::tabs::MutedInfoReason::kUser` branch. Baselinec6919164; outputd8ecdb44. No enum values, JSON schema, mute policy, extension ID, profile/auth boundary or native build registration changes.

## Exact supplied behavior

The original native owned-audio helper041e331c calls SetTabAudioMuted at041e3398 with muted=true, reason5 and empty extension ID. Its release path compares the real metadata reason to5. That producer and its dedicated ownership policy were already recovered and ported in `native-agent-group-model`.

The actual reason getter076832e0 initializes LastMuteMetadata, retrieves the actual per-WebContents user-data object, and returns the reason field at+10. A bounded direct-branch scan found four original direct callers:02cd9724 (content-setting observer),041e334c (owned group release),07631cc8 (exported tab-object creation),07d3934c (native sound policy). This is a direct-call inventory, not proof that no indirect use exists.

At07631c9c the exported tab-object creator initializes MutedInfo to zero, stores the actual WebContents audio-muted bit, then calls that getter at07631cc8. Its next instructions subtract2 and unsigned-compare the result with4. Reasons2,3,4,5 enter the same branch, writing exported enum1 at stack+4. Reason1 enters a separate branch writing exported3 and copying the real LastMuteMetadata extension ID. Reason0 keeps enum0 and no extension ID. The resulting MutedInfo is copied into the actual Tab object's+38 field. This is direct original source behavior, despite the broad public description of `user`.

Actual original serializer0c489ad4 writes the `muted` boolean, reads enum+4 and maps0 to omitted `reason`,1 to literal `user` at0d8d8ddc,2 to `capture`,3 to `extension`. ExtensionId is written only when its actual optional field is present. The original Tab serializer0c48a94c passes Tab+38 to that very function and stores its result under literal `mutedInfo` at0dea9fa2. This closes the value-flow proof from native reason5 to actual public string `user`; no guessed capture, extension or missing-reason substitute is used.

Current155 retains native reasons0..4 with the same ordering, and the existing recovered group enum appends5. Its generated tabs API also maps kUser to `user`. Joining that one existing branch preserves the supplied export without adding a new wire value. Muted=false after actual group-owned unmute still reports the real last-change reason as supplied; the change does not fabricate a user action or change the internal ownership reason5.

## Verification and integration

`python3 docs/integration/proposed/native-agent-group-muted-info/verify.py` verifies the pinned original arm64 extraction/instruction/string ranges, statically evaluates the original dispatch block for reasons0..6, checks the actual serializer linkage, pins current155 enum/schema/generated serialization and replays the exact one-line patch in a disposable tree. It does not execute the supplied binary or access any browser state. The only native source diff is one case label; a verifier asserts all other bytes remain unchanged.

Parent owns applying the proposal after its active build terminates, compiling the actual extension_tab_util object and resuming the full native build. No compile/runtime acceptance is claimed by this static fixture. No shared native writes, app launch, OS dialogs, signing or owner-state access occurred.
