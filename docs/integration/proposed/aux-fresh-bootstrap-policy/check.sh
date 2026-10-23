#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
proposal="$repo/docs/integration/proposed/aux-fresh-bootstrap-policy"
output=$(mktemp -d /tmp/aux-fresh-bootstrap-policy.XXXXXX)
trap 'rm -rf "$output"' EXIT
# Executes only pure parser/captured checks, never the live signed reader.
xcrun swiftc -target arm64-apple-macos13.0 \
  "$repo/docs/integration/proposed/aux-native-p256-envelope-port/source/EnvelopeRecords.swift" \
  "$proposal/source/AuxFreshBootstrapPolicy.swift" "$proposal/tests/main.swift" -o "$output/check"
"$output/check"
