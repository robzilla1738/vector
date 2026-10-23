#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
p="$repo/docs/integration/proposed"
output=$(mktemp -d /tmp/aux-native-fresh-stage-test.XXXXXX)
trap 'rm -rf "$output"' EXIT
xcrun swiftc -D AUX_NATIVE_FRESH_STAGE_FIXTURE -target arm64-apple-macos13.0 \
 "$p/aux-native-p256-envelope-port/source/EnvelopeRecords.swift" \
 "$p/aux-fresh-bootstrap-policy/source/AuxFreshBootstrapPolicy.swift" \
 "$p/aux-native-fresh-stage-reconciliation/source/NativeFreshBootstrapJournal.swift" \
 "$p/aux-native-fresh-stage-reconciliation/source/PrivateNativeFreshBootstrapJournalStore.swift" \
 "$p/aux-native-fresh-stage-reconciliation/source/AuxNativeFreshStageCoordinator.swift" \
 "$p/aux-native-fresh-stage-reconciliation/tests/main.swift" -o "$output/check"
"$output/check"
