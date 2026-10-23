#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
proposal="$repo/docs/integration/proposed/aux-fresh-native-home"
output=$(mktemp -d /tmp/aux-fresh-native-home-build.XXXXXX)
trap 'rm -rf "$output"' EXIT
xcrun swiftc -target arm64-apple-macos13.0 \
  "$proposal/source/AuxFreshNativeHome.swift" "$proposal/tests/main.swift" -o "$output/check"
"$output/check"
