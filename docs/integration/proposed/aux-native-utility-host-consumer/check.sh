#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
base="$repo/docs/integration/proposed";here="$base/aux-native-utility-host-consumer"
root="$1";snapshot="$root/out/provided-source-snapshot-1.26.1016.1852/runtime/node"
output=$(mktemp -d /tmp/aux-utility-host-consumer.XXXXXX)
trap 'rm -rf "$output"' EXIT
python3 "$here/verify.py"
mkdir -p "$output/Probe.app/Contents/MacOS" "$output/Probe.app/Contents/Resources/native" "$output/home"
cp "$snapshot/bin/node" "$output/Probe.app/Contents/MacOS/node"
# Caller holds shared compiler lock; no nested build lock or production graph.
sh "$here/compile-fixture.sh" "$base" "$snapshot/include/node" "$output"
for scenario in absent current late; do env -i HOME="$output/home" TMPDIR="$output" PATH=/usr/bin:/bin "$output/Probe.app/Contents/MacOS/node" "$here/tests/check.cjs" "$scenario"; done
