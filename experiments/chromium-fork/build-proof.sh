#!/usr/bin/env bash
set -euo pipefail

# Builds the isolated //chrome feasibility candidate. The source tree and all
# outputs stay outside Aux; only this script and the small source patch are PR'd.
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source_dir="${AUX_CHROMIUM_SRC:?Set AUX_CHROMIUM_SRC to the existing Chromium src checkout}"
tools_dir="${AUX_DEPOT_TOOLS:-$(dirname "$source_dir")/../depot_tools}"
expected_revision="b151276ea2110e74b063c6964bd0a5c14dc42f52"
actual_revision="$(git -C "$source_dir" rev-parse HEAD)"
if [[ "$actual_revision" != "$expected_revision" && "${AUX_ALLOW_REVISION_CHANGE:-0}" != "1" ]]; then
  echo "Unexpected upstream revision: $actual_revision (expected $expected_revision)" >&2
  exit 1
fi
if [[ ! -x "$tools_dir/gn" && ! -x "$source_dir/buildtools/mac/gn" ]]; then
  echo "Chromium dependencies are incomplete; finish the existing gclient sync first." >&2
  exit 1
fi
export PATH="$tools_dir:$PATH"
export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode-beta.app/Contents/Developer}"
patch_file="$script_dir/aux-proof.patch"
if git -C "$source_dir" apply --reverse --check "$patch_file" 2>/dev/null; then
  echo "Aux proof patch is already applied."
else
  git -C "$source_dir" apply --check "$patch_file"
  git -C "$source_dir" apply "$patch_file"
fi
output_dir="$source_dir/out/AuxProof"
mkdir -p "$output_dir"
cat > "$output_dir/args.gn" <<'EOF'
is_debug = false
is_component_build = true
symbol_level = 0
use_lld = false
EOF
metadata="$output_dir/aux-build-metadata.txt"
{
  date -u '+started=%Y-%m-%dT%H:%M:%SZ'
  echo "upstream_revision=$actual_revision"
  echo "patch_sha256=$(shasum -a 256 "$patch_file" | cut -d ' ' -f 1)"
  echo "cpu_count=$(sysctl -n hw.ncpu)"
  echo "memory_bytes=$(sysctl -n hw.memsize)"
  echo "developer_dir=$DEVELOPER_DIR"
  "$DEVELOPER_DIR/usr/bin/xcodebuild" -version
  df -h "$source_dir"
  git -C "$source_dir" diff --stat
} > "$metadata"
cd "$source_dir"
gn gen out/AuxProof
/usr/bin/time -l autoninja -C out/AuxProof chrome -j "${AUX_BUILD_JOBS:-8}" \
  2>&1 | tee "$output_dir/aux-build.log"
date -u '+completed=%Y-%m-%dT%H:%M:%SZ' >> "$metadata"
echo "Build log: $output_dir/aux-build.log"
echo "Build metadata: $metadata"
