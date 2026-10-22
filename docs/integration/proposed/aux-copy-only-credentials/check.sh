#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
base="$repo/docs/integration/proposed"
output=$(mktemp -d /tmp/aux-copy-only-credentials.XXXXXX)
trap 'rm -rf "$output"' EXIT
xcrun swiftc -module-cache-path "$output/cache" "$base/aux-native-p256-envelope-port/source/EnvelopeRecords.swift" "$base/aux-native-secure-store/source/AuxSecureStore.swift" "$base/aux-copy-only-credentials/source/AuxCapturedCredentialCopy.swift" "$base/aux-copy-only-credentials/tests/main.swift" -o "$output/captured-fixture"
"$output/captured-fixture"
