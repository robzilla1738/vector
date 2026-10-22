#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../../../.."
proposal=docs/integration/proposed
output=$(mktemp -d /tmp/aux-owned-os-custody.XXXXXX)
trap 'rm -rf "$output"' EXIT
python3 scripts/native-build.py xcrun swiftc -swift-version 5 -D AUX_MINIMAL_RUNTIME_DISPATCH -D AUX_MACOS_UTILITY_DISPATCH -framework AppKit -framework QuickLookThumbnailing -framework ImageIO \
 "$proposal/aux-native-p256-envelope-port/source/EnvelopeRecords.swift" \
 "$proposal/aux-native-p256-envelope-port/source/RecoveredP256Authority.swift" \
 "$proposal/aux-native-p256-envelope-port/source/AuxNativeEnvelopeV2.swift" \
 "$proposal/aux-native-pq-continuation/source/PqEnvelopeRecords.swift" \
 "$proposal/aux-native-pq-continuation/source/RecoveredPqAuthority.swift" \
 "$proposal/aux-native-signing-port/source/RecoveredP256SigningAuthority.swift" \
 "$proposal/aux-native-signing-port/source/RecoveredPqSigningAuthority.swift" \
 "$proposal/aux-installation-command-core/source/AuxInstallationCommandCore.swift" \
 "$proposal/aux-runtime-target-capture/source/AuxRuntimeTargetCapture.swift" \
 "$proposal/aux-owned-dispatch-lifetime/source/AuxOSDrainResult.swift" \
 "$proposal/aux-owned-dispatch-lifetime/source/AuxOwnedCommandDispatcher.swift" \
 "$proposal/aux-native-macos-utilities/source/AuxOSJobCustody.swift" \
 "$proposal/aux-native-macos-utilities/source/AuxUtilityCompletion.swift" \
 "$proposal/aux-native-macos-utilities/source/AuxMacOSUtilityCommandCore.swift" \
 "$proposal/aux-native-macos-utilities/source/AuxAppKitUtilityBoundary.swift" \
 "$proposal/aux-os-job-custody/tests/owned/main.swift" -o "$output/check"
"$output/check"
