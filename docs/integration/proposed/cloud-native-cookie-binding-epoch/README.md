# Native cookie binding epoch

This additive native metadata change gives each loaded regular profile a random, in-memory binding epoch. The epoch rotates on changes to the registered profile ID, account ID, cloud user ID, persisted-session flag or authentication-paused flag. Profile destruction removes preference observers and clears the value. Private/nonregular profiles receive no epoch. No cookie jar, profile directory, credentials or UI are read or changed by this metadata operation.

`baseline/`, `source/`, `native.patch` and `manifest.json` pin the three input/output files. The manifest records the proposal's original unapplied state; actual execution is recorded separately. Applied under the native build lock through `out/native-reuse-composition-cloud-cookie-epoch`, with the previous native bytes preserved in that composition's apply receipt. The native build and generated-key probe passed: `out/cloud-cookie-epoch-native-build.json`.

This is a capture prerequisite. It does not serialize native cookie writes with profile rebinding, implement restoration, or establish runtime acceptance. The accepted desktop app and existing exact-byte signing review are unchanged. The follow-up in `../cloud-native-cookie-context/` exposes an explicit native context ID and uses this epoch through the original Agent bridge.
