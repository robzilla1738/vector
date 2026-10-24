# Dormant feature source/native compatibility

Read-only source audit on2026-10-23; no product execution or signature/admission claim.

The protected-startup `daemon-inputs.json` selects the fixed `AuxSealedNativeDaemonEntry.swift` reader and v8 policy. Their actual files match its frozen input hashes. The reader opens only `aux-native-entry.mjs`, retains/rechecks file identity/metadata, validates the actual bytes through `SecCodeValidateFileResource`, and revalidates host identity. There is no compiled JavaScript index/entry digest. The selected native main passes those authenticated bytes to `ModuleData`; the Node runner calls `LoadEnvironment` without another JavaScript source hash constraint.

The v8 policy's fixed `sourceSha256` fields describe PTY/native helper artifacts. Those bytes and the native ABI remain unchanged in the feature pair. Changing them would require a new policy/link review. The final a3 entry is12,261,835bytes, within the reader's32MiB bound.

Consequently the exact existing unsigned native link can be associated with newly composed **dormant** JavaScript resources. `bind-source-pair.py` verifies every frozen link input and artifact, the current adapter pins, actual independent source/entry projections and the successful full browser receipt. ABI sameness alone is not the compatibility argument.

This does not authorize or satisfy runtime admission. Actual bundle resource sealing, host identity, protected startup, writer custody and runtime authority remain required. Updated metadata cannot make unsigned or stale resource seals pass. Signing and release stay separate.

Exact linked source locations are retained truthfully in `docs/integration/proposed/profile-isolation-protected-startup/integration/daemon-inputs.json`: fixed reader around57–83; `AuxNativeDaemonMain.cc` around225; `AuxNativeNodeRunner.cc` around25; v8 policy around182; `AuxSignedFreshBootstrapPolicyLoader.swift` around150. The frozen hashes, not these approximate line numbers, bind the inspected files.
