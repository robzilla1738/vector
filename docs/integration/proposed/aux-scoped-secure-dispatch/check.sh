#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
proposal="$repo/docs/integration/proposed"
frozen=/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852
output=$(mktemp -d /tmp/aux-secure-napi-fixture.XXXXXX)
trap 'rm -rf "$output"' EXIT
python3 "$repo/scripts/native-build.py" sh "$proposal/aux-scoped-secure-dispatch/build-fixture.sh" "$proposal" "$frozen/runtime/node/include/node" "$output"
mkdir -m 700 "$output/home"
env -i PATH=/usr/bin:/bin HOME="$output/home" TMPDIR="$output" "$frozen/runtime/node/bin/node" --expose-gc "$proposal/aux-scoped-secure-dispatch/tests/check.cjs" "$output/aux-synthetic-fixture.node"
