#!/bin/sh
set -eu
repo=$(git rev-parse --show-toplevel)
proposal="$repo/docs/integration/proposed/aux-fresh-native-secure-capture"
policy="$repo/docs/integration/proposed/aux-fresh-bootstrap-policy/source"
output=$(mktemp -d /tmp/aux-fresh-native-capture.XXXXXX)
trap 'rm -rf "$output"' EXIT
# Actual sealed loader + real producer graph; never linked/loaded or called.
xcrun swiftc -typecheck -target arm64-apple-macos13.0 -module-name AuxFreshNativeCapture \
  -module-cache-path "$output/cache" \
  "$repo/docs/integration/proposed/aux-native-p256-envelope-port/source/EnvelopeRecords.swift" \
  "$proposal/source/AuxFreshNativeHome.swift" \
  "$policy/AuxFreshBootstrapPolicy.swift" "$policy/AuxSignedFreshBootstrapPolicyLoader.swift" \
  "$proposal/source/AuxFreshNativeSecureCapture.swift"
echo 'PASS:actual sealed loader + successor retained home + native5-row capture typechecked; no protected calls'
# Execute production producer logic with explicitly captured policy/read effects.
# The actual authenticated reader is absent from this fixture graph.
xcrun swiftc -D AUX_FRESH_SECURE_CAPTURE_FIXTURE -target arm64-apple-macos13.0 \
  -module-cache-path "$output/cache" \
  "$repo/docs/integration/proposed/aux-native-p256-envelope-port/source/EnvelopeRecords.swift" \
  "$proposal/source/AuxFreshNativeHome.swift" "$policy/AuxFreshBootstrapPolicy.swift" \
  "$proposal/source/AuxFreshNativeSecureCapture.swift" \
  "$proposal/tests/CapturedPolicy.swift" "$proposal/tests/main.swift" -o "$output/check"
"$output/check"
