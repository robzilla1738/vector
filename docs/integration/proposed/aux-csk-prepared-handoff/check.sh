#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
base="$repo/docs/integration/proposed"
output=$(mktemp -d /tmp/aux-csk-handoff-build.XXXXXX)
trap 'rm -rf "$output"' EXIT
node "$base/aux-csk-prepared-handoff/generate.mjs" "$output/PrivateCskHandoffJournalStore.swift"
xcrun swiftc -module-cache-path "$output/cache" "$base/aux-native-p256-envelope-port/source/EnvelopeRecords.swift" "$base/aux-native-secure-store/source/AuxSecureStore.swift" "$base/aux-copy-only-credentials/source/AuxCapturedCredentialCopy.swift" "$output/PrivateCskHandoffJournalStore.swift" "$base/aux-csk-prepared-handoff/source/CapturedCskPreparation.swift" "$base/aux-csk-prepared-handoff/source/DurableCapturedCskHandoff.swift" "$base/aux-csk-prepared-handoff/tests/main.swift" -o "$output/check"
node "$base/aux-csk-prepared-handoff/tests/fixture.mjs" | "$output/check"
