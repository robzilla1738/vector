#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
p="$repo/docs/integration/proposed/aux-native-fresh-cold-bootstrap"
out=$(mktemp -d /tmp/aux-cold-service-check.XXXXXX)
trap 'rm -rf "$out"' EXIT
xcrun swiftc -target arm64-apple-macos13.0 "$p/source/AuxAuthenticatedFreshColdBootstrap.swift" "$p/tests/main.swift" -o "$out/check"
"$out/check"
