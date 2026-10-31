#!/bin/sh
# Builds aux-pdf.node (arm64, macOS 15+, unsigned) from Sources/ and the Chromium checkout's PDFium.
#   apps/pdf-addon/build.sh [OUT]     default .build/aux-pdf.node
# AUX_CHROMIUM_SRC: the Chromium src directory (default: the durable checkout, see scripts/aux_chromium.py).
#   It is only read. GN runs on .build/root, a tree of symlinks into it in which three owner
#   edits to the browser's toolchain are swapped for their checked-in versions (see OWNER_EDITS),
#   and generates into .build/root/out/AuxPdf.
# NODE_INCLUDE: directory holding node_api.h (default: the frozen snapshot's Node headers).
# JOBS: ninja parallelism (default 8). Both steps hold the shared native build lock.
set -eu
here=$(cd "$(dirname "$0")" && pwd)
repo=$(cd "$here/../.." && pwd)
out=${1:-"$here/.build/aux-pdf.node"}
src=${AUX_CHROMIUM_SRC:-/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src}
include=${NODE_INCLUDE:-"$repo/out/provided-source-snapshot-1.26.1016.1852/runtime/node/include/node"}
root="$here/.build/root"
# Two levels under the root, like the checkout's own out/<name>, so the source paths the
# Rust and libc++ code embeds read ../../third_party/... exactly as in the supplied build.
gn_out="$root/out/AuxPdf"
[ -f "$include/node_api.h" ] || { echo "node_api.h not found in $include (set NODE_INCLUDE)" >&2; exit 1; }
[ -x "$src/buildtools/mac/gn" ] || { echo "no Chromium checkout at $src (set AUX_CHROMIUM_SRC)" >&2; exit 1; }
pin=$(git -C "$src/third_party/pdfium" rev-parse HEAD)
[ "$pin" = 39f0ed4a657e53ed743a16d10d77dec086a08e03 ] || { echo "PDFium is $pin, expected 39f0ed4a657e53ed743a16d10d77dec086a08e03" >&2; exit 1; }

# The supplied configuration (docs/spec/native/pdf.md section 1): no V8, XFA, Skia or
# PartitionAlloc; AGG with bundled FreeType; Chromium's own libc++ throughout.
args="is_debug=false is_component_build=false target_cpu=\"arm64\" symbol_level=0
  use_remoteexec=false use_siso=false use_custom_libcxx=true use_partition_alloc=false
  use_allocator_shim=false clang_use_chrome_plugins=false use_thin_lto=false
  pdf_enable_v8=false pdf_enable_xfa=false pdf_use_skia=false pdf_use_partition_alloc=false
  pdf_enable_rust_png=true pdf_bundle_freetype=true pdf_is_standalone=false pdf_is_complete_lib=true
  mac_deployment_target=\"15.0\" aux_node_include=\"$include\""

# The browser build's link filter only admits links inside its own out/AuxFast, and its
# -no_adhoc_codesign leaves host tools unrunnable elsewhere. This module links as the
# supplied one was: Chromium's own toolchain files, linker ad-hoc signature.
OWNER_EDITS="build/toolchain/apple/linker_driver.py build/rust/gni_impl/rustc_wrapper.py build/config/mac/BUILD.gn"
# mirror DIR: make $root/DIR a real directory whose entries link into $src/DIR.
mirror() {
  [ -L "$root/$1" ] && rm "$root/$1"
  mkdir -p "$root/$1"
  for entry in "$src/$1"/* "$src/$1"/.[!.]*; do
    [ -e "$entry" ] || [ -L "$entry" ] || continue
    name=$(basename "$entry")
    case "$1/$name" in
      ./out) continue ;; # this build's own output lives here
      ./.rustfmt.toml) rm -f "$root/$1/$name"; cp "$entry" "$root/$1/$name"; continue ;; # rustfmt panics on a config outside the tree it formats
    esac
    [ -e "$root/$1/$name" ] || [ -L "$root/$1/$name" ] || ln -s "$entry" "$root/$1/$name"
  done
}
for file in $OWNER_EDITS; do
  mirror .
  dir=.
  for part in $(dirname "$file" | tr / ' '); do dir="$dir/$part"; mirror "$dir"; done
  rm -f "$root/$file"
  git -C "$src" show "HEAD:$file" > "$root/$file"
done
chmod +x "$root/build/toolchain/apple/linker_driver.py" "$root/build/rust/gni_impl/rustc_wrapper.py"

lock="python3 $repo/scripts/native-build.py"
export PATH="$src/third_party/cpython3/host/bin:/usr/bin:/bin:/usr/sbin:/sbin"
$lock "$src/buildtools/mac/gn" gen "$gn_out" --root="$root" --root-target="$here:aux_pdf_four" --args="$args"
$lock "$src/third_party/ninja/ninja" -C "$gn_out" -j "${JOBS:-8}" aux_pdf_four

mkdir -p "$(dirname "$out")"
cp "$gn_out/aux_pdf_four.node" "$out"
echo "$out"
shasum -a 256 "$out"
