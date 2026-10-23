#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
p="$repo/docs/integration/proposed"
output=$(mktemp -d /tmp/aux-native-fresh-stage-test.XXXXXX)
trap 'rm -rf "$output"' EXIT
xcrun swiftc -target arm64-apple-macos13.0 \
 "$p/aux-native-p256-envelope-port/source/EnvelopeRecords.swift" \
 "$p/aux-fresh-bootstrap-policy/source/AuxFreshBootstrapPolicy.swift" \
 "$p/aux-native-fresh-stage-bridge/source/NativeFreshBootstrapJournal.swift" \
 "$p/aux-native-fresh-stage-bridge/source/PrivateNativeFreshBootstrapJournalStore.swift" \
 "$p/aux-native-fresh-stage-bridge/tests/main.swift" -o "$output/check"
"$output/check"
