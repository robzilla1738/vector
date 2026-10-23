#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
p="$repo/docs/integration/proposed"
output=$(mktemp -d /tmp/aux-native-fresh-stage-types.XXXXXX)
trap 'rm -rf "$output"' EXIT
# Actual sealed reader/probe, native-only factory and stage path, separate files.
# Never link/load/call this graph; no hardware, Security or authority generation.
xcrun swiftc -typecheck -target arm64-apple-macos13.0 -module-name AuxNativeFreshStageBridge \
 -module-cache-path "$output/cache" \
 "$p/aux-native-p256-envelope-port/source/EnvelopeRecords.swift" \
 "$p/aux-native-p256-envelope-port/source/RecoveredP256Authority.swift" \
 "$p/aux-native-p256-envelope-port/source/AuxNativeEnvelopeV2.swift" \
 "$p/aux-native-pq-continuation/source/PqEnvelopeRecords.swift" \
 "$p/aux-native-pq-continuation/source/RecoveredPqAuthority.swift" \
 "$p/aux-native-signing-port/source/RecoveredP256SigningAuthority.swift" \
 "$p/aux-native-signing-port/source/RecoveredPqSigningAuthority.swift" \
 "$p/aux-installation-command-core/source/AuxInstallationCommandCore.swift" \
 "$p/aux-fresh-installation-factory/source/AuxFreshInstallationFactory.swift" \
 "$p/aux-fresh-four-row-preparation/source/AuxFreshFourRowPreparation.swift" \
 "$p/aux-fresh-native-secure-capture/source/AuxFreshNativeHome.swift" \
 "$p/aux-fresh-bootstrap-policy/source/AuxFreshBootstrapPolicy.swift" \
 "$p/aux-fresh-bootstrap-policy/source/AuxSignedFreshBootstrapPolicyLoader.swift" \
 "$p/aux-fresh-native-secure-capture/source/AuxFreshNativeSecureCapture.swift" \
 "$p/aux-native-fresh-stage-bridge/source/AuxNativeFreshBootstrapFactory.swift" \
 "$p/aux-native-fresh-stage-bridge/source/NativeFreshBootstrapJournal.swift" \
 "$p/aux-native-fresh-stage-bridge/source/PrivateNativeFreshBootstrapJournalStore.swift" \
 "$p/aux-native-fresh-stage-bridge/source/AuxNativeFreshStageCoordinator.swift"
echo 'PASS:18 actual fresh bridge Swift inputs typechecked; no loader/factory/probe/Add executed'
