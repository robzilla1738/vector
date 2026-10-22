#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../../../.."
app=/Users/rcourson/Documents/Vibe/web/out/provided-candidate-aux-crypto-stage/Aux.app
node="$app/Contents/Resources/aux/agent-runtime/node/bin/node"
actual=$(shasum -a 256 "$node")
[[ "${actual%% *}" == cbee2298aee5cc476bf8d5441e7348b627254a39d869743a5b04489028c729d4 ]]
output=$(mktemp -d /tmp/aux-crypto-stage-inventory.XXXXXX)
trap 'rm -rf "$output"' EXIT
mkdir -m 700 "$output/home"
env -i PATH=/usr/bin:/bin HOME="$output/home" TMPDIR="$output" "$node" docs/integration/proposed/aux-crypto-stage-package-inventory/probe.mjs
