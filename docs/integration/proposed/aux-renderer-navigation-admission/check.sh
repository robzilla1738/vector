#!/bin/sh
set -eu
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repo=$(git -C "$here" rev-parse --show-toplevel)
native=/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src
out=$(mktemp -d /tmp/aux-renderer-admission.XXXXXX)
trap 'rm -rf "$out"' EXIT
python3 "$here/verify.py"
python3 "$repo/scripts/native-build.py" xcrun clang++ -std=c++20 -Wall -Wextra -Werror -pthread -I "$here/source" -I "$native" "$here/source/content/browser/renderer_host/aux_renderer_navigation_admission.cc" "$here/tests/admission.cc" -o "$out/admission"
"$out/admission"
printf '%s\n' 'PASS: actual native admission/custody source with captured callbacks; no renderer/navigation/OS execution'
