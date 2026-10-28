#!/bin/sh
# Fetch the pinned Sparkle release into the Chromium checkout's third_party/aux_sparkle.
# The archive is verified against its pinned SHA-256 before anything is extracted.
set -eu
version=2.10.0
sha256=c2bf58aa8387266ac179357b1415d6f2635f044da8be41042af32425dae6da0c
src=${1:?usage: fetch-sparkle.sh <chromium src>}
dest="$src/third_party/aux_sparkle"
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
curl -fsSL -o "$work/sparkle.tar.xz" "https://github.com/sparkle-project/Sparkle/releases/download/$version/Sparkle-$version.tar.xz"
echo "$sha256  $work/sparkle.tar.xz" | shasum -a 256 -c -
mkdir "$work/x"
tar -xJf "$work/sparkle.tar.xz" -C "$work/x"
rm -rf "$dest"
mkdir -p "$dest"
ditto "$work/x/Sparkle.framework" "$dest/Sparkle.framework"
ditto "$work/x/bin" "$dest/bin"
cp "$work/x/LICENSE" "$dest/LICENSE"
echo "$version" > "$dest/VERSION"
echo "Sparkle $version in $dest"
