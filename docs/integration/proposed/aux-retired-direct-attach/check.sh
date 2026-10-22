#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
proposal="$repo/docs/integration/proposed/aux-retired-direct-attach"
headers="$1"
output=$(mktemp -d /tmp/aux-retired-direct-attach.XXXXXX)
trap 'rm -rf "$output"' EXIT
python3 "$proposal/verify.py"
xcrun clang++ -std=c++17 -arch arm64 -DNAPI_VERSION=8 -I "$headers" -I "$proposal/source" -c "$proposal/source/aux-development-host-attach.cc" -o "$output/attach.o"
xcrun clang++ -std=c++17 -arch arm64 -DNAPI_VERSION=8 -I "$headers" -I "$proposal/source" "$proposal/tests/main.cc" "$output/attach.o" -o "$output/check"
"$output/check"
nm -gU "$output/attach.o" > "$output/exports.txt"
nm -u "$output/attach.o" > "$output/imports.txt"
python3 - "$output" <<'PY'
from pathlib import Path
import sys
root=Path(sys.argv[1]);exports=(root/'exports.txt').read_text();imports=(root/'imports.txt').read_text()
assert exports.count('_AuxAttachSignedDevelopmentDispatcher')==1
assert not imports.strip(),imports
print('PASS: five real ABI refusal calls; retained single export; zero undefined imports/protected factory or Node references')
PY
