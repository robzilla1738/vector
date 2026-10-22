#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
base="$repo/docs/integration/proposed/aux-native-pdf-engine"
selection="$repo/docs/integration/proposed/aux-native-pdf-os-surface/source"
headers=/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/runtime/node/include/node
chromium=/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src
pdfium=/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src/third_party/pdfium/public
output=$(mktemp -d /tmp/aux-pdf-four.XXXXXX)
trap 'rm -rf "$output"' EXIT
xcrun clang++ -std=c++17 -Wall -Wextra -Werror -Wno-deprecated-declarations -DNAPI_VERSION=8 -I"$headers" -I"$pdfium" -I"$selection" -I"$base/source" -c "$base/source/AuxPdfFour.cc" -o "$output/AuxPdfFour.o"
xcrun clang++ -std=c++17 -Wall -Wextra -Werror -I"$headers" -I"$selection" -c "$selection/RecoveredPdfPageSelection.cc" -o "$output/pages.o"
xcrun clang++ -std=c++17 -Wall -Wextra -Werror -I"$headers" -I"$selection" -c "$selection/RecoveredPdfPageSelectionNapi.cc" -o "$output/pages-napi.o"
xcrun clang++ -std=c++17 -Wall -Wextra -Werror -I"$chromium" -I"$base/source" -c "$base/source/RecoveredPngCodec.cc" -o "$output/png.o"
echo 'Actual PDF7 engine + synchronous NAPI8 registration compile to objects; PDFium link/runtime not exercised'
