#!/bin/sh
set -eu
cd "$(dirname "$0")/../../../.."
task_dir=$(mktemp -d /tmp/aux-runtime-capture.XXXXXX)
trap 'rm -rf "$task_dir"' EXIT
proposal=docs/integration/proposed
python3 scripts/native-build.py /usr/bin/xcrun swiftc -target arm64-apple-macos13 \
 -module-name AuxRuntimeCapture -module-cache-path "$task_dir/cache" \
 "$proposal/aux-native-p256-envelope-port/source/EnvelopeRecords.swift" \
 "$proposal/aux-native-p256-envelope-port/source/RecoveredP256Authority.swift" \
 "$proposal/aux-native-p256-envelope-port/source/AuxNativeEnvelopeV2.swift" \
 "$proposal/aux-native-pq-continuation/source/PqEnvelopeRecords.swift" \
 "$proposal/aux-native-pq-continuation/source/RecoveredPqAuthority.swift" \
 "$proposal/aux-native-signing-port/source/RecoveredP256SigningAuthority.swift" \
 "$proposal/aux-native-signing-port/source/RecoveredPqSigningAuthority.swift" \
 "$proposal/aux-installation-command-core/source/AuxInstallationCommandCore.swift" \
 "$proposal/aux-runtime-target-capture/source/AuxRuntimeTargetCapture.swift" \
 "$proposal/aux-runtime-target-capture/tests/main.swift" -o "$task_dir/check"
"$task_dir/check"
python3 - "$task_dir/check" <<'PY'
import pathlib,sys
data=pathlib.Path(sys.argv[1]).read_bytes()
assert b'aside' not in data.lower(), 'Reference-product bytes in minimal runtime binary'
print('PASS: compiled minimal runtime binary has no reference-product substring')
PY
