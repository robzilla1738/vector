#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../../../.."
input_root=/Users/rcourson/Documents/Vibe/web
app="$input_root/out/provided-candidate-aux-pdf-native/Aux.app"
node="$app/Contents/Resources/aux/agent-runtime/node/bin/node"
actual=$(shasum -a 256 "$node")
[[ "${actual%% *}" == cbee2298aee5cc476bf8d5441e7348b627254a39d869743a5b04489028c729d4 ]]
output=$(mktemp -d /tmp/aux-packaged-pdf-check.XXXXXX)
trap 'rm -rf "$output"' EXIT
mkdir -m 700 "$output/home"
env -i PATH=/usr/bin:/bin HOME="$output/home" TMPDIR="$output" "$node" \
 docs/integration/proposed/aux-packaged-pdf-loader/probe.mjs "$app" \
 "$input_root/out/provided-reuse-aux-cli-registration/ui/agent" \
 "$input_root/out/provided-reuse-aux-pdf-native/ui/agent" \
 "$input_root/out/aux-pdf-native-ui-preservation.json"
