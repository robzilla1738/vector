#!/bin/sh
# Builds "Aux Computer Use.app" (arm64, release, unsigned) for scripts/release/assemble.py --computer-use-helper.
#   apps/computer-use-helper/build.sh [OUT_DIR]      (default: apps/computer-use-helper/.build/app)
# VERSION and BUILD set CFBundleShortVersionString and CFBundleVersion (default 1.0.0 and 1).
set -eu
here=$(cd "$(dirname "$0")" && pwd)
brand="$here/../../assets/brand"
out=${1:-"$here/.build/app"}
app="$out/Aux Computer Use.app"

swift build --package-path "$here" -c release --arch arm64
binary=$(swift build --package-path "$here" -c release --arch arm64 --show-bin-path)/aux-computer-use

rm -rf "$app"
mkdir -p "$app/Contents/MacOS" "$app/Contents/Resources"
sed -e "s/@VERSION@/${VERSION:-1.0.0}/" -e "s/@BUILD@/${BUILD:-1}/" "$here/Bundle/Info.plist" > "$app/Contents/Info.plist"
plutil -lint -s "$app/Contents/Info.plist"
cp "$binary" "$app/Contents/MacOS/aux-computer-use"
chmod 755 "$app/Contents/MacOS/aux-computer-use"
cp "$brand/Aux.icns" "$app/Contents/Resources/AppIcon.icns"
cp "$brand/MenuBarIcon.png" "$brand/MenuBarIcon@2x.png" "$app/Contents/Resources/"
printf 'APPL????' > "$app/Contents/PkgInfo"

echo "$app"
shasum -a 256 "$app/Contents/MacOS/aux-computer-use"
