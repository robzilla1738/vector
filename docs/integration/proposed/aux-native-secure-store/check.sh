#!/bin/sh
set -eu
cd "$(dirname "$0")/../../../.."
task_dir=$(mktemp -d /tmp/aux-secure-store-captured.XXXXXX)
trap 'rm -rf "$task_dir"' EXIT
python3 scripts/native-build.py /usr/bin/xcrun swiftc -target arm64-apple-macos13 \
  -module-cache-path "$task_dir/cache" \
  docs/integration/proposed/aux-native-p256-envelope-port/source/EnvelopeRecords.swift \
  docs/integration/proposed/aux-native-secure-store/source/AuxSecureStore.swift \
  docs/integration/proposed/aux-native-secure-store/tests/main.swift \
  -o "$task_dir/captured"
"$task_dir/captured"
