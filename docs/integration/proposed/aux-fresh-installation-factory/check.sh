#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
base="$repo/docs/integration/proposed/aux-fresh-installation-factory"
output=$(mktemp -d /tmp/aux-fresh-factory.XXXXXX)
trap 'rm -rf "$output"' EXIT
xcrun swiftc -target arm64-apple-macos13.0 "$base/source/AuxFreshInstallationFactory.swift" "$base/tests/main.swift" -o "$output/check"
"$output/check"
