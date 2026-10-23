#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
p="$repo/docs/integration/proposed"
output=$(mktemp -d /tmp/aux-retained-journal-check.XXXXXX)
trap 'rm -rf "$output"' EXIT
python3 "$p/aux-native-fresh-retained-journal/verify.py"
xcrun swiftc -target arm64-apple-macos13.0 -module-cache-path "$output/cache" \
 "$p/aux-native-p256-envelope-port/source/EnvelopeRecords.swift" \
 "$p/aux-fresh-bootstrap-policy/source/AuxFreshBootstrapPolicy.swift" \
 "$p/aux-native-fresh-stage-reconciliation/source/NativeFreshBootstrapJournal.swift" \
 "$p/aux-native-fresh-retained-journal/source/PrivateNativeFreshBootstrapJournalStore.swift" \
 "$p/aux-native-fresh-retained-journal/tests/main.swift" -o "$output/check"
"$output/check"
