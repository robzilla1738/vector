#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../../../.."
proposal=docs/integration/proposed/aux-native-macos-utilities
python3 "$proposal/verify-pins.py"
output=$(mktemp -d /tmp/aux-macos-utility-check.XXXXXX)
trap 'rm -rf "$output"' EXIT
python3 scripts/native-build.py xcrun swiftc -swift-version 5 -framework AppKit -framework QuickLookThumbnailing -framework ImageIO \
 "$proposal/source/AuxMacOSUtilityCommandCore.swift" "$proposal/source/AuxUtilityCompletion.swift" \
 "$proposal/source/AuxAppKitUtilityBoundary.swift" "$proposal/tests/main.swift" -o "$output/check"
# Only captured fixture code is called; actual OS boundary is linked/compiled, never constructed.
"$output/check"
