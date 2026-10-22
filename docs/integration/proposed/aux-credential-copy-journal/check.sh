#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
base="$repo/docs/integration/proposed"
output=$(mktemp -d /tmp/aux-credential-journal-build.XXXXXX)
trap 'rm -rf "$output"' EXIT
node "$base/aux-credential-copy-journal/generate.mjs" "$output/PrivateAuxCredentialCopyJournalStore.swift"
xcrun swiftc -module-cache-path "$output/cache" "$base/aux-native-p256-envelope-port/source/EnvelopeRecords.swift" "$base/aux-native-secure-store/source/AuxSecureStore.swift" "$base/aux-copy-only-credentials/source/AuxCapturedCredentialCopy.swift" "$output/PrivateAuxCredentialCopyJournalStore.swift" "$base/aux-credential-copy-journal/source/DurableCapturedAuxCredentialCopy.swift" "$base/aux-credential-copy-journal/tests/main.swift" -o "$output/check"
"$output/check"
