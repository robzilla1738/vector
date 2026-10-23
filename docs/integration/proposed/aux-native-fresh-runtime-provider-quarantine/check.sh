#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
p="$repo/docs/integration/proposed/aux-native-fresh-runtime-provider-quarantine"
out=$(mktemp -d /tmp/aux-provider-registry-check.XXXXXX)
trap 'rm -rf "$out"' EXIT
xcrun swiftc -target arm64-apple-macos13.0 -D AUX_NATIVE_FRESH_RUNTIME_CONSUMER -D AUX_MINIMAL_RUNTIME_DISPATCH -D AUX_SCOPED_SECURE_STORE_DISPATCH -D AUX_MACOS_UTILITY_DISPATCH -D AUX_ATOMIC_CSK_DISPATCH "$p/source/AuxPreparedFreshRuntimeProvider.swift" "$p/tests/main.swift" -o "$out/check"
"$out/check"
