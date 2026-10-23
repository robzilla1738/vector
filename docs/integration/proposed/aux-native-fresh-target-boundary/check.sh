#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
p="$repo/docs/integration/proposed"
proposal="$p/aux-native-fresh-target-boundary"
output=$(mktemp -d /tmp/aux-native-v2-target-boundary.XXXXXX)
trap 'rm -rf "$output"' EXIT
# Final actual production graph is checked by the paired target coordinator.
# Here only new decoder/boundary effects are exercised with fixed synthetic
# software imports; no actual authenticated context, Security or factory runs.
xcrun swiftc -D AUX_NATIVE_FRESH_TARGET_BOUNDARY_FIXTURE -target arm64-apple-macos13.0 \
 -module-cache-path "$output/cache" \
 "$p/aux-native-p256-envelope-port/source/EnvelopeRecords.swift" \
 "$p/aux-native-p256-envelope-port/source/RecoveredP256Authority.swift" \
 "$p/aux-native-p256-envelope-port/source/AuxNativeEnvelopeV2.swift" \
 "$p/aux-native-pq-continuation/source/PqEnvelopeRecords.swift" \
 "$p/aux-native-pq-continuation/source/RecoveredPqAuthority.swift" \
 "$p/aux-native-signing-port/source/RecoveredP256SigningAuthority.swift" \
 "$p/aux-native-signing-port/source/RecoveredPqSigningAuthority.swift" \
 "$p/aux-installation-command-core/source/AuxInstallationCommandCore.swift" \
 "$p/aux-fresh-bootstrap-policy/source/AuxFreshBootstrapPolicy.swift" \
 "$p/aux-native-fresh-stage-bridge/source/NativeFreshBootstrapJournal.swift" \
 "$proposal/source/AuxNativeFreshTargetBoundary.swift" \
 "$proposal/tests/CapturedContext.swift" "$proposal/tests/main.swift" -o "$output/check"
"$output/check"
