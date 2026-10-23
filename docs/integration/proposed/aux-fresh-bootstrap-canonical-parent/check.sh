#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
p="$repo/docs/integration/proposed/aux-fresh-bootstrap-canonical-parent"
output=$(mktemp -d /tmp/aux-canonical-parent-check.XXXXXX)
trap 'rm -rf "$output"' EXIT
xcrun swiftc -target arm64-apple-macos13.0 "$repo/docs/integration/proposed/aux-native-p256-envelope-port/source/EnvelopeRecords.swift" "$p/source/AuxFreshBootstrapPolicy.swift" "$p/tests/main.swift" -o "$output/check"
"$output/check"
