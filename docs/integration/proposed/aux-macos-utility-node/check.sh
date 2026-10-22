#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
artifact_root="$1"
headers="$artifact_root/out/provided-source-snapshot-1.26.1016.1852/runtime/node/include/node"
node="$artifact_root/out/provided-source-snapshot-1.26.1016.1852/runtime/node/bin/node"
here="$repo/docs/integration/proposed/aux-macos-utility-node"
output=$(mktemp -d /tmp/aux-macos-utility-check.XXXXXX)
trap 'rm -rf "$output"' EXIT
"$node" "$here/verify.mjs" "$artifact_root"
sh "$here/build.sh" "$repo/docs/integration/proposed" "$headers" "$output"
mkdir "$output/home" "$output/tmp"
env -i PATH=/usr/bin:/bin HOME="$output/home" TMPDIR="$output/tmp" "$node" "$here/tests/check.cjs" "$output/fixture.node"
env -i PATH=/usr/bin:/bin HOME="$output/home" TMPDIR="$output/tmp" "$node" "$here/tests/routing.mjs" "$artifact_root" "$output/route.node"
