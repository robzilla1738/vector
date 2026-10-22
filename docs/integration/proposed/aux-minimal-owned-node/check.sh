#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
proposal="$repo/docs/integration/proposed"
frozen=/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852
output=$(mktemp -d /tmp/aux-minimal-owned-node.XXXXXX)
trap 'rm -rf "$output"' EXIT
python3 "$repo/scripts/native-build.py" sh "$proposal/aux-minimal-owned-node/build-fixture.sh" "$proposal" "$frozen/runtime/node/include/node" "$output"
mkdir -m 700 "$output/home"
env -i PATH=/usr/bin:/bin HOME="$output/home" TMPDIR="$output" "$frozen/runtime/node/bin/node" --expose-gc "$proposal/aux-scoped-secure-dispatch/tests/check.cjs" "$output/aux-synthetic-fixture.node"
python3 - "$output/aux-synthetic-fixture.node" <<'PY_CHECK'
from pathlib import Path
import hashlib,sys
artifact=Path(sys.argv[1]);data=artifact.read_bytes()
assert b'aside' not in data.lower(), 'Reference-product substring remains in compiled addon'
print('PASS: actual minimal .node byte inventory has zero reference-product substring; sha256='+hashlib.sha256(data).hexdigest())
PY_CHECK
