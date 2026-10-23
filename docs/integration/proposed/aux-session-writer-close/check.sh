#!/bin/sh
set -eu
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
work=$(mktemp -d /tmp/aux-session-writer-close.XXXXXX)
trap 'rm -rf "$work"' EXIT
xcrun clang++ -std=c++17 -Wall -Wextra -Werror -I "$here/source" \
  "$here/tests/main.cc" -o "$work/test"
"$work/test"
