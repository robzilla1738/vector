#!/bin/sh
# Builds aux-macos-utilities.node (arm64, macOS 15+, unsigned).
#   apps/macos-utilities-addon/build.sh [OUT]     default .build/aux-macos-utilities.node
# NODE_INCLUDE: directory holding node_api.h (default: the headers of the `node` on PATH).
set -eu
here=$(cd "$(dirname "$0")" && pwd)
out=${1:-"$here/.build/aux-macos-utilities.node"}
work="$here/.build/obj"
include=${NODE_INCLUDE:-"$(dirname "$(dirname "$(command -v node)")")/include/node"}
[ -f "$include/node_api.h" ] || { echo "node_api.h not found in $include (set NODE_INCLUDE)" >&2; exit 1; }
target=arm64-apple-macos15.0
mkdir -p "$work" "$(dirname "$out")"

xcrun clang -target "$target" -O2 -Wall -Wextra -Werror -I "$include" -c "$here/Sources/addon.c" -o "$work/addon.o"
xcrun swiftc -target "$target" -O -swift-version 5 -module-name AuxMacOSUtilities -module-cache-path "$work/cache" \
  -emit-library "$here"/Sources/*.swift "$work/addon.o" \
  -framework AppKit -framework QuickLookThumbnailing -framework ImageIO \
  -Xlinker -undefined -Xlinker dynamic_lookup \
  -Xlinker -exported_symbol -Xlinker _napi_register_module_v1 \
  -Xlinker -exported_symbol -Xlinker _node_api_module_get_api_version_v1 \
  -Xlinker -exported_symbol -Xlinker _AuxMacUtilityCloseAdmissionAndDrain \
  -Xlinker -exported_symbol -Xlinker _AuxMacUtilityPendingEnvironments \
  -Xlinker -install_name -Xlinker @rpath/aux-macos-utilities.node \
  -o "$out"

echo "$out"
shasum -a 256 "$out"
