#!/bin/sh
set -eu
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
work=$(mktemp -d /tmp/aux-snapshot-dispatch.XXXXXX)
trap 'rm -rf "$work"' EXIT
xcrun clang++ -std=c++17 -Wall -Wextra -Werror -I "$here/source" \
  "$here/tests/main.cc" -o "$work/dispatch-test"
"$work/dispatch-test"
