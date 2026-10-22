#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
base="$repo/docs/integration/proposed/aux-native-pdf-os-surface"
headers=/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/runtime/node/include/node
output=$(mktemp -d /tmp/aux-pdf-pages.XXXXXX)
trap 'rm -rf "$output"' EXIT
xcrun clang++ -std=c++20 -Wall -Wextra -Werror -I"$base/source" "$base/source/RecoveredPdfPageSelection.cc" "$base/tests/page-selection.cc" -o "$output/check"
"$output/check"
xcrun clang++ -std=c++20 -Wall -Wextra -Werror -I"$headers" -I"$base/source" -fsyntax-only "$base/source/RecoveredPdfPageSelectionNapi.cc"
echo 'Recovered page-selection pure checks and frozen-header NAPI syntax pass; no addon/PDF/OS execution'
