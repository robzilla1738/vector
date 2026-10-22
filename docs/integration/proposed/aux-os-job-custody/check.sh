#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../../../.."
source_dir=docs/integration/proposed/aux-native-macos-utilities/source
proposal=docs/integration/proposed/aux-os-job-custody
output=$(mktemp -d /tmp/aux-os-custody-check.XXXXXX)
trap 'rm -rf "$output"' EXIT
python3 scripts/native-build.py xcrun swiftc -swift-version 5 -framework AppKit -framework QuickLookThumbnailing -framework ImageIO \
 "docs/integration/proposed/aux-owned-dispatch-lifetime/source/AuxOSDrainResult.swift" "$source_dir/AuxOSJobCustody.swift" "$source_dir/AuxUtilityCompletion.swift" "$source_dir/AuxMacOSUtilityCommandCore.swift" \
 "$source_dir/AuxAppKitUtilityBoundary.swift" "$proposal/tests/main.swift" -o "$output/check"
"$output/check"
