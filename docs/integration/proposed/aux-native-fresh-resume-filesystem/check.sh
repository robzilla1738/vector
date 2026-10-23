#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
p="$repo/docs/integration/proposed"
proposal="$p/aux-native-fresh-resume-filesystem"
output=$(mktemp -d /tmp/aux-native-resume-fs.XXXXXX)
trap 'rm -rf "$output"' EXIT
# Narrow actual FD/journal reader only. Captured identity replaces the actual
# authenticated loader explicitly; no native stage/factory/Security calls run.
xcrun swiftc -target arm64-apple-macos13.0 -module-cache-path "$output/cache" \
 "$p/aux-native-p256-envelope-port/source/EnvelopeRecords.swift" \
 "$p/aux-fresh-bootstrap-canonical-parent/source/AuxFreshBootstrapPolicy.swift" \
 "$p/aux-native-fresh-stage-reconciliation/source/NativeFreshBootstrapJournal.swift" \
 "$p/aux-native-fresh-retained-journal/source/PrivateNativeFreshBootstrapJournalStore.swift" \
 "$p/aux-native-fresh-resume/source/AuxFreshNativeHome.swift" \
 "$p/aux-native-fresh-resume/source/AuxNativeFreshReservationLeaseRegistry.swift" \
 "$p/aux-native-fresh-resume/source/AuxResumedFreshNativeHome.swift" \
 "$proposal/tests/CapturedPolicy.swift" "$proposal/tests/main.swift" -o "$output/check"
"$output/check"
