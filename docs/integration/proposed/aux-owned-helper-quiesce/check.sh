#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
base="$repo/docs/integration/proposed/aux-owned-helper-quiesce"
output=$(mktemp -d /tmp/aux-owned-helper-quiesce.XXXXXX)
trap 'rm -rf "$output"' EXIT
xcrun clang++ -std=c++17 -Wall -Wextra -Werror -I "$base/source" "$base/tests/main.cc" "$base/source/chrome/browser/aux/installation_carrier_custody.cc" -o "$output/pure-production-fixture"
"$output/pure-production-fixture"
