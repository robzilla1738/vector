#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
p="$repo/docs/integration/proposed/aux-native-fresh-runtime-readiness"
out=$(mktemp -d /tmp/aux-ready-dispatch-check.XXXXXX)
trap 'rm -rf "$out"' EXIT
# Swift requires executable main.swift basename; copy this fixture only.
cp "$p/tests/dispatcher-main.swift" "$out/main.swift"
xcrun swiftc -target arm64-apple-macos13.0 -D AUX_NATIVE_FRESH_RUNTIME_CONSUMER -D AUX_MINIMAL_RUNTIME_DISPATCH -D AUX_SCOPED_SECURE_STORE_DISPATCH -D AUX_ATOMIC_CSK_DISPATCH "$p/source/AuxOwnedCommandDispatcher.swift" "$p/source/AuxNativeFreshGuardFailure.swift" "$repo/docs/integration/proposed/aux-owned-dispatch-lifetime/source/AuxOSDrainResult.swift" "$out/main.swift" -o "$out/check"
"$out/check"
