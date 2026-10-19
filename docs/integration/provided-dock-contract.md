# Supplied macOS Dock contract

Static target: the supplied original Chromium153 arm64 framework, SHA25664c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c. The bounded audit `vendor/provided/audit-native-dock.py` verifies the slice and exact instruction bytes/range hashes; it never loads the framework or queries OS state.

The actual get-state handler at0x814c024 calls0x303395c, whose code follows Chromium's real Dock presence reader: read Dock persistent-apps, obtain current outer bundle path, compare membership, return0 for read failure /1 absent /2 present. The handler builds:

| Field | Observed native expression |
|---|---|
| supported | true |
| isAdded | presence !=1 |
| canAdd | presence ==1 |

The comparisons and boolean materialization occur at0x814c04c/050 and0x814c0e0/0e4; the field literals are referenced at0x814c068,0x814c0ac and0x814c0f4. The add handler at0x814c190 invokes the actual add primitive at0x814cf04 and then reuses the state handler. This is a concrete state-based contract, not an inferred filesystem-writability heuristic or unconditional canAdd.

The original isAdded expression includes read failure. Preserve this observable quirk for the supplied UI; canAdd remains false on failure, so it cannot trigger an unproven add. The Aux adapter also retains the existing known/inDock fields, making uncertainty and positively established presence observable to other clients. Neither field claims successful OS modification.

`proposed/native-provided-dock-results.patch` adds these exact public fields around the existing real Chromium Dock action. The original onboarding's isAdded/canAdd decision now has the expected values. The actual Add remains an explicit user action; no action, OS permission, Dock read or owner state was used in verification. The patch is staged only and C++ remains uncompiled.

The original import-input handler prefix at0x4276580 includes argument validation, browser-context checks and sourceProfileId/dataKinds lookup. This proves the supplied input names, but not absence of later/inherited gesture guards. The independently added user_gesture restriction remains unresolved rather than being removed from incomplete negative evidence.
