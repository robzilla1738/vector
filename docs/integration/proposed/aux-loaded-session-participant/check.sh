#!/bin/sh
set -eu
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
native=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["nativeSourceRoot"])' "$here/manifest.json")
work=$(mktemp -d /tmp/aux-loaded-session-participant.XXXXXX)
trap 'rm -rf "$work"' EXIT
xcrun clang++ -std=c++17 -Wall -Wextra -Werror -I "$here/source" -I "$native" \
  "$here/tests/main.cc" -o "$work/test"
"$work/test"
