#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
p="$repo/docs/integration/proposed"
output=$(mktemp -d /tmp/aux-native-fresh-target-cases.XXXXXX)
trap 'rm -rf "$output"' EXIT
xcrun swiftc -D AUX_NATIVE_FRESH_TARGET_FIXTURE -target arm64-apple-macos13.0 \
 "$p/aux-native-p256-envelope-port/source/EnvelopeRecords.swift" \
 "$p/aux-fresh-bootstrap-policy/source/AuxFreshBootstrapPolicy.swift" \
 "$p/aux-native-fresh-stage-reconciliation/source/NativeFreshBootstrapJournal.swift" \
 "$p/aux-native-fresh-retained-journal/source/PrivateNativeFreshBootstrapJournalStore.swift" \
 "$p/aux-native-fresh-target-coordinator/source/NativeFreshTargetJournal.swift" \
 "$p/aux-native-fresh-target-coordinator/source/PrivateNativeFreshTargetJournalStore.swift" \
 "$p/aux-native-fresh-target-coordinator/source/AuxNativeFreshTargetCoordinator.swift" \
 "$p/aux-native-fresh-target-coordinator/tests/main.swift" -o "$output/check"
"$output/check"
