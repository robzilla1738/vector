#!/bin/sh
# Build aux-memory (release, arm64) with Resources/deunicode.bin linked into __TEXT,__deunicode.
#   build.sh [output path]   default .build/aux-memory
set -eu
cd "$(dirname "$0")"
tables="$PWD/Resources/deunicode.bin"
[ -f "$tables" ] || { echo "missing $tables (scripts/memory-helper/extract-deunicode.py)" >&2; exit 1; }
swift build -c release --arch arm64 \
  -Xlinker -sectcreate -Xlinker __TEXT -Xlinker __deunicode -Xlinker "$tables"
out="${1:-.build/aux-memory}"
cp "$(swift build -c release --arch arm64 --show-bin-path)/aux-memory" "$out"
echo "$out"
