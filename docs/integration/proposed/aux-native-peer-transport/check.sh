#!/bin/sh
set -eu
here="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
output="$1"
[ ! -e "$output" ]
mkdir -p "$output"
xcrun clang++ -std=c++20 -Wall -Wextra -Werror -arch arm64 -mmacosx-version-min=13.0 -I "$here/source" -c "$here/source/AuxNativePeerTransport.cc" -o "$output/transport.o"
xcrun clang++ -std=c++20 -Wall -Wextra -Werror -arch arm64 -mmacosx-version-min=13.0 -I "$here/source" "$here/tests/wire.cc" -o "$output/wire"
"$output/wire"
# Only the pure actual envelope predicate executes. Actual transport compiled,
# never linked into or loaded by a protected process; no Security/IPC calls run.
