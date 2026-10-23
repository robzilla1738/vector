#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
proposal="$repo/docs/integration/proposed/aux-fresh-bootstrap-policy"
output=$(mktemp -d /tmp/aux-fresh-bootstrap-policy-types.XXXXXX)
trap 'rm -rf "$output"' EXIT
# Full actual loader + retained-home producer; compile/typecheck only, no linking/loading.
xcrun swiftc -typecheck -target arm64-apple-macos13.0 -module-name AuxFreshBootstrapPolicy \
  -module-cache-path "$output/cache" \
  "$repo/docs/integration/proposed/aux-native-p256-envelope-port/source/EnvelopeRecords.swift" \
  "$repo/docs/integration/proposed/aux-fresh-native-home/source/AuxFreshNativeHome.swift" \
  "$proposal/source/AuxFreshBootstrapPolicy.swift" \
  "$proposal/source/AuxSignedFreshBootstrapPolicyLoader.swift"
echo 'PASS:actual fresh signed reader and retained-home producer typechecked as separate Swift files; no loader executed'
